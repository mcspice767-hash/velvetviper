"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  country: string;
  joinDate: string;
  totalListings: number;
  totalSales: number;
  rating: number;
}

interface UserListing {
  id: string;
  species: string;
  name: string;
  price: number;
  status: "active" | "sold" | "pending";
  date: string;
  views: number;
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "listings" | "orders" | "settings">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "Reptile Enthusiast",
    email: "user@example.com",
    phone: "+1-555-0123",
    country: "USA",
    joinDate: "2024-01-15",
    totalListings: 12,
    totalSales: 8,
    rating: 4.8
  });

  const [listings] = useState<UserListing[]>([
    { id: "1", species: "Ball Python", name: "Obsidian", price: 200, status: "active", date: "2024-12-01", views: 45 },
    { id: "2", species: "Bearded Dragon", name: "Atlas", price: 250, status: "sold", date: "2024-11-20", views: 102 },
    { id: "3", species: "Corn Snake", name: "Blaze", price: 180, status: "pending", date: "2024-12-10", views: 23 },
  ]);

  const [orders] = useState([
    { id: "ORD-001", items: "Crickets (2x), Mealworms (1x)", total: 28.50, date: "2024-12-05", status: "delivered" },
    { id: "ORD-002", items: "Dubia Roaches (3x), Mice (1x)", total: 65.00, date: "2024-11-28", status: "delivered" },
  ]);

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
            <Link href="/feeders" className="hover:text-[#c8ff00]">Feeders</Link>
            <Link href="/account" className="text-[#c8ff00]">Account</Link>
          </div>

          <button className="text-2xl hover:text-[#c8ff00]">👤</button>
        </div>
      </nav>

      <div className="pt-24 px-6">
        <div className="max-w-7xl mx-auto mb-12">
          <h1 className="text-5xl font-bold mb-2">My Account</h1>
          <p className="text-gray-400">Manage your listings, orders, and profile</p>
        </div>

        <div className="max-w-7xl mx-auto pb-24">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-[#2a2a2a] mb-8 overflow-x-auto">
            {["profile", "listings", "orders", "settings"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-4 whitespace-nowrap capitalize text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "border-b-4 border-[#c8ff00] text-[#c8ff00]"
                    : "text-gray-500 hover:text-[#e8e0d0]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="md:col-span-1">
                <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 text-center">
                  <div className="text-6xl mb-4">👤</div>
                  <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-[#c8ff00] text-xl">★</span>
                    <span className="font-bold">{profile.rating}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-6">Member since {new Date(profile.joinDate).toLocaleDateString()}</p>
                  <div className="space-y-3">
                    <div className="bg-green-900/20 border border-green-600/50 rounded-2xl p-4">
                      <p className="text-green-300 text-2xl font-bold">{profile.totalListings}</p>
                      <p className="text-gray-400 text-sm">Total Listings</p>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-600/50 rounded-2xl p-4">
                      <p className="text-blue-300 text-2xl font-bold">{profile.totalSales}</p>
                      <p className="text-gray-400 text-sm">Completed Sales</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="md:col-span-2">
                <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold">Profile Information</h3>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="bg-[#c8ff00] text-black px-4 py-2 rounded-full font-bold hover:bg-white transition"
                    >
                      {isEditing ? "Save" : "Edit"}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-gray-400 text-sm">Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className={`w-full bg-black border border-[#2a2a2a] rounded-2xl px-4 py-3 mt-2 ${
                          isEditing ? "text-[#e8e0d0] focus:border-[#c8ff00]" : "text-gray-400"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className={`w-full bg-black border border-[#2a2a2a] rounded-2xl px-4 py-3 mt-2 ${
                          isEditing ? "text-[#e8e0d0] focus:border-[#c8ff00]" : "text-gray-400"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm">Phone</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className={`w-full bg-black border border-[#2a2a2a] rounded-2xl px-4 py-3 mt-2 ${
                          isEditing ? "text-[#e8e0d0] focus:border-[#c8ff00]" : "text-gray-400"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm">Country</label>
                      <select
                        value={profile.country}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                        className={`w-full bg-black border border-[#2a2a2a] rounded-2xl px-4 py-3 mt-2 ${
                          isEditing ? "text-[#e8e0d0]" : "text-gray-400"
                        }`}
                      >
                        <option>USA</option>
                        <option>UK</option>
                        <option>Canada</option>
                        <option>Australia</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Listings Tab */}
          {activeTab === "listings" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">Your Reptile Listings</h3>
                <Link href="/admin" className="bg-[#c8ff00] text-black px-6 py-3 rounded-2xl font-bold hover:bg-white transition">
                  + Post New
                </Link>
              </div>

              <div className="space-y-4">
                {listings.map(listing => (
                  <div key={listing.id} className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-6 flex items-center justify-between hover:border-[#c8ff00] transition">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold">{listing.species} - {listing.name}</h4>
                      <p className="text-gray-400 text-sm">Posted {listing.date} • {listing.views} views</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#c8ff00]">${listing.price}</p>
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          listing.status === "active" ? "bg-green-900/50 text-green-300" :
                          listing.status === "sold" ? "bg-red-900/50 text-red-300" :
                          "bg-yellow-900/50 text-yellow-300"
                        }`}>
                          {listing.status}
                        </span>
                      </div>
                      <button className="bg-[#c8ff00] text-black px-4 py-2 rounded-2xl font-bold hover:bg-white transition text-sm">
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div>
              <h3 className="text-2xl font-bold mb-8">Your Orders</h3>

              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-6 flex items-center justify-between hover:border-[#c8ff00] transition">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold">{order.id}</h4>
                      <p className="text-gray-400 text-sm">{order.items}</p>
                      <p className="text-gray-500 text-xs">Ordered {order.date}</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#c8ff00]">${order.total}</p>
                        <span className="text-xs bg-green-900/50 text-green-300 px-3 py-1 rounded-full">
                          {order.status}
                        </span>
                      </div>
                      <button className="bg-[#c8ff00] text-black px-4 py-2 rounded-2xl font-bold hover:bg-white transition text-sm">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 max-w-2xl">
              <h3 className="text-2xl font-bold mb-8">Account Settings</h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-[#2a2a2a]">
                  <div>
                    <h4 className="font-bold">Email Notifications</h4>
                    <p className="text-gray-400 text-sm">Receive updates about new messages and orders</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between pb-6 border-b border-[#2a2a2a]">
                  <div>
                    <h4 className="font-bold">Marketing Emails</h4>
                    <p className="text-gray-400 text-sm">Get notified about special offers and new listings</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between pb-6 border-b border-[#2a2a2a]">
                  <div>
                    <h4 className="font-bold">Two-Factor Authentication</h4>
                    <p className="text-gray-400 text-sm">Add extra security to your account</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" />
                </div>

                <div className="pt-6">
                  <button className="text-red-500 hover:text-red-400 font-bold">
                    🔓 Logout from all devices
                  </button>
                </div>

                <div className="pt-6 border-t border-[#2a2a2a]">
                  <button className="text-red-500 hover:text-red-400 font-bold text-lg">
                    ✕ Delete Account
                  </button>
                  <p className="text-gray-400 text-sm mt-2">This action cannot be undone</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-[#2a2a2a] py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; 2026 VelvetViper. Your premium reptile marketplace.</p>
        </div>
      </footer>
    </div>
  );
}
