"use client";

import Link from "next/link";

export default function AboutPage() {
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
            <Link href="/about" className="text-[#c8ff00]">About</Link>
            <Link href="/contact" className="hover:text-[#c8ff00]">Contact</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6">About VelvetViper</h1>
          <p className="text-xl text-gray-400">Premium marketplace for ethically-sourced reptiles and specialized feeders</p>
        </div>

        {/* Mission */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                VelvetViper is dedicated to connecting reptile enthusiasts with healthy, well-cared-for animals and premium nutrition. We believe every reptile deserves a responsible, informed owner.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Founded in 2024, we've grown to become the most trusted marketplace in the reptile community, serving thousands of happy keepers across USA, UK, Canada, and Australia.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] rounded-3xl p-12 text-center">
              <div className="text-7xl mb-4">🐍</div>
              <p className="text-gray-400">VelvetViper: Trusted by reptile enthusiasts worldwide</p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-4xl font-bold mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Ethical Sourcing", desc: "All reptiles are responsibly bred and health-tested. We never support illegal wildlife trade." },
              { title: "Expert Support", desc: "Our team of herpetologists provide free care guides and ongoing support for every purchase." },
              { title: "Live Guarantee", desc: "Every animal arrives in perfect health. If not, we replace it at no cost." }
            ].map((value, idx) => (
              <div key={idx} className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-8 hover:border-[#c8ff00] transition">
                <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                <p className="text-gray-400">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-4xl font-bold mb-12">By The Numbers</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { number: "5000+", label: "Happy Customers" },
              { number: "15000+", label: "Reptiles Rehomed" },
              { number: "200+", label: "Breeders Trusted" },
              { number: "99.8%", label: "Positive Reviews" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] rounded-3xl p-8 text-center hover:border-[#c8ff00] transition">
                <p className="text-4xl font-bold text-[#c8ff00] mb-2">{stat.number}</p>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-4xl font-bold mb-12">Why Choose VelvetViper?</h2>
          <div className="space-y-4">
            {[
              "✅ Live Arrival Guarantee on all orders",
              "✅ Expert herpetologists available for support",
              "✅ Comprehensive care guides included with every purchase",
              "✅ Temperature-controlled insulated shipping",
              "✅ Ethically sourced from trusted breeders only",
              "✅ Fast, secure payment processing",
              "✅ Community of passionate reptile keepers",
              "✅ 24/7 customer support"
            ].map((item, idx) => (
              <div key={idx} className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-4 text-lg">
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-4xl font-bold mb-12">Our Team</h2>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] rounded-3xl p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-4">Led by Passionate Experts</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Our founding team brings together decades of combined experience in herpetology, animal welfare, and e-commerce. We're not just running a business—we're building a community.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Every team member is a reptile enthusiast first, ensuring every decision prioritizes the welfare of the animals and satisfaction of our customers.
                </p>
              </div>
              <div className="text-center">
                <p className="text-6xl mb-4">👥</p>
                <p className="text-gray-400">Dedicated to reptile welfare and customer excellence</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to find your perfect reptile?</h2>
            <p className="text-gray-400 mb-8">Join thousands of happy keepers in our community</p>
            <div className="flex gap-4 justify-center">
              <Link href="/browse" className="bg-[#c8ff00] text-black px-8 py-4 rounded-2xl font-bold hover:bg-white transition">
                Browse Reptiles
              </Link>
              <Link href="/feeders" className="border border-[#2a2a2a] px-8 py-4 rounded-2xl font-bold hover:border-[#c8ff00] transition">
                Shop Feeders
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-[#2a2a2a] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-[#c8ff00] mb-4">VelvetViper</h3>
              <p className="text-gray-400 text-sm">Your premium reptile marketplace. Ethically sourced, expertly curated.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Shop</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><Link href="/browse" className="hover:text-[#c8ff00]">Browse Reptiles</Link></li>
                <li><Link href="/feeders" className="hover:text-[#c8ff00]">Premium Feeders</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><Link href="/faq" className="hover:text-[#c8ff00]">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-[#c8ff00]">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><a href="#" className="hover:text-[#c8ff00]">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#c8ff00]">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#2a2a2a] pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2026 VelvetViper. All rights reserved. Ethically sourced reptiles and premium feeders.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
