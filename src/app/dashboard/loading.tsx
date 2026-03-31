export default function DashboardLoading(): React.ReactNode {
  return (
    <div className="space-y-8 animate-scroll-fade">
      {/* Page header skeleton */}
      <div>
        <div className="h-9 w-48 rounded-lg bg-muted animate-shimmer" />
        <div className="mt-2 h-5 w-64 rounded-md bg-muted animate-shimmer" style={{ animationDelay: "50ms" }} />
      </div>

      {/* Banner skeleton */}
      <div className="h-[104px] rounded-xl border bg-muted/30 animate-shimmer" style={{ animationDelay: "100ms" }} />

      {/* Stats grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted animate-shimmer" style={{ animationDelay: `${150 + i * 75}ms` }} />
              <div className="h-4 w-24 rounded-md bg-muted animate-shimmer" style={{ animationDelay: `${175 + i * 75}ms` }} />
            </div>
            <div className="mt-3 h-9 w-16 rounded-md bg-muted animate-shimmer" style={{ animationDelay: `${200 + i * 75}ms` }} />
          </div>
        ))}
      </div>

      {/* Activity + quick actions skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="h-5 w-32 rounded-md bg-muted animate-shimmer" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-1.5">
                <div className="h-6 w-6 shrink-0 rounded bg-muted animate-shimmer" style={{ animationDelay: `${i * 100}ms` }} />
                <div className="h-4 flex-1 rounded bg-muted animate-shimmer" style={{ animationDelay: `${i * 100 + 50}ms` }} />
                <div className="h-3 w-12 shrink-0 rounded bg-muted animate-shimmer" style={{ animationDelay: `${i * 100 + 75}ms` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="h-5 w-36 rounded-md bg-muted animate-shimmer" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="h-10 w-10 shrink-0 rounded-xl bg-muted animate-shimmer" style={{ animationDelay: `${i * 100}ms` }} />
                <div className="space-y-1.5">
                  <div className="h-4 w-20 rounded bg-muted animate-shimmer" style={{ animationDelay: `${i * 100 + 50}ms` }} />
                  <div className="h-3 w-24 rounded bg-muted animate-shimmer" style={{ animationDelay: `${i * 100 + 75}ms` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
