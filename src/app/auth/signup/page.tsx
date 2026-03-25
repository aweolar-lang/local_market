"use client";

import { useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, AlertCircle, User as UserIcon, Phone } from "lucide-react";
import { useSearchParams } from "next/navigation"; 
import Link from "next/link";

function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref"); 

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

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
      setIsLoading(false);
    } else {
      // Redirect to the new verify page
      window.location.href = "/auth/verify";
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Create your account</h2>

      {message && (
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3 text-sm bg-red-50 text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-5 text-black">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <UserIcon className="h-4 w-4 text-black" /> First Name
          </label>
          <input 
            type="text" 
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value.replace(/\s+/g, ''))}
            placeholder="John"
            maxLength={10}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Phone className="h-4 w-4 text-black" /> Phone Number
          </label>
          <input 
            type="tel" 
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            maxLength={13}
            placeholder="0712345678" 
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

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
        </div>

        <div className="pt-2">
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-all disabled:opacity-70"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </div>
      </form>

      <div className="text-center mt-6">
        <Link href="/auth/login" className="text-sm text-green-600 hover:text-green-700 font-medium">
          Already have an account? Log In
        </Link>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-500">Loading form...</div>}>
      <SignUpForm />
    </Suspense>
  );
}