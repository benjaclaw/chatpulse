import { HomePage } from "@/components/landing/home-page";

export const metadata = {
  title: "ChatPulse — AI-chatbot for din bedrift",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ChatPulse",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Tren chatboten med din kunnskapsbase. Embed på nettsiden. Se hva kundene spør om. Klar på minutter.",
  url: "https://chatpulse.no",
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
