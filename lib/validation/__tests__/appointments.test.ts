import { describe, expect, it } from "vitest";
import { CreateAppointmentSchema, UpdateAppointmentSchema } from "@/lib/validation/appointments";

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("CreateAppointmentSchema", () => {
  it("accepts a minimal valid appointment", () => {
    const result = CreateAppointmentSchema.safeParse({
      title: "On-site estimate",
      customerId: VALID_UUID,
      scheduledAt: "2026-01-15T10:00",
    });
    expect(result.success).toBe(true);
  });

  it("requires a customer id", () => {
    const result = CreateAppointmentSchema.safeParse({
      title: "On-site estimate",
      scheduledAt: "2026-01-15T10:00",
    });
    expect(result.success).toBe(false);
  });

  it("requires a scheduled date/time", () => {
    const result = CreateAppointmentSchema.safeParse({
      title: "On-site estimate",
      customerId: VALID_UUID,
      scheduledAt: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-positive duration", () => {
    const result = CreateAppointmentSchema.safeParse({
      title: "On-site estimate",
      customerId: VALID_UUID,
      scheduledAt: "2026-01-15T10:00",
      durationMinutes: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid status", () => {
    const result = CreateAppointmentSchema.safeParse({
      title: "On-site estimate",
      customerId: VALID_UUID,
      scheduledAt: "2026-01-15T10:00",
      status: "pending",
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdateAppointmentSchema", () => {
  it("allows a partial update with only status", () => {
    const result = UpdateAppointmentSchema.safeParse({ id: VALID_UUID, status: "completed" });
    expect(result.success).toBe(true);
  });

  it("requires a valid uuid id", () => {
    const result = UpdateAppointmentSchema.safeParse({ id: "nope" });
    expect(result.success).toBe(false);
  });
});
