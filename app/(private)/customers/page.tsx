import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/translations";
import { CustomersClient } from "@/components/customers/CustomersClient";
import type { Customer } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Customers",
};

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const supabase = createServerSupabaseClient();
  const dict = getDictionary(getLocale());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/customers");
  }

  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<Customer[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{dict.customers.title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{dict.customers.subtitle}</p>

      <CustomersClient initialCustomers={customers ?? []} />
    </div>
  );
}
