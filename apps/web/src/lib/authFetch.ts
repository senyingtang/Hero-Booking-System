// apps/web/src/lib/authFetch.ts
// 用於客戶端 fetch 時自動附帶 Supabase auth token
import { supabase } from "./supabaseClient";

/**
 * 發送帶有 Authorization header 的 fetch 請求
 * 自動從 supabase.auth.getSession() 取得 access_token
 */
export async function authFetch(
    url: string,
    options?: RequestInit
): Promise<Response> {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const headers = new Headers(options?.headers);

    if (session?.access_token) {
        headers.set("Authorization", `Bearer ${session.access_token}`);
    }

    return fetch(url, { ...options, headers });
}
