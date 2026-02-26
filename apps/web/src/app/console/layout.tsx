import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function ConsoleLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar scope="tenant" />
            <main className="flex-1">{children}</main>
        </div>
    );
}
