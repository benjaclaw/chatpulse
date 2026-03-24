import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6">
        <span className="font-heading text-xl font-bold text-primary">
          ChatPulse
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="inline-flex h-8 items-center rounded-lg px-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
          Your AI chatbot,{" "}
          <span className="text-primary">trained on your data</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          ChatPulse lets you build a custom AI chatbot for your website in
          minutes. Add your knowledge base, customize the widget, and let AI
          handle customer questions 24/7.
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            href="/signup"
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            Start for free
          </Link>
        </div>
      </main>
    </div>
  );
}
