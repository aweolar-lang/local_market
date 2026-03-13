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

  // If they have no reviews yet, we just hide the badge so it stays clean
  if (count === 0) return null; 

  return (
    <div className="flex items-center gap-1 text-xs font-bold text-gray-800 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-200 w-fit">
      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" />
      <span>{average?.toFixed(1)}</span>
      <span className="text-gray-500 font-normal">({count})</span>
    </div>
  );
}