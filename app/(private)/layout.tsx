import type { Metadata } from "next";

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

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-50">{children}</div>;
}
