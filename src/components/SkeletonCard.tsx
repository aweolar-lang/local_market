export default function SkeletonCard() {
  return (
    // 'animate-pulse' gives it the smooth loading fade
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm animate-pulse flex flex-col h-full">
      
      {/* Image Placeholder (Matched to h-48 to align with page.tsx) */}
      <div className="h-48 w-full bg-gray-200"></div>

      <div className="p-4 flex flex-col grow">
        {/* Title & Price Row Placeholder */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="space-y-2 text-right">
            <div className="h-5 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-12 ml-auto"></div>
          </div>
        </div>

        {/* Location & Phone Box Placeholder */}
        <div className="flex items-center justify-between gap-2 my-3 border-t border-gray-50 pt-3">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>

        {/* WhatsApp Button Placeholder */}
        <div className="h-10 bg-gray-200 rounded-lg w-full mt-auto"></div>
      </div>
    </div>
  );
}