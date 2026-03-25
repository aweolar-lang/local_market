import { Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
        <Mail className="h-8 w-8 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Check your inbox</h2>
      
      <p className="text-gray-600 mb-6 leading-relaxed">
        We've sent a verification link to your email address. Please click the link to activate your LocalSoko account.
      </p>

      <div className="bg-blue-50 p-4 rounded-xl mb-6 text-sm text-blue-800 text-left">
        <strong>Didn't get it?</strong> Check your spam or promotions folder. The email will be from our secure verification server.
      </div>

      <Link 
        href="/auth/login"
        className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 transition-all"
      >
        Proceed to Login <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}