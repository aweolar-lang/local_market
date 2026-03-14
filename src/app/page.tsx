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
    <div className="space-y-8 pb-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <section className="bg-linear-to-r from-green-600 to-green-800 text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mt-1">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Buy & Sell Locally. <span className="text-green-200">Zero Hassle.</span>
          </h1>
          <p className="text-green-50 text-sm md:text-base">
            Find electronics, furniture, cars, and more from verified sellers in your neighborhood.
          </p>
        </div>
      </section>

      {/* SEARCH AND LOCATION SECTION */}
      <section className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-3 sticky top-1 z-20">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-gray-900 text-sm"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        </div>

        {/* Location Input & GPS Button */}
        <div className="relative flex-1 flex gap-2">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Your town (e.g. Embu)" 
              value={userLocation}
              onChange={(e) => setUserLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-gray-900 text-sm"
            />
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          
          <button 
            onClick={handleGetLocation}
            disabled={isLocating}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-semibold whitespace-nowrap border border-gray-200"
            title="Auto-detect location (Works best on mobile)"
          >
            {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            <span className="hidden sm:inline">Locate</span>
          </button>
        </div>
      </section>

      <section className="flex gap-3 overflow-x-auto pb-2 -mt-4 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;
          
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all border ${
                isSelected
                  ? "bg-green-600 text-white border-green-600 shadow-md transform scale-105"
                  : "bg-white text-gray-700 border-gray-200 hover:border-green-500 hover:bg-green-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {cat.name}
            </button>
          );
        })}
      </section>

      {/* SKELETON LOADING STATE */}
      {loading && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </section>
      )}

      {/* Empty State */}
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

      {/* Results Header */}
      {!loading && displayItems.length > 0 && (
        <div className="flex justify-between items-end px-1">
          <h2 className="text-lg font-bold text-white">
            {userLocation 
              ? `Found near "${userLocation}"` 
              : selectedCategory !== "All" 
                ? `${selectedCategory} Listings` 
                : "Fresh Listings"}
          </h2>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{displayItems.length} items</span>
        </div>
      )}

      {/* Real Item Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayItems.map((item) => {
          
          let formattedPhone = item.seller_phone.trim();
          if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
          }
          
          const waMessage = encodeURIComponent(`Hi, I saw your "${item.title}" on LocalSoko for Ksh ${item.price}. Is it still available?`);
          const waLink = `https://wa.me/${formattedPhone}?text=${waMessage}`;

          const isLocalMatch = userLocation && (item.town.toLowerCase().includes(userLocation.toLowerCase()) || item.county.toLowerCase().includes(userLocation.toLowerCase()));

         return (
            <div key={item.id} className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
              
              {/* 1. IMAGE AREA WITH BEAUTIFUL OVERLAYS */}
              <Link href={`/item/${item.id}`} className="relative h-48 w-full bg-gray-100 overflow-hidden block">
                
                {isLocalMatch && (
                  <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">
                    📍 Near You
                  </div>
                )}

                <div className="absolute bottom-2 left-2 z-10 drop-shadow-md hover:scale-105 transition-transform">
                  <SellerRating sellerId={item.seller_id} />
                </div>

                <Image 
                  src={item.images[0]} 
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              {/* 2. COMPACT TEXT & ACTION AREA */}
              <div className="p-4 flex flex-col grow">
                
                <Link href={`/item/${item.id}`} className="hover:text-green-600 transition-colors mb-1">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug text-sm">{item.title}</h3>
                </Link>
                
                <p className="text-lg font-black text-gray-900 mb-3">
                  Ksh {item.price.toLocaleString()}
                </p>

                {/* HORIZONTAL ALIGNMENT: Location & Phone side-by-side */}
                <div className="flex items-center justify-between gap-2 mb-4 mt-auto border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="truncate">{item.town}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="font-medium text-gray-800">{item.seller_phone}</span>
                  </div>
                </div>

                {/* Official WhatsApp Button */}
                <a 
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
