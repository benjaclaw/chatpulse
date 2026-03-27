import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main id="main-content" className="flex flex-1 flex-col">{children}</main>
      <LandingFooter />
    </div>
  );
}
