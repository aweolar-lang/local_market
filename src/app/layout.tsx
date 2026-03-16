import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from '@next/third-parties/google';
import Footer from "@/components/Footer";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const metadataBaseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : new URL("http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl,
  title: {
    default: "LocalSoko | Neighborhood Second-Hand Market",
    template: "%s | LocalSoko",
  },
  description:
    "Buy and sell locally — discover second-hand goods and services from sellers near you.",
  manifest: "/site.webmanifest",
  openGraph: {
    title: "LocalSoko | Neighborhood Second-Hand Market",
    description:
      "Buy and sell locally — discover second-hand goods and services from sellers near you.",
    url: new URL("/", metadataBaseUrl).toString(),
    siteName: "LocalSoko",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LocalSoko",
    description:
      "Buy and sell locally — discover second-hand goods and services from sellers near you.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col selection:bg-emerald-200 selection:text-emerald-900`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-700 text-white font-semibold px-4 py-2 rounded-md shadow-lg z-50 outline-none ring-2 ring-emerald-400 ring-offset-2"
        >
          Skip to content
        </a>

        <Navbar />

        <main
          id="main-content"
          className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {children}
        </main>

        <Footer />
        <Analytics />
        <Toaster richColors position="top-center" />
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID as string} />
    </html>
  );
}