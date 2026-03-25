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

    if (!phoneNumber || !userId) {
      return NextResponse.json({ success: false, error: "Missing phone or user ID" });
    }

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

    await supabaseAdmin
      .from("profiles")
      .update({ 
        mpesa_payment_status: "processing",
        mpesa_locked_at: new Date().toISOString()
      })
      .eq("id", userId);

    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.startsWith("0")) formattedPhone = `254${formattedPhone.slice(1)}`;
    if (formattedPhone.startsWith("+")) formattedPhone = formattedPhone.slice(1);

    const intasendUrl = "https://payment.intasend.com/api/v1/payment/mpesa-stk-push/";
    
    const response = await fetch(intasendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.INTASEND_SECRET_KEY!}`,
      },
      body: JSON.stringify({
        public_key: process.env.INTASEND_PUBLISHABLE_KEY!, 
        currency: "KES",
        amount: 400,
        phone_number: formattedPhone,
        api_ref: userId,
      }),
    });

    const data = await response.json();

    if (response.ok && data.invoice) {
      return NextResponse.json({ success: true, message: "M-Pesa prompt sent successfully!" });
    } else {
      await supabaseAdmin.from("profiles").update({ mpesa_payment_status: "idle" }).eq("id", userId);
      console.error("IntaSend Rejection:", data);
      return NextResponse.json({ success: false, error: data.errors?.[0]?.detail || "Failed to initiate payment." }, { status: 400 });
    }

  } catch (error) {
    console.error("STK Push Route Error:", error);
    
    if (parsedUserId) {
      await supabaseAdmin.from("profiles").update({ mpesa_payment_status: "idle" }).eq("id", parsedUserId);
    }
    
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}