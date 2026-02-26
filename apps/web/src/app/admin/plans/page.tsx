// apps/web/src/app/admin/plans/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";

type Plan = {
    id: string;
    code: string;
    name: string;
    price: number;
    period: string;
    max_staff: number;
    features: string[];
    status: string;
    sort_order: number;
};

const emptyForm: Omit<Plan, "id"> = {
    code: "",
    name: "",
    price: 0,
    period: "monthly",
    max_staff: 1,
    features: [],
    status: "active",
    sort_order: 0,
};

const periodLabels: Record<string, string> = { monthly: "月繳", yearly: "年繳" };

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [featuresText, setFeaturesText] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/plans");
            if (res.ok) {
                const body = await res.json();
                setPlans(body.plans ?? []);
            }
        } catch { /* silent */ } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchPlans(); }, [fetchPlans]);

    const openNew = () => {
        setEditingId(null);
        setForm(emptyForm);
        setFeaturesText("");
        setShowModal(true);
    };
    const openEdit = (p: Plan) => {
        setEditingId(p.id);
        setForm({
            code: p.code,
            name: p.name,
            price: p.price,
            period: p.period,
            max_staff: p.max_staff,
            features: p.features ?? [],
            status: p.status,
            sort_order: p.sort_order,
        });
        setFeaturesText((p.features ?? []).join("\n"));
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch("/api/admin/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    id: editingId,
                    features: featuresText.split("\n").map(f => f.trim()).filter(Boolean),
                }),
            });
            setShowModal(false);
            await fetchPlans();
        } catch { alert("儲存失敗"); } finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("確定要刪除此方案？")) return;
        await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
        await fetchPlans();
    };

    return (
        <div className="mx-auto max-w-6xl space-y-5">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">方案管理</h1>
                    <p className="mt-0.5 text-sm text-slate-500">管理平台訂閱方案與定價</p>
                </div>
                <button onClick={openNew} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">+ 新增方案</button>
            </header>

            {loading ? (
                <div className="py-16 text-center text-sm text-slate-400">載入中…</div>
            ) : plans.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                    <span className="text-4xl">📋</span>
                    <p className="mt-3 text-sm font-medium text-slate-500">尚無方案</p>
                    <button onClick={openNew} className="mt-3 text-sm text-indigo-600 hover:underline">建立第一個方案 →</button>
                </div>
            ) : (
                /* ── DataTable ── */
                <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">代碼</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-600">名稱</th>
                                <th className="px-4 py-3 text-right font-medium text-slate-600">價格</th>
                                <th className="px-4 py-3 text-center font-medium text-slate-600">週期</th>
                                <th className="px-4 py-3 text-center font-medium text-slate-600">員工上限</th>
                                <th className="px-4 py-3 text-center font-medium text-slate-600">狀態</th>
                                <th className="px-4 py-3 text-center font-medium text-slate-600">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {plans.filter(p => p.status !== "deleted").map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.code}</td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                                        {p.price === 0 ? "免費" : `NT$${p.price.toLocaleString()}`}
                                    </td>
                                    <td className="px-4 py-3 text-center text-slate-600">{periodLabels[p.period] ?? p.period}</td>
                                    <td className="px-4 py-3 text-center text-slate-600">
                                        {p.max_staff >= 9999 ? "無限" : p.max_staff}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${p.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                            {p.status === "active" ? "啟用" : p.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => openEdit(p)} className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50">編輯</button>
                                            <button onClick={() => handleDelete(p.id)} className="rounded-md border border-rose-200 px-3 py-1 text-xs text-rose-600 hover:bg-rose-50">刪除</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-slate-900">{editingId ? "編輯方案" : "新增方案"}</h2>
                        <div className="mt-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600">代碼 (code)</label>
                                    <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                                        placeholder="free / pro / enterprise"
                                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600">名稱</label>
                                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600">價格 (NT$)</label>
                                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })}
                                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600">週期</label>
                                    <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}
                                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500">
                                        <option value="monthly">月繳</option>
                                        <option value="yearly">年繳</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600">員工上限</label>
                                    <input type="number" value={form.max_staff} onChange={(e) => setForm({ ...form, max_staff: +e.target.value })}
                                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600">功能特色（每行一項）</label>
                                <textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)}
                                    rows={4} placeholder="基礎預約管理&#10;單一員工&#10;Email 通知"
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600">狀態</label>
                                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500">
                                        <option value="active">啟用</option>
                                        <option value="inactive">停用</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600">排序</label>
                                    <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })}
                                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 flex gap-2">
                            <button onClick={handleSave} disabled={saving || !form.code || !form.name}
                                className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
                                {saving ? "儲存中…" : "儲存"}
                            </button>
                            <button onClick={() => setShowModal(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">取消</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
