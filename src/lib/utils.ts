import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Check if a nav item is active based on current pathname. */
export function isNavActive(href: string, pathname: string, rootPath = "/dashboard"): boolean {
  return href === rootPath ? pathname === rootPath : pathname.startsWith(href);
}

/** Validate UUID v4 format. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isValidUUID(value: string): boolean {
  return UUID_RE.test(value);
}

/** Shared email validation regex. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate email format. */
export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

/** Sanitize and limit an email string. */
export function sanitizeEmail(value: string): string {
  return value.trim().slice(0, 254).toLowerCase();
}

/** Sanitize and limit a name string. */
export function sanitizeName(value: string): string {
  return value.trim().slice(0, 200);
}

/** Format a date string with locale-aware date+time. */
export function formatDateTime(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
