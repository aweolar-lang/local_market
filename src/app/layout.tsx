import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] });

// ADVANCED SEO METADATA
export const metadata: Metadata = {
  // metadataBase is required for dynamic OG images and canonical URLs
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  
  title: {
    default: "LocalSoko | Neighborhood Second-Hand Market",
    // The template allows individual item pages to say "Used iPhone 12 | LocalSoko"
    template: "%s | LocalSoko" 
  },
  description: "Buy and sell quality second-hand items easily in your local area. Direct WhatsApp sellers, secure M-Pesa payments.",
  
  // Open Graph is what WhatsApp, Facebook, and LinkedIn use to generate link previews
  openGraph: {
    title: "LocalSoko | Neighborhood Second-Hand Market",
    description: "Buy and sell quality second-hand items easily in your local area.",
    url: '/',
    siteName: 'LocalSoko',
    locale: 'en_KE', // Specifically targeting the Kenyan locale
    type: 'website',
  },
  
  // Twitter card formatting
  twitter: {
    card: 'summary_large_image',
    title: 'LocalSoko | Neighborhood Second-Hand Market',
    description: 'Buy and sell quality second-hand items easily in your local area.',
  },
  
  // Explicitly telling Google Search Console to index and follow our pages
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
    );
}