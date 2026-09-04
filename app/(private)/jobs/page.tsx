import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/translations";
import { JobsClient } from "@/components/jobs/JobsClient";
import type { Customer, Job } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Jobs",
};

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const supabase = createServerSupabaseClient();
  const dict = getDictionary(getLocale());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/jobs");
  }

  const [{ data: jobs, error: jobsError }, { data: customers, error: customersError }] = await Promise.all([
    supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .returns<Job[]>(),
    supabase
      .from("customers")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true })
      .returns<Customer[]>(),
  ]);

  if (jobsError || customersError) {
    throw new Error(jobsError?.message ?? customersError?.message ?? "Failed to load jobs.");
  }

  const customerById = new Map((customers ?? []).map((c) => [c.id, c.name]));
  const jobsWithCustomer = (jobs ?? []).map((j) => ({
    ...j,
    customerName: customerById.get(j.customer_id) ?? "Unknown",
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{dict.jobs.title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{dict.jobs.subtitle}</p>

      <JobsClient initialJobs={jobsWithCustomer} customers={customers ?? []} />
    </div>
  );
}
