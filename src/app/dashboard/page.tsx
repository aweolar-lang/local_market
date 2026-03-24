"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Trash2, CheckCircle, Package, Loader2, ExternalLink, Smartphone, X, TrendingUp } from "lucide-react";
import { useUser } from "@/hooks/useUser";

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
  const [invitesCount, setInvitesCount] = useState(0);
   const { profile: secureProfile, user: authUser, loading: profileLoading } = useUser();

  // M-Pesa Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [paymentMessage, setPaymentMessage] = useState("");


  useEffect(() => {
    const fetchUserAndItems = async () => {
      if (!secureProfile || !authUser) return;

      setUser(authUser);

      const { data: itemsData } = await supabase
        .from("items")
        .select("*")
        .eq("seller_id", secureProfile.id)
        .order("created_at", { ascending: false });
        
      if (itemsData) setItems(itemsData as Item[]);

      setProfile(secureProfile);

      if (secureProfile.is_affiliate) {
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: 'exact', head: true })
          .eq("referred_by", secureProfile.id);
          
        setInvitesCount(count || 0);
      }

      setLoading(false);
    };

    fetchUserAndItems();
  }, [secureProfile, authUser]);
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

 // 2. Mark Item as Sold Action
  const handleMarkAsSold = async (id: string) => {
    const { error } = await supabase
      .from("items")
      .update({ status: "sold" })
      .eq("id", id);

    if (!error) {
      // Update the UI instantly without reloading the page
      setItems(items.map(item => item.id === id ? { ...item, status: "sold" } : item));
      alert("Item marked as sold! It will no longer appear on the home page.");
    } else {
      alert("Failed to update status.");
    }
  };

  // 3. Delete Item Action
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this listing permanently?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", id);

    if (!error) {
      // Remove the item from the UI instantly
      setItems(items.filter(item => item.id !== id));
    } else {
      alert("Failed to delete item.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 px-4 mt-8">
      
      {profile && (
  <div className="mb-8 bg-gradient-to-r from-gray-900 to-black p-6 md:p-8 rounded-2xl shadow-lg border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
    
    {/* Stats Snapshot */}
    <div className="flex gap-8 items-center w-full md:w-auto">
      <div>
        <p className="text-gray-400 text-xs md:text-sm mb-1 uppercase tracking-wider font-semibold">Wallet Balance</p>
        <h2 className="text-2xl md:text-3xl font-black text-green-400">
          Ksh {profile.wallet_balance.toLocaleString()}
        </h2>
      </div>
      <div className="w-px h-10 md:h-12 bg-gray-800"></div>
      <div>
        <p className="text-gray-400 text-xs md:text-sm mb-1 uppercase tracking-wider font-semibold">Total Invites</p>
        <h2 className="text-2xl md:text-3xl font-black text-white">
          {invitesCount}
        </h2>
      </div>
    </div>

    {/* Actions Container: Stacked buttons on mobile and desktop */}
    <div className="flex flex-col gap-3 w-full md:w-auto">
      {/* Primary Dynamic Button based on status */}
      {profile.is_affiliate ? (
        <Link 
          href="/affiliate" 
          className="w-full bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-xl font-bold transition-all shadow-sm text-center whitespace-nowrap"
        >
          Manage Affiliate Account
        </Link>
      ) : (
        <Link 
          href="/affiliate" 
          className="w-full bg-green-600 hover:bg-green-500 text-white hover:text-black px-6 py-3 rounded-xl font-bold transition-all shadow-sm text-center whitespace-nowrap animate-pulse border border-green-500"
        >
          Activate to Earn
        </Link>
      )}

      {/* Secondary Guide Button */}
      <Link
        href="/affiliate-guide"
        className="w-full text-center text-sm font-semibold bg-gray-800 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 bg-gray-800/30 px-6 py-2.5 rounded-xl transition-all"
      >
        Read the Affiliate Guide
      </Link>
    </div>
  </div>
)}
  
       {/* Dashboard Header */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your active and sold items.</p>
        </div>
        <Link 
          href="/sell" 
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
        >
          + Post New Item
        </Link>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900">You haven&apos;t posted anything yet.</h2>
          <p className="text-gray-500 mt-2">Time to clean out the closet and make some cash!</p>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center transition-all hover:shadow-md">
            
            {/* Image Thumbnail */}
            <div className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
              {item.status === "sold" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-xs uppercase tracking-wider">Sold</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">{item.title}</h3>
              <p className="text-green-600 font-bold mb-1">Ksh {item.price.toLocaleString()}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  item.status === 'active' ? 'bg-green-100 text-green-700' : 
                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {item.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Actions (Buttons) */}
            <div className="flex flex-wrap justify-center gap-2 w-full md:w-auto">
              {item.status !== "sold" && (
                <Link 
                  href={`/${item.slug}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                >
                  <ExternalLink className="h-4 w-4" /> View
                </Link>
              )}
              
              {item.status !== "sold" && (
                <button 
                  onClick={() => handleMarkAsSold(item.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors border border-blue-200"
                >
                  <CheckCircle className="h-4 w-4" /> Mark Sold
                </button>
              )}

              <button 
                onClick={() => handleDelete(item.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors border border-red-200"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>

          </div>
        ))}
      </div>

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