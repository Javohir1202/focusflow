import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your FocusFlow account.",
  alternates: { canonical: `${APP_URL}/login` },
  robots: { index: true, follow: true },
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-bold text-slate-900">Log in</h1>
      <p className="mt-2 text-sm text-slate-600">Welcome back. Enter your details below.</p>
      <LoginForm />
    </main>
  );
}
