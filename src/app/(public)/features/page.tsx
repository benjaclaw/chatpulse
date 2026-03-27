import type { Metadata } from "next";
import { FeaturesPage } from "@/components/landing/features-page";

export const metadata: Metadata = {
  title: "Funksjoner",
  description:
    "Alt du trenger for smartere kundeservice. AI-chatbot, live chat, innsikt, rapportering og mer — klar på 5 minutter.",
  alternates: {
    canonical: "https://chatpulse.no/features",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "ChatPulse Funksjoner",
  description:
    "Alt du trenger for smartere kundeservice. AI-chatbot, live chat, innsikt og rapportering.",
  url: "https://chatpulse.no/features",
  isPartOf: {
    "@type": "WebSite",
    name: "ChatPulse",
    url: "https://chatpulse.no",
  },
};

export default function Page(): React.ReactNode {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FeaturesPage />
    </>
  );
}
