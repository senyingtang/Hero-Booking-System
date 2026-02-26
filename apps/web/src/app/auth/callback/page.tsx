// apps/web/src/app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { authFetch } from "@/lib/authFetch";

type Status = "loading" | "redirecting" | "no-role" | "error";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState<Status>("loading");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        let unsubscribe: (() => void) | null = null;

        const redirectByRole = async () => {
            setStatus("redirecting");
            try {
                const res = await authFetch("/api/me/roles");
                if (!res.ok) {
                    setStatus("no-role");
                    return;
                }
                const data = await res.json();
                const roles: { role: string }[] = data.roles ?? [];

                if (roles.some((r) => r.role === "platform_admin")) {
                    router.replace("/platform");
                } else if (roles.some((r) => r.role === "merchant_admin")) {
                    router.replace("/admin");
                } else if (roles.length > 0) {
                    router.replace("/admin");
                } else {
                    setStatus("no-role");
                }
            } catch {
                setStatus("no-role");
            }
        };

        const handleCallback = async () => {
            // 5 秒 timeout
            timeoutId = setTimeout(() => {
                setStatus("error");
                setErrorMsg("登入連結已失效或已被使用，請重新寄送。");
            }, 5000);

            try {
                // 嘗試取得 user（Supabase 會自動處理 URL hash 中的 token）
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (user) {
                    clearTimeout(timeoutId);
                    await redirectByRole();
                    return;
                }

                // 若無法立即取得，監聽 auth 狀態變更
                const {
                    data: { subscription },
                } = supabase.auth.onAuthStateChange(async (event, session) => {
                    if (
                        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") &&
                        session?.user
                    ) {
                        clearTimeout(timeoutId);
                        subscription.unsubscribe();
                        await redirectByRole();
                    }
                });
                unsubscribe = () => subscription.unsubscribe();
            } catch {
                clearTimeout(timeoutId);
                setStatus("error");
                setErrorMsg("登入處理發生錯誤，請稍後再試。");
            }
        };

        handleCallback();

        return () => {
            clearTimeout(timeoutId);
            if (unsubscribe) unsubscribe();
        };
    }, [router]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-900">
            <div className="w-full max-w-md px-4">
                <div className="rounded-2xl bg-white/95 p-8 text-center shadow-2xl backdrop-blur-sm ring-1 ring-white/20">
                    {/* Loading */}
                    {status === "loading" && (
                        <>
                            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                            <h1 className="text-lg font-bold text-slate-900">登入處理中</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                正在驗證您的登入連結…
                            </p>
                        </>
                    )}

                    {/* Redirecting */}
                    {status === "redirecting" && (
                        <>
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                                <span className="text-2xl">✅</span>
                            </div>
                            <h1 className="text-lg font-bold text-slate-900">登入成功</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                正在為您跳轉至對應後台…
                            </p>
                        </>
                    )}

                    {/* No Role */}
                    {status === "no-role" && (
                        <>
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <h1 className="text-lg font-bold text-slate-900">
                                登入成功
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">
                                您的帳號尚未綁定管理角色，請先提交商家申請或聯絡平台管理員。
                            </p>
                            <div className="mt-6 flex justify-center gap-3">
                                <button
                                    onClick={() => router.push("/merchant/apply")}
                                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                                >
                                    申請成為商家
                                </button>
                                <button
                                    onClick={() => router.push("/")}
                                    className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    返回首頁
                                </button>
                            </div>
                        </>
                    )}

                    {/* Error */}
                    {status === "error" && (
                        <>
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
                                <span className="text-2xl">❌</span>
                            </div>
                            <h1 className="text-lg font-bold text-slate-900">登入失敗</h1>
                            <p className="mt-2 text-sm text-slate-500">{errorMsg}</p>
                            <div className="mt-6 flex justify-center gap-3">
                                <button
                                    onClick={() => router.push("/login")}
                                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                                >
                                    回到登入頁
                                </button>
                                <button
                                    onClick={() => router.push("/login")}
                                    className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    重新寄送連結
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
