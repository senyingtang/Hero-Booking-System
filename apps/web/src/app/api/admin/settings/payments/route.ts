// apps/web/src/app/api/admin/settings/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * GET /api/admin/settings/payments?merchant_id=xxx
 * PUT /api/admin/settings/payments  { merchant_id, ecpay_merchant_id, ... }
 */
export async function GET(req: NextRequest) {
    const merchantId = req.nextUrl.searchParams.get("merchant_id");
    if (!merchantId) return NextResponse.json({ error: "缺少 merchant_id" }, { status: 400 });

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.rpc("get_payment_settings", { p_merchant_id: merchantId });

    if (error) {
        if (error.code === "42883") {
            return NextResponse.json({
                settings: { ecpay_merchant_id: "", bank_transfer_enabled: false, bank_account_info: "" },
            }, { status: 200 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ settings: data ?? {} }, { status: 200 });
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.rpc("update_payment_settings", {
        p_merchant_id: body.merchant_id,
        p_ecpay_merchant_id: body.ecpay_merchant_id ?? null,
        p_ecpay_hash_key: body.ecpay_hash_key ?? null,
        p_ecpay_hash_iv: body.ecpay_hash_iv ?? null,
        p_line_pay_channel_id: body.line_pay_channel_id ?? null,
        p_line_pay_channel_secret: body.line_pay_channel_secret ?? null,
        p_bank_transfer_enabled: body.bank_transfer_enabled ?? false,
        p_bank_account_info: body.bank_account_info ?? null,
    });

    if (error) {
        if (error.code === "42883") return NextResponse.json({ ok: true }, { status: 200 });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, result: data }, { status: 200 });
}
