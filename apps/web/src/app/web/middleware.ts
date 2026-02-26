// apps/web/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 只拿來驗證 token，其他查詢交給各頁面或 API 做
function createServerClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

// 需要登入保護的前綴
const PROTECTED_PREFIXES = ["/platform", "/console", "/store"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 不在保護範圍就直接放行
  if (!PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const supabase = createServerClient();

  // 1) 從 cookie 取出 access token（next/supabase 的 cookie key 為 sb-access-token 開頭）
  const accessToken =
    req.cookies.get("sb-access-token")?.value ||
    req.headers.get("Authorization")?.replace("Bearer ", "") ||
    "";

  if (!accessToken) {
    // 沒 token，導回 login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2) 驗證 token 取得 user
  const {
    data: { user },
    error
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3) 如果是 /platform 或 /console 或 /store，做簡單角色檢查
  if (pathname.startsWith("/platform")) {
    const { data: roles } = await supabase
      .from("kb_user_roles")
      .select("role")
      .eq("auth_user_id", user.id)
      .eq("status", "active");

    const isPlatformAdmin = roles?.some(
      (r) => r.role === "platform_admin"
    );

    if (!isPlatformAdmin) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (pathname.startsWith("/console")) {
    const { data: roles } = await supabase
      .from("kb_user_roles")
      .select("role")
      .eq("auth_user_id", user.id)
      .eq("status", "active");

    const isMerchantAdmin = roles?.some(
      (r) => r.role === "merchant_admin" || r.role === "platform_admin"
    );

    if (!isMerchantAdmin) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (pathname.startsWith("/store")) {
    const { data: roles } = await supabase
      .from("kb_user_roles")
      .select("role, tenant_id")
      .eq("auth_user_id", user.id)
      .eq("status", "active");

    const isSupervisor =
      roles?.some(
        (r) => r.role === "supervisor" && r.tenant_id != null
      ) || roles?.some((r) => r.role === "platform_admin");

    if (!isSupervisor) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 通過驗證，放行
  return NextResponse.next();
}

// 告訴 Next.js 這個 middleware 要套用哪些路徑
export const config = {
  matcher: ["/platform/:path*", "/console/:path*", "/store/:path*"]
};
