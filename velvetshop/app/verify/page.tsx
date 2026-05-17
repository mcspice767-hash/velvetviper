"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";

export default function VerifyPage() {
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get email from localStorage (set during signup)
    const saved = localStorage.getItem("pending_verification_email");
    if (saved) setEmail(saved);

    // Check if already verified (user came back from email link)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        localStorage.removeItem("pending_verification_email");
        router.push("/browse");
      }
    };
    checkSession();

    // Listen for auth state changes (when they click email link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
        localStorage.removeItem("pending_verification_email");
        router.push("/browse");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleResend = async () => {
    if (!email) { setError("No email found. Please sign up again."); return; }
    setResending(true);
    setError("");
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    if (error) { setError(error.message); } else { setResent(true); setTimeout(() => setResent(false), 5000); }
  };

  const handleCheckVerified = async () => {
    setChecking(true);
    setError("");
    const { data: { user }, error } = await supabase.auth.getUser();
    setChecking(false);
    if (error) { setError(error.message); return; }
    if (user?.email_confirmed_at) {
      localStorage.removeItem("pending_verification_email");
      router.push("/browse");
    } else {
      setError("Email not verified yet. Please check your inbox and click the link.");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .vr { min-height:100vh;background:#050505;display:flex;align-items:center;justify-content:center;padding:24px;font-family:'DM Sans',sans-serif;position:relative;overflow:hidden; }
        .orb { position:fixed;border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0; }
        .orb1 { width:500px;height:500px;background:radial-gradient(circle,rgba(200,255,0,0.05) 0%,transparent 70%);top:-150px;right:-100px; }
        .orb2 { width:300px;height:300px;background:radial-gradient(circle,rgba(200,255,0,0.03) 0%,transparent 70%);bottom:-100px;left:-50px; }
        .vbox { position:relative;z-index:1;width:100%;max-width:480px;text-align:center; }
        .vicon { width:88px;height:88px;border-radius:24px;background:rgba(200,255,0,0.08);border:1px solid rgba(200,255,0,0.2);display:flex;align-items:center;justify-content:center;font-size:2.5rem;margin:0 auto 28px; }
        .vtitle { font-family:'Cormorant Garamond',serif;font-size:2.2rem;font-weight:700;color:#e8e0d0;margin-bottom:10px;letter-spacing:-0.02em; }
        .vsub { font-size:0.9rem;color:#555;line-height:1.7;margin-bottom:8px; }
        .vemail { color:#c8ff00;font-weight:500; }
        .vcard { background:#0f0f0f;border:1px solid #1c1c1c;border-radius:24px;padding:36px;margin-top:32px;text-align:left; }
        .vstep { display:flex;gap:14px;align-items:flex-start;padding:14px 0;border-bottom:1px solid #141414; }
        .vstep:last-child { border-bottom:none; }
        .vstep-num { width:28px;height:28px;border-radius:50%;background:rgba(200,255,0,0.1);border:1px solid rgba(200,255,0,0.3);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;color:#c8ff00;flex-shrink:0;margin-top:1px; }
        .vstep-text { font-size:0.85rem;color:#888;line-height:1.6; }
        .vstep-text strong { color:#e8e0d0; }
        .vbtns { display:flex;flex-direction:column;gap:12px;margin-top:28px; }
        .vbtn-primary { width:100%;background:#c8ff00;color:#000;border:none;border-radius:14px;padding:16px;font-size:0.95rem;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:background 0.2s,transform 0.15s; }
        .vbtn-primary:hover:not(:disabled) { background:#d4ff26;transform:translateY(-1px); }
        .vbtn-primary:disabled { opacity:0.5;cursor:not-allowed; }
        .vbtn-secondary { width:100%;background:none;border:1px solid #222;border-radius:14px;padding:14px;font-size:0.88rem;color:#666;font-family:'DM Sans',sans-serif;cursor:pointer;transition:border-color 0.2s,color 0.2s; }
        .vbtn-secondary:hover:not(:disabled) { border-color:#444;color:#aaa; }
        .vbtn-secondary:disabled { opacity:0.4;cursor:not-allowed; }
        .verr { background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:12px 16px;font-size:0.82rem;color:#f87171;margin-top:16px; }
        .vsuccess { background:rgba(200,255,0,0.06);border:1px solid rgba(200,255,0,0.2);border-radius:12px;padding:12px 16px;font-size:0.82rem;color:#c8ff00;margin-top:16px; }
        .vfooter { margin-top:28px;font-size:0.8rem;color:#333; }
        .vfooter a { color:#555;text-decoration:none;transition:color 0.2s; }
        .vfooter a:hover { color:#888; }
        .pulse { animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      <Navbar />
      <div className="vr">
        <div className="orb orb1" /><div className="orb orb2" />
        <div className="vbox">
          <div className="vicon">📧</div>
          <h1 className="vtitle">Check your inbox</h1>
          <p className="vsub">We sent a verification link to</p>
          {email && <p className="vsub"><span className="vemail">{email}</span></p>}
          <p className="vsub" style={{marginTop:"8px"}}>Click the link in the email to verify your account and start browsing.</p>

          <div className="vcard">
            <p style={{fontSize:"0.78rem",fontWeight:600,color:"#555",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"12px"}}>What to do</p>
            <div className="vstep">
              <div className="vstep-num">1</div>
              <div className="vstep-text"><strong>Open your email app</strong> — check your inbox for a message from VelvetViper</div>
            </div>
            <div className="vstep">
              <div className="vstep-num">2</div>
              <div className="vstep-text"><strong>Click the verification link</strong> — it will redirect you back to the site</div>
            </div>
            <div className="vstep">
              <div className="vstep-num">3</div>
              <div className="vstep-text"><strong>Check spam/junk</strong> if you don't see it within 2 minutes</div>
            </div>

            <div className="vbtns">
              <button className="vbtn-primary" onClick={handleCheckVerified} disabled={checking}>
                {checking ? <span className="pulse">Checking...</span> : "✓ I've verified my email"}
              </button>
              <button className="vbtn-secondary" onClick={handleResend} disabled={resending || resent}>
                {resending ? "Sending..." : resent ? "✅ Email sent!" : "Resend verification email"}
              </button>
            </div>

            {error && <div className="verr">⚠ {error}</div>}
            {resent && <div className="vsuccess">✅ Verification email resent! Check your inbox.</div>}
          </div>

          <div className="vfooter">
            Wrong email? <a href="/signup">Sign up again</a> · <a href="/login">Back to login</a>
          </div>
        </div>
      </div>
    </>
  );
}