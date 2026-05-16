"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

interface CartItem {
  id: string;
  species: string;
  name?: string;
  price: number;
  image_url?: string;
  quantity: number;
  country?: string;
}

const PAYMENT_METHODS = [
  {
    id: "paypal",
    label: "PayPal",
    color: "#003087",
    accent: "#009cde",
    emoji: "🅿",
    logo: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:32px"><path d="M7.5 21H4L6.5 3H13c3.5 0 5.5 1.5 5 4.5C17.5 11 14.5 12 11.5 12H9L7.5 21Z" fill="#009cde"/><path d="M9 14H6L4.5 21H8L9 14Z" fill="#003087"/><path d="M10 3H16.5c3.5 0 5.5 1.5 5 4.5C21 11 18 12 15 12H12.5L11 21H7.5L10 3Z" fill="#002f86" opacity="0.5"/></svg>`,
    whatsappMsg: (total: number, name: string) =>
      `Hi! I'd like to confirm my VelvetViper order.\n\n*Payment Method:* PayPal\n*Name:* ${name}\n*Total:* $${total.toFixed(2)}\n\nPlease send your PayPal details to complete payment.`,
  },
  {
    id: "cashapp",
    label: "Cash App",
    color: "#00d632",
    accent: "#00a825",
    emoji: "💵",
    logo: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:32px"><rect width="24" height="24" rx="6" fill="#00d632"/><text x="12" y="17" text-anchor="middle" font-size="13" font-weight="bold" fill="white" font-family="Arial">$</text></svg>`,
    whatsappMsg: (total: number, name: string) =>
      `Hi! I'd like to confirm my VelvetViper order.\n\n*Payment Method:* Cash App\n*Name:* ${name}\n*Total:* $${total.toFixed(2)}\n\nPlease send your $Cashtag to complete payment.`,
  },
  {
    id: "venmo",
    label: "Venmo",
    color: "#3d95ce",
    accent: "#008cff",
    emoji: "💙",
    logo: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:32px"><rect width="24" height="24" rx="6" fill="#3d95ce"/><text x="12" y="16" text-anchor="middle" font-size="8" font-weight="bold" fill="white" font-family="Arial">VENMO</text></svg>`,
    whatsappMsg: (total: number, name: string) =>
      `Hi! I'd like to confirm my VelvetViper order.\n\n*Payment Method:* Venmo\n*Name:* ${name}\n*Total:* $${total.toFixed(2)}\n\nPlease send your Venmo handle to complete payment.`,
  },
  {
    id: "applepay",
    label: "Apple Pay",
    color: "#000000",
    accent: "#555",
    emoji: "🍎",
    logo: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:32px"><rect width="24" height="24" rx="6" fill="#000"/><text x="12" y="16" text-anchor="middle" font-size="7" font-weight="bold" fill="white" font-family="Arial"> Pay</text></svg>`,
    whatsappMsg: (total: number, name: string) =>
      `Hi! I'd like to confirm my VelvetViper order.\n\n*Payment Method:* Apple Pay\n*Name:* ${name}\n*Total:* $${total.toFixed(2)}\n\nPlease share your Apple Pay details to complete payment.`,
  },
  {
    id: "chime",
    label: "Chime",
    color: "#00c08b",
    accent: "#00a87a",
    emoji: "🔔",
    logo: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:32px"><rect width="24" height="24" rx="6" fill="#00c08b"/><text x="12" y="16" text-anchor="middle" font-size="7" font-weight="bold" fill="white" font-family="Arial">CHIME</text></svg>`,
    whatsappMsg: (total: number, name: string) =>
      `Hi! I'd like to confirm my VelvetViper order.\n\n*Payment Method:* Chime\n*Name:* ${name}\n*Total:* $${total.toFixed(2)}\n\nPlease share your Chime Pay Anyone link to complete payment.`,
  },
];

const WHATSAPP_NUMBER = "+15056715584"; // ← Replace with your WhatsApp number

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState({ fullName: "", address: "", phone: "", notes: "" });
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    // Load cart from localStorage if using persistent cart
    // For now we use a demo cart if none found
    const saved = localStorage.getItem("velvetviper_cart");
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch {}
    } else {
      // Demo items so page isn't empty
      setCart([
        { id: "1", species: "Bearded Dragon", name: "Atlas", price: 250, quantity: 1, image_url: "https://images.unsplash.com/photo-1599599810694-b5ac4dd64b51?w=400" },
        { id: "2", species: "Ball Python", name: "Obsidian", price: 200, quantity: 1, image_url: "https://images.unsplash.com/photo-1604088113235-079ddf4ec872?w=400" },
      ]);
    }
  }, []);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const removeItem = (id: string) => {
    const updated = cart.filter((i) => i.id !== id);
    setCart(updated);
    localStorage.setItem("velvetviper_cart", JSON.stringify(updated));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.fullName.trim()) errors.fullName = "Full name is required";
    if (!form.address.trim()) errors.address = "Shipping address is required";
    if (!form.phone.trim()) errors.phone = "Phone number is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceed = () => {
    if (!validate()) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePaymentClick = (id: string) => {
    setSelectedPayment(id);
    setShowPaymentModal(true);
  };

  const handleWhatsApp = async () => {
    const method = PAYMENT_METHODS.find((m) => m.id === selectedPayment);
    if (!method) return;

    // 1. Save order to Supabase
    const orderData = {
      customer_name: form.fullName,
      customer_email: (await supabase.auth.getUser()).data.user?.email || "",
      customer_phone: form.phone,
      shipping_address: form.address,
      delivery_notes: form.notes,
      payment_method: method.label,
      items: cart,
      total,
      status: "pending",
    };

    const { data: savedOrder, error } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (error) {
      alert("Failed to save order: " + error.message);
      return;
    }

    // 2. Save to localStorage for confirmation page
    localStorage.setItem("last_order", JSON.stringify(savedOrder));

    // 3. Send confirmation email via Supabase Edge Function (optional - see note below)
    try {
      await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: savedOrder }),
      });
    } catch (_) {}

    // 4. Clear cart
    localStorage.removeItem("velvetviper_cart");

    // 5. Open WhatsApp
    const itemList = cart
      .map((i) => `• ${i.species} (${i.name || "Unnamed"}) × ${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`)
      .join("\n");
    const msg = `${method.whatsappMsg(total, form.fullName)}\n\n*Order ID:* #${savedOrder.id.slice(0, 8).toUpperCase()}\n\n*Items:*\n${itemList}\n\n*Ship to:* ${form.address}\n*Phone:* ${form.phone}${form.notes ? `\n*Notes:* ${form.notes}` : ""}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");

    // 6. Redirect to confirmation page
    setShowPaymentModal(false);
    router.push("/order-confirmation");
  };

  const activeMethod = PAYMENT_METHODS.find((m) => m.id === selectedPayment);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .co-root {
          min-height: 100vh;
          background: #080808;
          color: #e8e0d0;
          font-family: 'DM Sans', sans-serif;
        }

        /* NAV */
        .co-nav {
          position: sticky; top: 0; z-index: 50;
          background: rgba(8,8,8,0.95);
          border-bottom: 1px solid #1c1c1c;
          padding: 18px 32px;
          display: flex; align-items: center; justify-content: space-between;
          backdrop-filter: blur(12px);
        }
        .co-nav-logo { display:flex;align-items:center;gap:10px;text-decoration:none;color:#e8e0d0; }
        .co-nav-title { font-family:'Cormorant Garamond',serif;font-size:1.4rem;font-weight:700;letter-spacing:-0.01em; }
        .co-nav-step { font-size:0.78rem;color:#555;letter-spacing:0.08em;text-transform:uppercase; }

        /* PROGRESS */
        .co-progress {
          display:flex;align-items:center;justify-content:center;gap:0;
          padding: 28px 24px 0;
        }
        .co-step {
          display:flex;align-items:center;gap:10px;
        }
        .co-step-num {
          width:32px;height:32px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:0.8rem;font-weight:600;
          transition:all 0.3s;
        }
        .co-step-num.active { background:#c8ff00;color:#000; }
        .co-step-num.done { background:#c8ff00;color:#000; }
        .co-step-num.inactive { background:#1a1a1a;color:#555;border:1px solid #2a2a2a; }
        .co-step-label { font-size:0.8rem;font-weight:500; }
        .co-step-label.active { color:#c8ff00; }
        .co-step-label.inactive { color:#555; }
        .co-step-line { width:60px;height:1px;background:#2a2a2a;margin:0 8px; }
        .co-step-line.done { background:#c8ff00; }

        /* LAYOUT */
        .co-layout {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 24px 80px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media(min-width:900px){
          .co-layout { grid-template-columns: 1fr 380px; }
        }

        /* SECTION CARD */
        .co-card {
          background: #0f0f0f;
          border: 1px solid #1c1c1c;
          border-radius: 24px;
          padding: 32px;
        }
        .co-card-title {
          font-family:'Cormorant Garamond',serif;
          font-size:1.5rem;font-weight:700;
          letter-spacing:-0.01em;
          margin-bottom:24px;
          padding-bottom:16px;
          border-bottom:1px solid #1c1c1c;
        }

        /* CART ITEMS */
        .cart-item {
          display:flex;gap:16px;align-items:center;
          padding:14px 0;
          border-bottom:1px solid #141414;
        }
        .cart-item:last-child { border-bottom:none; }
        .cart-img {
          width:70px;height:70px;border-radius:14px;
          object-fit:cover;flex-shrink:0;
          background:#1a1a1a;
        }
        .cart-img-placeholder { width:70px;height:70px;border-radius:14px;background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0; }
        .cart-info { flex:1;min-width:0; }
        .cart-species { font-weight:600;font-size:0.95rem;color:#e8e0d0; }
        .cart-name { font-size:0.8rem;color:#555;margin-top:2px; }
        .cart-price { font-size:1rem;font-weight:600;color:#c8ff00;white-space:nowrap; }
        .cart-remove { background:none;border:none;color:#333;cursor:pointer;font-size:1.1rem;padding:4px;transition:color 0.2s; }
        .cart-remove:hover { color:#ef4444; }

        /* FORM */
        .form-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
        @media(max-width:600px){ .form-grid{grid-template-columns:1fr;} }
        .fg-full { grid-column:1/-1; }
        .form-field { display:flex;flex-direction:column;gap:6px; }
        .form-label { font-size:0.72rem;font-weight:500;color:#555;text-transform:uppercase;letter-spacing:0.08em; }
        .form-input {
          background:#080808;
          border:1px solid #222;
          border-radius:12px;
          padding:14px 16px;
          color:#e8e0d0;
          font-size:0.9rem;
          font-family:'DM Sans',sans-serif;
          outline:none;
          transition:border-color 0.2s,box-shadow 0.2s;
          width:100%;
        }
        .form-input:focus { border-color:#c8ff00;box-shadow:0 0 0 3px rgba(200,255,0,0.07); }
        .form-input.err { border-color:rgba(239,68,68,0.5); }
        .form-input::placeholder { color:#2a2a2a; }
        .form-textarea { resize:none;height:90px; }
        .form-error { font-size:0.75rem;color:#ef4444; }

        /* PROCEED BTN */
        .proceed-btn {
          width:100%;margin-top:28px;
          background:#c8ff00;color:#000;
          border:none;border-radius:14px;
          padding:17px;
          font-size:1rem;font-weight:600;font-family:'DM Sans',sans-serif;
          cursor:pointer;
          transition:background 0.2s,transform 0.15s;
          letter-spacing:0.01em;
        }
        .proceed-btn:hover { background:#d4ff26;transform:translateY(-1px); }
        .proceed-btn:active { transform:translateY(0); }

        /* PAYMENT METHODS */
        .pm-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
        .pm-btn {
          background:#0d0d0d;
          border:1.5px solid #222;
          border-radius:16px;
          padding:18px 14px;
          display:flex;flex-direction:column;align-items:center;gap:10px;
          cursor:pointer;
          transition:border-color 0.25s,background 0.25s,transform 0.15s,box-shadow 0.25s;
          position:relative;
          overflow:hidden;
        }
        .pm-btn::before {
          content:'';
          position:absolute;inset:0;
          opacity:0;
          transition:opacity 0.3s;
          border-radius:16px;
        }
        .pm-btn:hover { transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,0.4); }
        .pm-btn:hover::before { opacity:1; }
        .pm-btn-label { font-size:0.8rem;font-weight:600;letter-spacing:0.02em;position:relative;z-index:1; }
        .pm-logo-wrap { position:relative;z-index:1; }

        /* Hover colors per method */
        .pm-paypal:hover { border-color:#009cde;background:rgba(0,156,222,0.06); }
        .pm-paypal:hover .pm-btn-label { color:#009cde; }
        .pm-cashapp:hover { border-color:#00d632;background:rgba(0,214,50,0.06); }
        .pm-cashapp:hover .pm-btn-label { color:#00d632; }
        .pm-venmo:hover { border-color:#3d95ce;background:rgba(61,149,206,0.06); }
        .pm-venmo:hover .pm-btn-label { color:#3d95ce; }
        .pm-applepay:hover { border-color:#aaa;background:rgba(180,180,180,0.06); }
        .pm-applepay:hover .pm-btn-label { color:#ccc; }
        .pm-chime:hover { border-color:#00c08b;background:rgba(0,192,139,0.06); }
        .pm-chime:hover .pm-btn-label { color:#00c08b; }

        /* ORDER SUMMARY */
        .summary-row {
          display:flex;justify-content:space-between;align-items:center;
          font-size:0.88rem;color:#666;
          padding:6px 0;
        }
        .summary-total {
          display:flex;justify-content:space-between;align-items:center;
          margin-top:16px;padding-top:16px;
          border-top:1px solid #1c1c1c;
        }
        .summary-total-label { font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:700; }
        .summary-total-price { font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:700;color:#c8ff00; }

        .back-btn {
          background:none;border:1px solid #222;border-radius:12px;
          padding:12px 20px;color:#666;font-size:0.85rem;font-family:'DM Sans',sans-serif;
          cursor:pointer;transition:border-color 0.2s,color 0.2s;margin-bottom:16px;
        }
        .back-btn:hover { border-color:#555;color:#e8e0d0; }

        .empty-cart {
          text-align:center;padding:60px 20px;
        }
        .empty-cart-icon { font-size:4rem;margin-bottom:16px; }
        .empty-cart-text { color:#555;margin-bottom:24px; }

        /* MODAL OVERLAY */
        .modal-overlay {
          position:fixed;inset:0;
          background:rgba(0,0,0,0.85);
          backdrop-filter:blur(8px);
          z-index:200;
          display:flex;align-items:center;justify-content:center;
          padding:20px;
          animation:fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }

        .modal-box {
          background:#111;
          border:1px solid #222;
          border-radius:28px;
          width:100%;max-width:380px;
          overflow:hidden;
          animation:slideUp 0.25s ease;
        }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }

        .modal-header {
          padding:28px 28px 20px;
          text-align:center;
          border-bottom:1px solid #1c1c1c;
        }
        .modal-method-logo {
          width:64px;height:64px;border-radius:16px;
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 14px;
          font-size:2rem;
        }
        .modal-title {
          font-family:'Cormorant Garamond',serif;
          font-size:1.4rem;font-weight:700;
          margin-bottom:6px;
        }
        .modal-subtitle { font-size:0.82rem;color:#555;line-height:1.5; }

        .modal-body { padding:24px 28px; }

        .modal-info-row {
          display:flex;justify-content:space-between;align-items:center;
          padding:10px 0;border-bottom:1px solid #161616;
          font-size:0.85rem;
        }
        .modal-info-row:last-child { border-bottom:none; }
        .modal-info-label { color:#555; }
        .modal-info-value { font-weight:600;color:#e8e0d0; }
        .modal-total-value { font-size:1.1rem;color:#c8ff00;font-weight:700; }

        .modal-note {
          background:rgba(200,255,0,0.05);
          border:1px solid rgba(200,255,0,0.15);
          border-radius:12px;
          padding:12px 14px;
          font-size:0.78rem;
          color:#888;
          line-height:1.5;
          margin-top:16px;
        }
        .modal-note strong { color:#c8ff00; }

        .modal-footer {
          padding:0 28px 28px;
          display:flex;flex-direction:column;gap:10px;
        }
        .modal-confirm-btn {
          width:100%;
          border:none;border-radius:14px;padding:16px;
          font-size:0.95rem;font-weight:700;font-family:'DM Sans',sans-serif;
          cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:10px;
          transition:opacity 0.2s,transform 0.15s;
        }
        .modal-confirm-btn:hover { opacity:0.9;transform:translateY(-1px); }
        .modal-cancel-btn {
          width:100%;background:none;
          border:1px solid #1c1c1c;border-radius:14px;padding:14px;
          font-size:0.85rem;color:#555;font-family:'DM Sans',sans-serif;
          cursor:pointer;transition:border-color 0.2s,color 0.2s;
        }
        .modal-cancel-btn:hover { border-color:#333;color:#888; }

        .wa-icon { font-size:1.2rem; }
      `}</style>

      <div className="co-root">
        {/* Nav */}
        <nav className="co-nav">
          <Link href="/browse" className="co-nav-logo">
            <span style={{fontSize:"1.8rem"}}>🐍</span>
            <span className="co-nav-title">VelvetViper</span>
          </Link>
          <span className="co-nav-step">Secure Checkout</span>
        </nav>

        {/* Progress */}
        <div className="co-progress">
          <div className="co-step">
            <div className={`co-step-num ${step >= 1 ? "active" : "inactive"}`}>{step > 1 ? "✓" : "1"}</div>
            <span className={`co-step-label ${step === 1 ? "active" : "inactive"}`}>Your Details</span>
          </div>
          <div className={`co-step-line ${step > 1 ? "done" : ""}`} />
          <div className="co-step">
            <div className={`co-step-num ${step === 2 ? "active" : "inactive"}`}>2</div>
            <span className={`co-step-label ${step === 2 ? "active" : "inactive"}`}>Payment</span>
          </div>
        </div>

        <div className="co-layout">
          {/* LEFT COLUMN */}
          <div>
            {/* Cart summary */}
            <div className="co-card" style={{marginBottom:"24px"}}>
              <div className="co-card-title">🛒 Order Summary ({itemCount} {itemCount === 1 ? "item" : "items"})</div>
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">🛒</div>
                  <p className="empty-cart-text">Your cart is empty</p>
                  <Link href="/browse" style={{color:"#c8ff00",textDecoration:"none",fontSize:"0.9rem"}}>← Continue browsing</Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.species} className="cart-img" />
                      : <div className="cart-img-placeholder">🐍</div>}
                    <div className="cart-info">
                      <div className="cart-species">{item.species}</div>
                      <div className="cart-name">{item.name || "Unnamed"} · qty {item.quantity}</div>
                    </div>
                    <div className="cart-price">${(item.price * item.quantity).toFixed(2)}</div>
                    <button className="cart-remove" onClick={() => removeItem(item.id)} title="Remove">✕</button>
                  </div>
                ))
              )}
            </div>

            {/* Step 1: Details form */}
            {step === 1 && (
              <div className="co-card">
                <div className="co-card-title">📋 Your Details</div>
                <div className="form-grid">
                  <div className="form-field fg-full">
                    <label className="form-label">Full Name *</label>
                    <input className={`form-input ${formErrors.fullName ? "err" : ""}`} placeholder="John Doe"
                      value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} />
                    {formErrors.fullName && <span className="form-error">{formErrors.fullName}</span>}
                  </div>
                  <div className="form-field fg-full">
                    <label className="form-label">Shipping Address *</label>
                    <input className={`form-input ${formErrors.address ? "err" : ""}`} placeholder="123 Main St, City, State, ZIP"
                      value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
                    {formErrors.address && <span className="form-error">{formErrors.address}</span>}
                  </div>
                  <div className="form-field fg-full">
                    <label className="form-label">Phone Number *</label>
                    <input className={`form-input ${formErrors.phone ? "err" : ""}`} placeholder="+1 (555) 000-0000" type="tel"
                      value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                    {formErrors.phone && <span className="form-error">{formErrors.phone}</span>}
                  </div>
                  <div className="form-field fg-full">
                    <label className="form-label">Special Delivery Notes</label>
                    <textarea className="form-input form-textarea" placeholder="Any special instructions for delivery..."
                      value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} />
                  </div>
                </div>
                <button className="proceed-btn" onClick={handleProceed} disabled={cart.length === 0}>
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="co-card">
                <button className="back-btn" onClick={() => setStep(1)}>← Back to Details</button>
                <div className="co-card-title">💳 Choose Payment Method</div>
                <p style={{fontSize:"0.83rem",color:"#555",marginBottom:"20px",lineHeight:"1.6"}}>
                  Select your preferred payment method. You'll be directed to confirm via WhatsApp.
                </p>
                <div className="pm-grid">
                  {PAYMENT_METHODS.map((method) => (
                    <button key={method.id} className={`pm-btn pm-${method.id}`}
                      onClick={() => handlePaymentClick(method.id)}>
                      <div className="pm-logo-wrap" dangerouslySetInnerHTML={{__html: method.logo}} />
                      <span className="pm-btn-label">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Order total */}
          <div>
            <div className="co-card" style={{position:"sticky",top:"80px"}}>
              <div className="co-card-title">🧾 Total</div>
              {cart.map((item) => (
                <div key={item.id} className="summary-row">
                  <span>{item.species} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="summary-row">
                <span>Shipping</span>
                <span style={{color:"#c8ff00"}}>To be arranged</span>
              </div>
              <div className="summary-total">
                <span className="summary-total-label">Total</span>
                <span className="summary-total-price">${total.toFixed(2)}</span>
              </div>

              <div style={{marginTop:"24px",padding:"16px",background:"rgba(200,255,0,0.04)",border:"1px solid rgba(200,255,0,0.1)",borderRadius:"14px"}}>
                <p style={{fontSize:"0.75rem",color:"#666",lineHeight:"1.6"}}>
                  🔒 <strong style={{color:"#888"}}>Secure checkout.</strong> Payment is confirmed directly with the seller via WhatsApp for your safety.
                </p>
              </div>

              {step === 1 && (
                <div style={{marginTop:"16px",textAlign:"center"}}>
                  <Link href="/browse" style={{fontSize:"0.8rem",color:"#444",textDecoration:"none"}}>← Continue shopping</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT CONFIRMATION MODAL */}
      {showPaymentModal && activeMethod && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-method-logo" style={{background: activeMethod.color + "22", border: `1px solid ${activeMethod.color}44`}}
                dangerouslySetInnerHTML={{__html: activeMethod.logo}} />
              <div className="modal-title">Confirm with {activeMethod.label}</div>
              <div className="modal-subtitle">Review your order before continuing to WhatsApp</div>
            </div>

            <div className="modal-body">
              <div className="modal-info-row">
                <span className="modal-info-label">Name</span>
                <span className="modal-info-value">{form.fullName}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-info-label">Ship to</span>
                <span className="modal-info-value" style={{maxWidth:"180px",textAlign:"right",fontSize:"0.8rem"}}>{form.address}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-info-label">Items</span>
                <span className="modal-info-value">{itemCount} reptile{itemCount > 1 ? "s" : ""}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-info-label">Payment via</span>
                <span className="modal-info-value">{activeMethod.label}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-info-label">Total</span>
                <span className="modal-info-value modal-total-value">${total.toFixed(2)}</span>
              </div>

              <div className="modal-note">
                Clicking <strong>Continue to WhatsApp</strong> will open a chat with the seller. Share your <strong>{activeMethod.label}</strong> payment details to complete your order.
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-confirm-btn"
                style={{background: activeMethod.color, color: activeMethod.id === "cashapp" || activeMethod.id === "chime" ? "#000" : "#fff"}}
                onClick={handleWhatsApp}>
                <span className="wa-icon">💬</span>
                Continue to WhatsApp
              </button>
              <button className="modal-cancel-btn" onClick={() => setShowPaymentModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}