"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Users, DollarSign, Wallet, ArrowDownRight, 
  Activity, Clock, Landmark, CheckCircle, ListOrdered, UserCheck,
  Shield, Crown
} from "lucide-react";
import { useUser } from "@/hooks/useUser";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { profile: secureProfile, user: authUser, loading: profileLoading } = useUser();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    affiliates: 0,
    directJoins: 0,
    referredJoins: 0,
    grossRevenue: 0,
    usersUnclaimedMoney: 0,
    platformProfit: 0,
    adminPersonalWallet: 0,
    totalAdmins: 0,      
    totalFounders: 0,   
  });

  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);

  useEffect(() => {
    if (!secureProfile || !authUser) return;

    if (secureProfile.is_admin !== true) {
      console.warn("Unauthorized access. Redirecting to dashboard.");
      router.push("/dashboard");
      return;
    }

    checkAdminStatusAndLoadData();
    
  }, [secureProfile, authUser, router]);

  const checkAdminStatusAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { router.push("/auth/login"); return; }

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
    await fetchAllData(currentUser.wallet_balance || 0);
  };

  const fetchAllData = async (adminWallet: number) => {
    // 1. Fetch from the new Master Ledger View! (No frontend math needed)
    const { data: dbStats, error: statsError } = await supabase
      .from('system_master_ledger')
      .select('*')
      .single();

    if (dbStats && !statsError) {
      setStats({
        totalUsers: dbStats.total_registered_users || 0,
        affiliates: dbStats.active_paid_users || 0,
        directJoins: dbStats.direct_joins || 0,
        referredJoins: dbStats.referred_joins || 0,
        grossRevenue: dbStats.gross_revenue || 0,
        usersUnclaimedMoney: dbStats.total_customers_money || 0,
        platformProfit: dbStats.gross_platform_profit || 0,
        adminPersonalWallet: adminWallet,
        totalAdmins: dbStats.total_admins || 0,
        totalFounders: dbStats.total_founders || 0,
      });
    }

    // 2. Fetch Pending Withdrawals
    const { data: withdrawals } = await supabase
      .from('withdrawals2')
      .select('*, profiles(username)')
      .eq('status', 'processing')
      .order('created_at', { ascending: false });
    
    if (withdrawals) setPendingWithdrawals(withdrawals);

    // 3. Fetch Master Ledger Book
    const { data: ledger } = await supabase
      .from('transactions')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (ledger) setLedgerEntries(ledger);

    setLoading(false);
  };

  // MARK A WITHDRAWAL AS PAID (Kept as a manual fallback just in case Safaricom B2C fails)
  const handleMarkAsPaid = async (withdrawalId: string) => {
    const confirmPay = window.confirm("Did you actually send the M-Pesa to this user? This cannot be undone.");
    if (!confirmPay) return;

    try {
      const { error } = await supabase
        .from('withdrawals2')
        .update({ 
          status: 'completed', 
          processed_at: new Date().toISOString() 
        })
        .eq('id', withdrawalId);

      if (error) throw error;
      
      alert("Successfully marked as paid!");
      const { data: { session } } = await supabase.auth.getSession();
      const { data: user } = await supabase.from('profiles').select('wallet_balance').eq('id', session?.user.id).single();
      fetchAllData(user?.wallet_balance || 0);

    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
        <Activity className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
        <p className="font-bold tracking-widest text-gray-400">LOADING FOUNDER HQ...</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Crown className="h-7 w-7 text-yellow-500" />
            Founder HQ
          </h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Global System Overview & Management</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Link 
            href="/admin/network" 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            <Users className="h-4 w-4 text-purple-400" />
            Network Map
          </Link>
          <Link 
            href="/admin/withdrawals" 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            <ArrowDownRight className="h-4 w-4 text-orange-400" />
            Manage Payouts
          </Link>
        </div>
      </div>
      
      {/* 1. FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-gray-400 font-bold text-sm">Gross Revenue</h3>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-3xl font-black text-white relative z-10">Ksh {stats.grossRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-orange-900/50 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-orange-400 font-bold text-sm">Users' Balances</h3>
            <Users className="h-5 w-5 text-orange-400" />
          </div>
          <p className="text-3xl font-black text-white">Ksh {stats.usersUnclaimedMoney.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-emerald-900/50 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-emerald-400 font-bold text-sm">Platform Profit</h3>
            <Activity className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">Ksh {stats.platformProfit.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-blue-900/50 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-400 font-bold text-sm">Your Wallet</h3>
            <Wallet className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white">Ksh {stats.adminPersonalWallet.toLocaleString()}</p>
        </div>
      </div>

      {/* 2. MIDDLE ROW: GROWTH & ACTION QUEUE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* NETWORK GROWTH & ELITE TRACKING */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-purple-400" />
              Network Growth
            </h2>
            <span className="bg-gray-800 text-gray-300 text-xs font-bold px-3 py-1 rounded-full border border-gray-700">
              {stats.affiliates} Paid / {stats.totalUsers} Total
            </span>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              {/* standard growth bars */}
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

            {/* NEW: ELITE RANKS TRACKING */}
            <div className="mt-8 pt-6 border-t border-gray-800 grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admins</span>
                </div>
                <p className="text-2xl font-black text-white">{stats.totalAdmins}</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-xl border border-yellow-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Founders</span>
                </div>
                <p className="text-2xl font-black text-yellow-500">{stats.totalFounders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION QUEUE: PAYOUTS */}
        <div className="bg-gray-900 border border-orange-900/50 rounded-2xl shadow-lg overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-orange-500/5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-orange-400" />
              Action Queue: Payouts
            </h2>
            <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-full border border-orange-500/30">
              {pendingWithdrawals.length} Pending
            </span>
          </div>
          <div className="flex-1 p-0 overflow-y-auto max-h-[300px]">
            {pendingWithdrawals.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center h-full">
                <CheckCircle className="h-10 w-10 text-gray-700 mb-3" />
                <p className="text-gray-400 font-medium">All caught up!</p>
                <p className="text-sm text-gray-600 mt-1">No pending withdrawal requests.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-800">
                {pendingWithdrawals.map((req) => (
                  <li key={req.id} className="p-6 hover:bg-gray-800/50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white text-lg">Ksh {req.amount}</span>
                          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md">
                            {req.profiles?.username || "Unknown User"}
                          </span>
                        </div>
                        <p className="text-emerald-400 font-mono text-sm font-bold tracking-wider">
                          Send to: {req.phone_number}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Requested: {new Date(req.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleMarkAsPaid(req.id)}
                        className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-2 px-4 rounded-xl transition-colors"
                      >
                        Mark as Paid
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ROW: MASTER LEDGER BOOK (FULL WIDTH) */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ListOrdered className="h-5 w-5 text-blue-400" />
            Master Ledger Book
          </h2>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Platform Activity</span>
        </div>
        <div className="p-0 overflow-y-auto max-h-[400px]">
          {ledgerEntries.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No transactions recorded yet.</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-gray-800/50 text-xs uppercase text-gray-500 sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-bold">Date & Time</th>
                  <th className="px-6 py-3 font-bold">User</th>
                  <th className="px-6 py-3 font-bold">Description</th>
                  <th className="px-6 py-3 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {ledgerEntries.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(txn.created_at).toLocaleDateString()} <span className="text-gray-600 ml-1">{new Date(txn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded-md border border-gray-700">
                        {txn.profiles?.username || "System"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{txn.description}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-black ${txn.amount > 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                      {txn.amount > 0 ? '+' : ''}Ksh {Math.abs(txn.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}