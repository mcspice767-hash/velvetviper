"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";

interface NavbarProps {
  cart?: Array<{ quantity?: number | string; cartQuantity?: number }>;
  onCartClick?: () => void;
}

export default function Navbar({ cart = [], onCartClick }: NavbarProps) {
  const [user, setUser] = useState<{ email?: string | null } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) {
        setUser(data.user ?? null);
      }
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    closeDrawer();
  };

  const totalItems = cart?.reduce((sum, item) => {
    const quantity = typeof item.cartQuantity === "number"
      ? item.cartQuantity
      : typeof item.quantity === "number"
      ? item.quantity
      : 0;

    return sum + quantity;
  }, 0) || 0;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          <span className="navbar-logo">🐍</span>
          <span>
            <span className="navbar-brand-eyebrow">Velvet</span>
            <span className="navbar-brand-name">Viper</span>
          </span>
        </Link>

        <nav className="navbar-links">
          <Link href="/" className="navbar-link">Home</Link>
          <Link href="/browse" className="navbar-link">Reptiles</Link>
          <Link href="/feeders" className="navbar-link">Feeders</Link>
          <Link href="/order-tracking" className="navbar-link">Track Order</Link>
        </nav>

        <div className="navbar-actions">
          <button type="button" className="btn btn-secondary btn-icon" onClick={() => { onCartClick?.(); closeDrawer(); }}>
            <span>🛒</span>
            {totalItems > 0 && <span className="badge badge-lime navbar-cart-badge">{totalItems}</span>}
          </button>

          {user?.email ? (
            <div className="navbar-user-group">
              <span className="navbar-user">{user.email}</span>
              <button type="button" className="btn btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link href="/login" className="btn btn-secondary">Sign in</Link>
              <Link href="/signup" className="btn btn-primary">Get Started</Link>
            </div>
          )}
        </div>

        <button
          type="button"
          className="navbar-hamburger"
          aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={drawerOpen}
          aria-controls="mobile-menu"
          onClick={() => setDrawerOpen((prev) => !prev)}
        >
          ☰
        </button>
      </div>

      <div id="mobile-menu" className={`navbar-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-top">
          <Link href="/" className="drawer-brand" onClick={closeDrawer}>
            <span className="navbar-logo">🐍</span>
            <span>VelvetViper</span>
          </Link>
          <button type="button" className="drawer-close" onClick={closeDrawer}>
            ✕
          </button>
        </div>

        <nav className="drawer-links">
          <Link href="/" className="drawer-link" onClick={closeDrawer}>Home</Link>
          <Link href="/browse" className="drawer-link" onClick={closeDrawer}>Reptiles</Link>
          <Link href="/feeders" className="drawer-link" onClick={closeDrawer}>Feeders</Link>
          <Link href="/order-tracking" className="drawer-link" onClick={closeDrawer}>Track Order</Link>
        </nav>

        <div className="drawer-actions">
          <button type="button" className="btn btn-secondary btn-full" onClick={() => { onCartClick?.(); closeDrawer(); }}>
            Cart {totalItems > 0 ? `(${totalItems})` : ""}
          </button>

          {user?.email ? (
            <>
              <div className="drawer-user-email">{user.email}</div>
              <button type="button" className="btn btn-secondary btn-full" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary btn-full" onClick={closeDrawer}>
                Sign in
              </Link>
              <Link href="/signup" className="btn btn-primary btn-full" onClick={closeDrawer}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>

      {drawerOpen && <button type="button" className="navbar-backdrop" onClick={closeDrawer} aria-label="Close navigation menu" />}
    </header>
  );
}
