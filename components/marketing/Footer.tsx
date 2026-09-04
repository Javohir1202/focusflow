import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        <div className="col-span-2">
          <p className="text-lg font-bold text-brand-700">FocusFlow</p>
          <p className="mt-2 max-w-xs text-sm text-slate-500">
            AI-powered productivity that turns your goals into clear, actionable plans.
          </p>
        </div>
        <nav aria-label="Product">
          <p className="text-sm font-semibold text-slate-900">Product</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/features" className="hover:text-brand-700">Features</Link></li>
            <li><Link href="/pricing" className="hover:text-brand-700">Pricing</Link></li>
          </ul>
        </nav>
        <nav aria-label="Company">
          <p className="text-sm font-semibold text-slate-900">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/about" className="hover:text-brand-700">About</Link></li>
            <li><Link href="/login" className="hover:text-brand-700">Log in</Link></li>
            <li><Link href="/signup" className="hover:text-brand-700">Sign up</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-slate-200 px-6 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} FocusFlow. All rights reserved.
      </div>
    </footer>
  );
}
