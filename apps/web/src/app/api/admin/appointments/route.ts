// apps/web/src/app/api/admin/appointments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/admin/appointments?tenant_id=xxx&status=all&date_from=...&date_to=...
 */
export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const tenantId = sp.get("tenant_id");
    const statusFilter = sp.get("status") ?? "all";
    const dateFrom = sp.get("date_from") ?? undefined;
    const dateTo = sp.get("date_to") ?? undefined;

    if (!tenantId) {
        return NextResponse.json({ error: "缺少 tenant_id" }, { status: 400 });
    }

    /* ── Session check ── */
    const cookieStore = await cookies();
    const userSupabase = createClient(supabaseUrl, anonKey, {
        auth: {
            persistSession: false,
            detectSessionInUrl: false,
            storage: {
                getItem: (key: string) => cookieStore.get(key)?.value ?? null,
                setItem: () => { },
                removeItem: () => { },
            },
        },
    });

    const {
        data: { user },
    } = await userSupabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    /* ── Try RPC ── */
    const supabase = createServerSupabaseClient();

    const rpcParams: Record<string, string> = {
        p_tenant_id: tenantId,
        p_status: statusFilter,
    };
    if (dateFrom) rpcParams.p_date_from = dateFrom;
    if (dateTo) rpcParams.p_date_to = dateTo;

    const { data, error } = await supabase.rpc(
        "get_tenant_appointments",
        rpcParams
    );

    if (error) {
        // RPC 未部署 → 回傳 mock
        if (error.message.includes("does not exist") || error.code === "42883") {
            return NextResponse.json(
                { data: generateMockAppointments(), total: 8 },
                { status: 200 }
            );
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = Array.isArray(data) ? data : [];
    return NextResponse.json({ data: rows, total: rows.length }, { status: 200 });
}

/* ── Mock data ── */
function generateMockAppointments() {
    const services = ["經典剪髮", "染髮造型", "護髮療程", "頭皮養護", "燙髮", "頭部按摩"];
    const staff = ["Amy", "Bob", "Cindy", "David", "Eva"];
    const statuses = ["pending", "confirmed", "completed", "cancelled"];
    const customers = ["王小明", "李小花", "張大偉", "陳美美", "林志豪", "黃小芬", "趙先生", "吳小姐"];

    const now = Date.now();
    return Array.from({ length: 8 }, (_, i) => {
        const offsetMs = (i - 3) * 86400000 + Math.random() * 36000000;
        const start = new Date(now + offsetMs);
        const end = new Date(start.getTime() + 3600000);
        return {
            id: `mock-${i + 1}`,
            booking_code: `HB${String(2024001 + i).padStart(7, "0")}`,
            customer_name: customers[i % customers.length],
            customer_email: `customer${i + 1}@example.com`,
            customer_phone: `09${String(10000000 + i * 1111111).slice(0, 8)}`,
            service_name: services[i % services.length],
            staff_name: staff[i % staff.length],
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            total_amount: [600, 2800, 1500, 1200, 3500, 800][i % 6],
            status: statuses[i % statuses.length],
            internal_note: i === 0 ? "VIP 客戶，注意服務品質" : null,
            created_at: new Date(now - 86400000 * (8 - i)).toISOString(),
        };
    });
}
