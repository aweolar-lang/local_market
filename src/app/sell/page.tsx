"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from '@supabase/supabase-js';
import { Camera, DollarSign, MapPin, Tag, AlignLeft, Image as ImageIcon, Phone, X, List, Sparkles } from "lucide-react"; 
import Image from "next/image";

const KENYAN_COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", 
  "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", 
  "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", 
  "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", 
  "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", 
  "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi", 
  "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
];


const CATEGORIES = [
  "Electronics", "Vehicles", "Furniture", "Fashion", "Services", "Other"
];

export default function SellItemPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(""); 
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [county, setCounty] = useState("");
  const [town, setTown] = useState("");
  const [sellerPhone, setSellerPhone] = useState(""); 
  
  // Array to hold multiple images
  const [imageFiles, setImageFiles] = useState<File[]>([]);

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

  // Handle Multiple Images
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...selectedFiles].slice(0, 5));
    }
  };

  // Remove a specific image from the preview
  const removeImage = (indexToRemove: number) => {
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert("You must be logged in to post an item.");
      setIsSubmitting(false);
      return;
    }
    
    if (imageFiles.length === 0 || !user) {
      alert("Please upload at least one image.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload Multiple Images in Parallel
      const uploadPromises = imageFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get the public URL for this specific image
        const { data: { publicUrl } } = supabase.storage
          .from('item-images')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      // Wait for all images to finish uploading and get their URLs
      const uploadedUrls = await Promise.all(uploadPromises);

      // C. Save to Database
      const { data: newItem, error: dbError } = await supabase
        .from('items')
        .insert([
          {
            seller_id: user.id,
            title,
            price: parseFloat(price),
            category,
            condition,
            description,
            county,
            town,
            seller_phone: sellerPhone, 
            images: uploadedUrls, 
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

  if (!user) return <div className="p-8 text-center text-gray-400">Checking authentication...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Post an Item</h1>
        <p className="text-gray-200 mt-2">Fill in the details below. There is a Ksh 100 listing fee per item.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        
        {/* Title & Condition Row */}
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
              <Sparkles className="h-4 w-4 text-green-500" /> Condition
            </label>
            <select 
              required 
              value={condition} 
              onChange={(e) => setCondition(e.target.value)} 
              className="w-full px-4 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white"
            >
              <option value="" disabled>Select...</option>
              <option value="New">Brand New</option>
              <option value="Secondhand">Secondhand</option>
            </select>
          </div>
        </div>

    
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 text-green-500" /> Price (Ksh)
            </label>
            <input 
              type="number" required min="1" value={price} onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 75000" 
              className="w-full px-4 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <List className="h-4 w-4 text-green-500" /> Category
            </label>
            <select 
              required 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="w-full px-4 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white"
            >
              <option value="" disabled>Select Category...</option>
              {CATEGORIES.map((catName) => (
                <option key={catName} value={catName}>
                  {catName}
                </option>
              ))}
            </select>
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
            className="w-full px-4 py-3 border border-gray-200 text-black rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none"
          />
        </div>

        {/* Location Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 text-green-500" /> County
            </label>
            <select 
              required 
              value={county} 
              onChange={(e) => setCounty(e.target.value)} 
              className="w-full px-4 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white"
            >
              <option value="" disabled>Select County...</option>
              {KENYAN_COUNTIES.map((countyName) => (
                <option key={countyName} value={countyName}>
                  {countyName}
                </option>
              ))}
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

        {/* WhatsApp Number Input */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Phone className="h-4 w-4 text-green-500" /> WhatsApp Number
          </label>
          <input 
            type="tel" required value={sellerPhone} onChange={(e) => setSellerPhone(e.target.value)}
            placeholder="e.g., 254712345678" 
            className="w-full px-4 py-3 border border-gray-200 text-black rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">Include country code. Buyers will use this to contact you.</p>
        </div>

        {/* Image Upload Area */}
        <div>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-green-500" /> Upload Photos (Max 5)
            </span>
            <span className="text-xs text-gray-500 font-normal">First picture will be the main cover photo.</span>
          </label>
          
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer relative bg-gray-50/50">
            <input 
              type="file" 
              multiple 
              accept="image/png, image/jpeg, image/jpg" 
              onChange={handleImageChange} 
              required={imageFiles.length === 0} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="space-y-2 text-center">
              <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
              <div className="flex text-sm text-gray-600 justify-center">
                <span className="font-semibold text-green-600">Click or Drag to add photos</span>
              </div>
            </div>
          </div>

          {/* Image Previews Row */}
          {imageFiles.length > 0 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {imageFiles.map((file, index) => (
                <div key={index} className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden border border-gray-200 group">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="h-full w-full object-cover"
                    width={96}
                    height={96}
                    style={{ objectFit: "cover" }}
                  />
                  <button 
                    type="button" 
                    onClick={() => removeImage(index)} 
                    className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-sm transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-0 inset-x-0 bg-green-500 text-white text-[10px] font-bold text-center py-0.5">
                      COVER
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" disabled={isSubmitting}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-70 transition-all"
        >
          {isSubmitting ? "Uploading Photos & Saving..." : "Continue to Payment (Ksh 100)"}
        </button>

      </form>
    </div>
  );
}