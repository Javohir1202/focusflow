import Link from "next/link";
import { SITE_NAME } from "@/lib/config";
import { signOut } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/translations";
import { NavLinks } from "./NavLinks";
import { MobileNavExtras } from "./MobileNavExtras";

export function PrivateNav({ userEmail }: { userEmail?: string | null }) {
  const dict = getDictionary(getLocale());

  const NAV_ITEMS = [
    { href: "/dashboard", label: dict.nav.dashboard },
    { href: "/customers", label: dict.nav.customers },
    { href: "/leads", label: dict.nav.leads },
    { href: "/jobs", label: dict.nav.jobs },
    { href: "/tasks", label: dict.nav.tasks },
    { href: "/appointments", label: dict.nav.appointments },
    { href: "/analytics", label: dict.nav.analytics },
  ] as const;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {SITE_NAME}
          </Link>
          <NavLinks
            items={NAV_ITEMS}
            settings={{ href: "/settings", label: dict.nav.settings }}
            extra={<MobileNavExtras />}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 xl:flex">
            {userEmail && <span className="text-sm text-slate-500 dark:text-slate-400">{userEmail}</span>}
            <LanguageToggle />
            <ThemeToggle />
            <Link href="/settings" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-700 dark:hover:text-brand-300">
              {dict.nav.settings}
            </Link>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              aria-label={dict.nav.signOut}
              className="flex h-9 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 px-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 xl:px-3"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 xl:hidden" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              <span className="hidden xl:inline">{dict.nav.signOut}</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
