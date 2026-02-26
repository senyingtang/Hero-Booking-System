// apps/web/src/app/platform/merchant-applications/[id]/approve/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Application = {
    id: string;
    email: string;
    shop_name: string;
    business_type: string | null;
    industry: string;
    phone: string;
    address: string;
    status: string;
    owner_auth_user_id: string | null;
    created_at: string;
};

const industryMap: Record<string, string> = {
    fitness: "健身房 / 工作室",
    beauty: "美容 / SPA",
    hair: "美髮 / 頭皮",
    yoga: "瑜珈 / 身心靈",
    other: "其他",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="py-2.5 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">
                {value || <span className="text-slate-300">—</span>}
            </dd>
        </div>
    );
}

export default function ApproveApplicationPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const [app, setApp] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [approving, setApproving] = useState(false);
    const [result, setResult] = useState<{
        ok: boolean;
        merchant_id: string | null;
        tenant_id: string | null;
    } | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(
                    `/api/platform/merchant-applications/${params.id}`
                );
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    setError(body.error ?? "載入失敗");
                    return;
                }
                const body = await res.json();
                setApp(body.application);
            } catch {
                setError("載入失敗");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [params.id]);

    const handleApprove = async () => {
        if (
            !confirm(
                "確定要核准此申請嗎？\n\n核准後系統將自動：\n1. 建立 kb_merchants\n2. 建立 kb_tenants\n3. 指派 merchant_admin 角色"
            )
        )
            return;

        setApproving(true);
        try {
            const res = await fetch(
                `/api/platform/merchant-applications/${params.id}/approve`,
                { method: "POST" }
            );
            const body = await res.json();

            if (!res.ok) {
                alert("核准失敗：" + (body.error ?? res.statusText));
                return;
            }

            setResult(body);
        } catch {
            alert("核准失敗，請稍後再試。");
        } finally {
            setApproving(false);
        }
    };

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm text-slate-400">載入中…</p>
            </div>
        );
    }

    /* ── Error ── */
    if (error || !app) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-10">
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center">
                    <p className="text-sm font-medium text-rose-700">
                        {error ?? "找不到此筆申請。"}
                    </p>
                    <Link
                        href="/platform/merchant-applications"
                        className="mt-3 inline-block text-sm text-indigo-600 hover:underline"
                    >
                        ← 返回申請列表
                    </Link>
                </div>
            </div>
        );
    }

    /* ── Success result ── */
    if (result?.ok) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-10">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                        <span className="text-2xl">✅</span>
                    </div>
                    <h1 className="text-xl font-bold text-emerald-800">核准成功！</h1>
                    <p className="mt-2 text-sm text-emerald-700">
                        已為「{app.shop_name}」建立商家、租戶與管理員角色。
                    </p>
                    <div className="mx-auto mt-4 max-w-sm space-y-1 text-left text-xs text-emerald-600">
                        {result.merchant_id && (
                            <p>
                                Merchant ID：
                                <code className="rounded bg-emerald-100 px-1 py-0.5">
                                    {result.merchant_id}
                                </code>
                            </p>
                        )}
                        {result.tenant_id && (
                            <p>
                                Tenant ID：
                                <code className="rounded bg-emerald-100 px-1 py-0.5">
                                    {result.tenant_id}
                                </code>
                            </p>
                        )}
                    </div>
                    <div className="mt-6 flex justify-center gap-3">
                        <Link
                            href="/platform/merchants"
                            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                        >
                            前往商家列表
                        </Link>
                        <Link
                            href="/platform/merchant-applications"
                            className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                            返回申請列表
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Already processed ── */
    if (app.status !== "pending") {
        return (
            <div className="mx-auto max-w-3xl px-6 py-10">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
                    <p className="text-sm font-medium text-amber-700">
                        此申請狀態為「{app.status}」，無法再次核准。
                    </p>
                    <Link
                        href={`/platform/merchant-applications/${params.id}`}
                        className="mt-3 inline-block text-sm text-indigo-600 hover:underline"
                    >
                        ← 查看申請詳情
                    </Link>
                </div>
            </div>
        );
    }

    /* ── Main: confirm approve ── */
    return (
        <div className="mx-auto max-w-3xl px-6 py-8">
            <Link
                href={`/platform/merchant-applications/${params.id}`}
                className="text-sm text-indigo-600 hover:underline"
            >
                ← 返回申請詳情
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">核准商家申請</h1>
            <p className="mt-1 text-sm text-slate-500">
                確認以下資料後按下核准，系統將自動建立商家帳號。
            </p>

            {/* Detail card */}
            <section className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <dl className="divide-y divide-slate-100">
                    <Field label="商家名稱" value={app.shop_name} />
                    <Field label="Email" value={app.email} />
                    <Field label="電話" value={app.phone} />
                    <Field
                        label="產業"
                        value={industryMap[app.industry] ?? app.industry}
                    />
                    <Field label="業務類型" value={app.business_type} />
                    <Field label="地址 / 備註" value={app.address} />
                </dl>
            </section>

            {/* What will happen */}
            <section className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
                <p className="text-xs font-semibold text-indigo-700">
                    核准後將自動執行：
                </p>
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-indigo-600">
                    <li>建立 kb_merchants（name = {app.shop_name}）</li>
                    <li>建立 kb_tenants（merchant_id = 新商家）</li>
                    <li>
                        寫入 kb_user_roles（merchant_admin, tenant_id = 新租戶）
                    </li>
                    <li>更新申請狀態為 approved</li>
                </ul>
            </section>

            {/* Action */}
            <div className="mt-6 flex gap-3">
                <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {approving ? "核准中…" : "✅ 確認核准"}
                </button>
                <Link
                    href={`/platform/merchant-applications/${params.id}`}
                    className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                    取消
                </Link>
            </div>
        </div>
    );
}
