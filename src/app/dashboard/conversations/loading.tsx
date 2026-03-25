export default function ConversationsLoading(): React.ReactNode {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-9 w-44 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-5 w-64 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="h-3 w-64 animate-pulse rounded bg-muted" />
            </div>
            <div className="space-y-1.5 text-right">
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
