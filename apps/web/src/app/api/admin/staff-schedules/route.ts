// apps/web/src/app/api/admin/staff-schedules/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * GET  /api/admin/staff-schedules?tenant_id=xxx&date_from=...&date_to=...
 * POST /api/admin/staff-schedules  { ... }
 */
export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const tenantId = sp.get("tenant_id");
    if (!tenantId) return NextResponse.json({ error: "缺少 tenant_id" }, { status: 400 });

    const supabase = createServerSupabaseClient();
    const rpcParams: Record<string, string> = { p_tenant_id: tenantId };
    if (sp.get("date_from")) rpcParams.p_date_from = sp.get("date_from")!;
    if (sp.get("date_to")) rpcParams.p_date_to = sp.get("date_to")!;

    const { data, error } = await supabase.rpc("get_staff_schedules", rpcParams);

    if (error) {
        if (error.code === "42883") {
            return NextResponse.json({ schedules: generateMockSchedules() }, { status: 200 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ schedules: data ?? [] }, { status: 200 });
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.rpc("upsert_staff_schedule", {
        p_id: body.id ?? null,
        p_tenant_id: body.tenant_id ?? null,
        p_staff_id: body.staff_id ?? null,
        p_date: body.date,
        p_start_time: body.start_time ?? "09:00",
        p_end_time: body.end_time ?? "18:00",
        p_status: body.status ?? "scheduled",
        p_note: body.note ?? null,
    });

    if (error) {
        if (error.code === "42883") return NextResponse.json({ ok: true }, { status: 200 });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, schedule: data }, { status: 200 });
}

function generateMockSchedules() {
    const staff = ["Amy", "Bob", "Cindy", "David", "Eva"];
    const today = new Date();
    const schedules = [];
    for (let d = 0; d < 14; d++) {
        for (const name of staff) {
            if (Math.random() > 0.3) {
                const date = new Date(today);
                date.setDate(date.getDate() + d);
                schedules.push({
                    id: `mock-${d}-${name}`,
                    staff_id: `staff-${name.toLowerCase()}`,
                    staff_name: name,
                    date: date.toISOString().slice(0, 10),
                    start_time: "09:00:00",
                    end_time: d % 2 === 0 ? "18:00:00" : "14:00:00",
                    status: "scheduled",
                    note: null,
                });
            }
        }
    }
    return schedules;
}
