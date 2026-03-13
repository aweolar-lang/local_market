"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

// 1. We extract the actual logic into a sub-component
function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  const trackingId = searchParams.get("OrderTrackingId");
  const merchantRef = searchParams.get("OrderMerchantReference");

  useEffect(() => {
    // 2. We move everything inside the async function to satisfy React's strict rules
    const verifyPayment = async () => {
      // If missing params, set failed asynchronously to avoid cascading renders
      if (!trackingId || !merchantRef) {
        await Promise.resolve(); // This tiny trick stops the synchronous setState warning!
        setStatus("failed");
        return;
      }

      try {
        const response = await fetch(`/api/pesapal/verify?trackingId=${trackingId}&merchantRef=${merchantRef}`);
        const data = await response.json();

        if (data.paymentStatus === "COMPLETED") {
          setStatus("success");
          setTimeout(() => router.push("/"), 3000);
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("failed");
      }
    };

    verifyPayment();
  }, [trackingId, merchantRef, router]);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
      {status === "loading" && (
        <>
          <Loader2 className="h-12 w-12 text-green-500 animate-spin mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h1>
          <p className="text-gray-500">Please wait while we confirm your transaction with Pesapal.</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-500 mb-6">Your Ksh 100 listing fee was received. Your item is now live.</p>
          <p className="text-sm text-green-600 font-medium">Redirecting to homepage...</p>
        </>
      )}

      {status === "failed" && (
        <>
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-500 mb-6">We couldn&apos;t confirm your payment. If money was deducted, please contact support.</p>
          <button 
            onClick={() => router.push("/sell")}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-black transition-all"
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
}

// 3. We wrap the component in Suspense so Next.js can safely read the URL parameters
export default function PaymentCallbackPage() {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <Suspense fallback={
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-green-500 animate-spin mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </div>
  );
}