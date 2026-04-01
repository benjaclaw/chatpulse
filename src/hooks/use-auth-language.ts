import { useState } from "react";
import { createT, type Language, type TranslateFunction } from "@/lib/i18n";

/**
 * Shared hook for auth forms: resolves the UI language from localStorage
 * and extracts the ?redirect query parameter.
 */
export function useAuthLanguage(): {
  t: TranslateFunction;
  redirectParam: string | null;
} {
  const [language] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("chatpulse_lang") as Language) || "nb";
    }
    return "nb";
  });

  const t = createT(language);

  const redirectParam =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("redirect")
      : null;

  return { t, redirectParam };
}
