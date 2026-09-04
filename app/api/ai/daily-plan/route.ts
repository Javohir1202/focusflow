import { NextResponse } from "next/server";
import { askClaude, stripJsonFences } from "@/lib/anthropic";
import { DailyPlanRequestSchema, DailyPlanResponseSchema } from "@/lib/schemas";

const SYSTEM_PROMPT = `You are a scheduling assistant inside a productivity app called FocusFlow.

Given today's date, the current time, and a list of the user's incomplete
tasks (each with a priority, optional deadline, estimated duration, and
optional project), produce an optimized schedule for the rest of the day.

Respond with ONLY valid JSON, no markdown code fences, no commentary, matching
exactly this shape:

{
  "plan": [
    {
      "start": "HH:MM",
      "end": "HH:MM",
      "task": "task title",
      "reason": "short explanation of why this was scheduled here"
    }
  ]
}

Schedule only from the current time onward. Prioritize tasks with closer
deadlines and higher priority. Leave reasonable breaks. Do not include any
text outside the JSON object.`;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsedRequest = DailyPlanRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsedRequest.error.flatten() },
      { status: 400 }
    );
  }

  const { date, currentTime, tasks } = parsedRequest.data;

  let rawText: string;
  try {
    rawText = await askClaude({
      system: SYSTEM_PROMPT,
      user: JSON.stringify({ date, currentTime, tasks }),
      maxTokens: 2000,
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

  const parsedResponse = DailyPlanResponseSchema.safeParse(parsedJson);
  if (!parsedResponse.success) {
    console.error("Daily plan response failed validation:", parsedResponse.error.flatten());
    return NextResponse.json(
      { error: "AI returned an invalid response. Please retry." },
      { status: 502 }
    );
  }

  return NextResponse.json(parsedResponse.data);
}
