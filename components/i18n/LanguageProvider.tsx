"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale as setLocaleAction } from "@/lib/actions/locale";
import { getDictionary, type Dictionary } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/locale";

type LanguageContextValue = {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
  pending: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

// initialLocale comes from the "locale" cookie, read server-side in the root
// layout — this is a Server Component, so it can pass that value down as a
// prop, but everything nested under it (every "use client" form/table/board
// in the app) reads the current language via useTranslation() instead of
// having the dictionary threaded through as props.
export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [pending, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      startTransition(async () => {
        await setLocaleAction(next);
        router.refresh();
      });
    },
    [router]
  );

  const value = useMemo(
    () => ({ locale, dict: getDictionary(locale), setLocale, pending }),
    [locale, pending, setLocale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be used within a LanguageProvider");
  return ctx;
}
