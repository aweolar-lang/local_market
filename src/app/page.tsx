"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Search, PackageOpen, Navigation, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import SkeletonCard from "@/components/SkeletonCard";

// Strictly typing expected data
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
  description?: string;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive States
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<string>(""); 
  const [isLocating, setIsLocating] = useState(false);

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

  // HTML5 Geolocation to find the user's actual city
  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Free reverse geocoding to get the city/town name from coordinates
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
      }, () => {
        alert("Location access denied. Please type your location manually.");
        setIsLocating(false);
      });
    } else {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
    }
  };

  // Smart Filtering & Sorting
  // 1. Filter by search query
  // 2. Sort so items matching the user's location appear FIRST
  const displayItems = items
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (!userLocation) return 0; // No location set, keep default order
      
      const loc = userLocation.toLowerCase();
      const aIsLocal = a.town.toLowerCase().includes(loc) || a.county.toLowerCase().includes(loc);
      const bIsLocal = b.town.toLowerCase().includes(loc) || b.county.toLowerCase().includes(loc);
      
      if (aIsLocal && !bIsLocal) return -1; // A goes first
      if (!aIsLocal && bIsLocal) return 1;  // B goes first
      return 0; // Keep same
    });

  return (
    <div className="space-y-10 pb-10">
      
      {/* NEW HERO SECTION */}
      <section className="bg-green-600 text-white rounded-3xl p-8 md:p-12 shadow-lg text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 mt-4">
        <div className="max-w-xl space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Find exactly what you need, <span className="text-green-200">right in your neighborhood.</span>
          </h1>
          <p className="text-green-100 text-lg">
            Buy and sell electronics, furniture, and more with people near you. Safely and securely.
          </p>
        </div>
      </section>

      {/* 🔍 SEARCH & LOCATION FILTER BAR */}
      <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 sticky top-4 z-10">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search for cars, phones, sofas..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-gray-900"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>

        {/* Location Input & GPS Button */}
        <div className="relative flex-1 flex gap-2">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Enter your town or county..." 
              value={userLocation}
              onChange={(e) => setUserLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-gray-900"
            />
            <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
          
          <button 
            onClick={handleGetLocation}
            disabled={isLocating}
            className="bg-gray-900 hover:bg-black text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all font-medium whitespace-nowrap"
          >
            {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
            <span className="hidden sm:inline">Near Me</span>
          </button>
        </div>
      </section>

     {/* SKELETON LOADING STATE */}
      {loading && (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* An array of 8 empty slots to show 8 skeletons */}
          {[...Array(8)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </section>
      )}

      {/* Empty State */}
      {!loading && displayItems.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <PackageOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">No items found</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            {searchQuery || userLocation 
              ? "We couldn't find anything matching your search in this area. Try adjusting your filters." 
              : "Be the first to list an item in your area!"}
          </p>
        </div>
      )}

      {/* Results Header */}
      {!loading && displayItems.length > 0 && (
        <div className="flex justify-between items-end px-2">
          <h2 className="text-xl font-bold text-gray-900">
            {userLocation ? `Items near "${userLocation}"` : "Latest Additions"}
          </h2>
          <span className="text-sm text-gray-500">{displayItems.length} items</span>
        </div>
      )}

      {/* Real Item Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayItems.map((item) => {
          const waMessage = encodeURIComponent(`Hi, I saw your "${item.title}" on LocalSoko for Ksh ${item.price}. Is it still available?`);
          const waLink = `https://wa.me/${item.seller_phone}?text=${waMessage}`;

          // Highlight items that match the user's location
          const isLocalMatch = userLocation && (item.town.toLowerCase().includes(userLocation.toLowerCase()) || item.county.toLowerCase().includes(userLocation.toLowerCase()));

          return (
            <div key={item.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
              
              <Link href={`/item/${item.id}`} className="relative h-56 w-full bg-gray-100 overflow-hidden block">
                {isLocalMatch && (
                  <div className="absolute top-3 left-3 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    📍 Nearby
                  </div>
                )}
                <Image 
                  src={item.images[0]} 
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              <div className="p-5 flex flex-col grow">
                <Link href={`/item/${item.id}`} className="hover:text-green-600 transition-colors mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">{item.title}</h3>
                </Link>
                
                <p className="text-xl font-black text-green-600 mb-4">
                  Ksh {item.price.toLocaleString()}
                </p>

                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 mt-auto bg-gray-50 p-2 rounded-lg">
                  <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="truncate font-medium">{item.town}, {item.county}</span>
                </div>

                <a 
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-3 rounded-xl text-sm font-bold transition-colors"
                >
                  Message Seller
                </a>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
