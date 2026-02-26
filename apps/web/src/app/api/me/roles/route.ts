// apps/web/src/app/api/me/roles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { getAuthUser } from "@/lib/getAuthUser";

/**
 * GET /api/me/roles
 *
 * 回傳當前登入使用者的角色清單。
 * - 無 session → 401 { error: "unauthorized" }
 * - 有 session → { userId, roles: [...] }
 *
 * 需要 Authorization: Bearer <access_token> header
 *
 * 查詢邏輯：
 *   1. 直接以 auth_user_id 查 kb_user_roles
 *   2. 若無結果，嘗試透過 kb_wp_user_sync 取得 wp_user_id，
 *      再以 wp_user_id 查 kb_user_roles
 */
export async function GET(req: NextRequest) {
  /* ── 1. 從 Authorization header 取得 user ── */
  const { user, error: authError } = await getAuthUser(req);

  if (authError || !user) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401 }
    );
  }

  /* ── 2. 使用 service role 查詢角色（繞過 RLS） ── */
  const supabase = createServerSupabaseClient();

  // 2a. 直接以 auth_user_id 查
  const { data: directRoles, error: directError } = await supabase
    .from("kb_user_roles")
    .select("id, tenant_id, merchant_id, role, status, permissions")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .order("tenant_id", { ascending: true, nullsFirst: true })
    .order("role", { ascending: true });

  if (directError) {
    return NextResponse.json(
      { error: directError.message },
      { status: 500 }
    );
  }

  // 2b. 如果直接查有結果，直接回傳
  if (directRoles && directRoles.length > 0) {
    return NextResponse.json(
      {
        userId: user.id,
        roles: directRoles,
      },
      { status: 200 }
    );
  }

  // 2c. fallback：透過 kb_wp_user_sync 取得 wp_user_id
  const { data: syncRows } = await supabase
    .from("kb_wp_user_sync")
    .select("wp_user_id")
    .eq("auth_user_id", user.id);

  if (syncRows && syncRows.length > 0) {
    const wpUserIds = syncRows.map((r) => r.wp_user_id);

    const { data: wpRoles, error: wpError } = await supabase
      .from("kb_user_roles")
      .select("id, tenant_id, merchant_id, role, status, permissions")
      .in("wp_user_id", wpUserIds)
      .eq("status", "active")
      .order("tenant_id", { ascending: true, nullsFirst: true })
      .order("role", { ascending: true });

    if (wpError) {
      return NextResponse.json(
        { error: wpError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        userId: user.id,
        roles: wpRoles ?? [],
      },
      { status: 200 }
    );
  }

  // 2d. 完全查不到任何角色
  return NextResponse.json(
    {
      userId: user.id,
      roles: [],
    },
    { status: 200 }
  );
}
