import "@/app/globals.css";

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <html lang="no">
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
