import type { Metadata } from "next";
import { PricingContent } from "@/components/pricing/pricing-content";

export const metadata: Metadata = {
  title: "Priser",
  description: "Se priser og planer for ChatPulse. Start gratis, oppgrader når du trenger mer. Fra 0 til 499 kr/mnd.",
  alternates: {
    canonical: "https://chatpulse.no/pricing",
  },
  openGraph: {
    title: "Priser — ChatPulse",
    description: "Se priser og planer for ChatPulse. Start gratis, oppgrader når du trenger mer. Fra 0 til 499 kr/mnd.",
    url: "https://chatpulse.no/pricing",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "ChatPulse Priser",
  description: "Se priser og planer for ChatPulse.",
  url: "https://chatpulse.no/pricing",
};

export default function PricingPage(): React.ReactNode {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PricingContent />
    </>
  );
}
