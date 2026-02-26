// apps/web/src/components/admin/AppointmentTable.tsx
"use client";

import React, { useState } from "react";

/* ── Types ── */

export type Appointment = {
    id: string;
    booking_code: string;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    service_name: string;
    staff_name: string;
    start_time: string;
    end_time: string;
    total_amount: number;
    status: string;
    internal_note?: string | null;
    created_at?: string;
};

type Props = {
    appointments: Appointment[];
    onUpdateStatus: (id: string, status: string) => Promise<void>;
    onUpdateNote: (id: string, note: string) => Promise<void>;
};

/* ── Status badge ── */

const statusConfig: Record<string, { label: string; cls: string }> = {
    pending: { label: "待確認", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
    confirmed: { label: "已確認", cls: "bg-sky-50 text-sky-700 ring-sky-200" },
    completed: { label: "已完成", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    cancelled: { label: "已取消", cls: "bg-rose-50 text-rose-700 ring-rose-200" },
    no_show: { label: "未到", cls: "bg-slate-50 text-slate-600 ring-slate-200" },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status] ?? { label: status, cls: "bg-slate-50 text-slate-600 ring-slate-200" };
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
}

/* ── Helpers ── */

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit" });
}

function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
}

function fmtCurrency(n: number) {
    return `NT$${n.toLocaleString("zh-TW")}`;
}

/* ── Component ── */

export default function AppointmentTable({ appointments, onUpdateStatus, onUpdateNote }: Props) {
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [noteText, setNoteText] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleAction = async (id: string, newStatus: string) => {
        setActionLoading(id);
        await onUpdateStatus(id, newStatus);
        setActionLoading(null);
    };

    const handleSaveNote = async (id: string) => {
        setActionLoading(id);
        await onUpdateNote(id, noteText);
        setEditingNoteId(null);
        setNoteText("");
        setActionLoading(null);
    };

    if (appointments.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                <span className="text-4xl">📅</span>
                <p className="mt-3 text-sm font-medium text-slate-500">還沒有預約記錄</p>
                <p className="mt-1 text-xs text-slate-400">預約資料將在客戶下單後自動出現於此。</p>
            </div>
        );
    }

    return (
        <>
            {/* ── Desktop Table ── */}
            <div className="hidden overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50/50 text-xs text-slate-500">
                        <tr>
                            <th className="px-4 py-3">編號</th>
                            <th className="px-4 py-3">客戶</th>
                            <th className="px-4 py-3">服務</th>
                            <th className="px-4 py-3">員工</th>
                            <th className="px-4 py-3">時間</th>
                            <th className="px-4 py-3">金額</th>
                            <th className="px-4 py-3">狀態</th>
                            <th className="px-4 py-3 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((a) => (
                            <React.Fragment key={a.id}>
                                <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
                                    <td className="px-4 py-3">
                                        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{a.booking_code}</code>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-900">{a.customer_name}</p>
                                        {a.customer_phone && (
                                            <p className="text-xs text-slate-400">{a.customer_phone}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">{a.service_name}</td>
                                    <td className="px-4 py-3 text-slate-700">{a.staff_name}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-slate-700">{fmtDate(a.start_time)}</p>
                                        <p className="text-xs text-slate-400">
                                            {fmtTime(a.start_time)} – {fmtTime(a.end_time)}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{fmtCurrency(a.total_amount)}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={a.status} />
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="inline-flex gap-1">
                                            {a.status === "pending" && (
                                                <button
                                                    onClick={() => handleAction(a.id, "confirmed")}
                                                    disabled={actionLoading === a.id}
                                                    className="rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100 disabled:opacity-50"
                                                >
                                                    確認
                                                </button>
                                            )}
                                            {(a.status === "pending" || a.status === "confirmed") && (
                                                <button
                                                    onClick={() => handleAction(a.id, "cancelled")}
                                                    disabled={actionLoading === a.id}
                                                    className="rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                                                >
                                                    取消
                                                </button>
                                            )}
                                            {a.status === "confirmed" && (
                                                <button
                                                    onClick={() => handleAction(a.id, "completed")}
                                                    disabled={actionLoading === a.id}
                                                    className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                                                >
                                                    完成
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setEditingNoteId(editingNoteId === a.id ? null : a.id);
                                                    setNoteText(a.internal_note ?? "");
                                                }}
                                                className="rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                                            >
                                                備註
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {/* Inline note editor */}
                                {editingNoteId === a.id && (
                                    <tr className="bg-slate-50/70">
                                        <td colSpan={8} className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={noteText}
                                                    onChange={(e) => setNoteText(e.target.value)}
                                                    placeholder="輸入內部備註…"
                                                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                                                />
                                                <button
                                                    onClick={() => handleSaveNote(a.id)}
                                                    disabled={actionLoading === a.id}
                                                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                                                >
                                                    儲存
                                                </button>
                                                <button
                                                    onClick={() => setEditingNoteId(null)}
                                                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
                                                >
                                                    取消
                                                </button>
                                            </div>
                                            {a.internal_note && (
                                                <p className="mt-1.5 text-xs text-slate-400">
                                                    目前備註：{a.internal_note}
                                                </p>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Mobile Card List ── */}
            <div className="space-y-3 md:hidden">
                {appointments.map((a) => (
                    <div key={a.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{a.booking_code}</code>
                            <StatusBadge status={a.status} />
                        </div>
                        {/* Customer + Service */}
                        <div className="mt-2">
                            <p className="font-medium text-slate-900">{a.customer_name}</p>
                            <p className="text-sm text-slate-500">{a.service_name} · {a.staff_name}</p>
                        </div>
                        {/* Time + Amount */}
                        <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-slate-500">
                                {fmtDate(a.start_time)} {fmtTime(a.start_time)}–{fmtTime(a.end_time)}
                            </span>
                            <span className="font-medium text-slate-900">{fmtCurrency(a.total_amount)}</span>
                        </div>
                        {/* Note */}
                        {a.internal_note && (
                            <p className="mt-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
                                📝 {a.internal_note}
                            </p>
                        )}
                        {/* Actions */}
                        <div className="mt-3 flex gap-2">
                            {a.status === "pending" && (
                                <button
                                    onClick={() => handleAction(a.id, "confirmed")}
                                    disabled={actionLoading === a.id}
                                    className="flex-1 rounded-lg bg-sky-50 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"
                                >
                                    確認
                                </button>
                            )}
                            {a.status === "confirmed" && (
                                <button
                                    onClick={() => handleAction(a.id, "completed")}
                                    disabled={actionLoading === a.id}
                                    className="flex-1 rounded-lg bg-emerald-50 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                                >
                                    完成
                                </button>
                            )}
                            {(a.status === "pending" || a.status === "confirmed") && (
                                <button
                                    onClick={() => handleAction(a.id, "cancelled")}
                                    disabled={actionLoading === a.id}
                                    className="flex-1 rounded-lg bg-rose-50 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                                >
                                    取消
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
