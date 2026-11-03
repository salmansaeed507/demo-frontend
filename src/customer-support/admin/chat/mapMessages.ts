import type { Message } from "@ag-ui/core";
import type { ChatMessage } from "../../store/types";
import { SHOW_ALL_AGENT_MESSAGES } from "./devFlags";

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

function prettyJson(value: unknown): string {
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatToolCalls(
  toolCalls: NonNullable<Extract<Message, { role: "assistant" }>["toolCalls"]>,
): string {
  return toolCalls
    .map((call) => {
      const name = call.function?.name ?? "tool";
      const args = prettyJson(call.function?.arguments ?? {});
      return `${name}(${call.id})\n${args}`;
    })
    .join("\n\n");
}

/**
 * Map AG-UI agent messages into the admin chat shape.
 * Default: merge assistant text; hide tool calls/results.
 * Dev (`VITE_SHOW_ALL_AGENT_MESSAGES=true`): one bubble per message, including tools.
 */
export function mapAgentMessages(
  messages: Message[],
  isRunning: boolean,
): ChatMessage[] {
  if (SHOW_ALL_AGENT_MESSAGES) {
    return mapAllAgentMessages(messages, isRunning);
  }
  return mapChatOnlyMessages(messages, isRunning);
}

function mapChatOnlyMessages(
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

function mapAllAgentMessages(
  messages: Message[],
  isRunning: boolean,
): ChatMessage[] {
  const out: ChatMessage[] = [];
  const now = new Date().toISOString();

  for (const msg of messages) {
    if (msg.role === "user") {
      out.push({
        id: msg.id,
        role: "user",
        text: contentToText(msg.content),
        createdAt: now,
      });
      continue;
    }

    if (msg.role === "assistant") {
      const text = contentToText(msg.content);
      const toolCalls = msg.toolCalls ?? [];
      if (toolCalls.length > 0) {
        out.push({
          id: `${msg.id}:tool-calls`,
          role: "tool",
          text: formatToolCalls(toolCalls),
          createdAt: now,
          debugKind: "tool_call",
          toolName: toolCalls
            .map((c) => c.function?.name)
            .filter(Boolean)
            .join(", "),
        });
      }
      if (text || toolCalls.length === 0) {
        out.push({
          id: msg.id,
          role: "assistant",
          text,
          createdAt: now,
        });
      }
      continue;
    }

    if (msg.role === "tool") {
      const name =
        (msg.metadata as { toolName?: string } | undefined)?.toolName ??
        undefined;
      out.push({
        id: msg.id,
        role: "tool",
        text: contentToText(msg.content),
        createdAt: now,
        debugKind: "tool_result",
        toolCallId: msg.toolCallId,
        toolName: name,
      });
      continue;
    }

    if (msg.role === "system" || msg.role === "developer") {
      out.push({
        id: msg.id,
        role: "system",
        text: contentToText(
          "content" in msg ? (msg as { content?: unknown }).content : "",
        ),
        createdAt: now,
        debugKind: msg.role,
      });
      continue;
    }

    out.push({
      id: msg.id,
      role: "debug",
      text: prettyJson(msg),
      createdAt: now,
      debugKind: String((msg as { role?: string }).role ?? "unknown"),
    });
  }

  if (isRunning) {
    let last = out[out.length - 1];
    if (!last || last.role === "user" || last.role === "tool") {
      last = {
        id: "pending-assistant",
        role: "assistant",
        text: "",
        createdAt: now,
      };
      out.push(last);
    }
    if (last.role === "assistant") last.streaming = true;
  }

  return out.filter(
    (m) =>
      m.role === "user" ||
      m.role === "tool" ||
      m.role === "system" ||
      m.role === "debug" ||
      m.text ||
      m.streaming,
  );
}
