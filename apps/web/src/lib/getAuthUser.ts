// apps/web/src/lib/getAuthUser.ts
// 從 Authorization header 取得 Supabase auth user
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * 從 request 的 Authorization: Bearer <token> header 取得 user
 * 適用於 API route handlers
 */
export async function getAuthUser(req: NextRequest) {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
        return { user: null, error: "No token provided" };
    }

    const supabase = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(token);

    return { user, error: error?.message ?? null };
}
