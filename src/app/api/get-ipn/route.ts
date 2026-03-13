import { NextResponse } from 'next/server';

export async function GET() {
  // Using your Live credentials
  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
  const baseUrl = 'https://pay.pesapal.com/v3';

  try {
    // 1. Authenticate to get a token
    const authRes = await fetch(`${baseUrl}/api/Auth/RequestToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        consumer_key: consumerKey, 
        consumer_secret: consumerSecret 
      })
    });
    
    const authData = await authRes.json();
    const token = authData.token;

    if (!token) throw new Error("Auth failed");

    // 2. Fetch the hidden IPN List
    const ipnRes = await fetch(`${baseUrl}/api/URLSetup/GetIpnList`, {
      headers: { 
        "Accept": "application/json",
        "Authorization": `Bearer ${token}` 
      }
    });
    
    const ipnData = await ipnRes.json();

    // Print it out to the browser
    return NextResponse.json(ipnData);
    
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}