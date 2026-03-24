import {
  BookOpen,
  MessageSquare,
  HelpCircle,
  Rocket,
  ArrowRight,
  Bot,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard — ChatPulse",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome to ChatPulse. Here&apos;s an overview of your workspace.
        </p>
      </div>

      {/* Onboarding banner */}
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 dark:from-primary/10 dark:to-accent/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
              <Rocket className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Get started with ChatPulse</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up your AI chatbot in 3 simple steps: add knowledge, configure your bot, and embed the widget.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/knowledge"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Add knowledge
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={BookOpen}
          title="Knowledge Base"
          description="Add content your chatbot can use to answer questions."
          count={0}
          unit="articles"
          emptyText="No articles yet"
          emptyHint="Add your first article to start training your chatbot"
        />
        <StatCard
          icon={MessageSquare}
          title="Conversations"
          description="Chat sessions from your website visitors."
          count={0}
          unit="total"
          emptyText="No conversations yet"
          emptyHint="Conversations will appear once your chatbot is live"
        />
        <StatCard
          icon={HelpCircle}
          title="Unanswered Questions"
          description="Questions your chatbot couldn't answer."
          count={0}
          unit="pending"
          emptyText="All caught up!"
          emptyHint="Unanswered questions will show up here"
        />
      </div>

      {/* Quick actions when empty */}
      <div className="rounded-xl border bg-card p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Your chatbot awaits</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Once you add knowledge and configure your chatbot, it&apos;ll be ready to help your customers around the clock.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard/knowledge"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            <BookOpen className="h-4 w-4" />
            Knowledge Base
          </Link>
          <Link
            href="/dashboard/chatbot"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Sparkles className="h-4 w-4" />
            Configure Chatbot
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  description,
  count,
  unit,
  emptyText,
  emptyHint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  count: number;
  unit: string;
  emptyText: string;
  emptyHint: string;
}) {
  const isEmpty = count === 0;

  return (
    <div className="group rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>

      {isEmpty ? (
        <div className="mt-4 rounded-lg bg-muted/50 p-3 dark:bg-muted/30">
          <p className="text-sm font-medium text-muted-foreground">{emptyText}</p>
          <p className="mt-0.5 text-xs text-muted-foreground/70">{emptyHint}</p>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-3xl font-bold">{count}</p>
          <p className="text-xs text-muted-foreground">{unit}</p>
        </div>
      )}
    </div>
  );
}
