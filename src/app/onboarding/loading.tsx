export default function OnboardingLoading(): React.ReactNode {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg space-y-6 p-4">
        <div className="h-8 w-52 animate-pulse rounded-lg bg-muted mx-auto" />
        <div className="h-5 w-72 animate-pulse rounded-md bg-muted mx-auto" />
        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
