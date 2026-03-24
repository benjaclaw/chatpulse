"use client";

import { Users, Building2, MessageSquare, MessagesSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAdminStats } from "@/lib/mock-data";

const stats = [
  {
    label: "Totale brukere",
    value: mockAdminStats.totalUsers,
    icon: Users,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    label: "Workspaces",
    value: mockAdminStats.totalWorkspaces,
    icon: Building2,
    color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    label: "Samtaler",
    value: mockAdminStats.totalConversations,
    icon: MessageSquare,
    color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    label: "Meldinger",
    value: mockAdminStats.totalMessages,
    icon: MessagesSquare,
    color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistikk</h1>
        <p className="mt-1 text-muted-foreground">
          Oversikt over alle brukere, workspaces og aktivitet.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
