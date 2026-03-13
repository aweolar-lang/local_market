import Image from "next/image";
import Link from "next/link"; // <-- We need this to navigate!
import { MapPin, Search, PackageOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";

// 1. Strictly typing our expected data to banish 'any'
interface Item {
  id: string;
  title: string;
  price: number;
  county: string;
  town: string;
  seller_phone: string;
  images: string[];
  status: string;
  created_at: string;
}

export default async function Home() {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching items:", error);
  }

  // Cast the data to our strict Item[] array
  const items = (data as Item[]) || [];

  return (
    <div className="space-y-8">
      {/* Header / Search Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Items near you</h1>
          <p className="text-gray-500 text-sm mt-1">Showing available items in your local area</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search for electronics, furniture..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </section>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <PackageOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900">No items available yet</h2>
          <p className="text-gray-500 mt-2">Be the first to list an item in your area!</p>
        </div>
      )}

      {/* Real Item Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => {
          const waMessage = encodeURIComponent(`Hi, I saw your "${item.title}" on LocalSoko for Ksh ${item.price}. Is it still available?`);
          const waLink = `https://wa.me/${item.seller_phone}?text=${waMessage}`;

          return (
            <div key={item.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
              
              {/* Clickable Image linking to the Details Page */}
              <Link href={`/item/${item.id}`} className="relative h-48 w-full bg-gray-100 overflow-hidden block">
                <Image 
                  src={item.images[0]} 
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Item Details */}
              <div className="p-4 flex flex-col grow">
                <div className="mb-2">
                  {/* Clickable Title linking to the Details Page */}
                  <Link href={`/item/${item.id}`} className="hover:text-green-600 transition-colors">
                    <h3 className="font-medium text-gray-900 line-clamp-2">{item.title}</h3>
                  </Link>
                </div>
                
                <p className="text-lg font-bold text-green-600 mb-3">
                  Ksh {item.price.toLocaleString()}
                </p>

                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4 mt-auto">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.town}, {item.county}</span>
                </div>

                {/* WhatsApp Action Button (External Link) */}
                <a 
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-gray-900 hover:bg-black text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Contact on WhatsApp
                </a>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}