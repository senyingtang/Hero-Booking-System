// apps/web/src/app/console/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ConsoleLoginPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // 載入目前登入狀態
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  // 寄送 magic link
  const handleLogin = async () => {
    const email =
      prompt("請輸入商家登入 Email（需已存在於 Supabase Auth）") ?? "";
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      alert("送出登入信失敗：" + error.message);
    } else {
      alert("已送出 magic link，請到信箱點擊登入。");
    }
  };

  // 檢查是否有 merchant_admin 角色，並導向 /console
  const goToConsole = async () => {
    setBusy(true);

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      alert("尚未登入，請先透過 Email 登入。");
      setBusy(false);
      return;
    }

    // 呼叫你已經建立的 route-after-login API，或直接在前端查也可以
    const res = await fetch("/api/route-after-login", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert("取得導向路徑失敗：" + (body.error ?? res.statusText));
      setBusy(false);
      return;
    }

    const body = await res.json();
    const nextPath = body.next as string;

    if (nextPath === "/console") {
      router.push("/console");
    } else {
      alert("此帳號目前沒有商家管理權限（merchant_admin 角色）。");
    }

    setBusy(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-bold text-slate-900">
          商家後台登入
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          這個入口專供商家管理者（merchant admin）使用，登入後將自動導向商家儀表板。
        </p>

        <div className="mt-6 space-y-3">
          <p className="text-sm text-slate-600">
            目前登入 Email：{" "}
            <span className="font-medium">
              {userEmail ?? "尚未登入"}
            </span>
          </p>

          <button
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            onClick={handleLogin}
          >
            使用 Email magic link 登入
          </button>

          <button
            className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={goToConsole}
            disabled={busy}
          >
            {busy ? "檢查權限中..." : "登入後進入商家儀表板"}
          </button>
        </div>

        <div className="mt-4 border-t pt-3 text-xs text-slate-400">
          提示：系統會檢查此帳號在 <code>kb_user_roles</code> 中是否擁有{" "}
          <code>merchant_admin</code> 角色，若沒有則無法進入商家後台。
        </div>
      </div>
    </main>
  );
}
