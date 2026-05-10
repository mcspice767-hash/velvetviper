"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

interface Listing {
  id: string;
  species: string;
  name: string;
  age: string;
  location: string;
  price: number;
  type: string;
  image: string;
  image_url?: string;
  color: string;
  urgent: boolean;
  verified: boolean;
  description: string;
  contact: string;
  status: string;
}

export default function MyListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ species: "", name: "", age: "", location: "", price: "", description: "", contact: "" });

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;

      if (error || !user?.email) {
        router.push("/login?redirect=/my-listings");
        return;
      }

      setUserEmail(user.email);
      fetchUserListings(user.email);
    };

    init();
  }, [router]);

  const fetchUserListings = async (email: string) => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("user_email", email)
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setListings(data || []);
  };

  const startEdit = (listing: Listing) => {
    setEditingId(listing.id);
    setEditData({
      species: listing.species || "",
      name: listing.name || "",
      age: listing.age || "",
      location: listing.location || "",
      price: listing.price?.toString() || "",
      description: listing.description || "",
      contact: listing.contact || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ species: "", name: "", age: "", location: "", price: "", description: "", contact: "" });
  };

  const saveEdit = async () => {
    if (!editingId) return;

    setLoading(true);
    const { error } = await supabase
      .from("listings")
      .update({
        species: editData.species,
        name: editData.name,
        age: editData.age,
        location: editData.location,
        price: parseInt(editData.price) || 0,
        description: editData.description,
        contact: editData.contact,
      })
      .eq("id", editingId);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    cancelEdit();
    fetchUserListings(userEmail);
  };

  const deleteListing = async (id: string) => {
    const confirmed = window.confirm("Delete this listing? This cannot be undone.");
    if (!confirmed) return;

    setLoading(true);
    const { error } = await supabase.from("listings").delete().eq("id", id);
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    fetchUserListings(userEmail);
  };

  const styles = {
    page: { minHeight: "100vh", background: "#0a0a0a", color: "#e8e0d0", padding: 24 },
    header: { maxWidth: 1040, margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
    title: { fontSize: 36, fontWeight: 700, color: "#c8ff00" },
    description: { color: "#888", marginTop: 8, maxWidth: 760 },
    card: { background: "#111", border: "1px solid #2a2a2a", borderRadius: 16, padding: 24, marginBottom: 20 },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 14 },
    cardTitle: { fontSize: 20, fontWeight: 700, color: "#e8e0d0" },
    cardMeta: { color: "#888", fontSize: 13, marginBottom: 12 },
    input: { width: "100%", background: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: 10, color: "#e8e0d0", padding: "12px 14px", marginBottom: 12 },
    textarea: { width: "100%", background: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: 10, color: "#e8e0d0", padding: "12px 14px", minHeight: 100, resize: "vertical", marginBottom: 12 },
    buttonRow: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 },
    button: { padding: "12px 18px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700 },
    primary: { background: "#c8ff00", color: "#0a0a0a" },
    danger: { background: "#dc3545", color: "#fff" },
    outline: { background: "transparent", color: "#e8e0d0", border: "1px solid #2a2a2a" },
    error: { color: "#ff6b6b", marginBottom: 20 },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>My Listings</div>
          <div style={styles.description}>Manage the reptiles you’ve listed on VelvetViper.</div>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {loading && <div style={{ color: "#888", marginBottom: 20 }}>Loading...</div>}

      {!loading && listings.length === 0 && (
        <div style={{ color: "#888", background: "#111", border: "1px solid #2a2a2a", borderRadius: 16, padding: 24 }}>No listings found. Create a new listing from the home page.</div>
      )}

      {listings.map((listing) => (
        <div key={listing.id} style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>{listing.species} — {listing.name}</div>
              <div style={styles.cardMeta}>{listing.location} • {listing.age} • {listing.status}</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#c8ff00" }}>₦{listing.price?.toLocaleString()}</div>
          </div>

          {editingId === listing.id ? (
            <>
              <input style={styles.input} value={editData.species} onChange={e => setEditData({ ...editData, species: e.target.value })} placeholder="Species" />
              <input style={styles.input} value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} placeholder="Name" />
              <input style={styles.input} value={editData.age} onChange={e => setEditData({ ...editData, age: e.target.value })} placeholder="Age" />
              <input style={styles.input} value={editData.location} onChange={e => setEditData({ ...editData, location: e.target.value })} placeholder="Location" />
              <input style={styles.input} type="number" value={editData.price} onChange={e => setEditData({ ...editData, price: e.target.value })} placeholder="Price" />
              <textarea style={styles.textarea as any} value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} placeholder="Description" />
              <input style={styles.input} value={editData.contact} onChange={e => setEditData({ ...editData, contact: e.target.value })} placeholder="Contact" />
              <div style={styles.buttonRow as any}>
                <button style={{ ...styles.button, ...styles.primary }} onClick={saveEdit}>Save Changes</button>
                <button style={{ ...styles.button, ...styles.outline }} onClick={cancelEdit}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ color: "#888", marginBottom: 14 }}>{listing.description}</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button style={{ ...styles.button, ...styles.primary }} onClick={() => startEdit(listing)}>Edit</button>
                <button style={{ ...styles.button, ...styles.danger }} onClick={() => deleteListing(listing.id)}>Delete</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
