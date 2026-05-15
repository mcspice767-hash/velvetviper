"use client";

import { useState } from "react";
import Link from "next/link";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 1,
    category: "Shipping & Delivery",
    question: "How quickly will my order arrive?",
    answer: "Standard shipping takes 3-5 business days. Express shipping (2-3 days) is available for a small fee. All packages include live arrival guarantee."
  },
  {
    id: 2,
    category: "Shipping & Delivery",
    question: "Is my reptile guaranteed to arrive alive?",
    answer: "Yes! All reptiles and feeders are shipped with insulated, temperature-controlled packaging. If your order arrives in anything but perfect condition, we'll replace it at no cost."
  },
  {
    id: 3,
    category: "Shipping & Delivery",
    question: "Do you ship internationally?",
    answer: "We currently ship to USA, UK, Canada, and Australia. Contact us for international shipping inquiries."
  },
  {
    id: 4,
    category: "Orders & Returns",
    question: "What's your return policy?",
    answer: "We offer 14-day returns on feeders if unopened. Reptiles cannot be returned but are covered by our live arrival guarantee. Contact support for full details."
  },
  {
    id: 5,
    category: "Orders & Returns",
    question: "Can I track my order?",
    answer: "Yes! You'll receive a tracking number via email once your order ships. You can track your package in real-time."
  },
  {
    id: 6,
    category: "Reptiles & Care",
    question: "What should I do when my reptile arrives?",
    answer: "Let your reptile acclimate for 24-48 hours in a quiet space. Avoid handling during this time. Provide fresh water and maintain proper temperatures. Consult our care guides for species-specific needs."
  },
  {
    id: 7,
    category: "Reptiles & Care",
    question: "Are feeders included with reptile purchases?",
    answer: "No, feeders are sold separately. Check our Feeders section for high-quality live feeder insects and small mammals."
  },
  {
    id: 8,
    category: "Feeders",
    question: "How should I store live feeders?",
    answer: "Store feeders in a cool (70-75°F), dark place. Keep them in their original containers with proper ventilation. Most feeders last 2-4 weeks when stored properly."
  },
  {
    id: 9,
    category: "Feeders",
    question: "Are all feeders nutritionally balanced?",
    answer: "Yes! All our feeders are sourced from trusted breeders and are nutritionally optimized for reptile diets. Vary feeder types for best nutrition."
  },
  {
    id: 10,
    category: "Account & Payment",
    question: "Is my payment information secure?",
    answer: "Absolutely. We use industry-leading encryption and PCI compliance standards. Your card information is never stored on our servers."
  },
  {
    id: 11,
    category: "Account & Payment",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal for maximum security and convenience."
  },
  {
    id: 12,
    category: "Account & Payment",
    question: "Do you offer payment plans?",
    answer: "Yes! Orders over $500 qualify for our 3-month interest-free payment plan through Klarna. Select this option at checkout."
  }
];

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(FAQ_ITEMS.map(f => f.category)))];
  const filteredFAQ = selectedCategory === "All" 
    ? FAQ_ITEMS 
    : FAQ_ITEMS.filter(f => f.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] font-serif">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-black/95 border-b border-[#2a2a2a] z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 hover:text-[#c8ff00]">
            <span className="text-4xl">🐍</span>
            <h1 className="text-3xl font-bold tracking-tight">VELVETVIPER</h1>
          </Link>

          <div className="hidden md:flex gap-8 text-sm">
            <Link href="/" className="hover:text-[#c8ff00]">Home</Link>
            <Link href="/browse" className="hover:text-[#c8ff00]">Reptiles</Link>
            <Link href="/feeders" className="hover:text-[#c8ff00]">Feeders</Link>
            <Link href="/faq" className="text-[#c8ff00]">FAQ</Link>
            <Link href="/contact" className="hover:text-[#c8ff00]">Contact</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6">
        <div className="max-w-5xl mx-auto mb-12">
          <h1 className="text-5xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-400 text-lg">Find answers to common questions about orders, reptiles, and feeders</p>
        </div>

        {/* Category Filter */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-[#c8ff00] text-black"
                    : "bg-[#111] border border-[#2a2a2a] hover:border-[#c8ff00]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="max-w-5xl mx-auto pb-24 space-y-4">
          {filteredFAQ.map(item => (
            <div
              key={item.id}
              className="bg-[#111] border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-[#c8ff00] transition"
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-[#1a1a1a] transition"
              >
                <div className="flex-1">
                  <div className="text-xs text-[#c8ff00] font-semibold mb-2">{item.category}</div>
                  <h3 className="text-lg font-bold">{item.question}</h3>
                </div>
                <span className={`text-2xl ml-4 transition ${expandedId === item.id ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
              
              {expandedId === item.id && (
                <div className="px-6 pb-6 border-t border-[#2a2a2a] text-gray-300">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
            <p className="text-gray-400 mb-8">Our support team is here to help</p>
            <Link href="/contact" className="inline-block bg-[#c8ff00] text-black px-8 py-4 rounded-2xl font-bold hover:bg-white transition">
              Contact Support
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-[#2a2a2a] py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; 2026 VelvetViper. Your premium reptile marketplace.</p>
        </div>
      </footer>
    </div>
  );
}
