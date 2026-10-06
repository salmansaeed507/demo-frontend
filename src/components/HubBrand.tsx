type Props = {
  /** Light text for dark heroes; dark for light backgrounds. */
  variant?: "light" | "dark";
};

export default function HubBrand({ variant = "light" }: Props) {
  const isLight = variant === "light";

  return (
    <div className="flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-gold font-heading text-sm font-normal tracking-wide text-gold-foreground">
        SS
      </span>
      <div className="min-w-0">
        <p
          className={
            isLight
              ? "font-heading text-base text-white"
              : "font-heading text-base text-foreground"
          }
        >
          Salman Saeed
        </p>
        <p
          className={
            isLight
              ? "text-xs font-medium text-white/70"
              : "text-xs font-medium text-muted-foreground"
          }
        >
          AI Agents · Workflow Automation · Full-Stack
        </p>
      </div>
    </div>
  );
}
