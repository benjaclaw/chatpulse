export default function AnalyticsLoading(): React.ReactNode {
  return (
    <div className="space-y-6 animate-scroll-fade">
      <div>
        <div className="h-9 w-48 rounded-lg bg-muted animate-shimmer" />
        <div className="mt-2 h-5 w-72 rounded-md bg-muted animate-shimmer" style={{ animationDelay: "50ms" }} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted animate-shimmer" style={{ animationDelay: `${i * 100}ms` }} />
              <div className="h-4 w-24 rounded-md bg-muted animate-shimmer" style={{ animationDelay: `${i * 100 + 50}ms` }} />
            </div>
            <div className="mt-3 h-9 w-16 rounded-md bg-muted animate-shimmer" style={{ animationDelay: `${i * 100 + 75}ms` }} />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-72 rounded-xl border bg-muted/30 animate-shimmer"
            style={{ animationDelay: `${400 + i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
