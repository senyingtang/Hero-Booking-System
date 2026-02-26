// apps/web/src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ── Types ── */
type Role = {
  id: string;
  tenant_id: string | null;
  merchant_id: string | null;
  role: string;
  status: string;
  permissions: Record<string, boolean> | null;
};

type RolesResponse = {
  userId: string;
  roles: Role[];
};

/* ── Menu definitions ── */

const platformMenu = [
  { label: "平台儀表板", href: "/platform", roles: ["platform_admin"], icon: "📊" },
  { label: "商家申請", href: "/platform/merchant-applications", roles: ["platform_admin"], icon: "📋" },
  { label: "商家總覽", href: "/platform/merchants", roles: ["platform_admin"], icon: "🏪" },
];

const tenantMenu = [
  { label: "儀表板", href: "/console", roles: ["merchant_admin", "supervisor", "staff"], icon: "📊" },
  { label: "預約管理", href: "/console/appointments", roles: ["merchant_admin", "supervisor", "staff"], icon: "📅" },
  { label: "服務項目", href: "/console/services", roles: ["merchant_admin"], icon: "💇" },
  { label: "員工班表", href: "/console/staff-schedules", roles: ["merchant_admin", "supervisor"], icon: "🕐" },
  { label: "設定", href: "/console/settings", roles: ["merchant_admin"], icon: "⚙️" },
];

/* ── Role badge helpers ── */

const roleDisplayMap: Record<string, { label: string; color: string }> = {
  platform_admin: { label: "平台管理員", color: "bg-indigo-100 text-indigo-700" },
  merchant_admin: { label: "商家管理員", color: "bg-emerald-100 text-emerald-700" },
  supervisor: { label: "門市主管", color: "bg-amber-100 text-amber-700" },
  staff: { label: "員工", color: "bg-slate-100 text-slate-600" },
};

/* ── Component ── */

export function Sidebar({ scope }: { scope: "platform" | "tenant" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // 取得使用者 email（client-side auth）
        const { data: { user } } = await supabase.auth.getUser();
        setUserEmail(user?.email ?? null);

        // 取得角色資料（server API）
        const res = await fetch("/api/me/roles");
        if (res.ok) {
          const data = (await res.json()) as RolesResponse;
          setRoles(data.roles ?? []);
        }
      } catch {
        // silent fail
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  const roleNames = new Set(roles.map((r) => r.role));

  const menuItems = scope === "platform" ? platformMenu : tenantMenu;
  const items = menuItems.filter((item) =>
    item.roles.some((r) => roleNames.has(r))
  );

  // 取得主要角色（用於 badge 顯示）
  const primaryRole = roles.length > 0 ? roles[0] : null;
  const roleBadge = primaryRole
    ? roleDisplayMap[primaryRole.role] ?? { label: primaryRole.role, color: "bg-slate-100 text-slate-600" }
    : null;

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">
      {/* ── Header: Brand ── */}
      <div className="border-b border-slate-100 px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900">
            Hero Booking
          </span>
        </Link>
        <p className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-400">
          {scope === "platform" ? "Platform Admin" : "Merchant Console"}
        </p>
      </div>

      {/* ── User info ── */}
      {userEmail && (
        <div className="border-b border-slate-100 px-4 py-3">
          <p
            className="truncate text-sm font-medium text-slate-900"
            title={userEmail}
          >
            {userEmail}
          </p>
          {roleBadge && (
            <span
              className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${roleBadge.color}`}
            >
              {roleBadge.label}
            </span>
          )}
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {items.length === 0 && loaded && (
          <p className="px-3 py-2 text-xs text-slate-400">
            無可用選單項目
          </p>
        )}
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/platform" &&
              item.href !== "/console" &&
              pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${active
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer: Logout ── */}
      {userEmail && (
        <div className="border-t border-slate-100 p-3">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
          >
            <span className="text-base leading-none">🚪</span>
            {loggingOut ? "登出中..." : "登出"}
          </button>
        </div>
      )}
    </aside>
  );
}
