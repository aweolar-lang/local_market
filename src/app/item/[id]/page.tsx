import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Phone, ArrowLeft, ShieldCheck, Tag } from "lucide-react";

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

export default async function ItemDetailsPage({ params }: { params: { id: string } }) {
  // Extract the ID from the URL (e.g., /item/12345)
  const { id } = params;

  // Fetch the specific item from Supabase
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  // If the item doesn't exist (or the ID is wrong), show the built-in Next.js 404 page
  if (error || !data) {
    notFound();
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
        <div className="md:w-1/2 relative h-72 md:h-auto bg-gray-50 border-r border-gray-100">
          <Image 
            src={item.images[0]} 
            alt={item.title} 
            fill 
            className="object-contain p-4"
          />
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