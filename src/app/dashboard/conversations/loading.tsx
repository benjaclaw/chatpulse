export default function ConversationsLoading(): React.ReactNode {
  return (
    <div className="space-y-6 animate-scroll-fade">
      <div>
        <div className="h-9 w-44 rounded-lg bg-muted animate-shimmer" />
        <div className="mt-2 h-5 w-64 rounded-md bg-muted animate-shimmer" style={{ animationDelay: "50ms" }} />
      </div>

      {/* Search + export skeleton */}
      <div className="flex gap-2">
        <div className="h-10 flex-1 rounded-lg bg-muted animate-shimmer" style={{ animationDelay: "100ms" }} />
        <div className="h-10 w-32 rounded-lg bg-muted animate-shimmer" style={{ animationDelay: "150ms" }} />
      </div>

      {/* Date filter skeleton */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-lg bg-muted animate-shimmer" style={{ animationDelay: `${200 + i * 50}ms` }} />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="h-10 w-10 shrink-0 rounded-full bg-muted animate-shimmer" style={{ animationDelay: `${400 + i * 100}ms` }} />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="h-4 w-48 rounded bg-muted animate-shimmer" style={{ animationDelay: `${425 + i * 100}ms` }} />
                <div className="h-5 w-14 rounded-full bg-muted animate-shimmer" style={{ animationDelay: `${450 + i * 100}ms` }} />
              </div>
              <div className="h-3 w-32 rounded bg-muted animate-shimmer" style={{ animationDelay: `${475 + i * 100}ms` }} />
            </div>
            <div className="h-5 w-5 rounded bg-muted animate-shimmer" style={{ animationDelay: `${500 + i * 100}ms` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
