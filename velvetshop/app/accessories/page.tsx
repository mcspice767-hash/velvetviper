"use client";

import { useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  specs?: string;
}

export default function AccessoriesPage() {
  const [cart, setCart] = useState<(Product & { quantity: number })[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const products: Product[] = [
    {
      id: "1",
      name: "Artificial Plants Pack",
      category: "Décor",
      price: 19.99,
      image: "🌿",
      description: "Non-toxic plastic plants for natural look",
      specs: "5-piece set, various sizes"
    },
    {
      id: "2",
      name: "Rock Cave Formation",
      category: "Décor",
      price: 24.99,
      image: "🪨",
      description: "Natural-looking stone cave hideout",
      specs: "Resin cast, safe and durable"
    },
    {
      id: "3",
      name: "Jungle Vine Climber",
      category: "Climbing Structures",
      price: 16.99,
      image: "🍃",
      description: "Silicone vines for climbing and perching",
      specs: "Flexible, non-toxic, 3-pack"
    },
    {
      id: "4",
      name: "Water Dish Large",
      category: "Feeding & Watering",
      price: 8.99,
      image: "🍲",
      description: "Heavy ceramic water bowl",
      specs: "6 inches diameter, tip-resistant"
    },
    {
      id: "5",
      name: "Feeding Dish Set",
      category: "Feeding & Watering",
      price: 12.99,
      image: "🥣",
      description: "Multiple sizing feeding dishes",
      specs: "3 sizes included, reptile-safe"
    },
    {
      id: "6",
      name: "Cypress Mulch Bedding (10qt)",
      category: "Substrate",
      price: 14.99,
      image: "🪵",
      description: "Premium cypress substrate for humidity",
      specs: "10 quarts, naturally aromatic"
    },
    {
      id: "7",
      name: "Aspen Shavings (20lbs)",
      category: "Substrate",
      price: 12.99,
      image: "📦",
      description: "Dry bedding for desert species",
      specs: "Dust-free, natural wood"
    },
    {
      id: "8",
      name: "Coconut Fiber (50lbs)",
      category: "Substrate",
      price: 18.99,
      image: "🥥",
      description: "Moisture-retaining substrate",
      specs: "Biodegradable, tropical species"
    },
    {
      id: "9",
      name: "Substrate Scoop",
      category: "Tools",
      price: 6.99,
      image: "🥄",
      description: "Stainless steel tank cleaning scoop",
      specs: "Ergonomic handle, durable"
    },
    {
      id: "10",
      name: "Tank Thermometer",
      category: "Monitoring",
      price: 7.99,
      image: "🌡️",
      description: "Adhesive temperature gauge",
      specs: "Easy-read display, accurate"
    },
    {
      id: "11",
      name: "Humidity Gauge",
      category: "Monitoring",
      price: 8.99,
      image: "💨",
      description: "Hygrometer for moisture levels",
      specs: "Analog dial, clear reading"
    },
    {
      id: "12",
      name: "Complete Accessory Kit",
      category: "Kits",
      price: 79.99,
      image: "📦",
      description: "All essential tank accessories",
      specs: "Décor, substrate, tools, gauges"
    }
  ];

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.findIndex(item => item.id === product.id);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing].quantity += 1;
        return updated;
      }
      return [...prev, { ...product, quantity: 1 }];
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

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) removeFromCart(id);
    else setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] font-serif">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-black/95 border-b border-[#2a2a2a] z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <span className="text-4xl">🐍</span>
            <h1 className="text-3xl font-bold tracking-tight">VELVETVIPER</h1>
          </Link>

          <div className="hidden md:flex gap-8 text-sm">
            <Link href="/" className="hover:text-[#c8ff00]">Home</Link>
            <Link href="/browse" className="hover:text-[#c8ff00]">Reptiles</Link>
            <Link href="/feeders" className="hover:text-[#c8ff00]">Feeders</Link>
            <Link href="/about" className="hover:text-[#c8ff00]">About</Link>
            <Link href="/account" className="hover:text-[#c8ff00]">Account</Link>
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

      {menuOpen && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center gap-8 p-8 text-center pt-24">
          <button className="absolute top-6 right-6 text-3xl" onClick={() => setMenuOpen(false)}>✕</button>
          <Link href="/" className="text-4xl font-semibold hover:text-[#c8ff00]" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/browse" className="text-4xl font-semibold hover:text-[#c8ff00]" onClick={() => setMenuOpen(false)}>Reptiles</Link>
          <Link href="/feeders" className="text-4xl font-semibold hover:text-[#c8ff00]" onClick={() => setMenuOpen(false)}>Feeders</Link>
          <Link href="/about" className="text-4xl font-semibold hover:text-[#c8ff00]" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/account" className="text-4xl font-semibold hover:text-[#c8ff00]" onClick={() => setMenuOpen(false)}>Account</Link>
          <Link href="/contact" className="text-4xl font-semibold hover:text-[#c8ff00]" onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link href="/login" className="text-4xl font-semibold hover:text-[#c8ff00]" onClick={() => setMenuOpen(false)}>Login</Link>
        </div>
      )}

      {/* Hero */}
      <div className="max-w-5xl mx-auto text-center pt-28 pb-16 px-4 md:px-6">
        <h2 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6">
          🎮 Accessories
        </h2>
        <p className="text-xl text-gray-400">Décor, substrate, tools & accessories for complete enclosure setup</p>
      </div>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <input
          type="text"
          placeholder="Search décor, substrate, tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111] border border-[#2a2a2a] rounded-3xl px-6 py-4 text-[#e8e0d0] placeholder-gray-600 focus:border-[#c8ff00] outline-none transition"
        />
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-[#111] border border-[#2a2a2a] hover:border-[#c8ff00] rounded-3xl p-6 transition group cursor-pointer">
              <div className="text-6xl mb-4">{product.image}</div>
              <h3 className="text-xl font-bold mb-2">{product.name}</h3>
              <p className="text-gray-400 text-sm mb-2">{product.category}</p>
              <p className="text-sm text-gray-500 mb-4">{product.description}</p>
              {product.specs && <p className="text-xs text-gray-600 mb-4">📏 {product.specs}</p>}
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-[#c8ff00]">${product.price}</span>
              </div>

              <button
                onClick={() => addToCart(product)}
                className="w-full bg-[#c8ff00] text-black py-3 rounded-2xl font-semibold hover:bg-white transition"
              >
                Add to Cart
              </button>
            </div>
          ))}
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
                  <div className="text-4xl">{item.image}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-[#c8ff00]">${item.price}</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="bg-[#2a2a2a] px-2 py-1 rounded">−</button>
                      <span className="px-3 py-1">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="bg-[#2a2a2a] px-2 py-1 rounded">+</button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-sm">Remove</button>
                </div>
              ))}

              <div className="pt-8 border-t border-[#2a2a2a]">
                <div className="flex justify-between text-2xl mb-8">
                  <span>Total</span>
                  <span className="text-[#c8ff00]">${totalPrice.toFixed(2)}</span>
                </div>
                <Link href="/payment/checkout" className="block w-full bg-[#c8ff00] text-black py-5 rounded-2xl font-bold text-lg text-center hover:bg-white transition">
                  Checkout
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black border-t border-[#2a2a2a] mt-20">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold mb-4">Shop</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link href="/browse" className="hover:text-[#c8ff00]">Live Reptiles</Link>
              <Link href="/feeders" className="hover:text-[#c8ff00]">Food & Nutrition</Link>
              <Link href="/housing" className="hover:text-[#c8ff00]">Housing</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link href="/faq" className="hover:text-[#c8ff00]">FAQ</Link>
              <Link href="/contact" className="hover:text-[#c8ff00]">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link href="/about" className="hover:text-[#c8ff00]">About</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Account</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link href="/account" className="hover:text-[#c8ff00]">My Account</Link>
              <Link href="/login" className="hover:text-[#c8ff00]">Login</Link>
            </div>
          </div>
        </div>
        <div className="text-center py-8 border-t border-[#2a2a2a] text-sm text-gray-500">
          © 2026 VelvetViper. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
