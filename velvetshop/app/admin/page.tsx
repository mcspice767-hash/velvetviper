
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { createClient } from "@supabase/supabase-js";

declare module 'react' {
  interface InputHTMLAttributes<T> {
    webkitdirectory?: boolean;
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Listing {
  id: string;
  species: string;
  name?: string;
  age?: string;
  location: string;
  country?: string;
  price: number;
  image_url?: string;
  description?: string;
  contact?: string;
  status: string;
  featured?: boolean;
  payment_status?: string;
  created_at?: string;
}

interface Notification {
  id: string;
  type: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

const getCurrency = (country?: string) => {
  switch (country?.toLowerCase()) {
    case "uk": return { symbol: "£", standard: "£2", featured: "£5", standardNum: 2 };
    case "usa": return { symbol: "$", standard: "$2", featured: "$5", standardNum: 2 };
    case "canada": return { symbol: "CA$", standard: "CA$2", featured: "CA$5", standardNum: 2 };
    default: return { symbol: "$", standard: "$2", featured: "$5", standardNum: 2 };
  }
};

const ADMIN_PASSWORD = "velvet2026";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "post" | "notifications">("pending");
  const [listings, setListings] = useState<Listing[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [postForm, setPostForm] = useState({
    species: "",
    name: "",
    age: "",
    country: "USA",
    location: "",
    price: "",
    description: "",
    contact: "",
    featured: false,
    gender: "Male",
    health: "Vaccinated",
    availability: "Available",
  });
  const [postImageUrl, setPostImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [postImages, setPostImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("adminAuth");
    if (saved === "true") setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchListings();
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuth", "true");
    } else {
      alert("Incorrect password");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuth");
  };

  const fetchListings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });
    setListings(data || []);
    setLoading(false);
  };

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    setNotifications(data || []);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("listings").update({ status }).eq("id", id);
    fetchListings();
  };

  const toggleFeatured = async (id: string, current?: boolean) => {
    await supabase.from("listings").update({ featured: !current }).eq("id", id);
    fetchListings();
  };

  const markAsPaid = async (id: string) => {
    await supabase.from("listings").update({ payment_status: "paid" }).eq("id", id);
    fetchListings();
  };

  const deleteListing = async (id: string) => {
    if (confirm("Delete this listing permanently?")) {
      await supabase.from("listings").delete().eq("id", id);
      fetchListings();
    }
  };

  const markNotificationRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    fetchNotifications();
  };

  const markAllRead = async () => {
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    fetchNotifications();
  };

  const handleFolderUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);
    setUploadProgress(`Uploading 0 of ${files.length} images...`);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1} of ${files.length} images...`);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "reptiles");

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        if (data.secure_url) uploadedUrls.push(data.secure_url);
      } catch {
        console.error("Failed to upload", file.name);
      }
    }

    setPostImages(uploadedUrls);
    if (uploadedUrls.length > 0) setPostImageUrl(uploadedUrls[0]);
    setUploadingImage(false);
    setUploadProgress("");
  };

  const handleGenerateWithAI = async () => {
    if (!postImageUrl) return;
    setGeneratingAI(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || "",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "url",
                    url: postImageUrl,
                  },
                },
                {
                  type: "text",
                  text: `You are a reptile expert. Analyze this reptile image and respond ONLY with a JSON object (no markdown, no backticks) with these fields:
{
  "species": "exact species name",
  "name": "a cool reptile name",
  "age": "estimated age range",
  "price": 250,
  "description": "2-3 sentences about temperament, care requirements, feeding, and why someone would want this reptile"
}`,
                },
              ],
            },
          ],
        }),
      });
      const data = await response.json();
      const text = data.content[0].text;
      const parsed = JSON.parse(text);
      setPostForm((prev) => ({
        ...prev,
        species: parsed.species || prev.species,
        name: parsed.name || prev.name,
        age: parsed.age || prev.age,
        price: String(parsed.price) || prev.price,
        description: parsed.description || prev.description,
      }));
      setSuccessMsg("✅ AI filled the details! Review and edit if needed.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (error) {
      console.error("AI generation failed:", error);
      alert("AI analysis failed. Please fill the details manually.");
    }
    setGeneratingAI(false);
  };

  const handlePostReptile = async () => {
    if (!postForm.species || !postForm.location || !postForm.contact || !postForm.price) {
      alert("Please fill all required fields");
      return;
    }
    setPostLoading(true);
    const { error } = await supabase.from("listings").insert({
      species: postForm.species,
      name: postForm.name || null,
      age: postForm.age || null,
      country: postForm.country,
      location: postForm.location,
      price: Number(postForm.price),
      description: postForm.description || null,
      contact: postForm.contact,
      image_url: postImages[0] || null,
      images: postImages,
      featured: postForm.featured,
      gender: postForm.gender,
      health: postForm.health,
      availability: postForm.availability,
      status: "approved",
      payment_status: "paid",
    });
    setPostLoading(false);
    if (error) {
      alert("Error: " + error.message);
    } else {
      setSuccessMsg("✅ Reptile posted successfully and is now live!");
      setPostForm({ species: "", name: "", age: "", country: "USA", location: "", price: "", description: "", contact: "", featured: false, gender: "Male", health: "Vaccinated", availability: "Available" });
      setPostImageUrl("");
      setPostImages([]);
      fetchListings();
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredListings = listings.filter(l => l.status === activeTab);
  const totalRevenue = listings
    .filter(l => l.status === "approved" && l.payment_status === "paid")
    .reduce((sum, l) => sum + getCurrency(l.country).standardNum, 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-12 w-full max-w-md text-center">
          <div className="text-6xl mb-6">🐍</div>
          <h1 className="text-3xl font-bold text-[#e8e0d0] mb-2">Admin Access</h1>
          <p className="text-gray-500 mb-8">VelvetViper Dashboard</p>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00] mb-4"
          />
          <button
            onClick={login}
            className="w-full bg-[#c8ff00] text-black py-4 rounded-2xl font-bold text-lg hover:bg-white transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] font-serif">
      {/* Header */}
      <div className="border-b border-[#2a2a2a] bg-black/80 px-8 py-6 flex justify-between items-center sticky top-0 z-50 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🐍</span>
          <div>
            <h1 className="text-2xl font-bold text-[#c8ff00]">VelvetViper Admin</h1>
            <p className="text-xs text-gray-500 tracking-widest uppercase">Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#c8ff00]">{listings.filter(l => l.status === "approved").length}</div>
            <div className="text-xs text-gray-500">Live</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{listings.filter(l => l.status === "pending").length}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">${totalRevenue}</div>
            <div className="text-xs text-gray-500">Revenue</div>
          </div>
          <button onClick={logout} className="text-red-500 hover:text-red-400 text-sm border border-red-500/30 px-4 py-2 rounded-xl">
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a2a2a] bg-[#0a0a0a] sticky top-[88px] z-40 px-8 overflow-x-auto">
        {[
          { key: "pending", label: "Pending", count: listings.filter(l => l.status === "pending").length },
          { key: "approved", label: "Approved", count: listings.filter(l => l.status === "approved").length },
          { key: "rejected", label: "Rejected", count: listings.filter(l => l.status === "rejected").length },
          { key: "post", label: "✚ Post Reptile", count: null },
          { key: "notifications", label: "🔔 Notifications", count: unreadCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-8 py-5 text-sm font-medium tracking-wider uppercase relative whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "text-[#c8ff00] border-b-2 border-[#c8ff00]"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                tab.key === "notifications" ? "bg-blue-600" :
                tab.key === "pending" ? "bg-yellow-600" :
                tab.key === "approved" ? "bg-green-600" : "bg-red-600"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {successMsg && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-600 text-green-400 rounded-2xl text-center">
            {successMsg}
          </div>
        )}

        {/* POST REPTILE TAB */}
        {activeTab === "post" && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="text-[#c8ff00] text-sm tracking-widest mb-2">ADMIN</div>
              <h2 className="text-4xl font-bold">Post a Reptile</h2>
              <p className="text-gray-500 mt-2">Listings posted here go live immediately.</p>
            </div>

            <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Species *</label>
                <input
                  value={postForm.species}
                  onChange={(e) => setPostForm({ ...postForm, species: e.target.value })}
                  className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 focus:outline-none focus:border-[#c8ff00] text-[#e8e0d0]"
                  placeholder="Ball Python, Bearded Dragon..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Name</label>
                  <input
                    value={postForm.name}
                    onChange={(e) => setPostForm({ ...postForm, name: e.target.value })}
                    className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 focus:outline-none focus:border-[#c8ff00] text-[#e8e0d0]"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Age</label>
                  <input
                    value={postForm.age}
                    onChange={(e) => setPostForm({ ...postForm, age: e.target.value })}
                    className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 focus:outline-none focus:border-[#c8ff00] text-[#e8e0d0]"
                    placeholder="2 years"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Country *</label>
                  <select
                    value={postForm.country}
                    onChange={(e) => setPostForm({ ...postForm, country: e.target.value })}
                    className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 focus:outline-none focus:border-[#c8ff00] text-[#e8e0d0]"
                  >
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Location *</label>
                  <input
                    value={postForm.location}
                    onChange={(e) => setPostForm({ ...postForm, location: e.target.value })}
                    className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 focus:outline-none focus:border-[#c8ff00] text-[#e8e0d0]"
                    placeholder="New York, London..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Price *</label>
                <input
                  type="number"
                  value={postForm.price}
                  onChange={(e) => setPostForm({ ...postForm, price: e.target.value })}
                  className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 focus:outline-none focus:border-[#c8ff00] text-[#e8e0d0]"
                  placeholder="250"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={postForm.description}
                  onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                  rows={4}
                  className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 focus:outline-none focus:border-[#c8ff00] text-[#e8e0d0] resize-none"
                  placeholder="Temperament, feeding, care notes..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">WhatsApp Contact *</label>
                <input
                  value={postForm.contact}
                  onChange={(e) => setPostForm({ ...postForm, contact: e.target.value })}
                  className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 focus:outline-none focus:border-[#c8ff00] text-[#e8e0d0]"
                  placeholder="+12345678901"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Gender</label>
                  <select
                    value={postForm.gender}
                    onChange={(e) => setPostForm({ ...postForm, gender: e.target.value })}
                    className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 focus:outline-none focus:border-[#c8ff00] text-[#e8e0d0]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Health Status</label>
                  <select
                    value={postForm.health}
                    onChange={(e) => setPostForm({ ...postForm, health: e.target.value })}
                    className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 focus:outline-none focus:border-[#c8ff00] text-[#e8e0d0]"
                  >
                    <option value="Vaccinated">Vaccinated</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Needs Care">Needs Care</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Availability</label>
                  <select
                    value={postForm.availability}
                    onChange={(e) => setPostForm({ ...postForm, availability: e.target.value })}
                    className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 focus:outline-none focus:border-[#c8ff00] text-[#e8e0d0]"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Upload Photo Folder</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  webkitdirectory
                  onChange={handleFolderUpload}
                  className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0]"
                />
                {uploadingImage && <p className="text-sm text-gray-400 mt-2">{uploadProgress}</p>}
                {postImages.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      {postImages.map((url, i) => (
                        <div key={i} className="relative">
                          <img src={url} className="rounded-xl w-full h-24 object-cover" />
                          {i === 0 && (
                            <span className="absolute top-1 left-1 bg-[#c8ff00] text-black text-xs px-2 py-0.5 rounded-full">
                              Cover
                            </span>
                          )}
                          <button
                            onClick={() => setPostImages(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleGenerateWithAI}
                      disabled={generatingAI}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 text-white px-6 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
                    >
                      {generatingAI ? "🤖 Analyzing image..." : "🤖 Generate with AI"}
                    </button>
                  </div>
                )}
              </div>

              {/* LIVE PREVIEW */}
              <div className="mt-8">
                <div className="text-[#c8ff00] text-sm tracking-widest mb-4">LIVE PREVIEW</div>
                <div className="bg-white rounded-3xl p-6 shadow-lg">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center">
                      {postImages[0] ? (
                        <img src={postImages[0]} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <div className="text-gray-400 text-xs">No image</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-black">{postForm.species || "Species"}</h3>
                          <p className="text-gray-600 text-sm">{postForm.name || "Name"}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-black font-bold text-lg">${postForm.price || "0"}</div>
                          <div className="text-gray-500 text-xs">{postForm.location || "Location"}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{postForm.gender || "Gender"}</span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{postForm.health || "Health"}</span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{postForm.availability || "Available"}</span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">{postForm.description || "Description will appear here..."}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={postForm.featured}
                  onChange={(e) => setPostForm({ ...postForm, featured: e.target.checked })}
                  className="w-5 h-5 accent-[#c8ff00]"
                />
                <label htmlFor="featured" className="text-sm text-gray-400 cursor-pointer">Mark as Featured ⭐</label>
              </div>

              <button
                onClick={handlePostReptile}
                disabled={postLoading || uploadingImage}
                className="w-full bg-[#c8ff00] text-black py-5 rounded-2xl font-bold text-lg hover:bg-white transition disabled:opacity-50"
              >
                {postLoading ? "Posting..." : "Post Reptile Live →"}
              </button>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="text-[#c8ff00] text-sm tracking-widest mb-2">INBOX</div>
                <h2 className="text-4xl font-bold">Notifications</h2>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="border border-[#c8ff00] text-[#c8ff00] px-6 py-3 rounded-xl text-sm hover:bg-[#c8ff00] hover:text-black transition"
                >
                  Mark All Read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <div className="text-6xl mb-4">🔔</div>
                <p>No notifications yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`bg-[#111] border rounded-2xl p-6 flex justify-between items-start gap-4 ${
                      !notif.read ? "border-[#c8ff00]/40" : "border-[#2a2a2a]"
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${!notif.read ? "bg-[#c8ff00]" : "bg-gray-600"}`} />
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            notif.type === "signup" ? "bg-green-900/50 text-green-400" :
                            notif.type === "login" ? "bg-blue-900/50 text-blue-400" :
                            notif.type === "gift_card" ? "bg-yellow-900/50 text-yellow-400" :
                            "bg-gray-800 text-gray-400"
                          }`}>
                            {notif.type?.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(notif.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[#e8e0d0] font-medium">{notif.email}</p>
                        <p className="text-gray-400 text-sm mt-1">{notif.message}</p>
                      </div>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={() => markNotificationRead(notif.id)}
                        className="text-xs text-gray-500 hover:text-[#c8ff00] border border-gray-700 px-3 py-1.5 rounded-lg whitespace-nowrap transition"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LISTINGS TABS */}
        {(activeTab === "pending" || activeTab === "approved" || activeTab === "rejected") && (
          <div>
            <div className="mb-8">
              <div className="text-[#c8ff00] text-sm tracking-widest mb-2">LISTINGS</div>
              <h2 className="text-4xl font-bold capitalize">{activeTab} Listings</h2>
            </div>

            {loading ? (
              <div className="text-center py-20 text-gray-500">Loading listings...</div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <div className="text-6xl mb-4">🐍</div>
                <p>No {activeTab} listings.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredListings.map((listing) => {
                  const curr = getCurrency(listing.country);
                  return (
                    <div key={listing.id} className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-6 flex gap-6">
                      <div className="w-40 h-40 bg-black rounded-2xl overflow-hidden flex-shrink-0">
                        {listing.image_url ? (
                          <img src={listing.image_url} alt={listing.species} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">🐍</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-2xl font-bold">{listing.species}</h3>
                            {listing.name && <p className="text-[#c8ff00]">{listing.name}</p>}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-mono text-[#c8ff00]">{curr.symbol}{listing.price}</div>
                            <div className="text-xs text-gray-500">{listing.country}</div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-400 space-y-1 mb-4">
                          <p>📍 {listing.location}</p>
                          {listing.contact && <p>📱 {listing.contact}</p>}
                          {listing.description && <p className="line-clamp-1">📝 {listing.description}</p>}
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <span className={`text-xs px-3 py-1 rounded-full ${
                              listing.payment_status === "paid" ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
                            }`}>
                              {listing.payment_status === "paid" ? "✓ Paid" : "✗ Unpaid"}
                            </span>
                            {listing.featured && (
                              <span className="text-xs px-3 py-1 rounded-full bg-yellow-900/50 text-yellow-400">⭐ Featured</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {listing.status === "pending" && (
                            <>
                              <button onClick={() => updateStatus(listing.id, "approved")} className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-xl text-sm font-medium transition">
                                ✓ Approve
                              </button>
                              <button onClick={() => updateStatus(listing.id, "rejected")} className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl text-sm font-medium transition">
                                ✗ Reject
                              </button>
                            </>
                          )}
                          {listing.status === "rejected" && (
                            <button onClick={() => updateStatus(listing.id, "approved")} className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-xl text-sm font-medium transition">
                              ✓ Approve
                            </button>
                          )}
                          {listing.status === "approved" && (
                            <button onClick={() => updateStatus(listing.id, "rejected")} className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl text-sm font-medium transition">
                              ✗ Reject
                            </button>
                          )}
                          <button onClick={() => toggleFeatured(listing.id, listing.featured)} className="bg-yellow-600 hover:bg-yellow-700 px-5 py-2 rounded-xl text-sm font-medium transition">
                            {listing.featured ? "★ Unfeature" : "☆ Feature"}
                          </button>
                          <button onClick={() => markAsPaid(listing.id)} className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl text-sm font-medium transition">
                            $ Mark Paid
                          </button>
                          <button onClick={() => deleteListing(listing.id)} className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-xl text-sm font-medium transition">
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}