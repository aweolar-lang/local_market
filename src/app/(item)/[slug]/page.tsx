import { supabase } from "@/lib/supabase";
import { Metadata } from 'next';
import Link from "next/link";
import { MapPin, ArrowLeft, ShieldAlert, Tag, MessageCircle, Calendar, Phone, Sparkles, PackageOpen } from "lucide-react";
import ImageGallery from "@/components/ImageGallery";
import ReviewSeller from "@/components/ReviewSeller";
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Strictly typing our expected data
interface Item {
  id: string;
  slug: string; 
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
  condition?: string; 
  category?: string;  
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug; 

  const { data: item } = await supabase
    .from('items')
    .select('*')
    .eq('slug', slug) 
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
      url: `${siteBase}/${item.slug}`, 
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

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    return (
      notFound()
    );
  }

  if (!data) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-10 bg-orange-50 border border-orange-200 text-orange-800 rounded-2xl text-center shadow-sm">
        <PackageOpen className="h-12 w-12 mx-auto text-orange-400 mb-3" />
        <h2 className="font-bold text-xl mb-2">Item Unavailable</h2>
        <p className="mb-6 text-orange-700">This item has been sold, removed, or does not exist.</p>
        <Link href="/" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors">
          Browse other items
        </Link>
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
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">

      {/* Back Navigation */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-full shadow-sm border border-emerald-100">
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col lg:flex-row">

        {/* Left: Image gallery */}
        <div className="w-full lg:w-1/2 bg-gray-50/50 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
          <ImageGallery images={item.images} />
        </div>

        {/* Right: Details */}
        <div className="w-full lg:w-1/2 p-6 lg:p-10 flex flex-col">

          {/* Header Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              <Tag className="h-3.5 w-3.5" /> {item.category || 'For Sale'}
            </span>
            
            {item.condition && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                item.condition === 'New' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                <Sparkles className="h-3.5 w-3.5" /> {item.condition}
              </span>
            )}

            <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              {postedDate}
            </span>
          </div>

          {/* Title & Price */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
              {item.title}
            </h1>
            <p className="text-3xl md:text-4xl font-black text-emerald-600 tracking-tight">
              Ksh {item.price.toLocaleString()}
            </p>
          </div>

          {/* Location Bar */}
          <div className="flex items-center gap-3 text-gray-700 bg-gray-50 px-5 py-4 rounded-2xl border border-gray-100 mb-8">
            <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
              <MapPin className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Location</p>
              <span className="font-bold text-gray-900 text-lg">{item.town}, {item.county}</span>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">Description</h3>
            <div className="mt-4 text-base">{item.description || 'No description provided by the seller.'}</div>
          </div>

          <div className="pt-4 mt-auto space-y-5 border-t border-gray-50">
            
            {/* Seller Rating */}
            <div className="bg-gray-50 rounded-2xl p-1 border border-gray-100">
               <ReviewSeller sellerId={item.seller_id} />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white py-3.5 rounded-xl font-bold text-base transition-all shadow-sm active:scale-95"
                aria-label={`Message seller about ${item.title} on WhatsApp`}
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                WhatsApp Seller
              </a>

              <a
                href={`tel:${formattedPhone}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-white border-2 border-emerald-600 text-emerald-700 py-3.5 rounded-xl font-bold text-base hover:bg-emerald-50 transition-all active:scale-95"
                aria-label={`Call seller at ${item.seller_phone}`}
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                Call Seller
              </a>
            </div>

            {/* Safety Tip (Orange Theme) */}
            <div className="flex items-start gap-3 bg-orange-50/80 border border-orange-200/60 p-4 rounded-xl text-orange-900 text-sm mt-4">
              <ShieldAlert className="h-5 w-5 shrink-0 text-orange-600" />
              <p className="leading-snug">
                <strong className="block mb-0.5 font-bold text-orange-800">Stay Safe on LocalSoko</strong>
                Never pay for an item in advance via M-Pesa. Always meet the seller in a busy, public location to inspect the item first.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}