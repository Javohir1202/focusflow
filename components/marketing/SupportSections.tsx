import Link from "next/link";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary, type Dictionary } from "@/lib/i18n/translations";
import { FaqJsonLd } from "@/components/JsonLd";

function steps(dict: Dictionary) {
  return [
    { title: dict.home.step1Title, description: dict.home.step1Description },
    { title: dict.home.step2Title, description: dict.home.step2Description },
    { title: dict.home.step3Title, description: dict.home.step3Description },
    { title: dict.home.step4Title, description: dict.home.step4Description },
  ];
}

export function HowItWorks() {
  const dict = getDictionary(getLocale());

  return (
    <section id="how-it-works" className="bg-slate-50 dark:bg-slate-950 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
          {dict.home.howItWorksHeading}
        </h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-4">
          {steps(dict).map((step, index) => (
            <li key={step.title} className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {index + 1}
              </div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Testimonials() {
  // Placeholder section — replace with real customer testimonials once available.
  // Do not fabricate quotes or names.
  const dict = getDictionary(getLocale());

  return (
    <section aria-labelledby="testimonials-heading" className="mx-auto max-w-6xl px-6 py-16">
      <h2 id="testimonials-heading" className="text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
        {dict.home.testimonialsHeading}
      </h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-sm text-slate-400 dark:text-slate-500"
          >
            {dict.home.testimonialComingSoon}
          </div>
        ))}
      </div>
    </section>
  );
}

function faqItems(dict: Dictionary) {
  return [
    { question: dict.home.faqQ1, answer: dict.home.faqA1 },
    { question: dict.home.faqQ2, answer: dict.home.faqA2 },
    { question: dict.home.faqQ3, answer: dict.home.faqA3 },
    { question: dict.home.faqQ4, answer: dict.home.faqA4 },
  ];
}

export function Faq() {
  const dict = getDictionary(getLocale());
  const items = faqItems(dict);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-16">
      <FaqJsonLd items={items} />
      <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
        {dict.home.faqHeading}
      </h2>
      <dl className="mt-10 space-y-6">
        {items.map((item) => (
          <div key={item.question} className="border-b border-slate-100 dark:border-slate-800 pb-6">
            <dt className="font-semibold text-slate-900 dark:text-slate-100">{item.question}</dt>
            <dd className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function FinalCta() {
  const dict = getDictionary(getLocale());

  return (
    <section className="bg-brand-700 py-16 text-center text-white">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-3xl font-bold">{dict.home.finalCtaHeading}</h2>
        <p className="mt-4 text-brand-100">{dict.home.finalCtaSubheading}</p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-base font-semibold text-brand-700 hover:bg-brand-50"
        >
          {dict.home.getStarted}
        </Link>
      </div>
    </section>
  );
}
