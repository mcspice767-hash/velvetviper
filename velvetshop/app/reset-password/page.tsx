"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully!");
      setTimeout(() => router.push("/login"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e0d0] font-serif flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#111] border border-[#2a2a2a] rounded-3xl p-10">
        <h1 className="text-3xl font-bold text-center mb-8">Reset Password</h1>

        {message && <div className="mb-6 p-4 rounded-2xl bg-green-900/30 border border-green-600 text-green-400">{message}</div>}

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label className="block text-sm mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-black border border-[#2a2a2a] rounded-2xl px-6 py-4"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c8ff00] text-black py-5 rounded-2xl font-semibold hover:bg-white transition"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}