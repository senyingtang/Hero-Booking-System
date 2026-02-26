import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function createServerClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

/**
 * POST /api/platform/merchant-applications/:id/approve
 * 呼叫 RPC approve_merchant_application，成功後回傳 merchant_id + tenant_id
 */
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = createServerClient();

  const { error } = await supabase.rpc("approve_merchant_application", {
    p_app_id: id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // RPC 成功後，查回關聯的 merchant & tenant
  const { data: merchant } = await supabase
    .from("kb_merchants")
    .select("id")
    .eq(
      "owner_auth_user_id",
      (
        await supabase
          .from("kb_merchant_applications")
          .select("owner_auth_user_id")
          .eq("id", id)
          .single()
      ).data?.owner_auth_user_id ?? ""
    )
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const merchantId = merchant?.id ?? null;

  let tenantId: string | null = null;
  if (merchantId) {
    const { data: tenant } = await supabase
      .from("kb_tenants")
      .select("id")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    tenantId = tenant?.id ?? null;
  }

  return NextResponse.json(
    { ok: true, merchant_id: merchantId, tenant_id: tenantId },
    { status: 200 }
  );
}
