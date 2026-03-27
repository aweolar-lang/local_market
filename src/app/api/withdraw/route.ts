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

    // 1. Fetch Profile
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

    // 2. Fetch True Ledger Balance
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

    // 3. Fee Calculation (Keeping your 5% logic)
    const transactionFee = Math.ceil(amount * 0.05);
    const amountToSendToMpesa = amount - transactionFee;

    if (amountToSendToMpesa <= 0) {
      return NextResponse.json({ success: false, error: "Amount too low to cover fees." }, { status: 400 });
    }

    // 4. Deduct from Ledger
    const { data: transactionData, error: insertTxnError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: userId,
        amount: -amount,
        transaction_type: 'withdrawal',
        description: `Manual Withdrawal to ${targetPhone} (5% fee applied)`
      })
      .select()
      .single();

    if (insertTxnError) throw insertTxnError;

    // 5. Insert into Withdrawals Queue
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

    // 6. Update Wallet
    await supabaseAdmin
      .from('profiles')
      .update({ wallet_balance: trueBalance - amount })
      .eq('id', userId);

   // 7. SEND ADMIN SMS NOTIFICATION
    if (process.env.AFRICASTALKING_API_KEY && process.env.ADMIN_PHONE_NUMBER && process.env.AFRICASTALKING_USERNAME) {
      try {
        const smsPayload = new URLSearchParams({
          username: process.env.AFRICASTALKING_USERNAME,
          to: process.env.ADMIN_PHONE_NUMBER, 
          message: `NEW WITHDRAWAL: Send KSH ${amountToSendToMpesa} to ${targetPhone}. Log in to admin panel to mark as processing.`,
        });

        const smsRes = await fetch('https://api.africastalking.com/version1/messaging', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'apiKey': process.env.AFRICASTALKING_API_KEY,
          },
          body: smsPayload.toString(),
        });

        if (!smsRes.ok) {
          const errorText = await smsRes.text();
          throw new Error(`Africa's Talking rejected the SMS: ${errorText}`);
        }

      } catch (smsError) {
        console.error("Admin SMS Failed (but withdrawal saved):", smsError);
      }
    } else {
      console.warn("SMS skipped: Missing Africa's Talking ENV variables.");
    }

    return NextResponse.json({ 
      success: true, 
      message: `Withdrawal of Ksh ${amount} requested successfully. It will be sent to ${targetPhone} shortly.` 
    });

  } catch (error: any) {
    console.error("Withdrawal Error:", error);
    return NextResponse.json({ success: false, error: "An internal error occurred." }, { status: 500 });
  }
}


