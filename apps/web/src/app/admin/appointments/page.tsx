// apps/web/src/app/admin/appointments/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useTenant } from "@/components/providers/TenantProvider";
import AppointmentTable, {
    type Appointment,
} from "@/components/admin/AppointmentTable";

type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";

const statusTabs: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "全部" },
    { value: "pending", label: "待確認" },
    { value: "confirmed", label: "已確認" },
    { value: "completed", label: "已完成" },
    { value: "cancelled", label: "已取消" },
];

export default function AppointmentsPage() {
    const { tenantId } = useTenant();

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    // Filters
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [dateFrom, setDateFrom] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().slice(0, 10);
    });
    const [dateTo, setDateTo] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().slice(0, 10);
    });

    const fetchAppointments = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                tenant_id: tenantId,
                status: statusFilter,
                date_from: dateFrom,
                date_to: dateTo,
            });
            const res = await fetch(`/api/admin/appointments?${params}`);
            if (res.ok) {
                const body = await res.json();
                setAppointments(body.data ?? []);
                setTotal(body.total ?? 0);
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [tenantId, statusFilter, dateFrom, dateTo]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    /* ── Actions ── */
    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/appointments/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                // 直接更新本地狀態
                setAppointments((prev) =>
                    prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
                );
            }
        } catch {
            alert("更新失敗，請稍後再試。");
        }
    };

    const handleUpdateNote = async (id: string, note: string) => {
        try {
            const res = await fetch(`/api/admin/appointments/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ internal_note: note }),
            });
            if (res.ok) {
                setAppointments((prev) =>
                    prev.map((a) => (a.id === id ? { ...a, internal_note: note } : a))
                );
            }
        } catch {
            alert("儲存備註失敗。");
        }
    };

    if (!tenantId) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-sm text-slate-400">無法取得租戶資訊。</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl space-y-5">
            {/* ── Header ── */}
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">預約管理</h1>
                    <p className="mt-0.5 text-sm text-slate-500">
                        共 {total} 筆預約
                    </p>
                </div>
                <button
                    onClick={fetchAppointments}
                    disabled={loading}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                    {loading ? "載入中…" : "🔄 重新整理"}
                </button>
            </header>

            {/* ── Filters ── */}
            <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center">
                {/* Status tabs */}
                <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${statusFilter === tab.value
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Date range */}
                <div className="flex items-center gap-2 sm:ml-auto">
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                    />
                    <span className="text-xs text-slate-400">至</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* ── Table ── */}
            {loading ? (
                <div className="rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm text-slate-400">載入預約資料中…</p>
                </div>
            ) : (
                <AppointmentTable
                    appointments={appointments}
                    onUpdateStatus={handleUpdateStatus}
                    onUpdateNote={handleUpdateNote}
                />
            )}
        </div>
    );
}
