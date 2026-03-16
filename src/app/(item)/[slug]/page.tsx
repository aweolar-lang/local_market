import { supabase } from "@/lib/supabase";
import { Metadata } from 'next';
import Link from "next/link";
import { MapPin, ArrowLeft, ShieldCheck, Tag, MessageCircle, Calendar, Phone } from "lucide-react";
import ImageGallery from "@/components/ImageGallery";
import ReviewSeller from "@/components/ReviewSeller";

export const dynamic = 'force-dynamic';

// Strictly typing our expected data
interface Item {
  id: string;
  slug: string; // Added slug here
  title: string;
  price: number;
  description: string;
  county: string;
  town: string;
  seller_phone: string;
  seller_id: string;
  images: string[];
  status: string;
  created_at: string;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug; // Using slug instead of id

  const { data: item } = await supabase
    .from('items')
    .select('*')
    .eq('slug', slug) // Searching by slug
    .single();

  if (!item) {
    return {
      title: 'Item Not Found | LocalSoko',
      description: 'This item is no longer available on our platform.'
    };
  }

  const siteBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://localsoko.com';

  return {
    title: `${item.title} - Ksh ${item.price.toLocaleString()}`,
    description: (item.description || '').substring(0, 160) + '...',
    openGraph: {
      title: `${item.title} - Ksh ${item.price.toLocaleString()}`,
      description: `Located in ${item.town}, ${item.county}. Click to view contact details!`,
      url: `${siteBase}/${item.slug}`, // Using slug for the URL
      siteName: 'LocalSoko',
      images: [
        {
          url: item.images?.[0] || `${siteBase}/og-default.png`,
          width: 1200,
          height: 630,
          alt: item.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${item.title} - Ksh ${item.price.toLocaleString()}`,
      description: `Check out this ${item.title} for sale in ${item.town}!`,
      images: [item.images?.[0] || `${siteBase}/og-default.png`],
    },
  };
}

export default async function ItemDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Fetch the specific item from Supabase using the slug
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-10 bg-red-50 border border-red-200 text-red-800 rounded-xl">
        <h2 className="font-bold text-lg mb-2"> Error loading item</h2>
        <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-10 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl text-center">
        <h2 className="font-bold text-xl mb-2">Item Unavailable</h2>
        <p className="mb-6 text-yellow-700">This item has been removed or does not exist.</p>
        <Link href="/" className="inline-block bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium">Browse other items</Link>
      </div>
    );
  }

  const item = data as Item;

  const postedDate = new Date(item.created_at).toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  let formattedPhone = item.seller_phone?.trim() || '';
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1);
  }

  const waMessage = encodeURIComponent(`Hi, I saw your "${item.title}" on LocalSoko for Ksh ${item.price}. Is it still available?`);
  const waLink = `https://wa.me/${formattedPhone}?text=${waMessage}`;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">

      {/* Back Navigation */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100" aria-label="Back to listings">
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden flex flex-col lg:flex-row">

        {/* Left: Image gallery */}
        <div className="w-full lg:w-1/2 bg-gray-50 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
          <ImageGallery images={item.images} />
        </div>

        {/* Right: Details */}
        <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col">

          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">
                <Tag className="h-3 w-3" /> For Sale
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
                Posted {postedDate}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-2">{item.title}</h1>
            <p className="text-3xl md:text-4xl font-extrabold text-emerald-600 mt-2">Ksh {item.price.toLocaleString()}</p>
          </div>

          <div className="flex items-center gap-3 text-gray-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 mb-6">
            <MapPin className="h-5 w-5 text-gray-400" />
            <span className="font-medium">{item.town}, {item.county}</span>
          </div>

          <div className="prose prose-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wide">Description</h3>
            <div className="mt-2">{item.description || 'No description provided by the seller.'}</div>
          </div>

          <div className="pt-4 mt-auto space-y-4">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm">
              <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" />
              <p className="leading-snug">
                <strong className="block mb-1 text-blue-900">Safety Tip</strong>
                Never pay for an item in advance. Always meet the seller in a public, safe location to inspect the item first.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white py-3 rounded-xl font-bold text-lg transition-shadow shadow-sm"
                aria-label={`Message seller about ${item.title} on WhatsApp`}
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Message Seller on WhatsApp
              </a>

              <a
                href={`tel:${formattedPhone}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                aria-label={`Call seller at ${item.seller_phone}`}
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                Call Seller
              </a>
            </div>
          </div>

          <div className="mt-6">
            <ReviewSeller sellerId={item.seller_id} />
          </div>
        </div>
      </div>
    </div>
  );
}