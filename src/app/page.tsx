"use client";

import Link from "next/link";
import { Bot, MessageSquare, BarChart3, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <span className="font-heading text-xl font-bold text-primary">
          ChatPulse
        </span>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
            Sign in
          </Link>
          <Link href="/signup" className={cn(buttonVariants())}>
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col">
        <section className="relative flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24">
          {/* Background gradient */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
            <div className="absolute -bottom-20 right-1/4 h-[300px] w-[500px] rounded-full bg-accent/5 blur-3xl dark:bg-accent/10" />
          </div>

          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              AI-powered customer support
            </div>

            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Your AI chatbot,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                trained on your data
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              ChatPulse lets you build a custom AI chatbot for your website in
              minutes. Add your knowledge base, customize the widget, and let AI
              handle customer questions 24/7.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
                Start for free
              </Link>
              <Link href="/login" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
                Sign in to dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="border-t bg-card/50 px-4 py-16 dark:bg-card/20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Everything you need
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              From knowledge base to live widget — get your AI chatbot up and running in minutes.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Bot}
                title="Custom AI Chatbot"
                description="Train your chatbot on your own data. It learns your products, policies, and tone of voice."
              />
              <FeatureCard
                icon={MessageSquare}
                title="Live Conversations"
                description="Monitor and review all customer conversations. Step in when the AI needs help."
              />
              <FeatureCard
                icon={BarChart3}
                title="Actionable Insights"
                description="See what customers ask most. Find gaps in your knowledge base and improve over time."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground sm:px-6">
        <p>&copy; {new Date().getFullYear()} ChatPulse. Built with AI.</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:hover:border-primary/20">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
