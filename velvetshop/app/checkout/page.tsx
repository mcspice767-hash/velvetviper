"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";

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
    id: "zelle",
    label: "Zelle",
    color: "#7414ca",
    accent: "#5c0fa3",
    emoji: "🏦",
    logo: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:32px"><rect width="24" height="24" rx="6" fill="#7414ca"/><text x="12" y="17" text-anchor="middle" font-size="12" font-weight="bold" fill="white" font-family="Georgia, serif">z</text></svg>`,
    whatsappMsg: (total: number, name: string) =>
      `Hi! I'd like to confirm my VelvetViper order.\n\n*Payment Method:* Zelle\n*Name:* ${name}\n*Total:* $${total.toFixed(2)}\n\nPlease send your Zelle details to complete payment.`,
  },
  {
    id: "bitcoin",
    label: "Bitcoin",
    color: "#f7931a",
    accent: "#b76709",
    emoji: "🪙",
    logo: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:32px"><rect width="24" height="24" rx="6" fill="#f7931a"/><text x="12" y="17" text-anchor="middle" font-size="13" font-weight="bold" fill="white" font-family="Georgia, serif">₿</text></svg>`,
    whatsappMsg: (total: number, name: string) =>
      `Hi! I'd like to confirm my VelvetViper order.\n\n*Payment Method:* Bitcoin (Crypto)\n*Name:* ${name}\n*Total:* $${total.toFixed(2)}\n\nPlease send your Bitcoin wallet address to complete payment.`,
  },
  {
    id: "banktransfer",
    label: "Bank Transfer",
    color: "#4f46e5",
    accent: "#3730a3",
    emoji: "🏛",
    logo: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:32px"><rect width="24" height="24" rx="6" fill="#4f46e5"/><text x="12" y="17" text-anchor="middle" font-size="13" font-weight="bold" fill="white" font-family="Arial">🏛</text></svg>`,
    whatsappMsg: (total: number, name: string) =>
      `Hi! I'd like to confirm my VelvetViper order.\n\n*Payment Method:* Bank Transfer\n*Name:* ${name}\n*Total:* $${total.toFixed(2)}\n\nPlease send your Bank Transfer Routing & Account details to complete payment.`,
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
  const [giftCode, setGiftCode] = useState("");
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");

  const handleGiftCard = async () => {
    if (!giftCode.trim()) {
      setGiftMessage("Please enter a gift card code");
      return;
    }

    setGiftLoading(true);
    setGiftMessage("");

    try {
      const { data, error } = await supabase
        .from("gift_cards")
        .select("*")
        .eq("code", giftCode.toUpperCase())
        .eq("used", false)
        .single();

      if (error || !data) {
        setGiftMessage("Invalid or already used gift card");
        setGiftLoading(false);
        return;
      }

      const userObj = await supabase.auth.getUser();
      const userEmail = userObj.data.user?.email || "anonymous_buyer";

      const { error: updateError } = await supabase
        .from("gift_cards")
        .update({ used: true, used_by: userEmail })
        .eq("id", data.id);

      if (updateError) {
        setGiftMessage("Redemption failed: " + updateError.message);
        setGiftLoading(false);
        return;
      }

      setGiftMessage("✅ Gift card accepted! Order total is covered.");

      const orderData = {
        customer_name: form.fullName,
        customer_email: userEmail,
        customer_phone: form.phone,
        shipping_address: form.address,
        delivery_notes: form.notes,
        payment_method: `Gift Card (${giftCode.toUpperCase()})`,
        items: cart,
        total,
        status: "paid",
      };

      const { data: savedOrder, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        alert("Failed to save order: " + orderError.message);
        setGiftLoading(false);
        return;
      }

      try {
        await fetch("/api/send-order-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: savedOrder }),
        });
      } catch (_) { }

      localStorage.removeItem("velvetviper_cart");
      localStorage.setItem("last_order", JSON.stringify(savedOrder));

      setTimeout(() => {
        router.push("/order-confirmation");
      }, 1500);

    } catch (err: any) {
      setGiftMessage("An error occurred: " + err.message);
    } finally {
      setGiftLoading(false);
    }
  };

  useEffect(() => {
    // Load cart from localStorage if using persistent cart
    // For now we use a demo cart if none found
    const saved = localStorage.getItem("velvetviper_cart");
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch { }
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
    } catch (_) { }

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

  const handleLiveChatPayment = async () => {
    const method = PAYMENT_METHODS.find((m) => m.id === selectedPayment);
    if (!method) return;

    // 1. Save order to Supabase
    const orderData = {
      customer_name: form.fullName,
      customer_email: (await supabase.auth.getUser()).data.user?.email || "",
      customer_phone: form.phone,
      shipping_address: form.address,
      delivery_notes: form.notes,
      payment_method: `${method.label} (via Live Chat)`,
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

    // 3. Send confirmation email
    try {
      await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: savedOrder }),
      });
    } catch (_) { }

    // 4. Clear cart
    localStorage.removeItem("velvetviper_cart");

    // 5. Open Live Chat with pre-filled message
    const itemList = cart
      .map((i) => `• ${i.species} (${i.name || "Unnamed"}) × ${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`)
      .join("\n");

    const msg = `Hi! I'd like to confirm my VelvetViper order.\n\n*Payment Method:* ${method.label} (via Live Chat)\n*Name:* ${form.fullName}\n*Total:* $${total.toFixed(2)}\n\n*Order ID:* #${savedOrder.id.slice(0, 8).toUpperCase()}\n\n*Items:*\n${itemList}\n\n*Ship to:* ${form.address}\n*Phone:* ${form.phone}${form.notes ? `\n*Notes:* ${form.notes}` : ""}`;

    if (typeof window !== "undefined" && (window as any).smartsupp) {
      try {
        (window as any).smartsupp("chat:open");
        (window as any).smartsupp("chat:message", msg);
      } catch (chatError) {
        console.error("Smartsupp Error:", chatError);
      }
    } else {
      alert("Note: Smartsupp Live Chat widget was not loaded. Your order has still been recorded! Copy this details and share when chat is available:\n\n" + msg);
    }

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

        /* === MOBILE-FIRST CHECKOUT STYLES === */
        .co-root {
          min-height: 100vh;
          background: #080808;
          color: #e8e0d0;
          font-family: 'DM Sans', sans-serif;
          -webkit-tap-highlight-color: transparent;
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
          padding: clamp(16px, 4vw, 28px) clamp(12px, 4vw, 24px) 0;
        }
        .co-step { display:flex;align-items:center;gap:8px; }
        .co-step-num {
          width:32px;height:32px;min-width:32px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:0.8rem;font-weight:600;
          transition:all 0.3s;
        }
        .co-step-num.active { background:#c8ff00;color:#000; }
        .co-step-num.done { background:#c8ff00;color:#000; }
        .co-step-num.inactive { background:#1a1a1a;color:#555;border:1px solid #2a2a2a; }
        .co-step-label { font-size:0.78rem;font-weight:500; }
        .co-step-label.active { color:#c8ff00; }
        .co-step-label.inactive { color:#555; }
        .co-step-line { width:clamp(30px, 8vw, 60px);height:1px;background:#2a2a2a;margin:0 6px; }
        .co-step-line.done { background:#c8ff00; }

        /* LAYOUT */
        .co-layout {
          max-width: 1100px;
          margin: 0 auto;
          padding: clamp(16px, 4vw, 40px) clamp(12px, 4vw, 24px) clamp(40px, 10vw, 80px);
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(16px, 3vw, 32px);
        }
        @media(min-width:900px){
          .co-layout { grid-template-columns: 1fr 380px; }
        }

        /* SECTION CARD */
        .co-card {
          background: #0f0f0f;
          border: 1px solid #1c1c1c;
          border-radius: clamp(16px, 3vw, 24px);
          padding: clamp(16px, 4vw, 32px);
        }
        .co-card-title {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(1.2rem, 3vw, 1.5rem);font-weight:700;
          letter-spacing:-0.01em;
          margin-bottom:clamp(14px, 3vw, 24px);
          padding-bottom:14px;
          border-bottom:1px solid #1c1c1c;
        }

        /* CART ITEMS */
        .cart-item {
          display:flex;gap:12px;align-items:center;
          padding:14px 0;
          border-bottom:1px solid #141414;
        }
        .cart-item:last-child { border-bottom:none; }
        .cart-img {
          width:60px;height:60px;border-radius:12px;
          object-fit:cover;flex-shrink:0;
          background:#1a1a1a;
        }
        .cart-img-placeholder { width:60px;height:60px;border-radius:12px;background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0; }
        .cart-info { flex:1;min-width:0; }
        .cart-species { font-weight:600;font-size:0.9rem;color:#e8e0d0; }
        .cart-name { font-size:0.78rem;color:#555;margin-top:2px; }
        .cart-price { font-size:0.95rem;font-weight:600;color:#c8ff00;white-space:nowrap; }
        .cart-remove { background:none;border:none;color:#333;cursor:pointer;font-size:1.2rem;padding:8px;min-width:40px;min-height:40px;display:flex;align-items:center;justify-content:center;transition:color 0.2s; }
        .cart-remove:hover { color:#ef4444; }

        /* FORM */
        .form-grid { display:grid;grid-template-columns:1fr;gap:14px; }
        @media(min-width:520px){ .form-grid{grid-template-columns:1fr 1fr;gap:16px;} }
        .fg-full { grid-column:1/-1; }
        .form-field { display:flex;flex-direction:column;gap:6px; }
        .form-label { font-size:0.72rem;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:0.08em; }
        .form-input {
          background:#080808;
          border:1px solid #222;
          border-radius:12px;
          padding:15px 16px;
          color:#e8e0d0;
          font-size:1rem; /* Prevent iOS zoom-in on focus */
          font-family:'DM Sans',sans-serif;
          outline:none;
          transition:border-color 0.2s,box-shadow 0.2s;
          width:100%;
          min-height:52px;
          -webkit-appearance:none;
          appearance:none;
        }
        .form-input:focus { border-color:#c8ff00;box-shadow:0 0 0 3px rgba(200,255,0,0.07); }
        .form-input.err { border-color:rgba(239,68,68,0.5); }
        .form-input::placeholder { color:#444; }
        .form-textarea { resize:vertical;min-height:90px; }
        .form-error { font-size:0.78rem;color:#ef4444;margin-top:2px; }

        /* PROCEED BTN */
        .proceed-btn {
          width:100%;margin-top:24px;
          background:#c8ff00;color:#000;
          border:none;border-radius:14px;
          padding:18px;
          font-size:1rem;font-weight:700;font-family:'DM Sans',sans-serif;
          cursor:pointer;
          min-height:56px;
          transition:background 0.2s,transform 0.15s;
          letter-spacing:0.01em;
          -webkit-appearance:none;
        }
        .proceed-btn:active { background:#d4ff26;transform:scale(0.98); }

        /* PAYMENT METHODS */
        .pm-grid { display:grid;grid-template-columns:1fr 1fr;gap:10px; }
        @media(min-width:480px){ .pm-grid{gap:12px;} }
        .pm-btn {
          background:#0d0d0d;
          border:1.5px solid #222;
          border-radius:14px;
          padding:16px 12px;
          display:flex;flex-direction:column;align-items:center;gap:8px;
          cursor:pointer;
          transition:border-color 0.2s,background 0.2s;
          position:relative;
          overflow:hidden;
          min-height:88px;
          -webkit-tap-highlight-color:transparent;
        }
        .pm-btn:active { transform:scale(0.96);opacity:0.85; }
        .pm-btn-label { font-size:0.78rem;font-weight:600;letter-spacing:0.02em;position:relative;z-index:1;text-align:center; }
        .pm-logo-wrap { position:relative;z-index:1; }

        /* Hover colors per method */
        .pm-paypal:hover { border-color:#009cde;background:rgba(0,156,222,0.06); }
        .pm-paypal:hover .pm-btn-label { color:#009cde; }
        .pm-cashapp:hover { border-color:#00d632;background:rgba(0,214,50,0.06); }
        .pm-cashapp:hover .pm-btn-label { color:#00d632; }
        .pm-venmo:hover { border-color:#3d95ce;background:rgba(61,149,206,0.06); }
        .pm-venmo:hover .pm-btn-label { color:#3d95ce; }
        .pm-zelle:hover { border-color:#7414ca;background:rgba(116,20,202,0.06); }
        .pm-zelle:hover .pm-btn-label { color:#7414ca; }
        .pm-bitcoin:hover { border-color:#f7931a;background:rgba(247,147,26,0.06); }
        .pm-bitcoin:hover .pm-btn-label { color:#f7931a; }
        .pm-banktransfer:hover { border-color:#4f46e5;background:rgba(79,70,229,0.06); }
        .pm-banktransfer:hover .pm-btn-label { color:#4f46e5; }
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
          padding:13px 20px;color:#666;font-size:0.88rem;font-family:'DM Sans',sans-serif;
          cursor:pointer;transition:border-color 0.2s,color 0.2s;margin-bottom:16px;
          min-height:48px;display:inline-flex;align-items:center;
          -webkit-appearance:none;
        }
        .back-btn:active { border-color:#555;color:#e8e0d0; }

        .empty-cart {
          text-align:center;padding:60px 20px;
        }
        .empty-cart-icon { font-size:4rem;margin-bottom:16px; }
        .empty-cart-text { color:#555;margin-bottom:24px; }

        /* MODAL OVERLAY */
        .modal-overlay {
          position:fixed;inset:0;
          background:rgba(0,0,0,0.88);
          backdrop-filter:blur(8px);
          z-index:200;
          display:flex;align-items:flex-end;justify-content:center;
          animation:fadeIn 0.2s ease;
          padding-bottom:env(safe-area-inset-bottom);
        }
        @media(min-width:560px) {
          .modal-overlay { align-items:center; padding:20px; }
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }

        .modal-box {
          background:#111;
          border:1px solid #222;
          border-radius:24px 24px 0 0;
          width:100%;max-width:100%;
          max-height:92vh;
          overflow-y:auto;
          -webkit-overflow-scrolling:touch;
          overscroll-behavior:contain;
          animation:slideUpModal 0.28s cubic-bezier(0.32,0.72,0,1);
        }
        @media(min-width:560px) {
          .modal-box {
            border-radius:24px;
            max-width:420px;
            max-height:90vh;
            animation:slideUp 0.25s ease;
          }
        }
        @keyframes slideUpModal { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }

        .modal-header {
          padding:20px 20px 16px;
          text-align:center;
          border-bottom:1px solid #1c1c1c;
          position:sticky;top:0;background:#111;z-index:1;
        }
        @media(min-width:560px){ .modal-header{ padding:28px 28px 20px;position:relative; } }
        .modal-method-logo {
          width:56px;height:56px;border-radius:14px;
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 12px;
          font-size:1.8rem;
        }
        .modal-title {
          font-family:'Cormorant Garamond',serif;
          font-size:1.3rem;font-weight:700;
          margin-bottom:4px;
        }
        .modal-subtitle { font-size:0.8rem;color:#555;line-height:1.5; }

        .modal-body { padding:16px 20px; }
        @media(min-width:560px){ .modal-body{ padding:24px 28px; } }

        .modal-info-row {
          display:flex;justify-content:space-between;align-items:flex-start;
          padding:11px 0;border-bottom:1px solid #161616;
          font-size:0.85rem;gap:12px;
        }
        .modal-info-row:last-child { border-bottom:none; }
        .modal-info-label { color:#555;white-space:nowrap; }
        .modal-info-value { font-weight:600;color:#e8e0d0;text-align:right;word-break:break-word; }
        .modal-total-value { font-size:1.05rem;color:#c8ff00;font-weight:700; }

        .modal-note {
          background:rgba(200,255,0,0.05);
          border:1px solid rgba(200,255,0,0.15);
          border-radius:12px;
          padding:12px 14px;
          font-size:0.8rem;
          color:#888;
          line-height:1.5;
          margin-top:14px;
        }
        .modal-note strong { color:#c8ff00; }

        .modal-footer {
          padding:14px 20px calc(20px + env(safe-area-inset-bottom));
          display:flex;flex-direction:column;gap:10px;
        }
        @media(min-width:560px){ .modal-footer{ padding:0 28px 28px; } }
        .modal-confirm-btn {
          width:100%;
          border:none;border-radius:14px;padding:17px;
          font-size:1rem;font-weight:700;font-family:'DM Sans',sans-serif;
          cursor:pointer;min-height:56px;
          display:flex;align-items:center;justify-content:center;gap:10px;
          transition:opacity 0.2s;
          -webkit-appearance:none;
        }
        .modal-confirm-btn:active { opacity:0.85;transform:scale(0.98); }
        .modal-cancel-btn {
          width:100%;background:none;
          border:1px solid #1c1c1c;border-radius:14px;padding:15px;
          font-size:0.9rem;color:#555;font-family:'DM Sans',sans-serif;
          cursor:pointer;min-height:50px;
          transition:border-color 0.2s,color 0.2s;
          -webkit-appearance:none;
        }
        .modal-cancel-btn:active { border-color:#333;color:#888; }

        .wa-icon { font-size:1.2rem; }
      `}</style>

      <Navbar />
      <div className="co-root">
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
            <div className="co-card" style={{ marginBottom: "24px" }}>
              <div className="co-card-title">🛒 Order Summary ({itemCount} {itemCount === 1 ? "item" : "items"})</div>
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">🛒</div>
                  <p className="empty-cart-text">Your cart is empty</p>
                  <Link href="/browse" style={{ color: "#c8ff00", textDecoration: "none", fontSize: "0.9rem" }}>← Continue browsing</Link>
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
                      value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                    {formErrors.fullName && <span className="form-error">{formErrors.fullName}</span>}
                  </div>
                  <div className="form-field fg-full">
                    <label className="form-label">Shipping Address *</label>
                    <input className={`form-input ${formErrors.address ? "err" : ""}`} placeholder="123 Main St, City, State, ZIP"
                      value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    {formErrors.address && <span className="form-error">{formErrors.address}</span>}
                  </div>
                  <div className="form-field fg-full">
                    <label className="form-label">Phone Number *</label>
                    <input className={`form-input ${formErrors.phone ? "err" : ""}`} placeholder="+1 (555) 000-0000" type="tel"
                      value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    {formErrors.phone && <span className="form-error">{formErrors.phone}</span>}
                  </div>
                  <div className="form-field fg-full">
                    <label className="form-label">Special Delivery Notes</label>
                    <textarea className="form-input form-textarea" placeholder="Any special instructions for delivery..."
                      value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
                <p style={{ fontSize: "0.83rem", color: "#555", marginBottom: "20px", lineHeight: "1.6" }}>
                  Select your preferred payment method. You'll be directed to confirm via WhatsApp.
                </p>
                <div className="pm-grid">
                  {PAYMENT_METHODS.map((method) => (
                    <button key={method.id} className={`pm-btn pm-${method.id}`}
                      onClick={() => handlePaymentClick(method.id)}>
                      <div className="pm-logo-wrap" dangerouslySetInnerHTML={{ __html: method.logo }} />
                      <span className="pm-btn-label">{method.label}</span>
                    </button>
                  ))}
                </div>

                {/* Gift Card section */}
                <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #1c1c1c" }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "12px", color: "#c8ff00" }}>Have a Gift Card?</h3>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <input
                      type="text"
                      value={giftCode}
                      onChange={(e) => setGiftCode(e.target.value)}
                      placeholder="Enter Gift Card Code"
                      className="form-input"
                      style={{ flex: 1, textTransform: "uppercase" }}
                    />
                    <button
                      onClick={handleGiftCard}
                      disabled={giftLoading}
                      className="proceed-btn"
                      style={{ margin: 0, padding: "0 24px", width: "auto", minWidth: "120px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      {giftLoading ? "Redeeming..." : "Redeem"}
                    </button>
                  </div>
                  {giftMessage && (
                    <p style={{ fontSize: "0.85rem", color: giftMessage.startsWith("✅") ? "#c8ff05" : "#ef4444", marginTop: "8px" }}>
                      {giftMessage}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Order total */}
          <div>
            <div className="co-card" style={{ position: "sticky", top: "80px" }}>
              <div className="co-card-title">🧾 Total</div>
              {cart.map((item) => (
                <div key={item.id} className="summary-row">
                  <span>{item.species} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="summary-row">
                <span>Shipping</span>
                <span style={{ color: "#c8ff00" }}>To be arranged</span>
              </div>
              <div className="summary-total">
                <span className="summary-total-label">Total</span>
                <span className="summary-total-price">${total.toFixed(2)}</span>
              </div>

              <div style={{ marginTop: "24px", padding: "16px", background: "rgba(200,255,0,0.04)", border: "1px solid rgba(200,255,0,0.1)", borderRadius: "14px" }}>
                <p style={{ fontSize: "0.75rem", color: "#666", lineHeight: "1.6" }}>
                  🔒 <strong style={{ color: "#888" }}>Secure checkout.</strong> Payment is confirmed directly with the seller via WhatsApp for your safety.
                </p>
              </div>

              {step === 1 && (
                <div style={{ marginTop: "16px", textAlign: "center" }}>
                  <Link href="/browse" style={{ fontSize: "0.8rem", color: "#444", textDecoration: "none" }}>← Continue shopping</Link>
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
              <div className="modal-method-logo" style={{ background: activeMethod.color + "22", border: `1px solid ${activeMethod.color}44` }}
                dangerouslySetInnerHTML={{ __html: activeMethod.logo }} />
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
                <span className="modal-info-value" style={{ maxWidth: "180px", textAlign: "right", fontSize: "0.8rem" }}>{form.address}</span>
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
                Clicking <strong>Continue to WhatsApp</strong> or <strong>Continue to Live Chat</strong> will open a chat with the seller. Share your <strong>{activeMethod.label}</strong> payment details to complete your order.
              </div>
              <div className="modal-note" style={{ marginTop: "8px", borderColor: "rgba(200,255,0,0.2)", background: "rgba(200,255,0,0.04)" }}>
                📸 <strong style={{ color: "#c8ff00" }}>Screenshot required:</strong> After making your payment, please send a <strong>screenshot of your payment confirmation</strong> to the seller to speed up processing.
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-confirm-btn"
                style={{ background: activeMethod.color, color: activeMethod.id === "cashapp" || activeMethod.id === "chime" ? "#000" : "#fff" }}
                onClick={handleWhatsApp}>
                <span className="wa-icon">💬</span>
                Continue to WhatsApp
              </button>

              <button className="modal-confirm-btn"
                style={{ background: "#2563eb", color: "#fff", marginTop: "4px" }}
                onClick={handleLiveChatPayment}>
                <span className="wa-icon">🎧</span>
                Continue to Live Chat
              </button>

              <button className="modal-cancel-btn" onClick={() => setShowPaymentModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}