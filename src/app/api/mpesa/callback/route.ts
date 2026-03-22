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
    
    // 1. Parse Safaricom's JSON receipt
    const body = await req.json();
    const callbackData = body.Body.stkCallback;

    // ResultCode 0 means the payment was completely successful
    if (callbackData.ResultCode === 0 && userId) {
      
      // Generate a unique 8-character referral code for them
      const referralCode = `REF-${userId.substring(0, 8).toUpperCase()}`;

      // 2. Update the user's profile to make them an official Affiliate
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          is_affiliate: true,
          referral_code: referralCode
        })
        .eq('id', userId);

      if (updateError) {
        console.error("Failed to update profile:", updateError);
      } else {
        // 3. Trigger the database function to distribute the 150/100/50/10 commissions!
        await supabaseAdmin.rpc('distribute_commissions', { new_affiliate_id: userId });
      }
    } else {
      console.log("Payment failed or cancelled by user. Safaricom Reason:", callbackData.ResultDesc);
    }

    // 5. ALWAYS return a success response to Safaricom, otherwise they will retry sending this receipt every 5 minutes
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Error processed safely" });
  }
}