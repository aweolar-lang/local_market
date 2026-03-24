"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MapPin, Search, PackageOpen, Grid, Smartphone, Car, Sofa, Shirt, Briefcase, MessageCircle, Phone, X, Zap, Crown, Info
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import SkeletonCard from "@/components/SkeletonCard";
import SellerRating from "@/components/SellerRating";
import { toast } from "sonner";

const CATEGORIES = [
  { name: "All", icon: Grid },
  { name: "Electronics", icon: Smartphone },
  { name: "Vehicles", icon: Car },
  { name: "Furniture", icon: Sofa },
  { name: "Fashion", icon: Shirt },
  { name: "Services", icon: Briefcase },
  { name: "Others", icon: PackageOpen },
];

const HERO_SLIDES = [
  {
    title: "Buy & Sell Locally —",
    highlight: "Zero Hassle",
    desc: "Discover items from verified sellers near you. Fast chat, transparent prices, and safe local deals.",
    bg: "from-emerald-800 via-emerald-700 to-green-900",
  },
  {
    title: "Turn Your Clutter Into",
    highlight: "Cash Today",
    desc: "Join thousands of locals making money by selling unused electronics, furniture, and vehicles.",
    bg: "from-teal-800 via-teal-700 to-emerald-900",
  },
  {
    title: "Find The Best Deals",
    highlight: "In Your Town",
    desc: "Why wait for delivery? Find what you need locally and pick it up today safely.",
    bg: "from-green-900 via-emerald-800 to-teal-900",
  }
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
  const [selectedCategory, setSelectedCategory] = useState("All"); 
  
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // NEW: State for our Affiliate Marketing Promo Modal
  const [showPromoModal, setShowPromoModal] = useState(false);

  // Auto-Slide Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, []);

  // Fetch Items, Auto-Locate, & Show Promo Modal Logic
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

    const autoLocate = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              const data = await res.json();
              const city = data.address.city || data.address.town || data.address.county || "";
              if (city) setUserLocation(city);
            } catch (error) {
              console.error("Auto-location failed", error);
            }
          }, 
          () => {
            toast.error("Location access denied. You can still search by typing your town.");
          },
          { enableHighAccuracy: false, timeout: 5000 }
        );
      }
    };

    // Promo Modal Logic: Check if they've seen it before
    const hasSeenPromo = localStorage.getItem('hasSeenAffiliatePromo');
    if (!hasSeenPromo) {
      // Delay it by 3 seconds so they see the marketplace first
      const promoTimer = setTimeout(() => {
        setShowPromoModal(true);
      }, 3000);
      return () => clearTimeout(promoTimer);
    }

    fetchItems();
    autoLocate();
  }, []);

  // Closes the modal and never shows it again for this browser
  const closePromoModal = () => {
    setShowPromoModal(false);
    localStorage.setItem('hasSeenAffiliatePromo', 'true');
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
    <div className="space-y-5 pb-8 max-w-7xl mx-auto relative">
      
      {/* 0. NEW: THE AFFILIATE PROMO MODAL (Z-50 Overlay) */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={closePromoModal} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors z-10">
              <X className="h-5 w-5" />
            </button>
            
            <div className="bg-gradient-to-br from-indigo-900 to-gray-900 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Crown className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="mx-auto bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-4 shadow-yellow-400/30">
                  <Zap className="h-8 w-8 text-yellow-900" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">Turn your influence into <span className="text-green-400">Cash!</span></h2>
                <p className="text-gray-300 text-sm">Join the LocalSoko Partner Hub and earn a massive commission every time your friends join.</p>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 text-center">
  <div className="mb-6">
    <Link 
      href="/affiliatemrt" 
      onClick={closePromoModal}
      className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors group"
    >
      <div className="p-1.5 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
        <Info className="h-4 w-4" />
      </div>
      Read the Step-by-Step Guide
    </Link>
  </div>

  <Link href="/affiliate" onClick={closePromoModal} className="block w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-all shadow-md">
    Claim Your Affiliate Link
  </Link>
  
  <button onClick={closePromoModal} className="mt-4 text-sm text-gray-400 hover:text-gray-600 font-medium">
    No thanks, I just want to shop
  </button>
</div>
          </div>
        </div>
      )}

      {/* 1. COMPACT AUTO-SLIDING HERO */}
      <section className="relative rounded-2xl shadow-lg overflow-hidden mt-2 h-65 md:h-55 bg-emerald-900 group">
        <div 
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {HERO_SLIDES.map((slide, index) => (
            <div key={index} className={`min-w-full h-full relative p-6 md:p-10 flex flex-col justify-center bg-linear-to-br ${slide.bg} text-white`}>
              <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 max-w-xl space-y-2 md:space-y-3">
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  {slide.title} <span className="text-emerald-300">{slide.highlight}</span>
                </h1>
                <p className="text-emerald-50 text-sm md:text-base opacity-95 max-w-md font-medium leading-relaxed">
                  {slide.desc}
                </p>
                <div className="flex gap-3 pt-2">
                  <Link href="/sell" className="inline-flex items-center justify-center bg-white text-emerald-800 hover:bg-emerald-50 py-2.5 px-5 rounded-lg text-sm font-bold shadow-md transition-all">
                    List an item
                  </Link>
                  <Link href="/how-it-works" className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2.5 px-5 rounded-lg text-sm font-semibold backdrop-blur-sm transition-all">
                    How it works
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === index ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. COMPACT SEARCH BAR */}
      <section className="bg-white p-2.5 md:p-3 rounded-xl shadow-sm border border-gray-200 sticky top-4 z-30">
        <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900"
            />
          </div>
          <div className="relative flex-1 sm:max-w-50">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Your town" 
              value={userLocation}
              onChange={(e) => setUserLocation(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900"
            />
          </div>
          <button 
            type="button"
            onClick={() => { setSearchQuery(''); setUserLocation(''); setSelectedCategory('All'); }}
            className="flex justify-center items-center bg-white border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all sm:w-auto"
          >
            Clear
          </button>
        </form>
      </section>

      {/* 3. COMPACT CATEGORIES */}
      <section className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all border ${
                isSelected ? "bg-emerald-700 text-white border-emerald-700 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </section>

      {/* 4. NEW: INLINE AFFILIATE BANNER */}
      <Link href="/affiliate" className="block group">
        <section className="bg-gradient-to-r from-orange-50 via-yellow-50 to-orange-50 rounded-xl border border-orange-200 p-4 md:p-0 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-yellow-200/50 to-transparent pointer-events-none"></div>
          <div className="md:px-6 md:py-4 flex items-center gap-4 text-center md:text-left z-10">
            <div className="hidden md:flex bg-yellow-400 p-2.5 rounded-full shadow-sm text-yellow-900">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-orange-900 text-sm md:text-base">Want to earn passive income?</h3>
              <p className="text-orange-800/80 text-xs md:text-sm font-medium mt-0.5">Invite friends to LocalSoko and earn up to <span className="font-bold">Ksh 150</span> per signup.</p>
            </div>
          </div>
          <div className="md:pr-6 mt-3 md:mt-0 z-10 w-full md:w-auto">
            <span className="flex items-center justify-center gap-2 bg-orange-500 group-hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors">
              Open Partner Hub <Zap className="h-4 w-4" />
            </span>
          </div>
        </section>
      </Link>

      {/* RESULTS HEADER */}
      {!loading && (
        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mt-2">
          <h2 className="text-lg md:text-xl font-extrabold text-gray-500 tracking-tight">
            {isFiltering ? 'Search Results' : 'Fresh Recommendations'}
          </h2>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </section>
      )}

      {/* EMPTY */}
      {!loading && displayItems.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="bg-gray-50 p-5 rounded-full mb-3">
            <PackageOpen className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No items found</h3>
          <p className="text-gray-500 mt-1 text-sm max-w-sm mx-auto font-medium">
            {isFiltering
              ? `We couldn't find anything matching your filters.` 
              : "Be the first to list an item in your area!"}
          </p>
        </div>
      )}

      {/* GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {displayItems.map((item) => {
          let formattedPhone = item.seller_phone.trim();
          if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.substring(1);
          const waMessage = encodeURIComponent(`Hi, I saw your "${item.title}" on LocalSoko for Ksh ${item.price}. Is it still available?`);
          const waLink = `https://wa.me/${formattedPhone}?text=${waMessage}`;
          const isLocalMatch = userLocation && (item.town.toLowerCase().includes(userLocation.toLowerCase()) || item.county.toLowerCase().includes(userLocation.toLowerCase()));

          return (
            <article key={item.id} className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <Link href={`/${item.slug}`} className="relative h-48 w-full bg-gray-100 overflow-hidden block">
                {isLocalMatch && (
                  <div className="absolute top-2 left-2 z-10 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Near you
                  </div>
                )}
                <div className="absolute bottom-2 left-2 z-10 drop-shadow-md flex items-center gap-2">
                  <SellerRating sellerId={item.seller_id} />
                  {item.condition && (
                    <span className={`text-[9px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wider backdrop-blur-md border ${
                      item.condition === 'New' ? 'bg-blue-600/95 text-white border-blue-400/50' : 'bg-gray-800/90 text-white border-gray-600/50'
                    }`}>
                      {item.condition}
                    </span>
                  )}
                </div>
                 {item.images?.[0] && (
                  <img
                  src={item.images[0]}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                  />
              )}
              </Link>
              <div className="p-4 flex flex-col grow">
                <div className="flex-1 min-w-0 mb-1">
                  <Link href={`/${item.slug}`} className="hover:text-emerald-700 transition-colors">
                    <h3 className="font-bold text-gray-900 line-clamp-1 text-sm">{item.title}</h3>
                  </Link>
                  <p className="text-[11px] font-medium text-gray-500 truncate">{item.category || 'General'}</p>
                </div>
                <div className="flex items-end justify-between mt-1">
                  <p className="text-lg font-black text-emerald-700">Ksh {item.price.toLocaleString()}</p>
                  <time className="text-[10px] font-medium text-gray-400">{new Date(item.created_at).toLocaleDateString()}</time>
                </div>
                <div className="flex items-center justify-between gap-2 my-3 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-gray-600 min-w-0">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="truncate">{item.town}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-gray-600 shrink-0">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="text-gray-800">{item.seller_phone}</span>
                  </div>
                </div>
                <a 
                  href={waLink} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1fbd58] text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                </a>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}