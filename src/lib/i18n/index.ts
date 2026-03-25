import nb from "./translations/nb";
import en from "./translations/en";

export type Language = "nb" | "en";

export const translations: Record<Language, Record<string, string>> = { nb, en };

export type TranslateFunction = (key: string, params?: Record<string, string | number>) => string;

export function createT(language: Language): TranslateFunction {
  const dict = translations[language] ?? translations.nb;
  return (key: string, params?: Record<string, string | number>): string => {
    let value = dict[key] ?? translations.nb[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, String(v));
      }
    }
    return value;
  };
}
