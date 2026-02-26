// apps/web/src/components/auth/RegisterForm.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Status = "idle" | "registering" | "success" | "error";

type RegisterFormProps = {
    onRegisterSuccess?: (email: string, shopName: string) => void;
};

export default function RegisterForm({ onRegisterSuccess }: RegisterFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [shopName, setShopName] = useState("");
    const [agree, setAgree] = useState(false);
    const [status, setStatus] = useState<Status>("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const callbackUrl =
        typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : "/auth/callback";

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        // 驗證
        if (password.length < 6) {
            setErrorMsg("密碼長度至少 6 個字元。");
            setStatus("error");
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg("兩次輸入的密碼不一致，請重新確認。");
            setStatus("error");
            return;
        }
        if (!agree) {
            setErrorMsg("請先同意服務條款。");
            setStatus("error");
            return;
        }

        setStatus("registering");

        const { error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                emailRedirectTo: callbackUrl,
                data: { shop_name: shopName.trim() },
            },
        });

        if (error) {
            setStatus("error");
            if (error.message.includes("already registered")) {
                setErrorMsg("此 Email 已註冊，請直接登入或使用其他 Email。");
            } else {
                setErrorMsg(error.message);
            }
            return;
        }

        setStatus("success");
        if (onRegisterSuccess) {
            onRegisterSuccess(email.trim(), shopName.trim());
        }
    };

    /* ── Success state ── */
    if (status === "success") {
        return (
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <span className="text-2xl">✅</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">註冊成功！</h2>
                <p className="mt-2 text-sm text-slate-500">
                    我們已寄送驗證信至{" "}
                    <strong className="text-slate-700">{email}</strong>
                    ，請至信箱點擊驗證連結。
                </p>
                <p className="mt-3 text-xs text-slate-400">
                    驗證完成後即可登入並提交商家申請。
                </p>
                <Link
                    href="/login"
                    className="mt-5 inline-block text-sm text-indigo-600 hover:underline"
                >
                    ← 前往登入
                </Link>
            </div>
        );
    }

    /* ── Form ── */
    return (
        <form onSubmit={handleRegister} className="space-y-4">
            {/* Shop Name */}
            <div>
                <label htmlFor="reg-shop" className="block text-sm font-medium text-slate-700">
                    商家名稱
                </label>
                <input
                    id="reg-shop"
                    type="text"
                    required
                    placeholder="例：Amy Hair Studio"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="mt-1 text-xs text-slate-400">
                    此名稱將用於後續商家申請表單
                </p>
            </div>

            {/* Email */}
            <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700">
                    Email
                </label>
                <input
                    id="reg-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
            </div>

            {/* Password */}
            <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700">
                    密碼
                </label>
                <input
                    id="reg-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="至少 6 個字元"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
            </div>

            {/* Confirm Password */}
            <div>
                <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-700">
                    確認密碼
                </label>
                <input
                    id="reg-confirm"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="再輸入一次密碼"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
            </div>

            {/* Agree TOS */}
            <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-600">
                    我已閱讀並同意{" "}
                    <a href="#" className="text-indigo-600 hover:underline">
                        服務條款
                    </a>{" "}
                    與{" "}
                    <a href="#" className="text-indigo-600 hover:underline">
                        隱私權政策
                    </a>
                </span>
            </label>

            {/* Error */}
            {status === "error" && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                    {errorMsg}
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={status === "registering"}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
                {status === "registering" ? "註冊中…" : "🚀 建立帳號"}
            </button>

            {/* Login link */}
            <div className="border-t border-slate-100 pt-4 text-center">
                <Link
                    href="/login"
                    className="text-sm text-indigo-600 hover:underline"
                >
                    已有帳號？登入 →
                </Link>
            </div>
        </form>
    );
}
