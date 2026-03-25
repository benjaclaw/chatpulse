export default function AdminLoading(): React.ReactNode {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div>
        <div className="h-9 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-5 w-72 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 ring-1 ring-foreground/10"
          >
            <div className="flex items-center justify-between px-4">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
            </div>
            <div className="px-4">
              <div className="h-9 w-16 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
