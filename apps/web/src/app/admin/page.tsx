// apps/web/src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type TenantRow = {
  id: string;
  name: string;
};

export default function AdminHomePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  const handleLogin = async () => {
    const email = prompt("請輸入登入 Email（要存在於 Supabase Auth）") ?? "";
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      alert("送出登入信失敗: " + error.message);
    } else {
      alert("已送出 magic link，請到信箱點擊登入。");
    }
  };

  const fetchTenants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("kb_tenants")
      .select("id, name")
      .limit(20);

    if (error) {
      alert("讀取 tenants 失敗: " + error.message);
    } else {
      setTenants(data ?? []);
    }
    setLoading(false);
  };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Hero Booking Admin</h1>

      <div className="space-y-2">
        <p>目前登入 Email：{userEmail ?? "尚未登入"}</p>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white"
          onClick={handleLogin}
        >
          使用 Email magic link 登入
        </button>
      </div>

      <div className="space-y-2">
        <button
          className="px-4 py-2 rounded bg-green-600 text-white"
          onClick={fetchTenants}
          disabled={loading}
        >
          {loading ? "讀取中..." : "讀取我有權限看到的 Tenants"}
        </button>
        <ul className="list-disc pl-6">
          {tenants.map((t) => (
            <li key={t.id}>
              {t.name} ({t.id})
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
