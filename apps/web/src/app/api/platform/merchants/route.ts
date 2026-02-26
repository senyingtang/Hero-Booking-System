// apps/web/src/app/api/platform/merchants/route.ts
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * GET /api/platform/merchants
 * 回傳所有商家列表，含旗下 tenants 數量
 */
export async function GET() {
    const supabase = createServerSupabaseClient();

    // 查商家 + 關聯的 tenants
    const { data: merchants, error } = await supabase
        .from("kb_merchants")
        .select(`
      id,
      name,
      owner_auth_user_id,
      created_at,
      kb_tenants ( id, name, status )
    `)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 整理回傳格式
    const result = (merchants ?? []).map((m) => {
        const tenants = Array.isArray(m.kb_tenants) ? m.kb_tenants : [];
        return {
            id: m.id,
            name: m.name,
            owner_auth_user_id: m.owner_auth_user_id,
            created_at: m.created_at,
            tenant_count: tenants.length,
            tenant_name: tenants[0]?.name ?? null,
            tenant_status: tenants[0]?.status ?? null,
        };
    });

    return NextResponse.json({ merchants: result }, { status: 200 });
}
