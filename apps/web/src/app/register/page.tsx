// apps/web/src/app/register/page.tsx
"use client";

import { useRouter } from "next/navigation";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
    const router = useRouter();

    const handleRegisterSuccess = (_email: string, shopName: string) => {
        // 5 秒後導向申請表（附帶 shopName query param）
        setTimeout(() => {
            const params = new URLSearchParams({ shop_name: shopName });
            router.push(`/merchant/apply?${params.toString()}`);
        }, 5000);
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-900">
            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md px-4 py-10">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                        <span className="text-2xl font-bold text-white">H</span>
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-white">
                        建立帳號
                    </h1>
                    <p className="mt-1 text-sm text-white/60">
                        註冊成為 Hero Booking 商家
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm ring-1 ring-white/20">
                    <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-white/40">
                    © 2025 Hero Booking. All rights reserved.
                </p>
            </div>
        </main>
    );
}
