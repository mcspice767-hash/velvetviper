"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

interface Listing {
  id: string;
  species: string;
  name?: string;
  age?: string;
  location: string;
  price: number;
  type?: string;
  image_url?: string;
  description?: string;
  contact: string;
  status: string;
  country?: string;
  featured?: boolean;
  payment_status?: string;
  created_at?: string;
}

const getCurrency = (country?: string) => {
  const currencies: Record<string, { symbol: string; standard: string; featured: string; code: string; standardNum: number }> = {
    UK: { symbol: '£', standard: '£2', featured: '£5', code: 'GBP', standardNum: 2 },
    USA: { symbol: '$', standard: '$2', featured: '$5', code: 'USD', standardNum: 2 },
    Canada: { symbol: 'CA$', standard: 'CA$2', featured: 'CA$5', code: 'CAD', standardNum: 2 },
  };
  return currencies[country || 'USA'] || { symbol: '$', standard: '$2', featured: '$5', code: 'USD', standardNum: 2 };
};

export default function AdminPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    fetchAllListings();
  }, []);

  async function fetchAllListings() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setListings(data || []);
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    const { error } = await supabase
      .from("listings")
      .update({ status })
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }
    fetchAllListings();
  };

  const toggleFeatured = async (id: string, currentFeatured?: boolean) => {
    await supabase
      .from("listings")
      .update({ featured: !currentFeatured })
      .eq("id", id);
    fetchAllListings();
  };

  const markAsPaid = async (id: string) => {
    await supabase
      .from("listings")
      .update({ payment_status: "paid" })
      .eq("id", id);
    fetchAllListings();
  };

  const filteredListings = listings.filter(l => l.status === activeTab);

  const revenueByCurrency = listings
    .filter(l => l.status === "approved" && l.payment_status === "paid")
    .reduce((acc, l) => {
      const curr = getCurrency(l.country);
      if (!acc[curr.code]) {
        acc[curr.code] = { symbol: curr.symbol, total: 0, count: 0 };
      }
      acc[curr.code].total += curr.standardNum;
      acc[curr.code].count += 1;
      return acc;
    }, {} as Record<string, { symbol: string; total: number; count: number }>);

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] text-white p-10">Loading admin dashboard...</div>;
  if (error) return <div className="min-h-screen bg-[#0a0a0a] text-red-500 p-10">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] p-6 font-serif">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-[#c8ff00]">Admin Dashboard</h1>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#c8ff00] text-black px-6 py-3 rounded-xl font-medium"
          >
            Refresh
          </button>
        </div>

        {/* Revenue Summary */}
        <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 mb-10">
          <h3 className="text-xl text-[#c8ff00] mb-6">Total Revenue (Paid Listings)</h3>
          {Object.entries(revenueByCurrency).map(([code, data]) => (
            <div key={code} className="text-lg mb-2">
              {code}: <span className="text-[#c8ff00]">{data.symbol}{data.total}</span> from {data.count} listings
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2a2a] mb-8">
          {["pending", "approved", "rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-10 py-4 capitalize text-lg font-medium transition-all ${
                activeTab === tab 
                  ? "border-b-4 border-[#c8ff00] text-[#c8ff00]" 
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab} ({listings.filter(l => l.status === tab).length})
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        <div className="grid gap-6">
          {filteredListings.map((listing) => {
            const curr = getCurrency(listing.country);
            return (
              <div key={listing.id} className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 flex gap-6">
                <div className="w-48 h-48 bg-black rounded-2xl overflow-hidden flex-shrink-0">
                  {listing.image_url ? (
                    <img src={listing.image_url} alt={listing.species} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl">🐍</div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-3xl font-bold">{listing.species}</h3>
                      {listing.name && <p className="text-[#c8ff00] text-xl">{listing.name}</p>}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-mono">{curr.symbol}{listing.price}</div>
                      <div className="text-sm text-gray-500">{listing.country}</div>
                    </div>
                  </div>

                  <p><strong>Location:</strong> {listing.location}</p>
                  <p><strong>Contact:</strong> {listing.contact}</p>
                  {listing.description && <p className="text-gray-400 line-clamp-2">{listing.description}</p>}

                  <div className="flex flex-wrap gap-3 pt-4">
                    {listing.status === "pending" && (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(listing.id, "approved")}
                          className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-xl font-medium"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(listing.id, "rejected")}
                          className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-xl font-medium"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => toggleFeatured(listing.id, listing.featured)}
                      className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-xl font-medium"
                    >
                      {listing.featured ? "Remove Featured" : "Make Featured"}
                    </button>
                    <button 
                      onClick={() => markAsPaid(listing.id)}
                      className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-medium"
                    >
                      Mark as Paid
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}