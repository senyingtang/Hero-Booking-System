// apps/web/src/app/api/admin/kpi/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/admin/kpi?tenant_id=xxx
 * 呼叫 RPC get_merchant_kpi，回傳商家 KPI 資料
 */
export async function GET(req: NextRequest) {
    const tenantId = req.nextUrl.searchParams.get("tenant_id");

    if (!tenantId) {
        return NextResponse.json(
            { error: "缺少 tenant_id 參數" },
            { status: 400 }
        );
    }

    /* ── 驗證 session ── */
    const cookieStore = await cookies();
    const userSupabase = createClient(supabaseUrl, anonKey, {
        auth: {
            persistSession: false,
            detectSessionInUrl: false,
            storage: {
                getItem: (key) => cookieStore.get(key)?.value ?? null,
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

    /* ── 呼叫 RPC ── */
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.rpc("get_merchant_kpi", {
        p_tenant_id: tenantId,
    });

    if (error) {
        // RPC 尚未部署，回傳模擬資料
        if (error.message.includes("does not exist") || error.code === "42883") {
            return NextResponse.json({ kpi: generateMockKpi() }, { status: 200 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ kpi: data }, { status: 200 });
}

/** Mock data for development before RPC is deployed */
function generateMockKpi() {
    const today = new Date();
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dailyTrend.push({
            day: d.toISOString().slice(0, 10),
            count: Math.floor(Math.random() * 15) + 3,
            revenue: Math.floor(Math.random() * 8000) + 1000,
        });
    }

    return {
        total_appointments: 156,
        revenue_today: 4200,
        revenue_month: 128500,
        revenue_last_month: 115000,
        active_staff: 5,
        upcoming_appointments: [
            {
                id: "mock-1",
                customer_name: "王小明",
                service_name: "經典剪髮",
                staff_name: "Amy",
                start_time: new Date(Date.now() + 3600000).toISOString(),
                end_time: new Date(Date.now() + 7200000).toISOString(),
                total_amount: 600,
                status: "confirmed",
            },
            {
                id: "mock-2",
                customer_name: "李小花",
                service_name: "染髮造型",
                staff_name: "Bob",
                start_time: new Date(Date.now() + 7200000).toISOString(),
                end_time: new Date(Date.now() + 14400000).toISOString(),
                total_amount: 2800,
                status: "confirmed",
            },
        ],
        daily_trend: dailyTrend,
        top_services: [
            { name: "經典剪髮", count: 45, revenue: 27000 },
            { name: "染髮造型", count: 32, revenue: 89600 },
            { name: "護髮療程", count: 28, revenue: 42000 },
            { name: "頭皮養護", count: 22, revenue: 33000 },
            { name: "燙髮", count: 18, revenue: 54000 },
        ],
        top_staff: [
            { name: "Amy", count: 38, revenue: 62400 },
            { name: "Bob", count: 35, revenue: 58200 },
            { name: "Cindy", count: 30, revenue: 48000 },
            { name: "David", count: 28, revenue: 44800 },
            { name: "Eva", count: 25, revenue: 37500 },
        ],
    };
}
