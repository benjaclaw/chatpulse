"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Building2,
  Bot,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  ChevronsUpDown,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/auth-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import type { UserInfo, Workspace } from "./shell";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Knowledge Base", href: "/dashboard/knowledge", icon: BookOpen },
  { label: "Company Info", href: "/dashboard/company", icon: Building2 },
  { label: "Chatbot", href: "/dashboard/chatbot", icon: Bot },
  { label: "Conversations", href: "/dashboard/conversations", icon: MessageSquare },
  { label: "Insights", href: "/dashboard/insights", icon: BarChart3 },
  { label: "Team", href: "/dashboard/team", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function getInitials(name?: string, email?: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email?.charAt(0).toUpperCase() ?? "?";
}

interface SidebarProps {
  user: UserInfo;
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  onWorkspaceChange: (id: string) => void;
}

export function Sidebar({
  user,
  workspaces,
  activeWorkspace,
  onWorkspaceChange,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r bg-card">
      {/* Workspace selector */}
      <div className="p-4">
        {workspaces.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 font-heading text-base font-semibold hover:bg-muted transition-colors">
              <span className="truncate">{activeWorkspace.name}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[228px]" align="start">
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => onWorkspaceChange(ws.id)}
                  className={ws.id === activeWorkspace.id ? "bg-accent/10" : ""}
                >
                  {ws.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={<Link href="/create-workspace" />}
              >
                + New workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="px-3 py-2 font-heading text-base font-semibold truncate">
            {activeWorkspace.name}
          </div>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator />

      {/* User menu */}
      <div className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-muted transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium truncate max-w-[160px]">
                {user.name ?? user.email}
              </span>
              {user.name && (
                <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                  {user.email}
                </span>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[228px]" align="start" side="top">
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
