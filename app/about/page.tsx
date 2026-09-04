import type { Metadata } from "next";
import { APP_URL, SITE_NAME } from "@/lib/config";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/translations";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${SITE_NAME}'s mission to help service businesses run without spreadsheets.`,
  alternates: { canonical: `${APP_URL}/about` },
};

export default function AboutPage() {
  const dict = getDictionary(getLocale());

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">{dict.aboutPage.title}</h1>
        <p className="mt-6 text-slate-600 dark:text-slate-400">{dict.aboutPage.p1}</p>
        <p className="mt-4 text-slate-600 dark:text-slate-400">{dict.aboutPage.p2}</p>
      </main>
      <Footer />
    </>
  );
}
