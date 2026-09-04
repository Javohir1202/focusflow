import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Welcome back{user?.email ? `, ${user.email}` : ""}</h1>
      <p className="mt-2 text-slate-600">
        This is your private dashboard. Nothing here is indexed by search engines.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/tasks" className="rounded-xl border border-slate-200 bg-white p-5 hover:border-brand-400">
          <h2 className="font-semibold text-slate-900">Tasks</h2>
          <p className="mt-1 text-sm text-slate-500">View and manage your tasks.</p>
        </Link>
        <Link href="/projects" className="rounded-xl border border-slate-200 bg-white p-5 hover:border-brand-400">
          <h2 className="font-semibold text-slate-900">Projects</h2>
          <p className="mt-1 text-sm text-slate-500">Organize work into projects.</p>
        </Link>
        <Link href="/ai-planner" className="rounded-xl border border-slate-200 bg-white p-5 hover:border-brand-400">
          <h2 className="font-semibold text-slate-900">AI Planner</h2>
          <p className="mt-1 text-sm text-slate-500">Get today's AI-generated schedule.</p>
        </Link>
        <Link href="/analytics" className="rounded-xl border border-slate-200 bg-white p-5 hover:border-brand-400">
          <h2 className="font-semibold text-slate-900">Analytics</h2>
          <p className="mt-1 text-sm text-slate-500">See your productivity trends.</p>
        </Link>
      </div>
    </div>
  );
}
