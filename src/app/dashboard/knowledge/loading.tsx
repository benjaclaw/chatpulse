export default function KnowledgeLoading(): React.ReactNode {
  return (
    <div className="space-y-6 animate-scroll-fade">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-9 w-48 rounded-lg bg-muted animate-shimmer" />
          <div className="mt-2 h-5 w-64 rounded-md bg-muted animate-shimmer" style={{ animationDelay: "50ms" }} />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 rounded-lg bg-muted animate-shimmer" style={{ animationDelay: "100ms" }} />
          <div className="h-10 w-28 rounded-lg bg-muted animate-shimmer" style={{ animationDelay: "150ms" }} />
        </div>
      </div>

      {/* Search skeleton */}
      <div className="h-10 w-full rounded-lg bg-muted animate-shimmer" style={{ animationDelay: "200ms" }} />

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-40 rounded bg-muted animate-shimmer" style={{ animationDelay: `${250 + i * 100}ms` }} />
                  <div className="h-5 w-16 rounded-full bg-muted animate-shimmer" style={{ animationDelay: `${275 + i * 100}ms` }} />
                </div>
                <div className="h-4 w-full rounded bg-muted animate-shimmer" style={{ animationDelay: `${300 + i * 100}ms` }} />
                <div className="h-3 w-24 rounded bg-muted animate-shimmer" style={{ animationDelay: `${325 + i * 100}ms` }} />
              </div>
              <div className="h-8 w-8 rounded-lg bg-muted animate-shimmer" style={{ animationDelay: `${350 + i * 100}ms` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
