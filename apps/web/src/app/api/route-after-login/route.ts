// apps/web/src/app/api/route-after-login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient();

  // 從 header 取得 access token（前端會傳）
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401 }
    );
  }

  // 讀取此使用者的 active 角色
  const { data: roles, error: rolesError } = await supabase
    .from("kb_user_roles")
    .select("role, tenant_id")
    .eq("auth_user_id", user.id)
    .eq("status", "active");

  if (rolesError) {
    return NextResponse.json(
      { error: rolesError.message },
      { status: 500 }
    );
  }

  // 簡單決策：platform > merchant > supervisor
  let targetPath: string | null = null;

  if (roles?.some((r) => r.role === "platform_admin")) {
    targetPath = "/platform";
  } else if (roles?.some((r) => r.role === "merchant_admin")) {
    targetPath = "/console";
  } else {
    const supervisorRole = roles?.find(
      (r) => r.role === "supervisor" && r.tenant_id
    );
    if (supervisorRole?.tenant_id) {
      targetPath = `/store/${supervisorRole.tenant_id}`;
    }
  }

  if (!targetPath) {
    // 沒有任何後台角色
    return NextResponse.json(
      { next: "/", message: "no_backend_role" },
      { status: 200 }
    );
  }

  return NextResponse.json({ next: targetPath }, { status: 200 });
}
