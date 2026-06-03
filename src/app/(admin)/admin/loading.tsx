export default function AdminLoading() {
  return (
    <div className="animate-pulse p-6 md:p-10">
      <div className="mb-8 h-8 w-48 rounded-lg bg-slate-200" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-3 h-4 w-24 rounded bg-slate-200" />
            <div className="h-8 w-32 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="mt-8 h-64 rounded-xl bg-slate-200" />
    </div>
  );
}
