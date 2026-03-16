"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Star } from "lucide-react";

export default function SellerRating({ sellerId }: { sellerId: string }) {
  const [average, setAverage] = useState<number | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchRating = async () => {
      // Fetch all ratings for this specific seller
      const { data, error } = await supabase
        .from('seller_reviews')
        .select('rating')
        .eq('seller_id', sellerId);

      if (!error && data && data.length > 0) {
        // Calculate the average math
        const total = data.reduce((sum, review) => sum + review.rating, 0);
        setAverage(total / data.length);
        setCount(data.length);
      }
    };

    if (sellerId) {
      fetchRating();
    }
  }, [sellerId]);

  
  if (count === 0) return null; 

  return (
    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-gray-900 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-gray-200/50 shadow-sm w-fit">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500 drop-shadow-sm" />
      <span>{average?.toFixed(1)}</span>
      <span className="text-gray-600 font-semibold tracking-wide">({count})</span>
    </div>
  );
}