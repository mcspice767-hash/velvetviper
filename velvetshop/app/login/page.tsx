"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/browse";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Check email verified
    if (!data.user?.email_confirmed_at) {
      localStorage.setItem("pending_verification_email", formData.email);
      router.push("/verify");
      return;
    }

    router.push(redirect);
  };

  const handleForgotPassword = async () => {
    if (!formData.email) { setError("Enter your email first"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { setError(error.message); }
    else { setError(null); alert("Password reset email sent! Check your inbox."); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing:border-box;margin:0;padding:0; }

        .lr { min-height:100vh;background:#050505;display:flex;font-family:'DM Sans',sans-serif;position:relative;overflow:hidden; }
        .orb { position:fixed;border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0; }
        .orb1 { width:600px;height:600px;background:radial-gradient(circle,rgba(200,255,0,0.06) 0%,transparent 70%);top:-200px;left:-100px; }
        .orb2 { width:400px;height:400px;background:radial-gradient(circle,rgba(200,255,0,0.04) 0%,transparent 70%);bottom:-100px;right:-100px; }

        /* Left panel */
        .lp { display:none;flex:1;background:linear-gradient(160deg,#0d0d0d 0%,#111 100%);border-right:1px solid #1a1a1a;padding:60px;flex-direction:column;justify-content:space-between;position:relative;z-index:1; }
        @media(min-width:1024px){ .lp{display:flex;} }
        .ll { display:flex;align-items:center;gap:14px; }
        .lt { font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;color:#e8e0d0;letter-spacing:-0.02em; }
        .lm { flex:1;display:flex;flex-direction:column;justify-content:center;gap:48px; }
        .lh { font-family:'Playfair Display',serif;font-size:clamp(2.5rem,4vw,3.5rem);font-weight:900;color:#e8e0d0;line-height:1.1;letter-spacing:-0.03em; }
        .lh span { color:#c8ff00; }
        .lfeats { display:flex;flex-direction:column;gap:20px; }
        .lfi { display:flex;align-items:center;gap:14px; }
        .lfd { width:8px;height:8px;border-radius:50%;background:#c8ff00;flex-shrink:0; }
        .lft { color:#888;font-size:0.9rem;font-weight:300;letter-spacing:0.01em; }
        .lfoot { color:#444;font-size:0.8rem; }

        /* Right panel */
        .rp { flex:1;display:flex;align-items:center;justify-content:center;padding:40px 24px;position:relative;z-index:1; }
        .fc { width:100%;max-width:440px; }

        .mlogo { text-align:center;margin-bottom:40px; }
        .mlogi { font-size:2.5rem; }
        .mlogt { font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:#e8e0d0;margin-top:8px; }
        @media(min-width:1024px){ .mlogo{display:none;} }

        .fh { margin-bottom:36px; }
        .ftitle { font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:#e8e0d0;letter-spacing:-0.02em;margin-bottom:8px; }
        .fsub { color:#555;font-size:0.875rem;font-weight:300; }

        .ebox { background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:14px;padding:14px 18px;color:#f87171;font-size:0.85rem;margin-bottom:24px;display:flex;align-items:center;gap:10px; }

        .fg { margin-bottom:20px; }
        .flabel { display:block;font-size:0.78rem;font-weight:500;color:#666;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.08em; }
        .fw { position:relative; }
        .fi { width:100%;background:#0d0d0d;border:1px solid #222;border-radius:14px;padding:16px 50px 16px 18px;color:#e8e0d0;font-size:0.95rem;font-family:'DM Sans',sans-serif;font-weight:300;outline:none;transition:border-color 0.2s,box-shadow 0.2s; }
        .fi:focus { border-color:#c8ff00;box-shadow:0 0 0 3px rgba(200,255,0,0.06); }
        .fi::placeholder { color:#333; }
        .fi.valid { border-color:rgba(200,255,0,0.4); }
        .tb { position:absolute;right:16px;top:50%;transform:translateY(-50%);background:none;border:none;color:#444;cursor:pointer;font-size:1rem;padding:4px;transition:color 0.2s;line-height:1; }
        .tb:hover { color:#c8ff00; }

        .forgot { text-align:right;margin-top:8px; }
        .forgot-btn { background:none;border:none;font-size:0.78rem;color:#555;cursor:pointer;font-family:'DM Sans',sans-serif;transition:color 0.2s; }
        .forgot-btn:hover { color:#c8ff00; }

        .sbtn { width:100%;background:#c8ff00;color:#000;border:none;border-radius:14px;padding:17px;font-size:0.95rem;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:background 0.2s,transform 0.1s,opacity 0.2s;letter-spacing:0.01em;margin-top:8px; }
        .sbtn:hover:not(:disabled) { background:#d4ff26;transform:translateY(-1px); }
        .sbtn:active:not(:disabled) { transform:translateY(0); }
        .sbtn:disabled { opacity:0.5;cursor:not-allowed; }

        .dots { display:inline-flex;gap:4px;align-items:center; }
        .dot { width:5px;height:5px;border-radius:50%;background:#000;animation:bounce 1.2s infinite; }
        .dot:nth-child(2) { animation-delay:0.2s; }
        .dot:nth-child(3) { animation-delay:0.4s; }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }

        .divider { display:flex;align-items:center;gap:14px;margin:28px 0; }
        .dline { flex:1;height:1px;background:#1a1a1a; }
        .dtext { color:#333;font-size:0.75rem; }

        .surow { text-align:center;margin-top:8px;font-size:0.85rem;color:#444; }
        .sul { color:#c8ff00;text-decoration:none;font-weight:500; }
        .sul:hover { opacity:0.8; }

        .bl { display:block;text-align:center;margin-top:20px;font-size:0.8rem;color:#333;text-decoration:none;transition:color 0.2s; }
        .bl:hover { color:#666; }

        /* Welcome back badge */
        .wb { display:inline-flex;align-items:center;gap:8px;background:rgba(200,255,0,0.06);border:1px solid rgba(200,255,0,0.15);border-radius:20px;padding:6px 14px;font-size:0.75rem;color:#888;margin-bottom:24px; }
        .wb-dot { width:6px;height:6px;border-radius:50%;background:#c8ff00;animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      <div className="lr">
        <div className="orb orb1" /><div className="orb orb2" />

        {/* Left panel */}
        <div className="lp">
          <div className="ll">
            <span style={{fontSize:"2.2rem"}}>🐍</span>
            <span className="lt">VelvetViper</span>
          </div>
          <div className="lm">
            <h2 className="lh">Welcome<br />back to the<br /><span>marketplace.</span></h2>
            <div className="lfeats">
              {["Track your reptile orders in real-time","Browse 100s of verified listings","Secure WhatsApp-based payments","AI-powered species identification"].map((f) => (
                <div key={f} className="lfi"><div className="lfd" /><span className="lft">{f}</span></div>
              ))}
            </div>
          </div>
          <div className="lfoot">© 2026 VelvetViper. All rights reserved.</div>
        </div>

        {/* Right panel */}
        <div className="rp">
          <div className="fc">
            <div className="mlogo">
              <div className="mlogi">🐍</div>
              <div className="mlogt">VelvetViper</div>
            </div>

            <div className="wb"><span className="wb-dot" />Secure login</div>

            <div className="fh">
              <h1 className="ftitle">Sign in</h1>
              <p className="fsub">Don't have an account? <Link href="/signup" className="sul">Create one →</Link></p>
            </div>

            {error && <div className="ebox"><span>⚠</span> {error}</div>}

            <form onSubmit={handleLogin}>
              <div className="fg">
                <label className="flabel">Email address</label>
                <div className="fw">
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    placeholder="you@example.com"
                    className={`fi ${formData.email.includes("@") ? "valid" : ""}`} />
                </div>
              </div>

              <div className="fg">
                <label className="flabel">Password</label>
                <div className="fw">
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password}
                    onChange={handleChange} required placeholder="••••••••" className="fi" />
                  <button type="button" className="tb" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
                <div className="forgot">
                  <button type="button" className="forgot-btn" onClick={handleForgotPassword}>Forgot password?</button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="sbtn">
                {loading
                  ? <span className="dots"><span className="dot"/><span className="dot"/><span className="dot"/></span>
                  : "Sign In"}
              </button>
            </form>

            <div className="divider"><div className="dline"/><span className="dtext">or</span><div className="dline"/></div>

            <div className="surow">
              New to VelvetViper?{" "}
              <Link href="/signup" className="sul">Create a free account</Link>
            </div>

            <Link href="/" className="bl">← Back to home</Link>
          </div>
        </div>
      </div>
    </>
  );
}