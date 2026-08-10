"use client";

import Script from "next/script";

export default function TawkChat() {
  return (
    <>
      <Script
        id="tawk-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/6a7944dcb080171d470f0a4b/1jvkr9vrh';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();

window.tawkChatOpen = function() {
  if (window.Tawk_API) {
    if (window.Tawk_API.toggle) {
      window.Tawk_API.toggle();
    } else if (window.Tawk_API.maximize) {
      window.Tawk_API.maximize();
    } else if (window.Tawk_API.popup) {
      window.Tawk_API.popup();
    }
  }
};

window.tawkChatSendOrder = function(payload) {
  if (!payload || !window.Tawk_API) return;
  try {
    if (window.Tawk_API.setAttributes) {
      window.Tawk_API.setAttributes({
        name: payload.name || "",
        email: payload.email || "",
        phone: payload.phone || "",
      });
    }
    if (window.Tawk_API.addEvent) {
      window.Tawk_API.addEvent("Order Confirmation", {
        orderId: payload.orderId || "",
        total: payload.total || 0,
        items: payload.items || "",
        message: payload.message || "",
      });
    }
    window.tawkChatOpen();
  } catch (err) {
    console.error("Tawk helper error:", err);
  }
};
`,
        }}
      />
    </>
  );
}
