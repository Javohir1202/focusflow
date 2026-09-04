export default function TasksLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-6 py-12">
      <div className="h-8 w-32 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-72 rounded bg-slate-100" />

      <div className="mt-8 flex gap-3">
        <div className="h-11 w-32 rounded-full bg-slate-200" />
        <div className="h-11 w-40 rounded-full bg-slate-100" />
      </div>

      <div className="mt-8 space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-xl border border-slate-200 bg-slate-50" />
        ))}
      </div>
    </div>
  );
}
