"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

interface Listing {
  id: string;
  species: string;
  name?: string;
  location: string;
  country?: string;
  price: number;
  image_url?: string;
  gender?: string;
  health?: string;
  availability?: string;
  description?: string;
}

interface CartItem extends Listing {
  quantity: number;
}

export default function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedListing, setSelectedListing] =
    useState<Listing | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    let filtered = listings;

    if (search) {
      filtered = filtered.filter(
        l =>
          l.species.toLowerCase().includes(search.toLowerCase()) ||
          (l.name &&
            l.name.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (speciesFilter !== "All") {
      filtered = filtered.filter(
        l => l.species === speciesFilter
      );
    }

    setFilteredListings(filtered);
  }, [listings, search, speciesFilter]);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        setError(error.message);
        return;
      }

      setListings(data || []);
    } catch (err) {
      console.error("Fetch error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unknown error"
      );
    } finally {
      setLoading(false);
    }
  };

  const uniqueSpecies = Array.from(
    new Set(listings.map(l => l.species))
  ).sort();

  const getCurrency = (country?: string) => {
    switch (country?.toLowerCase()) {
      case "uk":
        return "£";
      case "usa":
        return "$";
      case "canada":
        return "CA$";
      default:
        return "$";
    }
  };

  const addToCart = (listing: Listing) => {
    setCart(prev => {
      const existing = prev.findIndex(
        item => item.id === listing.id
      );

      if (existing !== -1) {
        const updated = [...prev];
        updated[existing].quantity += 1;
        return updated;
      }

      return [...prev, { ...listing, quantity: 1 }];
    });

    const notif = document.createElement("div");

    notif.textContent = "✅ Added to cart!";

    notif.className =
      "fixed bottom-6 right-6 bg-[#c8ff00] text-black px-8 py-4 rounded-2xl font-medium shadow-2xl z-[200]";

    document.body.appendChild(notif);

    setTimeout(() => notif.remove(), 1800);
  };

  const removeFromCart = (id: string) => {
    setCart(prev =>
      prev.filter(item => item.id !== id)
    );
  };

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] font-serif">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-black/95 border-b border-[#2a2a2a] z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-3 hover:text-[#c8ff00]"
          >
            <span className="text-4xl">🐍</span>

            <h1 className="text-3xl font-bold tracking-tight">
              VELVETVIPER
            </h1>
          </Link>

          <div className="hidden md:flex gap-8 text-sm">
            <Link
              href="/"
              className="hover:text-[#c8ff00]"
            >
              Home
            </Link>

            <Link
              href="/browse"
              className="text-[#c8ff00]"
            >
              Browse
            </Link>
          </div>

          <button
            onClick={() =>
              setShowCart(!showCart)
            }
            className="text-2xl relative hover:text-[#c8ff00]"
          >
            🛒

            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#c8ff00] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden text-3xl"
          >
            ☰
          </button>
        </div>
      </nav>

      <div className="pt-24 px-6">
        {/* Search & Filter */}
        <div className="max-w-7xl mx-auto mb-12">
          <h1 className="text-5xl font-bold mb-8">
            Browse Reptiles
          </h1>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search by species or name..."
              value={search}
              onChange={e =>
                setSearch(e.target.value)
              }
              className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00]"
            />

            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() =>
                  setSpeciesFilter("All")
                }
                className={`px-6 py-2 rounded-full whitespace-nowrap transition ${
                  speciesFilter === "All"
                    ? "bg-[#c8ff00] text-black"
                    : "bg-[#111] border border-[#2a2a2a] hover:border-[#c8ff00]"
                }`}
              >
                All Species
              </button>

              {uniqueSpecies.map(species => (
                <button
                  key={species}
                  onClick={() =>
                    setSpeciesFilter(species)
                  }
                  className={`px-6 py-2 rounded-full whitespace-nowrap transition ${
                    speciesFilter === species
                      ? "bg-[#c8ff00] text-black"
                      : "bg-[#111] border border-[#2a2a2a] hover:border-[#c8ff00]"
                  }`}
                >
                  {species}
                </button>
              ))}
            </div>
          </div>

          <p className="text-gray-400 mt-4">
            {loading
              ? "Loading..."
              : error
              ? `Error: ${error}`
              : `Showing ${filteredListings.length} of ${listings.length} listings`}
          </p>

          {error && (
            <div className="bg-red-900/30 border border-red-600 rounded-2xl p-6 mt-6 text-red-300">
              <p>
                ⚠️ Error loading listings: {error}
              </p>

              <p className="text-sm mt-2">
                Did you visit the seed endpoint?
              </p>
            </div>
          )}
        </div>

        {/* Listing Grid */}
        <div className="max-w-7xl mx-auto pb-24">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">
                Loading reptiles...
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredListings.map(listing => (
                  <div
                    key={listing.id}
                    className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition group cursor-pointer"
                    onClick={() => {
                      setSelectedListing(listing);
                      setShowModal(true);
                    }}
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {listing.image_url ? (
                          <img
                            src={listing.image_url}
                            alt={listing.species}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <div className="text-gray-400 text-2xl">
                            🐍
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg text-black">
                              {listing.species}
                            </h3>

                            <p className="text-gray-600 text-sm">
                              {listing.name ||
                                "Unnamed"}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-black font-bold text-lg">
                              {getCurrency(
                                listing.country
                              )}
                              {listing.price}
                            </div>

                            <div className="text-gray-500 text-xs">
                              {listing.location}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mb-3 flex-wrap">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            {listing.gender ||
                              "Unknown"}
                          </span>

                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            {listing.health ||
                              "Healthy"}
                          </span>

                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            {listing.availability ||
                              "Available"}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-2">
                          {listing.description ||
                            "No description available."}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredListings.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-xl">
                    No reptiles found matching
                    your search.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Listing Modal */}
      {showModal && selectedListing && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={e =>
              e.stopPropagation()
            }
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-black">
                  {selectedListing.species}
                </h2>

                <button
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="text-3xl text-gray-400 hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="flex gap-6">
                <div className="w-48 h-48 bg-gray-100 rounded-2xl overflow-hidden">
                  {selectedListing.image_url ? (
                    <img
                      src={
                        selectedListing.image_url
                      }
                      alt={
                        selectedListing.species
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🐍
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-black mb-2">
                    {selectedListing.name ||
                      "Unnamed"}
                  </h3>

                  <p className="text-gray-600 mb-2">
                    {selectedListing.location}
                  </p>

                  <p className="text-3xl font-bold text-black mb-4">
                    {getCurrency(
                      selectedListing.country
                    )}
                    {selectedListing.price}
                  </p>

                  <p className="text-gray-700 mb-6">
                    {selectedListing.description}
                  </p>

                  <button
                    onClick={() =>
                      addToCart(selectedListing)
                    }
                    className="bg-[#c8ff00] text-black px-6 py-3 rounded-2xl font-bold hover:opacity-90"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-[#111] border-l border-[#2a2a2a] z-[100] p-6 overflow-auto mt-16">
          <div className="flex justify-between mb-8">
            <h2 className="text-3xl font-bold">
              Your Cart
            </h2>

            <button
              onClick={() =>
                setShowCart(false)
              }
              className="text-3xl"
            >
              ✕
            </button>
          </div>

          {cart.length === 0 ? (
            <p className="text-gray-400 py-12 text-center">
              Cart is empty
            </p>
          ) : (
            <>
              {cart.map(item => (
                <div
                  key={item.id}
                  className="flex gap-4 mb-6 border-b border-[#2a2a2a] pb-6"
                >
                  <div className="w-20 h-20 bg-black rounded-xl overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.species}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-5xl h-full flex items-center justify-center">
                        🐍
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h4>{item.species}</h4>

                    <p className="text-[#c8ff00]">
                      {getCurrency(
                        item.country
                      )}
                      {item.price}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      removeFromCart(item.id)
                    }
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="pt-8 border-t border-[#2a2a2a]">
                <div className="flex justify-between text-2xl mb-8">
                  <span>Total</span>

                  <span>
                    ${totalPrice.toFixed(2)}
                  </span>
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