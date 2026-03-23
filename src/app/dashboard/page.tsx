"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Trash2, CheckCircle, Package, Loader2, ExternalLink, Smartphone, X, TrendingUp } from "lucide-react";

interface Item {
  id: string;
  title: string;
  price: number;
  images: string[];
  status: string;
  created_at: string;
  slug: string;
}

interface UserProfile {
  is_affiliate: boolean;
  referral_code: string | null;
  wallet_balance: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // M-Pesa Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [paymentMessage, setPaymentMessage] = useState("");

  useEffect(() => {
    const fetchUserAndItems = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      const { data: itemsData } = await supabase
        .from("items")
        .select("*")
        .eq("seller_id", session.user.id)
        .order("created_at", { ascending: false });
      if (itemsData) setItems(itemsData as Item[]);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_affiliate, referral_code, wallet_balance")
        .eq("id", session.user.id)
        .maybeSingle();
      if (profileData) setProfile(profileData);

      setLoading(false);
    };

    fetchUserAndItems();
  }, [router]);

  const handleMpesaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStatus('loading');
    setPaymentMessage("");

    try {
      const res = await fetch("/api/mpesa/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneInput, userId: user?.id }),
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

  // ... (Keep handleMarkAsSold and handleDelete functions exactly as they were) ...
  const handleMarkAsSold = async (id: string) => { /* your existing code */ };
  const handleDelete = async (id: string) => { /* your existing code */ };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 px-4 mt-8">
      
      {/* 1. The Switcher / Upsell Banner */}
      {profile && (
        <div className="mb-8">
          {profile.is_affiliate ? (
            <div className="bg-gradient-to-r from-gray-900 to-black p-6 md:p-8 rounded-2xl shadow-lg border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-semibold">Affiliate Status</p>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="text-green-400 h-6 w-6" /> Active Partner
                </h2>
              </div>
              <Link 
                href="/affiliate" 
                className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-xl font-bold transition-all shadow-sm text-center"
              >
                Go to Affiliate Dashboard
              </Link>
            </div>
          ) : (
            <div className="bg-green-50 p-6 md:p-8 rounded-2xl shadow-sm border border-green-200 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-xl font-bold text-green-900">Want to earn passive income?</h2>
                <p className="text-green-700 text-sm mt-1">Join the Affiliate Program for Ksh 400 and earn up to Ksh 150 for every friend you invite.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm shrink-0 whitespace-nowrap"
              >
                Activate Affiliate Account
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* 2. Your existing Listings UI goes here... */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your marketplace items.</p>
        </div>
        <Link href="/sell" className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm">+ Post Item</Link>
      </div>

      {/* ... (Keep your existing items mapping code here) ... */}


      {/* 3. The Professional M-Pesa Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Activate Affiliate</h3>
                <p className="text-sm text-gray-500">Pay Ksh 400 via M-Pesa</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {paymentStatus === 'success' ? (
                <div className="text-center py-6 space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Smartphone className="h-8 w-8 text-green-600 animate-pulse" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Check your phone!</h4>
                  <p className="text-gray-600">{paymentMessage}</p>
                  <p className="text-sm text-gray-400 mt-4">This page will automatically update once payment is confirmed.</p>
                </div>
              ) : (
                <form onSubmit={handleMpesaSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">M-Pesa Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-medium">+254</span>
                      </div>
                      <input 
                        type="tel" 
                        required
                        placeholder="712345678"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Enter your Safaricom number (e.g. 07... or 7...)</p>
                  </div>

                  {paymentStatus === 'error' && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                      {paymentMessage}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={paymentStatus === 'loading'}
                    className="w-full bg-[#52B44B] hover:bg-[#43963d] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                  >
                    {paymentStatus === 'loading' ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                    ) : (
                      "Pay Ksh 400"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}