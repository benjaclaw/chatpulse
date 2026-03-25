import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Check if a nav item is active based on current pathname. */
export function isNavActive(href: string, pathname: string, rootPath = "/dashboard"): boolean {
  return href === rootPath ? pathname === rootPath : pathname.startsWith(href);
}

/** Extract 1-2 character initials from a name or email. */
export function getInitials(name?: string, email?: string): string {
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
