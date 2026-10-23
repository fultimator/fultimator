import { describe, it, expect } from "vitest";
import { accessoryFieldConfig } from "../../rendering/config/itemConfigs/accessory";
import type { AccessoryFormState } from "../../rendering/config/itemConfigs/accessory";

type S = AccessoryFormState;

function visibleKeys(state: Partial<S>, group?: string): string[] {
  return accessoryFieldConfig
    .filter((f) => f.kind !== "computed" && f.component)
    .filter((f) => group === undefined || f.group === group)
    .filter((f) => !f.dependencies || f.dependencies(state as S))
    .map((f) => f.key);
}

describe("accessory quality fields", () => {
  it("shows quality preset picker by default", () => {
    const keys = visibleKeys({}, "quality");
    expect(keys).toContain("selectedQuality");
  });

  it("shows quality text and cost fields", () => {
    const keys = visibleKeys({}, "quality");
    expect(keys).toContain("quality");
    expect(keys).toContain("qualityCost");
  });
});

describe("accessory modifier fields", () => {
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

describe("accessory core fields", () => {
  it("shows name field", () => {
    const keys = visibleKeys({}, "core");
    expect(keys).toContain("name");
  });
});
