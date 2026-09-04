import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about FocusFlow's mission to help people plan and focus with AI.",
  alternates: { canonical: `${APP_URL}/about` },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-900">About FocusFlow</h1>
        <p className="mt-6 text-slate-600">
          FocusFlow exists to close the gap between having a goal and knowing exactly what to
          do next. We combine simple task and project management with AI planning, so a vague
          goal turns into a concrete, time-boxed plan for today.
        </p>
        <p className="mt-4 text-slate-600">
          Every AI feature in FocusFlow runs on Claude, called securely from our servers — your
          data and API credentials never touch the browser directly.
        </p>
      </main>
      <Footer />
    </>
  );
}
