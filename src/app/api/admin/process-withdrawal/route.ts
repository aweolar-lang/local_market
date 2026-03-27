import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { withdrawalId, action, reason } = await req.json();

    if (!withdrawalId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid request parameters" }, { status: 400 });
    }

    // 1. Fetch the exact pending withdrawal
    const { data: pendingWithdrawal } = await supabaseAdmin
      .from('withdrawals2')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (!pendingWithdrawal || pendingWithdrawal.status !== 'processing') {
      return NextResponse.json({ success: false, error: "Record not found or already processed" }, { status: 400 });
    }

    if (action === 'approve') {
      // 2. Mark as Completed (Admin already sent the M-Pesa manually)
      await supabaseAdmin
        .from('withdrawals2')
        .update({ 
          status: 'completed', 
          processed_at: new Date().toISOString() 
        })
        .eq('id', pendingWithdrawal.id);

      return NextResponse.json({ success: true, message: "Marked as Paid" });
    }

    if (action === 'reject') {
      // 3. Mark as Failed & Run the Awesome Refund Logic
      await supabaseAdmin
        .from('withdrawals2')
        .update({ 
          status: 'failed', 
          processed_at: new Date().toISOString() 
        })
        .eq('id', pendingWithdrawal.id);

      // Refund the Ledger
      await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: pendingWithdrawal.user_id,
          amount: pendingWithdrawal.amount,
          transaction_type: 'refund',
          description: `Refund: ${reason || 'Admin Rejected'}`
        });

      // Credit the Wallet Balance safely
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('wallet_balance')
        .eq('id', pendingWithdrawal.user_id)
        .single();
        
      if (profile) {
        await supabaseAdmin
          .from('profiles')
          .update({ wallet_balance: Number(profile.wallet_balance) + Number(pendingWithdrawal.amount) })
          .eq('id', pendingWithdrawal.user_id);
      }

      return NextResponse.json({ success: true, message: "Refunded Successfully" });
    }

  } catch (error) {
    console.error("Admin Process Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}