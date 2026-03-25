import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from "@/components/google-analytics";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const siteUrl = "https://chatpulse.no";

export const metadata: Metadata = {
  title: {
    default: "ChatPulse — AI-chatbot for din bedrift",
    template: "%s — ChatPulse",
  },
  description:
    "Tren chatboten med din kunnskapsbase. Embed på nettsiden. Se hva kundene spør om. Klar på minutter.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "ChatPulse — AI-chatbot for din bedrift",
    description:
      "Tren chatboten med din kunnskapsbase. Embed på nettsiden. Se hva kundene spør om. Klar på minutter.",
    type: "website",
    url: siteUrl,
    siteName: "ChatPulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatPulse — AI-chatbot for din bedrift",
    description:
      "Tren chatboten med din kunnskapsbase. Embed på nettsiden. Se hva kundene spør om. Klar på minutter.",
  },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactNode {
  return (
    <html
      lang="no"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {supabaseUrl && (
          <>
            <link rel="dns-prefetch" href={supabaseUrl} />
            <link rel="preconnect" href={supabaseUrl} />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
