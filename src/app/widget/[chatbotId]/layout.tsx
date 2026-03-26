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
      <body className="bg-background font-sans text-foreground">{children}</body>
    </html>
  );
}
