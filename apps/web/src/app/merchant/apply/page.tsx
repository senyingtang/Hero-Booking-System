// apps/web/src/app/merchant/apply/page.tsx
"use client";

import { FormEvent, useState } from "react";

type FormState = {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  storeCount: string;
  plan: string;
  note: string;
};

const initialForm: FormState = {
  name: "",
  contactName: "",
  email: "",
  phone: "",
  industry: "",
  storeCount: "",
  plan: "pro",
  note: ""
};

export default function MerchantApplyPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/merchant/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert("送出申請失敗：" + (body.error ?? res.statusText));
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      alert("送出申請時發生錯誤，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-bold text-slate-900">
            申請已送出
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            感謝你申請使用 Hero Booking，我們會在 1～2 個工作天內審核，
            並以 Email 通知你後續啟用流程。
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900">
          申請成為 Hero Booking 商家
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          填寫以下資料，我們會聯絡你完成啟用、金流串接與後台設定。
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <div>
            <label className="block text-xs font-medium text-slate-700">
              商家 / 品牌名稱
            </label>
            <input
              name="name"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                主要聯絡人姓名
              </label>
              <input
                name="contactName"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={form.contactName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                聯絡電話
              </label>
              <input
                name="phone"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              聯絡 Email
            </label>
            <input
              type="email"
              name="email"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                產業類別
              </label>
              <select
                name="industry"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={form.industry}
                onChange={handleChange}
                required
              >
                <option value="">請選擇</option>
                <option value="fitness">健身房 / 工作室</option>
                <option value="beauty">美容 / SPA</option>
                <option value="hair">美髮 / 頭皮</option>
                <option value="yoga">瑜珈 / 身心靈</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                預計門市數量
              </label>
              <input
                name="storeCount"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={form.storeCount}
                onChange={handleChange}
                placeholder="例如：1、3、10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              想使用的方案
            </label>
            <select
              name="plan"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={form.plan}
              onChange={handleChange}
            >
              <option value="basic">Basic</option>
              <option value="pro">Pro（預設）</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              備註（選填）
            </label>
            <textarea
              name="note"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              rows={3}
              value={form.note}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
            disabled={submitting}
          >
            {submitting ? "送出中..." : "送出商家申請"}
          </button>
        </form>
      </div>
    </main>
  );
}
