export default function UpgradeLoading(): React.ReactNode {
  return (
    <div className="space-y-6 animate-scroll-fade">
      <div className="h-5 w-48 rounded-md bg-muted animate-shimmer" />
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-12">
        <div className="h-9 w-64 mx-auto rounded-lg bg-muted animate-shimmer" />
        <div className="h-5 w-80 mx-auto rounded-md bg-muted animate-shimmer" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-xl border bg-muted/30 animate-shimmer"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
