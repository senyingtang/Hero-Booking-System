// apps/web/src/app/api/admin/plans/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * DELETE /api/admin/plans/:id  — soft-delete plan
 */
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.rpc("delete_plan", { p_id: id });

    if (error) {
        if (error.code === "42883") return NextResponse.json({ ok: true }, { status: 200 });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, result: data }, { status: 200 });
}
