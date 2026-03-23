"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If there are no images, show a fallback
  if (!images || images.length === 0) {
    return (
      <div className="relative h-96 w-full bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Big Image */}
      <div className="relative h-96 md:h-125 w-full bg-gray-100 rounded-2xl overflow-hidden group">
        <img
          src={images[currentIndex]}
          alt={`Item image ${currentIndex + 1}`}
          className="absolute inset-0 w-full h-full object-contain"
          loading="eager" // main image loads immediately
        />

        {/* Next & Prev Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                currentIndex === index
                  ? "border-green-500 opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}