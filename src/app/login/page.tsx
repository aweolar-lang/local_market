"use client";

import { useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, AlertCircle, User as UserIcon, Phone } from "lucide-react";
import { useSearchParams } from "next/navigation"; 
import { toast } from "sonner";

function AuthForm() {
  // Add a state to toggle between Login and Sign Up views
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");     // NEW
  const [phoneNumber, setPhoneNumber] = useState(""); // NEW
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref"); 

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (isSignUp) {
      // --- SIGN UP LOGIC ---
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,       
            phone_number: phoneNumber, 
            referred_by_code: referralCode || null, 
          }
        }
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        toast.success("Success! Check your email to confirm your account.");
        window.location.href = "/login";
      }
    } else {
      // --- LOGIN LOGIC ---
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        window.location.href = "/dashboard";
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
      
      {/* Error / Success Messages */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{message.text}</p>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-5 text-black">
        
        {isSignUp && (
          <>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="h-4 w-4 text-black" />
                First Name
              </label>
              <input 
                type="text" 
                required={isSignUp}
                value={fullName}
                onChange={(e) => setFullName(e.target.value.replace(/\s+/g, ''))}
                placeholder="John"
                maxLength={10}
                className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 text-black" />
                Phone Number
              </label>
              <input 
                type="tel" 
                required={isSignUp}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={13}
                placeholder="0712345678" 
                className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </>
        )}

        {/* ALWAYS SHOW EMAIL & PASSWORD */}
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
            className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

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
            className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-all"
          >
            {isLoading ? "Loading..." : (isSignUp ? "Create Account" : "Log In")}
          </button>
          
          <div className="text-center mt-4">
            <button 
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage(null);
              }}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              {isSignUp ? "Already have an account? Log In" : "Need an account? Sign Up"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="text-center mb-8 bg-black p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-100">Welcome to LocalSoko</h1>
        <p className="text-gray-300 mt-2">Log in or create an account to start selling.</p>
      </div>

      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <AuthForm />
      </Suspense>
    </div>
  );
}