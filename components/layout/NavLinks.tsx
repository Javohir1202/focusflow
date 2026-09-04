"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function isActive(pathname: string | null, href: string) {
  return pathname === href || (pathname?.startsWith(`${href}/`) ?? false);
}

export function NavLinks({
  items,
  settings,
  extra,
}: {
  items: readonly { href: string; label: string }[];
  /** Rendered as one more link at the end of the mobile dropdown — hidden on xl+, where PrivateNav shows it inline instead. */
  settings?: { href: string; label: string };
  /** Extra controls (language/theme toggles) rendered below the links in the mobile dropdown only. */
  extra?: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="hidden items-center gap-1 xl:flex">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive(pathname, item.href) ? "bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 xl:hidden"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm xl:hidden">
          <div className="flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive(pathname, item.href) ? "bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {settings && (
              <Link
                href={settings.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive(pathname, settings.href) ? "bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {settings.label}
              </Link>
            )}
          </div>
          {extra && <div className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-3">{extra}</div>}
        </nav>
      )}
    </>
  );
}
