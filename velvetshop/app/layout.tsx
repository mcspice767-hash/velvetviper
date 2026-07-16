import type { Metadata } from "next";
import SmartsuppChat from "../components/SmartsuppChat";
import "./globals.css";

export const metadata: Metadata = {
  title: "VelvetViper | Premium Reptile Marketplace",
  description: "VelvetViper is the luxury reptile marketplace for premium listings, feeders, and secure checkout.",
  themeColor: "#050505",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--bg)] text-[var(--text)]">
        {children}

        <SmartsuppChat />

        <noscript>
          Powered by <a href="https://www.smartsupp.com" target="_blank" rel="noreferrer">Smartsupp</a>
        </noscript>
      </body>
    </html>
  );
}