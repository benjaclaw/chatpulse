import "@/app/globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <html lang="no" className={inter.variable}>
      <body className="bg-background font-sans text-foreground">
        {children}
        <noscript>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", padding: "1rem", textAlign: "center", fontFamily: "sans-serif", color: "#6b7280" }}>
            JavaScript må være aktivert for å bruke denne chatten.
          </div>
        </noscript>
      </body>
    </html>
  );
}
