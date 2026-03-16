import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, title } = body;

    // 1. Get credentials from your .env.local file
    const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
    const env = process.env.PESAPAL_ENV || 'sandbox'; // sandbox for testing, live for production
    
    const baseUrl = env === 'live' 
      ? 'https://pay.pesapal.com/v3' 
      : 'https://cybqa.pesapal.com/pesapalv3';

    // 2. Authenticate with Pesapal to get a Bearer Token
    // FIXED: Using 'baseUrl' instead of process.env, and removed the extra '/v3'
    const authResponse = await fetch(`${baseUrl}/api/Auth/RequestToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
      })
    });

    const authData = await authResponse.json(); 
    
    const token = authData.token;

    if (!token) {
      console.error("Auth failed. Full response:");
      throw new Error("Could not authenticate with Pesapal");
    }

    // 3. Prepare the Order Details
    const orderData = {
      id: `${itemId}-${Date.now()}`, // Unique merchant reference
      currency: "KES",
      amount: 1.00,
      description: `Listing fee for: ${title}`,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pay/callback`, 
      notification_id: process.env.PESAPAL_IPN_ID, 
      billing_address: {
        email_address: "seller@localsoko.com", 
        phone_number: "",
        country_code: "KE",
        first_name: "LocalSoko",
        middle_name: "",
        last_name: "Seller",
        line_1: "",
        line_2: "",
        city: "",
        state: "",
        postal_code: "",
        zip_code: ""
      }
    };

    // 4. Submit the Order to Pesapal
    const orderResponse = await fetch(`${baseUrl}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData),
    });

    const orderResult = await orderResponse.json();
    console.log("Pesapal Raw Order Response:", orderResult);

    // 5. Send the redirect URL back to our frontend
    if (orderResult.redirect_url) {
      return NextResponse.json({ redirectUrl: orderResult.redirect_url });
    } else {
      console.error("Order failed. Full response:", orderResult);
      throw new Error("Failed to get redirect URL from Pesapal");
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Pesapal Error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}