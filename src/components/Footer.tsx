import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Description */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-black text-green-600 tracking-tighter">
              LocalSoko
            </Link>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Your trusted neighborhood marketplace. Buy and sell electronics, furniture, cars, and more with zero hassle.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-green-600 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-green-600 transition-colors">Contact Us</Link></li>
              <li><Link href="/sell" className="hover:text-green-600 transition-colors">Sell an Item</Link></li>
            </ul>
          </div>

          {/* Legal Pages */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/terms" className="hover:text-green-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-green-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/safety" className="hover:text-green-600 transition-colors">Safety Tips</Link></li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>
            <div className="flex gap-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-green-600 transition-colors"><Instagram className="h-5 w-5" /></a>
            </div>
            <a href="mailto:hello@localsoko.com" className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors">
              <Mail className="h-4 w-4" />
              hello@localsoko.com
            </a>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} LocalSoko. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> in Kenya
          </p>
        </div>
      </div>
    </footer>
  );
}