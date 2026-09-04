import Link from "next/link";
import { SITE_NAME } from "@/lib/config";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/translations";

export function Footer() {
  const dict = getDictionary(getLocale());

  return (
    <footer className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        <div className="col-span-2">
          <p className="text-lg font-bold text-brand-700 dark:text-brand-300">{SITE_NAME}</p>
          <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">{dict.footer.tagline}</p>
        </div>
        <nav aria-label="Product">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{dict.footer.product}</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><Link href="/features" className="hover:text-brand-700 dark:hover:text-brand-300">{dict.nav.features}</Link></li>
            <li><Link href="/pricing" className="hover:text-brand-700 dark:hover:text-brand-300">{dict.nav.pricing}</Link></li>
          </ul>
        </nav>
        <nav aria-label="Company">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{dict.footer.company}</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><Link href="/about" className="hover:text-brand-700 dark:hover:text-brand-300">{dict.nav.about}</Link></li>
            <li><Link href="/login" className="hover:text-brand-700 dark:hover:text-brand-300">{dict.nav.logIn}</Link></li>
            <li><Link href="/signup" className="hover:text-brand-700 dark:hover:text-brand-300">{dict.nav.signUp}</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} {SITE_NAME}. {dict.footer.rights}
      </div>
    </footer>
  );
}
