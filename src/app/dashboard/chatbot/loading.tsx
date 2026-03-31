export default function ChatbotLoading(): React.ReactNode {
  return (
    <div className="space-y-6 animate-scroll-fade">
      <div>
        <div className="h-9 w-44 rounded-lg bg-muted animate-shimmer" />
        <div className="mt-2 h-5 w-72 rounded-md bg-muted animate-shimmer" style={{ animationDelay: "50ms" }} />
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-28 rounded bg-muted animate-shimmer" style={{ animationDelay: `${100 + i * 100}ms` }} />
              <div className="h-10 w-full rounded-lg bg-muted animate-shimmer" style={{ animationDelay: `${125 + i * 100}ms` }} />
            </div>
          ))}

          {/* Textarea skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-muted animate-shimmer" style={{ animationDelay: "500ms" }} />
            <div className="h-24 w-full rounded-lg bg-muted animate-shimmer" style={{ animationDelay: "525ms" }} />
          </div>

          {/* Button skeleton */}
          <div className="h-10 w-32 rounded-lg bg-muted animate-shimmer" style={{ animationDelay: "575ms" }} />
        </div>
      </div>
    </div>
  );
}
