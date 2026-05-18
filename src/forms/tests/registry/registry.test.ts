import { describe, it, expect } from "vitest";
import { itemFormRegistry, ITEM_FORM_REGISTRY_KEYS } from "../../registry/itemFormRegistry";
import { QUICK_CREATE_TAB_KEYS } from "../../../components/compendium/quickCreateTabKeys";

describe("itemFormRegistry", () => {
  it("contains every Quick Create tab key", () => {
    for (const key of QUICK_CREATE_TAB_KEYS) {
      expect(itemFormRegistry).toHaveProperty(key);
    }
  });

  it("registry key list matches QUICK_CREATE_TAB_KEYS", () => {
    expect(ITEM_FORM_REGISTRY_KEYS).toEqual(QUICK_CREATE_TAB_KEYS);
  });

  it("every entry has required fields", () => {
    for (const key of QUICK_CREATE_TAB_KEYS) {
      const entry = itemFormRegistry[key];
      expect(entry.key, `${key}.key`).toBe(key);
      expect(entry.label, `${key}.label`).toBeTruthy();
      expect(entry.implementation, `${key}.implementation`).toMatch(
        /^(schema-config|quick-create-panel)$/,
      );
      expect(entry.addItemType, `${key}.addItemType`).toBeTruthy();
      expect(entry.exportDataType, `${key}.exportDataType`).toBeTruthy();
    }
  });

  const schemaConfigTypes = QUICK_CREATE_TAB_KEYS.filter(
    (k) => k !== "player-spell",
  );

  it("schema-config entries have schema, defaultState, buildPayload, and fields", () => {
    for (const key of schemaConfigTypes) {
      const entry = itemFormRegistry[key];
      expect(entry.implementation, `${key}.implementation`).toBe("schema-config");
      expect(entry.schema, `${key}.schema`).toBeDefined();
      expect(entry.defaultState, `${key}.defaultState`).toBeTypeOf("function");
      expect(entry.buildPayload, `${key}.buildPayload`).toBeTypeOf("function");
      expect(entry.fields, `${key}.fields`).toBeDefined();
    }
  });

  it("defaultState() returns a non-empty object for every schema-config type", () => {
    for (const key of schemaConfigTypes) {
      const entry = itemFormRegistry[key];
      const state = entry.defaultState!();
      expect(state, `${key} defaultState`).toBeDefined();
      expect(typeof state, `${key} defaultState type`).toBe("object");
      expect(Object.keys(state as object).length, `${key} defaultState keys`).toBeGreaterThan(0);
    }
  });

  it("player-spell uses quick-create-panel implementation", () => {
    expect(itemFormRegistry["player-spell"].implementation).toBe("quick-create-panel");
  });

  it("player-spell has subtypeDefinitions for all spell subtypes", () => {
    const entry = itemFormRegistry["player-spell"];
    expect(entry.subtypeDefinitions).toBeDefined();
    const subtypes = Object.keys(entry.subtypeDefinitions!);
    expect(subtypes).toContain("default");
    expect(subtypes).toContain("arcanist");
    expect(subtypes).toContain("tinkerer-alchemy");
    expect(subtypes).toContain("pilot-vehicle");
  });

  it("optional has subtypeDefinitions for all optional subtypes", () => {
    const entry = itemFormRegistry["optional"];
    expect(entry.subtypeDefinitions).toBeDefined();
    const subtypes = Object.keys(entry.subtypeDefinitions!);
    for (const s of ["quirk", "camp-activities", "zero-trigger", "zero-effect", "zero-power", "other"]) {
      expect(subtypes, `optional subtypeDefinitions`).toContain(s);
    }
  });
});
