export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* You can add your LocalSoko Logo here later */}
        <div className="text-center mb-8 bg-black p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-100">LocalSoko</h1>
          <p className="text-gray-300 mt-2">Your Partner Hub</p>
        </div>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {children}
      </div>
    </div>
  );
}