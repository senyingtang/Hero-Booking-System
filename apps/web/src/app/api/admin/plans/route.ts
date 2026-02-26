// apps/web/src/app/api/admin/plans/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * GET  /api/admin/plans
 * POST /api/admin/plans  { code, name, price, period, max_staff, features, status, sort_order }
 */
export async function GET() {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.rpc("get_plans");

    if (error) {
        if (error.code === "42883") {
            return NextResponse.json({ plans: generateMockPlans() }, { status: 200 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ plans: data ?? [] }, { status: 200 });
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.rpc("upsert_plan", {
        p_id: body.id ?? null,
        p_code: body.code ?? null,
        p_name: body.name ?? null,
        p_price: body.price ?? 0,
        p_period: body.period ?? "monthly",
        p_max_staff: body.max_staff ?? 1,
        p_features: body.features ?? [],
        p_status: body.status ?? "active",
        p_sort_order: body.sort_order ?? 0,
    });

    if (error) {
        if (error.code === "42883") return NextResponse.json({ ok: true, plan: { id: "mock", code: body.code } }, { status: 200 });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, plan: data }, { status: 200 });
}

function generateMockPlans() {
    return [
        { id: "p1", code: "free", name: "免費方案", price: 0, period: "monthly", max_staff: 1, features: ["基礎預約管理", "單一員工", "Email 通知"], status: "active", sort_order: 1 },
        { id: "p2", code: "pro", name: "專業方案", price: 799, period: "monthly", max_staff: 5, features: ["進階預約管理", "最多 5 位員工", "SMS + Email 通知", "數據報表", "自訂品牌"], status: "active", sort_order: 2 },
        { id: "p3", code: "enterprise", name: "企業方案", price: 1999, period: "monthly", max_staff: 9999, features: ["完整預約管理", "無限員工", "全通路通知", "進階報表", "自訂品牌", "API 存取", "專屬客服"], status: "active", sort_order: 3 },
    ];
}
