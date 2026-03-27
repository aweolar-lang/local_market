import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js"; 

// Initialize the Admin Client to bypass Row Level Security (RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    const { userId, amount } = await req.json();
    if (!userId || !amount) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (amount < 150) {
      return NextResponse.json({ success: false, error: "Minimum withdrawal is Ksh 150" }, { status: 400 });
    }

    // 1. FETCH PROFILE
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('phone_number') 
      .eq('id', userId)
      .single();

    if (profileError || !profile?.phone_number) {
      console.error("Profile Fetch Error:", profileError);
      return NextResponse.json({ success: false, error: "No registered phone number found on your account. Please update your profile." }, { status: 400 });
    }

    // Bulletproof phone formatting for Safaricom
    let targetPhone = profile.phone_number.trim();
    if (targetPhone.startsWith('+')) targetPhone = targetPhone.slice(1);
    if (targetPhone.startsWith('0')) targetPhone = `254${targetPhone.slice(1)}`;

    // 2. FETCH LEDGER BALANCE
    const { data: ledgerEntries } = await supabaseAdmin
      .from('transactions')
      .select('amount')
      .eq('user_id', userId);

    const trueBalance = ledgerEntries?.reduce((sum, txn) => sum + Number(txn.amount), 0) || 0;

    if (trueBalance < amount) {
      return NextResponse.json({ success: false, error: `Insufficient funds. Your true balance is Ksh ${trueBalance}` }, { status: 400 });
    }

    // 3. DEDUCT FROM LEDGER
    const { data: transactionData, error: insertTxnError } = await supabaseAdmin
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

    const consumerKey = process.env.MPESA_B2C_CONSUMER_KEY!;
    const consumerSecret = process.env.MPESA_B2C_CONSUMER_SECRET!;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    
    const tokenResponse = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` },
    });
    const { access_token } = await tokenResponse.json();

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
       
        QueueTimeOutURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mpesa/b2c-timeout?w_id=${withdrawData.id}`,
        ResultURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mpesa/b2c-result?w_id=${withdrawData.id}`,
        Occasion: "Affiliate Payout"
      }),
    });

    const b2cData = await b2cResponse.json();

    // 5. UPDATE WALLET BALANCE
    await supabaseAdmin.from('profiles').update({ wallet_balance: trueBalance - amount }).eq('id', userId);

    return NextResponse.json({ 
      success: true, 
      message: `Ksh ${amount} is being sent to your registered number: ${targetPhone}` 
    });

  } catch (error: any) {
    console.error("Withdrawal Error:", error);
    return NextResponse.json({ success: false, error: "An internal error occurred." }, { status: 500 });
  }
}