import { supabase } from "@/lib/supabase";
import { Metadata } from 'next';
import Link from "next/link";
import { MapPin, ArrowLeft, ShieldCheck, Tag, MessageCircle, Calendar } from "lucide-react";
import ImageGallery from "@/components/ImageGallery";
import ReviewSeller from "@/components/ReviewSeller";

export const dynamic = 'force-dynamic';

// Strictly typing our expected data!
interface Item {
  id: string;
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

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const { data: item } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  if (!item) {
    return {
      title: 'Item Not Found | LocalSoko',
      description: 'This item is no longer available on our platform.'
    };
  }

  return {
    title: `${item.title} - Ksh ${item.price.toLocaleString()}`,
    description: item.description.substring(0, 160) + '...', 
    openGraph: {
      title: `${item.title} - Ksh ${item.price.toLocaleString()}`,
      description: `Located in ${item.town}, ${item.county}. Click to view contact details!`,
      url: `https://your-website-url.com/item/${item.id}`, 
      siteName: 'LocalSoko',
      images: [
        {
          url: item.images[0], 
          width: 800,
          height: 600,
          alt: item.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image', 
      title: `${item.title} - Ksh ${item.price.toLocaleString()}`,
      description: `Check out this ${item.title} for sale in ${item.town}!`,
      images: [item.images[0]],
    },
  };
}

export default async function ItemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Fetch the specific item from Supabase
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return (
      <div className="p-10 max-w-2xl mx-auto mt-10 bg-red-50 border border-red-200 text-red-800 rounded-xl">
        <h2 className="font-bold text-lg mb-2"> Error!</h2>
        <pre className="whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-10 max-w-2xl mx-auto mt-10 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl text-center">
        <h2 className="font-bold text-xl mb-2">Item Unavailable</h2>
        <p className="mb-6 text-yellow-700">This item has been removed or does not exist.</p>
        <Link href="/" className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium">Browse other items</Link>
      </div>
    );
  }

  const item = data as Item;

  
  const postedDate = new Date(item.created_at).toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  
  let formattedPhone = item.seller_phone.trim();
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1);
  }

  // Generate the WhatsApp link
  const waMessage = encodeURIComponent(`Hi, I saw your "${item.title}" on LocalSoko for Ksh ${item.price}. Is it still available?`);
  const waLink = `https://wa.me/${formattedPhone}?text=${waMessage}`;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Back Navigation */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 mb-6 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Image Gallery */}
        <div className="w-full md:w-1/2 p-4 md:p-6 bg-gray-50/50 border-b md:border-b-0 md:border-r border-gray-100">
             <ImageGallery images={item.images} />
        </div>

        {/* Right Side: Item Details */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
          
          {/* Header Info */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-green-100 text-green-700">
                <Tag className="h-3 w-3" /> For Sale
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
                Posted {postedDate}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-2">
              {item.title}
            </h1>
            <p className="text-3xl md:text-4xl font-black text-green-600 mt-2">
              Ksh {item.price.toLocaleString()}
            </p>
          </div>

          {/* Location Badge */}
          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 mb-6">
            <MapPin className="h-5 w-5 shrink-0 text-gray-400" />
            <span className="font-medium">{item.town}, {item.county}</span>
          </div>

          {/* Description */}
          <div className="py-2 grow">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Description</h3>
            <div className="prose prose-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {item.description || "No description provided by the seller."}
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-8 mt-auto space-y-4">
            
            {/* Safety Warning */}
            <div className="flex items-start gap-3 bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm">
              <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" />
              <p className="leading-snug">
                <strong className="block mb-1 text-blue-900">Safety Tip</strong>
                Never pay for an item in advance. Always meet the seller in a public, safe location to inspect the item first.
              </p>
            </div>

           
            <a 
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white py-4 rounded-xl font-bold text-lg transition-all shadow-sm hover:shadow-md"
            >
              <MessageCircle className="h-6 w-6" />
              Message Seller on WhatsApp
            </a>
          </div>
          <ReviewSeller sellerId={item.seller_id} />

        </div>
      </div>
    </div>
  );
}