import { describe, expect, it } from "vitest";
import { CreateJobSchema, UpdateJobSchema } from "@/lib/validation/jobs";

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("CreateJobSchema", () => {
  it("accepts a minimal valid job", () => {
    const result = CreateJobSchema.safeParse({ title: "Repaint", customerId: VALID_UUID });
    expect(result.success).toBe(true);
  });

  it("requires a customer id", () => {
    const result = CreateJobSchema.safeParse({ title: "Repaint" });
    expect(result.success).toBe(false);
  });

  it("rejects a customerId that isn't a uuid", () => {
    const result = CreateJobSchema.safeParse({ title: "Repaint", customerId: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty title", () => {
    const result = CreateJobSchema.safeParse({ title: "", customerId: VALID_UUID });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid priority", () => {
    const result = CreateJobSchema.safeParse({
      title: "Repaint",
      customerId: VALID_UUID,
      priority: "urgent",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a negative price", () => {
    const result = CreateJobSchema.safeParse({
      title: "Repaint",
      customerId: VALID_UUID,
      price: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdateJobSchema", () => {
  it("allows a partial update with only status", () => {
    const result = UpdateJobSchema.safeParse({ id: VALID_UUID, status: "completed" });
    expect(result.success).toBe(true);
  });

  it("requires a valid uuid id", () => {
    const result = UpdateJobSchema.safeParse({ id: "nope" });
    expect(result.success).toBe(false);
  });
});
