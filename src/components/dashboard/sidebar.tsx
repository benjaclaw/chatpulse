"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsUpDown, LogOut, Lock } from "lucide-react";
import { hasFeature } from "@/lib/plans";
import type { PlanFeature } from "@/lib/plans";
import { signOut } from "@/lib/auth-actions";
import { NAV_ITEMS } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import type { UserInfo, Workspace } from "@/lib/types";
import { isNavActive, getInitials } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";

const LS_KEY = "chatpulse_agent_online";

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
}: SidebarProps): React.ReactNode {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(LS_KEY) === "true";
    }
    return false;
  });
  const [waitingCount, setWaitingCount] = useState(0);
  const supabase = createClient();
  
  // On mount: fetch real status from DB to sync with localStorage
  useEffect(() => {
    const syncPresenceFromDB = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: presence } = await supabase
          .from("agent_presence")
          .select("status")
          .eq("user_id", user.id)
          .eq("workspace_id", activeWorkspace.id)
          .single();

        const dbIsOnline = presence?.status === "online" || presence?.status === "busy";
        const lsIsOnline = localStorage.getItem(LS_KEY) === "true";

        // If localStorage and DB mismatch, trust DB
        if (dbIsOnline !== lsIsOnline) {
          setIsOnline(dbIsOnline);
          localStorage.setItem(LS_KEY, String(dbIsOnline));
        }
      } catch (err) {
        console.error('Failed to sync presence from DB:', err);
        // Fall back to localStorage on error
      }
    };

    syncPresenceFromDB();
  }, [activeWorkspace.id, supabase]);

  const manualOverride = useRef(false);

  // Toggle online status — wait for API before updating UI
  // Note: Business hours will override this after 1 hour (or on next page load)
  async function toggleOnline() {
    const newStatus = !isOnline;

    try {
      const res = await fetch("/api/presence", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: activeWorkspace.id, status: newStatus ? "online" : "offline" }),
      });

      if (res.ok) {
        setIsOnline(newStatus);
        localStorage.setItem(LS_KEY, String(newStatus));
        
        // Set manual override for 1 hour, then business hours can take over
        manualOverride.current = true;
        setTimeout(() => {
          manualOverride.current = false;
        }, 60 * 60 * 1000);
      } else {
        console.error('Presence toggle failed:', res.status);
      }
    } catch (err) {
      console.error('Presence toggle failed:', err);
    }
  }

  // Business hours auto-toggle
  const checkBusinessHours = useCallback(async () => {
    const { data } = await supabase
      .from("workspaces")
      .select("business_hours")
      .eq("id", activeWorkspace.id)
      .single();

    const bh = data?.business_hours as {
      enabled?: boolean;
      timezone?: string;
      schedule?: Record<string, { start: string; end: string } | null>;
    } | null;

    // If business hours disabled, don't auto-toggle (manual override controls status)
    if (!bh?.enabled || !bh.schedule) return;

    // If manual override is active, skip auto-toggling
    if (manualOverride.current) return;

    const tz = bh.timezone || "Europe/Oslo";
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const weekday = parts.find((p) => p.type === "weekday")?.value?.toLowerCase().slice(0, 3) || "";
    const hour = parts.find((p) => p.type === "hour")?.value || "00";
    const minute = parts.find((p) => p.type === "minute")?.value || "00";
    const currentTime = `${hour}:${minute}`;
    const daySchedule = bh.schedule[weekday];

    const shouldBeOnline = daySchedule
      ? currentTime >= daySchedule.start && currentTime <= daySchedule.end
      : false;

    if (shouldBeOnline !== isOnline) {
      setIsOnline(shouldBeOnline);
      localStorage.setItem(LS_KEY, String(shouldBeOnline));
      fetch("/api/presence", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: activeWorkspace.id, status: shouldBeOnline ? "online" : "offline" }),
      }).catch((err) => console.error('Business hours presence update failed:', err));
    }
  }, [activeWorkspace.id, isOnline, supabase]);

  useEffect(() => {
    checkBusinessHours();
    const interval = setInterval(checkBusinessHours, 60_000);
    return () => clearInterval(interval);
  }, [checkBusinessHours]);

  // Fetch waiting count + realtime subscription
  useEffect(() => {
    async function fetchWaiting() {
      const { count } = await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", activeWorkspace.id)
        .eq("status", "waiting");
      setWaitingCount(count ?? 0);
    }

    fetchWaiting();

    const channel = supabase
      .channel("sidebar-waiting")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `workspace_id=eq.${activeWorkspace.id}`,
        },
        () => { fetchWaiting(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeWorkspace.id]);

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r bg-card" role="complementary" aria-label="Sidebar">
      {/* Workspace selector */}
      <div className="p-3">
        {workspaces.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-heading text-base font-semibold transition-colors hover:bg-muted" aria-label={t('nav.workspaceSelector') || 'Select workspace'}>
              <span className="truncate">{activeWorkspace.name}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[228px]" align="start">
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => onWorkspaceChange(ws.id)}
                  className={ws.id === activeWorkspace.id ? "bg-primary/10 text-primary" : ""}
                >
                  {ws.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={<Link href="/create-workspace" />}
              >
                {t('nav.newWorkspace')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="px-3 py-2.5 font-heading text-base font-semibold truncate">
            {activeWorkspace.name}
          </div>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2" role="navigation" aria-label="Dashboard navigation">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item.href, pathname);
            const locked = item.requiredFeature
              ? !hasFeature(activeWorkspace.plan_id, item.requiredFeature as PlanFeature)
              : false;
            const isInbox = item.href === "/dashboard/inbox";

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-150 ${
                    active
                      ? "bg-primary/10 text-primary border-l-2 border-primary dark:bg-primary/20"
                      : locked
                        ? "text-muted-foreground/50"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{t(item.labelKey)}</span>
                  {isInbox && waitingCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">
                      {waitingCount}
                    </span>
                  )}
                  {locked && <Lock className="h-3 w-3 shrink-0 text-muted-foreground/40" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Availability toggle */}
      <div className="px-3 py-2">
        <button
          onClick={toggleOnline}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
          aria-label={isOnline ? t('inbox.goOffline') : t('inbox.goOnline')}
          role="switch"
          aria-checked={isOnline}
        >
          <span
            className={`relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
              isOnline ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`absolute h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                isOnline ? "translate-x-[18px]" : "translate-x-[3px]"
              }`}
            />
          </span>
          <span className={isOnline ? "text-foreground" : "text-muted-foreground"}>
            {isOnline ? t('sidebar.chatAvailable') : t('sidebar.chatUnavailable')}
          </span>
        </button>
      </div>

      <Separator />

      {/* User menu */}
      <div className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted" aria-label={t('nav.userMenu') || 'User menu'}>
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>
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
              onClick={() => toggleOnline()}
            >
              <span className={`mr-2 h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
              {isOnline ? t('inbox.goOffline') : t('inbox.goOnline')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('nav.signOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
