import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // 1. Security: Verify Paystack Signature
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const secret = process.env.PAYSTACK_SECRET_KEY!;

    const expectedSignature = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

    if (signature !== expectedSignature) {
      console.error("SECURITY ALERT: Fake Paystack Webhook Attempt Blocked!");
      return NextResponse.json({ status: "Unauthorized" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    
    // 2. Extract UserId from Paystack Metadata
    const customFields = body.data?.metadata?.custom_fields || [];
    const userIdField = customFields.find((f: any) => f.variable_name === 'userId');
    const userId = userIdField?.value;

    if (!userId) {
      return NextResponse.json({ status: "Ignored: No userId in metadata" });
    }

    // 3. Handle Failed Payments (Unlock account immediately)
    if (body.event === 'charge.failed') {
      console.log(`Paystack payment failed for user: ${userId}`);
      await supabaseAdmin
        .from('profiles')
        .update({ mpesa_payment_status: 'idle' })
        .eq('id', userId);

      return NextResponse.json({ status: "Processed Failure" });
    }

    // 4. Handle Successful Payments
    if (body.event === 'charge.success') {
      // Database Idempotency Check (Don't double-process)
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('is_affiliate')
        .eq('id', userId)
        .single();

      if (existingProfile?.is_affiliate) {
        console.log("Webhook Retry Detected. User is already an active affiliate.");
        // Ensure status is success just in case
        await supabaseAdmin.from('profiles').update({ mpesa_payment_status: 'success' }).eq('id', userId);
        return NextResponse.json({ status: "Already Processed" });
      }

      // Update Profile & Distribute Commissions
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

    return NextResponse.json({ status: "Webhook processed successfully" });

  } catch (error) {
    console.error("Paystack Webhook Error:", error);
    return NextResponse.json({ status: "Error caught safely" }); 
  }
}