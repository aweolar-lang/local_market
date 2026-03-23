"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Users, DollarSign, Wallet, ArrowDownRight, 
  UserPlus, UserCheck, Activity, Clock, Landmark
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    affiliates: 0,
    directJoins: 0,
    referredJoins: 0,
    grossRevenue: 0,
    usersUnclaimedMoney: 0,
    platformProfit: 0,
    adminPersonalWallet: 0,
    pendingWithdrawals: 0,
  });

  useEffect(() => {
    checkAdminStatusAndLoadData();
  }, []);

  const checkAdminStatusAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { router.push("/login"); return; }

    const { data: currentUser } = await supabase
      .from('profiles')
      .select('is_admin, wallet_balance')
      .eq('id', session.user.id)
      .single();

    if (!currentUser?.is_admin) {
      router.push("/");
      return;
    }

    setIsAuthorized(true);
    
    // Fetch ALL profiles to do the accounting math
    const { data: profiles } = await supabase.from('profiles').select('*');
    
    if (profiles) {
      const totalUsers = profiles.length;
      const affiliates = profiles.filter(p => p.is_affiliate).length;
      const referredJoins = profiles.filter(p => p.referred_by !== null).length;
      const directJoins = totalUsers - referredJoins;
      
      // THE MONEY MATH
      const grossRevenue = affiliates * 400; // Total activation fees collected
      
      // Sum up everyone's wallet balance EXCEPT the admin's
      const usersUnclaimedMoney = profiles
        .filter(p => !p.is_admin)
        .reduce((sum, p) => sum + (p.wallet_balance || 0), 0);
        
      // The admin's personal affiliate earnings
      const adminPersonalWallet = currentUser.wallet_balance || 0;

      // The "House" Profit = Total Money In - Money Owed to Users - Admin's Affiliate Cut
      const platformProfit = grossRevenue - usersUnclaimedMoney - adminPersonalWallet;

      setStats({
        totalUsers,
        affiliates,
        directJoins,
        referredJoins,
        grossRevenue,
        usersUnclaimedMoney,
        platformProfit,
        adminPersonalWallet,
        pendingWithdrawals: 0, // Placeholder
      });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
        <Activity className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
        <p className="font-bold tracking-widest text-gray-400">LOADING FINANCIALS...</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* FINANCIAL SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Landmark className="w-24 h-24" />
            </div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-gray-400 font-bold text-sm">Gross Revenue</h3>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-black text-white relative z-10">Ksh {stats.grossRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2 font-medium relative z-10">Total M-Pesa deposits</p>
          </div>

          <div className="bg-gray-900 border border-orange-900/50 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-orange-400 font-bold text-sm">Users' Balances</h3>
              <Users className="h-5 w-5 text-orange-400" />
            </div>
            <p className="text-3xl font-black text-white">Ksh {stats.usersUnclaimedMoney.toLocaleString()}</p>
            <p className="text-xs text-orange-600/80 mt-2 font-bold">Liability: Owed to affiliates</p>
          </div>

          <div className="bg-gray-900 border border-emerald-900/50 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-emerald-400 font-bold text-sm">Platform Profit</h3>
              <Activity className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400">Ksh {stats.platformProfit.toLocaleString()}</p>
            <p className="text-xs text-emerald-600/80 mt-2 font-bold">Safe to withdraw to bank</p>
          </div>

          <div className="bg-gray-900 border border-blue-900/50 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-blue-400 font-bold text-sm">Your Affiliate Wallet</h3>
              <Wallet className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-white">Ksh {stats.adminPersonalWallet.toLocaleString()}</p>
            <p className="text-xs text-blue-600/80 mt-2 font-bold">Your personal referral earnings</p>
          </div>

        </div>

        {/* DETAILS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* USER DATA */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-purple-400" />
                Network Growth
              </h2>
              <span className="bg-gray-800 text-gray-300 text-xs font-bold px-3 py-1 rounded-full border border-gray-700">
                {stats.affiliates} Paid / {stats.totalUsers} Total
              </span>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Direct Signups (No Referrer)</span>
                  <span className="font-bold text-white">{stats.directJoins}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-gray-500 h-2 rounded-full" style={{ width: stats.totalUsers > 0 ? `${(stats.directJoins / stats.totalUsers) * 100}%` : '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Referred Signups (Affiliate Tree)</span>
                  <span className="font-bold text-white">{stats.referredJoins}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: stats.totalUsers > 0 ? `${(stats.referredJoins / stats.totalUsers) * 100}%` : '0%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* WITHDRAWAL REQUESTS */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5 text-orange-400" />
                Pending Payouts
              </h2>
              <span className="bg-orange-500/10 text-orange-400 text-xs font-bold px-3 py-1 rounded-full border border-orange-500/20">
                {stats.pendingWithdrawals} Requests
              </span>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <Clock className="h-10 w-10 text-gray-700 mb-3" />
              <p className="text-gray-400 font-medium">No pending withdrawal requests.</p>
              <p className="text-sm text-gray-600 mt-1">When users request a payout, you will see their M-Pesa details here.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}