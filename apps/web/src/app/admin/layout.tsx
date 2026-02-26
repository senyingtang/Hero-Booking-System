// apps/web/src/app/admin/layout.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { authFetch } from "@/lib/authFetch";
import Sidebar, { type RoleItem } from "@/components/platform/Sidebar";
import { TenantProvider } from "@/components/providers/TenantProvider";

type AuthState = "loading" | "ok" | "redirecting";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const [authState, setAuthState] = useState<AuthState>("loading");
    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [merchantId, setMerchantId] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            /* 1. 檢查 session */
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setAuthState("redirecting");
                router.replace("/login");
                return;
            }
            setUserEmail(user.email ?? null);

            /* 2. 取得角色 */
            try {
                const res = await authFetch("/api/me/roles");
                if (res.status === 401) {
                    setAuthState("redirecting");
                    router.replace("/login");
                    return;
                }
                if (res.ok) {
                    const data = await res.json();
                    const fetchedRoles: RoleItem[] = data.roles ?? [];
                    setRoles(fetchedRoles);

                    /* 3. 檢查是否有 merchant_admin */
                    const merchantRole = fetchedRoles.find(
                        (r) => r.role === "merchant_admin" && r.tenant_id
                    );
                    if (!merchantRole) {
                        // 沒有 merchant_admin 權限
                        setAuthState("redirecting");
                        router.replace("/login");
                        return;
                    }

                    // 設定 tenant context（取第一筆 merchant_admin 角色）
                    setTenantId(merchantRole.tenant_id);
                    setMerchantId(merchantRole.merchant_id);
                }
            } catch {
                // 網路錯誤
            }

            setAuthState("ok");
        };

        init();
    }, [router]);

    /* ── Loading / Redirect 狀態 ── */
    if (authState === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <p className="text-sm text-slate-400">載入中…</p>
            </div>
        );
    }

    if (authState === "redirecting") {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <p className="text-sm text-slate-400">跳轉中…</p>
            </div>
        );
    }

    /* ── 正常渲染 ── */
    return (
        <TenantProvider tenantId={tenantId} merchantId={merchantId}>
            <div className="flex h-screen bg-slate-50">
                <Sidebar roles={roles} activePath={pathname} userEmail={userEmail} />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </TenantProvider>
    );
}
