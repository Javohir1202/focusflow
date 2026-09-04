import { describe, expect, it } from "vitest";
import { CreateLeadSchema, UpdateLeadSchema } from "@/lib/validation/leads";

describe("CreateLeadSchema", () => {
  it("accepts a minimal valid lead", () => {
    const result = CreateLeadSchema.safeParse({ contactName: "Jordan Lee" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty contact name", () => {
    const result = CreateLeadSchema.safeParse({ contactName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative value", () => {
    const result = CreateLeadSchema.safeParse({ contactName: "Jordan", value: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects a value over the cap", () => {
    const result = CreateLeadSchema.safeParse({ contactName: "Jordan", value: 200_000_000 });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid customerId that isn't a uuid or empty string", () => {
    const result = CreateLeadSchema.safeParse({ contactName: "Jordan", customerId: "abc123" });
    expect(result.success).toBe(false);
  });

  it("accepts an empty-string customerId (not linked yet)", () => {
    const result = CreateLeadSchema.safeParse({ contactName: "Jordan", customerId: "" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid pipeline status", () => {
    const result = CreateLeadSchema.safeParse({ contactName: "Jordan", status: "interested" });
    expect(result.success).toBe(false);
  });
});

describe("UpdateLeadSchema", () => {
  it("requires a valid uuid id", () => {
    const result = UpdateLeadSchema.safeParse({ id: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("allows moving a lead's status alone", () => {
    const result = UpdateLeadSchema.safeParse({
      id: "123e4567-e89b-12d3-a456-426614174000",
      status: "won",
    });
    expect(result.success).toBe(true);
  });
});
