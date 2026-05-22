import { describe, it, expect } from "vitest";
import {
  OptionalQuirkSchema,
  OptionalCampActivitiesSchema,
  OptionalZeroTriggerSchema,
  OptionalZeroEffectSchema,
  OptionalZeroPowerSchema,
  OptionalOtherSchema,
  OptionalSchema,
} from "../../schema/itemSchemas/optional";
import { createSubtypePayloadBuilder } from "../../registry/helpers";
import { OptionalSubtypeSchemas } from "../../schema/itemSchemas/optional";

const SHARED = { name: "Test Optional", fuid: "opt-001" };

describe("optional - quirk subtype", () => {
  it("basic quirk passes schema", () => {
    const result = OptionalQuirkSchema.safeParse({
      ...SHARED,
      subtype: "quirk",
      description: "A strange quirk.",
      effect: "Something happens.",
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("quirk with clock passes schema", () => {
    const result = OptionalQuirkSchema.safeParse({
      ...SHARED,
      subtype: "quirk",
      description: "Ticking quirk.",
      effect: "Tick.",
      clock: { sections: 4 },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
    if (result.success) {
      expect(result.data.clock?.sections).toBe(4);
    }
  });

  it("clock with sections < 2 fails schema", () => {
    const result = OptionalQuirkSchema.safeParse({
      ...SHARED,
      subtype: "quirk",
      description: "Bad clock.",
      effect: "",
      clock: { sections: 1 },
    });
    expect(result.success).toBe(false);
  });
});

describe("optional - camp-activities subtype", () => {
  it("basic camp activity passes schema", () => {
    const result = OptionalCampActivitiesSchema.safeParse({
      ...SHARED,
      subtype: "camp-activities",
      description: "choice",
      targetDescription: "Rest by the fire.",
      effect: "Recover 10 HP.",
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });
});

describe("optional - zero-trigger subtype", () => {
  it("basic zero-trigger passes schema", () => {
    const result = OptionalZeroTriggerSchema.safeParse({
      ...SHARED,
      subtype: "zero-trigger",
      description: "When you fall below half HP...",
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });
});

describe("optional - zero-effect subtype", () => {
  it("basic zero-effect passes schema", () => {
    const result = OptionalZeroEffectSchema.safeParse({
      ...SHARED,
      subtype: "zero-effect",
      description: "Deal double damage.",
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });
});

describe("optional - zero-power subtype", () => {
  it("zero-power with object refs passes schema", () => {
    const result = OptionalZeroPowerSchema.safeParse({
      ...SHARED,
      subtype: "zero-power",
      zeroTriggerRef: "zt-001",
      zeroEffectRef: "ze-001",
      zeroTrigger: { name: "Fall Below Half HP", description: "When you..." },
      zeroEffect: { name: "Double Damage", description: "Deal 2x." },
      clock: { sections: 6 },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("zero-power with empty string refs passes schema", () => {
    const result = OptionalZeroPowerSchema.safeParse({
      ...SHARED,
      subtype: "zero-power",
      zeroTriggerRef: "",
      zeroEffectRef: "",
      zeroTrigger: "",
      zeroEffect: "",
      clock: { sections: 4 },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("zero-power missing clock fails schema", () => {
    const result = OptionalZeroPowerSchema.safeParse({
      ...SHARED,
      subtype: "zero-power",
      zeroTriggerRef: "",
      zeroEffectRef: "",
      zeroTrigger: "",
      zeroEffect: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("optional - other subtype", () => {
  it("basic other optional passes schema", () => {
    const result = OptionalOtherSchema.safeParse({
      ...SHARED,
      subtype: "other",
      description: "Miscellaneous rule.",
      effect: "Do something.",
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });
});

describe("optional - union schema (OptionalSchema)", () => {
  it("each subtype passes the union schema", () => {
    const cases = [
      { ...SHARED, subtype: "quirk", description: "d", effect: "e" },
      {
        ...SHARED,
        subtype: "camp-activities",
        description: "choice",
        targetDescription: "d",
        effect: "e",
      },
      { ...SHARED, subtype: "zero-trigger", description: "d" },
      { ...SHARED, subtype: "zero-effect", description: "d" },
      {
        ...SHARED,
        subtype: "zero-power",
        zeroTriggerRef: "",
        zeroEffectRef: "",
        zeroTrigger: "",
        zeroEffect: "",
        clock: { sections: 4 },
      },
      { ...SHARED, subtype: "other", description: "d", effect: "e" },
    ];
    for (const c of cases) {
      const result = OptionalSchema.safeParse(c);
      expect(result.success, `${c.subtype}: ${JSON.stringify(result)}`).toBe(
        true,
      );
    }
  });

  it("unknown subtype fails the union schema", () => {
    const result = OptionalSchema.safeParse({
      ...SHARED,
      subtype: "bogus",
      description: "d",
      effect: "e",
    });
    expect(result.success).toBe(false);
  });
});

describe("optional - subtype payload builder", () => {
  const buildPayload = createSubtypePayloadBuilder(
    "subtype",
    OptionalSubtypeSchemas,
  );

  it("routes quirk state to the quirk schema", () => {
    const state = {
      ...SHARED,
      subtype: "quirk",
      description: "d",
      effect: "e",
    };
    const payload = buildPayload(state);
    expect(payload).not.toBeNull();
    expect((payload as { subtype: string } | null)?.subtype).toBe("quirk");
  });

  it("routes zero-power state to the zero-power schema", () => {
    const state = {
      ...SHARED,
      subtype: "zero-power",
      zeroTriggerRef: "r1",
      zeroEffectRef: "r2",
      zeroTrigger: { name: "T", description: "td" },
      zeroEffect: { name: "E", description: "ed" },
      clock: { sections: 4 },
    };
    const payload = buildPayload(state);
    expect(payload).not.toBeNull();
  });

  it("returns null for unknown subtype", () => {
    const state = { ...SHARED, subtype: "bogus" };
    const payload = buildPayload(state);
    expect(payload).toBeNull();
  });
});
