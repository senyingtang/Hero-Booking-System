// apps/web/src/app/api/debug/whoami/route.ts
// 臨時診斷用 — 用 Authorization Bearer token
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
    const { user, error: authError } = await getAuthUser(req);

    if (authError || !user) {
        return NextResponse.json({
            status: "NOT_LOGGED_IN",
            error: authError ?? "No token provided",
            hint: "請確認 Authorization: Bearer <token> header",
        });
    }

    const admin = createServerSupabaseClient();

    // 查 kb_user_roles
    const { data: directRoles, error: rolesError } = await admin
        .from("kb_user_roles")
        .select("*")
        .eq("auth_user_id", user.id);

    // 查所有 roles
    const { data: allRoles } = await admin
        .from("kb_user_roles")
        .select("id, auth_user_id, wp_user_id, tenant_id, merchant_id, role, status")
        .limit(20);

    return NextResponse.json({
        status: "OK",
        auth_user: { id: user.id, email: user.email, created_at: user.created_at },
        direct_roles: { count: directRoles?.length ?? 0, data: directRoles, error: rolesError?.message ?? null },
        all_roles_in_table: { count: allRoles?.length ?? 0, data: allRoles },
        fix_sql: `-- 複製到 Supabase SQL Editor 執行：\nINSERT INTO kb_user_roles (auth_user_id, role, status)\nVALUES ('${user.id}', 'platform_admin', 'active');`,
    });
}
