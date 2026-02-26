// apps/web/src/app/platform/merchants/[merchantId]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

/* ── Types ── */
type Merchant = {
    id: string;
    name: string;
    slug: string | null;
    owner_auth_user_id: string | null;
    created_at: string;
};

type Tenant = {
    id: string;
    name: string;
    slug: string | null;
    status: string;
    created_at: string;
};

type UserRole = {
    id: string;
    auth_user_id: string;
    tenant_id: string | null;
    role: string;
    status: string;
};

/* ── Helpers ── */

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        trialing: "bg-amber-50 text-amber-700 ring-amber-200",
        suspended: "bg-rose-50 text-rose-700 ring-rose-200",
        inactive: "bg-slate-50 text-slate-500 ring-slate-200",
    };
    const cls = map[status] ?? "bg-slate-50 text-slate-700 ring-slate-200";
    const label =
        status === "active"
            ? "啟用中"
            : status === "trialing"
                ? "試用中"
                : status === "suspended"
                    ? "已暫停"
                    : status === "inactive"
                        ? "停用"
                        : status;

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${cls}`}
        >
            {label}
        </span>
    );
}

function RoleBadge({ role }: { role: string }) {
    const map: Record<string, string> = {
        platform_admin: "bg-indigo-50 text-indigo-700",
        merchant_admin: "bg-emerald-50 text-emerald-700",
        supervisor: "bg-amber-50 text-amber-700",
        staff: "bg-slate-100 text-slate-600",
    };
    const cls = map[role] ?? "bg-slate-100 text-slate-600";
    const label: Record<string, string> = {
        platform_admin: "平台管理員",
        merchant_admin: "商家管理員",
        supervisor: "門市主管",
        staff: "員工",
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
            {label[role] ?? role}
        </span>
    );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">
                {value || <span className="text-slate-300">—</span>}
            </dd>
        </div>
    );
}

/* ── Page Component ── */

export default function MerchantDetailPage() {
    const params = useParams<{ merchantId: string }>();

    const [merchant, setMerchant] = useState<Merchant | null>(null);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/platform/merchants/${params.merchantId}`);
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    setError(body.error ?? res.statusText);
                    return;
                }
                const body = await res.json();
                setMerchant(body.merchant);
                setTenants(body.tenants ?? []);
                setRoles(body.roles ?? []);
            } catch {
                setError("載入失敗，請稍後再試。");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [params.merchantId]);

    /* ── Render ── */

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm text-slate-400">載入中…</p>
            </div>
        );
    }

    if (error || !merchant) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-10">
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center">
                    <p className="text-sm font-medium text-rose-700">
                        {error ?? "找不到此商家。"}
                    </p>
                    <Link
                        href="/platform/merchants"
                        className="mt-3 inline-block text-sm text-indigo-600 hover:underline"
                    >
                        ← 返回商家總覽
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-6 py-8">
            {/* ── Breadcrumb ── */}
            <div className="mb-6">
                <Link
                    href="/platform/merchants"
                    className="text-sm text-indigo-600 hover:underline"
                >
                    ← 商家總覽
                </Link>
                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                    {merchant.name}
                </h1>
            </div>

            {/* ── Merchant info ── */}
            <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">
                    商家資料
                </h2>
                <dl className="divide-y divide-slate-100">
                    <Field label="商家名稱" value={merchant.name} />
                    <Field
                        label="Slug"
                        value={
                            merchant.slug ? (
                                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                                    {merchant.slug}
                                </code>
                            ) : null
                        }
                    />
                    <Field
                        label="Owner Auth ID"
                        value={
                            merchant.owner_auth_user_id ? (
                                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                                    {merchant.owner_auth_user_id}
                                </code>
                            ) : null
                        }
                    />
                    <Field
                        label="建立日期"
                        value={
                            merchant.created_at
                                ? new Date(merchant.created_at).toLocaleString("zh-TW")
                                : null
                        }
                    />
                </dl>
            </section>

            {/* ── Tenants ── */}
            <section className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900">
                        旗下店面（Tenants）
                    </h2>
                    <span className="text-xs text-slate-400">
                        共 {tenants.length} 間
                    </span>
                </div>
                {tenants.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-400">
                        此商家尚未建立任何店面。
                    </p>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 text-xs text-slate-500">
                            <tr>
                                <th className="py-2">店名</th>
                                <th className="py-2">Slug</th>
                                <th className="py-2">狀態</th>
                                <th className="py-2">建立日期</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.map((t) => (
                                <tr
                                    key={t.id}
                                    className="border-b border-slate-100"
                                >
                                    <td className="py-2.5 font-medium text-slate-900">
                                        {t.name}
                                    </td>
                                    <td className="py-2.5 text-slate-500">
                                        {t.slug ? (
                                            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                                                {t.slug}
                                            </code>
                                        ) : (
                                            <span className="text-slate-300">—</span>
                                        )}
                                    </td>
                                    <td className="py-2.5">
                                        <StatusBadge status={t.status} />
                                    </td>
                                    <td className="py-2.5 text-slate-500">
                                        {t.created_at
                                            ? new Date(t.created_at).toLocaleDateString("zh-TW")
                                            : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            {/* ── Roles ── */}
            <section className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900">
                        使用者角色
                    </h2>
                    <span className="text-xs text-slate-400">
                        共 {roles.length} 人
                    </span>
                </div>
                {roles.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-400">
                        此商家尚未設定任何使用者角色。
                    </p>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 text-xs text-slate-500">
                            <tr>
                                <th className="py-2">Auth User ID</th>
                                <th className="py-2">角色</th>
                                <th className="py-2">Tenant ID</th>
                                <th className="py-2">狀態</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((r) => (
                                <tr
                                    key={r.id}
                                    className="border-b border-slate-100"
                                >
                                    <td className="py-2.5 text-slate-500">
                                        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                                            {r.auth_user_id.slice(0, 8)}…
                                        </code>
                                    </td>
                                    <td className="py-2.5">
                                        <RoleBadge role={r.role} />
                                    </td>
                                    <td className="py-2.5 text-slate-500">
                                        {r.tenant_id ? (
                                            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                                                {r.tenant_id.slice(0, 8)}…
                                            </code>
                                        ) : (
                                            <span className="text-slate-300">—</span>
                                        )}
                                    </td>
                                    <td className="py-2.5">
                                        <StatusBadge status={r.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}
