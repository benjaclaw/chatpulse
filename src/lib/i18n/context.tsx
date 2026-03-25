"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { Language, TranslateFunction } from "./index";
import { createT } from "./index";

const STORAGE_KEY = "chatpulse-lang";

function detectBrowserLanguage(): Language {
  if (typeof window === "undefined") return "nb";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "nb") return stored;
  } catch {
    // localStorage may be unavailable
  }
  const nav = navigator.language;
  return nav.startsWith("en") ? "en" : "nb";
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslateFunction;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}): React.ReactNode {
  const [language, setLanguageState] = useState<Language>(
    initialLanguage ?? detectBrowserLanguage
  );

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  const t = useMemo(() => createT(language), [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
