export function FormError({ message }: { message: string | null }): React.ReactNode {
  if (!message) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-1 rounded-lg bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/20">
      {message}
    </div>
  );
}
