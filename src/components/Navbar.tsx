"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js"; 
import { Store, PlusCircle, LayoutDashboard, LogOut, LogIn, Crown } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      try { subscription.unsubscribe(); } catch (e) { /* noop */ }
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Left: Logo & Affiliate Link */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Logo */}
            <Link href="/" aria-label="Go to LocalSoko home" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 rounded">
              <Store className="h-6 w-6" aria-hidden="true" />
              <span className="font-bold text-xl tracking-tight text-gray-900 hidden xs:block">LocalSoko</span>
            </Link>

            {/* NEW: VIP Partner Hub Link */}
            <Link
              href="/affiliate"
              className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:border-yellow-400 text-yellow-800 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all shadow-sm hover:shadow"
            >
              <Crown className="h-3.5 w-3.5 text-yellow-600" />
              <span className="hidden sm:inline">Partner Hub</span>
              <span className="sm:hidden">Earn</span>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Post Ad */}
            <Link
              href="/sell"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300"
              aria-label="Post an item for sale"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Ad</span>
            </Link>

            <Link
              href="/sell"
              className="inline-flex sm:hidden items-center justify-center p-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300"
              aria-label="Post an item for sale"
              title="Post Ad"
            >
              <PlusCircle className="h-5 w-5" />
            </Link>

            {/* Dynamic Auth area */}
            {user ? (
              <div className="flex items-center gap-3 border-l border-gray-200 pl-4 ml-1 sm:ml-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 rounded"
                  aria-label="Go to dashboard"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gray-300 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                      <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-gray-200 pl-4 ml-1 sm:ml-2">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  aria-label="Sign in to LocalSoko"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}