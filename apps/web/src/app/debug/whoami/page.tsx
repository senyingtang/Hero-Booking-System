// apps/web/src/app/debug/whoami/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { authFetch } from "@/lib/authFetch";

export default function WhoAmIPage() {
    const [info, setInfo] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(true);
    const [clientUser, setClientUser] = useState<Record<string, unknown> | null>(null);

    useEffect(() => {
        const run = async () => {
            // 客戶端 session
            const { data: { user } } = await supabase.auth.getUser();
            const { data: { session } } = await supabase.auth.getSession();
            setClientUser({
                id: user?.id ?? null,
                email: user?.email ?? null,
                hasSession: !!session,
                tokenPrefix: session?.access_token?.slice(0, 20) ?? null,
            });

            // 透過 authFetch 呼叫 API
            try {
                const res = await authFetch("/api/debug/whoami");
                const data = await res.json();
                setInfo(data);
            } catch (err) {
                setInfo({ error: String(err) });
            }
            setLoading(false);
        };
        run();
    }, []);

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-2xl space-y-4">
                <h1 className="text-xl font-bold">🔍 Auth 診斷</h1>

                <section className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <h2 className="text-sm font-semibold text-slate-700">Client-side User Info</h2>
                    <pre className="mt-2 overflow-auto rounded bg-slate-50 p-3 text-xs">{JSON.stringify(clientUser, null, 2)}</pre>
                </section>

                <section className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <h2 className="text-sm font-semibold text-slate-700">Server-side /api/debug/whoami</h2>
                    {loading ? (
                        <p className="mt-2 text-sm text-slate-400">載入中…</p>
                    ) : (
                        <pre className="mt-2 overflow-auto rounded bg-slate-50 p-3 text-xs">{JSON.stringify(info, null, 2)}</pre>
                    )}
                </section>

                {info && typeof info.fix_sql === "string" && (
                    <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <h2 className="text-sm font-semibold text-amber-800">⚡ 修復 SQL（複製到 Supabase SQL Editor 執行）</h2>
                        <pre className="mt-2 overflow-auto rounded bg-white p-3 text-xs">{info.fix_sql}</pre>
                    </section>
                )}
            </div>
        </main>
    );
}
