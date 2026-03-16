"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  MapPin, Search, PackageOpen, Navigation, Loader2, 
  MessageCircle, Phone, Grid, Smartphone, Car, Sofa, Shirt, Briefcase 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import SkeletonCard from "@/components/SkeletonCard";
import SellerRating from "@/components/SellerRating";

const CATEGORIES = [
  { name: "All", icon: Grid },
  { name: "Electronics", icon: Smartphone },
  { name: "Vehicles", icon: Car },
  { name: "Furniture", icon: Sofa },
  { name: "Fashion", icon: Shirt },
  { name: "Services", icon: Briefcase },
];

interface Item {
  id: string;
  title: string;
  price: number;
  county: string;
  town: string;
  seller_phone: string;
  seller_id: string;
  images: string[];
  status: string;
  created_at: string;
  description?: string;
  condition?: string;
  category?: string;
  slug: string;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<string>(""); 
  const [isLocating, setIsLocating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All"); 

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setItems(data as Item[]);
      }
      setLoading(false);
    };

    fetchItems();
  }, []);

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.county || "";
            setUserLocation(city);
          } catch (error) {
            console.error("Failed to fetch location name", error);
            alert("Could not determine your exact town. Please type it manually.");
          } finally {
            setIsLocating(false);
          }
        }, 
        () => {
          alert("Location access denied or failed. Please type your location (e.g., Embu) manually.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
    }
  };

  const displayItems = items
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (!userLocation) return 0; 
      const loc = userLocation.toLowerCase();
      const aIsLocal = a.town.toLowerCase().includes(loc) || a.county.toLowerCase().includes(loc);
      const bIsLocal = b.town.toLowerCase().includes(loc) || b.county.toLowerCase().includes(loc);
      
      if (aIsLocal && !bIsLocal) return -1; 
      if (!aIsLocal && bIsLocal) return 1;  
      return 0; 
    });

  const isFiltering = searchQuery || userLocation || selectedCategory !== "All";

  return (
    <div className="space-y-8 pb-8 max-w-7xl mx-auto">
      {/* HERO */}
      <section className="relative bg-linear-to-br from-emerald-800 via-emerald-700 to-green-900 text-white rounded-3xl p-8 md:p-12 shadow-xl overflow-hidden mt-2">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Buy & Sell Locally — <span className="text-emerald-300">Zero Hassle</span>
          </h1>
          <p className="text-emerald-50 text-base md:text-lg opacity-95 max-w-xl font-medium">
            Discover items from verified sellers near you. Fast chat, transparent prices, and safe local deals.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/sell" className="inline-flex items-center justify-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 py-3 px-6 rounded-xl text-sm font-bold shadow-md transition-all transform hover:scale-105">
              List an item
            </Link>
            <Link href="/how-it-works" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 px-6 rounded-xl text-sm font-semibold backdrop-blur-sm transition-all">
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* SEARCH AND FILTERS */}
      <section className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 sticky top-4 z-30">
        <form className="flex flex-col md:flex-row gap-4">
          
          <div className="relative flex-1">
            <label htmlFor="search" className="sr-only">Search items</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input 
              id="search"
              type="text" 
              placeholder="Search items, e.g. 'phone', 'sofa'..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-900 text-sm placeholder:text-gray-500"
            />
          </div>

          <div className="relative flex-1 md:max-w-xs">
            <label htmlFor="location" className="sr-only">Your town</label>
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input 
              id="location"
              type="text" 
              placeholder="Your town (e.g. Embu)" 
              value={userLocation}
              onChange={(e) => setUserLocation(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-900 text-sm placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-5 py-3.5 rounded-xl transition-all text-sm font-bold border border-emerald-100 disabled:opacity-70"
              title="Auto-detect location"
            >
              {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
              <span className="md:hidden lg:inline">Locate</span>
            </button>

            <button 
              type="button"
              onClick={() => { setSearchQuery(''); setUserLocation(''); setSelectedCategory('All'); }}
              className="flex-1 md:flex-none flex justify-center items-center bg-white border border-gray-200 px-5 py-3.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
              title="Clear filters"
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {/* CATEGORIES */}
      <section className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;
          
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all border ${
                isSelected 
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-md" 
                  : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
              aria-pressed={isSelected}
            >
              <Icon className="h-4 w-4" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </section>

      {/* RESULTS HEADER (Fixes Heading Hierarchy) */}
      {!loading && (
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
            {isFiltering ? 'Search Results' : 'Fresh Recommendations'}
          </h2>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </section>
      )}

      {/* EMPTY */}
      {!loading && displayItems.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="bg-gray-50 p-6 rounded-full mb-4">
            <PackageOpen className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No items found</h3>
          <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto font-medium">
            {isFiltering
              ? `We couldn't find anything matching your criteria. Try adjusting your filters.` 
              : "Be the first to list an item in your area!"}
          </p>
          {isFiltering && (
            <button 
              onClick={() => { setSearchQuery(''); setUserLocation(''); setSelectedCategory('All'); }}
              className="mt-6 text-emerald-600 font-bold hover:text-emerald-700 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayItems.map((item) => {
          let formattedPhone = item.seller_phone.trim();
          if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
          }
          
          const waMessage = encodeURIComponent(`Hi, I saw your "${item.title}" on LocalSoko for Ksh ${item.price}. Is it still available?`);
          const waLink = `https://wa.me/${formattedPhone}?text=${waMessage}`;

          const isLocalMatch = userLocation && (item.town.toLowerCase().includes(userLocation.toLowerCase()) || item.county.toLowerCase().includes(userLocation.toLowerCase()));

          return (
            <article key={item.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col">
              
              {/* IMAGE */}
              <Link href={`/${item.slug}`} className="relative h-56 w-full bg-gray-100 overflow-hidden block">
                {isLocalMatch && (
                  <div className="absolute top-3 left-3 z-10 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-md uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Near you
                  </div>
                )}

                {/* Seller Rating AND Condition Badge */}
                <div className="absolute bottom-3 left-3 z-10 drop-shadow-md flex items-center gap-2">
                  <SellerRating sellerId={item.seller_id} />
                  
                  {item.condition && (
                    <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-md uppercase tracking-wider backdrop-blur-md border ${
                      item.condition === 'New' 
                        ? 'bg-blue-600/95 text-white border-blue-400/50' 
                        : 'bg-gray-800/90 text-white border-gray-600/50'
                    }`}>
                      {item.condition}
                    </span>
                  )}
                </div>

                <Image 
                  src={item.images?.[0] || ''} 
                  alt={`Image of ${item.title}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
              </Link>

              {/* CONTENT */}
              <div className="p-5 flex flex-col grow">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <Link href={`/${item.slug}`} className="hover:text-emerald-700 transition-colors">
                      <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug text-base">{item.title}</h3>
                    </Link>
                    <p className="text-xs font-medium text-gray-500 mt-1 truncate">{item.category || 'General'}</p>
                  </div>
                </div>

                <div className="flex items-end justify-between mt-auto pt-2">
                  <p className="text-xl font-black text-emerald-700">Ksh {item.price.toLocaleString()}</p>
                  <time className="text-xs font-medium text-gray-500">{new Date(item.created_at).toLocaleDateString()}</time>
                </div>

                <div className="flex items-center justify-between gap-2 my-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 min-w-0">
                    <MapPin className="h-4 w-4 shrink-0 text-gray-500" />
                    <span className="truncate">{item.town}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 shrink-0">
                    <Phone className="h-4 w-4 shrink-0 text-gray-500" />
                    <span className="text-gray-800">{item.seller_phone}</span>
                  </div>
                </div>

                <a 
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Message seller about ${item.title} on WhatsApp`}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fbd58] text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat on WhatsApp
                </a>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}