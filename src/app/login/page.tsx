"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  // Handles creating a brand new account
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: "Success! Check your email to confirm your account." });
    }
    setIsLoading(false);
  };

  // Handles logging into an existing account
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
    } else {
      // If successful, redirect them back to the sell page
      window.location.href = "/sell";
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="text-center mb-8 bg-black p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-100">Welcome to LocalSoko</h1>
        <p className="text-gray-300 mt-2">Log in or create an account to start selling.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Error / Success Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{message.text}</p>
          </div>
        )}

        <form className="space-y-5 text-black">
          {/* Email Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 text-black" />
              Email Address
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" 
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Lock className="h-4 w-4 text-black" />
              Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? "Loading..." : "Log In"}
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="grow border-t border-gray-200"></div>
              <span className="shrink-0 px-4 text-sm text-gray-400">or</span>
              <div className="grow border-t border-gray-200"></div>
            </div>

            <button 
              onClick={handleSignUp}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              Create New Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}