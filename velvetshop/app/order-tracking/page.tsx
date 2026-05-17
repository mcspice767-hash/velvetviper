"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

const STAGES = [
  { key: "pending",              label: "Order Placed",           icon: "📋", desc: "Your order has been received" },
  { key: "payment_confirmed",    label: "Payment Confirmed",      icon: "✅", desc: "Payment has been verified" },
  { key: "preparing",           label: "Preparing for Shipment", icon: "📦", desc: "Your reptile is being prepared" },
  { key: "shipped",             label: "Shipped",                icon: "🚚", desc: "Your order is on its way" },
  { key: "out_for_delivery",    label: "Out for Delivery",       icon: "📍", desc: "Your order is nearby" },
];

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  payment_method: string;
  items: any[];
  total: number;
  tracking_status: string;
  tracking_updated_at: string;
  tracking_notes: string;
}

export default function OrderTrackingPage() {
  const router = useRouter();
  const [searchId, setSearchId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"search" | "mine">("mine");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check logged in user
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        fetchMyOrders(data.user.email!);
      } else {
        setTab("search");
      }
    });

    // Check if coming from order confirmation
    const last = localStorage.getItem("last_order");
    if (last) {
      try {
        const parsed = JSON.parse(last);
        setOrder(parsed);
      } catch {}
    }
  }, []);

  const fetchMyOrders = async (email: string) => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_email", email)
      .order("created_at", { ascending: false });
    setMyOrders(data || []);
  };

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);

    const clean = searchId.trim().replace("#", "").toLowerCase();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .ilike("id", `${clean}%`)
      .single();

    setLoading(false);
    if (error || !data) {
      setError("Order not found. Please check your order ID and try again.");
    } else {
      setOrder(data);
    }
  };

  const getStageIndex = (status: string) => STAGES.findIndex((s) => s.key === status);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box;margin:0;padding:0; }
        .tr { min-height:100vh;background:#050505;font-family:'DM Sans',sans-serif;color:#e8e0d0; }
        .orb { position:fixed;border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0; }
        .orb1 { width:500px;height:500px;background:radial-gradient(circle,rgba(200,255,0,0.06) 0%,transparent 70%);top:-150px;right:-100px; }
        .orb2 { width:300px;height:300px;background:radial-gradient(circle,rgba(200,255,0,0.03) 0%,transparent 70%);bottom:-100px;left:-50px; }
        .tnav { position:sticky;top:0;z-index:50;background:rgba(5,5,5,0.95);border-bottom:1px solid #1a1a1a;padding:18px 32px;display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(12px); }
        .tnav-logo { display:flex;align-items:center;gap:10px;text-decoration:none;color:#e8e0d0; }
        .tnav-title { font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:700; }
        .tinner { position:relative;z-index:1;max-width:720px;margin:0 auto;padding:40px 24px 80px; }
        .thead { text-align:center;margin-bottom:36px; }
        .ttitle { font-family:'Cormorant Garamond',serif;font-size:2.4rem;font-weight:700;letter-spacing:-0.02em;margin-bottom:8px; }
        .tsub { font-size:0.88rem;color:#555; }
        .ttabs { display:flex;background:#0f0f0f;border:1px solid #1c1c1c;border-radius:16px;padding:4px;margin-bottom:28px; }
        .ttab { flex:1;padding:11px;border:none;border-radius:12px;font-size:0.85rem;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.2s; }
        .ttab.active { background:#c8ff00;color:#000; }
        .ttab.inactive { background:none;color:#555; }
        .ttab.inactive:hover { color:#888; }
        .tsearch { display:flex;gap:10px;margin-bottom:24px; }
        .tsearch-input { flex:1;background:#0f0f0f;border:1px solid #1c1c1c;border-radius:14px;padding:14px 18px;color:#e8e0d0;font-size:0.9rem;font-family:'DM Sans',sans-serif;outline:none;transition:border-color 0.2s; }
        .tsearch-input:focus { border-color:#c8ff00; }
        .tsearch-input::placeholder { color:#333; }
        .tsearch-btn { background:#c8ff00;color:#000;border:none;border-radius:14px;padding:14px 20px;font-size:0.9rem;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;white-space:nowrap;transition:background 0.2s; }
        .tsearch-btn:hover { background:#d4ff26; }
        .terr { background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:14px 18px;font-size:0.83rem;color:#f87171;margin-bottom:16px; }
        .tcard { background:#0f0f0f;border:1px solid #1c1c1c;border-radius:24px;overflow:hidden;margin-bottom:16px; }
        .tcard-head { padding:24px 28px;border-bottom:1px solid #1c1c1c;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px; }
        .tcard-id { font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:700; }
        .tcard-id span { color:#c8ff00; }
        .tcard-date { font-size:0.75rem;color:#555;margin-top:3px; }
        .tbadge { display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:0.75rem;font-weight:600; }
        .tbadge-pending { background:rgba(100,100,100,0.1);border:1px solid #333;color:#666; }
        .tbadge-payment_confirmed { background:rgba(200,255,0,0.1);border:1px solid rgba(200,255,0,0.3);color:#c8ff00; }
        .tbadge-preparing { background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);color:#60a5fa; }
        .tbadge-shipped { background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);color:#c084fc; }
        .tbadge-out_for_delivery { background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.3);color:#eab308; }
        .tbadge-delivered { background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);color:#4ade80; }

        /* Timeline */
        .ttimeline { padding:28px; }
        .tstage { display:flex;gap:16px;position:relative; }
        .tstage:not(:last-child)::after { content:'';position:absolute;left:19px;top:40px;bottom:-8px;width:2px;background:#1a1a1a;z-index:0; }
        .tstage:not(:last-child).done::after { background:linear-gradient(to bottom,#c8ff00,#1a1a1a); }
        .tstage { margin-bottom:8px; }
        .tstage-icon { width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;position:relative;z-index:1;transition:all 0.3s; }
        .tstage-icon.done { background:rgba(200,255,0,0.15);border:2px solid rgba(200,255,0,0.4); }
        .tstage-icon.active { background:rgba(200,255,0,0.2);border:2px solid #c8ff00;box-shadow:0 0 16px rgba(200,255,0,0.3);animation:glow 2s infinite; }
        @keyframes glow { 0%,100%{box-shadow:0 0 12px rgba(200,255,0,0.3)} 50%{box-shadow:0 0 24px rgba(200,255,0,0.5)} }
        .tstage-icon.upcoming { background:#0d0d0d;border:2px solid #1c1c1c; }
        .tstage-icon.upcoming span { filter:grayscale(1);opacity:0.3; }
        .tstage-info { padding:8px 0 16px;flex:1; }
        .tstage-label { font-size:0.9rem;font-weight:600;margin-bottom:3px; }
        .tstage-label.done { color:#c8ff00; }
        .tstage-label.active { color:#c8ff00; }
        .tstage-label.upcoming { color:#333; }
        .tstage-desc { font-size:0.78rem;color:#444; }

        /* Order details */
        .tdetails { padding:0 28px 28px; }
        .tdetails-grid { display:grid;grid-template-columns:1fr 1fr;gap:10px; }
        @media(max-width:500px){.tdetails-grid{grid-template-columns:1fr;}}
        .tdetail { background:#080808;border:1px solid #141414;border-radius:12px;padding:12px 14px; }
        .tdetail-label { font-size:0.7rem;color:#444;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px; }
        .tdetail-val { font-size:0.85rem;color:#e8e0d0;font-weight:500; }
        .tdetail-val.lime { color:#c8ff00; }
        .titems { padding:0 28px 28px; }
        .titem { display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #0d0d0d; }
        .titem:last-child { border-bottom:none; }
        .titem-img { width:44px;height:44px;border-radius:10px;object-fit:cover;background:#1a1a1a;flex-shrink:0; }
        .titem-ph { width:44px;height:44px;border-radius:10px;background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0; }
        .titem-info { flex:1; }
        .titem-species { font-size:0.88rem;font-weight:600; }
        .titem-name { font-size:0.75rem;color:#555; }
        .titem-price { font-size:0.88rem;font-weight:700;color:#c8ff00; }

        /* My orders list */
        .torder-row { display:flex;justify-content:space-between;align-items:center;padding:16px;background:#0f0f0f;border:1px solid #1c1c1c;border-radius:16px;margin-bottom:10px;cursor:pointer;transition:border-color 0.2s; }
        .torder-row:hover { border-color:#333; }
        .torder-row-left { flex:1; }
        .torder-row-id { font-weight:700;font-size:0.9rem;color:#c8ff00; }
        .torder-row-date { font-size:0.75rem;color:#555;margin-top:3px; }
        .torder-row-items { font-size:0.78rem;color:#666;margin-top:3px; }
        .torder-row-price { font-weight:700;font-size:1rem;color:#e8e0d0;margin-right:12px; }
        .torder-row-arrow { color:#333;font-size:1.2rem; }
        .tempty { text-align:center;padding:48px 20px;color:#333; }
        .tempty-icon { font-size:3rem;margin-bottom:12px; }
        .twanote { background:rgba(37,211,102,0.05);border:1px solid rgba(37,211,102,0.15);border-radius:14px;padding:16px 18px;margin-top:16px;font-size:0.82rem;color:#666;line-height:1.7; }
        .twanote strong { color:#25d366; }
        .tback { display:inline-flex;align-items:center;gap:6px;font-size:0.82rem;color:#555;cursor:pointer;margin-bottom:20px;background:none;border:none;font-family:'DM Sans',sans-serif;transition:color 0.2s; }
        .tback:hover { color:#888; }
      `}</style>

      <div className="tr">
        <div className="orb orb1" /><div className="orb orb2" />
        <Navbar />

        <div className="tinner">
          <div className="thead">
            <h1 className="ttitle">Track Your Order</h1>
            <p className="tsub">Real-time updates on your reptile delivery</p>
          </div>

          {/* Tabs */}
          {user && (
            <div className="ttabs">
              <button className={`ttab ${tab === "mine" ? "active" : "inactive"}`} onClick={() => { setTab("mine"); setOrder(null); }}>
                My Orders ({myOrders.length})
              </button>
              <button className={`ttab ${tab === "search" ? "active" : "inactive"}`} onClick={() => setTab("search")}>
                Track by Order ID
              </button>
            </div>
          )}

          {/* Search tab */}
          {tab === "search" && (
            <>
              <div className="tsearch">
                <input className="tsearch-input" placeholder="Enter order ID (e.g. A1B2C3D4)"
                  value={searchId} onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                <button className="tsearch-btn" onClick={handleSearch} disabled={loading}>
                  {loading ? "..." : "Track"}
                </button>
              </div>
              {error && <div className="terr">⚠ {error}</div>}
            </>
          )}

          {/* My orders list */}
          {tab === "mine" && !order && (
            myOrders.length === 0 ? (
              <div className="tempty">
                <div className="tempty-icon">📦</div>
                <p>No orders yet. <Link href="/browse" style={{color:"#c8ff00",textDecoration:"none"}}>Start browsing →</Link></p>
              </div>
            ) : (
              myOrders.map((o) => (
                <div key={o.id} className="torder-row" onClick={() => setOrder(o)}>
                  <div className="torder-row-left">
                    <div className="torder-row-id">#{o.id.slice(0,8).toUpperCase()}</div>
                    <div className="torder-row-date">{formatDate(o.created_at)}</div>
                    <div className="torder-row-items">{o.items?.length || 0} item(s)</div>
                  </div>
                  <span className="torder-row-price">${o.total?.toFixed(2)}</span>
                  <span className={`tbadge tbadge-${o.tracking_status || "pending"}`}>
                    {STAGES.find(s => s.key === (o.tracking_status || "pending"))?.label || "Pending"}
                  </span>
                  <span className="torder-row-arrow" style={{marginLeft:"10px"}}>›</span>
                </div>
              ))
            )
          )}

          {/* Order detail view */}
          {order && (
            <>
              <button className="tback" onClick={() => setOrder(null)}>← {tab === "mine" ? "My Orders" : "Search"}</button>

              <div className="tcard">
                {/* Header */}
                <div className="tcard-head">
                  <div>
                    <div className="tcard-id">Order <span>#{order.id.slice(0,8).toUpperCase()}</span></div>
                    <div className="tcard-date">Placed {formatDate(order.created_at)}</div>
                  </div>
                  <span className={`tbadge tbadge-${order.tracking_status || "pending"}`}>
                    {STAGES.find(s => s.key === (order.tracking_status || "pending"))?.label || "Order Placed"}
                  </span>
                </div>

                {/* Timeline */}
                <div className="ttimeline">
                  {STAGES.map((stage, i) => {
                    const currentIdx = getStageIndex(order.tracking_status || "pending");
                    const isDone = i < currentIdx;
                    const isActive = i === currentIdx;
                    const isUpcoming = i > currentIdx;
                    return (
                      <div key={stage.key} className={`tstage ${isDone ? "done" : ""}`}>
                        <div className={`tstage-icon ${isDone ? "done" : isActive ? "active" : "upcoming"}`}>
                          <span>{stage.icon}</span>
                        </div>
                        <div className="tstage-info">
                          <div className={`tstage-label ${isDone ? "done" : isActive ? "active" : "upcoming"}`}>
                            {stage.label} {isActive && <span style={{fontSize:"0.7rem",color:"#c8ff00",fontWeight:400}}>← Current</span>}
                          </div>
                          <div className="tstage-desc">{stage.desc}</div>
                          {isActive && order.tracking_updated_at && (
                            <div style={{fontSize:"0.72rem",color:"#555",marginTop:"4px"}}>Updated {formatDate(order.tracking_updated_at)}</div>
                          )}
                          {isActive && order.tracking_notes && (
                            <div style={{fontSize:"0.78rem",color:"#888",marginTop:"6px",background:"#080808",padding:"8px 10px",borderRadius:"8px",border:"1px solid #141414"}}>{order.tracking_notes}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Items */}
                <div className="titems">
                  <div style={{fontSize:"0.72rem",color:"#444",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"12px"}}>Your Reptiles</div>
                  {(order.items || []).map((item: any, i: number) => (
                    <div key={i} className="titem">
                      {item.image_url
                        ? <img src={item.image_url} alt={item.species} className="titem-img" />
                        : <div className="titem-ph">🐍</div>}
                      <div className="titem-info">
                        <div className="titem-species">{item.species}</div>
                        <div className="titem-name">{item.name || "Unnamed"} × {item.quantity}</div>
                      </div>
                      <div className="titem-price">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                  <div style={{display:"flex",justifyContent:"space-between",paddingTop:"14px",borderTop:"1px solid #1a1a1a",marginTop:"8px"}}>
                    <span style={{fontWeight:700,fontSize:"0.9rem"}}>Total</span>
                    <span style={{fontWeight:800,fontSize:"1.1rem",color:"#c8ff00"}}>${order.total?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="tdetails">
                  <div style={{fontSize:"0.72rem",color:"#444",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"12px"}}>Delivery Details</div>
                  <div className="tdetails-grid">
                    <div className="tdetail"><div className="tdetail-label">Name</div><div className="tdetail-val">{order.customer_name}</div></div>
                    <div className="tdetail"><div className="tdetail-label">Phone</div><div className="tdetail-val">{order.customer_phone}</div></div>
                    <div className="tdetail" style={{gridColumn:"1/-1"}}><div className="tdetail-label">Ship to</div><div className="tdetail-val">{order.shipping_address}</div></div>
                    <div className="tdetail"><div className="tdetail-label">Payment</div><div className="tdetail-val lime">{order.payment_method}</div></div>
                  </div>
                </div>

                {/* WhatsApp note */}
                <div style={{padding:"0 28px 28px"}}>
                  <div className="twanote">
                    <strong>💬 Need an update?</strong> Contact the seller directly on WhatsApp for real-time delivery updates. Reference your order ID <strong style={{color:"#c8ff00"}}>#{order.id.slice(0,8).toUpperCase()}</strong>.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}