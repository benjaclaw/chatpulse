export default function LeadsLoading(): React.ReactNode {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
          <div className="mt-2 h-5 w-56 animate-pulse rounded-md bg-muted" />
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-6 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 - col }).map((_, card) => (
                <div
                  key={card}
                  className="rounded-lg border bg-background p-3 space-y-2"
                >
                  <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-44 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
