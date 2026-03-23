import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { userId, amount } = await req.json();
    if (!userId || !amount) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

  
    if (amount < 150) {
      return NextResponse.json({ success: false, error: "Minimum withdrawal is Ksh 150" }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('phone') 
      .eq('id', userId)
      .single();

    if (profileError || !profile?.phone) {
      return NextResponse.json({ success: false, error: "No registered phone number found on your account. Please update your profile." }, { status: 400 });
    }

    const targetPhone = profile.phone; 

    const { data: ledgerEntries } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId);

    const trueBalance = ledgerEntries?.reduce((sum, txn) => sum + Number(txn.amount), 0) || 0;

    if (trueBalance < amount) {
      return NextResponse.json({ success: false, error: `Insufficient funds. Your true balance is Ksh ${trueBalance}` }, { status: 400 });
    }

    // 2. DEDUCT FROM LEDGER
    const { data: transactionData, error: insertTxnError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount: -amount,
        transaction_type: 'withdrawal',
        description: `Auto-Withdrawal to ${targetPhone}`
      })
      .select()
      .single();

    if (insertTxnError) throw insertTxnError;

    // 3. QUEUE THE PAYOUT as 'processing'
    const { error: withdrawError } = await supabase
      .from('withdrawals2')
      .insert({
        user_id: userId,
        amount: amount,
        phone_number: targetPhone,
        status: 'processing',
        transaction_id: transactionData.id
      });

    if (withdrawError) throw withdrawError;


    const consumerKey = process.env.MPESA_B2C_CONSUMER_KEY!;
    const consumerSecret = process.env.MPESA_B2C_CONSUMER_SECRET!;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    
    const tokenResponse = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` },
    });
    const { access_token } = await tokenResponse.json();

    // Safaricom B2C API Request
    const b2cResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        InitiatorName: process.env.MPESA_B2C_INITIATOR_NAME, 
        SecurityCredential: process.env.MPESA_B2C_PASSWORD, 
        CommandID: "BusinessPayment",
        Amount: amount,
        PartyA: process.env.MPESA_B2C_SHORTCODE, 
        PartyB: targetPhone,
        Remarks: "LocalSoko Affiliate Payout",
        QueueTimeOutURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mpesa/b2c-timeout`,
        ResultURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mpesa/b2c-result`,
        Occasion: "Affiliate Payout"
      }),
    });

    const b2cData = await b2cResponse.json();


    await supabase.from('profiles').update({ wallet_balance: trueBalance - amount }).eq('id', userId);

    return NextResponse.json({ 
      success: true, 
      message: `Ksh ${amount} is being sent to your registered number: ${targetPhone}` 
    });

  } catch (error: any) {
    console.error("Withdrawal Error:", error);
    return NextResponse.json({ success: false, error: "An internal error occurred." }, { status: 500 });
  }
}