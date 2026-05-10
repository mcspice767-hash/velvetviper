"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";

const SPECIES_FILTERS = ["All", "Snakes", "Geckos", "Lizards"];
const COUNTRY_OPTIONS = ["UK", "USA", "Canada", "Nigeria", "Cameroon"];
const CITIES = ["All Cities", "Lagos", "Abuja", "Douala", "Yaoundé", "Kribi", "Limbe", "Bafoussam"];

export default function VelvetViper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState("home");
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [speciesFilter, setSpeciesFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All Cities");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ species: "", age: "", location: "", country: "", price: "", description: "", name: "", contact: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setMounted(true);
    fetchListings();

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    if (searchParams?.get("from") === "list") {
      setPage("list");
    }

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, [searchParams]);

  async function fetchListings() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "approved");

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setListings(data || []);
  }

  const filteredListings = listings.filter(l => {
    const matchSpecies = speciesFilter === "All" || 
      (speciesFilter === "Snakes" && l.type === "snake") ||
      (speciesFilter === "Geckos" && l.type === "gecko") ||
      (speciesFilter === "Lizards" && l.type === "lizard");
    const matchCity = cityFilter === "All Cities" || l.location === cityFilter;
    const matchSearch = l.species.toLowerCase().includes(searchQuery.toLowerCase()) || l.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSpecies && matchCity && matchSearch;
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPage("home");
    router.push("/");
  };

  const handleStartPayment = async () => {
    if (!formData.species || !formData.location || !formData.contact || !formData.country) return;
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    const loggedInUser = authData?.user;

    if (authError || !loggedInUser) {
      setError("You must be logged in to submit a listing.");
      return;
    }

    const pendingListing = {
      species: formData.species,
      name: formData.name || "Unnamed",
      age: formData.age || "Unknown",
      location: formData.location,
      country: formData.country,
      price: parseInt(formData.price) || 0,
      type: formData.species.toLowerCase().includes("gecko") ? "gecko" : formData.species.toLowerCase().includes("snake") ? "snake" : "lizard",
      image: "🦎",
      color: "#1a2e1a",
      urgent: false,
      verified: false,
      description: formData.description,
      contact: formData.contact || loggedInUser.email,
      status: "pending",
      user_id: loggedInUser.id,
      user_email: loggedInUser.email || "",
      payment_status: "unpaid",
    };

    sessionStorage.setItem("pendingListing", JSON.stringify(pendingListing));
    router.push("/payment");
  };

  const styles = {
    app: { fontFamily: "'Georgia', serif", background: "#0a0a0a", color: "#e8e0d0", minHeight: "100vh", overflowX: "hidden" },
    nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,10,10,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #2a2a2a", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 },
    logo: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
    logoText: { fontSize: 22, fontWeight: 700, letterSpacing: "0.15em", color: "#c8ff00", fontFamily: "'Georgia', serif", textTransform: "uppercase" },
    logoSub: { fontSize: 9, letterSpacing: "0.3em", color: "#666", textTransform: "uppercase", display: "block", marginTop: -4 },
    navLinks: { display: "flex", gap: 32, alignItems: "center" },
    navLink: { fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#999", cursor: "pointer", transition: "color 0.2s", fontFamily: "Georgia, serif" },
    navCta: { background: "#c8ff00", color: "#0a0a0a", padding: "8px 20px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Georgia, serif" },
    hero: { paddingTop: 160, paddingBottom: 120, paddingLeft: 48, paddingRight: 48, maxWidth: 900, margin: "0 auto", opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease" },
    heroTag: { fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: "#c8ff00", marginBottom: 24, display: "block" },
    heroTitle: { fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 400, lineHeight: 1, color: "#e8e0d0", marginBottom: 8, fontStyle: "italic" },
    heroTitle2: { fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 700, lineHeight: 1, color: "#c8ff00", marginBottom: 32 },
    heroDesc: { fontSize: 18, lineHeight: 1.7, color: "#888", maxWidth: 520, marginBottom: 48 },
    heroButtons: { display: "flex", gap: 16, flexWrap: "wrap" },
    btnPrimary: { background: "#c8ff00", color: "#0a0a0a", padding: "16px 40px", fontSize: 12, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Georgia, serif", transition: "transform 0.2s" },
    btnOutline: { background: "transparent", color: "#e8e0d0", padding: "16px 40px", fontSize: 12, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", border: "1px solid #444", fontFamily: "Georgia, serif" },
    statsBar: { borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", padding: "32px 48px", display: "flex", gap: 64, justifyContent: "center", flexWrap: "wrap" },
    stat: { textAlign: "center" },
    statNum: { fontSize: 36, fontWeight: 700, color: "#c8ff00", fontFamily: "Georgia, serif", display: "block" },
    statLabel: { fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase" },
    section: { padding: "80px 32px", maxWidth: 1200, margin: "0 auto" },
    sectionTag: { fontSize: 10, letterSpacing: "0.5em", color: "#c8ff00", textTransform: "uppercase", marginBottom: 12 },
    sectionTitle: { fontSize: 36, fontWeight: 400, color: "#e8e0d0", marginBottom: 48, fontStyle: "italic" },
    filtersRow: { display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap", alignItems: "center" },
    filterBtn: (active) => ({ padding: "8px 20px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", border: active ? "1px solid #c8ff00" : "1px solid #2a2a2a", background: active ? "#c8ff00" : "transparent", color: active ? "#0a0a0a" : "#888", fontFamily: "Georgia, serif", transition: "all 0.2s" }),
    select: { background: "#111", border: "1px solid #2a2a2a", color: "#888", padding: "8px 16px", fontSize: 11, letterSpacing: "0.15em", fontFamily: "Georgia, serif", cursor: "pointer" },
    searchInput: { background: "#111", border: "1px solid #2a2a2a", color: "#e8e0d0", padding: "8px 16px", fontSize: 13, fontFamily: "Georgia, serif", outline: "none", minWidth: 220 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 1, background: "#1a1a1a" },
    card: { background: "#0f0f0f", padding: 28, cursor: "pointer", transition: "background 0.2s", position: "relative", overflow: "hidden" },
    cardBadge: (verified) => ({ position: "absolute", top: 16, right: 16, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", padding: "4px 10px", background: verified ? "rgba(200,255,0,0.15)" : "rgba(255,255,255,0.05)", color: verified ? "#c8ff00" : "#555", border: `1px solid ${verified ? "#c8ff00" : "#2a2a2a"}` }),
    urgentBadge: { position: "absolute", top: 16, left: 16, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", padding: "4px 10px", background: "rgba(255,60,0,0.15)", color: "#ff6030", border: "1px solid #ff6030" },
    cardEmoji: { fontSize: 48, marginBottom: 16, display: "block" },
    cardSpecies: { fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: "#c8ff00", marginBottom: 4 },
    cardName: { fontSize: 26, fontWeight: 400, fontStyle: "italic", color: "#e8e0d0", marginBottom: 8 },
    cardMeta: { fontSize: 12, color: "#555", marginBottom: 16, letterSpacing: "0.1em" },
    cardDesc: { fontSize: 13, color: "#777", lineHeight: 1.6, marginBottom: 20 },
    cardPrice: { fontSize: 22, fontWeight: 700, color: "#c8ff00", fontFamily: "Georgia, serif" },
    modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" },
    modalBox: { background: "#0f0f0f", border: "1px solid #2a2a2a", maxWidth: 600, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 40 },
    modalClose: { fontSize: 22, cursor: "pointer", color: "#555", lineHeight: 1, float: "right", background: "none", border: "none" },
    modalSpecies: { fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: "#c8ff00", marginBottom: 8, display: "block" },
    modalName: { fontSize: 48, fontWeight: 400, fontStyle: "italic", color: "#e8e0d0", marginBottom: 4 },
    modalLocation: { fontSize: 13, color: "#555", marginBottom: 24, letterSpacing: "0.15em" },
    modalDesc: { fontSize: 15, color: "#888", lineHeight: 1.8, marginBottom: 32, borderLeft: "2px solid #2a2a2a", paddingLeft: 20 },
    modalPrice: { fontSize: 36, fontWeight: 700, color: "#c8ff00", marginBottom: 32 },
    contactBtn: { background: "#c8ff00", color: "#0a0a0a", padding: "14px 32px", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Georgia, serif", width: "100%", marginBottom: 12 },
    waBtn: { background: "#25D366", color: "#fff", padding: "14px 32px", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Georgia, serif", width: "100%" },
    formPage: { paddingTop: 100, maxWidth: 640, margin: "0 auto", padding: "100px 32px 80px" },
    formTitle: { fontSize: 42, fontStyle: "italic", color: "#e8e0d0", marginBottom: 8 },
    formSub: { fontSize: 13, color: "#666", marginBottom: 48, letterSpacing: "0.1em" },
    formGroup: { marginBottom: 28 },
    label: { fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: "#666", display: "block", marginBottom: 10 },
    input: { width: "100%", background: "#111", border: "1px solid #2a2a2a", color: "#e8e0d0", padding: "14px 16px", fontSize: 14, fontFamily: "Georgia, serif", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
    textarea: { width: "100%", background: "#111", border: "1px solid #2a2a2a", color: "#e8e0d0", padding: "14px 16px", fontSize: 14, fontFamily: "Georgia, serif", outline: "none", boxSizing: "border-box", minHeight: 120, resize: "vertical" },
    submitBtn: { background: "#c8ff00", color: "#0a0a0a", padding: "18px 48px", fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Georgia, serif", width: "100%", marginTop: 16 },
    successBox: { textAlign: "center", padding: "80px 32px" },
    successEmoji: { fontSize: 64, marginBottom: 24 },
    successTitle: { fontSize: 36, fontStyle: "italic", color: "#c8ff00", marginBottom: 12 },
    successSub: { fontSize: 15, color: "#666" },
    footer: { borderTop: "1px solid #1a1a1a", padding: "48px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 },
    footerLogo: { fontSize: 18, fontWeight: 700, letterSpacing: "0.2em", color: "#c8ff00", textTransform: "uppercase" },
    footerLinks: { display: "flex", gap: 32 },
    footerLink: { fontSize: 11, letterSpacing: "0.2em", color: "#555", cursor: "pointer", textTransform: "uppercase" },
    footerCopy: { fontSize: 11, color: "#333", letterSpacing: "0.1em" },
    trustBanner: { background: "#0f0f0f", border: "1px solid #1e1e1e", padding: "48px 32px", margin: "0 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32, maxWidth: 1136, marginLeft: "auto", marginRight: "auto" },
    trustItem: { textAlign: "center" },
    trustIcon: { fontSize: 28, marginBottom: 12, display: "block" },
    trustTitle: { fontSize: 13, fontWeight: 700, color: "#e8e0d0", marginBottom: 6, letterSpacing: "0.1em" },
    trustDesc: { fontSize: 12, color: "#555", lineHeight: 1.6 },
    noResults: { gridColumn: "1/-1", textAlign: "center", padding: "80px 32px", color: "#444", fontStyle: "italic", fontSize: 20 },
  };

  if (selectedListing) {
    return (
      <div style={styles.app}>
        <div style={styles.modal} onClick={() => setSelectedListing(null)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setSelectedListing(null)}>✕</button>
            <span style={styles.modalSpecies}>{selectedListing.species}</span>
            <div style={styles.modalName}>{selectedListing.name}</div>
            <div style={styles.modalLocation}>📍 {selectedListing.location} · {selectedListing.age} old</div>
            {selectedListing.verified && <div style={{ fontSize: 11, color: "#c8ff00", letterSpacing: "0.3em", marginBottom: 20 }}>✓ VERIFIED LISTING</div>}
            {selectedListing.urgent && <div style={{ fontSize: 11, color: "#ff6030", letterSpacing: "0.3em", marginBottom: 20 }}>⚡ URGENT REHOME</div>}
            <div style={styles.modalDesc}>{selectedListing.description}</div>
            <div style={styles.modalPrice}>₦{selectedListing.price.toLocaleString()}</div>
            <button style={styles.contactBtn} onClick={() => alert("Contact form would open here — connect to your backend to enable messaging!")}>✉ Message Owner</button>
            <button style={styles.waBtn} onClick={() => window.open("https://wa.me/?text=Hi, I'm interested in " + selectedListing.name + " the " + selectedListing.species, "_blank")}>💬 WhatsApp Owner</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.logo} onClick={() => setPage("home")}>
          <div>
            <span style={styles.logoText}>VelvetViper</span>
            <span style={styles.logoSub}>Reptile Rehoming</span>
          </div>
        </div>
        <div style={styles.navLinks}>
          <span style={styles.navLink} onClick={() => setPage("browse")}>Browse</span>
          <span style={styles.navLink} onClick={() => setPage("about")}>About</span>
          {user ? (
            <>
              <span style={styles.navLink} onClick={() => router.push("/my-listings")}>My Listings</span>
              <button style={styles.navCta} onClick={() => setPage("list")}>List a Reptile</button>
              <span style={styles.navLink} onClick={handleLogout}>Logout</span>
            </>
          ) : (
            <>
              <span style={styles.navLink} onClick={() => router.push("/login?redirect=" + encodeURIComponent("/?from=list"))}>Login</span>
              <span style={styles.navLink} onClick={() => router.push("/signup")}>Signup</span>
            </>
          )}
        </div>
      </nav>

      {/* HOME */}
      {page === "home" && (
        <>
          <div style={styles.hero}>
            <span style={styles.heroTag}>West & Central Africa's Reptile Rehoming Platform</span>
            <div style={styles.heroTitle}>Every reptile deserves</div>
            <div style={styles.heroTitle2}>a safe home.</div>
            <p style={styles.heroDesc}>VelvetViper connects responsible reptile owners with verified adopters across the region. No more Facebook groups. Just a proper platform built for the community.</p>
            <div style={styles.heroButtons}>
              <button style={styles.btnPrimary} onClick={() => setPage("browse")}>Browse Reptiles</button>
              <button
                style={styles.btnOutline}
                onClick={() => {
                  if (user) {
                    setPage("list");
                  } else {
                    router.push("/login?redirect=" + encodeURIComponent("/?from=list"));
                  }
                }}
              >
                List Your Reptile
              </button>
            </div>
          </div>

          <div style={styles.statsBar}>
            <div style={styles.stat}><span style={styles.statNum}>{listings.length}</span><span style={styles.statLabel}>Active Listings</span></div>
            <div style={styles.stat}><span style={styles.statNum}>4</span><span style={styles.statLabel}>Verified Sellers</span></div>
            <div style={styles.stat}><span style={styles.statNum}>6</span><span style={styles.statLabel}>Cities</span></div>
            <div style={styles.stat}><span style={styles.statNum}>100%</span><span style={styles.statLabel}>Free to Browse</span></div>
          </div>

          {/* Featured */}
          <div style={styles.section}>
            <span style={styles.sectionTag}>Latest Listings</span>
            <div style={styles.sectionTitle}>Recently listed reptiles</div>
            <div style={styles.grid}>
              {listings.slice(0, 3).map(l => (
                <div key={l.id} style={styles.card} onClick={() => setSelectedListing(l)}>
                  {l.urgent && <div style={styles.urgentBadge}>Urgent</div>}
                  <div style={styles.cardBadge(l.verified)}>{l.verified ? "✓ Verified" : "Unverified"}</div>
                  <span style={styles.cardEmoji}>{l.image}</span>
                  <div style={styles.cardSpecies}>{l.species}</div>
                  <div style={styles.cardName}>{l.name}</div>
                  <div style={styles.cardMeta}>{l.age} · {l.location}</div>
                  <div style={styles.cardDesc}>{l.description.slice(0, 80)}...</div>
                  <div style={styles.cardPrice}>₦{l.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <button style={styles.btnOutline} onClick={() => setPage("browse")}>View All Listings →</button>
            </div>
          </div>

          {/* Trust */}
          <div style={styles.trustBanner}>
            <div style={styles.trustItem}><span style={styles.trustIcon}>🔒</span><div style={styles.trustTitle}>Verified Sellers</div><div style={styles.trustDesc}>Badge system identifies trusted, repeat sellers with track records.</div></div>
            <div style={styles.trustItem}><span style={styles.trustIcon}>💬</span><div style={styles.trustTitle}>Direct Contact</div><div style={styles.trustDesc}>Message owners via WhatsApp or our platform — no middlemen.</div></div>
            <div style={styles.trustItem}><span style={styles.trustIcon}>🌍</span><div style={styles.trustTitle}>Regional Coverage</div><div style={styles.trustDesc}>Lagos to Douala to Kribi — we serve the whole region.</div></div>
            <div style={styles.trustItem}><span style={styles.trustIcon}>🐾</span><div style={styles.trustTitle}>Animal Welfare First</div><div style={styles.trustDesc}>Listings reviewed to ensure responsible rehoming standards.</div></div>
          </div>

          <div style={{ height: 80 }} />
        </>
      )}

      {/* BROWSE */}
      {page === "browse" && (
        <div style={styles.section}>
          <div style={{ paddingTop: 40 }}>
            <span style={styles.sectionTag}>All Listings</span>
            <div style={styles.sectionTitle}>Find your next reptile</div>
            <div style={styles.filtersRow}>
              {SPECIES_FILTERS.map(f => (
                <button key={f} style={styles.filterBtn(speciesFilter === f)} onClick={() => setSpeciesFilter(f)}>{f}</button>
              ))}
              <select style={styles.select} value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input style={styles.searchInput} placeholder="Search species or name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div style={styles.grid}>
              {filteredListings.length === 0 
                ? <div style={styles.noResults}>No reptiles found matching your filters.</div>
                : filteredListings.map(l => (
                <div key={l.id} style={styles.card} onClick={() => setSelectedListing(l)}>
                  {l.urgent && <div style={styles.urgentBadge}>Urgent</div>}
                  <div style={styles.cardBadge(l.verified)}>{l.verified ? "✓ Verified" : "Unverified"}</div>
                  <span style={styles.cardEmoji}>{l.image}</span>
                  <div style={styles.cardSpecies}>{l.species}</div>
                  <div style={styles.cardName}>{l.name}</div>
                  <div style={styles.cardMeta}>{l.age} · {l.location}</div>
                  <div style={styles.cardDesc}>{l.description.slice(0, 90)}...</div>
                  <div style={styles.cardPrice}>₦{l.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LIST */}
      {page === "list" && (
        <div style={styles.formPage}>
          {!user ? (
            <div style={styles.successBox}>
              <div style={styles.successEmoji}>🔒</div>
              <div style={styles.successTitle}>Login Required</div>
              <p style={styles.successSub}>You must be logged in to list a reptile.</p>
              <div style={{ marginTop: 32, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <button style={styles.btnPrimary} onClick={() => router.push("/login?redirect=" + encodeURIComponent("/?from=list"))}>Go to Login</button>
              </div>
            </div>
          ) : submitted ? (
            <div style={styles.successBox}>
              <div style={styles.successEmoji}>🐍</div>
              <div style={styles.successTitle}>Listing Submitted!</div>
              <p style={styles.successSub}>Your reptile is now live on VelvetViper. We'll review it shortly.</p>
              <div style={{ marginTop: 32, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <button style={styles.btnPrimary} onClick={() => { setPage("browse"); setSubmitted(false); setFormData({ species: "", age: "", location: "", price: "", description: "", name: "", contact: "" }); }}>View All Listings</button>
                <button style={styles.btnOutline} onClick={() => { setSubmitted(false); setFormData({ species: "", age: "", location: "", price: "", description: "", name: "", contact: "" }); }}>Add Another</button>
              </div>
            </div>
          ) : (
            <>
              <div style={styles.formTitle}>List Your Reptile</div>
              <p style={styles.formSub}>Connect your animal with the right home. All listings reviewed within 24hrs.</p>
              <div style={styles.formGroup}>
                <label style={styles.label}>Species *</label>
                <input style={styles.input} placeholder="e.g. Ball Python, Crested Gecko, Bearded Dragon" value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Pet Name</label>
                <input style={styles.input} placeholder="e.g. Midnight" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Age</label>
                  <input style={styles.input} placeholder="e.g. 2 years" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Asking Price (₦)</label>
                  <input style={styles.input} type="number" placeholder="e.g. 25000" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Country *</label>
                <select style={{ ...styles.input, cursor: "pointer" }} value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })}>
                  <option value="">Select your country</option>
                  {COUNTRY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>City / Location *</label>
                <select style={{ ...styles.input, cursor: "pointer" }} value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}>
                  <option value="">Select your city</option>
                  {CITIES.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea style={styles.textarea} placeholder="Health status, feeding habits, included equipment, reason for rehoming..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>WhatsApp / Contact *</label>
                <input style={styles.input} placeholder="+237 or +234 number" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
              </div>
              <button style={{ ...styles.submitBtn, opacity: (!formData.species || !formData.location || !formData.contact || !formData.country) ? 0.4 : 1 }} onClick={handleStartPayment} disabled={!formData.species || !formData.location || !formData.contact || !formData.country}>Submit Listing →</button>
              <p style={{ fontSize: 11, color: "#444", marginTop: 16, textAlign: "center", letterSpacing: "0.1em" }}>FREE to list · Reviewed within 24hrs · No hidden fees</p>
            </>
          )}
        </div>
      )}

      {/* ABOUT */}
      {page === "about" && (
        <div style={{ ...styles.section, paddingTop: 120, maxWidth: 720, margin: "0 auto" }}>
          <span style={styles.sectionTag}>Our Story</span>
          <div style={{ fontSize: 42, fontStyle: "italic", color: "#e8e0d0", marginBottom: 24, lineHeight: 1.2 }}>Built for the reptile community</div>
          <p style={{ fontSize: 16, color: "#777", lineHeight: 1.9, marginBottom: 32 }}>VelvetViper was created because the reptile community deserved better than random Facebook groups, zero accountability, and animals ending up in the wrong hands.</p>
          <p style={{ fontSize: 16, color: "#777", lineHeight: 1.9, marginBottom: 32 }}>We're building the first dedicated reptile rehoming platform for West and Central Africa — a trusted layer between owners who need to rehome and adopters who want to give a reptile a proper home.</p>
          <p style={{ fontSize: 16, color: "#777", lineHeight: 1.9, marginBottom: 48 }}>Every listing is reviewed. Verified sellers earn badges. And the community grows stronger every week.</p>
          <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: "#c8ff00", marginBottom: 24 }}>Safe Rehoming Tips</div>
            {["Always ask for feeding records and vet history.", "Meet in a public place for the handover if possible.", "Verify the seller's setup — a good owner will share photos.", "Never rush. A healthy rehome takes communication.", "Check local regulations on exotic animal ownership."].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "flex-start" }}>
                <span style={{ color: "#c8ff00", fontSize: 13, marginTop: 2 }}>{i + 1}.</span>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, margin: 0 }}>{tip}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 48, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <button style={styles.btnPrimary} onClick={() => setPage("browse")}>Browse Listings</button>
            <button
              style={styles.btnOutline}
              onClick={() => {
                if (user) {
                  setPage("list");
                } else {
                  router.push("/login?redirect=" + encodeURIComponent("/?from=list"));
                }
              }}
            >
              List a Reptile
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>VelvetViper</div>
        <div style={styles.footerLinks}>
          <span style={styles.footerLink} onClick={() => setPage("browse")}>Browse</span>
          <span style={styles.footerLink} onClick={() => setPage("list")}>List</span>
          <span style={styles.footerLink} onClick={() => setPage("about")}>About</span>
        </div>
        <div style={styles.footerCopy}>© 2026 VelvetViper · All rights reserved</div>
      </footer>
    </div>
  );
}
