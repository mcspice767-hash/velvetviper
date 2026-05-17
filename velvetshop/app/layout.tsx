import type { Metadata } from "next";
import AuthGuard from "../lib/AuthGuard";
import "./globals.css";

export const metadata: Metadata = {
  title: "VelvetViper | Premium Reptile Marketplace",
  description: "VelvetViper is the luxury reptile marketplace for premium listings, feeders, and secure checkout.",
  themeColor: "#050505",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--bg)] text-[var(--text)]">
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
