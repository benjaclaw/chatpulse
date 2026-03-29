import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps): React.ReactNode {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed bg-card/50 p-8 text-center transition-colors dark:bg-card/20 sm:p-12">
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 dark:bg-primary/10" />
      <div className="pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-accent/5 dark:bg-accent/10" />

      <div className="relative">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform duration-300 hover:scale-110 dark:bg-primary/20">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-5 text-base font-semibold">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
