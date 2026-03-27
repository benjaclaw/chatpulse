"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { hasAnalyticsConsent } from "./cookie-banner";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function GoogleAnalytics(): React.ReactNode {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(hasAnalyticsConsent());
  }, []);

  if (!consented || !GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
