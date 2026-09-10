export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative left-1/2 mt-auto w-screen max-w-[100vw] -translate-x-1/2 bg-zinc-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          © {year} Salman Saeed · Demo Hub — demo only, not a live production
          service.
        </p>
        <p className="text-xs text-slate-500">salmansaeed507</p>
      </div>
    </footer>
  );
}
