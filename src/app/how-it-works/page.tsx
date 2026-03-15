"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Search, MessageCircle, Handshake, 
  Camera, Tag, DollarSign, ShieldCheck, UserCheck, 
  MapPin, ShoppingBag, Store
} from "lucide-react";

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. HERO SECTION */}
      <div className="bg-emerald-700 text-white pt-16 pb-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-emerald-300 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-200 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            How LocalSoko Works
          </h1>
          <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Your neighborhood marketplace designed for safe, fast, and hassle-free local deals.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
        
        {/* 2. INTERACTIVE TOGGLE */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 flex flex-col sm:flex-row gap-2 max-w-lg mx-auto mb-16">
          <button
            onClick={() => setActiveTab("buy")}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base transition-all ${
              activeTab === "buy" 
                ? "bg-emerald-600 text-white shadow-md" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            I want to Buy
          </button>
          <button
            onClick={() => setActiveTab("sell")}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base transition-all ${
              activeTab === "sell" 
                ? "bg-emerald-600 text-white shadow-md" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Store className="h-5 w-5" />
            I want to Sell
          </button>
        </div>

        {/* 3. STEP-BY-STEP GUIDES */}
        
        {/* BUYER GUIDE */}
        {activeTab === "buy" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900">Find what you need, right next door.</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-emerald-50 w-24 h-24 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                <div className="bg-emerald-100 w-14 h-14 flex items-center justify-center rounded-2xl mb-6 text-emerald-600">
                  <Search className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">1. Discover Locally</h3>
                <p className="text-gray-600 leading-relaxed">
                  Use our smart location filters to find electronics, furniture, or cars being sold by people in your own town or county.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-emerald-50 w-24 h-24 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                <div className="bg-emerald-100 w-14 h-14 flex items-center justify-center rounded-2xl mb-6 text-emerald-600">
                  <MessageCircle className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">2. Chat Directly</h3>
                <p className="text-gray-600 leading-relaxed">
                  Click the WhatsApp button to chat directly with the seller. Ask questions, request more photos, and negotiate the price.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-emerald-50 w-24 h-24 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                <div className="bg-emerald-100 w-14 h-14 flex items-center justify-center rounded-2xl mb-6 text-emerald-600">
                  <Handshake className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">3. Meet & Pay</h3>
                <p className="text-gray-600 leading-relaxed">
                  Meet in a safe, public place. Inspect the item to ensure it's exactly what you want before handing over cash or M-Pesa.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/" className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Start Shopping
              </Link>
            </div>
          </div>
        )}

        {/* SELLER GUIDE */}
        {activeTab === "sell" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900">Turn your unused items into cash.</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-blue-50 w-24 h-24 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                <div className="bg-blue-100 w-14 h-14 flex items-center justify-center rounded-2xl mb-6 text-blue-600">
                  <Camera className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">1. Snap Photos</h3>
                <p className="text-gray-600 leading-relaxed">
                  Take up to 5 clear, bright photos of your item. Be honest about its condition—buyers appreciate transparency.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-blue-50 w-24 h-24 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                <div className="bg-blue-100 w-14 h-14 flex items-center justify-center rounded-2xl mb-6 text-blue-600">
                  <Tag className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">2. Set Your Price</h3>
                <p className="text-gray-600 leading-relaxed">
                  Add a title, description, and your price. Pay a small, one-time Ksh 100 listing fee to put your item in front of thousands.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-blue-50 w-24 h-24 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                <div className="bg-blue-100 w-14 h-14 flex items-center justify-center rounded-2xl mb-6 text-blue-600">
                  <DollarSign className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">3. Get Paid</h3>
                <p className="text-gray-600 leading-relaxed">
                  Buyers in your area will contact you via WhatsApp. Arrange a safe meeting spot, hand over the item, and get paid instantly.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/sell" className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                List an Item Now
              </Link>
            </div>
          </div>
        )}

        {/* 4. TRUST & SAFETY BANNER */}
        <div className="mt-24 bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/3 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-200 rounded-full blur-2xl opacity-50"></div>
              <ShieldCheck className="h-32 w-32 text-emerald-600 relative z-10" />
            </div>
          </div>
          <div className="md:w-2/3 text-center md:text-left space-y-4">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Your Safety is Our Priority</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              We strongly advise all users to meet in busy, public locations. Never send money in advance via M-Pesa or bank transfer before inspecting the item in person.
            </p>
            <div className="pt-2">
              <Link href="/safety" className="text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-2 justify-center md:justify-start">
                Read our full safety guidelines <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
