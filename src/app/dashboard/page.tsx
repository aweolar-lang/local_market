"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Trash2, CheckCircle, Package, Loader2, ExternalLink } from "lucide-react";

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
  const [copyText, setCopyText] = useState("Copy Link");

  // 1. Authenticate & Fetch User's Items
  useEffect(() => {
    const fetchUserAndItems = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      // Fetch the items
      const { data: itemsData } = await supabase
        .from("items")
        .select("*")
        .eq("seller_id", session.user.id)
        .order("created_at", { ascending: false });
      if (itemsData) setItems(itemsData as Item[]);

      // Fetch the user's profile for the affiliate data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_affiliate, referral_code, wallet_balance")
        .eq("id", session.user.id)
        .single();
      if (profileData) setProfile(profileData);

      setLoading(false);
    };

    fetchUserAndItems();
  }, [router]);

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

const handleActivateAffiliate = async () => {
  // Ask the user for their M-Pesa number
  const phone = window.prompt("Enter your M-Pesa number (e.g., 0712345678):");
  if (!phone) return;

  alert("Sending M-Pesa prompt to your phone...");

  try {
    const res = await fetch("/api/mpesa/stk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        phoneNumber: phone, 
        userId: user?.id
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert("Check your phone! Enter your PIN to activate.");
    } else {
      alert("Failed to send prompt: " + data.error);
    }
  } catch (err) {
    alert("Something went wrong.");
  }
};

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Affiliate & Wallet Section */}
      {profile && (
        <div className="mb-8">
          {profile.is_affiliate ? (
            // The Affiliate Wallet View
            <div className="bg-black text-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Available Balance</p>
                <h2 className="text-3xl font-bold text-green-400">Ksh {profile.wallet_balance.toLocaleString()}</h2>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`https://yoursite.com/login?ref=${profile.referral_code}`);
                    setCopyText("Copied!");
                    setTimeout(() => setCopyText("Copy Link"), 2000);
                  }}
                  className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-all text-sm border border-gray-700 flex items-center justify-center gap-2"
                >
                  {copyText}
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm text-sm">
                  Withdraw to M-Pesa
                </button>
              </div>
            </div>
          ) : (
            // The Upsell Promo View (If they haven't paid the 400 bob yet)
            <div className="bg-green-50 p-6 md:p-8 rounded-2xl shadow-sm border border-green-200 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-xl font-bold text-green-900">Want to earn passive income?</h2>
                <p className="text-green-700 text-sm mt-1">Join the Affiliate Program for Ksh 400 and earn up to Ksh 150 for every friend you invite to LocalSoko.</p>
              </div>
              <button 
                // We will link this to the M-Pesa payment route later!
                onClick={handleActivateAffiliate}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm shrink-0 whitespace-nowrap"
              >
                Activate for Ksh 400
              </button>
            </div>
          )}
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
    </div>
  );
}
