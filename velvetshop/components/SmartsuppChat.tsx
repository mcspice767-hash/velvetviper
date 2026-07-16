"use client";

import Script from "next/script";

export default function SmartsuppChat() {
    return (
        <>
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
        </>
    );
}
