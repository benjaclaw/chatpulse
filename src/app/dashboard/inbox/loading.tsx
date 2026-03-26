export default function InboxLoading(): React.ReactNode {
  return (
    <div className="space-y-4">
      <div>
        <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-5 w-56 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="flex h-[calc(100vh-220px)] min-h-[400px] overflow-hidden rounded-xl border bg-card">
        <div className="w-80 border-r p-3 space-y-3">
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 flex-1 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}
