import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />

      <main className="relative flex flex-1 items-center justify-center p-4">
        {/* Subtle background gradient */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {children}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
