import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { CookieConsent } from "@/components/landing/cookie-consent";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <LandingFooter />
      <CookieConsent />
    </div>
  );
}
