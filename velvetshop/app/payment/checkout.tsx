"use client";

import { useState } from "react";
import Link from "next/link";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CheckoutPage() {
  const [cartItems] = useState<CartItem[]>([]);
  const [orderStep, setOrderStep] = useState<"cart" | "shipping" | "payment" | "confirmation">("cart");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "USA",
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] font-serif">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-black/95 border-b border-[#2a2a2a] z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 hover:text-[#c8ff00]">
            <span className="text-4xl">🐍</span>
            <h1 className="text-3xl font-bold tracking-tight">VELVETVIPER</h1>
          </Link>
        </div>
      </nav>

      <div className="pt-24 px-6">
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-5xl font-bold mb-2">Checkout</h1>
          <p className="text-gray-400">Complete your order securely</p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center gap-4">
            {["cart", "shipping", "payment", "confirmation"].map((step, idx) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  orderStep === step ? "bg-[#c8ff00] text-black" : 
                  ["cart", "shipping", "payment"].indexOf(orderStep) > idx ? "bg-green-600 text-white" : 
                  "bg-[#2a2a2a] text-gray-400"
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 h-1 bg-[#2a2a2a] mx-2"></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-4">
            <span>Review Cart</span>
            <span>Shipping</span>
            <span>Payment</span>
            <span>Confirmation</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto pb-24">
          {/* Main Content */}
          <div className="md:col-span-2">
            {orderStep === "cart" && (
              <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 mb-6">Your cart is empty</p>
                    <Link href="/browse" className="inline-block bg-[#c8ff00] text-black px-6 py-3 rounded-2xl font-bold hover:bg-white transition">
                      Continue Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center border-b border-[#2a2a2a] pb-4">
                        <div>
                          <h3 className="font-bold">{item.name}</h3>
                          <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-gray-400 text-sm">${item.price} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setOrderStep("shipping")}
                  disabled={cartItems.length === 0}
                  className="w-full bg-[#c8ff00] text-black py-4 rounded-2xl font-bold mt-8 hover:bg-white transition disabled:bg-gray-600"
                >
                  Continue to Shipping
                </button>
              </div>
            )}

            {orderStep === "shipping" && (
              <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 space-y-6">
                <h2 className="text-2xl font-bold">Shipping Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00]"
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00]"
                  />
                  <input
                    type="tel"
                    placeholder="Phone *"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00]"
                  />
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00]"
                  >
                    <option>USA</option>
                    <option>UK</option>
                    <option>Canada</option>
                    <option>Australia</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Address *"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00] md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="City *"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00]"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code *"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00]"
                  />
                </div>
                <div className="bg-green-900/20 border border-green-600/50 rounded-2xl p-4">
                  <p className="text-green-300 text-sm">
                    ✅ Fast insured shipping available. Live arrival guaranteed on all orders.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setOrderStep("cart")}
                    className="flex-1 border border-[#2a2a2a] py-4 rounded-2xl font-bold hover:border-[#c8ff00]"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setOrderStep("payment")}
                    className="flex-1 bg-[#c8ff00] text-black py-4 rounded-2xl font-bold hover:bg-white"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {orderStep === "payment" && (
              <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 space-y-6">
                <h2 className="text-2xl font-bold">Payment Information</h2>
                <div className="space-y-6">
                  <input
                    type="text"
                    placeholder="Card Number *"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00]"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM/YY *"
                      value={formData.cardExpiry}
                      onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                      className="bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00]"
                    />
                    <input
                      type="text"
                      placeholder="CVC *"
                      value={formData.cardCVC}
                      onChange={(e) => setFormData({ ...formData, cardCVC: e.target.value })}
                      className="bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00]"
                    />
                  </div>
                </div>
                <div className="bg-blue-900/20 border border-blue-600/50 rounded-2xl p-4">
                  <p className="text-blue-300 text-sm">
                    🔒 All payments are encrypted and secure. Your data is never stored.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setOrderStep("shipping")}
                    className="flex-1 border border-[#2a2a2a] py-4 rounded-2xl font-bold hover:border-[#c8ff00]"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setOrderStep("confirmation")}
                    className="flex-1 bg-[#c8ff00] text-black py-4 rounded-2xl font-bold hover:bg-white"
                  >
                    Complete Order
                  </button>
                </div>
              </div>
            )}

            {orderStep === "confirmation" && (
              <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 text-center">
                <div className="text-6xl mb-6">✅</div>
                <h2 className="text-3xl font-bold mb-4">Order Confirmed!</h2>
                <p className="text-gray-400 mb-8">
                  Thank you for your order. Your reptile friends are on their way!
                </p>
                <div className="bg-green-900/20 border border-green-600/50 rounded-2xl p-6 mb-8">
                  <p className="text-green-300 mb-2">Order #VV-2026-12345</p>
                  <p className="text-gray-400 text-sm">Confirmation email sent to your inbox</p>
                </div>
                <div className="space-y-3">
                  <Link href="/browse" className="block bg-[#c8ff00] text-black py-4 rounded-2xl font-bold hover:bg-white">
                    Continue Shopping
                  </Link>
                  <Link href="/" className="block border border-[#2a2a2a] py-4 rounded-2xl font-bold hover:border-[#c8ff00]">
                    Return to Home
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 h-fit">
            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6 border-b border-[#2a2a2a] pb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Shipping</span>
                <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold">Total</span>
              <span className="text-3xl font-bold text-[#c8ff00]">${total.toFixed(2)}</span>
            </div>
            {subtotal > 100 && (
              <div className="bg-green-900/20 border border-green-600/50 rounded-2xl p-3 text-sm text-green-300">
                ✅ Free shipping applied!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-[#2a2a2a] py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; 2026 VelvetViper. Secure checkout powered by industry-leading payment processors.</p>
        </div>
      </footer>
    </div>
  );
}
