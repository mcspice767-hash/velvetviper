"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "../../lib/supabase";

declare module "react" {
  interface InputHTMLAttributes<T> {
    webkitdirectory?: boolean;
    directory?: boolean;
  }
}

const ADMIN_PASSWORD = "velvet2026";

interface Listing {
  id: string;
  species: string;
  name?: string;
  age?: string;
  location?: string;
  country?: string;
  price: number;
  description?: string;
  contact?: string;
  gender?: string;
  health?: string;
  availability?: string;
  status: string;
  image_url?: string;
  images?: string[];
  featured?: boolean;
  payment_status?: string;
  created_at: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "post">("pending");

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Edit modal
  const [editListing, setEditListing] = useState<Listing | null>(null);
  const [editForm, setEditForm] = useState<Partial<Listing>>({});
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Post Form
  const [postForm, setPostForm] = useState({
    species: "", name: "", age: "", country: "USA", location: "",
    price: "", description: "", contact: "", featured: false,
    gender: "Male", health: "Vaccinated", availability: "Available",
  });
  const [postImages, setPostImages] = useState<string[]>([]);
  const [postImageUrl, setPostImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<string | null>(null);
  const [postLoading, setPostLoading] = useState(false);

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

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuth");
  };

  const fetchListings = async () => {
    setLoading(true);
    const { data } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
    setListings(data || []);
    setLoading(false);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Approve / Reject / Delete
  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("listings").update({ status }).eq("id", id);
    if (!error) {
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      showSuccess(`Listing ${status}`);
    }
  };

  const deleteListing = async (id: string) => {
    if (!confirm("Delete this listing permanently?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (!error) {
      setListings((prev) => prev.filter((l) => l.id !== id));
      showSuccess("Listing deleted");
    }
  };

  // Edit modal
  const openEdit = (listing: Listing) => {
    setEditListing(listing);
    setEditForm({ ...listing });
    setEditImageUrl(listing.image_url || "");
    setEditImages(listing.images || []);
  };

  const closeEdit = () => {
    setEditListing(null);
    setEditForm({});
    setEditImageUrl("");
    setEditImages([]);
  };

  const handleEditImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingEditImage(true);
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
      } catch {}
    }
    if (uploaded.length > 0) {
      setEditImages((prev) => [...prev, ...uploaded]);
      if (!editImageUrl) setEditImageUrl(uploaded[0]);
    }
    setUploadingEditImage(false);
  };

  const saveEdit = async () => {
    if (!editListing) return;
    setEditLoading(true);
    const updates = {
      ...editForm,
      price: Number(editForm.price),
      image_url: editImageUrl || editForm.image_url,
      images: editImages.length > 0 ? editImages : editForm.images,
    };
    const { error } = await supabase.from("listings").update(updates).eq("id", editListing.id);
    setEditLoading(false);
    if (error) {
      alert("Error saving: " + error.message);
    } else {
      setListings((prev) => prev.map((l) => (l.id === editListing.id ? { ...l, ...updates } : l)));
      showSuccess("Listing updated!");
      closeEdit();
    }
  };

  // Post
  const handleFolderUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingImage(true);
    const uploadedUrls: string[] = [];
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
        if (data.secure_url) uploadedUrls.push(data.secure_url);
      } catch {}
    }
    setPostImages(uploadedUrls);
    if (uploadedUrls.length > 0) setPostImageUrl(uploadedUrls[0]);
    setUploadingImage(false);
  };

  const generateWithAI = async () => {
    if (!postImageUrl) { alert("Please upload an image first"); return; }
    setAiLoading(true);
    setAiError(null);
    try {
      const imageResponse = await fetch(postImageUrl);
      const imageBlob = await imageResponse.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
      });
      const prompt = `You are an expert reptile specialist. Analyze this reptile image and respond ONLY with a valid JSON object — no markdown, no backticks.
Use this country for pricing: ${postForm.country}
{"species":"full species name","name":"creative pet name","age":"approximate age","price":250,"gender":"Male or Female or Unknown","health":"Healthy or Vaccinated or Needs Care","availability":"Available","description":"3 sentences about temperament, care, and why it makes a great pet."}`;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ inline_data: { mime_type: imageBlob.type || "image/jpeg", data: base64 } }, { text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
          }),
        }
      );
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setPostForm((prev) => ({
        ...prev,
        species: parsed.species || prev.species,
        name: parsed.name || prev.name,
        age: parsed.age || prev.age,
        price: String(parsed.price) || prev.price,
        description: parsed.description || prev.description,
        gender: parsed.gender || prev.gender,
        health: parsed.health || prev.health,
        availability: parsed.availability || prev.availability,
      }));
      setAiSuccess("AI generated all details! Review and edit if needed.");
      setTimeout(() => setAiSuccess(null), 4000);
    } catch (err) {
      setAiError("AI analysis failed: " + (err instanceof Error ? err.message : "Unknown error"));
    }
    setAiLoading(false);
  };

  const handlePostReptile = async () => {
    if (!postForm.species || !postForm.location || !postForm.contact || !postForm.price) {
      alert("Please fill all required fields");
      return;
    }
    setPostLoading(true);
    const { error } = await supabase.from("listings").insert({
      ...postForm,
      price: Number(postForm.price),
      image_url: postImageUrl || null,
      images: postImages,
      status: "approved",
      payment_status: "paid",
    });
    setPostLoading(false);
    if (error) {
      alert("Error: " + error.message);
    } else {
      showSuccess("Reptile posted successfully and is now live!");
      setPostForm({ species: "", name: "", age: "", country: "USA", location: "", price: "", description: "", contact: "", featured: false, gender: "Male", health: "Vaccinated", availability: "Available" });
      setPostImages([]);
      setPostImageUrl("");
      fetchListings();
    }
  };

  const filtered = listings.filter((l) => activeTab !== "post" && l.status === activeTab);
  const counts = {
    pending: listings.filter((l) => l.status === "pending").length,
    approved: listings.filter((l) => l.status === "approved").length,
    rejected: listings.filter((l) => l.status === "rejected").length,
  };

  const inputCls = "w-full bg-black border border-[#2a2a2a] rounded-2xl px-5 py-3 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00] text-sm";
  const selectCls = "w-full bg-black border border-[#2a2a2a] rounded-2xl px-5 py-3 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00] text-sm";

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="bg-[#111] border border-[#2a2a2a] p-10 rounded-3xl w-full max-w-md text-center">
          <span className="text-5xl">🐍</span>
          <h1 className="text-3xl font-bold mt-4 mb-2 text-[#e8e0d0]">Admin Login</h1>
          <p className="text-gray-500 text-sm mb-8">VelvetViper Control Panel</p>
          <input type="password" placeholder="Enter admin password" value={password}
            onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()}
            className={inputCls + " mb-4"} />
          <button onClick={login} className="w-full bg-[#c8ff00] text-black py-4 rounded-2xl font-bold hover:bg-white transition">Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] font-serif">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 border-b border-[#2a2a2a] z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🐍</span>
          <h1 className="text-xl font-bold tracking-tight">VelvetViper Admin</h1>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-red-400 transition border border-[#2a2a2a] px-4 py-2 rounded-xl">Logout</button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-[#2a2a2a] bg-[#0a0a0a] sticky top-[61px] z-40">
        {(["pending", "approved", "rejected", "post"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 whitespace-nowrap text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab ? "border-b-2 border-[#c8ff00] text-[#c8ff00]" : "text-gray-500 hover:text-gray-300"}`}>
            {tab === "post" ? "✚ Post Reptile" : (
              <>
                <span className="capitalize">{tab}</span>
                {counts[tab as keyof typeof counts] > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${tab === "pending" ? "bg-yellow-500/20 text-yellow-400" : tab === "approved" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {counts[tab as keyof typeof counts]}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Listing tabs */}
        {activeTab !== "post" && (
          loading ? (
            <div className="text-center py-20 text-gray-500">Loading listings...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No {activeTab} listings.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((listing) => (
                <div key={listing.id} className="bg-[#111] border border-[#2a2a2a] rounded-3xl overflow-hidden hover:border-[#c8ff00]/30 transition">
                  <div className="relative h-48 bg-black">
                    {listing.image_url ? (
                      <img src={listing.image_url} alt={listing.species} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🐍</div>
                    )}
                    {listing.featured && (
                      <span className="absolute top-3 left-3 bg-[#c8ff00] text-black text-xs font-bold px-3 py-1 rounded-full">Featured</span>
                    )}
                    <span className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${listing.status === "approved" ? "bg-green-500/20 text-green-400 border border-green-500/30" : listing.status === "pending" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                      {listing.status}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg">{listing.species}</h3>
                      <span className="text-[#c8ff00] font-bold">${listing.price}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">{listing.name || "Unnamed"} · {listing.gender}</p>
                    <p className="text-gray-500 text-xs mb-3">{listing.location}</p>
                    <p className="text-gray-400 text-xs line-clamp-2 mb-4">{listing.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => openEdit(listing)}
                        className="flex-1 bg-[#1a1a1a] border border-[#3a3a3a] text-sm py-2 rounded-xl hover:border-[#c8ff00] hover:text-[#c8ff00] transition">
                        ✏️ Edit
                      </button>
                      {listing.status !== "approved" && (
                        <button onClick={() => updateStatus(listing.id, "approved")}
                          className="flex-1 bg-green-500/10 border border-green-500/30 text-green-400 text-sm py-2 rounded-xl hover:bg-green-500/20 transition">
                          ✓ Approve
                        </button>
                      )}
                      {listing.status !== "rejected" && (
                        <button onClick={() => updateStatus(listing.id, "rejected")}
                          className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 text-sm py-2 rounded-xl hover:bg-red-500/20 transition">
                          ✕ Reject
                        </button>
                      )}
                      <button onClick={() => deleteListing(listing.id)}
                        className="bg-red-900/30 border border-red-800/40 text-red-500 text-sm px-3 py-2 rounded-xl hover:bg-red-900/50 transition" title="Delete">
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Post tab */}
        {activeTab === "post" && (
          <div className="max-w-2xl mx-auto bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 space-y-5">
            <h2 className="text-3xl font-bold">Post New Reptile</h2>
            <label className="block">
              <span className="text-sm text-gray-400 mb-2 block">Upload Images</span>
              <input type="file" accept="image/*" multiple onChange={handleFolderUpload} className="w-full bg-black border border-[#2a2a2a] rounded-2xl p-4 text-sm" />
            </label>
            {uploadingImage && <p className="text-yellow-400 text-sm">Uploading...</p>}
            {postImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {postImages.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} className="rounded-xl w-full h-20 object-cover" />
                    <button onClick={() => { setPostImages((p) => p.filter((_, idx) => idx !== i)); if (i === 0) setPostImageUrl(postImages[1] || ""); }}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">✕</button>
                  </div>
                ))}
              </div>
            )}
            {postImageUrl && (
              <button onClick={generateWithAI} disabled={aiLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
                {aiLoading ? <><span className="animate-spin inline-block">⚙️</span> Analyzing...</> : <>🤖 Generate Details with AI (optional)</>}
              </button>
            )}
            {aiError && <p className="text-red-400 text-sm">{aiError}</p>}
            {aiSuccess && <p className="text-green-400 text-sm">{aiSuccess}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><input placeholder="Species *" value={postForm.species} onChange={(e) => setPostForm({ ...postForm, species: e.target.value })} className={inputCls} /></div>
              <input placeholder="Name" value={postForm.name} onChange={(e) => setPostForm({ ...postForm, name: e.target.value })} className={inputCls} />
              <input placeholder="Age" value={postForm.age} onChange={(e) => setPostForm({ ...postForm, age: e.target.value })} className={inputCls} />
              <input placeholder="Price *" type="number" value={postForm.price} onChange={(e) => setPostForm({ ...postForm, price: e.target.value })} className={inputCls} />
              <input placeholder="Location *" value={postForm.location} onChange={(e) => setPostForm({ ...postForm, location: e.target.value })} className={inputCls} />
              <select value={postForm.country} onChange={(e) => setPostForm({ ...postForm, country: e.target.value })} className={selectCls}>
                <option>USA</option><option>UK</option><option>Canada</option><option>Australia</option><option>Germany</option>
              </select>
              <select value={postForm.gender} onChange={(e) => setPostForm({ ...postForm, gender: e.target.value })} className={selectCls}>
                <option>Male</option><option>Female</option><option>Unknown</option>
              </select>
              <select value={postForm.health} onChange={(e) => setPostForm({ ...postForm, health: e.target.value })} className={selectCls}>
                <option>Healthy</option><option>Vaccinated</option><option>Needs Care</option>
              </select>
              <select value={postForm.availability} onChange={(e) => setPostForm({ ...postForm, availability: e.target.value })} className={selectCls}>
                <option>Available</option><option>Reserved</option><option>Sold</option>
              </select>
              <div className="col-span-2"><textarea placeholder="Description" value={postForm.description} onChange={(e) => setPostForm({ ...postForm, description: e.target.value })} className={inputCls + " h-28 resize-none"} /></div>
              <div className="col-span-2"><input placeholder="WhatsApp / Contact *" value={postForm.contact} onChange={(e) => setPostForm({ ...postForm, contact: e.target.value })} className={inputCls} /></div>
              <div className="col-span-2 flex items-center gap-3">
                <input type="checkbox" id="featured" checked={postForm.featured} onChange={(e) => setPostForm({ ...postForm, featured: e.target.checked })} className="w-5 h-5 accent-[#c8ff00]" />
                <label htmlFor="featured" className="text-sm text-gray-300">Mark as Featured listing</label>
              </div>
            </div>
            <button onClick={handlePostReptile} disabled={postLoading}
              className="w-full bg-[#c8ff00] text-black py-5 rounded-2xl font-bold text-lg hover:bg-white transition disabled:opacity-50">
              {postLoading ? "Posting..." : "Post Reptile Live"}
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editListing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={closeEdit}>
          <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Listing</h2>
                <button onClick={closeEdit} className="text-gray-400 hover:text-white text-2xl">✕</button>
              </div>
              {/* Image editor */}
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-3">Images <span className="text-gray-600">(click to set as primary)</span></p>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {editImages.map((url, i) => (
                    <div key={i} onClick={() => setEditImageUrl(url)}
                      className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition ${editImageUrl === url ? "border-[#c8ff00]" : "border-transparent hover:border-[#3a3a3a]"}`}>
                      <img src={url} className="w-full h-20 object-cover" />
                      <button onClick={(e) => { e.stopPropagation(); setEditImages((p) => p.filter((_, idx) => idx !== i)); if (editImageUrl === url) setEditImageUrl(editImages.find((_, idx) => idx !== i) || ""); }}
                        className="absolute top-1 right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">✕</button>
                    </div>
                  ))}
                  <label className="h-20 border-2 border-dashed border-[#3a3a3a] rounded-xl flex items-center justify-center cursor-pointer hover:border-[#c8ff00] transition text-gray-500 text-xs text-center">
                    {uploadingEditImage ? "Uploading..." : "+ Add Image"}
                    <input type="file" accept="image/*" multiple onChange={handleEditImageUpload} className="hidden" />
                  </label>
                </div>
                <input placeholder="Or paste image URL" value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} className={inputCls} />
              </div>
              {/* Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><input placeholder="Species" value={editForm.species || ""} onChange={(e) => setEditForm({ ...editForm, species: e.target.value })} className={inputCls} /></div>
                <input placeholder="Name" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputCls} />
                <input placeholder="Age" value={editForm.age || ""} onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} className={inputCls} />
                <input placeholder="Price" type="number" value={editForm.price || ""} onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })} className={inputCls} />
                <input placeholder="Location" value={editForm.location || ""} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className={inputCls} />
                <select value={editForm.country || "USA"} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} className={selectCls}>
                  <option>USA</option><option>UK</option><option>Canada</option><option>Australia</option><option>Germany</option>
                </select>
                <select value={editForm.gender || "Male"} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} className={selectCls}>
                  <option>Male</option><option>Female</option><option>Unknown</option>
                </select>
                <select value={editForm.health || "Healthy"} onChange={(e) => setEditForm({ ...editForm, health: e.target.value })} className={selectCls}>
                  <option>Healthy</option><option>Vaccinated</option><option>Needs Care</option>
                </select>
                <select value={editForm.availability || "Available"} onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })} className={selectCls}>
                  <option>Available</option><option>Reserved</option><option>Sold</option>
                </select>
                <select value={editForm.status || "pending"} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className={selectCls}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <input placeholder="Contact" value={editForm.contact || ""} onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })} className={inputCls} />
                <div className="col-span-2"><textarea placeholder="Description" value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={inputCls + " h-28 resize-none"} /></div>
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="editFeatured" checked={editForm.featured || false} onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })} className="w-5 h-5 accent-[#c8ff00]" />
                  <label htmlFor="editFeatured" className="text-sm text-gray-300">Featured listing</label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={closeEdit} className="flex-1 border border-[#3a3a3a] py-3 rounded-2xl text-sm hover:border-red-500 hover:text-red-400 transition">Cancel</button>
                <button onClick={saveEdit} disabled={editLoading} className="flex-1 bg-[#c8ff00] text-black py-3 rounded-2xl font-bold text-sm hover:bg-white transition disabled:opacity-50">
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {successMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#c8ff00] text-black px-8 py-4 rounded-2xl shadow-xl font-medium z-[300]">
          ✅ {successMsg}
        </div>
      )}
    </div>
  );
}