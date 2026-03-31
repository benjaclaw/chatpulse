export default function InsightsLoading(): React.ReactNode {
  return (
    <div className="space-y-6 animate-scroll-fade">
      <div>
        <div className="h-9 w-36 rounded-lg bg-muted animate-shimmer" />
        <div className="mt-2 h-5 w-64 rounded-md bg-muted animate-shimmer" style={{ animationDelay: "50ms" }} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-muted animate-shimmer" style={{ animationDelay: `${100 + i * 75}ms` }} />
              <div className="h-4 w-24 rounded bg-muted animate-shimmer" style={{ animationDelay: `${125 + i * 75}ms` }} />
            </div>
            <div className="mt-2 h-8 w-12 rounded bg-muted animate-shimmer" style={{ animationDelay: `${150 + i * 75}ms` }} />
          </div>
        ))}
      </div>
      {/* Filter skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-lg bg-muted animate-shimmer" style={{ animationDelay: `${300 + i * 50}ms` }} />
        ))}
      </div>
      {/* Chart skeleton */}
      <div className="h-64 rounded-xl border bg-muted/30 animate-shimmer" style={{ animationDelay: "450ms" }} />
      {/* List skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
            <div className="h-8 w-8 shrink-0 rounded-full bg-muted animate-shimmer" style={{ animationDelay: `${500 + i * 100}ms` }} />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-48 rounded bg-muted animate-shimmer" style={{ animationDelay: `${525 + i * 100}ms` }} />
              <div className="h-3 w-24 rounded bg-muted animate-shimmer" style={{ animationDelay: `${550 + i * 100}ms` }} />
            </div>
            <div className="h-6 w-20 rounded-full bg-muted animate-shimmer" style={{ animationDelay: `${575 + i * 100}ms` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
