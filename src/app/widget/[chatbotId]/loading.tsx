export default function WidgetLoading(): React.ReactNode {
  return (
    <div className="flex h-dvh w-full flex-col bg-card border">
      <div className="flex items-center gap-2 px-4 py-3 bg-muted">
        <div className="h-8 w-8 rounded-full bg-muted-foreground/10 animate-pulse" />
        <div className="space-y-1">
          <div className="h-4 w-24 rounded bg-muted-foreground/10 animate-pulse" />
          <div className="h-3 w-16 rounded bg-muted-foreground/10 animate-pulse" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-3">
        <div className="h-10 w-3/4 rounded-2xl bg-muted animate-pulse" />
        <div className="h-10 w-1/2 rounded-2xl bg-muted animate-pulse" />
      </div>
      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 h-10 rounded-lg bg-muted animate-pulse" />
          <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
