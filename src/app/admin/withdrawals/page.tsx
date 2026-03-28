"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, X, Loader2 } from "lucide-react";

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    
    // We added 'error' here to catch what Supabase is complaining about
    const { data, error } = await supabase
      .from("withdrawals2")
      .select("*, profiles(phone_number, username)")
      .eq("status", "processing")
      .order("created_at", { ascending: true });
    
    // If Supabase throws a wall, we want to know about it!
    if (error) {
      console.error("Supabase Error:", error);
      alert("Database Error: " + error.message);
    }
    
    console.log("Fetched data:", data); // Check your browser console!
    
    setWithdrawals(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleProcess = async (id: string, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this?`)) return;
    
    setProcessingId(id);
    const res = await fetch('/api/admin/process-withdrawal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        withdrawalId: id, 
        action, 
        reason: action === 'reject' ? 'Number invalid or flagged' : '' 
      })
    });

    if (res.ok) {
      alert(`Successfully ${action}ed!`);
      fetchPending(); // Refresh list
    } else {
      alert("Error processing request.");
    }
    setProcessingId(null);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pending Withdrawals Queue</h1>

      {loading ? (
        <p>Loading queue...</p>
      ) : withdrawals.length === 0 ? (
        <div className="bg-green-50 text-green-700 p-6 rounded-xl text-center font-medium">
          🎉 Queue is empty! All payouts cleared.
        </div>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((w) => {
            const amountToSend = w.amount - Math.ceil(w.amount * 0.05); // 5% fee math
            return (
              <div key={w.id} className="bg-white border p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-bold text-gray-900">Send KSH {amountToSend}</p>
                  <p className="text-sm text-gray-500">
                    To: <span className="font-mono text-black font-medium">{w.phone_number}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Requested: Ksh {w.amount} (5% fee applied)</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleProcess(w.id, 'approve')}
                    disabled={processingId === w.id}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
                  >
                    {processingId === w.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Check className="h-4 w-4" />}
                    Mark Paid
                  </button>
                  <button 
                    onClick={() => handleProcess(w.id, 'reject')}
                    disabled={processingId === w.id}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
                  >
                    <X className="h-4 w-4" /> Refund
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}