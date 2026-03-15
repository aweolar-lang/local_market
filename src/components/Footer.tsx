import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav aria-label="Footer" className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">

          {/* Brand & Description */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-2xl font-extrabold text-emerald-600 tracking-tight hover:opacity-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-300 rounded">
              LocalSoko
            </Link>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Your trusted neighborhood marketplace. Buy and sell electronics, furniture, cars, and more with zero hassle.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-emerald-600 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 rounded">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-600 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 rounded">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-emerald-600 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 rounded">
                  Sell an Item
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Pages */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/terms" className="hover:text-emerald-600 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 rounded">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-600 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 rounded">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-emerald-600 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 rounded">
                  Safety Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>

            <ul role="list" className="flex items-center gap-4 mb-4">
              <li>
                <a href="https://web.facebook.com/profile.php?id=61579540619119" aria-label="LocalSoko on Facebook" className="text-gray-400 hover:text-emerald-600 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-emerald-200 rounded">
                  <Facebook className="h-5 w-5" />
                </a>
              </li>
              <li>
                <a href="#" aria-label="LocalSoko on Twitter" className="text-gray-400 hover:text-emerald-600 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-emerald-200 rounded">
                  <Twitter className="h-5 w-5" />
                </a>
              </li>
              <li>
                <a href="#" aria-label="LocalSoko on Instagram" className="text-gray-400 hover:text-emerald-600 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-emerald-200 rounded">
                  <Instagram className="h-5 w-5" />
                </a>
              </li>
            </ul>

            <a href="mailto:hello@localsoko.com" className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 rounded wrap-break-word">
              <Mail className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Email LocalSoko at</span>
              hello@localsoko.com
            </a>
          </div>
        </nav>

        {/* Bottom Copyright Row */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} LocalSoko Marketplace. All rights reserved.
          </p>

          <p className="text-sm text-gray-500 flex items-center gap-2">
            <span className="inline-flex items-center" aria-hidden="true">
              Made with
              <Heart className="h-4 w-4 ml-2 text-red-500" />
            </span>
            <span>in Kenya</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
