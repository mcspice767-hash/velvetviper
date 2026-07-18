"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import Navbar from "../components/Navbar";

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
  gender?: string;
  health?: string;
  availability?: string;
  description?: string;
}

interface CartItem extends Listing {
  quantity: number;
}

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
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
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] text-[#e8e0d0] font-serif">
      <Navbar cart={cart} onCartClick={() => setShowCart(true)} />

      {/* Banners */}
      <div className="pt-20">
        {banners.map(b => (
          <div key={b.id} className="py-3 text-center text-sm border-b border-[#2a2a2a]" style={{ background: b.color }}>
            {b.text}
          </div>
        ))}
      </div>

      {/* Hero */}
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <h2 className="mb-6 text-4xl font-bold tracking-tighter sm:text-5xl lg:text-7xl">
          Rehome Reptiles.<br />Responsibly.
        </h2>
        <p className="text-base text-gray-400 sm:text-lg lg:text-xl">Premium marketplace for UK, USA & Canada</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-10 sm:flex-row">
          <Link href="/browse" className="w-full rounded-full bg-[#c8ff00] px-6 py-3 text-sm font-semibold text-black transition hover:bg-white sm:w-auto sm:px-8 sm:py-4 sm:text-base">Browse Reptiles</Link>
        </div>
      </div>

      {/* Categories */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div className="mb-3 text-xs tracking-widest text-[#c8ff00] sm:text-sm">EXPLORE</div>
        <h3 className="mb-8 text-2xl font-bold sm:mb-10 sm:text-3xl lg:text-4xl">Shop by Category</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {[
            { emoji: "🐍", title: "Live Reptiles", desc: "Snakes, geckos, lizards & more", href: "/browse" },
            { emoji: "🏠", title: "Housing & Enclosures", desc: "Tanks, vivariums & hides", href: "/housing" },
            { emoji: "💡", title: "Heating & Lighting", desc: "UVB, heat mats & lamps", href: "/heating" },
            { emoji: "💊", title: "Health & Grooming", desc: "Supplements & care", href: "/health" },
            { emoji: "🎮", title: "Accessories", desc: "Décor, substrate & tools", href: "/accessories" },
          ].map((cat, i) => (
            <Link key={i} href={cat.href} className="group cursor-pointer rounded-2xl border border-[#2a2a2a] bg-[#111] p-4 transition hover:border-[#c8ff00] sm:rounded-3xl sm:p-6 lg:p-8">
              <div className="mb-4 text-5xl transition group-hover:scale-110 sm:mb-6 sm:text-6xl">{cat.emoji}</div>
              <h4 className="mb-2 text-xl font-bold sm:text-2xl">{cat.title}</h4>
              <p className="text-sm text-gray-500 sm:text-base">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Listings */}
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <h3 className="mb-8 text-2xl font-bold sm:text-3xl lg:text-4xl">Featured Reptiles</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {filteredListings.slice(0, 9).map(listing => {
            const curr = getCurrency(listing.country);
            return (
              <div key={listing.id} className="group cursor-pointer rounded-2xl bg-white p-4 shadow-lg transition hover:shadow-xl sm:rounded-3xl sm:p-6" onClick={() => setSelectedListing(listing)}>
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gray-100 sm:h-24 sm:w-24">
                    {listing.image_url ? (
                      <img src={listing.image_url} alt={listing.species} className="h-full w-full rounded-2xl object-cover" />
                    ) : (
                      <div className="text-2xl text-gray-400">🐍</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-black sm:text-lg">{listing.species}</h3>
                        <p className="text-sm text-gray-600">{listing.name || "Unnamed"}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-black sm:text-lg">{curr}{listing.price}</div>
                        <div className="text-xs text-gray-500">{listing.location}</div>
                      </div>
                    </div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-700 sm:text-xs">{listing.gender || "Unknown"}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-700 sm:text-xs">{listing.health || "Healthy"}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-700 sm:text-xs">{listing.availability || "Available"}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{listing.description || "No description available."}</p>
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

      {/* Listing Modal */}
      {showModal && selectedListing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-black">{selectedListing.species}</h2>
                <button onClick={() => setShowModal(false)} className="text-3xl text-gray-400 hover:text-black">✕</button>
              </div>

              <div className="flex gap-6 mb-6">
                <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center">
                  {selectedListing.image_url ? (
                    <img src={selectedListing.image_url} alt={selectedListing.species} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <div className="text-gray-400 text-6xl">🐍</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-xl text-black">{selectedListing.species}</h3>
                      <p className="text-gray-600">{selectedListing.name || "Unnamed"}</p>
                      <p className="text-gray-500 text-sm">{selectedListing.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-black font-bold text-2xl">{getCurrency(selectedListing.country)}{selectedListing.price}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{selectedListing.gender || "Unknown"}</span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{selectedListing.health || "Healthy"}</span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{selectedListing.availability || "Available"}</span>
                  </div>
                  {selectedListing.description && (
                    <p className="text-gray-700 mb-4">{selectedListing.description}</p>
                  )}
                  <button
                    onClick={() => {
                      addToCart(selectedListing);
                      setShowModal(false);
                    }}
                    className="w-full bg-[#c8ff00] hover:bg-black hover:text-[#c8ff00] text-black px-6 py-3 rounded-2xl font-medium transition"
                  >
                    Add to Cart - {getCurrency(selectedListing.country)}{selectedListing.price}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Contact Buttons */}
      <div className="fixed bottom-4 right-4 z-[150] flex flex-col gap-2 sm:bottom-6 sm:right-6 sm:gap-3">
        {/* WhatsApp Button */}
        <a
          href="https://wa.me/+15056715584"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-green-500 px-3 py-2 text-white shadow-2xl transition-all hover:scale-105 hover:bg-green-600 sm:gap-3 sm:px-5 sm:py-3"
        >
          <span className="text-xl sm:text-2xl">💬</span>
          <span className="text-xs font-medium sm:text-sm">WhatsApp Us</span>
        </a>

        {/* Live Chat Button */}
        
      </div>
    </div>
  );
}
