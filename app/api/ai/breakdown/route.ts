import { NextResponse } from "next/server";
import { askClaude, stripJsonFences } from "@/lib/anthropic";
import { BreakdownRequestSchema, BreakdownResponseSchema } from "@/lib/schemas";

const SYSTEM_PROMPT = `You are a task-planning assistant inside a productivity app called FocusFlow.

Given a single task description from the user, break it down into a clear, ordered
list of smaller, actionable subtasks.

Respond with ONLY valid JSON, no markdown code fences, no commentary, matching
exactly this shape:

{
  "tasks": [
    {
      "title": "short imperative title",
      "description": "one or two sentences of detail",
      "estimated_minutes": <integer, realistic estimate>,
      "priority": "low" | "medium" | "high"
    }
  ]
}

Produce between 3 and 12 subtasks depending on the size of the task. Do not
include any text outside the JSON object.`;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsedRequest = BreakdownRequestSchema.safeParse(body);
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
      user: `Task: ${parsedRequest.data.task}`,
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

  const parsedResponse = BreakdownResponseSchema.safeParse(parsedJson);
  if (!parsedResponse.success) {
    // Never trust or save an invalid AI response — surface a controlled
    // error and let the user retry instead.
    console.error("Breakdown response failed validation:", parsedResponse.error.flatten());
    return NextResponse.json(
      { error: "AI returned an invalid response. Please retry." },
      { status: 502 }
    );
  }

  return NextResponse.json(parsedResponse.data);
}
