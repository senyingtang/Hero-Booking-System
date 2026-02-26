// apps/web/src/app/platform/merchant-applications/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

/* ── Types ── */
type Application = {
    id: string;
    email: string;
    shop_name: string;
    business_type: string | null;
    industry: string;
    phone: string;
    address: string;
    status: "pending" | "approved" | "rejected" | string;
    reject_reason: string | null;
    created_at: string;
    reviewed_at: string | null;
    reviewed_by: string | null;
    owner_auth_user_id: string | null;
};

/* ── Helpers ── */

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        pending: "bg-amber-50 text-amber-700 ring-amber-200",
        approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        rejected: "bg-rose-50 text-rose-700 ring-rose-200",
    };
    const cls = map[status] ?? "bg-slate-50 text-slate-700 ring-slate-200";
    const label =
        status === "pending"
            ? "待審核"
            : status === "approved"
                ? "已核准"
                : status === "rejected"
                    ? "已退回"
                    : status;

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${cls}`}
        >
            {label}
        </span>
    );
}

function Field({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">
                {value || <span className="text-slate-300">—</span>}
            </dd>
        </div>
    );
}

const industryMap: Record<string, string> = {
    fitness: "健身房 / 工作室",
    beauty: "美容 / SPA",
    hair: "美髮 / 頭皮",
    yoga: "瑜珈 / 身心靈",
    other: "其他",
};

/* ── Page Component ── */

export default function MerchantApplicationDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const [app, setApp] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionBusy, setActionBusy] = useState(false);

    // reject 模態
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    /* ── Load data ── */
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/platform/merchant-applications/${params.id}`
                );
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    setError(body.error ?? res.statusText);
                    return;
                }
                const body = await res.json();
                setApp(body.application);
            } catch {
                setError("載入失敗，請稍後再試。");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [params.id]);

    /* ── Actions ── */

    const handleApprove = async () => {
        if (!confirm("確定要核准這筆商家申請嗎？核准後將自動建立商家與租戶。"))
            return;
        setActionBusy(true);
        try {
            const res = await fetch(
                `/api/platform/merchant-applications/${params.id}/approve`,
                { method: "POST" }
            );
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                alert("核准失敗：" + (body.error ?? res.statusText));
            } else {
                // 重新載入
                router.refresh();
                const refreshRes = await fetch(
                    `/api/platform/merchant-applications/${params.id}`
                );
                if (refreshRes.ok) {
                    const body = await refreshRes.json();
                    setApp(body.application);
                }
            }
        } finally {
            setActionBusy(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert("請填寫退回原因。");
            return;
        }
        setActionBusy(true);
        try {
            const res = await fetch(
                `/api/platform/merchant-applications/${params.id}/reject`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reason: rejectReason.trim() }),
                }
            );
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                alert("退回失敗：" + (body.error ?? res.statusText));
            } else {
                setShowRejectModal(false);
                setRejectReason("");
                // 重新載入
                const refreshRes = await fetch(
                    `/api/platform/merchant-applications/${params.id}`
                );
                if (refreshRes.ok) {
                    const body = await refreshRes.json();
                    setApp(body.application);
                }
            }
        } finally {
            setActionBusy(false);
        }
    };

    /* ── Render ── */

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm text-slate-400">載入中…</p>
            </div>
        );
    }

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

    return (
        <div className="mx-auto max-w-4xl px-6 py-8">
            {/* ── Breadcrumb + actions ── */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <Link
                        href="/platform/merchant-applications"
                        className="text-sm text-indigo-600 hover:underline"
                    >
                        ← 商家申請列表
                    </Link>
                    <h1 className="mt-1 text-2xl font-bold text-slate-900">
                        {app.shop_name}
                    </h1>
                </div>
                <StatusBadge status={app.status} />
            </div>

            {/* ── Detail card ── */}
            <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">
                    申請資料
                </h2>
                <dl className="divide-y divide-slate-100">
                    <Field label="商家名稱" value={app.shop_name} />
                    <Field label="Email" value={app.email} />
                    <Field label="電話" value={app.phone} />
                    <Field
                        label="產業類別"
                        value={industryMap[app.industry] ?? app.industry}
                    />
                    <Field label="業務類型" value={app.business_type} />
                    <Field label="地址 / 備註" value={app.address} />
                    <Field
                        label="申請日期"
                        value={
                            app.created_at
                                ? new Date(app.created_at).toLocaleString("zh-TW")
                                : null
                        }
                    />
                    {app.owner_auth_user_id && (
                        <Field
                            label="申請人 Auth ID"
                            value={
                                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                                    {app.owner_auth_user_id}
                                </code>
                            }
                        />
                    )}
                    {app.reviewed_at && (
                        <Field
                            label="審核日期"
                            value={new Date(app.reviewed_at).toLocaleString("zh-TW")}
                        />
                    )}
                    {app.reject_reason && (
                        <Field
                            label="退回原因"
                            value={
                                <span className="text-rose-600">{app.reject_reason}</span>
                            }
                        />
                    )}
                </dl>
            </section>

            {/* ── Action buttons (pending only) ── */}
            {app.status === "pending" && (
                <section className="mt-6 flex gap-3">
                    <button
                        onClick={handleApprove}
                        disabled={actionBusy}
                        className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {actionBusy ? "處理中…" : "✅ 核准申請"}
                    </button>
                    <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionBusy}
                        className="rounded-lg border border-rose-300 bg-white px-5 py-2.5 text-sm font-medium text-rose-600 shadow-sm transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        ❌ 退回申請
                    </button>
                </section>
            )}

            {/* ── Approved summary ── */}
            {app.status === "approved" && (
                <section className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-medium text-emerald-700">
                        ✅ 此申請已核准
                        {app.reviewed_at &&
                            `（${new Date(app.reviewed_at).toLocaleString("zh-TW")}）`}
                    </p>
                </section>
            )}

            {/* ── Rejected summary ── */}
            {app.status === "rejected" && (
                <section className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-medium text-rose-700">
                        ❌ 此申請已退回
                        {app.reviewed_at &&
                            `（${new Date(app.reviewed_at).toLocaleString("zh-TW")}）`}
                    </p>
                    {app.reject_reason && (
                        <p className="mt-1 text-sm text-rose-600">
                            原因：{app.reject_reason}
                        </p>
                    )}
                </section>
            )}

            {/* ── Reject modal ── */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900">退回商家申請</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            請輸入退回原因，此訊息將紀錄在申請資料中。
                        </p>
                        <textarea
                            className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            rows={3}
                            placeholder="退回原因…"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason("");
                                }}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionBusy || !rejectReason.trim()}
                                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {actionBusy ? "處理中…" : "確認退回"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
