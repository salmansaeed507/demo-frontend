export default function ChatEmptyState() {
  return (
    <div className="w-full max-w-md px-1 text-center">
      <h3 className="font-heading text-[1.7rem] leading-tight tracking-tight text-foreground">
        Hi, how can I help you?
      </h3>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
        Probe the live stack — knowledge retrieval with sources, order lookups,
        and ticket tools.
      </p>
    </div>
  );
}
