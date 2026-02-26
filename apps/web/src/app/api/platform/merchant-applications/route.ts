import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function createServerClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

export async function GET(_req: NextRequest) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("kb_merchant_applications")
    .select(
      "id, email, shop_name, business_type, industry, phone, address, status, reject_reason, created_at, reviewed_at, reviewed_by"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ applications: data }, { status: 200 });
}
