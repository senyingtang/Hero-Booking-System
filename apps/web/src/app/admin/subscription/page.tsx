// apps/web/src/app/admin/subscription/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useTenant } from "@/components/providers/TenantProvider";

type Subscription = {
    subscription_id?: string;
    status: string;
    plan_code: string;
    plan_name: string;
    plan_price: number;
    plan_period: string;
    plan_max_staff: number;
    plan_features: string[];
    current_period_start?: string;
    current_period_end?: string;
    trial_ends_at?: string;
};

type Plan = {
    id: string;
    code: string;
    name: string;
    price: number;
    period: string;
    max_staff: number;
    features: string[];
    status: string;
};

const statusLabels: Record<string, { label: string; color: string }> = {
    trial: { label: "試用中", color: "bg-amber-100 text-amber-700" },
    active: { label: "使用中", color: "bg-emerald-100 text-emerald-700" },
    expired: { label: "已過期", color: "bg-red-100 text-red-700" },
    cancelled: { label: "已取消", color: "bg-slate-100 text-slate-600" },
};

export default function SubscriptionPage() {
    const { tenantId } = useTenant();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const [subRes, plansRes] = await Promise.all([
                fetch(`/api/admin/subscription?tenant_id=${tenantId}`),
                fetch("/api/admin/plans"),
            ]);
            if (subRes.ok) {
                const subBody = await subRes.json();
                setSubscription(subBody.subscription ?? null);
            }
            if (plansRes.ok) {
                const plansBody = await plansRes.json();
                setPlans((plansBody.plans ?? []).filter((p: Plan) => p.status === "active"));
            }
        } catch { /* silent */ } finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (!tenantId) return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-sm text-slate-400">無法取得租戶資訊。</p></div>;
    if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-sm text-slate-400">載入訂閱資訊中…</p></div>;

    const statusBadge = statusLabels[subscription?.status ?? "trial"] ?? statusLabels.trial;
    const trialEnd = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
    const daysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">訂閱方案</h1>
                <p className="mt-0.5 text-sm text-slate-500">管理您的訂閱方案與付費</p>
            </header>

            {/* ── 當前方案卡片 ── */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-lg">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-widest opacity-70">當前方案</p>
                        <h2 className="mt-1 text-2xl font-bold">{subscription?.plan_name ?? "免費方案"}</h2>
                        <div className="mt-2 flex items-center gap-2">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge.color}`}>
                                {statusBadge.label}
                            </span>
                            {subscription?.status === "trial" && daysLeft !== null && (
                                <span className="text-xs opacity-80">剩餘 {daysLeft} 天試用</span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold">
                            {(subscription?.plan_price ?? 0) === 0
                                ? "免費"
                                : `NT$${(subscription?.plan_price ?? 0).toLocaleString()}`}
                        </p>
                        <p className="mt-0.5 text-xs opacity-70">
                            /{subscription?.plan_period === "yearly" ? "年" : "月"}
                        </p>
                    </div>
                </div>

                <div className="mt-5 border-t border-white/20 pt-4">
                    <p className="text-xs font-medium uppercase tracking-widest opacity-70">包含功能</p>
                    <ul className="mt-2 grid grid-cols-2 gap-1.5">
                        {(subscription?.plan_features ?? []).map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-sm">
                                <span className="text-emerald-300">✓</span> {f}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs opacity-70">
                    <span>員工上限：{(subscription?.plan_max_staff ?? 1) >= 9999 ? "無限" : subscription?.plan_max_staff ?? 1} 人</span>
                    {subscription?.current_period_end && (
                        <span>· 到期日：{new Date(subscription.current_period_end).toLocaleDateString("zh-TW")}</span>
                    )}
                </div>
            </div>

            {/* ── 升級方案卡片 ── */}
            {plans.length > 0 && (
                <div>
                    <h3 className="mb-3 text-lg font-semibold text-slate-900">升級方案</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan) => {
                            const isCurrent = plan.code === (subscription?.plan_code ?? "free");
                            return (
                                <div key={plan.id} className={`relative rounded-xl p-5 shadow-sm ring-1 transition-all ${isCurrent
                                        ? "bg-indigo-50 ring-indigo-300"
                                        : "bg-white ring-slate-200 hover:ring-indigo-300 hover:shadow-md"
                                    }`}>
                                    {isCurrent && (
                                        <span className="absolute -top-2.5 right-3 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-medium text-white">
                                            目前方案
                                        </span>
                                    )}
                                    <h4 className="font-semibold text-slate-900">{plan.name}</h4>
                                    <p className="mt-1 text-2xl font-bold text-slate-900">
                                        {plan.price === 0 ? "免費" : `NT$${plan.price.toLocaleString()}`}
                                        <span className="text-sm font-normal text-slate-500">
                                            /{plan.period === "yearly" ? "年" : "月"}
                                        </span>
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        員工上限：{plan.max_staff >= 9999 ? "無限" : plan.max_staff} 人
                                    </p>
                                    <ul className="mt-3 space-y-1">
                                        {(plan.features ?? []).map((f, i) => (
                                            <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                                                <span className="text-emerald-500">✓</span> {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        disabled={isCurrent}
                                        className={`mt-4 w-full rounded-lg py-2 text-sm font-medium transition-colors ${isCurrent
                                                ? "bg-slate-100 text-slate-400 cursor-default"
                                                : "bg-indigo-600 text-white hover:bg-indigo-500"
                                            }`}
                                    >
                                        {isCurrent ? "目前方案" : plan.price === 0 ? "降級" : "升級"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── 提示 ── */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-800">💡 升級提示</p>
                <p className="mt-1 text-xs text-amber-700">
                    升級方案會透過綠界 ECPay 進行付款，付款成功後系統會自動更新您的訂閱狀態。
                    如有任何問題，請聯繫客服。
                </p>
            </div>
        </div>
    );
}
