"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Wallet, Users, ArrowLeft, Copy, Check, TrendingUp, Award } from "lucide-react";

interface AffiliateStats {
  referral_code: string;
  wallet_balance: number;
  total_invites: number;
}

export default function AffiliateDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");

  useEffect(() => {
    // Get the base URL so we can generate the invite link
    setSiteUrl(window.location.origin);

    const fetchAffiliateData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // 1. Fetch their profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_affiliate, referral_code, wallet_balance")
        .eq("id", session.user.id)
        .single();

      // Security check: Kick them out if they haven't paid!
      if (!profile || !profile.is_affiliate) {
        router.push("/dashboard"); 
        return;
      }

      // 2. Fetch how many people they have invited (Level 1)
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true })
        .eq("referred_by", session.user.id);

      setStats({
        referral_code: profile.referral_code || "",
        wallet_balance: profile.wallet_balance || 0,
        total_invites: count || 0,
      });

      setLoading(false);
    };

    fetchAffiliateData();
  }, [router]);

  const copyToClipboard = () => {
    if (!stats) return;
    navigator.clipboard.writeText(`${siteUrl}/login?ref=${stats.referral_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Top Navigation Strip */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-black font-medium transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to Marketplace
          </Link>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            Partner Portal
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        
        {/* Header & Main Wallet Card */}
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
              <button className="bg-green-500 hover:bg-green-400 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-500/20">
                Withdraw Funds
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Your Invite Link Card */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="h-6 w-6" /></div>
              <h3 className="text-xl font-bold text-gray-900">Your Invite Link</h3>
            </div>
            <p className="text-gray-500 text-sm mb-4">Share this link. When someone signs up and activates their account, you earn up to Ksh 150 instantly.</p>
            
            <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1">
              <input 
                readOnly
                value={`${siteUrl}/login?ref=${stats?.referral_code}`}
                className="bg-transparent flex-1 px-4 text-sm text-gray-600 outline-none truncate"
              />
              <button 
                onClick={copyToClipboard}
                className="bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 shrink-0"
              >
                {copied ? <><Check className="h-4 w-4 text-green-500"/> Copied!</> : <><Copy className="h-4 w-4"/> Copy Link</>}
              </button>
            </div>
          </div>

          {/* Network Performance Card */}
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
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium mb-1">Referral Code</p>
                <p className="text-xl font-bold text-gray-900 tracking-wider pt-1">{stats?.referral_code}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}