import type { Metadata } from "next";
import { HomePage } from "@/components/landing/home-page";

const siteUrl = "https://chatpulse.no";

export const metadata: Metadata = {
  title: "ChatPulse — AI-chatbot for din bedrift",
  description:
    "Tren chatboten med din kunnskapsbase. Embed på nettsiden. Se hva kundene spør om. Klar på minutter.",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "ChatPulse — AI-chatbot for din bedrift",
    description:
      "Tren chatboten med din kunnskapsbase. Embed på nettsiden. Se hva kundene spør om. Klar på minutter.",
    url: siteUrl,
    type: "website",
    siteName: "ChatPulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatPulse — AI-chatbot for din bedrift",
    description:
      "Tren chatboten med din kunnskapsbase. Embed på nettsiden. Se hva kundene spør om. Klar på minutter.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ChatPulse",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Tren chatboten med din kunnskapsbase. Embed på nettsiden. Se hva kundene spør om. Klar på minutter.",
  url: siteUrl,
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "NOK",
      name: "Free",
    },
    {
      "@type": "Offer",
      price: "499",
      priceCurrency: "NOK",
      name: "Pro",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "50",
  },
};

export default function Page(): React.ReactNode {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage />
    </>
  );
}
