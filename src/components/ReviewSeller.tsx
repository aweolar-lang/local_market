"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Star, Loader2, CheckCircle } from "lucide-react";

export default function ReviewSeller({ sellerId }: { sellerId: string }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Status tracks if the user is allowed to leave a review right now
  const [status, setStatus] = useState<"loading" | "idle" | "success" | "already_reviewed" | "unauthenticated" | "is_seller">("loading");

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // 1. Must be logged in
      if (!session) {
        setStatus("unauthenticated");
        return;
      }

      // 2. Can't review yourself
      if (session.user.id === sellerId) {
        setStatus("is_seller");
        return;
      }

      // 3. Check if they already reviewed this seller
      const { data } = await supabase
        .from('seller_reviews')
        .select('id')
        .eq('seller_id', sellerId)
        .eq('reviewer_id', session.user.id)
        .single();

      if (data) {
        setStatus("already_reviewed");
      } else {
        setStatus("idle");
      }
    };
    checkStatus();
  }, [sellerId]);

  const handleSubmit = async () => {
    if (rating === 0) return alert("Please select a star rating!");
    setIsSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Insert the review into the database
    const { error } = await supabase.from('seller_reviews').insert([{
      seller_id: sellerId,
      reviewer_id: session.user.id,
      rating,
      comment
    }]);

    if (error) {
      alert("Error submitting review. Please try again.");
      setIsSubmitting(false);
    } else {
      setStatus("success");
    }
  };

  // --- RENDER LOGIC ---

  if (status === "loading") {
    return <div className="animate-pulse h-24 bg-gray-100 rounded-2xl w-full mt-6"></div>;
  }
  
  if (status === "unauthenticated" || status === "is_seller") {
    return null; // Hide the form completely if they aren't logged in, or if it's their own item
  }

  if (status === "already_reviewed" || status === "success") {
    return (
      <div className="bg-green-50 p-4 rounded-2xl flex items-start gap-3 border border-green-100 mt-6 shadow-sm">
        <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-green-900">Thank you!</h4>
          <p className="text-sm text-green-700">Your review for this seller has been recorded. This helps keep our community safe.</p>
        </div>
      </div>
    );
  }

  // The actual form
  return (
    <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200 shadow-sm mt-8">
      <h3 className="font-bold text-gray-900 mb-1">Rate this Seller</h3>
      <p className="text-xs text-gray-500 mb-4">Did you buy this item? Share your experience!</p>
      
      {/* Interactive Stars */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star 
              className={`h-8 w-8 ${
                star <= (hoverRating || rating) 
                  ? "fill-yellow-400 text-yellow-400" // Gold if selected/hovered
                  : "text-gray-300" // Gray if unselected
              }`} 
            />
          </button>
        ))}
      </div>

      <textarea
        placeholder="Leave an optional comment about your experience..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none mb-3 bg-white text-gray-900"
      />

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0}
        className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center"
      >
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Review"}
      </button>
    </div>
  );
}