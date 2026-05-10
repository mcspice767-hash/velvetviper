"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const newGiftCode = () => {
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `VV-${random}-${Date.now().toString().slice(-4)}`;
};

export default function AdminGiftCards() {
interface GiftCard {
  id: string;
  code: string;
  used: boolean;
  used_by: string;
}

const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'giftCards' | 'users'>('giftCards');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchGiftCards();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    const res = await fetch('/api/admin/users');
    const data = await res.json();

    if (!res.ok) {
      setError(data?.error || 'Unable to load users.');
      setLoading(false);
      return;
    }

    setUsers(data.users || []);
    setLoading(false);
  };

  const fetchGiftCards = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("gift_cards")
      .select("*")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setGiftCards(data || []);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const cards = Array.from({ length: 10 }, () => ({ code: newGiftCode() }));
    const { error } = await supabase.from("gift_cards").insert(cards);
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Generated 10 gift cards.");
    fetchGiftCards();
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setSuccess("Code copied to clipboard.");
    } catch {
      setError("Unable to copy code.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e8e0d0", padding: 24, fontFamily: "'Georgia', serif" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#c8ff00" }}>Admin Dashboard</div>
          <div style={{ color: "#888", marginTop: 8 }}>Manage gift cards and view registered users.</div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{ background: "#c8ff00", color: "#0a0a0a", border: "none", borderRadius: 12, padding: "14px 22px", cursor: "pointer", opacity: loading ? 0.65 : 1 }}
        >
          {loading ? "Generating…" : "Generate 10 Gift Cards"}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedTab('giftCards')}
          style={{ padding: '10px 18px', borderRadius: 12, border: selectedTab === 'giftCards' ? '1px solid #c8ff00' : '1px solid #2a2a2a', background: selectedTab === 'giftCards' ? '#1c2100' : '#111', color: '#e8e0d0', cursor: 'pointer' }}
        >
          Gift Cards
        </button>
        <button
          onClick={() => setSelectedTab('users')}
          style={{ padding: '10px 18px', borderRadius: 12, border: selectedTab === 'users' ? '1px solid #c8ff00' : '1px solid #2a2a2a', background: selectedTab === 'users' ? '#1c2100' : '#111', color: '#e8e0d0', cursor: 'pointer' }}
        >
          Users
          </button>
        </div>

        {error && <div style={{ color: "#ff6b6b", marginBottom: 16 }}>{error}</div>}
        {success && <div style={{ color: "#c8ff00", marginBottom: 16 }}>{success}</div>}

        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 18, padding: 20, minWidth: 220 }}>
            <div style={{ color: '#888', marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Total Gift Cards</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#c8ff00' }}>{giftCards.length}</div>
          </div>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 18, padding: 20, minWidth: 220 }}>
            <div style={{ color: '#888', marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Total Users</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#c8ff00' }}>{users.length}</div>
          </div>
        </div>

        {selectedTab === 'giftCards' ? (
          <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 18, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr", gap: 0, padding: "16px 24px", borderBottom: "1px solid #2a2a2a", color: "#888", fontSize: 12, textTransform: "uppercase" }}>
              <div>Code</div>
              <div>Status</div>
              <div>Used By</div>
              <div></div>
            </div>
            {giftCards.map((card) => (
              <div key={card.id} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr", gap: 0, padding: "16px 24px", borderBottom: "1px solid #2a2a2a", alignItems: "center", color: "#e8e0d0" }}>
                <div style={{ wordBreak: "break-all" }}>{card.code}</div>
                <div>{card.used ? "Used" : "Unused"}</div>
                <div style={{ color: "#888" }}>{card.used_by || "—"}</div>
                <button
                  onClick={() => copyCode(card.code)}
                  style={{ background: "#c8ff00", color: "#0a0a0a", border: "none", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}
                >
                  Copy
                </button>
              </div>
            ))}
            {giftCards.length === 0 && (
              <div style={{ padding: 24, color: "#888" }}>No gift cards yet. Generate gift cards to start accepting gift card payments.</div>
            )}
          </div>
        ) : (
          <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 18, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 0, padding: "16px 24px", borderBottom: "1px solid #2a2a2a", color: "#888", fontSize: 12, textTransform: "uppercase" }}>
              <div>Email</div>
              <div>Created</div>
              <div>Last Login</div>
            </div>
            {users.map((user) => (
              <div key={user.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 0, padding: "16px 24px", borderBottom: "1px solid #2a2a2a", alignItems: "center", color: "#e8e0d0" }}>
                <div style={{ wordBreak: "break-all" }}>{user.email || 'Unknown'}</div>
                <div style={{ color: "#888" }}>{new Date(user.created_at).toLocaleString()}</div>
                <div style={{ color: "#888" }}>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</div>
              </div>
            ))}
            {users.length === 0 && (
              <div style={{ padding: 24, color: "#888" }}>No users found. Ensure SUPABASE_SERVICE_ROLE_KEY is configured.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
