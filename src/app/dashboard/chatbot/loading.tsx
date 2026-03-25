export default function ChatbotLoading(): React.ReactNode {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-9 w-44 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-5 w-72 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-5">
          {/* Field skeletons */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
            </div>
          ))}

          {/* Textarea skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-24 w-full animate-pulse rounded-lg bg-muted" />
          </div>

          {/* Button skeleton */}
          <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
