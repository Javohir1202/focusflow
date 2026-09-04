import type { Metadata } from "next";
import Link from "next/link";
import { APP_URL, SITE_NAME } from "@/lib/config";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/translations";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: `Log in to your ${SITE_NAME} account.`,
  alternates: { canonical: `${APP_URL}/login` },
  robots: { index: true, follow: true },
};

export default function LoginPage() {
  const dict = getDictionary(getLocale());

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 block text-center text-lg font-bold tracking-tight text-brand-700 dark:text-brand-300"
        >
          {SITE_NAME}
        </Link>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{dict.auth.loginTitle}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{dict.auth.loginSubtitle}</p>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            {dict.auth.noAccount}{" "}
            <Link href="/signup" className="font-medium text-brand-700 dark:text-brand-300 hover:underline">
              {dict.auth.signUp}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
