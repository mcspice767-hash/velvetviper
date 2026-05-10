"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Notify admin
    try {
      await fetch("/api/notify-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "signup",
          email: formData.email,
          timestamp: new Date().toLocaleString()
        }),
      });
    } catch (_) {}

    alert("Account created successfully! You can now log in.");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] font-serif flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🐍</div>
          <h1 className="text-4xl font-bold">Create Account</h1>
          <p className="text-gray-400 mt-3">Join VelvetViper today</p>
        </div>

        <form onSubmit={handleSignup} className="bg-[#111] border border-[#2a2a2a] rounded-3xl p-10 space-y-8">
          {error && (
            <div className="bg-red-900/30 border border-red-600 text-red-400 p-4 rounded-2xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 focus:border-[#c8ff00] outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4 focus:border-[#c8ff00] outline-none"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#c8ff00] hover:underline">Sign in</Link>
          </div>
        </form>

        <div className="text-center mt-8">
          <Link href="/" className="text-gray-500 hover:text-gray-400">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}