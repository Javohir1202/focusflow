import { cookies } from "next/headers";

export type Locale = "en" | "ru";

export const LOCALE_COOKIE = "locale";
export const DEFAULT_LOCALE: Locale = "en";

// Server-side only (Server Components, layouts, pages). Client Components
// get the locale from LanguageProvider's context instead — see
// components/i18n/LanguageProvider.tsx.
export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return value === "ru" ? "ru" : DEFAULT_LOCALE;
}
