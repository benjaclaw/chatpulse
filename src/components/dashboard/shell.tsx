"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

export type UserInfo = {
  id: string;
  email: string;
  name?: string;
};

interface DashboardShellProps {
  children: React.ReactNode;
  user: UserInfo;
  workspaces: Workspace[];
}

export function DashboardShell({
  children,
  user,
  workspaces,
}: DashboardShellProps) {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(workspaces[0]?.id);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0];

  return (
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
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:hidden">
          <MobileNav
            user={user}
            workspaces={workspaces}
            activeWorkspace={activeWorkspace}
            onWorkspaceChange={setActiveWorkspaceId}
          />
          <h1 className="font-heading text-lg font-semibold">
            {activeWorkspace?.name}
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
