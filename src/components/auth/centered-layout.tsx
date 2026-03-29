/** Shared centered layout with gradient background and ChatPulse branding. */
export function CenteredLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[400px] rounded-full bg-accent/5 blur-3xl dark:bg-accent/10" />
      </div>
      <div className="relative z-10 w-full max-w-md animate-scroll-fade">
        <div className="mb-8 text-center">
          <span className="font-heading text-2xl font-bold text-primary">
            ChatPulse
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
