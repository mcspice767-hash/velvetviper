"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";   // ← Corrected path
import { useRouter } from "next/navigation";

export default function ListReptile() {
  const [formData, setFormData] = useState({
    species: "",
    name: "",
    age: "",
    location: "",
    country: "USA",
    price: "",
    description: "",
    contact: "",
  });

  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", "reptiles");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: uploadData }
      );
      const data = await res.json();
      if (data.secure_url) setImageUrl(data.secure_url);
    } catch (err) {
      alert("Image upload failed");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("listings").insert({
      ...formData,
      price: Number(formData.price),
      image_url: imageUrl,
      status: "pending",
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("✅ Listing submitted! Waiting for admin approval.");
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] py-12 px-6 font-serif">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-10">List Your Reptile</h1>

        <form onSubmit={handleSubmit} className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-10 space-y-8">
          {/* Form fields same as before */}
          <div>
            <label className="block mb-2">Species *</label>
            <input name="species" required value={formData.species} onChange={handleChange} className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4" placeholder="Ball Python..." />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4" />
            </div>
            <div>
              <label className="block mb-2">Age</label>
              <input name="age" value={formData.age} onChange={handleChange} className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">Country *</label>
              <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4">
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">Location *</label>
              <input name="location" required value={formData.location} onChange={handleChange} className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4" />
            </div>
          </div>

          <div>
            <label className="block mb-2">Price *</label>
            <input name="price" type="number" required value={formData.price} onChange={handleChange} className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4" />
          </div>

          <div>
            <label className="block mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-black border border-[#2a2a2a] rounded-3xl px-6 py-4" />
          </div>

          <div>
            <label className="block mb-2">WhatsApp Contact *</label>
            <input name="contact" required value={formData.contact} onChange={handleChange} className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4" placeholder="+1234567890" />
          </div>

          <div>
            <label className="block mb-2">Upload Photo</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4" />
            {imageUrl && <img src={imageUrl} className="mt-4 rounded-2xl" />}
          </div>

          <button 
            type="submit" 
            disabled={loading || uploading}
            className="w-full bg-[#c8ff00] text-black py-5 rounded-2xl font-semibold text-xl hover:bg-white disabled:opacity-70"
          >
            {loading ? "Submitting..." : "Submit Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}