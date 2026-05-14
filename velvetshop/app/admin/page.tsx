"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "../../lib/supabase";

// Fix for folder upload
declare module 'react' {
  interface InputHTMLAttributes<T> {
    webkitdirectory?: boolean;
    directory?: boolean;
  }
}

const ADMIN_PASSWORD = "velvet2026";
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "post">("pending");
  const [menuOpen, setMenuOpen] = useState(false);

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
    featured: false,
    gender: "Male",
    health: "Vaccinated",
    availability: "Available",
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

  const handleFolderUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

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
      } catch (err) {
        console.error("Upload failed");
      }
    }

    setPostImages(uploadedUrls);
    if (uploadedUrls.length > 0) setPostImageUrl(uploadedUrls[0]);
    setUploadingImage(false);
  };

  const generateWithAI = async () => {
    if (!postImageUrl) {
      alert("Please upload an image first");
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const imageResponse = await fetch(postImageUrl);
      const imageBlob = await imageResponse.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
      });

      const mimeType = imageBlob.type || "image/jpeg";

      const prompt = `You are an expert reptile specialist and pet appraiser.

Analyze this reptile image carefully and respond ONLY with a valid JSON object — no markdown, no backticks, no explanation.

Use this country for pricing: ${postForm.country}

Pricing guide:
- UK: price in GBP (£)
- USA: price in USD ($)  
- Canada: price in CAD (CA$)

JSON format:
{
  "species": "full scientific and common species name e.g. Ball Python (Python regius)",
  "name": "a creative memorable pet name that suits this reptile appearance e.g. Obsidian, Eclipse, Pharaoh",
  "age": "approximate age based on size and appearance e.g. 8-12 months, 2-3 years",
  "price": 250,
  "gender": "Male or Female or Unknown",
  "health": "Healthy or Vaccinated or Needs Care",
  "availability": "Available",
  "description": "Write 3 convincing sentences about this specific reptile. Include: (1) personality and temperament based on species, (2) care requirements and feeding habits, (3) why this would make an amazing pet. Make it sound natural and appealing to a buyer."
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64,
                    }
                  },
                  { text: prompt }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error("Gemini API error: " + response.status);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setPostForm(prev => ({
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

      setAiSuccess("✅ AI generated all details! Review and edit if needed.");
      setTimeout(() => setAiSuccess(null), 4000);
    } catch (err) {
      console.error(err);
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
      setSuccessMsg("✅ Reptile posted successfully and is now live!");
      setPostForm({
        species: "", name: "", age: "", country: "USA", location: "", price: "",
        description: "", contact: "", featured: false, gender: "Male",
        health: "Vaccinated", availability: "Available"
      });
      setPostImages([]);
      setPostImageUrl("");
      fetchListings();
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="bg-[#111] p-10 rounded-3xl w-full max-w-md text-center">
          <h1 className="text-3xl font-bold mb-8">Admin Login</h1>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 mb-6"
          />
          <button onClick={login} className="w-full bg-[#c8ff00] text-black py-4 rounded-2xl font-bold">
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0]">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 border-b border-[#2a2a2a] z-50 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🐍</span>
          <h1 className="text-2xl font-bold">VelvetViper Admin</h1>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-3xl">☰</button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-[#2a2a2a] bg-[#0a0a0a] sticky top-16 z-40">
        {["pending", "approved", "rejected", "post"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-4 whitespace-nowrap capitalize text-sm font-medium transition-all ${
              activeTab === tab ? "border-b-4 border-[#c8ff00] text-[#c8ff00]" : "text-gray-500"
            }`}
          >
            {tab === "post" ? "✚ Post Reptile" : tab}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {activeTab === "post" && (
          <div className="max-w-2xl mx-auto bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 space-y-6">
            <h2 className="text-3xl font-bold">Post New Reptile</h2>

            <input
              type="file"
              accept="image/*"
              multiple
              webkitdirectory
              onChange={handleFolderUpload}
              className="w-full bg-black border border-[#2a2a2a] rounded-2xl p-4"
            />

            {postImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {postImages.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} className="rounded-xl w-full h-24 object-cover" />
                    <button
                      onClick={() => setPostImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {postImageUrl && (
              <div className="mt-4 space-y-3">
                <button
                  onClick={generateWithAI}
                  disabled={aiLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-semibold text-lg transition disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {aiLoading ? (
                    <>
                      <span className="animate-spin">⚙️</span>
                      Analyzing image...
                    </>
                  ) : (
                    <>🤖 Generate Details with AI</>
                  )}
                </button>
                {aiError && <p className="text-red-400 text-sm text-center">{aiError}</p>}
                {aiSuccess && <p className="text-green-400 text-sm text-center">{aiSuccess}</p>}
              </div>
            )}

            <div className="space-y-6">
              <input placeholder="Species *" value={postForm.species} onChange={(e) => setPostForm({ ...postForm, species: e.target.value })} className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4" />
              <input placeholder="Name" value={postForm.name} onChange={(e) => setPostForm({ ...postForm, name: e.target.value })} className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4" />
              <input placeholder="Price *" type="number" value={postForm.price} onChange={(e) => setPostForm({ ...postForm, price: e.target.value })} className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4" />
              <textarea placeholder="Description" value={postForm.description} onChange={(e) => setPostForm({ ...postForm, description: e.target.value })} className="w-full bg-black border border-[#2a2a2a] rounded-3xl px-6 py-4 h-32" />
              <input placeholder="WhatsApp Contact *" value={postForm.contact} onChange={(e) => setPostForm({ ...postForm, contact: e.target.value })} className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4" />

              <button
                onClick={handlePostReptile}
                disabled={postLoading}
                className="w-full bg-[#c8ff00] text-black py-5 rounded-2xl font-bold text-xl hover:bg-white transition"
              >
                {postLoading ? "Posting..." : "Post Reptile Live"}
              </button>
            </div>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-2xl shadow-xl">
          {successMsg}
        </div>
      )}
    </div>
  );
}