"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Pages that don't require login
const PUBLIC_PAGES = ["/", "/login", "/signup", "/reset-password", "/browse"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setChecking(false);

    const isPublicPage = PUBLIC_PAGES.some(p =>
      pathname === p || (p !== "/" && pathname.startsWith(p))
    );

    if (!user && !isPublicPage) {
      router.push("/login?redirect=" + pathname);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#c8ff00] text-2xl animate-pulse">🐍 Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}