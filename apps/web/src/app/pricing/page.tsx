// apps/web/src/app/pricing/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

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

const fallbackPlans: Plan[] = [
    { id: "p1", code: "free", name: "免費方案", price: 0, period: "monthly", max_staff: 1, features: ["基礎預約管理", "單一員工", "Email 通知"], status: "active" },
    { id: "p2", code: "pro", name: "專業方案", price: 799, period: "monthly", max_staff: 5, features: ["進階預約管理", "最多 5 位員工", "SMS + Email 通知", "數據報表", "自訂品牌"], status: "active" },
    { id: "p3", code: "enterprise", name: "企業方案", price: 1999, period: "monthly", max_staff: 9999, features: ["完整預約管理", "無限員工", "全通路通知", "進階報表", "自訂品牌", "API 存取", "專屬客服"], status: "active" },
];

export default function PricingPage() {
    const [plans, setPlans] = useState<Plan[]>(fallbackPlans);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/admin/plans");
                if (res.ok) {
                    const body = await res.json();
                    const active = (body.plans ?? []).filter((p: Plan) => p.status === "active");
                    if (active.length > 0) setPlans(active);
                }
            } catch { /* use fallback */ } finally { setLoading(false); }
        })();
    }, []);

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <div className="mx-auto max-w-5xl px-6 py-16">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        方案與定價
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-base text-slate-500">
                        選擇最適合您的方案，立即開始使用 Hero Booking 預約管理系統
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan, index) => {
                        const isPopular = index === 1; // Pro plan
                        return (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col rounded-2xl p-6 shadow-sm ring-1 transition-all hover:shadow-lg ${isPopular
                                        ? "bg-white ring-indigo-600 ring-2 scale-[1.02]"
                                        : "bg-white ring-slate-200"
                                    }`}
                            >
                                {isPopular && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                                        最受歡迎
                                    </span>
                                )}
                                <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                                <div className="mt-3">
                                    <span className="text-4xl font-bold text-slate-900">
                                        {plan.price === 0 ? "免費" : `NT$${plan.price.toLocaleString()}`}
                                    </span>
                                    {plan.price > 0 && (
                                        <span className="ml-1 text-sm text-slate-500">
                                            /{plan.period === "yearly" ? "年" : "月"}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-2 text-sm text-slate-500">
                                    員工上限：{plan.max_staff >= 9999 ? "無限" : plan.max_staff} 人
                                </p>

                                <ul className="mt-5 flex-1 space-y-2.5">
                                    {(plan.features ?? []).map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                            <span className="mt-0.5 text-emerald-500">✓</span>
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href="/register"
                                    className={`mt-6 block rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${isPopular
                                            ? "bg-indigo-600 text-white hover:bg-indigo-500"
                                            : "bg-slate-900 text-white hover:bg-slate-800"
                                        }`}
                                >
                                    {plan.price === 0 ? "免費開始" : "開始試用"}
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ hint */}
                {!loading && (
                    <div className="mt-12 text-center">
                        <p className="text-sm text-slate-500">
                            所有付費方案均享 14 天免費試用。如需客製方案，請
                            <a href="mailto:support@hero-booking.com" className="ml-1 text-indigo-600 hover:underline">
                                聯繫我們
                            </a>
                            。
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
