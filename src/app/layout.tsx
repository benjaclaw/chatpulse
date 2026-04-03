import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from "@/components/google-analytics";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
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
  icons: {
    icon: "/favicon.png",
  },
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
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PTRQBMM7');`,
          }}
        />
        {/* End Google Tag Manager */}
        {supabaseUrl && (
          <>
            <link rel="dns-prefetch" href={supabaseUrl} />
            <link rel="preconnect" href={supabaseUrl} />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PTRQBMM7"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded"
        >
          Hopp til innhold
        </a>
        <GoogleAnalytics />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
