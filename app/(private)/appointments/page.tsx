import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/translations";
import { AppointmentsClient } from "@/components/appointments/AppointmentsClient";
import type { Appointment, Customer, Job } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Appointments",
};

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const supabase = createServerSupabaseClient();
  const dict = getDictionary(getLocale());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/appointments");
  }

  const [
    { data: appointments, error: appointmentsError },
    { data: customers, error: customersError },
    { data: jobs, error: jobsError },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_at", { ascending: true })
      .returns<Appointment[]>(),
    supabase.from("customers").select("*").eq("user_id", user.id).order("name", { ascending: true }).returns<Customer[]>(),
    supabase.from("jobs").select("*").eq("user_id", user.id).order("title", { ascending: true }).returns<Job[]>(),
  ]);

  if (appointmentsError || customersError || jobsError) {
    throw new Error(
      appointmentsError?.message ??
        customersError?.message ??
        jobsError?.message ??
        "Failed to load appointments."
    );
  }

  const customerById = new Map((customers ?? []).map((c) => [c.id, c.name]));
  const appointmentsWithCustomer = (appointments ?? []).map((a) => ({
    ...a,
    customerName: customerById.get(a.customer_id) ?? "Unknown",
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{dict.appointments.title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{dict.appointments.subtitle}</p>

      <AppointmentsClient
        initialAppointments={appointmentsWithCustomer}
        customers={customers ?? []}
        jobs={jobs ?? []}
      />
    </div>
  );
}
