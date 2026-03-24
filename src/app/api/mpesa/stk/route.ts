import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { phoneNumber, userId } = await req.json();
    const { data: userProfile } = await supabaseAdmin
      .from("profiles")
      .select("mpesa_payment_status, mpesa_locked_at")
      .eq("id", userId)
      .single();

    if (userProfile?.mpesa_payment_status === "processing" && userProfile?.mpesa_locked_at) {
      const lockTime = new Date(userProfile.mpesa_locked_at).getTime();
      const now = new Date().getTime();
      const diffInMinutes = (now - lockTime) / (1000 * 60);

      if (diffInMinutes < 2) {
        return NextResponse.json(
          { success: false, error: "A payment is already processing. Please wait for the M-Pesa prompt or check back in 2 minutes." },
          { status: 429 }
        );
      }
    }

    // 2. Lock the user's account for 2 minutes to prevent multiple simultaneous payment attempts
    await supabaseAdmin
      .from("profiles")
      .update({ 
        mpesa_payment_status: "processing",
        mpesa_locked_at: new Date().toISOString()
      })
      .eq("id", userId);


    let formattedPhone = phoneNumber.replace(/[^0-9]/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith("+")) {
      formattedPhone = formattedPhone.slice(1);
    }

    const shortcode = process.env.MPESA_SHORTCODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    const consumerKey = process.env.MPESA_CONSUMER_KEY!;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;

    // 3. Generate the Timestamp and Password
    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    // 4. Get the Daraja Access Token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const tokenResponse = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` },
    });
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 5. Send the STK Push Request
    const stkResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: 10, // The Affiliate Activation Fee
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mpesa/callback?userId=${userId}`,
        AccountReference: "LocalSoko Affiliate",
        TransactionDesc: "Affiliate Activation",
      }),
    });

    const stkData = await stkResponse.json();

    if (stkData.ResponseCode === "0") {
      return NextResponse.json({ success: true, message: "STK Push sent successfully!" });
    } else {
      //UNLOCK: If Daraja rejected it immediately, unlock their account
      await supabaseAdmin.from("profiles").update({ mpesa_payment_status: "idle" }).eq("id", userId);
      return NextResponse.json({ success: false, error: stkData.errorMessage }, { status: 400 });
    }

  } catch (error) {
    console.error("M-Pesa Error:", error);
    // On server crash, unlock so they can try again
    const payload = await req.json().catch(() => ({}));
    if (payload.userId) {
      await supabaseAdmin.from("profiles").update({ mpesa_payment_status: "idle" }).eq("id", payload.userId);
    }
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}