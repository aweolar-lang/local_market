import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";
import { GA_MEASUREMENT_ID, pageview } from '../lib/gtag';
import Footer from "@/components/Footer";

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
    "googleBot": {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  const pathname = usePathname();

  // Track pageview on route change
  useEffect(() => {
    pageview(pathname);
  }, [pathname]);

  return (
    <html lang="en">
      <head>
        {/* Google Analytics Script */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col`}
      >
      
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white px-3 py-2 rounded shadow z-50"
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
      </body>
    </html>
  );
}
