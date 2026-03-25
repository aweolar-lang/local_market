import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-200 relative overflow-hidden border-radius: 0.125rem;">
      
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-400/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="text-center mb-8 z-10">
        <Link href="/" className="inline-block transition-transform hover:scale-105">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Local<span className="text-green-600">Soko</span>
          </h1>
        </Link>
        <p className="text-xs sm:text-sm text-gray-400 mt-2 font-bold tracking-widest uppercase">
          Partner Hub
        </p>
      </div>
      
      
      <div className="w-full max-w-[420px] z-10">
      
        <div className="bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-gray-100 p-8 sm:p-10 transition-all">
          {children}
        </div>
      </div>

      <div className="mt-10 text-center text-xs text-gray-600 z-10 font-medium tracking-wide">
        <p>&copy; {new Date().getFullYear()} LocalSoko. Secure Affiliate Engine.</p>
      </div>

    </div>
  );
}