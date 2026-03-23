import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 1. USE THE ADMIN CLIENT TO BYPASS RLS!
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // 2. GET THE EXACT WITHDRAWAL ID FROM THE URL (No guessing!)
    const url = new URL(req.url);
    const withdrawalId = url.searchParams.get('w_id');

    const payload = await req.json();
    const result = payload?.Result;
    
    if (!result) return NextResponse.json({ success: true }); 

    const isSuccess = result.ResultCode === 0;

    if (!withdrawalId) {
      console.error("No withdrawal ID provided in URL");
      return NextResponse.json({ success: true });
    }

    // 3. FETCH EXACT RECORD USING ADMIN CLIENT
    const { data: pendingWithdrawal } = await supabaseAdmin
      .from('withdrawals2')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (!pendingWithdrawal) {
      return NextResponse.json({ success: true, message: "No matching record found" });
    }

    if (isSuccess) {
      // 4. UPDATE TO COMPLETED USING ADMIN CLIENT
      await supabaseAdmin
        .from('withdrawals2')
        .update({ 
          status: 'completed', 
          processed_at: new Date().toISOString() 
        })
        .eq('id', pendingWithdrawal.id);

    } else {
      // 5. YOUR AWESOME REFUND LOGIC (Now using Admin Client)
      await supabaseAdmin
        .from('withdrawals2')
        .update({ 
          status: 'failed', 
          processed_at: new Date().toISOString() 
        })
        .eq('id', pendingWithdrawal.id);

      await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: pendingWithdrawal.user_id,
          amount: pendingWithdrawal.amount,
          transaction_type: 'refund',
          description: `Refund: Transfer Failed - ${result.ResultDesc}`
        });

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
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("B2C Webhook Error:", error);
    return NextResponse.json({ success: true });
  }
}