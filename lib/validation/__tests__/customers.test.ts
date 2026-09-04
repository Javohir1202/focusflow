import { describe, expect, it } from "vitest";
import { CreateCustomerSchema, UpdateCustomerSchema } from "@/lib/validation/customers";

describe("CreateCustomerSchema", () => {
  it("accepts a minimal valid customer", () => {
    const result = CreateCustomerSchema.safeParse({ name: "Sarah Nguyen" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = CreateCustomerSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a name over 200 characters", () => {
    const result = CreateCustomerSchema.safeParse({ name: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = CreateCustomerSchema.safeParse({ name: "Sarah", email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("accepts an empty-string email (form fields left blank)", () => {
    const result = CreateCustomerSchema.safeParse({ name: "Sarah", email: "" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid status enum value", () => {
    const result = CreateCustomerSchema.safeParse({ name: "Sarah", status: "customer" });
    expect(result.success).toBe(false);
  });

  it("rejects more than 20 tags", () => {
    const result = CreateCustomerSchema.safeParse({
      name: "Sarah",
      tags: Array.from({ length: 21 }, (_, i) => `tag${i}`),
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdateCustomerSchema", () => {
  it("requires a valid uuid id", () => {
    const result = UpdateCustomerSchema.safeParse({ id: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("allows a partial update with only status", () => {
    const result = UpdateCustomerSchema.safeParse({
      id: "123e4567-e89b-12d3-a456-426614174000",
      status: "active",
    });
    expect(result.success).toBe(true);
  });

  it("allows explicitly nulling out optional fields", () => {
    const result = UpdateCustomerSchema.safeParse({
      id: "123e4567-e89b-12d3-a456-426614174000",
      company: null,
      notes: null,
    });
    expect(result.success).toBe(true);
  });
});
