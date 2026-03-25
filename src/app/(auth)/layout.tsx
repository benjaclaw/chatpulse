import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-block font-heading text-2xl font-bold text-primary transition-opacity hover:opacity-80"
          >
            ChatPulse
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
