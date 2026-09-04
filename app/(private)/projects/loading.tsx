export default function ProjectsLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-6 py-12">
      <div className="h-8 w-40 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-64 rounded bg-slate-100" />

      <div className="mt-8 h-11 w-36 rounded-full bg-slate-200" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl border border-slate-200 bg-slate-50" />
        ))}
      </div>
    </div>
  );
}
