"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordStrength = (pw: string) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = passwordStrength(formData.password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f97316", "#eab308", "#84cc16", "#c8ff00"][strength];
  const passwordsMatch = formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); setLoading(false); return; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
    const { error: authError } = await supabase.auth.signUp({ email: formData.email, password: formData.password });
    if (authError) { setError(authError.message); setLoading(false); return; }
    try {
      await fetch("/api/notify-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "signup", email: formData.email, timestamp: new Date().toLocaleString() }) });
    } catch (_) {}
    alert("Account created successfully! You can now log in.");
    router.push("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap');
        .sr { min-height:100vh; background:#050505; display:flex; font-family:'DM Sans',sans-serif; position:relative; overflow:hidden; }
        .orb { position:fixed; border-radius:50%; filter:blur(120px); pointer-events:none; z-index:0; }
        .orb1 { width:600px;height:600px;background:radial-gradient(circle,rgba(200,255,0,0.06) 0%,transparent 70%);top:-200px;right:-100px; }
        .orb2 { width:400px;height:400px;background:radial-gradient(circle,rgba(200,255,0,0.04) 0%,transparent 70%);bottom:-100px;left:-100px; }
        .lp { display:none;flex:1;background:linear-gradient(160deg,#0d0d0d 0%,#111 100%);border-right:1px solid #1a1a1a;padding:60px;flex-direction:column;justify-content:space-between;position:relative;z-index:1; }
        @media(min-width:1024px){.lp{display:flex;}}
        .ll { display:flex;align-items:center;gap:14px; }
        .lt { font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;color:#e8e0d0;letter-spacing:-0.02em; }
        .lm { flex:1;display:flex;flex-direction:column;justify-content:center;gap:48px; }
        .lh { font-family:'Playfair Display',serif;font-size:clamp(2.5rem,4vw,3.5rem);font-weight:900;color:#e8e0d0;line-height:1.1;letter-spacing:-0.03em; }
        .lh span{color:#c8ff00;}
        .lf2{display:flex;flex-direction:column;gap:20px;}
        .fi{display:flex;align-items:center;gap:14px;}
        .fd{width:8px;height:8px;border-radius:50%;background:#c8ff00;flex-shrink:0;}
        .ft{color:#888;font-size:0.9rem;font-weight:300;letter-spacing:0.01em;}
        .lfoot{color:#444;font-size:0.8rem;}
        .rp{flex:1;display:flex;align-items:center;justify-content:center;padding:40px 24px;position:relative;z-index:1;}
        .fc{width:100%;max-width:440px;}
        .mlogo{text-align:center;margin-bottom:40px;}
        .mlogi{font-size:2.5rem;}
        .mlogt{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:#e8e0d0;margin-top:8px;}
        @media(min-width:1024px){.mlogo{display:none;}}
        .fh{margin-bottom:36px;}
        .ftitle{font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:#e8e0d0;letter-spacing:-0.02em;margin-bottom:8px;}
        .fsub{color:#555;font-size:0.875rem;font-weight:300;}
        .ebox{background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:14px;padding:14px 18px;color:#f87171;font-size:0.85rem;margin-bottom:24px;display:flex;align-items:center;gap:10px;}
        .fg{margin-bottom:20px;}
        .flabel{display:block;font-size:0.78rem;font-weight:500;color:#666;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.08em;}
        .fw{position:relative;}
        .fi2{width:100%;background:#0d0d0d;border:1px solid #222;border-radius:14px;padding:16px 50px 16px 18px;color:#e8e0d0;font-size:0.95rem;font-family:'DM Sans',sans-serif;font-weight:300;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .fi2:focus{border-color:#c8ff00;box-shadow:0 0 0 3px rgba(200,255,0,0.06);}
        .fi2::placeholder{color:#333;}
        .fi2.valid{border-color:rgba(200,255,0,0.4);}
        .fi2.invalid{border-color:rgba(239,68,68,0.4);}
        .tb{position:absolute;right:16px;top:50%;transform:translateY(-50%);background:none;border:none;color:#444;cursor:pointer;font-size:1rem;padding:4px;transition:color 0.2s;line-height:1;}
        .tb:hover{color:#c8ff00;}
        .sbar{display:flex;gap:4px;margin-top:10px;}
        .ss{flex:1;height:3px;border-radius:2px;background:#1a1a1a;transition:background 0.3s;}
        .srow{display:flex;justify-content:space-between;align-items:center;margin-top:6px;}
        .shint{font-size:0.75rem;color:#444;}
        .slabel{font-size:0.75rem;font-weight:500;transition:color 0.3s;}
        .mrow{display:flex;align-items:center;gap:6px;margin-top:8px;font-size:0.78rem;}
        .mok{color:#c8ff00;} .mno{color:#ef4444;}
        .sbtn{width:100%;background:#c8ff00;color:#000;border:none;border-radius:14px;padding:17px;font-size:0.95rem;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:background 0.2s,transform 0.1s,opacity 0.2s;letter-spacing:0.01em;margin-top:8px;}
        .sbtn:hover:not(:disabled){background:#d4ff26;transform:translateY(-1px);}
        .sbtn:active:not(:disabled){transform:translateY(0);}
        .sbtn:disabled{opacity:0.5;cursor:not-allowed;}
        .dots{display:inline-flex;gap:4px;align-items:center;}
        .dot{width:5px;height:5px;border-radius:50%;background:#000;animation:bounce 1.2s infinite;}
        .dot:nth-child(2){animation-delay:0.2s;} .dot:nth-child(3){animation-delay:0.4s;}
        @keyframes bounce{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-6px);}}
        .sirow{text-align:center;margin-top:28px;font-size:0.85rem;color:#444;}
        .sil{color:#c8ff00;text-decoration:none;font-weight:500;}
        .sil:hover{opacity:0.8;}
        .bl{display:block;text-align:center;margin-top:20px;font-size:0.8rem;color:#333;text-decoration:none;transition:color 0.2s;}
        .bl:hover{color:#666;}
      `}</style>

      <div className="sr">
        <div className="orb orb1" />
        <div className="orb orb2" />

        {/* Left panel */}
        <div className="lp">
          <div className="ll">
            <span style={{fontSize:"2.2rem"}}>🐍</span>
            <span className="lt">VelvetViper</span>
          </div>
          <div className="lm">
            <h2 className="lh">The premium<br />reptile<br /><span>marketplace.</span></h2>
            <div className="lf2">
              {["Buy and sell exotic reptiles safely","Verified listings from trusted breeders","AI-powered species identification","Secure payments & buyer protection"].map((f) => (
                <div key={f} className="fi">
                  <div className="fd" />
                  <span className="ft">{f}</span>
                </div>
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

            <div className="fh">
              <h1 className="ftitle">Create account</h1>
              <p className="fsub">Start buying and selling reptiles today</p>
            </div>

            {error && <div className="ebox"><span>⚠</span> {error}</div>}

            <form onSubmit={handleSignup}>
              {/* Email */}
              <div className="fg">
                <label className="flabel">Email address</label>
                <div className="fw">
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    placeholder="you@example.com" className={`fi2 ${formData.email.includes("@") ? "valid" : ""}`} />
                </div>
              </div>

              {/* Password */}
              <div className="fg">
                <label className="flabel">Create password</label>
                <div className="fw">
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password}
                    onChange={handleChange} required placeholder="Min. 6 characters" className="fi2" />
                  <button type="button" className="tb" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
                {formData.password && (
                  <>
                    <div className="sbar">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className="ss" style={{ background: i <= strength ? strengthColor : "#1a1a1a" }} />
                      ))}
                    </div>
                    <div className="srow">
                      <span className="shint">Use uppercase, numbers & symbols</span>
                      <span className="slabel" style={{ color: strengthColor }}>{strengthLabel}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Confirm password */}
              <div className="fg">
                <label className="flabel">Confirm password</label>
                <div className="fw">
                  <input type={showConfirm ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword}
                    onChange={handleChange} required placeholder="Re-enter your password"
                    className={`fi2 ${passwordsMatch ? "valid" : ""} ${passwordsMismatch ? "invalid" : ""}`} />
                  <button type="button" className="tb" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? "🙈" : "👁"}
                  </button>
                </div>
                {passwordsMatch && <div className="mrow mok">✓ Passwords match</div>}
                {passwordsMismatch && <div className="mrow mno">✕ Passwords do not match</div>}
              </div>

              <button type="submit" disabled={loading} className="sbtn">
                {loading ? <span className="dots"><span className="dot"/><span className="dot"/><span className="dot"/></span> : "Create Account"}
              </button>
            </form>

            <div className="sirow">
              Already have an account?{" "}
              <Link href="/login" className="sil">Sign in</Link>
            </div>
            <Link href="/" className="bl">← Back to home</Link>
          </div>
        </div>
      </div>
    </>
  );
}