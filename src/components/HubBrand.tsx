type Props = {
  /** Light text for navy heroes; dark for light backgrounds. */
  variant?: "light" | "dark";
};

export default function HubBrand({ variant = "light" }: Props) {
  const isLight = variant === "light";

  return (
    <div className="flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#7c3aed] to-[#6366f1] text-sm font-extrabold tracking-wide text-white">
        SS
      </span>
      <div className="min-w-0">
        <p
          className={
            isLight
              ? "text-base font-bold text-white"
              : "text-base font-bold text-[#1f2937]"
          }
        >
          Salman Saeed
        </p>
        <p
          className={
            isLight
              ? "text-xs font-medium text-white/70"
              : "text-xs font-medium text-[#6b7280]"
          }
        >
          AI Agents · Workflow Automation · Full-Stack
        </p>
      </div>
    </div>
  );
}
