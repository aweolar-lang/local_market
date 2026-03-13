"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js"; // Strictly typing our user!
import { Store, PlusCircle, LayoutDashboard, LogOut, LogIn } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 1. Check if the user is logged in right now
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. Listen for changes (e.g., if they just logged in or logged out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup the listener when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Left Side: Logo */}
          <Link href="/" className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors">
            <Store className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tight text-gray-900">LocalSoko</span>
          </Link>

          {/* Right Side: Navigation Links */}
          <div className="flex items-center gap-4">
            
            {/* Always show the Post Ad button */}
            <Link 
              href="/sell" 
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <PlusCircle className="h-4 w-4" /> Post Ad
            </Link>

            {/* Dynamic Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3 border-l border-gray-200 pl-4 ml-2">
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" /> 
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> 
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-gray-200 pl-4 ml-2">
                <Link 
                  href="/login" 
                  className="flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <LogIn className="h-4 w-4" /> Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}