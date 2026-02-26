// apps/web/src/app/api/ecpay/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * POST /api/ecpay/webhook
 * ECPay 付款完成回呼（Server-to-Server）
 *
 * ECPay 會 POST form-urlencoded 資料，主要欄位：
 * - MerchantTradeNo: 商家訂單編號
 * - RtnCode: 1=付款成功
 * - TradeAmt: 交易金額
 * - PaymentDate: 付款日期
 * - SimulatePaid: 0=正式, 1=模擬
 */
export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type") ?? "";
        let body: Record<string, string>;

        if (contentType.includes("application/x-www-form-urlencoded")) {
            const formData = await req.formData();
            body = Object.fromEntries(formData.entries()) as Record<string, string>;
        } else {
            // 支援 JSON（方便測試）
            body = await req.json();
        }

        const merchantTradeNo = body.MerchantTradeNo ?? body.merchant_trade_no;
        const rtnCode = body.RtnCode ?? body.rtn_code;
        const tradeAmt = body.TradeAmt ?? body.trade_amt ?? body.amount;
        const tenantId = body.CustomField1 ?? body.tenant_id;

        if (!merchantTradeNo) {
            return new Response("0|Missing MerchantTradeNo", { status: 400 });
        }

        const isPaid = String(rtnCode) === "1";
        const supabase = createServerSupabaseClient();

        // 1. 寫入 / 更新支付紀錄
        const { error: paymentError } = await supabase.rpc("upsert_payment", {
            p_tenant_id: tenantId ?? "00000000-0000-0000-0000-000000000001",
            p_merchant_trade_no: merchantTradeNo,
            p_amount: Number(tradeAmt) || 0,
            p_payment_method: "ecpay",
            p_status: isPaid ? "paid" : "failed",
            p_ecpay_response: body,
        });

        if (paymentError && paymentError.code !== "42883") {
            console.error("[ECPay Webhook] upsert_payment error:", paymentError);
        }

        // 2. 如果付款成功且有關聯預約，更新預約狀態
        if (isPaid && merchantTradeNo.startsWith("HB")) {
            const { error: appointmentError } = await supabase
                .from("kb_appointments")
                .update({ status: "confirmed" })
                .eq("booking_code", merchantTradeNo);

            if (appointmentError && appointmentError.code !== "42P01") {
                console.error("[ECPay Webhook] appointment update error:", appointmentError);
            }
        }

        // ECPay 期望回應 "1|OK"
        return new Response("1|OK", { status: 200 });
    } catch (err) {
        console.error("[ECPay Webhook] Unexpected error:", err);
        return new Response("0|Error", { status: 500 });
    }
}
