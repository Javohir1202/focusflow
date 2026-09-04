import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
      >
        <Link href="/" className="text-lg font-bold text-brand-700">
          FocusFlow
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <Link href="/features" className="hover:text-brand-700">
            Features
          </Link>
          <Link href="/pricing" className="hover:text-brand-700">
            Pricing
          </Link>
          <Link href="/about" className="hover:text-brand-700">
            About
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-brand-700"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
