"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Copy, Check, TrendingUp, Users, Award, Smartphone, Loader2 } from "lucide-react";

interface AffiliateStats {
  referral_code: string;
  wallet_balance: number;
  total_invites: number;
}

export default function AffiliatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");

  const [phoneInput, setPhoneInput] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [paymentMessage, setPaymentMessage] = useState("");

  useEffect(() => {
    setSiteUrl(window.location.origin);
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_affiliate, referral_code, wallet_balance")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setIsAffiliate(profile.is_affiliate);
        if (profile.is_affiliate) {
          const { count } = await supabase
            .from("profiles")
            .select("*", { count: 'exact', head: true })
            .eq("referred_by", session.user.id);

          setStats({
            referral_code: profile.referral_code || "",
            wallet_balance: profile.wallet_balance || 0,
            total_invites: count || 0,
          });
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleMpesaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStatus('loading');
    setPaymentMessage("");

    try {
      const res = await fetch("/api/mpesa/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneInput, userId: userId }),
      });
      const data = await res.json();
      
      if (data.success) {
        setPaymentStatus('success');
        setPaymentMessage("Prompt sent! Please check your phone and enter your M-Pesa PIN.");
      } else {
        setPaymentStatus('error');
        setPaymentMessage(data.error || "Failed to initiate payment.");
      }
    } catch (err) {
      setPaymentStatus('error');
      setPaymentMessage("A network error occurred.");
    }
  };

  const copyToClipboard = () => {
    if (!stats) return;
    navigator.clipboard.writeText(`${siteUrl}/login?ref=${stats.referral_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><Loader2 className="h-10 w-10 animate-spin text-green-500" /></div>;
  }

  // SCREEN 1: UNPAID (PAYMENT FORM)
  if (!isAffiliate) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-black font-medium transition-colors text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 mt-12 space-y-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center transform rotate-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Become a Partner</h1>
            <p className="text-gray-500">Pay a one-time activation fee of Ksh 400 to unlock your unique invite link and start earning commissions.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
            {paymentStatus === 'success' ? (
              <div className="text-center py-6 space-y-4">
                <Smartphone className="h-12 w-12 text-green-600 mx-auto animate-pulse" />
                <h4 className="text-xl font-bold">Check your phone!</h4>
                <p className="text-gray-600">{paymentMessage}</p>
                <button onClick={() => window.location.reload()} className="w-full bg-black text-white py-3 rounded-xl font-bold mt-4">
                  I have paid, refresh page
                </button>
              </div>
            ) : (
              <form onSubmit={handleMpesaSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">M-Pesa Phone Number</label>
                  <input 
                    type="tel" required placeholder="0712345678"
                    value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                {paymentStatus === 'error' && <div className="text-red-600 text-sm">{paymentMessage}</div>}
                <button type="submit" disabled={paymentStatus === 'loading'} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl">
                  {paymentStatus === 'loading' ? "Processing..." : "Pay Ksh 400 via M-Pesa"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 2: PAID (AFFILIATE DASHBOARD)
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">Partner Portal</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        <div className="bg-black rounded-3xl p-8 text-white shadow-xl">
          <p className="text-gray-400 font-medium mb-2">Available Balance</p>
          <h1 className="text-5xl font-black text-green-400">Ksh {stats?.wallet_balance.toLocaleString()}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4">Your Invite Link</h3>
            <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1">
              <input readOnly value={`${siteUrl}/login?ref=${stats?.referral_code}`} className="bg-transparent flex-1 px-4 text-sm outline-none" />
              <button onClick={copyToClipboard} className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium">
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4">Network Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm text-gray-500 mb-1">Direct Invites</p>
                <p className="text-3xl font-black">{stats?.total_invites}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm text-gray-500 mb-1">Referral Code</p>
                <p className="text-xl font-bold">{stats?.referral_code}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}