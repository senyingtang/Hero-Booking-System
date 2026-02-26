// apps/web/src/app/platform/page.tsx
"use client";

import React from "react";

const stats = [
  { label: "商家總數", value: "128" },
  { label: "店面總數", value: "342" },
  { label: "Active 訂閱數", value: "287" },
  { label: "本月平台收入 (NT$)", value: "425,600" }
];

const recentEvents = [
  {
    id: "sub_1",
    merchant: "Hero Fitness",
    action: "新開通",
    plan: "Pro 年約",
    date: "2026-02-22"
  },
  {
    id: "sub_2",
    merchant: "Blue SPA",
    action: "升級",
    plan: "Enterprise",
    date: "2026-02-22"
  },
  {
    id: "sub_3",
    merchant: "Yoga Club",
    action: "取消",
    plan: "Basic 月付",
    date: "2026-02-21"
  }
];

const pendingMerchants = [
  { id: "m_1", name: "Sun Hair Salon", appliedAt: "2026-02-21" },
  { id: "m_2", name: "Happy Nails", appliedAt: "2026-02-20" }
];

export default function PlatformHomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              平台儀表板
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              檢視整個 Hero Booking 平台的商家與訂閱狀況。
            </p>
          </div>
          <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            匯出本月報表
          </button>
        </header>

        {/* 統計卡片 */}
        <section className="mb-8 grid gap-4 md:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200"
            >
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {item.value}
              </p>
            </div>
          ))}
        </section>

        {/* 中間兩欄：假圖表 + 最近事件 */}
        <section className="mb-8 grid gap-6 md:grid-cols-3">
          {/* 假圖表區（可之後換成真正圖表） */}
          <div className="md:col-span-2 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                最近 30 天訂閱收入（示意）
              </h2>
              <span className="text-xs text-slate-400">
                之後可接真實報表 API
              </span>
            </div>
            <div className="flex h-48 items-end gap-2">
              {[40, 60, 30, 80, 55, 70, 90].map((h, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-t bg-indigo-500/70"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* 最近事件 */}
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              最近訂閱事件
            </h2>
            <ul className="space-y-2 text-sm">
              {recentEvents.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {e.merchant}
                    </p>
                    <p className="text-xs text-slate-500">
                      {e.action} · {e.plan}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {e.date}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 待審核商家 */}
        <section className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              待審核商家申請
            </h2>
            <a href="/platform/merchant-applications" className="text-xs font-medium text-indigo-600 hover:underline">
              檢視全部
            </a>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="py-2">商家名稱</th>
                <th className="py-2">申請日期</th>
                <th className="py-2 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {pendingMerchants.map((m) => (
                <tr key={m.id} className="border-b border-slate-100">
                  <td className="py-2 text-slate-900">{m.name}</td>
                  <td className="py-2 text-slate-500">{m.appliedAt}</td>
                  <td className="py-2 text-right">
                    <button className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50">
                      查看
                    </button>
                  </td>
                </tr>
              ))}
              {pendingMerchants.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-4 text-center text-xs text-slate-400"
                  >
                    目前沒有待審核的商家。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
