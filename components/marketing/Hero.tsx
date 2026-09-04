import Image from "next/image";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/translations";

export function Hero() {
  const dict = getDictionary(getLocale());

  return (
    <section aria-labelledby="hero-heading" className="mx-auto max-w-6xl px-6 pb-16 pt-16 md:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1
          id="hero-heading"
          className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 md:text-6xl"
        >
          {dict.home.heroHeading}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-400">
          {dict.home.heroSubheading}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-full bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700"
          >
            {dict.home.getStarted}
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-full border border-slate-200 dark:border-slate-800 px-6 py-3 text-base font-semibold text-slate-700 dark:text-slate-300 hover:border-brand-300 dark:hover:border-brand-500 hover:text-brand-700 dark:hover:text-brand-300"
          >
            {dict.home.seeHowItWorks}
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 shadow-2xl shadow-slate-200">
        <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
          <Image
            src="/illustrations/dashboard-hero.jpg"
            alt="ServiceFlow dashboard overview with KPI cards, a deals chart, tasks, and activity feed"
            width={1168}
            height={784}
            priority
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
