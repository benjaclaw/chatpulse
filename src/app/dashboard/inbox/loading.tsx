export default function InboxLoading(): React.ReactNode {
  return (
    <div className="space-y-4 animate-scroll-fade">
      <div>
        <div className="h-9 w-32 rounded-lg bg-muted animate-shimmer" />
        <div className="mt-2 h-5 w-56 rounded-md bg-muted animate-shimmer" style={{ animationDelay: "50ms" }} />
      </div>
      <div className="flex h-[calc(100vh-220px)] min-h-[400px] overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Conversation list skeleton */}
        <div className="w-80 border-r p-3 space-y-3">
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 flex-1 rounded-lg bg-muted animate-shimmer" style={{ animationDelay: `${100 + i * 50}ms` }} />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 shrink-0 rounded-full bg-muted animate-shimmer" style={{ animationDelay: `${250 + i * 100}ms` }} />
                <div className="h-4 flex-1 rounded bg-muted animate-shimmer" style={{ animationDelay: `${275 + i * 100}ms` }} />
              </div>
              <div className="h-3 w-3/4 rounded bg-muted animate-shimmer" style={{ animationDelay: `${300 + i * 100}ms` }} />
            </div>
          ))}
        </div>
        {/* Chat panel skeleton */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-muted animate-shimmer" />
          <div className="h-4 w-40 rounded bg-muted animate-shimmer" style={{ animationDelay: "50ms" }} />
        </div>
      </div>
    </div>
  );
}
