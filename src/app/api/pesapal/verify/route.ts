import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We need a special "Service Role" key to securely update the database from the backend
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // We will add this to your .env.local!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingId = searchParams.get('trackingId');
    const merchantRef = searchParams.get('merchantRef'); // e.g., "item-uuid-1234567890"

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

    // 4. If paid successfully, update Supabase!
    if (statusData.payment_status_description === "COMPLETED") {
      // Update item status to active
      const { error: updateError } = await supabaseAdmin
        .from('items')
        .update({ status: 'active' })
        .eq('id', itemId);

      if (updateError) throw updateError;
      
      // Optional: Save the payment record in the payments table we created in Step 2
      await supabaseAdmin.from('payments').insert([{
        item_id: itemId,
        pesapal_tracking_id: trackingId,
        payment_status: "COMPLETED"
      }]);

      return NextResponse.json({ paymentStatus: "COMPLETED" });
    }

    return NextResponse.json({ paymentStatus: statusData.payment_status_description });

  } catch (error) {
    console.error("API Error:", error);
    
    // Safely check if the error is a standard JavaScript Error object
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}