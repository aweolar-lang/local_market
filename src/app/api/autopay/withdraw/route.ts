import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, amount } = await req.json();

    if (!userId || !amount || amount < 150) {
      return NextResponse.json({ success: false, error: "Minimum withdrawal is Ksh 150" }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('phone_number, wallet_balance, is_affiliate')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.phone_number || !profile.is_affiliate) {
      return NextResponse.json({ success: false, error: "Invalid account or missing phone number." }, { status: 400 });
    }

    let targetPhone = profile.phone_number.trim();
    if (targetPhone.startsWith('+')) targetPhone = targetPhone.slice(1);
    if (targetPhone.startsWith('0')) targetPhone = `254${targetPhone.slice(1)}`;

    const { data: ledgerEntries } = await supabaseAdmin
      .from('transactions')
      .select('amount')
      .eq('user_id', userId);

    const trueBalance = ledgerEntries?.reduce((sum, txn) => sum + Number(txn.amount), 0) || 0;

    if (trueBalance < amount || profile.wallet_balance < amount) {
      return NextResponse.json({ 
        success: false, 
        error: `Insufficient funds. Your true verified balance is Ksh ${trueBalance}` 
      }, { status: 400 });
    }

    const transactionFee = Math.ceil(amount * 0.05);
    const amountToSendToMpesa = amount - transactionFee;

    if (amountToSendToMpesa <= 0) {
      return NextResponse.json({ success: false, error: "Amount too low to cover fees." }, { status: 400 });
    }

    const { data: transactionData, error: insertTxnError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: userId,
        amount: -amount,
        transaction_type: 'withdrawal',
        description: `Withdrawal to ${targetPhone} (5% fee applied)`
      })
      .select()
      .single();

    if (insertTxnError) throw insertTxnError;

    const { data: withdrawData, error: withdrawError } = await supabaseAdmin
      .from('withdrawals2')
      .insert({
        user_id: userId,
        amount: amount, 
        phone_number: targetPhone,
        status: 'processing',
        transaction_id: transactionData.id
      })
      .select('id')
      .single();

    if (withdrawError) throw withdrawError;

    await supabaseAdmin
      .from('profiles')
      .update({ wallet_balance: trueBalance - amount })
      .eq('id', userId);

    const intasendB2CUrl = "https://payment.intasend.com/api/v1/fund-transfers/mpesa-b2c/";
    
    const response = await fetch(intasendB2CUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.INTASEND_SECRET_KEY!}`,
      },
      body: JSON.stringify({
        currency: "KES",
        requires_approval: "NO",
        transactions: [
          {
            name: "Affiliate Payout",
            account: targetPhone,
            amount: amountToSendToMpesa,
            narrative: "Commission Payout",
            api_ref: withdrawData.id 
          }
        ]
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ 
        success: true, 
        message: `Ksh ${amountToSendToMpesa} is being processed to ${targetPhone}` 
      });
    } else {

      console.error("IntaSend B2C Rejection:", data);
      
      await supabaseAdmin.from('withdrawals2').update({ status: 'failed' }).eq('id', withdrawData.id);
      
      await supabaseAdmin.from('transactions').insert({
        user_id: userId,
        amount: amount, 
        transaction_type: 'refund',
        description: 'Refund: IntaSend API Error'
      });
      
      await supabaseAdmin.from('profiles').update({ wallet_balance: trueBalance }).eq('id', userId);

      return NextResponse.json({ success: false, error: "Failed to queue payout. Funds safely rolled back." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Withdrawal Error:", error);
    return NextResponse.json({ success: false, error: "An internal error occurred." }, { status: 500 });
  }
}