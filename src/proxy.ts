import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const publicRoutes = ["/", "/login", "/signup", "/invite/accept"];
const authRoutes = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);
  const path = request.nextUrl.pathname;

  // Allow public routes
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith("/invite/accept")
  );

  // Redirect authenticated users away from auth pages
  if (user && authRoutes.some((route) => path === route)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Protect authenticated routes
  const protectedPrefixes = ["/admin", "/dashboard", "/create-workspace", "/onboarding"];
  if (!user && protectedPrefixes.some((prefix) => path.startsWith(prefix))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
