export default function SkeletonCard() {
  return (
    // 'animate-pulse' is the Tailwind magic that makes it breathe/fade!
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse flex flex-col h-full">
      
      {/* Image Placeholder */}
      <div className="h-56 w-full bg-gray-200"></div>

      <div className="p-5 flex flex-col grow">
        {/* Title Placeholder (Two lines) */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        {/* Price Placeholder */}
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>

        {/* Location Box Placeholder */}
        <div className="mt-auto bg-gray-50 h-8 rounded-lg mb-6 w-2/3"></div>

        {/* Button Placeholder */}
        <div className="h-11 bg-gray-200 rounded-xl w-full"></div>
      </div>
    </div>
  );
}