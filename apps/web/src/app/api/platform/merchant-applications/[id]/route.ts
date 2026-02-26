// apps/web/src/app/api/platform/merchant-applications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
        .from("kb_merchant_applications")
        .select(
            "id, email, shop_name, business_type, industry, phone, address, status, reject_reason, created_at, reviewed_at, reviewed_by, owner_auth_user_id"
        )
        .eq("id", id)
        .single();

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: error.code === "PGRST116" ? 404 : 500 }
        );
    }

    return NextResponse.json({ application: data }, { status: 200 });
}
