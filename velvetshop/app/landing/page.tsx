"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default function HomePage() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.from("listings").select("*").eq("status", "approved").eq("featured", true).limit(6).then(({ data }) => setFeatured(data || []));
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box;margin:0;padding:0; }
        html { scroll-behavior:smooth; }
        body { background:#050505; }

        .hp { min-height:100vh;background:#050505;color:#e8e0d0;font-family:'DM Sans',sans-serif;overflow-x:hidden; }

        /* NAV */
        .nav { position:fixed;top:0;left:0;right:0;z-index:100;padding:20px 40px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(to bottom,rgba(5,5,5,0.95),transparent);backdrop-filter:blur(8px);border-bottom:1px solid rgba(255,255,255,0.04); }
        .nav-logo { display:flex;align-items:center;gap:12px;text-decoration:none;color:#e8e0d0; }
        .nav-logo-text { font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:700;letter-spacing:-0.02em; }
        .nav-links { display:flex;align-items:center;gap:32px; }
        .nav-link { color:#666;font-size:0.85rem;text-decoration:none;transition:color 0.2s;letter-spacing:0.02em; }
        .nav-link:hover { color:#e8e0d0; }
        .nav-cta { background:#c8ff00;color:#000;padding:10px 22px;border-radius:10px;font-size:0.85rem;font-weight:600;text-decoration:none;transition:background 0.2s,transform 0.15s; }
        .nav-cta:hover { background:#d4ff26;transform:translateY(-1px); }
        .nav-user { font-size:0.8rem;color:#555; }
        .nav-logout { background:none;border:1px solid #222;color:#555;padding:8px 16px;border-radius:10px;font-size:0.8rem;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.2s; }
        .nav-logout:hover { border-color:#555;color:#888; }
        @media(max-width:768px){ .nav-links{display:none;} .nav{padding:16px 20px;} }

        /* HERO */
        .hero { min-height:100vh;display:flex;align-items:center;position:relative;overflow:hidden;padding:120px 40px 80px; }
        .hero-bg { position:absolute;inset:0;z-index:0; }
        .hero-orb1 { position:absolute;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(200,255,0,0.08) 0%,transparent 60%);top:-200px;right:-200px;filter:blur(60px); }
        .hero-orb2 { position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(200,255,0,0.04) 0%,transparent 60%);bottom:-200px;left:-100px;filter:blur(80px); }
        .hero-grid { position:absolute;inset:0;background-image:linear-gradient(rgba(200,255,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(200,255,0,0.03) 1px,transparent 1px);background-size:80px 80px;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%); }
        .hero-inner { position:relative;z-index:1;max-width:1200px;margin:0 auto;width:100%; }
        .hero-badge { display:inline-flex;align-items:center;gap:8px;background:rgba(200,255,0,0.06);border:1px solid rgba(200,255,0,0.2);border-radius:20px;padding:6px 16px;font-size:0.75rem;color:#888;margin-bottom:32px;letter-spacing:0.05em;text-transform:uppercase; }
        .hero-badge-dot { width:6px;height:6px;border-radius:50%;background:#c8ff00;animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .hero-title { font-family:'Cormorant Garamond',serif;font-size:clamp(3.5rem,8vw,7rem);font-weight:900;line-height:0.95;letter-spacing:-0.03em;margin-bottom:32px; }
        .hero-title-line2 { color:#c8ff00;font-style:italic; }
        .hero-sub { font-size:1.1rem;color:#666;line-height:1.7;max-width:520px;margin-bottom:48px;font-weight:300; }
        .hero-btns { display:flex;gap:14px;flex-wrap:wrap; }
        .hero-btn-primary { background:#c8ff00;color:#000;padding:16px 36px;border-radius:14px;font-size:1rem;font-weight:700;text-decoration:none;transition:background 0.2s,transform 0.15s;display:inline-flex;align-items:center;gap:8px; }
        .hero-btn-primary:hover { background:#d4ff26;transform:translateY(-2px); }
        .hero-btn-secondary { background:none;border:1px solid #222;color:#888;padding:16px 36px;border-radius:14px;font-size:1rem;text-decoration:none;transition:all 0.2s; }
        .hero-btn-secondary:hover { border-color:#555;color:#e8e0d0; }
        .hero-stats { display:flex;gap:48px;margin-top:64px;padding-top:40px;border-top:1px solid #111;flex-wrap:wrap; }
        .stat { display:flex;flex-direction:column;gap:4px; }
        .stat-num { font-family:'Cormorant Garamond',serif;font-size:2.2rem;font-weight:700;color:#c8ff00;line-height:1; }
        .stat-label { font-size:0.78rem;color:#444;text-transform:uppercase;letter-spacing:0.08em; }

        /* MARQUEE */
        .marquee-wrap { overflow:hidden;border-top:1px solid #111;border-bottom:1px solid #111;padding:16px 0;background:#080808; }
        .marquee-track { display:flex;gap:0;animation:marquee 30s linear infinite;white-space:nowrap; }
        .marquee-item { font-family:'Cormorant Garamond',serif;font-size:1rem;color:#2a2a2a;padding:0 32px;display:flex;align-items:center;gap:12px;font-style:italic; }
        .marquee-dot { color:#c8ff00;font-style:normal; }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* SECTION */
        .section { padding:100px 40px;max-width:1200px;margin:0 auto; }
        @media(max-width:768px){ .section{padding:60px 20px;} }
        .section-label { font-size:0.72rem;color:#555;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:16px; }
        .section-title { font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:700;line-height:1.1;letter-spacing:-0.02em;margin-bottom:20px; }
        .section-title span { color:#c8ff00; }
        .section-sub { font-size:0.95rem;color:#555;line-height:1.7;max-width:500px;margin-bottom:48px; }

        /* FEATURED GRID */
        .feat-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px; }
        .feat-card { background:#0f0f0f;border:1px solid #1a1a1a;border-radius:20px;overflow:hidden;transition:border-color 0.25s,transform 0.25s;cursor:pointer;text-decoration:none;color:inherit; }
        .feat-card:hover { border-color:#c8ff00;transform:translateY(-4px); }
        .feat-img { height:200px;overflow:hidden;position:relative; }
        .feat-img img { width:100%;height:100%;object-fit:cover;transition:transform 0.4s; }
        .feat-card:hover .feat-img img { transform:scale(1.05); }
        .feat-img-ph { width:100%;height:100%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:4rem; }
        .feat-badge { position:absolute;top:12px;left:12px;background:#c8ff00;color:#000;font-size:0.65rem;font-weight:800;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:0.05em; }
        .feat-body { padding:20px; }
        .feat-species { font-weight:700;font-size:1rem;margin-bottom:4px; }
        .feat-name { font-size:0.8rem;color:#555;margin-bottom:12px; }
        .feat-row { display:flex;justify-content:space-between;align-items:center; }
        .feat-price { font-family:'Cormorant Garamond',serif;font-size:1.4rem;font-weight:700;color:#c8ff00; }
        .feat-tags { display:flex;gap:6px;flex-wrap:wrap; }
        .feat-tag { background:#1a1a1a;color:#666;font-size:0.7rem;padding:3px 8px;border-radius:20px; }

        /* HOW IT WORKS */
        .how-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px; }
        .how-card { background:#0a0a0a;border:1px solid #141414;border-radius:20px;padding:28px;transition:border-color 0.2s; }
        .how-card:hover { border-color:#222; }
        .how-num { font-family:'Cormorant Garamond',serif;font-size:3rem;font-weight:900;color:#1a1a1a;line-height:1;margin-bottom:16px; }
        .how-icon { font-size:1.8rem;margin-bottom:12px; }
        .how-title { font-weight:600;font-size:0.95rem;margin-bottom:8px;color:#e8e0d0; }
        .how-desc { font-size:0.82rem;color:#555;line-height:1.6; }

        /* CATEGORIES */
        .cat-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:16px; }
        @media(min-width:768px){ .cat-grid{grid-template-columns:repeat(4,1fr);} }
        .cat-card { background:#0a0a0a;border:1px solid #141414;border-radius:18px;padding:24px 20px;text-align:center;text-decoration:none;color:inherit;transition:border-color 0.2s,background 0.2s; }
        .cat-card:hover { border-color:#c8ff00;background:#0f0f0f; }
        .cat-icon { font-size:2.5rem;margin-bottom:10px; }
        .cat-name { font-weight:600;font-size:0.9rem;color:#e8e0d0; }
        .cat-count { font-size:0.75rem;color:#555;margin-top:4px; }

        /* CTA SECTION */
        .cta-wrap { margin:0 40px 100px;background:linear-gradient(135deg,#0f0f0f 0%,#111 50%,#0a0a0a 100%);border:1px solid #1a1a1a;border-radius:28px;padding:80px 60px;text-align:center;position:relative;overflow:hidden; }
        @media(max-width:768px){ .cta-wrap{margin:0 20px 60px;padding:48px 24px;} }
        .cta-orb { position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(200,255,0,0.06) 0%,transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);filter:blur(60px);pointer-events:none; }
        .cta-title { font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:700;line-height:1.1;letter-spacing:-0.02em;margin-bottom:16px;position:relative;z-index:1; }
        .cta-title span { color:#c8ff00; }
        .cta-sub { font-size:0.95rem;color:#555;margin-bottom:36px;position:relative;z-index:1; }
        .cta-btns { display:flex;gap:12px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1; }

        /* FOOTER */
        .footer { border-top:1px solid #111;padding:48px 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px; }
        @media(max-width:768px){ .footer{padding:32px 20px;flex-direction:column;text-align:center;} }
        .footer-logo { font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:700;color:#e8e0d0;display:flex;align-items:center;gap:8px; }
        .footer-links { display:flex;gap:24px;flex-wrap:wrap;justify-content:center; }
        .footer-link { font-size:0.8rem;color:#444;text-decoration:none;transition:color 0.2s; }
        .footer-link:hover { color:#888; }
        .footer-copy { font-size:0.75rem;color:#2a2a2a; }
      `}</style>

      <div className="hp">
        {/* Nav */}
        <nav className="nav">
          <Link href="/" className="nav-logo">
            <span style={{fontSize:"1.8rem"}}>🐍</span>
            <span className="nav-logo-text">VelvetViper</span>
          </Link>
          <div className="nav-links">
            <Link href="/browse" className="nav-link">Reptiles</Link>
            <Link href="/feeders" className="nav-link">Feeders</Link>
            <Link href="/order-tracking" className="nav-link">Track Order</Link>
            {user ? (
              <>
                <span className="nav-user">{user.email}</span>
                <button onClick={handleLogout} className="nav-logout">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-link">Sign in</Link>
                <Link href="/signup" className="nav-cta">Get Started</Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero */}
        <section className="hero">
          <div className="hero-bg">
            <div className="hero-orb1" />
            <div className="hero-orb2" />
            <div className="hero-grid" />
          </div>
          <div className="hero-inner">
            <div className="hero-badge"><span className="hero-badge-dot" />Premium Reptile Marketplace</div>
            <h1 className="hero-title">
              Find Your<br />
              <span className="hero-title-line2">Perfect Reptile</span><br />
              Companion.
            </h1>
            <p className="hero-sub">Browse hundreds of verified reptile listings from trusted breeders. Secure payments, real-time tracking, and AI-powered identification.</p>
            <div className="hero-btns">
              <Link href="/browse" className="hero-btn-primary">Browse Reptiles →</Link>
              <Link href="/feeders" className="hero-btn-secondary">Shop Feeders</Link>
            </div>
            <div className="hero-stats">
              <div className="stat"><span className="stat-num">200+</span><span className="stat-label">Verified Listings</span></div>
              <div className="stat"><span className="stat-num">50+</span><span className="stat-label">Species Available</span></div>
              <div className="stat"><span className="stat-num">100%</span><span className="stat-label">Live Arrival Guaranteed</span></div>
              <div className="stat"><span className="stat-num">24h</span><span className="stat-label">WhatsApp Support</span></div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <div className="marquee-wrap">
          <div className="marquee-track">
            {[...Array(2)].map((_, gi) => (
              ["Ball Python","Bearded Dragon","Crested Gecko","Leopard Gecko","Corn Snake","Blue-Tongued Skink","Veiled Chameleon","Green Iguana","Sulcata Tortoise","Panther Chameleon","Ackie Monitor","Boa Constrictor"].map((s, i) => (
                <span key={`${gi}-${i}`} className="marquee-item">{s}<span className="marquee-dot">✦</span></span>
              ))
            ))}
          </div>
        </div>

        {/* Featured */}
        <div className="section">
          <div className="section-label">Handpicked for you</div>
          <h2 className="section-title">Featured <span>Reptiles</span></h2>
          <p className="section-sub">Our most sought-after species, verified and ready for their new home.</p>
          {featured.length > 0 ? (
            <div className="feat-grid">
              {featured.map((listing) => (
                <Link key={listing.id} href="/browse" className="feat-card">
                  <div className="feat-img">
                    {listing.image_url
                      ? <img src={listing.image_url} alt={listing.species} />
                      : <div className="feat-img-ph">🐍</div>}
                    <span className="feat-badge">Featured</span>
                  </div>
                  <div className="feat-body">
                    <div className="feat-species">{listing.species}</div>
                    <div className="feat-name">{listing.name || "Unnamed"}</div>
                    <div className="feat-row">
                      <span className="feat-price">${listing.price}</span>
                      <div className="feat-tags">
                        {listing.gender && <span className="feat-tag">{listing.gender}</span>}
                        {listing.health && <span className="feat-tag">{listing.health}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="feat-grid">
              {["Bearded Dragon","Ball Python","Leopard Gecko","Crested Gecko","Corn Snake","Blue-Tongued Skink"].map((s) => (
                <Link key={s} href="/browse" className="feat-card">
                  <div className="feat-img"><div className="feat-img-ph">🐍</div><span className="feat-badge">Featured</span></div>
                  <div className="feat-body">
                    <div className="feat-species">{s}</div>
                    <div className="feat-name">Available now</div>
                    <div className="feat-row"><span className="feat-price">View →</span></div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div style={{textAlign:"center",marginTop:"40px"}}>
            <Link href="/browse" style={{color:"#c8ff00",fontSize:"0.9rem",textDecoration:"none",borderBottom:"1px solid rgba(200,255,0,0.3)",paddingBottom:"2px"}}>View all listings →</Link>
          </div>
        </div>

        {/* Categories */}
        <div className="section" style={{paddingTop:"0"}}>
          <div className="section-label">Shop by type</div>
          <h2 className="section-title">Browse <span>Categories</span></h2>
          <div className="cat-grid">
            {[
              { icon:"🦎", name:"Lizards", count:"40+ listings", href:"/browse" },
              { icon:"🐍", name:"Snakes", count:"60+ listings", href:"/browse" },
              { icon:"🐢", name:"Tortoises", count:"20+ listings", href:"/browse" },
              { icon:"🪳", name:"Feeder Insects", count:"12+ types", href:"/feeders" },
            ].map((c) => (
              <Link key={c.name} href={c.href} className="cat-card">
                <div className="cat-icon">{c.icon}</div>
                <div className="cat-name">{c.name}</div>
                <div className="cat-count">{c.count}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="section" style={{paddingTop:"0"}}>
          <div className="section-label">Simple process</div>
          <h2 className="section-title">How It <span>Works</span></h2>
          <div className="how-grid">
            {[
              { icon:"🔍", title:"Browse Listings", desc:"Search hundreds of verified reptile listings from trusted breeders across the country." },
              { icon:"🛒", title:"Add to Cart", desc:"Select your reptile, review details, and add to your cart. Compare multiple listings easily." },
              { icon:"💬", title:"Pay via WhatsApp", desc:"Choose your payment method and confirm directly with the seller via WhatsApp for safety." },
              { icon:"📦", title:"Track Your Order", desc:"Get real-time updates on your order status from payment through to doorstep delivery." },
            ].map((s, i) => (
              <div key={s.title} className="how-card">
                <div className="how-num">0{i+1}</div>
                <div className="how-icon">{s.icon}</div>
                <div className="how-title">{s.title}</div>
                <div className="how-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="cta-wrap">
          <div className="cta-orb" />
          <h2 className="cta-title">Ready to find your<br /><span>perfect reptile?</span></h2>
          <p className="cta-sub">Join thousands of reptile enthusiasts on VelvetViper today.</p>
          <div className="cta-btns">
            <Link href="/browse" className="hero-btn-primary">Browse Reptiles →</Link>
            {!user && <Link href="/signup" className="hero-btn-secondary">Create Account</Link>}
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-logo"><span>🐍</span> VelvetViper</div>
          <div className="footer-links">
            <Link href="/browse" className="footer-link">Reptiles</Link>
            <Link href="/feeders" className="footer-link">Feeders</Link>
            <Link href="/order-tracking" className="footer-link">Track Order</Link>
            <Link href="/login" className="footer-link">Sign In</Link>
            <Link href="/signup" className="footer-link">Sign Up</Link>
          </div>
          <div className="footer-copy">© 2026 VelvetViper. All rights reserved.</div>
        </footer>
      </div>
    </>
  );
}