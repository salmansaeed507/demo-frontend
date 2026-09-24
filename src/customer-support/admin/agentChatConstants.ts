export function sleep(ms: number) {
  return new Promise((r) => window.setTimeout(r, ms));
}

/** Guided paths that hit the strongest tool demos. */
export const AGENT_STARTER_PROMPTS = [
  "What's your return window?",
  "Where is order #48291?",
  "Summarize ticket TCK-1042",
  "Is the Aurora headphones still in stock?",
] as const;
