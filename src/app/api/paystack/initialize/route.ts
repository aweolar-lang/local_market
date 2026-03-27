import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  let parsedUserId = null;

  try {
    const { phoneNumber, userId } = await req.json();
    parsedUserId = userId;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing user ID" });
    }

    // 1. Fetch user profile to check locks and get their email
    const { data: userProfile } = await supabaseAdmin
      .from("profiles")
      .select("email, mpesa_payment_status, mpesa_locked_at")
      .eq("id", userId)
      .single();

    // 2. Enforce the exact 2-minute lock logic
    if (userProfile?.mpesa_payment_status === "processing" && userProfile?.mpesa_locked_at) {
      const lockTime = new Date(userProfile.mpesa_locked_at).getTime();
      const now = new Date().getTime();
      const diffInMinutes = (now - lockTime) / (1000 * 60);

      if (diffInMinutes < 2) {
        return NextResponse.json(
          { success: false, error: "A payment is already processing. Please complete it or wait 2 minutes." },
          { status: 429 }
        );
      }
    }

    // 3. Lock the account to prevent spam clicking
    await supabaseAdmin
      .from("profiles")
      .update({ 
        mpesa_payment_status: "processing",
        mpesa_locked_at: new Date().toISOString()
      })
      .eq("id", userId);

    // 4. Initialize Paystack Transaction
    // Paystack requires an email. If you don't store it, we use a placeholder tied to their ID.
    const userEmail = userProfile?.email || `user-${userId}@localsoko.com`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`,
      },
      body: JSON.stringify({
        email: userEmail,
        amount: 10 * 100,
        currency: "KES",
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/affiliate`,
        metadata: {
          custom_fields: [
            { variable_name: "userId", value: userId }
          ]
        }
      }),
    });

    const paystackData = await paystackRes.json();

    // 5. Safely redirect or unlock if Paystack fails
    if (paystackData.status && paystackData.data?.authorization_url) {
      return NextResponse.json({ 
        success: true, 
        checkoutUrl: paystackData.data.authorization_url 
      });
    } else {
      // Unlock immediately if Paystack API goes down or rejects the request
      await supabaseAdmin.from("profiles").update({ mpesa_payment_status: "idle" }).eq("id", userId);
      return NextResponse.json({ success: false, error: "Failed to connect to payment gateway." }, { status: 400 });
    }

  } catch (error) {
    console.error("Paystack Init Error:", error);
    if (parsedUserId) {
      // Failsafe unlock if the entire server block crashes
      await supabaseAdmin.from("profiles").update({ mpesa_payment_status: "idle" }).eq("id", parsedUserId);
    }
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}