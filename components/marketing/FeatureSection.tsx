import type { ReactNode } from "react";

type FeatureSectionProps = {
  id?: string;
  eyebrow: string;
  heading: string;
  description: string;
  bullets: string[];
  visual: ReactNode;
  reversed?: boolean;
};

export function FeatureSection({
  id,
  eyebrow,
  heading,
  description,
  bullets,
  visual,
  reversed = false,
}: FeatureSectionProps) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-16">
      <div
        className={`grid items-center gap-12 md:grid-cols-2 ${
          reversed ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{heading}</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">{description}</p>
          <ul className="mt-6 space-y-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                <span
                  aria-hidden="true"
                  className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500"
                />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-lg">
          {visual}
        </div>
      </div>
    </section>
  );
}
