import { Users, Building2, MessageSquare, MessagesSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { createT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const t = createT("nb");

const statConfig = [
  {
    label: t('admin.totalUsers'),
    key: "totalUsers" as const,
    icon: Users,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    label: t('admin.workspaces'),
    key: "totalWorkspaces" as const,
    icon: Building2,
    color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    label: t('admin.conversations'),
    key: "totalConversations" as const,
    icon: MessageSquare,
    color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    label: t('admin.messages'),
    key: "totalMessages" as const,
    icon: MessagesSquare,
    color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
  },
];

export default async function AdminDashboardPage(): Promise<React.ReactNode> {
  const supabase = await createClient();

  const [profilesResult, wsResult, convResult, msgResult] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("workspaces").select("id", { count: "exact", head: true }),
    supabase.from("conversations").select("id", { count: "exact", head: true }),
    supabase.from("messages").select("id", { count: "exact", head: true }),
  ]);

  const stats = {
    totalUsers: profilesResult.count ?? 0,
    totalWorkspaces: wsResult.count ?? 0,
    totalConversations: convResult.count ?? 0,
    totalMessages: msgResult.count ?? 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('admin.stats')}</h1>
        <p className="mt-1 text-muted-foreground">
          {t('admin.statsDescription')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statConfig.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats[stat.key]}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
