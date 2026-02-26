// apps/web/src/app/console/page.tsx
"use client";

import React from "react";

const overviewCards = [
  { label: "我的店面數", value: "5" },
  { label: "目前方案", value: "Pro · 5 店" },
  { label: "本月總預約數", value: "842" },
  { label: "本月訂閱費用 (NT$)", value: "6,800" }
];

const tenants = [
  {
    id: "t_1",
    name: "Hero Booking - 台北館",
    city: "台北",
    plan: "Pro",
    status: "active",
    renewAt: "2026-03-01"
  },
  {
    id: "t_2",
    name: "Hero Booking - 板橋館",
    city: "新北",
    plan: "Pro",
    status: "active",
    renewAt: "2026-03-01"
  },
  {
    id: "t_3",
    name: "Hero Booking - 高雄館",
    city: "高雄",
    plan: "Basic",
    status: "trialing",
    renewAt: "2026-03-10"
  }
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    trialing: "bg-amber-50 text-amber-700 ring-amber-200",
    suspended: "bg-rose-50 text-rose-700 ring-rose-200"
  };
  const cls = map[status] ?? "bg-slate-50 text-slate-700 ring-slate-200";
  const label =
    status === "active"
      ? "啟用中"
      : status === "trialing"
      ? "試用中"
      : status === "suspended"
      ? "已暫停"
      : status;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cls}`}
    >
      {label}
    </span>
  );
}

export default function ConsoleHomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              商家儀表板
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              檢視旗下所有店面的狀態、訂閱與營運概況。
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/console/settings/payments"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              金流設定
            </a>
            <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
              新增店面
            </button>
          </div>
        </header>

        {/* 概況卡片 */}
        <section className="mb-8 grid gap-4 md:grid-cols-4">
          {overviewCards.map((item) => (
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

        {/* 店面列表 */}
        <section className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              旗下店面
            </h2>
            <button className="text-xs font-medium text-indigo-600 hover:underline">
              管理全部店面
            </button>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="py-2">店名</th>
                <th className="py-2">城市</th>
                <th className="py-2">方案</th>
                <th className="py-2">狀態</th>
                <th className="py-2">下次續約日</th>
                <th className="py-2 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="py-2 text-slate-900">{t.name}</td>
                  <td className="py-2 text-slate-500">{t.city}</td>
                  <td className="py-2 text-slate-500">{t.plan}</td>
                  <td className="py-2">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="py-2 text-slate-500">{t.renewAt}</td>
                  <td className="py-2 text-right">
                    <a
                      href={`/store/${t.id}`}
                      className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      進入門市
                    </a>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-4 text-center text-xs text-slate-400"
                  >
                    尚未建立任何店面，請先新增。
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
