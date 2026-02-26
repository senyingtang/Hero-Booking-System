// apps/web/src/app/api/platform/merchants/[merchantId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * GET /api/platform/merchants/:merchantId
 * 回傳單筆商家 + 旗下 tenants + 角色
 */
export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ merchantId: string }> }
) {
    const { merchantId } = await context.params;
    const supabase = createServerSupabaseClient();

    // 1) 商家基本資料
    const { data: merchant, error: merchantError } = await supabase
        .from("kb_merchants")
        .select("id, name, slug, owner_auth_user_id, created_at")
        .eq("id", merchantId)
        .single();

    if (merchantError) {
        return NextResponse.json(
            { error: merchantError.message },
            { status: merchantError.code === "PGRST116" ? 404 : 500 }
        );
    }

    // 2) 旗下 tenants
    const { data: tenants } = await supabase
        .from("kb_tenants")
        .select("id, name, slug, status, created_at")
        .eq("merchant_id", merchantId)
        .order("created_at", { ascending: false });

    // 3) 旗下角色
    const { data: roles } = await supabase
        .from("kb_user_roles")
        .select("id, auth_user_id, tenant_id, role, status")
        .eq("merchant_id", merchantId);

    return NextResponse.json(
        {
            merchant,
            tenants: tenants ?? [],
            roles: roles ?? [],
        },
        { status: 200 }
    );
}
