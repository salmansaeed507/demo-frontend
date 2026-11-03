type Props = {
  totalTokens?: number;
  totalCostUsd?: number;
};

function formatCount(n: number): string {
  return n.toLocaleString();
}

function formatUsd(n: number): string {
  if (n === 0) return "$0";
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 0.01) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(4)}`;
}

/** Compact conversation cost line for the chat header. */
export default function TokenUsageBadge({
  totalTokens,
  totalCostUsd,
}: Props) {
  if (totalTokens == null || totalTokens <= 0) return null;

  return (
    <p
      className="mt-0.5 text-[0.72rem] tabular-nums text-muted-foreground"
      title="Total LLM tokens and cost for this conversation"
    >
      {formatCount(totalTokens)} tokens
      {totalCostUsd != null ? (
        <span className="opacity-80"> · {formatUsd(totalCostUsd)}</span>
      ) : null}
    </p>
  );
}
