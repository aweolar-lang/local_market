import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    const body = await req.json();
    const callbackData = body.Body.stkCallback;

    if (!userId) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Missing userId" });
    }

    if (callbackData.ResultCode !== 0) {
      console.log(`Payment failed for ${userId}: ${callbackData.ResultDesc}`);
      
      // Unlock the account so they can try again!
      await supabaseAdmin
        .from('profiles')
        .update({ mpesa_payment_status: 'idle' })
        .eq('id', userId);

      return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
    }

    if (callbackData.ResultCode === 0) {
      
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('is_affiliate')
        .eq('id', userId)
        .single();

      if (existingProfile?.is_affiliate) {
        console.log("Safaricom Retry Detected. User is already an affiliate. Skipping.");
        await supabaseAdmin.from('profiles').update({ mpesa_payment_status: 'success' }).eq('id', userId);
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
      }

      const referralCode = `REF-${userId.substring(0, 8).toUpperCase()}`;

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          is_affiliate: true,
          referral_code: referralCode,
          mpesa_payment_status: 'success'
        })
        .eq('id', userId);

      if (!updateError) {
        await supabaseAdmin.rpc('distribute_commissions', { new_affiliate_id: userId });
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Error processed safely" });
  }
}