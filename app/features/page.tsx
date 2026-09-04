import type { Metadata } from "next";
import { APP_URL, SITE_NAME } from "@/lib/config";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary, type Dictionary } from "@/lib/i18n/translations";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "Features",
  description: `Explore ${SITE_NAME}'s lead pipeline, customer records, job tracking, appointments, and tasks.`,
  alternates: { canonical: `${APP_URL}/features` },
};

function features(dict: Dictionary) {
  return [
    { name: dict.featuresPage.customersName, description: dict.featuresPage.customersDesc },
    { name: dict.featuresPage.pipelineName, description: dict.featuresPage.pipelineDesc },
    { name: dict.featuresPage.jobsName, description: dict.featuresPage.jobsDesc },
    { name: dict.featuresPage.apptName, description: dict.featuresPage.apptDesc },
    { name: dict.featuresPage.tasksName, description: dict.featuresPage.tasksDesc },
    { name: dict.featuresPage.dashboardName, description: dict.featuresPage.dashboardDesc },
  ];
}

export default function FeaturesPage() {
  const dict = getDictionary(getLocale());

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">{dict.featuresPage.title}</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">{dict.featuresPage.subtitle}</p>
        <div className="mt-10 space-y-8">
          {features(dict).map((feature) => (
            <article key={feature.name} className="border-b border-slate-100 dark:border-slate-800 pb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{feature.name}</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">{feature.description}</p>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
