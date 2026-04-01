import { createClient } from "./server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates an authenticated Supabase client from either:
 * 1. Cookie-based session (web dashboard)
 * 2. Bearer token in Authorization header (mobile app)
 *
 * Returns { supabase, user } or { supabase: null, user: null } if unauthenticated.
 */
import type { SupabaseClient, User } from "@supabase/supabase-js";

type AuthResult =
  | { supabase: SupabaseClient; user: User }
  | { supabase: null; user: null };

export async function getAuthenticatedClient(request: Request): Promise<AuthResult> {
  // First try cookie-based auth (web)
  const cookieClient = await createClient();
  const { data: { user: cookieUser } } = await cookieClient.auth.getUser();

  if (cookieUser) {
    return { supabase: cookieClient, user: cookieUser };
  }

  // Fall back to Bearer token (mobile app)
  const authHeader = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return { supabase: null, user: null };
    }

    const tokenClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const { data: { user: tokenUser } } = await tokenClient.auth.getUser();
    if (tokenUser) {
      return { supabase: tokenClient, user: tokenUser };
    }
  }

  return { supabase: null, user: null };
}
