"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Listing {
  id: string;
  species: string;
  name?: string;
  location: string;
  country?: string;
  price: number;
  image_url?: string;
  status: string;
  created_at: string;
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadMyListings();
  }, []);

  const loadMyListings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("user_email", user.email)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setListings(data || []);

    setLoading(false);
  };

  const getCurrency = (country?: string) => {
    switch (country?.toLowerCase()) {
      case "uk": return "£";
      case "usa": return "$";
      case "canada": return "CA$";
      default: return "$";
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">Loading your listings...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] p-6 font-serif">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold">My Listings</h1>
          <Link href="/list" className="bg-[#c8ff00] text-black px-8 py-3 rounded-2xl font-semibold hover:bg-white">
            + New Listing
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-6">🐍</p>
            <p className="text-2xl text-gray-400">You have no listings yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-[#111] border border-[#2a2a2a] rounded-3xl overflow-hidden">
                <div className="h-64 bg-black relative">
                  {listing.image_url ? (
                    <img src={listing.image_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-8xl h-full flex items-center justify-center opacity-50">🐍</div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold">{listing.species}</h3>
                  <p className="text-gray-400">{listing.location}</p>
                  <p className="text-[#c8ff00] text-xl mt-4">
                    {getCurrency(listing.country)}{listing.price}
                  </p>
                  <p className="mt-4 capitalize text-sm">Status: <span className="font-medium">{listing.status}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}