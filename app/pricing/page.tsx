import type { Metadata } from "next";
import Link from "next/link";
import { APP_URL } from "@/lib/config";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for FocusFlow's AI-powered productivity dashboard.",
  alternates: { canonical: `${APP_URL}/pricing` },
};

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For getting started with AI-powered planning.",
    features: ["Up to 20 tasks", "Basic AI task breakdown", "1 project"],
  },
  {
    name: "Pro",
    price: "$12/mo",
    description: "For individuals who want full AI planning power.",
    features: ["Unlimited tasks & projects", "AI daily planner", "Productivity analytics"],
    highlighted: true,
  },
  {
    name: "Team",
    price: "Contact us",
    description: "For teams that plan and track work together.",
    features: ["Everything in Pro", "Shared projects", "Priority support"],
  },
];

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-center text-4xl font-bold text-slate-900">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
          Start free. Upgrade when you need more AI planning power.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-brand-600 shadow-xl shadow-brand-100"
                  : "border-slate-200"
              }`}
            >
              <h2 className="text-lg font-semibold text-slate-900">{plan.name}</h2>
              <p className="mt-2 text-3xl font-bold text-slate-900">{plan.price}</p>
              <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
              <ul className="mt-6 space-y-2 text-sm text-slate-700">
                {plan.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 block rounded-full bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700"
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
