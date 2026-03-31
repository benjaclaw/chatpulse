export default function LeadsLoading(): React.ReactNode {
  return (
    <div className="space-y-6 animate-scroll-fade">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-32 rounded-lg bg-muted animate-shimmer" />
          <div className="mt-2 h-5 w-56 rounded-md bg-muted animate-shimmer" style={{ animationDelay: "50ms" }} />
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-5 w-24 rounded bg-muted animate-shimmer" style={{ animationDelay: `${100 + col * 100}ms` }} />
              <div className="h-5 w-6 rounded-full bg-muted animate-shimmer" style={{ animationDelay: `${125 + col * 100}ms` }} />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 - col }).map((_, card) => (
                <div
                  key={card}
                  className="rounded-lg border bg-background p-3 space-y-2"
                >
                  <div className="h-4 w-36 rounded bg-muted animate-shimmer" style={{ animationDelay: `${200 + col * 100 + card * 75}ms` }} />
                  <div className="h-3 w-44 rounded bg-muted animate-shimmer" style={{ animationDelay: `${225 + col * 100 + card * 75}ms` }} />
                  <div className="h-3 w-20 rounded bg-muted animate-shimmer" style={{ animationDelay: `${250 + col * 100 + card * 75}ms` }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
