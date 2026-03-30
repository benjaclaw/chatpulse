import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const authRoutes = ["/login", "/signup"];
const protectedPrefixes = ["/admin", "/dashboard", "/create-workspace", "/onboarding"];

export async function proxy(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);
  const path = request.nextUrl.pathname;

  // Redirect authenticated users away from auth pages
  if (user && authRoutes.some((route) => path === route)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Protect authenticated routes — redirect to login if not authenticated
  if (!user && protectedPrefixes.some((prefix) => path.startsWith(prefix))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Only allow relative redirect paths to prevent open redirect
    if (path.startsWith("/") && !path.startsWith("//") && !path.includes("://")) {
      url.searchParams.set("redirect", path);
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
