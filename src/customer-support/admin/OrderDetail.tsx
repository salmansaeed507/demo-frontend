export default function OrderDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  if (!value.trim()) return null;
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-[13px] leading-snug text-slate-700">{value}</dd>
    </div>
  );
}
