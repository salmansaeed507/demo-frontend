export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative left-1/2 mt-auto w-screen max-w-[100vw] -translate-x-1/2 bg-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-xs text-slate-500">
          © {year} · Demo only — not a live store or production service.
        </p>
      </div>
    </footer>
  );
}
