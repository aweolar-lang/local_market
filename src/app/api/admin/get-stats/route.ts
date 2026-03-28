import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// The VIP Key that is allowed to look at the super_ledger
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Never cache the master ledger! Always get real-time numbers.
export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("super_ledger")
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Super Ledger Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}