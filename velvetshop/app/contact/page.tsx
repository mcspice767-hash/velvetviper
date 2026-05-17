"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactMessage>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setLoading(false);
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] font-serif">
      <Navbar />

      <div className="pt-[calc(var(--nav-height)+var(--page-pad))] px-[var(--page-pad)]">
        <div className="max-w-7xl mx-auto mb-12">
          <h1 className="text-5xl font-bold mb-2">Contact Us</h1>
          <p className="text-gray-400 text-lg">We'd love to hear from you. Get in touch with our team.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto pb-24">
          {/* Contact Cards */}
          <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 text-center hover:border-[#c8ff00] transition">
            <div className="text-5xl mb-4">📧</div>
            <h3 className="text-xl font-bold mb-2">Email</h3>
            <p className="text-gray-400 mb-4">reptilelizard48@gmail.com</p>
            <p className="text-sm text-gray-500">Response within 24 hours</p>
          </div>

          <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 text-center hover:border-[#c8ff00] transition">
            <div className="text-5xl mb-4">📱</div>
            <h3 className="text-xl font-bold mb-2">Phone</h3>
            <p className="text-gray-400 mb-4">+1 505-671-5584</p>
            <p className="text-sm text-gray-500">Mon-Fri, 9am-6pm EST</p>
          </div>

          <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 text-center hover:border-[#c8ff00] transition">
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-xl font-bold mb-2">Address</h3>
            <p className="text-gray-400 mb-4">VelvetViper HQ<br />Reptile District, NY 10001</p>
            <p className="text-sm text-gray-500">Visit by appointment</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-3xl mx-auto pb-24">
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-8">Send us a Message</h2>
            
            {submitted && (
              <div className="mb-8 bg-green-900/20 border border-green-600/50 rounded-2xl p-6 text-green-300">
                ✅ Thank you! Your message has been received. We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00] transition"
                />
                <input
                  type="email"
                  placeholder="Your Email *"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00] transition"
                />
              </div>

              <input
                type="text"
                placeholder="Subject *"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00] transition"
              />

              <textarea
                placeholder="Your Message *"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={6}
                className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 text-[#e8e0d0] focus:outline-none focus:border-[#c8ff00] transition resize-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#c8ff00] text-black py-4 rounded-2xl font-bold text-lg hover:bg-white transition disabled:bg-gray-600"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Have a quick question?</h3>
            <p className="text-gray-400 mb-6">Check our FAQ for instant answers</p>
            <Link href="/faq" className="inline-block bg-[#c8ff00] text-black px-8 py-4 rounded-2xl font-bold hover:bg-white transition">
              Browse FAQ
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-[#2a2a2a] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-[#c8ff00] mb-4">VelvetViper</h3>
              <p className="text-gray-400 text-sm">Your premium reptile marketplace</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><Link href="/browse" className="hover:text-[#c8ff00]">Browse Reptiles</Link></li>
                <li><Link href="/feeders" className="hover:text-[#c8ff00]">Feeders</Link></li>
                <li><Link href="/faq" className="hover:text-[#c8ff00]">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><a href="mailto:reptilelizard48@gmail.com" className="hover:text-[#c8ff00]">Email Support</a></li>
                <li><a href="tel:+15056715584" className="hover:text-[#c8ff00]">Call Us</a></li>
                <li><Link href="/contact" className="hover:text-[#c8ff00]">Contact Form</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Info</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><a href="#" className="hover:text-[#c8ff00]">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#c8ff00]">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#c8ff00]">Shipping Info</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#2a2a2a] pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2026 VelvetViper. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
