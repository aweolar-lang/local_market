import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingId = searchParams.get('trackingId');
    const merchantRef = searchParams.get('merchantRef');

  if (!trackingId || !merchantRef) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    
    const itemId = merchantRef.substring(0, 36);

    // 1. Get Pesapal Credentials
    const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
    const env = process.env.PESAPAL_ENV || 'sandbox';
    const baseUrl = env === 'live' ? 'https://pay.pesapal.com/v3' : 'https://cybqa.pesapal.com/pesapalv3';

    // 2. Authenticate with Pesapal
    const authRes = await fetch(`${baseUrl}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret }),
    });
    const authData = await authRes.json();
    const token = authData.token;

    // 3. Check the real Transaction Status
    const statusRes = await fetch(`${baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const statusData = await statusRes.json();

    console.log("PESAPAL RAW STATUS DATA:", statusData);

    // Make everything uppercase so "Completed", "COMPLETED", and "completed" all match safely
    const statusDescription = (statusData.payment_status_description || "").toUpperCase();
    const statusCode = (statusData.payment_status_code || "").toUpperCase();

    // 4. If paid successfully, update Supabase!
    if (statusDescription === "COMPLETED" || statusCode === "COMPLETED") {
      
      const { error: updateError } = await supabaseAdmin
        .from('items')
        .update({ status: 'active' })
        .eq('id', itemId);

      if (updateError) {
        console.error("Failed to update item status:", updateError);
      }
      
      try {
        const { data: existingPayment } = await supabaseAdmin
          .from('payments')
          .select('id')
          .eq('pesapal_tracking_id', trackingId)
          .single();

        if (!existingPayment) {
          await supabaseAdmin.from('payments').insert([{
            item_id: itemId,
            pesapal_tracking_id: trackingId,
            payment_status: "COMPLETED"
          }]);
        }
      } catch (insertError) {
        console.error("Non-fatal error saving to payments table:", insertError);
      }

      return NextResponse.json({ paymentStatus: "COMPLETED" });
    }

    // Return the actual uppercase status so your frontend polling logic knows if it's "PENDING"
    return NextResponse.json({ paymentStatus: statusCode || statusDescription });

  } catch (error) {
    console.error("API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
