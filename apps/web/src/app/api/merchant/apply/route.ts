import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function createServerClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();

  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { error: "invalid_body" },
      { status: 400 }
    );
  }

  const {
    name,
    contactName,
    email,
    phone,
    industry,
    storeCount,
    plan,
    note
  } = body as {
    name: string;
    contactName: string;
    email: string;
    phone: string;
    industry: string;
    storeCount: string;
    plan: string;
    note?: string;
  };

  if (!name || !email || !phone || !industry) {
    return NextResponse.json(
      { error: "missing_required_fields" },
      { status: 400 }
    );
  }

  // 依照 kb_merchant_applications 的實際欄位寫入
  const { data, error } = await supabase
    .from("kb_merchant_applications")
    .insert({
      email,                      // 必填
      shop_name: name,            // 商家名稱
      business_type: contactName, // 先暫存聯絡人或店型描述
      industry,                   // 產業
      phone,                      // 電話
      address: `待補：預計門市數 ${storeCount}／方案 ${plan}／備註：${note ?? ""}`,
      status: "pending"
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id }, { status: 200 });
}
