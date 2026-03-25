"use client";

import {
  BookOpen,
  MessageSquare,
  HelpCircle,
  Users,
  ArrowRight,
  Rocket,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";

interface DashboardStats {
  totalConversations: number;
  messagesToday: number;
  unansweredQuestions: number;
  teamMembers: number;
}

export function DashboardContent({ stats }: { stats: DashboardStats }): React.ReactNode {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <p className="mt-1 text-muted-foreground">
          {t('dashboard.description')}
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
              <h2 className="text-lg font-semibold">{t('dashboard.onboarding.title')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('dashboard.onboarding.description')}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/knowledge"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            {t('dashboard.onboarding.cta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={MessageSquare}
          title={t('dashboard.stats.totalConversations')}
          value={stats.totalConversations}
          href="/dashboard/conversations"
        />
        <StatCard
          icon={MessageCircle}
          title={t('dashboard.stats.messagesToday')}
          value={stats.messagesToday}
        />
        <StatCard
          icon={HelpCircle}
          title={t('dashboard.stats.unansweredQuestions')}
          value={stats.unansweredQuestions}
          href="/dashboard/insights?filter=unanswered"
        />
        <StatCard
          icon={Users}
          title={t('dashboard.stats.teamMembers')}
          value={stats.teamMembers}
          href="/dashboard/team"
        />
      </div>

      {/* Recent activity + quick actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold">{t('dashboard.recentActivity')}</h3>
          <div className="mt-4 space-y-3">
            {stats.totalConversations === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t('dashboard.noActivity')}
              </p>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t('dashboard.activityLogSoon')}
              </p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold">{t('dashboard.quickActions')}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <QuickAction
              icon={BookOpen}
              title={t('dashboard.quick.knowledge')}
              description={t('dashboard.quick.knowledgeDesc')}
              href="/dashboard/knowledge"
            />
            <QuickAction
              icon={MessageSquare}
              title={t('dashboard.quick.conversations')}
              description={t('dashboard.quick.conversationsDesc')}
              href="/dashboard/conversations"
            />
            <QuickAction
              icon={HelpCircle}
              title={t('dashboard.quick.insights')}
              description={t('dashboard.quick.insightsDesc')}
              href="/dashboard/insights"
            />
            <QuickAction
              icon={Users}
              title={t('dashboard.quick.team')}
              description={t('dashboard.quick.teamDesc')}
              href="/dashboard/team"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number;
  href?: string;
}): React.ReactNode {
  const content = (
    <div className="group rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function QuickAction({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
}): React.ReactNode {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border p-3 transition-all duration-150 hover:bg-muted/50 hover:shadow-sm"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}
