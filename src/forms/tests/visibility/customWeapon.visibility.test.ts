import { describe, it, expect } from "vitest";
import { customWeaponFieldConfig } from "../../rendering/config/itemConfigs/customWeapon";
import type { CustomWeaponFormState } from "../../rendering/config/itemConfigs/customWeapon";

type S = CustomWeaponFormState;

function visibleKeys(state: Partial<S>, group?: string): string[] {
  return customWeaponFieldConfig
    .filter((f) => f.kind !== "computed" && f.component)
    .filter((f) => group === undefined || f.group === group)
    .filter((f) => !f.dependencies || f.dependencies(state as S))
    .map((f) => f.key);
}

function base(overrides: Partial<S> = {}): Partial<S> {
  return {
    overrideAccuracyAttributes: false,
    overrideDamageType: false,
    customizations: [],
    hasTransforming: false,
    isSlotsVariant: false,
    ...overrides,
  };
}

describe("accuracy picker mutual exclusion", () => {
  it("shows preset picker when overrideAccuracyAttributes is off", () => {
    const keys = visibleKeys(
      base({ overrideAccuracyAttributes: false }),
      "accuracy",
    );
    expect(keys).toContain("selectedAccuracyCheck");
  });

  it("hides preset picker when overrideAccuracyAttributes is on", () => {
    const keys = visibleKeys(
      base({ overrideAccuracyAttributes: true }),
      "accuracy",
    );
    expect(keys).not.toContain("selectedAccuracyCheck");
  });

  it("shows attr pair picker when overrideAccuracyAttributes is on", () => {
    // selectedAccuracyCheck exists in both accuracy and rare groups with opposing dependencies
    const rareEntry = customWeaponFieldConfig.find(
      (f) => f.key === "selectedAccuracyCheck" && f.group === "rare",
    );
    expect(rareEntry).toBeDefined();
    expect(
      rareEntry!.dependencies!({
        ...base({ overrideAccuracyAttributes: true }),
      } as S),
    ).toBe(true);
    expect(
      rareEntry!.dependencies!({
        ...base({ overrideAccuracyAttributes: false }),
      } as S),
    ).toBe(false);
  });
});

describe("damage type picker visibility", () => {
  it("hidden when no override and no elemental customization", () => {
    const keys = visibleKeys(
      base({ overrideDamageType: false, customizations: [] }),
    );
    expect(keys).not.toContain("customDamageType");
  });

  it("shown when overrideDamageType is on", () => {
    const keys = visibleKeys(
      base({ overrideDamageType: true, customizations: [] }),
    );
    expect(keys).toContain("customDamageType");
  });

  it("shown when elemental customization is present", () => {
    const keys = visibleKeys(
      base({
        overrideDamageType: false,
        customizations: [
          {
            name: "weapon_customization_elemental",
            effect: "",
            martial: false,
            customCost: 0,
          },
        ],
      }),
    );
    expect(keys).toContain("customDamageType");
  });
});

describe("quality vs slots mutual exclusion", () => {
  it("shows quality fields when not slots variant", () => {
    const keys = visibleKeys(base({ isSlotsVariant: false }));
    expect(keys).toContain("selectedQuality");
    expect(keys).toContain("qualityName");
    expect(keys).toContain("qualityCost");
    expect(keys).toContain("quality");
  });

  it("hides quality fields when slots variant", () => {
    const keys = visibleKeys(base({ isSlotsVariant: true }));
    expect(keys).not.toContain("selectedQuality");
    expect(keys).not.toContain("qualityName");
    expect(keys).not.toContain("qualityCost");
    expect(keys).not.toContain("quality");
  });

  it("shows slot fields only when slots variant", () => {
    expect(visibleKeys(base({ isSlotsVariant: true }))).toContain("slots");
    expect(visibleKeys(base({ isSlotsVariant: false }))).not.toContain("slots");
  });
});

describe("transforming secondary form fields", () => {
  it("hides all secondary fields when hasTransforming is false", () => {
    const keys = visibleKeys(base({ hasTransforming: false }));
    expect(keys).not.toContain("secondWeaponName");
    expect(keys).not.toContain("secondSelectedCategory");
    expect(keys).not.toContain("secondSelectedAccuracyCheck");
    expect(keys).not.toContain("secondaryHrZero");
    expect(keys).not.toContain("secondCustomizations");
  });

  it("shows secondary fields when hasTransforming is true", () => {
    const keys = visibleKeys(
      base({ hasTransforming: true, overrideAccuracyAttributes: false }),
    );
    expect(keys).toContain("secondWeaponName");
    expect(keys).toContain("secondSelectedCategory");
    expect(keys).toContain("secondSelectedAccuracyCheck");
    expect(keys).toContain("secondaryHrZero");
    expect(keys).toContain("secondCustomizations");
  });

  it("hides secondary accuracy check when overrideAccuracyAttributes is on", () => {
    const keys = visibleKeys(
      base({ hasTransforming: true, overrideAccuracyAttributes: true }),
    );
    expect(keys).not.toContain("secondSelectedAccuracyCheck");
  });
});

describe("rare override damage type value field", () => {
  it("hidden when overrideDamageType is off", () => {
    const rareTypeEntry = customWeaponFieldConfig.find(
      (f) => f.key === "customDamageType" && f.group === "rare",
    );
    expect(rareTypeEntry).toBeDefined();
    expect(
      rareTypeEntry!.dependencies!({
        ...base({ overrideDamageType: false, customizations: [] }),
      } as S),
    ).toBe(false);
  });

  it("shown when overrideDamageType is on and no elemental customization", () => {
    const rareTypeEntry = customWeaponFieldConfig.find(
      (f) => f.key === "customDamageType" && f.group === "rare",
    );
    expect(
      rareTypeEntry!.dependencies!({
        ...base({ overrideDamageType: true, customizations: [] }),
      } as S),
    ).toBe(true);
  });

  it("hidden when elemental customization is present (takes precedence)", () => {
    const rareTypeEntry = customWeaponFieldConfig.find(
      (f) => f.key === "customDamageType" && f.group === "rare",
    );
    expect(
      rareTypeEntry!.dependencies!({
        ...base({
          overrideDamageType: true,
          customizations: [
            {
              name: "weapon_customization_elemental",
              effect: "",
              martial: false,
              customCost: 0,
            },
          ],
        }),
      } as S),
    ).toBe(false);
  });
});
