import { describe, it, expect } from "vitest";
import { armorFieldConfig } from "../../rendering/config/itemConfigs/armor";
import type { ArmorFormState } from "../../rendering/config/itemConfigs/armor";

type S = ArmorFormState;

function visibleKeys(state: Partial<S>, group?: string): string[] {
  return armorFieldConfig
    .filter((f) => f.kind !== "computed" && f.component)
    .filter((f) => group === undefined || f.group === group)
    .filter((f) => !f.dependencies || f.dependencies(state as S))
    .map((f) => f.key);
}

function base(overrides: Partial<S> = {}): Partial<S> {
  return {
    isSlotsVariant: false,
    ...overrides,
  };
}

describe("armor core fields", () => {
  it("shows base picker, name, martial, and rework", () => {
    const keys = visibleKeys(base(), "core");
    const baseKeys = visibleKeys(base(), "base");
    const modifierKeys = visibleKeys(base(), "modifiers");
    expect(baseKeys).toContain("base");
    expect(keys).toContain("name");
    expect(keys).toContain("martial");
    expect(modifierKeys).toContain("rework");
  });
});

describe("quality vs slots mutual exclusion", () => {
  it("shows quality fields when not slots variant", () => {
    const keys = visibleKeys(base({ isSlotsVariant: false }));
    expect(keys).toContain("selectedQuality");
    expect(keys).toContain("quality");
    expect(keys).toContain("qualityCost");
  });

  it("hides quality fields when slots variant is active", () => {
    const keys = visibleKeys(base({ isSlotsVariant: true }));
    expect(keys).not.toContain("selectedQuality");
    expect(keys).not.toContain("quality");
    expect(keys).not.toContain("qualityCost");
  });

  it("shows slot-tier-picker when slots variant is active", () => {
    const keys = visibleKeys(base({ isSlotsVariant: true }), "slots");
    expect(keys).toContain("slots");
  });

  it("hides slot-tier-picker when not slots variant", () => {
    const keys = visibleKeys(base({ isSlotsVariant: false }), "slots");
    expect(keys).not.toContain("slots");
  });

  it("shows slot-editor when slots variant is active", () => {
    const keys = visibleKeys(base({ isSlotsVariant: true }), "slots");
    expect(keys).toContain("slotted");
  });

  it("hides slot-editor when not slots variant", () => {
    const keys = visibleKeys(base({ isSlotsVariant: false }), "slots");
    expect(keys).not.toContain("slotted");
  });
});

describe("armor modifier fields", () => {
  it("shows all modifier fields regardless of slots variant", () => {
    for (const isSlotsVariant of [false, true]) {
      const keys = visibleKeys(base({ isSlotsVariant }), "modifiers");
      expect(keys).toContain("defModifier");
      expect(keys).toContain("mDefModifier");
      expect(keys).toContain("initModifier");
      expect(keys).toContain("magicModifier");
      expect(keys).toContain("precModifier");
      expect(keys).toContain("damageMeleeModifier");
      expect(keys).toContain("damageRangedModifier");
    }
  });
});
