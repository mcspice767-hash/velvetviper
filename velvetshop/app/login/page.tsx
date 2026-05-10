"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Optional: Send notification to admin
    try {
      await fetch("/api/notify-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "login", email, timestamp: new Date().toLocaleString() }),
      });
    } catch (_) {}

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] font-serif flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🐍</div>
          <h1 className="text-4xl font-bold">Welcome Back</h1>
          <p className="text-gray-400 mt-3">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-10 space-y-8">
          {error && <div className="bg-red-900/30 border border-red-600 text-red-400 p-4 rounded-2xl">{error}</div>}

          <div>
            <label className="block text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 focus:border-[#c8ff00] outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 focus:border-[#c8ff00] outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c8ff00] text-black py-5 rounded-2xl font-semibold text-lg hover:bg-white transition disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#c8ff00] hover:underline">Sign up</Link>
          </div>
        </form>

        <div className="text-center mt-8">
          <Link href="/" className="text-gray-500 hover:text-gray-400">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}