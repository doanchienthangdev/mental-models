export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-[#132836] shadow-card">
      <div className="h-40 w-full rounded-t-2xl bg-gradient-to-br from-slate-800 to-slate-900/70" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-slate-800" />
        <div className="h-3 w-full rounded bg-slate-800/80" />
        <div className="h-3 w-2/3 rounded bg-slate-800/70" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-20 rounded-full bg-slate-800" />
          <div className="h-6 w-16 rounded-full bg-slate-800/90" />
          <div className="h-6 w-14 rounded-full bg-slate-800/70 ml-auto" />
        </div>
      </div>
    </div>
  );
}
