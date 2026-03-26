import type { Metadata } from "next";
import { FeaturesPage } from "@/components/landing/features-page";

export const metadata: Metadata = {
  title: "Funksjoner — ChatPulse",
  description:
    "Alt du trenger for smartere kundeservice. AI-chatbot, live chat, innsikt, rapportering og mer — klar på 5 minutter.",
};

export default function Page(): React.ReactNode {
  return <FeaturesPage />;
}
