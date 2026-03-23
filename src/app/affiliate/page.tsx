"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Copy, Check, TrendingUp, Users, Award, Smartphone, Loader2, Lock } from "lucide-react";

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
        
        // Count invites regardless of if they are active yet (it will just be 0)
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: 'exact', head: true })
          .eq("referred_by", session.user.id);

        setStats({
          referral_code: profile.referral_code || "LOCKED",
          wallet_balance: profile.wallet_balance || 0,
          total_invites: count || 0,
        });
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
        setPaymentMessage("Prompt sent! Check your phone to enter your M-Pesa PIN.");
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
    if (!stats || !isAffiliate) return;
    navigator.clipboard.writeText(`${siteUrl}/login?ref=${stats.referral_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><Loader2 className="h-10 w-10 animate-spin text-green-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-black font-medium transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            Partner Portal
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        
        {/* BIG WALLET CARD - ALWAYS VISIBLE! */}
        <div className="bg-black rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <TrendingUp className="w-64 h-64" />
          </div>
          <div className="relative z-10 space-y-6">
            <div>
              <p className="text-gray-400 font-medium mb-2">Available Balance</p>
              <h1 className="text-5xl md:text-6xl font-black text-green-400">
                Ksh {stats?.wallet_balance.toLocaleString()}
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                disabled={!isAffiliate}
                className="disabled:opacity-50 disabled:cursor-not-allowed bg-green-500 hover:bg-green-400 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
              >
                {isAffiliate ? "Withdraw Funds" : "Activate to Withdraw"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* DYNAMIC CARD: Invite Link OR Payment Lock */}
          {isAffiliate ? (
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="h-6 w-6" /></div>
                <h3 className="text-xl font-bold text-gray-900">Your Invite Link</h3>
              </div>
              <p className="text-gray-500 text-sm mb-4">Share this link. Earn up to Ksh 150 instantly for every friend who joins.</p>
              <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1">
                <input readOnly value={`${siteUrl}/login?ref=${stats?.referral_code}`} className="bg-transparent flex-1 px-4 text-sm outline-none" />
                <button onClick={copyToClipboard} className="bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                  {copied ? <><Check className="h-4 w-4 text-green-500"/> Copied!</> : <><Copy className="h-4 w-4"/> Copy</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-orange-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-bl-xl text-xs font-bold flex items-center gap-1">
                <Lock className="h-3 w-3" /> LINK LOCKED
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 mt-2">Unlock Your Invite Link</h3>
              <p className="text-gray-500 text-sm mb-6">Pay a one-time activation fee of Ksh 400 to unlock your unique link and start earning today.</p>
              
              {paymentStatus === 'success' ? (
                <div className="text-center py-4">
                  <Smartphone className="h-8 w-8 text-green-600 mx-auto animate-pulse mb-2" />
                  <p className="text-green-700 font-medium text-sm">{paymentMessage}</p>
                  <button onClick={() => window.location.reload()} className="mt-4 w-full bg-black text-white py-2.5 rounded-xl text-sm font-bold">I have paid, refresh</button>
                </div>
              ) : (
                <form onSubmit={handleMpesaSubmit} className="space-y-4">
                  <div>
                    <input 
                      type="tel" required placeholder="M-Pesa Number (e.g. 07...)"
                      value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                  {paymentStatus === 'error' && <p className="text-red-500 text-xs">{paymentMessage}</p>}
                  <button type="submit" disabled={paymentStatus === 'loading'} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all">
                    {paymentStatus === 'loading' ? "Processing..." : "Pay Ksh 400"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* NETWORK STATS - ALWAYS VISIBLE! */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Award className="h-6 w-6" /></div>
              <h3 className="text-xl font-bold text-gray-900">Network Stats</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium mb-1">Direct Invites</p>
                <p className="text-3xl font-black text-gray-900">{stats?.total_invites}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 relative overflow-hidden">
                <p className="text-sm text-gray-500 font-medium mb-1">Referral Code</p>
                <p className={`text-xl font-bold tracking-wider pt-1 ${isAffiliate ? 'text-gray-900' : 'text-gray-300'}`}>
                  {stats?.referral_code}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}