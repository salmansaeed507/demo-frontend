import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type Props = {
  children: string;
  className?: string;
  /** Use on primary-colored bubbles so links/code stay readable. */
  variant?: "default" | "inverse";
};

export default function MarkdownContent({
  children,
  className,
  variant = "default",
}: Props) {
  const inverse = variant === "inverse";

  return (
    <div
      className={cn(
        "min-w-0 break-words [&_:first-child]:mt-0 [&_:last-child]:mb-0",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-2 leading-relaxed last:mb-0">{children}</p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "underline underline-offset-2",
                inverse
                  ? "text-primary-foreground/95"
                  : "text-primary",
              )}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote
              className={cn(
                "mb-2 border-l-2 pl-3 italic last:mb-0",
                inverse
                  ? "border-primary-foreground/40 text-primary-foreground/90"
                  : "border-border text-muted-foreground",
              )}
            >
              {children}
            </blockquote>
          ),
          code: ({ className: codeClassName, children }) => {
            const isBlock = Boolean(codeClassName);
            if (isBlock) {
              return (
                <code className="font-mono text-[0.85em]">{children}</code>
              );
            }
            return (
              <code
                className={cn(
                  "rounded px-1 py-0.5 font-mono text-[0.85em]",
                  inverse
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre
              className={cn(
                "mb-2 overflow-x-auto rounded-lg p-3 font-mono text-[0.82em] leading-relaxed last:mb-0",
                inverse
                  ? "bg-primary-foreground/15 text-primary-foreground"
                  : "bg-muted text-foreground",
              )}
            >
              {children}
            </pre>
          ),
          h1: ({ children }) => (
            <h1 className="mb-2 text-base font-semibold last:mb-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 text-[0.98rem] font-semibold last:mb-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 text-[0.94rem] font-semibold last:mb-0">
              {children}
            </h3>
          ),
          hr: () => (
            <hr
              className={cn(
                "my-3 border-0 border-t",
                inverse ? "border-primary-foreground/30" : "border-border",
              )}
            />
          ),
          table: ({ children }) => (
            <div className="mb-2 overflow-x-auto last:mb-0">
              <table className="w-full border-collapse text-left text-[0.9em]">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th
              className={cn(
                "border px-2 py-1 font-semibold",
                inverse ? "border-primary-foreground/30" : "border-border",
              )}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              className={cn(
                "border px-2 py-1",
                inverse ? "border-primary-foreground/30" : "border-border",
              )}
            >
              {children}
            </td>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
