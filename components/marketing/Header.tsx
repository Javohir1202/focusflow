import Link from "next/link";
import { SITE_NAME } from "@/lib/config";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/translations";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const dict = getDictionary(getLocale());

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
      >
        <Link href="/" className="text-lg font-bold text-brand-700 dark:text-brand-300">
          {SITE_NAME}
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400 md:flex">
          <Link href="/features" className="hover:text-brand-700 dark:hover:text-brand-300">
            {dict.nav.features}
          </Link>
          <Link href="/pricing" className="hover:text-brand-700 dark:hover:text-brand-300">
            {dict.nav.pricing}
          </Link>
          <Link href="/about" className="hover:text-brand-700 dark:hover:text-brand-300">
            {dict.nav.about}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-700 dark:hover:text-brand-300"
            >
              {dict.nav.logIn}
            </Link>
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <Link
            href="/signup"
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {dict.nav.getStarted}
          </Link>
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
}
