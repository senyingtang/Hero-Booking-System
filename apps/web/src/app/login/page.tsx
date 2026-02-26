// apps/web/src/app/login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { authFetch } from "@/lib/authFetch";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = async () => {
    // 等 3 秒讓 session 完全建立
    await new Promise((r) => setTimeout(r, 1500));

    try {
      const res = await authFetch("/api/me/roles");
      if (!res.ok) {
        router.replace("/auth/callback");
        return;
      }
      const data = await res.json();
      const roles: { role: string }[] = data.roles ?? [];

      if (roles.some((r) => r.role === "platform_admin")) {
        router.replace("/platform");
      } else if (roles.some((r) => r.role === "merchant_admin")) {
        router.replace("/admin");
      } else {
        router.replace("/auth/callback");
      }
    } catch {
      router.replace("/");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-900">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <span className="text-2xl font-bold text-white">H</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">Hero Booking</h1>
          <p className="mt-1 text-sm text-white/60">
            登入您的管理後台
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm ring-1 ring-white/20">
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-white/40">
          © 2025 Hero Booking. All rights reserved.
        </p>
      </div>
    </main>
  );
}
