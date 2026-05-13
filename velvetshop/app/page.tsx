"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

interface Listing {
  id: string;
  species: string;
  name?: string;
  location: string;
  country?: string;
  price: number;
  image_url?: string;
  status: string;
  contact?: string;
}

interface CartItem extends Listing {
  quantity: number;
}

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const [banners] = useState([
    { id: 1, text: "🐍 Welcome to VelvetViper! Find your perfect reptile companion today.", color: "rgba(200,255,0,0.08)" },
    { id: 2, text: "⭐ New listings added every week! Check back often.", color: "rgba(0,100,255,0.08)" }
  ]);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    setListings(data || []);
  };

  const getCurrency = (country?: string) => {
    switch (country?.toLowerCase()) {
      case "uk": return "£";
      case "usa": return "$";
      case "canada": return "CA$";
      default: return "$";
    }
  };

  const addToCart = (listing: Listing) => {
    setCart(prev => {
      const existing = prev.findIndex(item => item.id === listing.id);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing].quantity += 1;
        return updated;
      }
      return [...prev, { ...listing, quantity: 1 }];
    });

    const notif = document.createElement("div");
    notif.textContent = "✅ Added to cart!";
    notif.className = "fixed bottom-6 right-6 bg-[#c8ff00] text-black px-8 py-4 rounded-2xl font-medium shadow-2xl z-[200]";
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 1800);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const filteredListings = listings.filter(listing =>
    listing.species.toLowerCase().includes(search.toLowerCase()) ||
    (listing.name && listing.name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] font-serif">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-black/95 border-b border-[#2a2a2a] z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🐍</span>
            <h1 className="text-3xl font-bold tracking-tight">VELVETVIPER</h1>
          </div>

          <div className="hidden md:flex gap-8 text-sm">
            <Link href="/" className="hover:text-[#c8ff00]">Home</Link>
            <Link href="/browse" className="hover:text-[#c8ff00]">Browse</Link>
            <Link href="/my-listings" className="hover:text-[#c8ff00]">My Listings</Link>
            <Link href="/login" className="hover:text-[#c8ff00]">Login</Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-2xl hover:text-[#c8ff00] transition"
              onClick={() => setMenuOpen(true)}
            >
              ☰
            </button>
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative text-2xl hover:text-[#c8ff00] transition"
            >
              🛒
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#c8ff00] text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Banners */}
      <div className="pt-20">
        {banners.map(b => (
          <div key={b.id} className="py-3 text-center text-sm border-b border-[#2a2a2a]" style={{ background: b.color }}>
            {b.text}
          </div>
        ))}
      </div>

      {menuOpen && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center gap-8 p-8 text-center">
          <button className="absolute top-6 right-6 text-3xl" onClick={() => setMenuOpen(false)}>✕</button>
          <Link href="/" className="text-4xl font-semibold hover:text-[#c8ff00]" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/browse" className="text-4xl font-semibold hover:text-[#c8ff00]" onClick={() => setMenuOpen(false)}>Browse</Link>
          <Link href="/login" className="text-4xl font-semibold hover:text-[#c8ff00]" onClick={() => setMenuOpen(false)}>Login</Link>
        </div>
      )}

      {/* Hero */}
      <div className="max-w-5xl mx-auto text-center pt-24 pb-16 px-4 md:px-6">
        <h2 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6">
          Rehome Reptiles.<br />Responsibly.
        </h2>
        <p className="text-xl text-gray-400">Premium marketplace for UK, USA & Canada</p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link href="/browse" className="bg-[#c8ff00] text-black px-10 py-4 rounded-full font-semibold hover:bg-white transition">Browse Reptiles</Link>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="text-[#c8ff00] tracking-widest text-sm mb-3">EXPLORE</div>
        <h3 className="text-4xl md:text-5xl font-bold mb-10">Shop by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: "🐍", title: "Live Reptiles", desc: "Snakes, geckos, lizards & more" },
            { emoji: "🦗", title: "Food & Nutrition", desc: "Crickets, mice & feeders" },
            { emoji: "🏠", title: "Housing & Enclosures", desc: "Tanks, vivariums & hides" },
            { emoji: "💡", title: "Heating & Lighting", desc: "UVB, heat mats & lamps" },
            { emoji: "💊", title: "Health & Grooming", desc: "Supplements & care" },
            { emoji: "🎮", title: "Accessories", desc: "Décor, substrate & tools" },
          ].map((cat, i) => (
            <div key={i} className="bg-[#111] border border-[#2a2a2a] hover:border-[#c8ff00] rounded-3xl p-8 cursor-pointer transition group" onClick={() => alert("Coming soon...")}>
              <div className="text-6xl mb-6 group-hover:scale-110 transition">{cat.emoji}</div>
              <h4 className="text-2xl font-bold mb-2">{cat.title}</h4>
              <p className="text-gray-500">{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Listings */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <h3 className="text-4xl md:text-5xl font-bold mb-8">Featured Reptiles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredListings.slice(0, 9).map(listing => {
            const curr = getCurrency(listing.country);
            return (
              <div key={listing.id} className="bg-[#111] border border-[#2a2a2a] rounded-3xl overflow-hidden hover:border-[#c8ff00] transition group">
                <div className="h-64 bg-black relative">
                  {listing.image_url ? (
                    <img src={listing.image_url} alt={listing.species} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-8xl h-full flex items-center justify-center opacity-50">🐍</div>
                  )}
                </div>
                <div className="p-6">
                  <h4 className="text-2xl font-bold">{listing.species}</h4>
                  <p className="text-gray-400 mt-1">{listing.location}</p>

                  <div className="flex items-center justify-between mt-6">
                    <span className="text-3xl font-mono text-[#c8ff00]">
                      {curr}{listing.price}
                    </span>
                    <button
                      onClick={() => addToCart(listing)}
                      className="bg-[#c8ff00] hover:bg-white text-black px-6 py-3 rounded-2xl font-medium transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-[#111] border-l border-[#2a2a2a] z-[100] p-6 overflow-auto">
          <div className="flex justify-between mb-8">
            <h2 className="text-3xl font-bold">Your Cart</h2>
            <button onClick={() => setShowCart(false)} className="text-3xl">✕</button>
          </div>

          {cart.length === 0 ? (
            <p className="text-gray-400 py-12 text-center">Cart is empty</p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 mb-6 border-b border-[#2a2a2a] pb-6">
                  <div className="w-20 h-20 bg-black rounded-xl overflow-hidden flex-shrink-0">
                    {item.image_url ? <img src={item.image_url} className="object-cover" /> : <div className="text-5xl h-full flex items-center justify-center">🐍</div>}
                  </div>
                  <div className="flex-1">
                    <h4>{item.species}</h4>
                    <p className="text-[#c8ff00]">{getCurrency(item.country)}{item.price}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-sm">Remove</button>
                </div>
              ))}

              <div className="pt-8 border-t border-[#2a2a2a]">
                <div className="flex justify-between text-2xl mb-8">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
                <button className="w-full bg-[#c8ff00] text-black py-5 rounded-2xl font-bold text-lg">
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}