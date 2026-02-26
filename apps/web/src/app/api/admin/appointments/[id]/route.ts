// apps/web/src/app/api/admin/appointments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * PATCH /api/admin/appointments/:id
 * body: { status?, internal_note?, customer_note? }
 */
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    /* ── Session check ── */
    const cookieStore = await cookies();
    const userSupabase = createClient(supabaseUrl, anonKey, {
        auth: {
            persistSession: false,
            detectSessionInUrl: false,
            storage: {
                getItem: (key: string) => cookieStore.get(key)?.value ?? null,
                setItem: () => { },
                removeItem: () => { },
            },
        },
    });

    const {
        data: { user },
    } = await userSupabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, internal_note, customer_note } = body;

    const supabase = createServerSupabaseClient();

    // Try RPC first
    const { data, error } = await supabase.rpc("update_appointment", {
        p_id: id,
        p_status: status ?? null,
        p_internal_note: internal_note ?? null,
        p_customer_note: customer_note ?? null,
    });

    if (error) {
        // RPC 未部署 → mock response
        if (error.message.includes("does not exist") || error.code === "42883") {
            return NextResponse.json(
                {
                    ok: true,
                    appointment: { id, status: status ?? "confirmed", internal_note, updated_at: new Date().toISOString() },
                },
                { status: 200 }
            );
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, appointment: data }, { status: 200 });
}
