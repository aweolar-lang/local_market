"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lock, AlertCircle } from "lucide-react";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
      setIsLoading(false);
    } else {
      setMessage({ type: 'success', text: "Password updated successfully! Redirecting..." });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Set New Password</h2>
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{message.text}</p>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Lock className="h-4 w-4 text-black" /> New Password
          </label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password" 
            minLength={6}
            maxLength={20}
            className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-all disabled:opacity-70"
        >
          {isLoading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}