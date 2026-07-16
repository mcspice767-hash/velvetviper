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
          id="smartsupp"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var _smartsupp = _smartsupp || {};
              _smartsupp.key = '206a5b2a55dc18f579751d4bc0238d81b164f5ed';
              window.smartsupp||(function(d) {
                var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
                s=d.getElementsByTagName('script')[0];c=d.createElement('script');
                c.type='text/javascript';c.charset='utf-8';c.async=true;
                c.src='https://www.smartsuppchat.com/loader.js?';
                s.parentNode.insertBefore(c,s);
              })(document);

              window.openSmartsuppChat = function() {
                var attempts = 0;
                var interval = setInterval(function() {
                  attempts++;
                  if (window.smartsupp && typeof window.smartsupp === 'function') {
                    window.smartsupp('chat:open');
                    clearInterval(interval);
                  } else if (attempts > 20) {
                    clearInterval(interval);
                    window.open('https://wa.me/+1234567890', '_blank');
                  }
                }, 300);
              };
            `,
          }}
        />
        <noscript>
          Powered by <a href="https://www.smartsupp.com" target="_blank" rel="noreferrer">Smartsupp</a>
        </noscript>
      </body>
    </html>
  );
}