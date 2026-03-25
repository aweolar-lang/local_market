import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const mySecretChallenge = process.env.INTASEND_WEBHOOK_CHALLENGE; 
    if (body.challenge !== mySecretChallenge) {
      return NextResponse.json({ status: "Unauthorized" }, { status: 401 });
    }

    const state = body.state;
    const withdrawalId = body.api_ref; 
    const failureReason = body.failed_reason || "Transfer Failed";

    if (!withdrawalId) {
      return NextResponse.json({ status: "Ignored: No api_ref provided" });
    }

    const { data: pendingWithdrawal } = await supabaseAdmin
      .from('withdrawals2')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (!pendingWithdrawal || pendingWithdrawal.status !== 'processing') {
      return NextResponse.json({ status: "Record not found or already processed" });
    }

    if (state === 'COMPLETE') {
      await supabaseAdmin
        .from('withdrawals2')
        .update({ 
          status: 'completed', 
          processed_at: new Date().toISOString() 
        })
        .eq('id', pendingWithdrawal.id);
        
      return NextResponse.json({ status: "Processed Success" });
    }

    if (state === 'FAILED') {
      // Mark as failed
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
          description: `Refund: ${failureReason}`
        });

      // Credit the Wallet Balance
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

      return NextResponse.json({ status: "Processed Refund" });
    }

    return NextResponse.json({ status: "Webhook received" });

  } catch (error) {
    console.error("IntaSend B2C Webhook Error:");
    return NextResponse.json({ status: "Error caught safely" });
  }
}