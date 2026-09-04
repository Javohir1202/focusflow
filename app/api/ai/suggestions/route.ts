import { NextResponse } from "next/server";
import { askClaude, stripJsonFences } from "@/lib/anthropic";
import { SuggestionsRequestSchema, SuggestionsResponseSchema } from "@/lib/schemas";

const SYSTEM_PROMPT = `You are a productivity coach inside an app called FocusFlow.

Given a short summary of the user's recent activity (completed tasks, missed
deadlines, time spent per project, etc.), suggest a few concrete, actionable
ways they could improve their productivity or focus.

Respond with ONLY valid JSON, no markdown code fences, no commentary, matching
exactly this shape:

{
  "suggestions": [
    { "title": "short suggestion title", "detail": "one or two sentences of detail" }
  ]
}

Provide between 2 and 6 suggestions. Do not include any text outside the JSON
object.`;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsedRequest = SuggestionsRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsedRequest.error.flatten() },
      { status: 400 }
    );
  }

  let rawText: string;
  try {
    rawText = await askClaude({
      system: SYSTEM_PROMPT,
      user: parsedRequest.data.recentActivity,
    });
  } catch (err) {
    console.error("Claude request failed:", err);
    return NextResponse.json(
      { error: "AI request failed. Please try again." },
      { status: 502 }
    );
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(stripJsonFences(rawText));
  } catch {
    return NextResponse.json(
      { error: "AI returned an unreadable response. Please retry." },
      { status: 502 }
    );
  }

  const parsedResponse = SuggestionsResponseSchema.safeParse(parsedJson);
  if (!parsedResponse.success) {
    console.error("Suggestions response failed validation:", parsedResponse.error.flatten());
    return NextResponse.json(
      { error: "AI returned an invalid response. Please retry." },
      { status: 502 }
    );
  }

  return NextResponse.json(parsedResponse.data);
}
