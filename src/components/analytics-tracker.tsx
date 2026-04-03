"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackSignUp } from "@/lib/analytics-events";

/**
 * Client component that fires GTM events based on URL params.
 * Place in dashboard layout to catch post-redirect events.
 */
export function AnalyticsTracker(): React.ReactNode {
  const searchParams = useSearchParams();

  useEffect(() => {
    const newSignup = searchParams.get("new_signup");
    if (newSignup) {
      trackSignUp(newSignup as "email" | "google");
      // Clean up URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete("new_signup");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [searchParams]);

  return null;
}
