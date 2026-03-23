"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Copy, Check, TrendingUp, Users, Award, Smartphone, Loader2, Lock, Crown, Star, ShieldCheck, Zap } from "lucide-react";

interface AffiliateStats {
  full_name: string;
  referral_code: string;
  wallet_balance: number;
  total_invites: number;
  is_founder: boolean;
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
        .select("full_name, is_affiliate, referral_code, wallet_balance, is_founder")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setIsAffiliate(profile.is_affiliate);
        
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: 'exact', head: true })
          .eq("referred_by", session.user.id);

        setStats({
          full_name: profile.full_name || "Partner",
          referral_code: profile.referral_code || "LOCKED",
          wallet_balance: profile.wallet_balance || 0,
          total_invites: count || 0,
          is_founder: profile.is_founder || false,
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

  const getRank = (invites: number) => {
    if (invites >= 20) return { name: "VIP Elite", icon: <Crown className="h-5 w-5 text-yellow-500" />, color: "text-yellow-600", bg: "bg-yellow-100" };
    if (invites >= 5) return { name: "Pro Partner", icon: <Star className="h-5 w-5 text-blue-500" />, color: "text-blue-600", bg: "bg-blue-100" };
    return { name: "Starter", icon: <ShieldCheck className="h-5 w-5 text-gray-500" />, color: "text-gray-600", bg: "bg-gray-100" };
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><Loader2 className="h-10 w-10 animate-spin text-green-500" /></div>;
  }

  const currentRank = getRank(stats?.total_invites || 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      
      {/* PROFESSIONAL TOP NAV */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-black font-semibold transition-colors text-sm bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-xs text-gray-500 font-medium">Logged in as</p>
              <p className="text-sm font-bold text-gray-900">{stats?.full_name}</p>
            </div>
            <div className="h-10 w-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              {stats?.full_name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Partner Hub</h1>
            <p className="text-gray-500 mt-1">Manage your referrals, track commissions, and unlock VIP perks.</p>
          </div>
          {isAffiliate && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${currentRank.bg} border-opacity-50 shadow-sm`}>
              {currentRank.icon}
              <span className={`font-bold ${currentRank.color}`}>Rank: {currentRank.name}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-gray-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl border border-gray-800">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <TrendingUp className="w-64 h-64" />
              </div>
              <div className="relative z-10 space-y-6">
                <div>
                  <p className="text-gray-400 font-medium mb-2 tracking-wide uppercase text-sm">Total Earnings</p>
                  <h1 className="text-5xl md:text-6xl font-black text-green-400 tracking-tight">
                    <span className="text-3xl text-green-600 mr-2">Ksh</span>
                    {stats?.wallet_balance.toLocaleString()}
                  </h1>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button 
                    disabled={!isAffiliate}
                    className="disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
                  >
                    {isAffiliate ? "Withdraw to M-Pesa" : "Activate to Withdraw"}
                  </button>
                </div>
              </div>
            </div>

            {isAffiliate ? (
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Users className="h-6 w-6" /></div>
                    <h3 className="text-xl font-bold text-gray-900">Your Invite Link</h3>
                  </div>
                  <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold uppercase">Active</div>
                </div>
                <p className="text-gray-500 text-sm mb-6">Share this link. Earn commissions passively when your friends join and invite others.</p>
                <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-2 shadow-inner">
                  <input readOnly value={`${siteUrl}/login?ref=${stats?.referral_code}`} className="bg-transparent flex-1 px-4 text-sm outline-none font-medium text-gray-700" />
                  <button onClick={copyToClipboard} className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                    {copied ? <><Check className="h-4 w-4"/> Copied!</> : <><Copy className="h-4 w-4"/> Copy Link</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border-2 border-orange-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-orange-500 text-white px-6 py-2 rounded-bl-2xl text-xs font-black tracking-wider flex items-center gap-2 shadow-md">
                  <Lock className="h-3 w-3" /> LINK LOCKED
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2 mt-2">Unlock Your Earning Power</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-md">Pay a one-time activation fee of Ksh 400 to unlock your unique link, start earning 3 tiers of commissions, and claim your VIP Seller badge.</p>
                
                {paymentStatus === 'success' ? (
                  <div className="text-center py-6 bg-green-50 rounded-2xl border border-green-100">
                    <Smartphone className="h-10 w-10 text-green-600 mx-auto animate-pulse mb-3" />
                    <p className="text-green-800 font-bold">{paymentMessage}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 bg-black text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg">I have paid, refresh</button>
                  </div>
                ) : (
                  <form onSubmit={handleMpesaSubmit} className="space-y-4 max-w-sm">
                    <div>
                      <input 
                        type="tel" required placeholder="M-Pesa Number (e.g. 07...)"
                        value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none transition-all"
                      />
                    </div>
                    {paymentStatus === 'error' && <p className="text-red-500 text-xs font-bold">{paymentMessage}</p>}
                    <button type="submit" disabled={paymentStatus === 'loading'} className="w-full bg-[#52B44B] hover:bg-[#43963d] text-white font-black text-lg py-4 rounded-xl transition-all shadow-md shadow-green-500/20 flex justify-center items-center">
                      {paymentStatus === 'loading' ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Processing...</> : "Pay Ksh 400 via M-Pesa"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            
            {/* 1. Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Direct Invites</p>
                <h3 className="text-4xl font-black text-gray-900">{stats?.total_invites}</h3>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Level</p>
                <div className="p-2 bg-gray-50 rounded-full mb-1">{currentRank.icon}</div>
              </div>
            </div>

            {/* 2. Earning Power (3-Tier Commission Structure) */}
            <div className="bg-gradient-to-br from-indigo-900 to-black rounded-3xl p-6 md:p-8 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="h-5 w-5 text-yellow-400" />
                <h3 className="text-lg font-bold">Your Earning Power</h3>
              </div>
              
              <ul className="space-y-5">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-full bg-green-500">
                    <Check className="h-3 w-3 text-white font-bold" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-white tracking-wide">Level 1: Ksh 150</p>
                    <p className="text-xs text-gray-400 mt-0.5">Earn instantly for every direct invite.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-full bg-blue-500">
                    <Check className="h-3 w-3 text-white font-bold" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-white tracking-wide">Level 2: Ksh 100</p>
                    <p className="text-xs text-gray-400 mt-0.5">Earn passively when your friends invite others.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-full bg-purple-500">
                    <Check className="h-3 w-3 text-white font-bold" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-white tracking-wide">Level 3: Ksh 50</p>
                    <p className="text-xs text-gray-400 mt-0.5">Earn even more when their friends invite people!</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* 3. VIP Perks Roadmap (Gamification) */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Unlock VIP Perks</h3>
              <ul className="space-y-4">
                <li className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-full ${stats && stats.total_invites >= 5 ? 'bg-blue-500' : 'bg-gray-200'}`}>
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${stats && stats.total_invites >= 5 ? 'text-gray-900' : 'text-gray-500'}`}>Unlimited Free Listings</span>
                  </div>
                  <span className="text-xs text-gray-400 font-bold">5 Invites</span>
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-full ${stats && stats.total_invites >= 20 ? 'bg-yellow-500' : 'bg-gray-200'}`}>
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${stats && stats.total_invites >= 20 ? 'text-gray-900' : 'text-gray-500'}`}>VIP Seller Badge</span>
                  </div>
                  <span className="text-xs text-gray-400 font-bold">20 Invites</span>
                </li>
              </ul>
            </div>

            {/* 4. Top 20 Leaderboard Promo (Visible to Everyone) */}
            <div className="bg-gradient-to-r from-yellow-100 to-orange-50 rounded-3xl p-6 border border-yellow-200 shadow-sm relative overflow-hidden">
              <Award className="absolute -right-4 -bottom-4 h-24 w-24 text-yellow-500 opacity-10" />
              <h3 className="font-black text-yellow-900 text-lg mb-1">Top 20 Leaderboard</h3>
              <p className="text-xs text-yellow-800 font-medium leading-relaxed">
                Finish the month in the Top 20 referrers to unlock a massive <span className="font-bold bg-yellow-200 px-1 rounded">10% Global Bonus Pool</span>. Keep inviting!
              </p>
            </div>

            {/* 5. ONLY VISIBLE TO THE SECRET FOUNDERS */}
            {stats?.is_founder && (
              <div className="bg-gradient-to-r from-yellow-100 to-orange-50 rounded-3xl p-6 border border-yellow-200 shadow-sm relative overflow-hidden mt-6">
                <Award className="absolute -right-4 -bottom-4 h-24 w-24 text-yellow-500 opacity-20" />
                <h3 className="font-black text-yellow-900 text-lg mb-1 flex items-center gap-2">
                  <Crown className="h-5 w-5" /> VIP Founder Bonus
                </h3>
                <p className="text-xs text-yellow-800 font-medium leading-relaxed">
                  As an exclusive Founding Member, you are earning an extra <span className="font-black text-yellow-900 bg-yellow-200 px-1 rounded">Ksh 10</span> passive commission for EVERY single user that joins anywhere in your entire network tree, forever!
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}