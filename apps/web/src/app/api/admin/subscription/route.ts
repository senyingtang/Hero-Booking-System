// apps/web/src/app/api/admin/subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * GET /api/admin/subscription?tenant_id=xxx
 */
export async function GET(req: NextRequest) {
    const tenantId = req.nextUrl.searchParams.get("tenant_id");
    if (!tenantId) return NextResponse.json({ error: "缺少 tenant_id" }, { status: 400 });

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.rpc("get_tenant_subscription", { p_tenant_id: tenantId });

    if (error) {
        if (error.code === "42883") {
            // RPC 尚未建立，回傳預設 trial 資料
            return NextResponse.json({
                subscription: {
                    status: "trial",
                    plan_code: "free",
                    plan_name: "免費方案",
                    plan_price: 0,
                    plan_period: "monthly",
                    plan_max_staff: 1,
                    plan_features: ["基礎預約管理", "單一員工", "Email 通知"],
                    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                },
            }, { status: 200 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 如果沒有訂閱紀錄，回傳空物件（前端可顯示「尚未訂閱」）
    const subscription = data && Object.keys(data).length > 0 ? data : {
        status: "trial",
        plan_code: "free",
        plan_name: "免費方案",
        plan_price: 0,
        plan_period: "monthly",
        plan_max_staff: 1,
        plan_features: ["基礎預約管理", "單一員工", "Email 通知"],
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({ subscription }, { status: 200 });
}
