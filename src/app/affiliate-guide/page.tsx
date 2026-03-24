import Link from "next/link";
import { 
  BookOpen, Link as LinkIcon, DollarSign, Users, 
  ShieldAlert, LifeBuoy, TrendingUp, AlertTriangle,
  Store, Smartphone, RefreshCw, CheckCircle2, XCircle, 
  Scale, MessageSquare
} from "lucide-react";

export default function AffiliateGuidePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* HERO SECTION */}
        <div className="text-center space-y-6 pt-8 pb-4">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <BookOpen className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            The Ultimate <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
              Affiliate Master Guide
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Welcome to the engine that powers our marketplace. Here is everything you need to know to grow your network, master the platform, and build a consistent income stream.
          </p>
        </div>

        {/* SECTION 1: THE ECOSYSTEM (CONNECTING MARKET & AFFILIATE) */}
        <section className="bg-gray-900 border border-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Store className="h-64 w-64" />
          </div>
          
          <h2 className="text-3xl font-black text-white flex items-center gap-4 mb-6 relative z-10">
            <TrendingUp className="h-8 w-8 text-blue-400" />
            1. The Ecosystem: How It All Connects
          </h2>
          
          <div className="space-y-6 text-gray-300 leading-relaxed relative z-10 text-lg">
            <p>
              To succeed as an affiliate, you must understand what you are building. Our platform is a thriving <strong>local e-commerce marketplace</strong> where everyday people buy, sell, and trade items securely. 
            </p>
            <p>
              However, a marketplace is only as strong as its community. Buyers need sellers with great products, and sellers need a massive pool of buyers to make quick sales. <strong>This is where you come in.</strong>
            </p>
            <div className="bg-gray-950/50 p-6 rounded-2xl border border-gray-800 flex flex-col sm:flex-row gap-6 items-center">
              <RefreshCw className="h-12 w-12 text-emerald-500 shrink-0" />
              <p className="text-base text-gray-400">
                <strong className="text-white">The Affiliate Cycle:</strong> When you invite a new user, you aren't just earning a commission—you are adding a potential buyer or seller to the main e-commerce site. As the market grows, items sell faster, attracting even more users. You are directly compensated in real-time for fueling this local economy.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE STEP-BY-STEP EARNING GUIDE */}
        <section className="space-y-8">
          <h2 className="text-3xl font-black text-white flex items-center gap-4 px-2">
            <DollarSign className="h-8 w-8 text-emerald-400" />
            2. The Blueprint: How to Earn
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1 */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-emerald-500/30 transition-colors">
              <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mb-6 border border-gray-700">
                <span className="text-xl font-black text-emerald-400">1</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Activate Your Account</h3>
              <p className="text-gray-400 leading-relaxed">
                To become a verified partner, you must pay a one-time activation fee of <strong>Ksh 400</strong> via our secure M-Pesa STK push. This filters out spam bots, shows commitment, and funds the reward pool that pays you.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-blue-500/30 transition-colors">
              <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mb-6 border border-gray-700">
                <span className="text-xl font-black text-blue-400">2</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Get Your Link</h3>
              <p className="text-gray-400 leading-relaxed">
                Once activated, your dashboard instantly unlocks. You will be assigned a unique Referral Code (e.g., <code className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded">REF-ABC123</code>) and a shareable link perfectly tied to your account.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/30 transition-colors">
              <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mb-6 border border-gray-700">
                <span className="text-xl font-black text-purple-400">3</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Share & Invite</h3>
              <p className="text-gray-400 leading-relaxed">
                Share your link on WhatsApp status, Facebook groups, TikTok, or directly with friends. Tell them about the marketplace and how they can buy/sell locally. When they click your link, our system remembers you sent them.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-orange-500/30 transition-colors">
              <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mb-6 border border-gray-700">
                <span className="text-xl font-black text-orange-400">4</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Instant Commissions</h3>
              <p className="text-gray-400 leading-relaxed">
                Every time someone registers via your link and activates their own account, <strong>Ksh 200</strong> is instantly credited to your wallet. Our real-time ledger updates your balance immediately—no waiting, no hidden math.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: PRO TIPS FOR SUCCESS */}
        <section className="bg-blue-950/20 border border-blue-900/50 rounded-3xl p-8 md:p-10">
          <h2 className="text-2xl font-black text-blue-400 mb-6 flex items-center gap-3">
            <Smartphone className="h-6 w-6" />
            Pro-Tips for Maximum Earnings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm md:text-base"><strong className="text-white">Pitch the Market:</strong> Don't just spam your link. Tell people *why* they should join: "Hey, I found a great local platform to sell your old phone or buy cheap electronics. Check it out!"</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm md:text-base"><strong className="text-white">Use WhatsApp:</strong> WhatsApp Status is the highest converting tool for our top earners. Post screenshots of your withdrawal receipts to build trust.</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm md:text-base"><strong className="text-white">Help Them Activate:</strong> Sometimes people register but don't pay the Ksh 400. Follow up with your friends and walk them through the M-Pesa prompt.</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm md:text-base"><strong className="text-white">Consistency Wins:</strong> Affiliate marketing is a numbers game. The more eyes on your link, the more passive income you generate while you sleep.</p>
            </div>
          </div>
        </section>

        {/* SECTION 4: STRICT TERMS & WARNINGS */}
        <section className="bg-red-950/20 border border-red-900/50 rounded-3xl p-8 md:p-10 shadow-lg">
          <h2 className="text-3xl font-black text-red-500 flex items-center gap-4 mb-8">
            <Scale className="h-8 w-8 text-red-500" />
            3. Strict Rules, Terms & Privacy Warnings
          </h2>
          
          <p className="text-red-200/80 mb-8 text-lg">
            To protect the integrity of the marketplace and ensure fair play for all affiliates, we enforce strict rules. By participating in this program, you agree to the following terms:
          </p>

          <div className="space-y-6">
            <div className="bg-gray-950/50 p-6 rounded-2xl border border-red-900/30">
              <h4 className="text-red-400 font-bold text-lg mb-2 flex items-center gap-2">
                <XCircle className="h-5 w-5" /> 1. No Spam or Deceptive Marketing
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                You may not promote your link using false promises (e.g., "Click here for free money"). You may not spam unsolicited emails or flood comment sections. Deceptive marketing damages the marketplace brand and will result in <strong>immediate account termination and forfeiture of all pending wallet funds.</strong>
              </p>
            </div>

            <div className="bg-gray-950/50 p-6 rounded-2xl border border-red-900/30">
              <h4 className="text-red-400 font-bold text-lg mb-2 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" /> 2. Independent Contractor Status
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                As an affiliate, you are an independent promoter. You are <strong>not</strong> an employee, legal agent, or corporate partner of our platform. You are responsible for your own taxes and marketing expenses.
              </p>
            </div>

            <div className="bg-gray-950/50 p-6 rounded-2xl border border-red-900/30">
              <h4 className="text-red-400 font-bold text-lg mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> 3. Marketplace Liability & Risk
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                The core platform is a peer-to-peer marketplace. While we provide a secure system, <strong>transactions between buyers and sellers are conducted at their own risk.</strong> As an affiliate, you are not liable for marketplace disputes between users you referred, nor is the platform liable for private trades gone wrong. Always advise your referrals to meet in safe, public places when exchanging goods.
              </p>
            </div>

            <div className="bg-gray-950/50 p-6 rounded-2xl border border-red-900/30">
              <h4 className="text-red-400 font-bold text-lg mb-2 flex items-center gap-2">
                <Store className="h-5 w-5" /> 4. Withdrawals & Payouts
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Wallet funds are generated exclusively through successful network activations. Withdrawals are processed directly to the M-Pesa number registered on your account. Standard Safaricom transaction fees and platform withdrawal minimums may apply. The system is heavily monitored for self-referral fraud.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: SUPPORT & CONTACT (MAIN SITE REDIRECT) */}
        <section className="bg-gray-900 border border-gray-800 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
          <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-full mb-6">
            <LifeBuoy className="h-12 w-12 text-blue-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Need Help or Support?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
            Whether you are struggling to set up your account, have questions about a withdrawal, or need help navigating the main e-commerce marketplace, our official Support Team is ready to assist you.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Note: Adjust the href="/contact" to point to your main site's actual contact page if it's hosted on a different domain! */}
            <Link 
              href="/contact" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
              <MessageSquare className="h-5 w-5" />
              Contact the Main Support Team
            </Link>
            
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </section>

        {/* Footer tiny text */}
        <div className="text-center pb-8 pt-4">
          <p className="text-gray-600 text-sm font-mono">
            LocalSoko Affiliate Network • Terms updated as of {new Date().getFullYear()}
          </p>
        </div>

      </div>
    </div>
  );
}