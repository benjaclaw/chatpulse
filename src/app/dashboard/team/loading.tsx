export default function TeamLoading(): React.ReactNode {
  return (
    <div className="space-y-6 animate-scroll-fade">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-9 w-28 rounded-lg bg-muted animate-shimmer" />
          <div className="mt-2 h-5 w-56 rounded-md bg-muted animate-shimmer" style={{ animationDelay: "50ms" }} />
        </div>
        <div className="h-10 w-32 rounded-lg bg-muted animate-shimmer" style={{ animationDelay: "100ms" }} />
      </div>
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="p-6 space-y-1.5">
          <div className="h-6 w-32 rounded bg-muted animate-shimmer" style={{ animationDelay: "150ms" }} />
          <div className="h-4 w-56 rounded bg-muted animate-shimmer" style={{ animationDelay: "200ms" }} />
        </div>
        <div className="px-6 pb-6 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-muted animate-shimmer" style={{ animationDelay: `${250 + i * 100}ms` }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-32 rounded bg-muted animate-shimmer" style={{ animationDelay: `${275 + i * 100}ms` }} />
                <div className="h-3 w-48 rounded bg-muted animate-shimmer" style={{ animationDelay: `${300 + i * 100}ms` }} />
              </div>
              <div className="h-6 w-16 rounded-full bg-muted animate-shimmer" style={{ animationDelay: `${325 + i * 100}ms` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
