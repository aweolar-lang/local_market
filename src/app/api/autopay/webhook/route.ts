import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();


    const mySecretChallenge = process.env.INTASEND_WEBHOOK_CHALLENGE;

    if (body.challenge !== mySecretChallenge) {
      console.error("SECURITY ALERT: Fake Webhook Attempt Blocked!");
      return NextResponse.json({ status: "Unauthorized" }, { status: 401 });
    }

    const state = body.state;
    const userId = body.api_ref; 
    
    if (!userId) {
      return NextResponse.json({ status: "Ignored: No api_ref provided" });
    }

    if (state === 'FAILED') {
      console.log(`IntaSend payment failed for user: ${userId}`);
      await supabaseAdmin
        .from('profiles')
        .update({ mpesa_payment_status: 'idle' })
        .eq('id', userId);

      return NextResponse.json({ status: "Processed Failure" });
    }

    if (state === 'COMPLETE') {
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('is_affiliate')
        .eq('id', userId)
        .single();

      if (existingProfile?.is_affiliate) {
        console.log("Webhook Retry Detected. User is already an active affiliate.");
        await supabaseAdmin.from('profiles').update({ mpesa_payment_status: 'success' }).eq('id', userId);
        return NextResponse.json({ status: "Already Processed" });
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

    return NextResponse.json({ status: "Webhook received successfully" });

  } catch (error) {
    console.error("IntaSend Webhook Error:", error);
    return NextResponse.json({ status: "Error caught safely" }); 
  }
}