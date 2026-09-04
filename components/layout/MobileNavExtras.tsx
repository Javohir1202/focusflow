"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";
import { useTheme, type Theme } from "@/components/theme/ThemeProvider";
import type { Locale } from "@/lib/i18n/locale";

const LANGUAGE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ru", label: "RU" },
];

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

// Language + theme controls shown inside the private nav's mobile dropdown
// (NavLinks' `extra` slot) — PrivateNav itself is a server component and
// hides the full-size LanguageToggle/ThemeToggle popovers below xl, so
// mobile users need this instead.
export function MobileNavExtras() {
  const { locale, setLocale } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex gap-1">
        {LANGUAGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLocale(opt.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              locale === opt.value
                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex gap-1">
        {THEME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              theme === opt.value
                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
