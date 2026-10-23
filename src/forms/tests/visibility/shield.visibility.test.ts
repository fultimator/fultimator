import { describe, it, expect } from "vitest";
import { shieldFieldConfig } from "../../rendering/config/itemConfigs/shield";
import type { ShieldFormState } from "../../rendering/config/itemConfigs/shield";

type S = ShieldFormState;

function visibleKeys(state: Partial<S>, group?: string): string[] {
  return shieldFieldConfig
    .filter((f) => f.kind !== "computed" && f.component)
    .filter((f) => group === undefined || f.group === group)
    .filter((f) => !f.dependencies || f.dependencies(state as S))
    .map((f) => f.key);
}

describe("shield core fields", () => {
  it("shows base picker, name, martial, and rework", () => {
    const keys = visibleKeys({}, "core");
    const baseKeys = visibleKeys({}, "base");
    const modifierKeys = visibleKeys({}, "modifiers");
    expect(baseKeys).toContain("base");
    expect(keys).toContain("name");
    expect(keys).toContain("martial");
    expect(modifierKeys).toContain("rework");
  });
});

describe("shield quality fields", () => {
  it("shows quality preset picker", () => {
    const keys = visibleKeys({}, "quality");
    expect(keys).toContain("selectedQuality");
  });

  it("shows quality text and cost", () => {
    const keys = visibleKeys({}, "quality");
    expect(keys).toContain("quality");
    expect(keys).toContain("qualityCost");
  });
});

describe("shield modifier fields", () => {
  it("shows all modifier fields", () => {
    const keys = visibleKeys({}, "modifiers");
    expect(keys).toContain("defModifier");
    expect(keys).toContain("mDefModifier");
    expect(keys).toContain("initModifier");
    expect(keys).toContain("magicModifier");
    expect(keys).toContain("precModifier");
    expect(keys).toContain("damageMeleeModifier");
    expect(keys).toContain("damageRangedModifier");
  });
});
