import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PrivateNav } from "@/components/layout/PrivateNav";

// Any authenticated route rendered through this layout is explicitly
// excluded from search indexing. Private user data must never be
// crawlable.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PrivateNav userEmail={user?.email} />
      <main>{children}</main>
    </div>
  );
}
