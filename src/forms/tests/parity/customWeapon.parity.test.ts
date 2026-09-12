import { describe, it, expect } from "vitest";
import { ITEM_FIELD_PARITY } from "../../schema/fieldParity";
import { CustomWeaponPersistedSchema } from "../../schema/itemSchemas/customWeapon";

function sortKeys(keys: readonly string[]): string[] {
  return [...keys].sort();
}

describe("customWeapon field parity", () => {
  it("keeps QuickCreate/Create/Edit key sets identical", () => {
    const { quickCreate, create, edit } = ITEM_FIELD_PARITY.customWeapon;
    expect(sortKeys(quickCreate)).toEqual(sortKeys(create));
    expect(sortKeys(quickCreate)).toEqual(sortKeys(edit));
  });

  it("keeps parity keys aligned with CustomWeaponPersistedSchema", () => {
    const schemaKeys = sortKeys(Object.keys(CustomWeaponPersistedSchema.shape));
    const parityKeys = sortKeys(ITEM_FIELD_PARITY.customWeapon.quickCreate);
    expect(parityKeys).toEqual(schemaKeys);
  });
});
