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
  try {
    // Method 1: Click the widget button directly
    var widgetBtn = document.querySelector(
      '#smartsupp-widget-container button, #chat-application button, .smartsupp-widget-open, [class*="smartsupp"] button'
    );
    if (widgetBtn) {
      widgetBtn.click();
      return;
    }

    // Method 2: Find smartsupp iframe
    var iframe = document.querySelector('iframe[src*="smartsupp"]');
    if (iframe) {
      iframe.style.display = 'block';
      return;
    }

    // Method 3: WhatsApp fallback
    window.open('https://wa.me/YOURPHONENUMBER', '_blank');

  } catch(e) {
    window.open('https://wa.me/YOURPHONENUMBER', '_blank');
  }
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