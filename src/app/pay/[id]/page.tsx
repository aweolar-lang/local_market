"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CreditCard, ShieldCheck } from "lucide-react";

interface Item {
  id: string;
  title: string;
  town: string;
}

export default function PaymentPage() {
  const params = useParams();
  const itemId = params.id as string;
  
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch the item details to show the user what they are paying for
  useEffect(() => {
    const fetchItem = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (data) setItem(data);
      setIsLoading(false);
    };

    if (itemId) fetchItem();
  }, [itemId]);

  // This talks to our secure backend API to get the Pesapal link
  const handlePayment = async () => {
    if (!item) return;
    setIsProcessing(true);
    try {
      const response = await fetch('/api/pesapal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, title: item.title })
      });

      const data = await response.json();

      if (data.redirectUrl) {
        // Redirect the user to the secure Pesapal checkout page
        window.location.href = data.redirectUrl;
      } else {
        alert("Could not initiate payment. Please try again.");
        setIsProcessing(false);
      }
    } catch (error) {
      alert("An error occurred connecting to the payment gateway.");
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading payment details...</div>;
  if (!item) return <div className="p-8 text-center text-red-500">Item not found.</div>;

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="h-8 w-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Activate Your Listing</h1>
        <p className="text-gray-500 mb-6">
          You are about to list <strong>{item.title}</strong> on LocalSoko. 
          Pay the listing fee to make it visible to buyers in {item.town}.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-200 flex justify-between items-center">
          <span className="text-gray-600 font-medium">Listing Fee</span>
          <span className="text-xl font-bold text-gray-900">Ksh 100</span>
        </div>

        <button 
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          <CreditCard className="h-5 w-5" />
          {isProcessing ? "Connecting to Pesapal..." : "Pay with M-Pesa or Card"}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Secured by Pesapal. You will be redirected to complete your payment.
        </p>
      </div>
    </div>
  );
}