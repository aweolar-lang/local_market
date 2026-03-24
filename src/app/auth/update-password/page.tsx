"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Lock className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-white text-center mb-2">Create New Password</h2>
        <p className="text-gray-400 text-center text-sm mb-8">
          Enter your new password below. Make sure it is secure!
        </p>

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">Password updated successfully! Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password (min. 6 characters)"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || password.length < 6}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}