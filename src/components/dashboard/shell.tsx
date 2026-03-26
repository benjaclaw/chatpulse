"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import type { UserInfo, Workspace } from "@/lib/types";
import { WorkspaceProvider } from "@/contexts/workspace-context";
import { LanguageProvider } from "@/lib/i18n/context";
import type { Language } from "@/lib/i18n";

interface DashboardShellProps {
  children: React.ReactNode;
  user: UserInfo;
  workspaces: Workspace[];
}

export function DashboardShell({
  children,
  user,
  workspaces,
}: DashboardShellProps): React.ReactNode {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(workspaces[0]?.id);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0];

  const language = (activeWorkspace?.language === "en" ? "en" : "nb") as Language;

  // Presence heartbeat — keep agent online while ANY dashboard page is open
  useEffect(() => {
    const wsId = activeWorkspace?.id;
    if (!wsId) return;

    const sendHeartbeat = () => {
      fetch("/api/presence", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: wsId, status: "online" }),
      }).catch(() => {});
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30_000);

    // Use beforeunload for reliable offline signal (only when actually leaving the page)
    const handleUnload = () => {
      fetch("/api/presence", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: wsId, status: "offline" }),
        keepalive: true, // ensures request completes even after page unload
      }).catch(() => {});
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      // Don't send offline on cleanup — it fires on re-renders and page navigation
      // The 2-minute presence timeout handles stale agents naturally
    };
  }, [activeWorkspace?.id]);

  return (
    <LanguageProvider initialLanguage={language} key={language}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <Sidebar
            user={user}
            workspaces={workspaces}
            activeWorkspace={activeWorkspace}
            onWorkspaceChange={setActiveWorkspaceId}
          />
        </div>

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile header */}
          <header className="flex h-14 items-center gap-3 border-b bg-card px-4 md:hidden">
            <MobileNav
              user={user}
              workspaces={workspaces}
              activeWorkspace={activeWorkspace}
              onWorkspaceChange={setActiveWorkspaceId}
            />
            <h1 className="font-heading text-lg font-semibold truncate">
              {activeWorkspace?.name}
            </h1>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8">
            <WorkspaceProvider workspace={activeWorkspace}>
              {children}
            </WorkspaceProvider>
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
}
