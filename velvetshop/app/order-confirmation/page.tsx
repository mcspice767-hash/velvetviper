"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  delivery_notes: string;
  payment_method: string;
  items: any[];
  total: number;
  status: string;
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("last_order");
    if (!saved) { router.push("/browse"); return; }
    try {
      setOrder(JSON.parse(saved));
    } catch {
      router.push("/browse");
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#c8ff00", fontSize: "2.5rem" }}>🐍</div>
      </div>
    );
  }

  if (!order) return null;

  const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box;margin:0;padding:0; }
        .cr { min-height:100vh;background:#050505;font-family:'DM Sans',sans-serif;color:#e8e0d0;padding:40px 24px 80px; }
        .orb { position:fixed;border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0; }
        .orb1 { width:500px;height:500px;background:radial-gradient(circle,rgba(200,255,0,0.07) 0%,transparent 70%);top:-150px;right:-100px; }
        .orb2 { width:300px;height:300px;background:radial-gradient(circle,rgba(200,255,0,0.04) 0%,transparent 70%);bottom:-100px;left:-50px; }
        .cinner { position:relative;z-index:1;max-width:640px;margin:0 auto; }
        .ctop { text-align:center;margin-bottom:40px; }
        .ccheck { width:80px;height:80px;border-radius:50%;background:rgba(200,255,0,0.1);border:2px solid rgba(200,255,0,0.4);display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 20px;animation:popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275); }
        @keyframes popIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
        .ctitle { font-family:'Cormorant Garamond',serif;font-size:2.5rem;font-weight:700;letter-spacing:-0.02em;margin-bottom:8px; }
        .csub { font-size:0.9rem;color:#555;line-height:1.7; }
        .cord { color:#c8ff00;font-weight:600; }
        .ccard { background:#0f0f0f;border:1px solid #1c1c1c;border-radius:24px;padding:28px;margin-bottom:16px; }
        .ccard-title { font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:700;color:#e8e0d0;margin-bottom:18px;padding-bottom:12px;border-bottom:1px solid #1c1c1c;display:flex;align-items:center;gap:8px; }
        .crow { display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid #0d0d0d;font-size:0.85rem; }
        .crow:last-child { border-bottom:none; }
        .clabel { color:#555; }
        .cval { color:#e8e0d0;font-weight:500;text-align:right;max-width:60%; }
        .citem { display:flex;gap:14px;align-items:center;padding:10px 0;border-bottom:1px solid #0d0d0d; }
        .citem:last-child { border-bottom:none; }
        .cimg { width:52px;height:52px;border-radius:10px;object-fit:cover;background:#1a1a1a;flex-shrink:0; }
        .cimg-ph { width:52px;height:52px;border-radius:10px;background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0; }
        .citem-info { flex:1; }
        .citem-species { font-weight:600;font-size:0.9rem; }
        .citem-name { font-size:0.78rem;color:#555;margin-top:2px; }
        .citem-price { font-weight:700;color:#c8ff00;white-space:nowrap; }
        .ctotal-row { display:flex;justify-content:space-between;align-items:center;padding:16px 0 0;border-top:1px solid #1c1c1c;margin-top:8px; }
        .ctotal-label { font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:700; }
        .ctotal-price { font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:700;color:#c8ff00; }
        .cstatus { display:inline-flex;align-items:center;gap:6px;background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.3);color:#eab308;padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:600; }
        .cstatus-dot { width:6px;height:6px;border-radius:50%;background:#eab308;animation:blink 1.5s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .cnote { background:rgba(200,255,0,0.04);border:1px solid rgba(200,255,0,0.12);border-radius:16px;padding:20px;margin-bottom:16px;font-size:0.83rem;color:#666;line-height:1.7; }
        .cnote strong { color:#c8ff00; }
        .cbtns { display:flex;flex-direction:column;gap:12px;margin-top:8px; }
        .cbtn-primary { display:block;width:100%;background:#c8ff00;color:#000;border:none;border-radius:14px;padding:16px;font-size:0.95rem;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;text-align:center;text-decoration:none;transition:background 0.2s,transform 0.15s; }
        .cbtn-primary:hover { background:#d4ff26;transform:translateY(-1px); }
        .cbtn-secondary { display:block;width:100%;background:none;border:1px solid #1c1c1c;border-radius:14px;padding:14px;font-size:0.88rem;color:#555;font-family:'DM Sans',sans-serif;cursor:pointer;text-align:center;text-decoration:none;transition:border-color 0.2s,color 0.2s; }
        .cbtn-secondary:hover { border-color:#333;color:#888; }
        .clogo { display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:40px;text-decoration:none; }
        .clogo-text { font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:700;color:#e8e0d0; }
        .pm-badge { display:inline-flex;align-items:center;gap:6px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:4px 10px;font-size:0.78rem;color:#888; }
      `}</style>

      <Navbar />
      <div className="cr">
        <div className="orb orb1" /><div className="orb orb2" />
        <div className="cinner">

          {/* Logo */}
          <Link href="/" className="clogo">
            <span style={{fontSize:"1.8rem"}}>🐍</span>
            <span className="clogo-text">VelvetViper</span>
          </Link>

          {/* Top */}
          <div className="ctop">
            <div className="ccheck">✓</div>
            <h1 className="ctitle">Order Confirmed!</h1>
            <p className="csub">
              Thank you, <strong style={{color:"#e8e0d0"}}>{order.customer_name}</strong>!<br />
              Your order <span className="cord">#{order.id.slice(0, 8).toUpperCase()}</span> has been placed.
            </p>
            <p className="csub" style={{marginTop:"8px"}}>{orderDate}</p>
          </div>

          {/* Status */}
          <div className="ccard">
            <div className="ccard-title">📦 Order Status</div>
            <div className="crow">
              <span className="clabel">Status</span>
              <span className="cval">
                <span className="cstatus"><span className="cstatus-dot" />Awaiting Payment Confirmation</span>
              </span>
            </div>
            <div className="crow">
              <span className="clabel">Payment Method</span>
              <span className="cval">
                <span className="pm-badge">💳 {order.payment_method}</span>
              </span>
            </div>
            <div className="crow">
              <span className="clabel">Order ID</span>
              <span className="cval" style={{fontFamily:"monospace",fontSize:"0.8rem",color:"#c8ff00"}}>#{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>

          {/* Items */}
          <div className="ccard">
            <div className="ccard-title">🐍 Your Reptiles</div>
            {order.items.map((item: any, i: number) => (
              <div key={i} className="citem">
                {item.image_url
                  ? <img src={item.image_url} alt={item.species} className="cimg" />
                  : <div className="cimg-ph">🐍</div>}
                <div className="citem-info">
                  <div className="citem-species">{item.species}</div>
                  <div className="citem-name">{item.name || "Unnamed"} · qty {item.quantity}</div>
                </div>
                <div className="citem-price">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
            <div className="ctotal-row">
              <span className="ctotal-label">Total</span>
              <span className="ctotal-price">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Delivery */}
          <div className="ccard">
            <div className="ccard-title">🚚 Delivery Details</div>
            <div className="crow">
              <span className="clabel">Name</span>
              <span className="cval">{order.customer_name}</span>
            </div>
            <div className="crow">
              <span className="clabel">Phone</span>
              <span className="cval">{order.customer_phone}</span>
            </div>
            <div className="crow">
              <span className="clabel">Ship to</span>
              <span className="cval">{order.shipping_address}</span>
            </div>
            {order.delivery_notes && (
              <div className="crow">
                <span className="clabel">Notes</span>
                <span className="cval">{order.delivery_notes}</span>
              </div>
            )}
          </div>

          {/* Next steps */}
          <div className="cnote">
            <strong>What happens next?</strong><br />
            1. Complete your payment via <strong>{order.payment_method}</strong> on WhatsApp with the seller.<br />
            2. Once payment is confirmed, your reptile(s) will be prepared for shipment.<br />
            3. You'll receive shipping updates via WhatsApp.
          </div>

          <div className="cbtns">
            <Link href="/browse" className="cbtn-primary">Continue Browsing</Link>
            <button className="cbtn-secondary" onClick={() => { localStorage.removeItem("last_order"); router.push("/"); }}>
              Back to Home
            </button>
          </div>

        </div>
      </div>
    </>
  );
}