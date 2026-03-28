import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// The VIP Key that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Prevent Next.js from aggressively caching this route!
export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("withdrawals2")
      .select("*, profiles(phone_number, username)")
      .eq("status", "processing")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, withdrawals: data || [] });
  } catch (error: any) {
    console.error("Fetch Withdrawals Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}