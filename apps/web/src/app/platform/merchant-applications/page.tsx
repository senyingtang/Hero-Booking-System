"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Application = {
  id: string;
  email: string;
  shop_name: string;
  business_type: string | null;
  industry: string;
  phone: string;
  address: string;
  status: "pending" | "approved" | "rejected" | string;
  reject_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
};

function StatusBadge({ status }: { status: Application["status"] }) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rejected: "bg-rose-50 text-rose-700 ring-rose-200"
  };
  const cls =
    map[status] ?? "bg-slate-50 text-slate-700 ring-slate-200";
  const label =
    status === "pending"
      ? "待審核"
      : status === "approved"
        ? "已核准"
        : status === "rejected"
          ? "已退回"
          : status;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${cls}`}
    >
      {label}
    </span>
  );
}

export default function MerchantApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionBusyId, setActionBusyId] = useState<string | null>(
    null
  );

  const loadApps = async () => {
    setLoading(true);
    const res = await fetch("/api/platform/merchant-applications");
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(
        "讀取商家申請失敗：" + (body.error ?? res.statusText)
      );
      setLoading(false);
      return;
    }
    const body = await res.json();
    setApps(body.applications ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadApps();
  }, []);

  const approveApp = async (id: string) => {
    if (!confirm("確定要核准這筆商家申請嗎？")) return;
    setActionBusyId(id);
    const res = await fetch(
      `/api/platform/merchant-applications/${id}/approve`,
      { method: "POST" }
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert("核准失敗：" + (body.error ?? res.statusText));
    } else {
      await loadApps();
    }
    setActionBusyId(null);
  };

  const rejectApp = async (id: string) => {
    const reason =
      prompt("請輸入退回原因（會紀錄在申請紀錄中）：") ?? "";
    if (!reason) return;
    setActionBusyId(id);
    const res = await fetch(
      `/api/platform/merchant-applications/${id}/reject`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      }
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert("退回失敗：" + (body.error ?? res.statusText));
    } else {
      await loadApps();
    }
    setActionBusyId(null);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              商家申請列表
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              檢視並審核所有申請成為 Hero Booking 商家的資料。
            </p>
          </div>
        </header>

        <section className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          {loading ? (
            <p className="py-10 text-center text-xs text-slate-400">
              載入中…
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs text-slate-500">
                <tr>
                  <th className="py-2">商家名稱</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">產業</th>
                  <th className="py-2">電話</th>
                  <th className="py-2">狀態</th>
                  <th className="py-2">申請日期</th>
                  <th className="py-2 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-slate-100"
                  >
                    <td className="py-2 text-slate-900">
                      {app.shop_name}
                    </td>
                    <td className="py-2 text-slate-500">
                      {app.email}
                    </td>
                    <td className="py-2 text-slate-500">
                      {app.industry}
                    </td>
                    <td className="py-2 text-slate-500">
                      {app.phone}
                    </td>
                    <td className="py-2">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-2 text-slate-500">
                      {app.created_at
                        ? new Date(
                          app.created_at
                        ).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-2 text-right">
                      <div className="inline-flex gap-2">
                        <Link
                          href={`/platform/merchant-applications/${app.id}`}
                          className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          查看
                        </Link>
                        {app.status === "pending" && (
                          <>
                            <button
                              className="rounded-md border border-emerald-300 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
                              onClick={() => approveApp(app.id)}
                              disabled={actionBusyId === app.id}
                            >
                              {actionBusyId === app.id
                                ? "處理中..."
                                : "核准"}
                            </button>
                            <button
                              className="rounded-md border border-rose-300 px-3 py-1 text-xs text-rose-700 hover:bg-rose-50"
                              onClick={() => rejectApp(app.id)}
                              disabled={actionBusyId === app.id}
                            >
                              退回
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && apps.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-4 text-center text-xs text-slate-400"
                    >
                      目前沒有任何商家申請。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
