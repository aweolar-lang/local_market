import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
   
    const result = payload?.Result;
    if (!result) return NextResponse.json({ success: true }); 

    const isSuccess = result.ResultCode === 0;
    
   
    const resultParameters = result.ResultParameters?.ResultParameter || [];
    const amountParam = resultParameters.find((p: any) => p.Key === 'TransactionAmount');
    const amount = amountParam ? Number(amountParam.Value) : 0;


    const { data: pendingWithdrawal } = await supabase
      .from('withdrawals2')
      .select('*')
      .eq('status', 'processing')
      .eq('amount', amount)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (!pendingWithdrawal) {
      return NextResponse.json({ success: true, message: "No matching record found" });
    }

    if (isSuccess) {
   
      await supabase
        .from('withdrawals2')
        .update({ 
          status: 'completed', 
          processed_at: new Date().toISOString() 
        })
        .eq('id', pendingWithdrawal.id);

    } else {
     
      await supabase
        .from('withdrawals2')
        .update({ 
          status: 'failed', 
          processed_at: new Date().toISOString() 
        })
        .eq('id', pendingWithdrawal.id);

      await supabase
        .from('transactions')
        .insert({
          user_id: pendingWithdrawal.user_id,
          amount: amount,
          transaction_type: 'refund',
          description: `Refund: Transfer Failed - ${result.ResultDesc}`
        });

    
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', pendingWithdrawal.user_id)
        .single();
        
      if (profile) {
        await supabase
          .from('profiles')
          .update({ wallet_balance: Number(profile.wallet_balance) + amount })
          .eq('id', pendingWithdrawal.user_id);
      }
    }


    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("B2C Webhook Error:", error);
   
    return NextResponse.json({ success: true });
  }
}