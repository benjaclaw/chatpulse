export default function SettingsLoading(): React.ReactNode {
  return (
    <div className="space-y-6 animate-scroll-fade">
      <div>
        <div className="h-9 w-44 rounded-lg bg-muted animate-shimmer" />
        <div className="mt-2 h-5 w-64 rounded-md bg-muted animate-shimmer" style={{ animationDelay: "50ms" }} />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card shadow-sm">
          <div className="p-6 space-y-1.5">
            <div className="h-6 w-32 rounded bg-muted animate-shimmer" style={{ animationDelay: `${100 + i * 150}ms` }} />
            <div className="h-4 w-56 rounded bg-muted animate-shimmer" style={{ animationDelay: `${125 + i * 150}ms` }} />
          </div>
          <div className="px-6 pb-6 space-y-4">
            <div className="h-10 w-full max-w-md rounded-lg bg-muted animate-shimmer" style={{ animationDelay: `${150 + i * 150}ms` }} />
          </div>
          <div className="px-6 pb-6">
            <div className="h-10 w-28 rounded-lg bg-muted animate-shimmer" style={{ animationDelay: `${175 + i * 150}ms` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
