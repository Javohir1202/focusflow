import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="mx-auto max-w-6xl px-6 pb-16 pt-16 md:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1
          id="hero-heading"
          className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl"
        >
          Focus smarter. Get more done.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
          AI-powered productivity that turns your goals into clear, actionable plans.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-full bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700"
          >
            Get Started
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-full border border-slate-200 px-6 py-3 text-base font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-700"
          >
            View Demo
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-slate-100 bg-slate-50 p-2 shadow-2xl shadow-slate-200">
        <Image
          src="/dashboard-preview.png"
          alt="FocusFlow dashboard showing today's AI-generated schedule, task list, and productivity analytics"
          width={1400}
          height={900}
          priority
          className="rounded-xl border border-slate-100"
        />
      </div>
    </section>
  );
}
