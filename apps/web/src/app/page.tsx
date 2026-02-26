// apps/web/src/app/page.tsx
"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero 區 */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 md:flex-row md:items-center">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Hero Booking
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              多門市預約與會員管理，一套平台搞定
            </h1>
            <p className="mt-4 text-sm text-slate-600 md:text-base">
              Hero Booking 專為健身房、美容、美髮、瑜珈等預約型店家打造，
              幫你管理預約、排班、金流與訂閱，支援多門市與多租戶。
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/store/demo-tenant"
                className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
              >
                我要預約服務（Demo）
              </Link>
              <Link
                href="/pricing"
                className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                我要使用此系統（商家）
              </Link>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              支援多商家、多門市、各別金流設定與訂閱收款。
            </p>
          </div>

          <div className="flex-1 rounded-xl bg-slate-900 p-5 text-slate-50 shadow-lg">
            <p className="text-sm font-semibold">示意：今日預約總覽</p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-lg bg-slate-800 p-3">
                <p className="text-slate-400">今日預約</p>
                <p className="mt-1 text-xl font-semibold">128</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-3">
                <p className="text-slate-400">已完成</p>
                <p className="mt-1 text-xl font-semibold">82</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-3">
                <p className="text-slate-400">未到 / 取消</p>
                <p className="mt-1 text-xl font-semibold">6</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-3">
                <p className="text-slate-400">本月訂閱收入</p>
                <p className="mt-1 text-xl font-semibold">NT$ 420,000</p>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-slate-400">
              實際畫面會依各商家與門市即時更新。
            </p>
          </div>
        </div>
      </section>

      {/* 功能區 */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-center text-xl font-bold text-slate-900">
          為預約型門市設計的完整解決方案
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          不論你是單店工作室還是連鎖品牌，都能用 Hero Booking 建立專屬的預約流程。
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-900">
              多門市 / 多租戶
            </p>
            <p className="mt-2 text-xs text-slate-600">
              一套平台管理多個商家與門市，每個商家有自己的資料與金流設定。
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-900">
              線上預約與排班
            </p>
            <p className="mt-2 text-xs text-slate-600">
              顧客線上預約、門市排班與場地安排，支援手機與桌機使用。
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-900">
              訂閱制金流收款
            </p>
            <p className="mt-2 text-xs text-slate-600">
              整合金流（如綠界 ECPay），支援月費、年費與多種方案組合。
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-900">
              報表與推薦制度
            </p>
            <p className="mt-2 text-xs text-slate-600">
              內建營收報表與推薦／折抵機制，幫助你推廣會員與分析成效。
            </p>
          </div>
        </div>
      </section>

      {/* CTA 區 */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              準備好讓門市升級成線上預約了嗎？
            </p>
            <p className="mt-1 text-xs text-slate-500">
              立即填寫商家申請，我們會協助你完成啟用與串接金流。
            </p>
          </div>
          <Link
            href="/merchant/apply"
            className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            申請成為商家
          </Link>
        </div>
      </section>
    </main>
  );
}
