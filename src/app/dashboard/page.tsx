"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js"; // <-- Strictly typed!
import Image from "next/image";
import { Package, CreditCard, CheckCircle, Clock } from "lucide-react";

export interface Item {
  id: string;
  seller_id: string;
  title: string;
  price: number;
  description: string;
  county: string;
  town: string;
  seller_phone: string;
  images: string[];
  status: 'active' | 'pending_payment';
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      // 1. Get the current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }
      
      setUser(session.user);

      // 2. Fetch ONLY this user's items
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('seller_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) setItems(data);
      setIsLoading(false);
    };

    fetchUserData();
  }, [router]);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading your dashboard...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your listings and payments.</p>
        </div>
        <button 
          onClick={() => router.push("/sell")}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          + Post New Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
          <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-900">No items listed yet</h2>
          <p className="text-gray-500 mt-2">Start selling by posting your first item.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6 hover:bg-gray-50 transition-colors">
                
                {/* Thumbnail */}
                <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <Image 
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    unoptimized={true}
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="grow text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-green-600 font-medium mt-1">Ksh {item.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">{item.town}, {item.county}</p>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
                  {item.status === 'active' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700">
                      <CheckCircle className="h-4 w-4" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-orange-50 text-orange-700">
                      <Clock className="h-4 w-4" /> Pending Payment
                    </span>
                  )}

                  {/* If they haven't paid, show them the pay button again */}
                  {item.status === 'pending_payment' && (
                    <button 
                      onClick={() => router.push(`/pay/${item.id}`)}
                      className="flex items-center gap-2 text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
                    >
                      <CreditCard className="h-4 w-4" /> Pay Ksh 100
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}