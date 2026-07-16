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
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] font-serif">
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
            { emoji: "🐍", title: "Live Reptiles", desc: "Snakes, geckos, lizards & more", href: "/browse" },
            { emoji: "🏠", title: "Housing & Enclosures", desc: "Tanks, vivariums & hides", href: "/housing" },
            { emoji: "💡", title: "Heating & Lighting", desc: "UVB, heat mats & lamps", href: "/heating" },
            { emoji: "💊", title: "Health & Grooming", desc: "Supplements & care", href: "/health" },
            { emoji: "🎮", title: "Accessories", desc: "Décor, substrate & tools", href: "/accessories" },
          ].map((cat, i) => (
            <Link key={i} href={cat.href} className="bg-[#111] border border-[#2a2a2a] hover:border-[#c8ff00] rounded-3xl p-8 cursor-pointer transition group">
              <div className="text-6xl mb-6 group-hover:scale-110 transition">{cat.emoji}</div>
              <h4 className="text-2xl font-bold mb-2">{cat.title}</h4>
              <p className="text-gray-500">{cat.desc}</p>
            </Link>
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
              <div key={listing.id} className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition group cursor-pointer" onClick={() => setSelectedListing(listing)}>
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    {listing.image_url ? (
                      <img src={listing.image_url} alt={listing.species} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <div className="text-gray-400 text-2xl">🐍</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-black">{listing.species}</h3>
                        <p className="text-gray-600 text-sm">{listing.name || "Unnamed"}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-black font-bold text-lg">{curr}{listing.price}</div>
                        <div className="text-gray-500 text-xs">{listing.location}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{listing.gender || "Unknown"}</span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{listing.health || "Healthy"}</span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{listing.availability || "Available"}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{listing.description || "No description available."}</p>
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
      <div className="fixed bottom-6 right-6 z-[150] flex flex-col gap-3">
        {/* WhatsApp Button */}
        <a
          href="https://wa.me/YOURPHONENUMBER"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-full shadow-2xl transition-all hover:scale-105 font-medium"
        >
          <span className="text-2xl">💬</span>
          <span className="text-sm">WhatsApp Us</span>
        </a>

        {/* Live Chat Button */}
        <button
          onClick={() => {
            const attempts = [
              () => (window as any).smartsupp?.('chat:open'),
              () => (window as any).Smartsupp?.('chat:open'),
              () => (window as any).SmartsuppWidget?.open(),
              () => document.querySelector<HTMLElement>('#smartsupp-widget-container button')?.click(),
              () => document.querySelector<HTMLElement>('.ssupp-btn')?.click(),
              () => document.querySelector<HTMLElement>('[data-testid="chat-button"]')?.click(),
            ];

            let opened = false;
            for (const attempt of attempts) {
              try {
                attempt();
                opened = true;
                break;
              } catch {}
            }

            if (!opened) {
              window.open('https://app.smartsupp.com', '_blank');
            }
          }}
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-2xl transition-all hover:scale-105 font-medium"
        >
          <span className="text-2xl">🎧</span>
          <span className="text-sm">Live Chat</span>
        </button>
      </div>

    </div>
  );
}