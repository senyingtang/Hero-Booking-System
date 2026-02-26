// apps/web/src/app/admin/services/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useTenant } from "@/components/providers/TenantProvider";

type Service = {
    id: string;
    name: string;
    description: string | null;
    duration_minutes: number;
    price: number;
    status: string;
    sort_order: number;
};

const emptyForm: Omit<Service, "id"> = {
    name: "",
    description: "",
    duration_minutes: 60,
    price: 0,
    status: "active",
    sort_order: 0,
};

export default function ServicesPage() {
    const { tenantId } = useTenant();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const fetchServices = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/services?tenant_id=${tenantId}`);
            if (res.ok) {
                const body = await res.json();
                setServices(body.services ?? []);
            }
        } catch { /* silent */ } finally { setLoading(false); }
    }, [tenantId]);

    useEffect(() => { fetchServices(); }, [fetchServices]);

    const openNew = () => { setEditingId(null); setForm(emptyForm); setShowModal(true); };
    const openEdit = (s: Service) => {
        setEditingId(s.id);
        setForm({ name: s.name, description: s.description ?? "", duration_minutes: s.duration_minutes, price: s.price, status: s.status, sort_order: s.sort_order });
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch("/api/admin/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, id: editingId, tenant_id: tenantId }),
            });
            setShowModal(false);
            await fetchServices();
        } catch { alert("儲存失敗"); } finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("確定要刪除此服務項目？")) return;
        await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
        await fetchServices();
    };

    if (!tenantId) return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-sm text-slate-400">無法取得租戶資訊。</p></div>;

    return (
        <div className="mx-auto max-w-5xl space-y-5">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">服務項目</h1>
                    <p className="mt-0.5 text-sm text-slate-500">管理您提供的所有服務項目</p>
                </div>
                <button onClick={openNew} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">+ 新增服務</button>
            </header>

            {loading ? (
                <div className="py-16 text-center text-sm text-slate-400">載入中…</div>
            ) : services.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                    <span className="text-4xl">✂️</span>
                    <p className="mt-3 text-sm font-medium text-slate-500">尚無服務項目</p>
                    <button onClick={openNew} className="mt-3 text-sm text-indigo-600 hover:underline">建立第一個服務 →</button>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {services.filter(s => s.status !== "deleted").map((s) => (
                        <div key={s.id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                            <div className="flex items-start justify-between">
                                <h3 className="font-semibold text-slate-900">{s.name}</h3>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${s.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                    {s.status === "active" ? "啟用" : s.status}
                                </span>
                            </div>
                            {s.description && <p className="mt-1 text-xs text-slate-500 line-clamp-2">{s.description}</p>}
                            <div className="mt-3 flex items-center justify-between text-sm">
                                <span className="text-slate-500">{s.duration_minutes} 分鐘</span>
                                <span className="font-bold text-slate-900">NT${s.price.toLocaleString()}</span>
                            </div>
                            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                                <button onClick={() => openEdit(s)} className="flex-1 rounded-md border border-slate-300 py-1 text-xs text-slate-600 hover:bg-slate-50">編輯</button>
                                <button onClick={() => handleDelete(s.id)} className="rounded-md border border-rose-200 px-3 py-1 text-xs text-rose-600 hover:bg-rose-50">刪除</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-slate-900">{editingId ? "編輯服務" : "新增服務"}</h2>
                        <div className="mt-4 space-y-3">
                            <div><label className="block text-xs font-medium text-slate-600">名稱</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" /></div>
                            <div><label className="block text-xs font-medium text-slate-600">說明</label><textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-xs font-medium text-slate-600">時長（分鐘）</label><input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: +e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" /></div>
                                <div><label className="block text-xs font-medium text-slate-600">價格 (NT$)</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" /></div>
                            </div>
                        </div>
                        <div className="mt-5 flex gap-2">
                            <button onClick={handleSave} disabled={saving || !form.name} className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">{saving ? "儲存中…" : "儲存"}</button>
                            <button onClick={() => setShowModal(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">取消</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
