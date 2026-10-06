export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative left-1/2 mt-auto w-screen max-w-[100vw] -translate-x-1/2 bg-sidebar text-sidebar-foreground">
      <div className="mx-auto grid max-w-[1180px] gap-4 px-[clamp(16px,4vw,40px)] py-9 sm:grid-cols-[1.3fr_1fr] sm:items-end">
        <div>
          <h3 className="font-heading text-[1.5rem]">ShopPilot</h3>
          <p className="mt-2 text-[0.94rem] text-sidebar-foreground/70">
            Demo storefront with AI support. No payment is taken.
          </p>
        </div>
        <div className="border-t border-white/14 pt-[18px] text-[0.85rem] text-sidebar-foreground/70 sm:border-0 sm:pt-0 sm:text-right">
          <p>© {year} Salman Saeed · Demo Hub</p>
          <p className="mt-1">salmansaeed507</p>
        </div>
      </div>
    </footer>
  );
}
