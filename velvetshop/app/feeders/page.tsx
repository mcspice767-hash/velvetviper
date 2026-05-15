"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Feeder {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: string;
  image: string;
  description: string;
}

interface CartItem extends Feeder {
  cartQuantity: number;
}

const FEEDERS: Feeder[] = [
  // Roaches
  { id: "r1", name: "Dubia Roaches", category: "Roaches", price: 5, quantity: "Dozen", image: "🪳", description: "High-protein, low-fat roaches. Ideal for bearded dragons, monitors, and large reptiles. Calcium-rich." },
  { id: "r2", name: "Discoid Roaches", category: "Roaches", price: 8, quantity: "Dozen", image: "🪳", description: "Excellent nutrition for omnivorous reptiles. Non-climbing, easy to contain. Great for geckos." },
  { id: "r3", name: "Red Runner Roaches", category: "Roaches", price: 4, quantity: "Dozen", image: "🪳", description: "Fast, active feeders. Perfect for stimulating natural hunting behavior. High protein content." },
  
  // Mice
  { id: "m1", name: "Pinky Mice", category: "Mice", price: 10, quantity: "Dozen", image: "🐭", description: "Newborn mice. Ideal for small to medium snakes and reptiles. High in nutrients." },
  { id: "m2", name: "Fuzzy Mice", category: "Mice", price: 15, quantity: "Dozen", image: "🐭", description: "Young mice with developing fur. Perfect for ball pythons and corn snakes." },
  { id: "m3", name: "Hopper Mice", category: "Mice", price: 18, quantity: "Dozen", image: "🐭", description: "Active young mice. Great for medium snakes and monitors. Encourages hunting behavior." },
  { id: "m4", name: "Adult Mice", category: "Mice", price: 25, quantity: "Dozen", image: "🐭", description: "Full-grown mice. Best for large snakes and bigger reptiles. Maximum nutrition." },
  
  // Worms
  { id: "w1", name: "Mealworms", category: "Worms", price: 3, quantity: "Cup", image: "🪱", description: "Classic feeder worms. Nutritious for bearded dragons, geckos, and insectivorous reptiles." },
  { id: "w2", name: "Superworms", category: "Worms", price: 5, quantity: "Cup", image: "🪱", description: "Larger larvae with high protein content. Perfect for adult reptiles. More nutritious than mealworms." },
  { id: "w3", name: "Hornworms", category: "Worms", price: 7, quantity: "Cup", image: "🪱", description: "High moisture content, great for hydration. Very popular with bearded dragons and monitors." },
  
  // Crickets
  { id: "c1", name: "Small Crickets", category: "Crickets", price: 4, quantity: "Dozen", image: "🦗", description: "Perfect for juvenile reptiles and small species. Active feeders, great for exercise." },
  { id: "c2", name: "Medium Crickets", category: "Crickets", price: 5, quantity: "Dozen", image: "🦗", description: "Versatile size for most reptiles. High-energy feeders that encourage natural hunting." },
  { id: "c3", name: "Large Crickets", category: "Crickets", price: 6, quantity: "Dozen", image: "🦗", description: "Substantial feeding option for large reptiles. Packed with protein and calcium." },
];

export default function FeedersPage() {
  const [feeders] = useState<Feeder[]>(FEEDERS);
  const [filteredFeeders, setFilteredFeeders] = useState<Feeder[]>(FEEDERS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedFeeder, setSelectedFeeder] = useState<Feeder | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const categories = ["All", ...Array.from(new Set(feeders.map(f => f.category)))];

  useEffect(() => {
    let filtered = feeders;

    if (search) {
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter !== "All") {
      filtered = filtered.filter(f => f.category === categoryFilter);
    }

    setFilteredFeeders(filtered);
  }, [feeders, search, categoryFilter]);

  const addToCart = (feeder: Feeder) => {
    setCart(prev => {
      const existing = prev.findIndex(item => item.id === feeder.id);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing].cartQuantity += 1;
        return updated;
      }
      return [...prev, { ...feeder, cartQuantity: 1 }];
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

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(prev =>
        prev.map(item => (item.id === id ? { ...item, cartQuantity: quantity } : item))
      );
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.cartQuantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] font-serif">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-black/95 border-b border-[#2a2a2a] z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 hover:text-[#c8ff00]">
            <span className="text-4xl">🐍</span>
            <h1 className="text-3xl font-bold tracking-tight">VELVETVIPER</h1>
          </Link>

          <div className="hidden md:flex gap-8 text-sm">
            <Link href="/" className="hover:text-[#c8ff00]">Home</Link>
            <Link href="/browse" className="hover:text-[#c8ff00]">Reptiles</Link>
            <Link href="/feeders" className="text-[#c8ff00]">Feeders</Link>
          </div>

          <button
            onClick={() => setShowCart(!showCart)}
            className="text-2xl relative hover:text-[#c8ff00]"
          >
            🛒
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#c8ff00] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          <button onClick={() => setMenuOpen(true)} className="md:hidden text-3xl">☰</button>
        </div>
      </nav>

      <div className="pt-24 px-6">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-2">Premium Feeder Foods</h1>
            <p className="text-gray-400 text-lg">High-quality nutritious feeders for your reptile companions</p>
          </div>

          {/* Search & Filter */}
          <div className="space-y-4 mb-8">
            <input
              type="text"
              placeholder="Search feeders..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00]"
            />

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-6 py-2 rounded-full whitespace-nowrap transition ${
                    categoryFilter === category
                      ? "bg-[#c8ff00] text-black"
                      : "bg-[#111] border border-[#2a2a2a] hover:border-[#c8ff00]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <p className="text-gray-400">
            Showing {filteredFeeders.length} of {feeders.length} feeders
          </p>
        </div>

        {/* Product Grid */}
        <div className="max-w-7xl mx-auto pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFeeders.map(feeder => (
              <div
                key={feeder.id}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] rounded-3xl p-6 hover:border-[#c8ff00] transition group cursor-pointer"
                onClick={() => {
                  setSelectedFeeder(feeder);
                  setShowModal(true);
                }}
              >
                <div className="mb-4">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition">{feeder.image}</div>
                  <span className="inline-block bg-green-900/50 text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                    {feeder.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2">{feeder.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{feeder.description}</p>

                <div className="flex items-end justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold text-[#c8ff00]">${feeder.price}</div>
                    <div className="text-xs text-gray-500">per {feeder.quantity}</div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(feeder);
                  }}
                  className="w-full bg-[#c8ff00] text-black py-3 rounded-2xl font-bold hover:bg-white transition"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          {filteredFeeders.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">No feeders found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {showModal && selectedFeeder && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] rounded-3xl max-w-2xl w-full p-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-4xl font-bold mb-2">{selectedFeeder.name}</h2>
                <span className="inline-block bg-green-900/50 text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                  {selectedFeeder.category}
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-3xl text-gray-400 hover:text-[#c8ff00]"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-8 mb-8">
              <div className="text-8xl">{selectedFeeder.image}</div>
              <div className="flex-1">
                <p className="text-gray-300 mb-6 leading-relaxed">{selectedFeeder.description}</p>
                <div className="mb-6">
                  <div className="text-5xl font-bold text-[#c8ff00] mb-2">${selectedFeeder.price}</div>
                  <div className="text-gray-400">per {selectedFeeder.quantity}</div>
                </div>
                <button
                  onClick={() => {
                    addToCart(selectedFeeder);
                    setShowModal(false);
                  }}
                  className="bg-[#c8ff00] text-black px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            <div className="border-t border-[#2a2a2a] pt-6 text-gray-400 text-sm">
              <p><strong>Quantity:</strong> {selectedFeeder.quantity}</p>
              <p><strong>Category:</strong> {selectedFeeder.category}</p>
              <p className="mt-4 text-xs">All feeders are fresh and nutritionally balanced. Proper storage recommended.</p>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-[#111] border-l border-[#2a2a2a] z-[100] p-6 overflow-auto mt-16">
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
                    <h4 className="font-bold">{item.name}</h4>
                    <p className="text-[#c8ff00] font-bold">${item.price} each</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.cartQuantity - 1)}
                        className="bg-[#2a2a2a] px-2 py-1 rounded hover:bg-[#c8ff00] hover:text-black"
                      >
                        −
                      </button>
                      <span className="w-8 text-center">{item.cartQuantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.cartQuantity + 1)}
                        className="bg-[#2a2a2a] px-2 py-1 rounded hover:bg-[#c8ff00] hover:text-black"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-400 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="pt-8 border-t border-[#2a2a2a]">
                <div className="flex justify-between text-2xl font-bold mb-8">
                  <span>Total</span>
                  <span className="text-[#c8ff00]">${totalPrice.toFixed(2)}</span>
                </div>

                <button className="w-full bg-[#c8ff00] text-black py-5 rounded-2xl font-bold text-lg hover:bg-white transition">
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black border-t border-[#2a2a2a] mt-20 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-[#c8ff00] mb-4">VelvetViper Feeders</h3>
              <p className="text-gray-400 text-sm">Premium nutrition for your reptile family</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Categories</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><a href="#" className="hover:text-[#c8ff00]">Roaches</a></li>
                <li><a href="#" className="hover:text-[#c8ff00]">Mice</a></li>
                <li><a href="#" className="hover:text-[#c8ff00]">Worms</a></li>
                <li><a href="#" className="hover:text-[#c8ff00]">Crickets</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">Email: feeders@velvetviper.com</p>
              <p className="text-gray-400 text-sm">Phone: 1-800-VIPER-01</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Delivery</h4>
              <p className="text-gray-400 text-sm">Fast insulated shipping</p>
              <p className="text-gray-400 text-sm">Live arrival guaranteed</p>
            </div>
          </div>

          <div className="border-t border-[#2a2a2a] pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2026 VelvetViper. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
