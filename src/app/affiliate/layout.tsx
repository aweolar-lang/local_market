import Link from "next/link";
import { ArrowLeft, Crown, Zap } from "lucide-react";

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 selection:bg-yellow-200">
      
      {/* 1. DEDICATED VIP NAVBAR */}
      <nav className="bg-gradient-to-b from-gray-900 to-gray-800 border-b border-gray-700 sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Back to Market Button */}
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <div className="bg-gray-800 group-hover:bg-gray-700 p-1.5 rounded-full transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold hidden sm:block">Marketplace</span>
            </Link>

            {/* Center Branding */}
            <div className="flex items-center gap-2">
              <div className="bg-yellow-400 p-1.5 rounded-lg shadow-sm shadow-yellow-400/20">
                <Crown className="h-5 w-5 text-yellow-900" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Partner<span className="text-yellow-400">Hub</span>
              </span>
            </div>

            {/* Right Side Status Indicator */}
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full text-green-400 shadow-inner shadow-black/50">
              <Zap className="h-3.5 w-3.5 fill-green-400" />
              Live
            </div>

          </div>
        </div>
      </nav>

      {/* 2. THE PAGE CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

    </div>
  );
}