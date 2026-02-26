// apps/web/src/app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/components/providers/TenantProvider";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";

/* ── Types ── */

type DailyTrend = { day: string; count: number; revenue: number };
type RankedItem = { name: string; count: number; revenue: number };
type Appointment = {
    id: string;
    customer_name: string;
    service_name: string;
    staff_name: string;
    start_time: string;
    end_time: string;
    total_amount: number;
    status: string;
};

type KpiData = {
    total_appointments: number;
    revenue_today: number;
    revenue_month: number;
    revenue_last_month: number;
    active_staff: number;
    upcoming_appointments: Appointment[];
    daily_trend: DailyTrend[];
    top_services: RankedItem[];
    top_staff: RankedItem[];
};

/* ── Helpers ── */

function formatCurrency(n: number) {
    return `NT$${n.toLocaleString("zh-TW")}`;
}

function growthRate(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatShortDate(iso: string) {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

/* ── KPI Card ── */

function KpiCard({
    label,
    value,
    sub,
    icon,
    color,
}: {
    label: string;
    value: string;
    sub?: React.ReactNode;
    icon: string;
    color: string;
}) {
    return (
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${color}`}
                >
                    {icon}
                </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
            {sub && <div className="mt-1">{sub}</div>}
        </div>
    );
}

/* ── Page ── */

export default function AdminDashboardPage() {
    const { tenantId } = useTenant();
    const [kpi, setKpi] = useState<KpiData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/kpi?tenant_id=${tenantId}`);
                if (res.ok) {
                    const body = await res.json();
                    setKpi(body.kpi);
                }
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [tenantId]);

    if (!tenantId) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm text-slate-400">無法取得租戶資訊。</p>
            </div>
        );
    }

    if (loading || !kpi) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm text-slate-400">載入 KPI 資料中…</p>
            </div>
        );
    }

    const growth = growthRate(kpi.revenue_month, kpi.revenue_last_month);
    const trendData = kpi.daily_trend.map((d) => ({
        ...d,
        label: formatShortDate(d.day),
    }));

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">儀表板</h1>
                <p className="mt-1 text-sm text-slate-500">
                    商家營運即時指標總覽
                </p>
            </header>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    label="今日營收"
                    value={formatCurrency(kpi.revenue_today)}
                    icon="💰"
                    color="bg-emerald-50"
                />
                <KpiCard
                    label="本月營收"
                    value={formatCurrency(kpi.revenue_month)}
                    sub={
                        <span
                            className={`text-xs font-medium ${growth >= 0 ? "text-emerald-600" : "text-rose-600"
                                }`}
                        >
                            {growth >= 0 ? "↑" : "↓"} {Math.abs(growth)}% vs 上月
                        </span>
                    }
                    icon="📈"
                    color="bg-indigo-50"
                />
                <KpiCard
                    label="總預約數"
                    value={kpi.total_appointments.toLocaleString()}
                    icon="📅"
                    color="bg-amber-50"
                />
                <KpiCard
                    label="在編員工"
                    value={String(kpi.active_staff)}
                    icon="👥"
                    color="bg-sky-50"
                />
            </div>

            {/* ── Revenue Trend Chart ── */}
            <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">
                    近 7 天營收趨勢
                </h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendData} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 12, fill: "#94a3b8" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: "#94a3b8" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                formatter={(value: number | undefined) => [formatCurrency(value ?? 0), "營收"]}
                                labelFormatter={(l) => `日期：${l}`}
                                contentStyle={{
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                    fontSize: "13px",
                                }}
                            />
                            <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* ── Appointment Trend (Count) ── */}
            <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">
                    近 7 天預約量
                </h2>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 12, fill: "#94a3b8" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: "#94a3b8" }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                formatter={(value: number | undefined) => [value ?? 0, "預約數"]}
                                contentStyle={{
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                    fontSize: "13px",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#10b981" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* ── Bottom grid: Top Services + Top Staff + Upcoming ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Top Services */}
                <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <h2 className="mb-3 text-sm font-semibold text-slate-900">
                        Top 服務項目
                    </h2>
                    <div className="space-y-2">
                        {kpi.top_services.map((s, i) => (
                            <div
                                key={s.name}
                                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                                        {i + 1}
                                    </span>
                                    <span className="text-sm text-slate-700">{s.name}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-slate-900">
                                        {formatCurrency(s.revenue)}
                                    </p>
                                    <p className="text-[10px] text-slate-400">{s.count} 筆</p>
                                </div>
                            </div>
                        ))}
                        {kpi.top_services.length === 0 && (
                            <p className="py-4 text-center text-xs text-slate-400">
                                暫無資料
                            </p>
                        )}
                    </div>
                </section>

                {/* Top Staff */}
                <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <h2 className="mb-3 text-sm font-semibold text-slate-900">
                        Top 員工績效
                    </h2>
                    <div className="space-y-2">
                        {kpi.top_staff.map((s, i) => (
                            <div
                                key={s.name}
                                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                                        {i + 1}
                                    </span>
                                    <span className="text-sm text-slate-700">{s.name}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-slate-900">
                                        {formatCurrency(s.revenue)}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        {s.count} 筆完成
                                    </p>
                                </div>
                            </div>
                        ))}
                        {kpi.top_staff.length === 0 && (
                            <p className="py-4 text-center text-xs text-slate-400">
                                暫無資料
                            </p>
                        )}
                    </div>
                </section>

                {/* Upcoming Appointments */}
                <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <h2 className="mb-3 text-sm font-semibold text-slate-900">
                        即將到來的預約
                    </h2>
                    <div className="space-y-2">
                        {kpi.upcoming_appointments.map((a) => (
                            <div
                                key={a.id}
                                className="rounded-lg border border-slate-100 px-3 py-2"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-900">
                                        {a.customer_name}
                                    </p>
                                    <span className="text-xs text-slate-400">
                                        {formatTime(a.start_time)}
                                    </span>
                                </div>
                                <div className="mt-0.5 flex items-center justify-between text-xs text-slate-500">
                                    <span>
                                        {a.service_name} · {a.staff_name}
                                    </span>
                                    <span className="font-medium text-slate-700">
                                        {formatCurrency(a.total_amount)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {kpi.upcoming_appointments.length === 0 && (
                            <p className="py-4 text-center text-xs text-slate-400">
                                近 7 天無預約
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
