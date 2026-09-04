import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/translations";
import { LeadsBoard } from "@/components/leads/LeadsBoard";
import type { Customer, Lead } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Leads",
};

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const supabase = createServerSupabaseClient();
  const dict = getDictionary(getLocale());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/leads");
  }

  const [{ data: leads, error: leadsError }, { data: customers, error: customersError }] =
    await Promise.all([
      supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .returns<Lead[]>(),
      supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true })
        .returns<Customer[]>(),
    ]);

  if (leadsError || customersError) {
    throw new Error(leadsError?.message ?? customersError?.message ?? "Failed to load leads.");
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{dict.leads.title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{dict.leads.subtitle}</p>

      <LeadsBoard initialLeads={leads ?? []} customers={customers ?? []} />
    </div>
  );
}
