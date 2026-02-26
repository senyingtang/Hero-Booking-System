import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function createServerClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = createServerClient();

  const body = await req.json().catch(() => null);
  const reason = body?.reason as string | undefined;

  const { data, error } = await supabase
    .from("kb_merchant_applications")
    .update({
      status: "rejected",
      reject_reason: reason ?? "",
      reviewed_at: new Date().toISOString()
      // reviewed_by 之後可接 platform_admin 的 user_id
    })
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "not_found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ id: data.id }, { status: 200 });
}
