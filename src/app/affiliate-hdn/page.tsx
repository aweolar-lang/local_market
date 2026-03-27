"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ArrowRight, CheckCircle } from "lucide-react";
// import { supabase } from "@/lib/supabase"; // Uncomment when ready to link to your database

export default function AffiliateCountdownPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });
  const [isMounted, setIsMounted] = useState(false);
  
  // Waitlist State
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    setIsMounted(true);
    // Target: April 1, 2026 at 00:00:00 EAT (UTC+3)
    const targetDate = new Date("2026-04-01T00:00:00+03:00").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // MOCK DELAY: Simulating a database save for the UI
    setTimeout(() => {
      setStatus('success');
      setEmail("");
    }, 1500);

    /* SUPABASE INTEGRATION (Uncomment when you create a 'waitlist' table)
    const { error } = await supabase.from('waitlist').insert([{ email }]);
    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
      setEmail("");
    }
    */
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col justify-center items-center py-12 px-4 relative overflow-hidden">
      
      {/* Premium Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-400/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-3xl z-10 text-center">
        
        {/* Header Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-bold tracking-wide uppercase mb-8 border border-green-100 shadow-sm">
          <Clock className="w-4 h-4" />
          <span>Platform Launching Soon</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight mb-6">
          The Future of Kenyan <br className="hidden sm:block" />
          <span className="text-green-600">E-commerce & Affiliates</span>
        </h1>
        
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10 font-medium">
          LocalSoko is actively upgrading its affiliate engine. The official Partner Hub and E-commerce marketplace will go live in:
        </p>

        {/* VIP Countdown Cards */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-12">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Minutes", value: timeLeft.minutes },
            { label: "Seconds", value: timeLeft.seconds },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <div className="w-20 h-24 sm:w-28 sm:h-32 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-center mb-3 transition-transform hover:-translate-y-1">
                <span className="text-4xl sm:text-5xl font-black text-green-600">
                  {item.value.toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-400 tracking-widest uppercase">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* WAITLIST FORM */}
        <div className="max-w-md mx-auto mb-12">
          {status === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="text-green-900 font-bold text-lg">You're on the list!</h3>
              <p className="text-green-700 text-sm mt-1">We'll notify you the second we go live.</p>
            </div>
          ) : (
            <form onSubmit={handleJoinWaitlist} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 px-5 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none shadow-sm transition-all text-gray-900 placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-70 whitespace-nowrap"
              >
                {status === 'loading' ? 'Joining...' : 'Notify Me'}
                {status !== 'loading' && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
          {status === 'error' && (
             <p className="text-red-500 text-sm mt-3 text-left pl-2">Oops! Something went wrong. Please try again.</p>
          )}
        </div>

        <Link href="/" className="text-sm font-bold text-gray-400 hover:text-green-600 transition-colors inline-block pb-10">
          &larr; Return to Homepage
        </Link>
      </div>
    </div>
  );
}