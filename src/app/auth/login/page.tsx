"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error', text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
      setIsLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (

    
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Welcome back</h2>

      {message && (
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3 text-sm bg-red-50 text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{message.text}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5 text-black">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Mail className="h-4 w-4 text-black" /> Email Address
          </label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" 
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Lock className="h-4 w-4 text-black" /> Password
          </label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
          <div className="flex justify-end mt-2">
            <Link href="/auth/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-medium">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-all disabled:opacity-70"
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </div>
      </form>

      <div className="text-center mt-6">
        <Link href="/auth/signup" className="text-sm text-green-600 hover:text-green-700 font-medium">
          Need an account? Sign Up
        </Link>
      </div>
    </div>
  );
}