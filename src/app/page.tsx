"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { MapPin, Search, PackageOpen, Navigation, Loader2, MessageCircle, Phone, Grid, Smartphone, Car, Sofa, Shirt, Briefcase } from "lucide-react";
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

// Strictly typing expected data
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
  category?: string;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive States
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<string>(""); 
  const [isLocating, setIsLocating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All"); 

  // Fetch items on mount
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
        { enableHighAccuracy: true, timeout: 10000 } // Force high accuracy
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
    }
  };

  // Smart Filtering & Sorting
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

  return (
    <div className="space-y-6 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* HERO */}
      <section className="bg-linear-to-r from-[#047857] to-[#064E3B] text-white rounded-2xl p-6 md:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mt-4">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Buy & Sell Locally — <span className="text-green-200">Zero Hassle</span>
          </h1>
          <p className="text-green-50 text-sm md:text-base opacity-95">
            Discover items from verified sellers near you. Fast chat, transparent prices, and safe local deals.
          </p>
          <div className="flex gap-3 mt-3">
            <Link href="/sell" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 px-3 rounded-lg text-sm font-semibold">
              List an item
            </Link>
            <Link href="/how-it-works" className="inline-flex items-center gap-2 bg-white/6 hover:bg-white/12 text-white py-2 px-3 rounded-lg text-sm">
              How it works
            </Link>
          </div>
        </div>

        <div className="hidden md:block">{/* small decorative area for balance - keep empty to avoid logic changes */}
        </div>
      </section>

      {/* SEARCH AND FILTERS */}
      <section className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-3 sticky top-4 z-20">
        <form className="flex-1 flex items-center gap-3">
          <label htmlFor="search" className="sr-only">Search items</label>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              id="search"
              type="text" 
              placeholder="Search items, e.g. 'phone', 'sofa'..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all text-gray-900 text-sm"
            />
          </div>

          <div className="w-64 hidden lg:block">
            <label htmlFor="location" className="sr-only">Your town</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input 
                id="location"
                type="text" 
                placeholder="Your town (e.g. Embu)" 
                value={userLocation}
                onChange={(e) => setUserLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all text-gray-900 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-semibold border border-gray-200"
              title="Auto-detect location (Works best on mobile)"
            >
              {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              <span className="hidden sm:inline">Locate</span>
            </button>

            <button 
              type="button"
              onClick={() => { setSearchQuery(''); setUserLocation(''); setSelectedCategory('All'); }}
              className="bg-white border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              title="Clear filters"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Mobile location field shown under search on small screens */}
        <div className="lg:hidden">
          <label htmlFor="locationMobile" className="sr-only">Your town</label>
          <div className="relative mt-2">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              id="locationMobile"
              type="text" 
              placeholder="Your town (e.g. Embu)" 
              value={userLocation}
              onChange={(e) => setUserLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all text-gray-900 text-sm"
            />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="flex gap-3 overflow-x-auto pb-2 -mt-2 scrollbar-hide px-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;
          
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all border ${isSelected ? "bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105" : "bg-white text-gray-700 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50"}`}
              aria-pressed={isSelected}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{cat.name}</span>
              <span className="sm:hidden">{cat.name[0]}</span>
            </button>
          );
        })}
      </section>

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
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h2 className="text-xl font-bold text-gray-900">No items found</h2>
          <p className="text-gray-500 mt-1 text-sm max-w-sm mx-auto">
            {searchQuery || userLocation || selectedCategory !== "All"
              ? `We couldn't find anything matching your criteria. Try clearing your filters.` 
              : "Be the first to list an item in your area!"}
          </p>
        </div>
      )}

      {/* RESULTS HEADER */}
      {!loading && displayItems.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end px-1">
          <h2 className="text-lg font-bold text-gray-900">
            {userLocation 
              ? `Found near "${userLocation}"` 
              : selectedCategory !== "All" 
                ? `${selectedCategory} Listings` 
                : "Fresh Listings"}
          </h2>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2 sm:mt-0">{displayItems.length} items</span>
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
            <article key={item.id} className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-200 flex flex-col">
              
              {/* IMAGE */}
              <Link href={`/${item.id}`} className="relative h-48 w-full bg-gray-100 overflow-hidden block">
                {isLocalMatch && (
                  <div className="absolute top-3 left-3 z-10 bg-emerald-600 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">
                    📍 Near you
                  </div>
                )}

                <div className="absolute bottom-3 left-3 z-10 drop-shadow-md">
                  <SellerRating sellerId={item.seller_id} />
                </div>

                <Image 
                  src={item.images?.[0] || ''} 
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              {/* CONTENT */}
              <div className="p-4 flex flex-col grow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link href={`/item/${item.id}`} className="hover:text-emerald-600 transition-colors">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug text-sm">{item.title}</h3>
                    </Link>
                    <p className="text-xs text-gray-500 mt-1 truncate">{item.category || 'General'}</p>
                  </div>
                  <div className="ml-2 text-right">
                    <p className="text-lg font-extrabold text-gray-900">Ksh {item.price.toLocaleString()}</p>
                    <time className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</time>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 my-3 border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="truncate">{item.town}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="font-medium text-gray-800">{item.seller_phone}</span>
                  </div>
                </div>

                <a 
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Message seller about ${item.title} on WhatsApp`}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
