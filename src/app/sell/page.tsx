"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from '@supabase/supabase-js';
import { Camera, DollarSign, MapPin, Tag, AlignLeft, Image as ImageIcon, Phone } from "lucide-react"; // <-- Added Phone icon

export default function SellItemPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  // Form State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [county, setCounty] = useState("");
  const [town, setTown] = useState("");
  const [sellerPhone, setSellerPhone] = useState(""); // <-- New State for Phone Number
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !user) {
      alert("Please upload an image and ensure you are logged in.");
      return;
    }

    setIsSubmitting(true);

    try {
      // A. Upload Image
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // B. Get Image URL
      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(filePath);

      // C. Save to Database (Now including the phone number!)
      const { data: newItem, error: dbError } = await supabase
        .from('items')
        .insert([
          {
            seller_id: user.id,
            title,
            price: parseFloat(price),
            description,
            county,
            town,
            seller_phone: sellerPhone, // <-- Saving the phone number here!
            images: [publicUrl],
            status: 'pending_payment'
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      alert("Item saved! Redirecting to payment...");
      router.push(`/pay/${newItem.id}`); 

    } catch (error) {
      console.error("Save Error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      alert(`Error saving item: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <div className="p-8 text-center text-gray-500">Checking authentication...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Post an Item</h1>
        <p className="text-gray-500 mt-2">Fill in the details below. There is a Ksh 100 listing fee per item.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        
        {/* Title & Price Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Tag className="h-4 w-4 text-green-500" /> Item Title
            </label>
            <input 
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Used Samsung S22" 
              className="w-full px-4 py-3 border border-gray-200 text-black rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 text-green-500" /> Price (Ksh)
            </label>
            <input 
              type="number" required min="1" value={price} onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 75000" 
              className="w-full px-4 py-3 border text-black  border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        {/* Description Input */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <AlignLeft className="h-4 w-4 text-green-500" /> Description
          </label>
          <textarea 
            required rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the condition, features..." 
            className="w-full px-4 py-3 border border-gray-200 text-black  rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none"
          />
        </div>

        {/* Location Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 text-green-500" /> County
            </label>
            <select required value={county} onChange={(e) => setCounty(e.target.value)} className="w-full px-4 py-3 border text-black  border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white">
              <option value="">Select County...</option>
              <option value="Nairobi">Nairobi</option>
              <option value="Kiambu">Kiambu</option>
              <option value="Mombasa">Mombasa</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 text-green-500" /> Town / Area
            </label>
            <input 
              type="text" required value={town} onChange={(e) => setTown(e.target.value)}
              placeholder="e.g., Westlands" 
              className="w-full px-4 py-3 border border-gray-200 text-black rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        {/* WhatsApp Number Input (NEW!) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Phone className="h-4 w-4 text-green-500" /> WhatsApp Number
          </label>
          <input 
            type="tel" required value={sellerPhone} onChange={(e) => setSellerPhone(e.target.value)}
            placeholder="e.g., 254712345678" 
            className="w-full px-4 py-3 border border-gray-200 text-black  rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">Include country code. Buyers will use this to contact you.</p>
        </div>

        {/* Image Upload Area */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Camera className="h-4 w-4 text-green-500" /> Upload Primary Photo
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer relative">
            <input 
              type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleImageChange} required
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-1 text-center">
              {imageFile ? (
                <div className="flex flex-col items-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-green-500" />
                  <p className="text-sm text-green-600 font-medium mt-2">{imageFile.name}</p>
                </div>
              ) : (
                <>
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <span className="font-medium text-green-600">Click to upload</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" disabled={isSubmitting}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-70 transition-all"
        >
          {isSubmitting ? "Uploading & Saving..." : "Continue to Payment (Ksh 100)"}
        </button>

      </form>
    </div>
  );
}