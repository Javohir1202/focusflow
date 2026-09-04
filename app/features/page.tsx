import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore FocusFlow's AI task breakdown, AI daily planner, productivity analytics, and project management features.",
  alternates: { canonical: `${APP_URL}/features` },
};

const features = [
  {
    name: "AI Task Breakdown",
    description: "Turn a large task into a clear list of prioritized, time-estimated steps.",
  },
  {
    name: "AI Daily Planner",
    description: "Get a realistic, optimized schedule for today based on your workload.",
  },
  {
    name: "Productivity Analytics",
    description: "Understand how your time is spent across projects and priorities.",
  },
  {
    name: "Projects & Tasks",
    description: "Organize everything into projects with deadlines and priorities.",
  },
  {
    name: "Cross-device sync",
    description: "Your data stays in sync across every device you use.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-900">Features</h1>
        <p className="mt-4 text-slate-600">
          Everything FocusFlow does to help you plan, focus, and follow through.
        </p>
        <div className="mt-10 space-y-8">
          {features.map((feature) => (
            <article key={feature.name} className="border-b border-slate-100 pb-8">
              <h2 className="text-xl font-semibold text-slate-900">{feature.name}</h2>
              <p className="mt-2 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
