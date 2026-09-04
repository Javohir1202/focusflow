import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL } from "./config";

// IMPORTANT: this module must only ever be imported from server-side code
// (API routes, server components, server actions). The `server-only`
// import above makes any accidental client-side import fail the build.

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set on the server.");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Sends a single-turn prompt to Claude and returns the concatenated text
 * content of the response. Intended for structured-output style calls
 * (task breakdown, daily planning, suggestions) where the caller will
 * validate the returned JSON with a Zod schema before trusting it.
 */
export async function askClaude(params: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: params.maxTokens ?? 1500,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
  });

  return response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .filter(Boolean)
    .join("\n");
}

/**
 * Strips markdown code fences that models sometimes wrap JSON in, so
 * callers can safely JSON.parse the result before Zod validation.
 */
export function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}
