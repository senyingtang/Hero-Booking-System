// apps/web/src/components/layout/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/", label: "首頁" },
    { href: "/pricing", label: "方案定價" },
    { href: "/merchant/apply", label: "成為商家" },
];

export default function Header() {
    const pathname = usePathname();

    // 後台頁面不顯示公開 Header
    if (
        pathname.startsWith("/platform") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/console")
    ) {
        return null;
    }

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                        H
                    </div>
                    <span className="text-lg font-bold text-slate-900">Hero Booking</span>
                </Link>

                {/* Nav */}
                <nav className="hidden items-center gap-1 md:flex">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === item.href
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* CTA */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/login"
                        className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        登入
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                    >
                        免費註冊
                    </Link>
                </div>

                {/* Mobile hamburger */}
                <MobileMenu pathname={pathname} />
            </div>
        </header>
    );
}

function MobileMenu({ pathname }: { pathname: string }) {
    return (
        <div className="md:hidden">
            <details className="group relative">
                <summary className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-100 list-none">
                    <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </summary>
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-200">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`block rounded-lg px-3 py-2 text-sm ${pathname === item.href
                                    ? "bg-indigo-50 text-indigo-700 font-medium"
                                    : "text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <hr className="my-2 border-slate-100" />
                    <Link href="/login" className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                        登入
                    </Link>
                    <Link href="/register" className="block rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700">
                        免費註冊
                    </Link>
                </div>
            </details>
        </div>
    );
}
