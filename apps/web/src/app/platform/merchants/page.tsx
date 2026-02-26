// apps/web/src/app/platform/merchants/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Merchant = {
    id: string;
    name: string;
    owner_auth_user_id: string | null;
    created_at: string;
    tenant_count: number;
    tenant_name: string | null;
    tenant_status: string | null;
};

function StatusBadge({ status }: { status: string | null }) {
    if (!status) return <span className="text-slate-300">—</span>;
    const map: Record<string, string> = {
        active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        trialing: "bg-amber-50 text-amber-700 ring-amber-200",
        suspended: "bg-rose-50 text-rose-700 ring-rose-200",
    };
    const cls = map[status] ?? "bg-slate-50 text-slate-700 ring-slate-200";
    const label =
        status === "active"
            ? "啟用中"
            : status === "trialing"
                ? "試用中"
                : status === "suspended"
                    ? "已暫停"
                    : status;
    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${cls}`}
        >
            {label}
        </span>
    );
}

export default function MerchantsListPage() {
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/platform/merchants");
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    alert("載入商家列表失敗：" + (body.error ?? res.statusText));
                    return;
                }
                const body = await res.json();
                setMerchants(body.merchants ?? []);
            } catch {
                alert("載入商家列表失敗，請稍後再試。");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="mx-auto max-w-6xl px-6 py-8">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">商家總覽</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        檢視所有已核准的 Hero Booking 商家。
                    </p>
                </div>
                <span className="text-sm text-slate-400">
                    共 {merchants.length} 間商家
                </span>
            </header>

            <section className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                {loading ? (
                    <p className="py-10 text-center text-sm text-slate-400">載入中…</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50/50 text-xs text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">商家名稱</th>
                                    <th className="px-4 py-3">租戶 (Tenant)</th>
                                    <th className="px-4 py-3">狀態</th>
                                    <th className="px-4 py-3">擁有者</th>
                                    <th className="px-4 py-3">建立日期</th>
                                    <th className="px-4 py-3 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {merchants.map((m) => (
                                    <tr
                                        key={m.id}
                                        className="border-b border-slate-100 transition-colors hover:bg-slate-50/50"
                                    >
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-900">{m.name}</p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {m.tenant_name ? (
                                                <span>
                                                    {m.tenant_name}
                                                    {m.tenant_count > 1 && (
                                                        <span className="ml-1 text-xs text-slate-400">
                                                            +{m.tenant_count - 1}
                                                        </span>
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={m.tenant_status} />
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {m.owner_auth_user_id ? (
                                                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                                                    {m.owner_auth_user_id.slice(0, 8)}…
                                                </code>
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {m.created_at
                                                ? new Date(m.created_at).toLocaleDateString("zh-TW")
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="inline-flex gap-2">
                                                <Link
                                                    href={`/platform/merchants/${m.id}`}
                                                    className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                                                >
                                                    查看
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && merchants.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-10 text-center text-sm text-slate-400"
                                        >
                                            目前沒有任何商家，請先核准商家申請。
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
