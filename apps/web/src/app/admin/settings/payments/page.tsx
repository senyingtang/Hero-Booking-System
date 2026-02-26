// apps/web/src/app/admin/settings/payments/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useTenant } from "@/components/providers/TenantProvider";

type PaymentSettings = {
    ecpay_merchant_id: string;
    ecpay_hash_key: string;
    ecpay_hash_iv: string;
    line_pay_channel_id: string;
    line_pay_channel_secret: string;
    bank_transfer_enabled: boolean;
    bank_account_info: string;
};

const defaultSettings: PaymentSettings = {
    ecpay_merchant_id: "",
    ecpay_hash_key: "",
    ecpay_hash_iv: "",
    line_pay_channel_id: "",
    line_pay_channel_secret: "",
    bank_transfer_enabled: false,
    bank_account_info: "",
};

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">{title}</h2>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function TextInput({ label, value, onChange, placeholder, type = "text", hint }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; hint?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-slate-600">{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20" />
            {hint && <p className="mt-1 text-[10px] text-slate-400">{hint}</p>}
        </div>
    );
}

export default function PaymentSettingsPage() {
    const { merchantId } = useTenant();
    const [form, setForm] = useState<PaymentSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const fetchSettings = useCallback(async () => {
        if (!merchantId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/settings/payments?merchant_id=${merchantId}`);
            if (res.ok) {
                const body = await res.json();
                setForm({ ...defaultSettings, ...(body.settings ?? {}) });
            }
        } catch { /* silent */ } finally { setLoading(false); }
    }, [merchantId]);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const handleSave = async () => {
        if (!merchantId) return;
        setSaving(true);
        setSaved(false);
        try {
            const res = await fetch("/api/admin/settings/payments", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, merchant_id: merchantId }),
            });
            if (res.ok) setSaved(true);
            else alert("儲存失敗");
        } catch { alert("儲存失敗"); } finally { setSaving(false); }
    };

    if (!merchantId) return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-sm text-slate-400">無法取得商家資訊。</p></div>;

    if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-sm text-slate-400">載入金流設定中…</p></div>;

    const set = (key: keyof PaymentSettings) => (v: string) => setForm(f => ({ ...f, [key]: v }));

    return (
        <div className="mx-auto max-w-3xl space-y-5">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">金流設定</h1>
                <p className="mt-0.5 text-sm text-slate-500">設定您的收款方式與金流串接</p>
            </header>

            {/* ECPay */}
            <FieldGroup title="🟢 綠界 ECPay">
                <TextInput label="特店編號 (Merchant ID)" value={form.ecpay_merchant_id} onChange={set("ecpay_merchant_id")} placeholder="3002607" />
                <TextInput label="Hash Key" value={form.ecpay_hash_key} onChange={set("ecpay_hash_key")} type="password" hint="⚠️ 正式環境請改用 Supabase Vault 儲存" />
                <TextInput label="Hash IV" value={form.ecpay_hash_iv} onChange={set("ecpay_hash_iv")} type="password" hint="⚠️ 正式環境請改用 Supabase Vault 儲存" />
            </FieldGroup>

            {/* LINE Pay */}
            <FieldGroup title="💚 LINE Pay">
                <TextInput label="Channel ID" value={form.line_pay_channel_id} onChange={set("line_pay_channel_id")} placeholder="1234567890" />
                <TextInput label="Channel Secret" value={form.line_pay_channel_secret} onChange={set("line_pay_channel_secret")} type="password" hint="⚠️ 正式環境請改用 Supabase Vault 儲存" />
            </FieldGroup>

            {/* Bank Transfer */}
            <FieldGroup title="🏦 銀行轉帳">
                <label className="flex cursor-pointer items-center gap-2.5">
                    <input type="checkbox" checked={form.bank_transfer_enabled} onChange={(e) => setForm(f => ({ ...f, bank_transfer_enabled: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-slate-700">啟用銀行轉帳付款</span>
                </label>
                {form.bank_transfer_enabled && (
                    <div>
                        <label className="block text-xs font-medium text-slate-600">帳戶資訊</label>
                        <textarea value={form.bank_account_info} onChange={(e) => setForm(f => ({ ...f, bank_account_info: e.target.value }))}
                            rows={3} placeholder="銀行名稱 + 分行代碼 + 帳號" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                    </div>
                )}
            </FieldGroup>

            {/* Save */}
            <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving} className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50">
                    {saving ? "儲存中…" : "💾 儲存設定"}
                </button>
                {saved && <span className="text-sm text-emerald-600">✅ 已儲存</span>}
            </div>

            {/* Warning */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-800">⚠️ 安全提醒</p>
                <p className="mt-1 text-xs text-amber-700">
                    Hash Key / IV 等敏感資訊不應直接儲存在資料庫。正式環境請改用 Supabase Vault 或環境變數加密儲存。
                </p>
            </div>
        </div>
    );
}
