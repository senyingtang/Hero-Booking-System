// apps/web/src/components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Mode = "magic" | "password";
type Status = "idle" | "sending" | "sent" | "logging-in" | "redirecting" | "error";

type LoginFormProps = {
    onLoginSuccess?: () => Promise<void>;
};

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
    const [mode, setMode] = useState<Mode>("magic");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const callbackUrl =
        typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : "/auth/callback";

    /* ── Magic Link ── */
    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setStatus("sending");
        setErrorMsg("");

        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: { emailRedirectTo: callbackUrl },
        });

        if (error) {
            setStatus("error");
            setErrorMsg(error.message);
        } else {
            setStatus("sent");
        }
    };

    /* ── Password Login ── */
    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password) return;
        setStatus("logging-in");
        setErrorMsg("");

        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        if (error) {
            setStatus("error");
            if (error.message.includes("Invalid login")) {
                setErrorMsg("Email 或密碼錯誤，請重新輸入。");
            } else if (error.message.includes("Email not confirmed")) {
                setErrorMsg("此帳號尚未驗證 Email，請至信箱點擊驗證連結。");
            } else {
                setErrorMsg(error.message);
            }
            return;
        }

        setStatus("redirecting");
        if (onLoginSuccess) {
            await onLoginSuccess();
        }
    };

    /* ── Sent state ── */
    if (status === "sent") {
        return (
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100/80">
                    <span className="text-2xl">📧</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">登入連結已寄出</h2>
                <p className="mt-2 text-sm text-slate-500">
                    已將 Magic Link 寄至{" "}
                    <strong className="text-slate-700">{email}</strong>
                    ，請至信箱點擊連結完成登入。
                </p>
                <p className="mt-3 text-xs text-slate-400">
                    若未收到，請檢查垃圾郵件夾。
                </p>
                <button
                    onClick={() => {
                        setStatus("idle");
                        setEmail("");
                    }}
                    className="mt-5 text-sm text-indigo-600 hover:underline"
                >
                    ← 使用其他 Email
                </button>
            </div>
        );
    }

    /* ── Redirecting state ── */
    if (status === "redirecting") {
        return (
            <div className="text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">登入成功</h2>
                <p className="mt-1 text-sm text-slate-500">正在為您跳轉…</p>
            </div>
        );
    }

    /* ── Main Form ── */
    return (
        <div>
            {/* Mode Tabs */}
            <div className="flex rounded-lg bg-slate-100 p-1">
                <button
                    type="button"
                    onClick={() => setMode("magic")}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${mode === "magic"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    Magic Link
                </button>
                <button
                    type="button"
                    onClick={() => setMode("password")}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${mode === "password"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    密碼登入
                </button>
            </div>

            {/* Form */}
            <form
                onSubmit={mode === "magic" ? handleMagicLink : handlePasswordLogin}
                className="mt-5 space-y-4"
            >
                {/* Email */}
                <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">
                        Email
                    </label>
                    <input
                        id="login-email"
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
                {mode === "password" && (
                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                                密碼
                            </label>
                            <button
                                type="button"
                                onClick={() => setMode("magic")}
                                className="text-xs text-indigo-600 hover:underline"
                            >
                                忘記密碼？用 Magic Link
                            </button>
                        </div>
                        <input
                            id="login-password"
                            type="password"
                            required
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                )}

                {/* Error */}
                {status === "error" && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                        {errorMsg}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={status === "sending" || status === "logging-in"}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {status === "sending"
                        ? "寄送中…"
                        : status === "logging-in"
                            ? "登入中…"
                            : mode === "magic"
                                ? "📧 寄送 Magic Link"
                                : "🔐 使用密碼登入"}
                </button>
            </form>

            {/* Hint */}
            <p className="mt-4 text-center text-xs text-slate-400">
                {mode === "magic"
                    ? "我們會寄一封含有登入連結的信到您的信箱，無需密碼。"
                    : "使用您註冊時設定的密碼登入。"}
            </p>

            {/* Register link */}
            <div className="mt-4 border-t border-slate-100 pt-4 text-center">
                <Link
                    href="/register"
                    className="text-sm text-indigo-600 hover:underline"
                >
                    尚未有帳號？註冊新帳號 →
                </Link>
            </div>
        </div>
    );
}
