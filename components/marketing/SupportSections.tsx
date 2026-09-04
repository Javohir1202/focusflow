import Link from "next/link";
import { FaqJsonLd } from "@/components/JsonLd";

const steps = [
  {
    title: "Add your goals",
    description: "Drop in a project, a big task, or a rough idea of what you want to accomplish.",
  },
  {
    title: "Let Claude break it down",
    description: "AI splits large tasks into clear, time-estimated, prioritized steps.",
  },
  {
    title: "Follow your daily plan",
    description: "Get an optimized schedule for today based on deadlines and priorities.",
  },
  {
    title: "Track your progress",
    description: "See analytics on how your time is actually being spent, and improve.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900">How it works</h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {index + 1}
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.description}</p>
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
  return (
    <section aria-labelledby="testimonials-heading" className="mx-auto max-w-6xl px-6 py-16">
      <h2 id="testimonials-heading" className="text-center text-3xl font-bold text-slate-900">
        Loved by focused teams
      </h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400"
          >
            Testimonial coming soon
          </div>
        ))}
      </div>
    </section>
  );
}

const faqItems = [
  {
    question: "How does FocusFlow use AI?",
    answer:
      "FocusFlow uses Claude to break large tasks into actionable steps and to generate an optimized daily schedule based on your priorities and deadlines.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. Your tasks and projects live behind authentication and are never indexed by search engines or shared with third parties.",
  },
  {
    question: "Can I use FocusFlow on multiple devices?",
    answer: "Yes, your account and data sync automatically across any device you log in from.",
  },
  {
    question: "Is there a free plan?",
    answer: "See the Pricing page for current plan details.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-16">
      <FaqJsonLd items={faqItems} />
      <h2 className="text-center text-3xl font-bold text-slate-900">
        Frequently asked questions
      </h2>
      <dl className="mt-10 space-y-6">
        {faqItems.map((item) => (
          <div key={item.question} className="border-b border-slate-100 pb-6">
            <dt className="font-semibold text-slate-900">{item.question}</dt>
            <dd className="mt-2 text-sm text-slate-600">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="bg-brand-700 py-16 text-center text-white">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-3xl font-bold">Ready to focus smarter?</h2>
        <p className="mt-4 text-brand-100">
          Start planning your day with AI in under two minutes.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-base font-semibold text-brand-700 hover:bg-brand-50"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}
