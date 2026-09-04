export default function AiPlannerLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-6 py-12">
      <div className="h-8 w-40 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-80 rounded bg-slate-100" />

      <div className="mt-10 h-11 rounded-lg bg-slate-100" />

      <div className="mt-12 space-y-3 border-t border-slate-200 pt-10">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 rounded-lg border border-slate-200 bg-slate-50" />
        ))}
      </div>
    </div>
  );
}
