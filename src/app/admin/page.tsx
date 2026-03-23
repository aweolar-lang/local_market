"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  ShieldAlert, Users, DollarSign, Wallet, ArrowDownRight, 
  UserPlus, UserCheck, Activity, CheckCircle, Clock
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    affiliates: 0,
    directJoins: 0,
    referredJoins: 0,
    totalPlatformEarnings: 0,
    pendingWithdrawals: 0,
  });

  useEffect(() => {
    checkAdminStatusAndLoadData();
  }, []);

  const checkAdminStatusAndLoadData = async () => {
    // 1. Get the logged-in user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      router.push("/login");
      return;
    }

      // 2. Check if they are the Admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (!profile?.is_admin) { 
      router.push("/");
      return;
    }

    setIsAuthorized(true);
    
    const { data: profiles } = await supabase.from('profiles').select('*');
    
    if (profiles) {
      const totalUsers = profiles.length;
      const affiliates = profiles.filter(p => p.is_affiliate).length;
      const referredJoins = profiles.filter(p => p.referred_by !== null).length;
      const directJoins = totalUsers - referredJoins;
      
      const grossRevenue = affiliates * 400; 

      setStats({
        totalUsers,
        affiliates,
        directJoins,
        referredJoins,
        totalPlatformEarnings: grossRevenue, 
        pendingWithdrawals: 0, // Placeholder for when we build the withdrawals table
      });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <Activity className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
        <p className="font-bold tracking-widest text-gray-400">AUTHENTICATING ADMIN...</p>
      </div>
    );
  }

  if (!isAuthorized) return null; // Failsafe

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <ShieldAlert className="h-5 w-5" />
              <span className="text-sm font-bold tracking-widest uppercase">Level 10 Clearance</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Founder HQ</h1>
          </div>
          <Link href="/" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm font-bold rounded-lg transition-colors">
            Back to Marketplace
          </Link>
        </header>

        {/* TOP METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium text-sm">Total Accounts</h3>
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-white">{stats.totalUsers}</p>
            <p className="text-xs text-gray-500 mt-2 font-medium">Registered on LocalSoko</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium text-sm">Paid Affiliates</h3>
              <UserCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-white">{stats.affiliates}</p>
            <p className="text-xs text-gray-500 mt-2 font-medium">Activated via M-Pesa</p>
          </div>

          <div className="bg-gray-900 border border-emerald-900/50 p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <DollarSign className="w-24 h-24" />
            </div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-emerald-400 font-bold text-sm">Gross Revenue</h3>
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-white relative z-10">Ksh {stats.totalPlatformEarnings.toLocaleString()}</p>
            <p className="text-xs text-emerald-600/80 mt-2 font-bold relative z-10">Total money inside system</p>
          </div>

          <div className="bg-gray-900 border border-orange-900/50 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-orange-400 font-bold text-sm">Pending Payouts</h3>
              <Wallet className="h-5 w-5 text-orange-400" />
            </div>
            <p className="text-3xl font-black text-white">{stats.pendingWithdrawals}</p>
            <p className="text-xs text-orange-600/80 mt-2 font-bold">Awaiting your approval</p>
          </div>

        </div>

        {/* DETAILED SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* USER ACQUISITION DATA */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-400" />
                Acquisition Breakdown
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Direct Signups (No Referrer)</span>
                    <span className="font-bold text-white">{stats.directJoins}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${(stats.directJoins / stats.totalUsers) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Referred Signups (Affiliate Tree)</span>
                    <span className="font-bold text-white">{stats.referredJoins}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(stats.referredJoins / stats.totalUsers) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WITHDRAWAL REQUESTS (MOCKUP FOR NEXT STEP) */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5 text-orange-400" />
                Action Center: Payouts
              </h2>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <Clock className="h-10 w-10 text-gray-700 mb-3" />
              <p className="text-gray-400 font-medium">No pending withdrawal requests.</p>
              <p className="text-sm text-gray-600 mt-1">When users request their wallet balances, they will appear here for manual M-Pesa payment.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}