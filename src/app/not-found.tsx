import Link from "next/link";
import { ArrowLeft, MessageCircleQuestion } from "lucide-react";

export default function NotFound(): React.ReactNode {
  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-accent/5 blur-3xl dark:bg-accent/10" />

      <div className="relative">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20">
          <MessageCircleQuestion className="h-10 w-10 text-primary" />
        </div>
        <p className="font-heading text-8xl font-bold text-primary/20 dark:text-primary/30">404</p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Siden ble ikke funnet
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Beklager, vi fant ikke siden du lette etter. Den kan ha blitt flyttet
          eller slettet.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Tilbake til forsiden
        </Link>
        <nav className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/pricing" className="rounded-md px-2 py-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Priser
          </Link>
          <Link href="/features" className="rounded-md px-2 py-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Funksjoner
          </Link>
          <Link href="/login" className="rounded-md px-2 py-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Logg inn
          </Link>
        </nav>
      </div>
    </div>
  );
}
