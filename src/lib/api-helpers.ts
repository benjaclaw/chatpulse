import type { SupabaseClient } from "@supabase/supabase-js";
import type { RateLimiter } from "./rate-limit";

/**
 * Parse JSON body from a Request, returning either the parsed body or a 400 Response.
 */
export async function parseJsonBody<T>(request: Request): Promise<T | Response> {
  try {
    return await request.json() as T;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}

/**
 * Extract client IP from x-forwarded-for header.
 */
export function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/**
 * Check rate limit for a request by IP. Returns a 429 Response if exceeded, or null if OK.
 */
export function checkRateLimit(rateLimiter: RateLimiter, key: string): Response | null {
  if (!rateLimiter.check(key)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }
  return null;
}

/**
 * Combined: extract IP and check rate limit. Returns 429 Response or null.
 */
export function checkIpRateLimit(request: Request, rateLimiter: RateLimiter): Response | null {
  return checkRateLimit(rateLimiter, getClientIp(request));
}

/**
 * Verify that a user is a member of a workspace.
 * Returns a 403 Response if not a member, or null if membership is confirmed.
 */
export async function requireWorkspaceMember(
  supabase: SupabaseClient,
  userId: string,
  workspaceId: string,
): Promise<Response | null> {
  const { data: member } = await supabase
    .from("members")
    .select("user_id")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .single();

  if (!member) {
    return Response.json({ error: "Not a member of this workspace" }, { status: 403 });
  }
  return null;
}
