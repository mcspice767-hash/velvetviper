"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/verify", "/browse", "/feeders"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const check = async () => {
      const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));

      // Only guard checkout and protected pages
      const isProtected = pathname.startsWith("/checkout") || pathname.startsWith("/order-tracking") || pathname.startsWith("/account");

      if (!isProtected) { setChecked(true); return; }

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login?redirect=" + encodeURIComponent(pathname));
        return;
      }

      if (!session.user.email_confirmed_at) {
        localStorage.setItem("pending_verification_email", session.user.email || "");
        router.push("/verify");
        return;
      }

      setChecked(true);
    };

    check();
  }, [pathname, router]);

  if (!checked && (pathname.startsWith("/checkout") || pathname.startsWith("/order-tracking") || pathname.startsWith("/account"))) {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#c8ff00", fontSize: "2rem" }}>🐍</div>
      </div>
    );
  }

  return <>{children}</>;
}