// apps/web/src/components/platform/Sidebar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

/* ── Types ── */

export type RoleItem = {
    id: string;
    tenant_id: string | null;
    merchant_id: string | null;
    role: string;
    status: string;
    permissions: Record<string, boolean> | null;
};

type MenuItem = {
    label: string;
    href: string;
    icon: React.ReactNode;
};

type SidebarProps = {
    roles: RoleItem[];
    activePath: string;
    userEmail?: string | null;
};

/* ── Icons (inline SVG, Heroicons style) ── */

const Icons = {
    clipboard: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
        </svg>
    ),
    creditCard: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
        </svg>
    ),
    building: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
        </svg>
    ),
    chart: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
    ),
    calendar: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
    ),
    scissors: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m7.848 8.25 1.536.887M7.848 8.25a3 3 0 1 1-5.196-3 3 3 0 0 1 5.196 3Zm1.536.887a2.165 2.165 0 0 1 1.083 1.839c.005.342.019.68.043 1.013m-2.662-2.852 8.534-4.928M9.384 9.137l-1.536.887m0 0a3 3 0 1 1-5.196 3 3 3 0 0 1 5.196-3Zm1.536-.887 8.534 4.927M21 12.75l-8.534-4.928" />
        </svg>
    ),
    clock: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    ),
    cog: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
    ),
    chevronLeft: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
    ),
    chevronRight: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
    ),
    logout: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
        </svg>
    ),
};

/* ── Role badge helpers ── */

const roleDisplayMap: Record<string, { label: string; color: string }> = {
    platform_admin: { label: "平台管理員", color: "bg-indigo-100 text-indigo-700" },
    merchant_admin: { label: "商家管理員", color: "bg-emerald-100 text-emerald-700" },
    supervisor: { label: "門市主管", color: "bg-amber-100 text-amber-700" },
    staff: { label: "員工", color: "bg-slate-100 text-slate-600" },
};

/* ── Menu builders ── */

function buildPlatformMenu(): MenuItem[] {
    return [
        { label: "商家申請", href: "/platform/merchant-applications", icon: Icons.clipboard },
        { label: "方案管理", href: "/platform/plans", icon: Icons.creditCard },
        { label: "商家列表", href: "/platform/merchants", icon: Icons.building },
    ];
}

function buildMerchantMenu(): MenuItem[] {
    return [
        { label: "儀表板", href: "/admin/dashboard", icon: Icons.chart },
        { label: "預約管理", href: "/admin/appointments", icon: Icons.calendar },
        { label: "服務項目", href: "/admin/services", icon: Icons.scissors },
        { label: "員工班表", href: "/admin/staff-schedules", icon: Icons.clock },
        { label: "金流設定", href: "/admin/settings/payments", icon: Icons.cog },
        { label: "訂閱方案", href: "/admin/subscription", icon: Icons.creditCard },
    ];
}

/* ── Sidebar Component ── */

export default function Sidebar({ roles, activePath, userEmail }: SidebarProps) {
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    // 判斷角色
    const isPlatformAdmin = roles.some(
        (r) => r.role === "platform_admin" && !r.tenant_id
    );
    const isMerchantAdmin = roles.some(
        (r) => r.role === "merchant_admin" && r.tenant_id
    );

    // 組選單
    const sections: { title: string; items: MenuItem[] }[] = [];

    if (isPlatformAdmin) {
        sections.push({ title: "平台管理", items: buildPlatformMenu() });
    }
    if (isMerchantAdmin) {
        sections.push({ title: "商家管理", items: buildMerchantMenu() });
    }

    // 取主要角色 badge
    const primaryRole = roles[0];
    const badge = primaryRole
        ? roleDisplayMap[primaryRole.role] ?? {
            label: primaryRole.role,
            color: "bg-slate-100 text-slate-600",
        }
        : null;

    const handleLogout = async () => {
        setLoggingOut(true);
        await supabase.auth.signOut();
        router.push("/login");
    };

    const isActive = (href: string) =>
        activePath === href ||
        (href !== "/platform" &&
            href !== "/console" &&
            activePath.startsWith(href + "/"));

    return (
        <aside
            className={`flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ${collapsed ? "w-16" : "w-64"
                }`}
        >
            {/* ── Header ── */}
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-4">
                {!collapsed && (
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-900">
                            Hero Booking
                        </span>
                    </Link>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    title={collapsed ? "展開選單" : "收合選單"}
                >
                    {collapsed ? Icons.chevronRight : Icons.chevronLeft}
                </button>
            </div>

            {/* ── User info ── */}
            {userEmail && !collapsed && (
                <div className="border-b border-slate-100 px-4 py-3">
                    <p
                        className="truncate text-sm font-medium text-slate-900"
                        title={userEmail}
                    >
                        {userEmail}
                    </p>
                    {badge && (
                        <span
                            className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.color}`}
                        >
                            {badge.label}
                        </span>
                    )}
                </div>
            )}

            {/* ── Navigation sections ── */}
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
                {sections.length === 0 && (
                    <p className="px-3 py-2 text-xs text-slate-400">
                        {collapsed ? "" : "無可用選單"}
                    </p>
                )}
                {sections.map((section) => (
                    <div key={section.title} className="mb-2">
                        {!collapsed && (
                            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                {section.title}
                            </p>
                        )}
                        {section.items.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={collapsed ? item.label : undefined}
                                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${active
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        } ${collapsed ? "justify-center" : ""}`}
                                >
                                    <span className="flex-shrink-0">{item.icon}</span>
                                    {!collapsed && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* ── Footer: Logout ── */}
            <div className="border-t border-slate-100 p-2">
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    title={collapsed ? "登出" : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 ${collapsed ? "justify-center" : ""
                        }`}
                >
                    <span className="flex-shrink-0">{Icons.logout}</span>
                    {!collapsed && (loggingOut ? "登出中..." : "登出")}
                </button>
            </div>
        </aside>
    );
}
