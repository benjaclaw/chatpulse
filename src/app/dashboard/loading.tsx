export default function DashboardLoading(): React.ReactNode {
  return (
    <div className="space-y-8">
      {/* Page header skeleton */}
      <div>
        <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-5 w-64 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Banner skeleton */}
      <div className="h-[104px] animate-pulse rounded-xl border bg-muted" />

      {/* Stats grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
            </div>
            <div className="mt-3 h-9 w-16 animate-pulse rounded-md bg-muted" />
          </div>
        ))}
      </div>

      {/* Activity + quick actions skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-2">
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-muted" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="h-5 w-36 animate-pulse rounded-md bg-muted" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-muted" />
                <div className="space-y-1.5">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
