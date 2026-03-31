"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut, Lock } from "lucide-react";
import { hasFeature } from "@/lib/plans";
import type { PlanFeature } from "@/lib/plans";
import { signOut } from "@/lib/auth-actions";
import { NAV_ITEMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { UserInfo, Workspace } from "@/lib/types";
import { isNavActive, getInitials } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

interface MobileNavProps {
  user: UserInfo;
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  onWorkspaceChange: (id: string) => void;
}

export function MobileNav({
  user,
  workspaces,
  activeWorkspace,
  onWorkspaceChange,
}: MobileNavProps): React.ReactNode {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="shrink-0" />
        }
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">{t('nav.toggleMenu')}</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="p-4">
          <SheetTitle className="font-heading text-left">
            {activeWorkspace.name}
          </SheetTitle>
        </SheetHeader>

        {workspaces.length > 1 && (
          <>
            <div className="px-4 pb-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {t('nav.workspaces')}
              </p>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    onWorkspaceChange(ws.id);
                    setOpen(false);
                  }}
                  className={`flex h-12 w-full items-center text-left rounded-lg px-3 text-sm transition-colors ${
                    ws.id === activeWorkspace.id
                      ? "bg-primary/10 text-primary font-medium dark:bg-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {ws.name}
                </button>
              ))}
            </div>
            <Separator />
          </>
        )}

        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(item.href, pathname);
              const locked = item.requiredFeature
                ? !hasFeature(activeWorkspace.plan_id, item.requiredFeature as PlanFeature)
                : false;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`relative flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-primary/10 text-primary shadow-sm dark:bg-primary/20"
                        : locked
                          ? "text-muted-foreground/50 cursor-not-allowed"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary" />
                    )}
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{t(item.labelKey)}</span>
                    {locked && <Lock className="h-3 w-3 shrink-0 text-muted-foreground/40" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Separator />

        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {user.name ?? user.email}
              </span>
              {user.name && (
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t('nav.signOut')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
