import { supabase } from "@/lib/supabase";
import { Metadata } from 'next';
import Link from "next/link";
import { MapPin, Phone, ArrowLeft, ShieldCheck, Tag } from "lucide-react";
import ImageGallery from "@/components/ImageGallery";

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
      <div className="p-10 max-w-2xl mx-auto mt-10 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl">
        <h2 className="font-bold text-lg mb-2">No Item Found!</h2>
        <p>The database searched for ID: <b>{id}</b> but it does not exist.</p>
      </div>
    );
  }

  const item = data as Item;


  // Generate the WhatsApp link
  const waMessage = encodeURIComponent(`Hi, I saw your "${item.title}" on LocalSoko for Ksh ${item.price}. Is it still available?`);
  const waLink = `https://wa.me/${item.seller_phone}?text=${waMessage}`;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Back Navigation */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Image Gallery (Just 1 image for now) */}
        <div className="w-full mb-8">
             <ImageGallery images={item.images} />
        </div>

        {/* Right Side: Item Details */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 mb-4">
              <Tag className="h-3 w-3" /> For Sale
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {item.title}
            </h1>
            <p className="text-3xl font-bold text-green-600 mt-4">
              Ksh {item.price.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2 text-gray-500 mt-4 pb-6 border-b border-gray-100">
            <MapPin className="h-5 w-5 shrink-0" />
            <span>{item.town}, {item.county}</span>
          </div>

          {/* Description */}
          <div className="py-6 grow">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Action Area */}
          <div className="pt-6 border-t border-gray-100 space-y-4 mt-auto">
            <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl text-blue-800 text-sm">
              <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" />
              <p>Stay safe! Never pay for an item in advance. Always meet the seller in a public, safe location.</p>
            </div>

            <a 
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-semibold transition-all shadow-sm"
            >
              <Phone className="h-5 w-5" />
              Contact Seller on WhatsApp
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
