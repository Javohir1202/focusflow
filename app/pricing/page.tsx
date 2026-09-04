import type { Metadata } from "next";
import Link from "next/link";
import { APP_URL, SITE_NAME } from "@/lib/config";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary, type Dictionary } from "@/lib/i18n/translations";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "Pricing",
  description: `Simple, transparent pricing for ${SITE_NAME}.`,
  alternates: { canonical: `${APP_URL}/pricing` },
};

function plans(dict: Dictionary) {
  return [
    {
      name: dict.pricingPage.freeName,
      price: dict.pricingPage.freePrice,
      description: dict.pricingPage.freeDesc,
      features: [dict.pricingPage.freeF1, dict.pricingPage.freeF2, dict.pricingPage.freeF3],
    },
    {
      name: dict.pricingPage.proName,
      price: dict.pricingPage.proPrice,
      description: dict.pricingPage.proDesc,
      features: [dict.pricingPage.proF1, dict.pricingPage.proF2, dict.pricingPage.proF3],
      highlighted: true,
    },
  ];
}

export default function PricingPage() {
  const dict = getDictionary(getLocale());

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-center text-4xl font-bold text-slate-900 dark:text-slate-100">
          {dict.pricingPage.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-slate-600 dark:text-slate-400">
          {dict.pricingPage.subtitle}
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {plans(dict).map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-brand-600 shadow-xl shadow-brand-100"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{plan.name}</h2>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{plan.price}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{plan.description}</p>
              <ul className="mt-6 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {plan.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 block rounded-full bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700"
              >
                {dict.home.getStarted}
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
