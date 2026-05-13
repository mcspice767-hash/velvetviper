"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "../../lib/supabase";

const ADMIN_PASSWORD = "velvet2026";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "post">("pending");

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Post Form
  const [postForm, setPostForm] = useState({
    species: "",
    name: "",
    age: "",
    country: "USA",
    location: "",
    price: "",
    description: "",
    contact: "",
  });

  const [postImages, setPostImages] = useState<string[]>([]);
  const [postImageUrl, setPostImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("adminAuth");
    if (saved === "true") setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchListings();
  }, [isAuthenticated]);

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuth", "true");
    } else {
      alert("Incorrect password");
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    const { data } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
    setListings(data || []);
    setLoading(false);
  };

  const handleFolderUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const uploaded: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "reptiles");

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        if (data.secure_url) uploaded.push(data.secure_url);
      } catch (err) {
        console.error("Upload failed");
      }
    }

    setPostImages(uploaded);
    if (uploaded.length > 0) setPostImageUrl(uploaded[0]);
    setUploading(false);
  };

  const handlePostReptile = async () => {
    if (!postForm.species || !postForm.location || !postForm.contact || !postForm.price) {
      alert("Please fill all required fields (*)");
      return;
    }

    const { error } = await supabase.from("listings").insert({
      ...postForm,
      price: Number(postForm.price),
      image_url: postImageUrl || null,
      images: postImages,
      status: "approved",
      payment_status: "paid",
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      setSuccessMsg("✅ Reptile posted successfully and is now live!");
      // Reset form
      setPostForm({ species: "", name: "", age: "", country: "USA", location: "", price: "", description: "", contact: "" });
      setPostImages([]);
      setPostImageUrl("");
      fetchListings();

      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="bg-[#111] p-10 rounded-3xl w-full max-w-md">
          <h1 className="text-3xl font-bold mb-8 text-center">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 mb-6"
            placeholder="Enter admin password"
          />
          <button onClick={login} className="w-full bg-[#c8ff00] text-black py-4 rounded-2xl font-bold">
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] p-6">
      <h1 className="text-4xl font-bold mb-8">VelvetViper Admin</h1>

      <div className="flex gap-2 border-b border-[#2a2a2a] mb-8 overflow-x-auto pb-1">
        {["pending", "approved", "rejected", "post"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 capitalize ${activeTab === tab ? "border-b-4 border-[#c8ff00] text-[#c8ff00]" : "text-gray-500"}`}
          >
            {tab === "post" ? "✚ Post Reptile" : tab}
          </button>
        ))}
      </div>

      {activeTab === "post" && (
        <div className="max-w-2xl mx-auto bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 space-y-6">
          <h2 className="text-3xl font-bold">Post New Reptile</h2>

          <div>
            <label className="block text-sm mb-2">Upload Images / Folder</label>
            <input
              type="file"
              accept="image/*"
              multiple
              webkitdirectory
              onChange={handleFolderUpload}
              className="w-full bg-black border border-[#2a2a2a] rounded-2xl p-4"
            />
          </div>

          {postImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {postImages.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} className="rounded-xl w-full h-24 object-cover" />
                  <button
                    onClick={() => setPostImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-6">
            <input
              placeholder="Species *"
              value={postForm.species}
              onChange={(e) => setPostForm({ ...postForm, species: e.target.value })}
              className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4"
            />
            <input
              placeholder="Name"
              value={postForm.name}
              onChange={(e) => setPostForm({ ...postForm, name: e.target.value })}
              className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4"
            />
            <input
              placeholder="Price *"
              type="number"
              value={postForm.price}
              onChange={(e) => setPostForm({ ...postForm, price: e.target.value })}
              className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4"
            />
            <textarea
              placeholder="Description"
              value={postForm.description}
              onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
              className="w-full bg-black border border-[#2a2a2a] rounded-3xl px-6 py-4 h-32"
            />
            <input
              placeholder="WhatsApp Contact *"
              value={postForm.contact}
              onChange={(e) => setPostForm({ ...postForm, contact: e.target.value })}
              className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4"
            />

            <button
              onClick={handlePostReptile}
              className="w-full bg-[#c8ff00] text-black py-5 rounded-2xl font-bold text-xl hover:bg-white transition"
            >
              Post Reptile Live
            </button>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-2xl shadow-xl">
          {successMsg}
        </div>
      )}
    </div>
  );
}