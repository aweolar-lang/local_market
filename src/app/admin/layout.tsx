import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 selection:bg-emerald-500/30 flex flex-col">
      
      {/* SECURE ADMIN NAVBAR */}
      <nav className="bg-black border-b border-gray-800 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-gray-900 p-1.5 rounded-lg border border-gray-800">
              <ShieldAlert className="h-6 w-6 text-emerald-500" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-widest text-white uppercase flex items-center gap-2">
              Founder HQ <span className="hidden sm:inline text-gray-600 text-sm font-medium">| System Admin</span>
            </span>
          </div>

          {/* Escape Hatch */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg border border-gray-800"
          >
            <ArrowLeft className="h-4 w-4" /> 
            <span className="hidden sm:inline">Exit to Marketplace</span>
            <span className="sm:hidden">Exit</span>
          </Link>

        </div>
      </nav>

      {/* ADMIN PAGE CONTENT */}
      <main className="flex-1 w-full">
        {children}
      </main>

    </div>
  );
}