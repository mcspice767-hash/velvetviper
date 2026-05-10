"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentPage() {
  const [listingData, setListingData] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("paystack");
  const [giftCode, setGiftCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      setListingData(JSON.parse(decodeURIComponent(data)));
    } else {
      router.push("/list");
    }
  }, [searchParams]);

  const getCurrency = (country?: string) => {
    switch (country?.toLowerCase()) {
      case "uk": return { symbol: "£", amount: 2 };
      case "usa": return { symbol: "$", amount: 2 };
      case "canada": return { symbol: "CA$", amount: 2 };
      default: return { symbol: "$", amount: 2 };
    }
  };

  const curr = getCurrency(listingData?.country);

  const handleAlternativePayment = (method: string) => {
    const message = `Hello, I just submitted a listing on VelvetViper and want to pay the fee (${curr.symbol}2) using ${method}. Please send me the payment details.`;
    const whatsappUrl = `https://wa.me/${listingData.contact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePaystackPayment = () => {
    // Paystack logic (keep existing if you have the script loaded)
    alert("Paystack popup would open here (implement PaystackPop if needed)");
  };

  const handleGiftCard = async () => {
    // ... existing gift card logic
    if (!giftCode.trim()) {
      setMessage("Please enter a gift card code");
      return;
    }
    setMessage("Gift card validation coming soon...");
  };

  if (!listingData) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading payment page...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] font-serif p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Complete Your Listing</h1>
        <p className="text-center text-gray-400 mb-10">Choose your preferred payment method</p>

        {/* Listing Summary */}
        <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 mb-10 text-center">
          <p className="text-xl">{listingData.species} — {listingData.location}</p>
          <p className="text-3xl font-mono text-[#c8ff00] mt-4">
            Listing Fee: {curr.symbol}2
          </p>
        </div>

        <div className="space-y-6">
          {/* Paystack Option */}
          <div 
            onClick={() => setSelectedMethod("paystack")}
            className={`border-2 rounded-3xl p-8 cursor-pointer transition-all ${selectedMethod === "paystack" ? "border-[#c8ff00]" : "border-[#2a2a2a]"}`}
          >
            <div className="flex items-center gap-4">
              <img src="https://website-v3-assets.s3.amazonaws.com/assets/img/hero/Paystack-mark-white-twitter.png" alt="Paystack" className="h-10" />
              <div>
                <p className="font-semibold text-lg">Pay with Card (Paystack)</p>
                <p className="text-sm text-gray-500">Visa, Mastercard, Verve</p>
              </div>
            </div>
            <button onClick={handlePaystackPayment} className="mt-6 w-full bg-[#c8ff00] text-black py-4 rounded-2xl font-semibold">
              Pay {curr.symbol}2 Securely
            </button>
          </div>

          {/* Alternative Payment Methods */}
          <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8">
            <p className="text-[#c8ff00] font-medium mb-6">Other Payment Methods</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: "PayPal", logo: "💰" },
                { name: "Cash App", logo: "💵" },
                { name: "Venmo", logo: "📱" },
                { name: "Zelle", logo: "🏦" },
                { name: "Apple Pay", logo: "" },
                { name: "Revolut", logo: "🔄" },
                { name: "Chime", logo: "🏧" },
              ].map((method) => (
                <div
                  key={method.name}
                  onClick={() => handleAlternativePayment(method.name)}
                  className="border border-[#2a2a2a] hover:border-[#c8ff00] rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-[#1a1a1a]"
                >
                  <div className="text-4xl mb-3">{method.logo}</div>
                  <p className="font-medium">{method.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Click to pay via WhatsApp</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gift Card Option */}
          <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8">
            <p className="text-[#c8ff00] font-medium mb-4">Have a Gift Card?</p>
            <input
              type="text"
              value={giftCode}
              onChange={(e) => setGiftCode(e.target.value)}
              placeholder="Enter Gift Card Code"
              className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 mb-4 focus:border-[#c8ff00] outline-none"
            />
            <button
              onClick={handleGiftCard}
              className="w-full bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-medium"
            >
              Redeem Gift Card
            </button>
          </div>
        </div>

        {message && <div className="mt-8 p-6 bg-[#1a1a1a] rounded-3xl text-center text-lg border border-[#c8ff00]/30">{message}</div>}
      </div>
    </div>
  );
}