"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building2, BarChart3, ShieldCheck, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { isNavActive } from "@/lib/utils";

const adminNav = [
  { label: "Statistikk", href: "/admin", icon: BarChart3 },
  { label: "Brukere", href: "/admin/users", icon: Users },
  { label: "Workspaces", href: "/admin/workspaces", icon: Building2 },
];

export function AdminShell({ children }: { children: React.ReactNode }): React.ReactNode {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden w-[260px] flex-col border-r bg-card md:flex">
        <div className="p-3">
          <div className="flex items-center gap-2 px-3 py-2.5 font-heading text-base font-semibold">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Super Admin
          </div>
        </div>

        <Separator />

        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {adminNav.map((item) => {
              const active = isNavActive(item.href, pathname, "/admin");

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-150 ${
                      active
                        ? "bg-primary/10 text-primary border-l-2 border-primary dark:bg-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Separator />

        <div className="p-2">
          <Link
            href="/dashboard"
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Tilbake til dashboard
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-3 border-b bg-card px-4 md:hidden">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="font-heading text-lg font-semibold">Super Admin</h1>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1 border-b bg-card px-4 py-2 md:hidden">
          {adminNav.map((item) => {
            const active = isNavActive(item.href, pathname, "/admin");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
