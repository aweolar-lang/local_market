import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-green-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
          
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Local<span className="text-green-600">Soko</span>
            </h1>
          </Link>
          <p className="text-sm text-gray-500 mt-2 font-medium tracking-wide uppercase">Partner Hub</p>
        </div>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        
        <div className="drop-shadow-sm transition-all">
          {children}
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-400 z-10">
        <p>&copy; {new Date().getFullYear()} LocalSoko. Secure Affiliate Engine.</p>
      </div>

    </div>
  );
}