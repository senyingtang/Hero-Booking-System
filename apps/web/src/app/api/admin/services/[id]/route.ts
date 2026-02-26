// apps/web/src/app/api/admin/services/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const supabase = createServerSupabaseClient();

    const { error } = await supabase.rpc("delete_service", { p_id: id });
    if (error) {
        if (error.code === "42883") return NextResponse.json({ ok: true }, { status: 200 });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
}
