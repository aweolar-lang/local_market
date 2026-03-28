import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// The VIP Key that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    // This grabs EVERYONE'S transactions, completely ignoring RLS
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false })
      .limit(100); 

    if (error) throw error;

    return NextResponse.json({ success: true, ledger: data || [] });
  } catch (error: any) {
    console.error("Master Ledger Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}