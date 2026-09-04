import { describe, expect, it } from "vitest";
import { CreateTaskSchema, UpdateTaskSchema } from "@/lib/validation/tasks";

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("CreateTaskSchema", () => {
  it("accepts a minimal valid task", () => {
    const result = CreateTaskSchema.safeParse({ title: "Call client back", priority: "medium" });
    expect(result.success).toBe(true);
  });

  it("requires a priority", () => {
    const result = CreateTaskSchema.safeParse({ title: "Call client back" });
    expect(result.success).toBe(false);
  });

  it("rejects zero or negative estimated minutes", () => {
    const result = CreateTaskSchema.safeParse({
      title: "Call client back",
      priority: "low",
      estimatedMinutes: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects estimated minutes over 24 hours", () => {
    const result = CreateTaskSchema.safeParse({
      title: "Call client back",
      priority: "low",
      estimatedMinutes: 25 * 60,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer estimated minutes", () => {
    const result = CreateTaskSchema.safeParse({
      title: "Call client back",
      priority: "low",
      estimatedMinutes: 12.5,
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdateTaskSchema", () => {
  it("allows cycling status alone", () => {
    const result = UpdateTaskSchema.safeParse({ id: VALID_UUID, status: "done" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid status", () => {
    const result = UpdateTaskSchema.safeParse({ id: VALID_UUID, status: "blocked" });
    expect(result.success).toBe(false);
  });
});
