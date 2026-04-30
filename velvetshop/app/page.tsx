"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";

interface Listing {
  id: string;
  species: string;
  name: string;
  age: string;
  location: string;
  price: number;
  type: string;
  image: string;
  color: string;
  urgent: boolean;
  verified: boolean;
  description: string;
  contact: string;
  status: string;
}

const SPECIES_FILTERS = ["All", "Snakes", "Geckos", "Lizards"];
const COUNTRIES = ["All Countries", "UK", "USA", "Canada"];
const COUNTRY_CITIES: Record<string, string[]> = {
  UK: ["London", "Manchester", "Birmingham", "Bristol", "Edinburgh"],
  USA: ["New York", "Los Angeles", "Houston", "Chicago", "Miami"],
  Canada: ["Toronto", "Vancouver", "Montreal", "Calgary"],
};
const ALL_CITIES = ["All Cities", ...COUNTRY_CITIES.UK, ...COUNTRY_CITIES.USA, ...COUNTRY_CITIES.Canada];

export default function VelvetViper() {
  const [page, setPage] = useState("home");
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [speciesFilter, setSpeciesFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All Countries");
  const [cityFilter, setCityFilter] = useState("All Cities");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ species: "", age: "", location: "", price: "", description: "", name: "", contact: "", country: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cityInput, setCityInput] = useState("All Cities");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [formCityInput, setFormCityInput] = useState("");
  const [showFormCitySuggestions, setShowFormCitySuggestions] = useState(false);

  const cityOptions = countryFilter === "All Countries"
    ? ALL_CITIES
    : ["All Cities", ...(COUNTRY_CITIES[countryFilter] || [])];

  const formCityOptions = formData.country ? COUNTRY_CITIES[formData.country] || [] : [];

  const filteredCitySuggestions = cityOptions.filter(c => 
    c.toLowerCase().includes(cityInput.toLowerCase())
  );

  const filteredFormCitySuggestions = formCityOptions.filter(c => 
    c.toLowerCase().includes(formCityInput.toLowerCase())
  );

  useEffect(() => {
    setMounted(true);
    fetchListings();
  }, []);

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
    const matchCountry = countryFilter === "All Countries" || COUNTRY_CITIES[countryFilter]?.includes(l.location);
    const matchCity = cityFilter === "All Cities" || l.location === cityFilter;
    const matchSearch = l.species.toLowerCase().includes(searchQuery.toLowerCase()) || l.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSpecies && matchCountry && matchCity && matchSearch;
  });

  const handleSubmit = async () => {
    if (!formData.species || !formData.location || !formData.contact) return;
    setLoading(true);
    setError(null);

    const newListing = {
      species: formData.species,
      name: formData.name || "Unnamed",
      age: formData.age || "Unknown",
      location: formData.location,
      price: parseInt(formData.price) || 0,
      type: formData.species.toLowerCase().includes("gecko") ? "gecko" : formData.species.toLowerCase().includes("snake") ? "snake" : "lizard",
      image: "🦎",
      color: "#1a2e1a",
      urgent: false,
      verified: false,
      description: formData.description,
      contact: formData.contact,
      status: "pending",
    };

    const { error } = await supabase.from("listings").insert([newListing]);
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSubmitted(true);
  };

  const styles = {
    app: { fontFamily: "'Georgia', serif", background: "#0a0a0a", color: "#e8e0d0", minHeight: "100vh", overflowX: "hidden" } as React.CSSProperties,
    nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,10,10,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #2a2a2a", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 } as React.CSSProperties,
    logo: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" } as React.CSSProperties,
    logoText: { fontSize: 22, fontWeight: 700, letterSpacing: "0.15em", color: "#c8ff00", fontFamily: "'Georgia', serif", textTransform: "uppercase" } as React.CSSProperties,
    logoSub: { fontSize: 9, letterSpacing: "0.3em", color: "#666", textTransform: "uppercase", display: "block", marginTop: -4 } as React.CSSProperties,
    navLinks: { display: "flex", gap: 32, alignItems: "center" } as React.CSSProperties,
    navLink: { fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#999", cursor: "pointer", transition: "color 0.2s", fontFamily: "Georgia, serif" } as React.CSSProperties,
    navCta: { background: "#c8ff00", color: "#0a0a0a", padding: "8px 20px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Georgia, serif" } as React.CSSProperties,
    hero: { paddingTop: 160, paddingBottom: 120, paddingLeft: 48, paddingRight: 48, maxWidth: 900, margin: "0 auto", opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease" } as React.CSSProperties,
    heroTag: { fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: "#c8ff00", marginBottom: 24, display: "block" } as React.CSSProperties,
    heroTitle: { fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 400, lineHeight: 1, color: "#e8e0d0", marginBottom: 8, fontStyle: "italic" } as React.CSSProperties,
    heroTitle2: { fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 700, lineHeight: 1, color: "#c8ff00", marginBottom: 32 } as React.CSSProperties,
    heroDesc: { fontSize: 18, lineHeight: 1.7, color: "#888", maxWidth: 520, marginBottom: 48 } as React.CSSProperties,
    heroButtons: { display: "flex", gap: 16, flexWrap: "wrap" } as React.CSSProperties,
    btnPrimary: { background: "#c8ff00", color: "#0a0a0a", padding: "16px 40px", fontSize: 12, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Georgia, serif", transition: "transform 0.2s" } as React.CSSProperties,
    btnOutline: { background: "transparent", color: "#e8e0d0", padding: "16px 40px", fontSize: 12, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", border: "1px solid #444", fontFamily: "Georgia, serif" } as React.CSSProperties,
    statsBar: { borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", padding: "32px 48px", display: "flex", gap: 64, justifyContent: "center", flexWrap: "wrap" } as React.CSSProperties,
    stat: { textAlign: "center" } as React.CSSProperties,
    statNum: { fontSize: 36, fontWeight: 700, color: "#c8ff00", fontFamily: "Georgia, serif", display: "block" } as React.CSSProperties,
    statLabel: { fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase" } as React.CSSProperties,
    section: { padding: "80px 32px", maxWidth: 1200, margin: "0 auto" } as React.CSSProperties,
    sectionTag: { fontSize: 10, letterSpacing: "0.5em", color: "#c8ff00", textTransform: "uppercase", marginBottom: 12 } as React.CSSProperties,
    sectionTitle: { fontSize: 36, fontWeight: 400, color: "#e8e0d0", marginBottom: 48, fontStyle: "italic" } as React.CSSProperties,
    filtersRow: { display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap", alignItems: "center" } as React.CSSProperties,
    filterBtn: (active: boolean) => ({ padding: "8px 20px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", border: active ? "1px solid #c8ff00" : "1px solid #2a2a2a", background: active ? "#c8ff00" : "transparent", color: active ? "#0a0a0a" : "#888", fontFamily: "Georgia, serif", transition: "all 0.2s" } as React.CSSProperties),
    select: { background: "#111", border: "1px solid #2a2a2a", color: "#888", padding: "8px 16px", fontSize: 11, letterSpacing: "0.15em", fontFamily: "Georgia, serif", cursor: "pointer" } as React.CSSProperties,
    searchInput: { background: "#111", border: "1px solid #2a2a2a", color: "#e8e0d0", padding: "8px 16px", fontSize: 13, fontFamily: "Georgia, serif", outline: "none", minWidth: 220 } as React.CSSProperties,
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 1, background: "#1a1a1a" } as React.CSSProperties,
    card: { background: "#0f0f0f", padding: 28, cursor: "pointer", transition: "background 0.2s", position: "relative", overflow: "hidden" } as React.CSSProperties,
    cardBadge: (verified: boolean) => ({ position: "absolute", top: 16, right: 16, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", padding: "4px 10px", background: verified ? "rgba(200,255,0,0.15)" : "rgba(255,255,255,0.05)", color: verified ? "#c8ff00" : "#555", border: `1px solid ${verified ? "#c8ff00" : "#2a2a2a"}` } as React.CSSProperties),
    urgentBadge: { position: "absolute", top: 16, left: 16, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", padding: "4px 10px", background: "rgba(255,60,0,0.15)", color: "#ff6030", border: "1px solid #ff6030" } as React.CSSProperties,
    cardEmoji: { fontSize: 48, marginBottom: 16, display: "block" } as React.CSSProperties,
    cardSpecies: { fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: "#c8ff00", marginBottom: 4 } as React.CSSProperties,
    cardName: { fontSize: 26, fontWeight: 400, fontStyle: "italic", color: "#e8e0d0", marginBottom: 8 } as React.CSSProperties,
    cardMeta: { fontSize: 12, color: "#555", marginBottom: 16, letterSpacing: "0.1em" } as React.CSSProperties,
    cardDesc: { fontSize: 13, color: "#777", lineHeight: 1.6, marginBottom: 20 } as React.CSSProperties,
    cardPrice: { fontSize: 22, fontWeight: 700, color: "#c8ff00", fontFamily: "Georgia, serif" } as React.CSSProperties,
    modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" } as React.CSSProperties,
    modalBox: { background: "#0f0f0f", border: "1px solid #2a2a2a", maxWidth: 600, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 40 } as React.CSSProperties,
    modalClose: { fontSize: 22, cursor: "pointer", color: "#555", lineHeight: 1, float: "right", background: "none", border: "none" } as React.CSSProperties,
    modalSpecies: { fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: "#c8ff00", marginBottom: 8, display: "block" } as React.CSSProperties,
    modalName: { fontSize: 48, fontWeight: 400, fontStyle: "italic", color: "#e8e0d0", marginBottom: 4 } as React.CSSProperties,
    modalLocation: { fontSize: 13, color: "#555", marginBottom: 24, letterSpacing: "0.15em" } as React.CSSProperties,
    modalDesc: { fontSize: 15, color: "#888", lineHeight: 1.8, marginBottom: 32, borderLeft: "2px solid #2a2a2a", paddingLeft: 20 } as React.CSSProperties,
    modalPrice: { fontSize: 36, fontWeight: 700, color: "#c8ff00", marginBottom: 32 } as React.CSSProperties,
    contactBtn: { background: "#c8ff00", color: "#0a0a0a", padding: "14px 32px", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Georgia, serif", width: "100%", marginBottom: 12 } as React.CSSProperties,
    waBtn: { background: "#25D366", color: "#fff", padding: "14px 32px", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Georgia, serif", width: "100%" } as React.CSSProperties,
    formPage: { paddingTop: 100, maxWidth: 640, margin: "0 auto", padding: "100px 32px 80px" } as React.CSSProperties,
    formTitle: { fontSize: 42, fontStyle: "italic", color: "#e8e0d0", marginBottom: 8 } as React.CSSProperties,
    formSub: { fontSize: 13, color: "#666", marginBottom: 48, letterSpacing: "0.1em" } as React.CSSProperties,
    formGroup: { marginBottom: 28 } as React.CSSProperties,
    label: { fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: "#666", display: "block", marginBottom: 10 } as React.CSSProperties,
    input: { width: "100%", background: "#111", border: "1px solid #2a2a2a", color: "#e8e0d0", padding: "14px 16px", fontSize: 14, fontFamily: "Georgia, serif", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" } as React.CSSProperties,
    textarea: { width: "100%", background: "#111", border: "1px solid #2a2a2a", color: "#e8e0d0", padding: "14px 16px", fontSize: 14, fontFamily: "Georgia, serif", outline: "none", boxSizing: "border-box", minHeight: 120, resize: "vertical" } as React.CSSProperties,
    submitBtn: { background: "#c8ff00", color: "#0a0a0a", padding: "18px 48px", fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Georgia, serif", width: "100%", marginTop: 16 } as React.CSSProperties,
    successBox: { textAlign: "center", padding: "80px 32px" } as React.CSSProperties,
    successEmoji: { fontSize: 64, marginBottom: 24 } as React.CSSProperties,
    successTitle: { fontSize: 36, fontStyle: "italic", color: "#c8ff00", marginBottom: 12 } as React.CSSProperties,
    successSub: { fontSize: 15, color: "#666" } as React.CSSProperties,
    footer: { borderTop: "1px solid #1a1a1a", padding: "48px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 } as React.CSSProperties,
    footerLogo: { fontSize: 18, fontWeight: 700, letterSpacing: "0.2em", color: "#c8ff00", textTransform: "uppercase" } as React.CSSProperties,
    footerLinks: { display: "flex", gap: 32 } as React.CSSProperties,
    footerLink: { fontSize: 11, letterSpacing: "0.2em", color: "#555", cursor: "pointer", textTransform: "uppercase" } as React.CSSProperties,
    footerCopy: { fontSize: 11, color: "#333", letterSpacing: "0.1em" } as React.CSSProperties,
    trustBanner: { background: "#0f0f0f", border: "1px solid #1e1e1e", padding: "48px 32px", margin: "0 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32, maxWidth: 1136, marginLeft: "auto", marginRight: "auto" } as React.CSSProperties,
    trustItem: { textAlign: "center" } as React.CSSProperties,
    trustIcon: { fontSize: 28, marginBottom: 12, display: "block" } as React.CSSProperties,
    trustTitle: { fontSize: 13, fontWeight: 700, color: "#e8e0d0", marginBottom: 6, letterSpacing: "0.1em" } as React.CSSProperties,
    trustDesc: { fontSize: 12, color: "#555", lineHeight: 1.6 } as React.CSSProperties,
    noResults: { gridColumn: "1/-1", textAlign: "center", padding: "80px 32px", color: "#444", fontStyle: "italic", fontSize: 20 } as React.CSSProperties,
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
          <button style={styles.navCta} onClick={() => setPage("list")}>List a Reptile</button>
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
              <button style={styles.btnOutline} onClick={() => setPage("list")}>List Your Reptile</button>
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
              <select style={styles.select} value={countryFilter} onChange={e => { setCountryFilter(e.target.value); setCityInput("All Cities"); setCityFilter("All Cities"); setShowCitySuggestions(false); }}>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <div style={{ position: "relative", minWidth: 200 }}>
                <input
                  style={styles.searchInput}
                  placeholder="Select or type city..."
                  value={cityInput}
                  onChange={e => { setCityInput(e.target.value); setCityFilter(e.target.value); setShowCitySuggestions(true); }}
                  onFocus={() => setShowCitySuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                />
                {showCitySuggestions && filteredCitySuggestions.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#111", border: "1px solid #2a2a2a", borderTop: "none", maxHeight: 200, overflowY: "auto", zIndex: 10 }}>
                    {filteredCitySuggestions.map(c => (
                      <div
                        key={c}
                        onClick={() => { setCityInput(c); setCityFilter(c); setShowCitySuggestions(false); }}
                        style={{ padding: "8px 12px", cursor: "pointer", color: "#888", fontSize: 13, borderBottom: "1px solid #1a1a1a", transition: "background 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#1a1a1a")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
          {submitted ? (
            <div style={styles.successBox}>
              <div style={styles.successEmoji}>🐍</div>
              <div style={styles.successTitle}>Listing Submitted!</div>
              <p style={styles.successSub}>Your reptile is now live on VelvetViper. We'll review it shortly.</p>
              <div style={{ marginTop: 32, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <button style={styles.btnPrimary} onClick={() => { setPage("browse"); setSubmitted(false); setFormData({ species: "", age: "", location: "", price: "", description: "", name: "", contact: "", country: "" }); }}>View All Listings</button>
                <button style={styles.btnOutline} onClick={() => { setSubmitted(false); setFormData({ species: "", age: "", location: "", price: "", description: "", name: "", contact: "", country: "" }); }}>Add Another</button>
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
                <select style={{ ...styles.input, cursor: "pointer" }} value={formData.country} onChange={e => { setFormData({ ...formData, country: e.target.value, location: "" }); setFormCityInput(""); setShowFormCitySuggestions(false); }}>
                  <option value="">Select your country</option>
                  {COUNTRIES.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>City / Location *</label>
                <div style={{ position: "relative" }}>
                  <input
                    style={styles.input}
                    placeholder={formData.country ? "Type or select your city..." : "Select a country first..."}
                    value={formCityInput}
                    onChange={e => { setFormCityInput(e.target.value); setFormData({ ...formData, location: e.target.value }); setShowFormCitySuggestions(true); }}
                    onFocus={() => formData.country && setShowFormCitySuggestions(true)}
                    onBlur={() => setTimeout(() => setShowFormCitySuggestions(false), 200)}
                    disabled={!formData.country}
                  />
                  {showFormCitySuggestions && formData.country && filteredFormCitySuggestions.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#111", border: "1px solid #2a2a2a", borderTop: "none", maxHeight: 200, overflowY: "auto", zIndex: 10 }}>
                      {filteredFormCitySuggestions.map(c => (
                        <div
                          key={c}
                          onClick={() => { setFormCityInput(c); setFormData({ ...formData, location: c }); setShowFormCitySuggestions(false); }}
                          style={{ padding: "8px 12px", cursor: "pointer", color: "#888", fontSize: 13, borderBottom: "1px solid #1a1a1a", transition: "background 0.2s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#1a1a1a")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          {c}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea style={styles.textarea} placeholder="Health status, feeding habits, included equipment, reason for rehoming..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>WhatsApp / Contact *</label>
                <input style={styles.input} placeholder="+237 or +234 number" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
              </div>
              <button style={{ ...styles.submitBtn, opacity: (!formData.species || !formData.location || !formData.contact) ? 0.4 : 1 }} onClick={handleSubmit} disabled={!formData.species || !formData.location || !formData.contact}>Submit Listing →</button>
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
            <button style={styles.btnOutline} onClick={() => setPage("list")}>List a Reptile</button>
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
