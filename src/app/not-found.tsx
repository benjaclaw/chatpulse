import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound(): React.ReactNode {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-heading text-7xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        Siden ble ikke funnet
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Beklager, vi fant ikke siden du lette etter. Den kan ha blitt flyttet
        eller slettet.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        <ArrowLeft className="h-4 w-4" />
        Tilbake til forsiden
      </Link>
      <nav className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
          Priser
        </Link>
        <Link href="/features" className="text-muted-foreground hover:text-foreground">
          Funksjoner
        </Link>
        <Link href="/login" className="text-muted-foreground hover:text-foreground">
          Logg inn
        </Link>
      </nav>
    </div>
  );
}
