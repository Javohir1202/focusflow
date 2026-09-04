import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/translations";

export const metadata: Metadata = {
  title: "Settings",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient();
  const dict = getDictionary(getLocale());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/settings");
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{dict.settings.title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{dict.settings.subtitle}</p>

      <section className="mt-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{dict.settings.account}</h2>
        <dl className="mt-3 space-y-1">
          <div className="flex flex-wrap gap-2 text-sm">
            <dt className="text-slate-500 dark:text-slate-400">{dict.settings.email}</dt>
            <dd className="break-all font-medium text-slate-900 dark:text-slate-100">{user.email}</dd>
          </div>
          <div className="flex gap-2 text-sm">
            <dt className="text-slate-500 dark:text-slate-400">{dict.settings.memberSince}</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {new Date(user.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {dict.settings.changePassword}
        </h2>
        <div className="mt-4">
          <PasswordForm />
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{dict.settings.session}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{dict.settings.signOutOf}</p>
        <form action={signOut} className="mt-4">
          <button
            type="submit"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {dict.settings.signOut}
          </button>
        </form>
      </section>
    </div>
  );
}
