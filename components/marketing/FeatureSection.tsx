type FeatureSectionProps = {
  id?: string;
  eyebrow: string;
  heading: string;
  description: string;
  bullets: string[];
  imageAlt: string;
  imageSrc: string;
  reversed?: boolean;
};

export function FeatureSection({
  id,
  eyebrow,
  heading,
  description,
  bullets,
  imageAlt,
  imageSrc,
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
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{heading}</h2>
          <p className="mt-4 text-slate-600">{description}</p>
          <ul className="mt-6 space-y-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-slate-700">
                <span
                  aria-hidden="true"
                  className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500"
                />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt={imageAlt} className="h-full w-full object-cover" loading="lazy" />
        </div>
      </div>
    </section>
  );
}
