// apps/web/src/app/store/[tenantId]/page.tsx
"use client";

import React from "react";

type StoreHomePageProps = {
  params: { tenantId: string };
};

const statCards = [
  { label: "今日預約數", value: "32" },
  { label: "已完成", value: "18" },
  { label: "未到 / 取消", value: "3" },
  { label: "今日營收 (NT$)", value: "25,400" }
];

const todayAppointments = [
  {
    id: "a_1",
    time: "10:00",
    customer: "王小明",
    service: "筋膜放鬆 60min",
    staff: "Amber",
    status: "已完成"
  },
  {
    id: "a_2",
    time: "11:30",
    customer: "林嘉欣",
    service: "剪髮＋設計",
    staff: "Kevin",
    status: "進行中"
  },
  {
    id: "a_3",
    time: "13:00",
    customer: "張雅婷",
    service: "瑜珈一對一",
    staff: "Lily",
    status: "已預約"
  }
];

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    已完成: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    進行中: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    已預約: "bg-slate-50 text-slate-700 ring-slate-200",
    取消: "bg-rose-50 text-rose-700 ring-rose-200"
  };
  const cls = map[status] ?? "bg-slate-50 text-slate-700 ring-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cls}`}
    >
      {status}
    </span>
  );
}

export default function StoreHomePage({ params }: StoreHomePageProps) {
  const { tenantId } = params;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              門市今日概況
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Tenant ID：{tenantId}（之後可換成實際店名）
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href={`/store/${tenantId}/schedule`}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              查看排班
            </a>
            <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
              新增預約
            </button>
          </div>
        </header>

        {/* 今日統計卡片 */}
        <section className="mb-8 grid gap-4 md:grid-cols-4">
          {statCards.map((item) => (
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

        <section className="grid gap-6 md:grid-cols-3">
          {/* 今日預約列表 */}
          <div className="md:col-span-2 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                今日預約
              </h2>
              <button className="text-xs font-medium text-indigo-600 hover:underline">
                查看全部
              </button>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs text-slate-500">
                <tr>
                  <th className="py-2">時間</th>
                  <th className="py-2">顧客</th>
                  <th className="py-2">服務</th>
                  <th className="py-2">員工</th>
                  <th className="py-2">狀態</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="py-2 text-slate-900">{a.time}</td>
                    <td className="py-2 text-slate-900">{a.customer}</td>
                    <td className="py-2 text-slate-500">{a.service}</td>
                    <td className="py-2 text-slate-500">{a.staff}</td>
                    <td className="py-2">
                      <StatusPill status={a.status} />
                    </td>
                  </tr>
                ))}
                {todayAppointments.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 text-center text-xs text-slate-400"
                    >
                      今日尚無預約。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 側邊快速區塊 */}
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-2 text-sm font-semibold text-slate-900">
                快速操作
              </h2>
              <div className="space-y-2 text-sm">
                <button className="w-full rounded-md border border-slate-300 px-3 py-2 text-left text-slate-700 hover:bg-slate-50">
                  Walk-in 新增預約
                </button>
                <button className="w-full rounded-md border border-slate-300 px-3 py-2 text-left text-slate-700 hover:bg-slate-50">
                  標記顧客已到店
                </button>
                <button className="w-full rounded-md border border-slate-300 px-3 py-2 text-left text-slate-700 hover:bg-slate-50">
                  查看今日未到 / 取消
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-white p-4 text-sm shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-2 text-sm font-semibold text-slate-900">
                系統提示
              </h2>
              <p className="text-slate-600">
                這裡可以顯示如「本店方案將於 2026-03-01
                到期」等訊息，之後可連到訂閱管理頁。
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
