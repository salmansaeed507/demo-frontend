import type { Message } from "@ag-ui/core";
import type { ChatMessage } from "../../store/types";

function contentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (part && typeof part === "object" && "text" in part) {
        return String((part as { text?: unknown }).text ?? "");
      }
      return "";
    })
    .join("");
}

/**
 * Map AG-UI agent messages into the admin chat shape.
 * Assistant text between user turns is merged into ONE assistant message.
 * Tool calls/results are ignored for display.
 */
export function mapAgentMessages(
  messages: Message[],
  isRunning: boolean,
): ChatMessage[] {
  const out: ChatMessage[] = [];
  let turn: ChatMessage | null = null;

  for (const msg of messages) {
    if (msg.role === "user") {
      turn = null;
      out.push({
        id: msg.id,
        role: "user",
        text: contentToText(msg.content),
        createdAt: new Date().toISOString(),
      });
      continue;
    }
    if (msg.role !== "assistant") continue;

    if (!turn) {
      turn = {
        id: msg.id,
        role: "assistant",
        text: "",
        createdAt: new Date().toISOString(),
      };
      out.push(turn);
    }

    const text = contentToText(msg.content);
    if (text) turn.text = turn.text ? `${turn.text}\n\n${text}` : text;
  }

  if (isRunning) {
    let last = out[out.length - 1];
    if (!last || last.role === "user") {
      last = {
        id: "pending-assistant",
        role: "assistant",
        text: "",
        createdAt: new Date().toISOString(),
      };
      out.push(last);
    }
    last.streaming = true;
  }

  return out.filter((m) => m.role === "user" || m.text || m.streaming);
}
