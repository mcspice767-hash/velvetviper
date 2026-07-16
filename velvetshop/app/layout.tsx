import type { Metadata } from "next";
import Script from "next/script";
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
        {children}

        <Script
          id="smartsupp-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var _smartsupp = _smartsupp || {};
              _smartsupp.key = '206a5b2a55dc18f579751d4bc0238d81b164f5ed';
            `,
          }}
        />

        <Script
          id="smartsupp-loader"
          strategy="afterInteractive"
          src="https://www.smartsuppchat.com/loader.js?"
          onLoad={() => {
            console.log('Smartsupp loaded successfully');
          }}
        />
        <noscript>
          Powered by <a href="https://www.smartsupp.com" target="_blank" rel="noreferrer">Smartsupp</a>
        </noscript>
      </body>
    </html>
  );
}