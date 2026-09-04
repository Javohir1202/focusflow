import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your free FocusFlow account and start planning with AI.",
  alternates: { canonical: `${APP_URL}/signup` },
  robots: { index: true, follow: true },
};

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-2 text-sm text-slate-600">Start planning smarter in under a minute.</p>
      <SignupForm />
    </main>
  );
}
