import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { sendConversionEvent } from "@/lib/meta-conversions";

export async function GET(request: Request): Promise<Response> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";

  // Prevent open redirect — only allow relative paths within the app
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.includes("://")
      ? rawNext
      : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Fire CompleteRegistration for new users (Google OAuth signup)
      const createdAt = data?.session?.user?.created_at;
      const isNewUser =
        createdAt &&
        Date.now() - new Date(createdAt).getTime() < 60_000; // created within last 60s

      if (isNewUser) {
        try {
          const hdrs = await headers();
          const clientIp = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
          const clientUa = hdrs.get("user-agent") || undefined;

          sendConversionEvent({
            eventName: "CompleteRegistration",
            email: data.session?.user?.email,
            sourceUrl: `${origin}/signup`,
            clientIpAddress: clientIp,
            clientUserAgent: clientUa,
          });
        } catch {
          // Non-blocking
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
