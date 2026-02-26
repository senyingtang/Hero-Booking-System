// apps/web/src/components/layout/Footer.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Footer() {
    const pathname = usePathname();

    // 後台頁面不顯示公開 Footer
    if (
        pathname.startsWith("/platform") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/console")
    ) {
        return null;
    }

    return (
        <footer className="border-t border-slate-200 bg-slate-50">
            <div className="mx-auto max-w-6xl px-4 py-10">
                <div className="grid gap-8 sm:grid-cols-3">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                                H
                            </div>
                            <span className="font-bold text-slate-900">Hero Booking</span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                            專為台灣美容美髮產業打造的智慧預約管理平台
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">產品</h4>
                        <div className="mt-3 space-y-2">
                            <Link href="/pricing" className="block text-sm text-slate-600 hover:text-indigo-600">方案定價</Link>
                            <Link href="/merchant/apply" className="block text-sm text-slate-600 hover:text-indigo-600">申請成為商家</Link>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">聯絡我們</h4>
                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                            <p>📧 support@herobooking.com</p>
                            <p>📱 LINE: @herobooking</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} Hero Booking. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
