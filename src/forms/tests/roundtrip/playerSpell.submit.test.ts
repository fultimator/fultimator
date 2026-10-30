import { describe, expect, it } from "vitest";
import { itemFormRegistry } from "../../../forms/registry/itemFormRegistry";
import { PlayerSpellSubtypeSchemas } from "../../../forms/schema/itemSchemas/spells";

describe("player-spell submit payloads", () => {
  const entry = itemFormRegistry["player-spell"];

  const context = {
    compendiumClasses: [],
    compendiumItems: [],
    affinityOptions: [],
  };

  const baseState = {
    ...(entry.defaultState?.() as Record<string, unknown>),
    name: "QA Spell",
    class: "Arcanist",
    isOffensive: false,
    "cost.amount": 0,
    "cost.perTarget": true,
    maxTargets: 1,
    description: "QA description",
    targetDescription: "One creature",
    duration: "Instantaneous",
    "accuracy.attr1": "insight",
    "accuracy.attr2": "will",
    "damage.value": 0,
    "damage.type": "physical",
    "damage.hrZero": false,
  };

  const cases: Array<{
    uiType: string;
    schemaKey: keyof typeof PlayerSpellSubtypeSchemas;
  }> = [
    { uiType: "default", schemaKey: "default" },
    { uiType: "gift", schemaKey: "gift" },
    { uiType: "dance", schemaKey: "dance" },
    { uiType: "therioform", schemaKey: "therioform" },
    { uiType: "magichant", schemaKey: "magichant" },
    { uiType: "magichant-key", schemaKey: "magichant" },
    { uiType: "symbol", schemaKey: "symbol" },
    { uiType: "invocation", schemaKey: "invocation" },
    { uiType: "arcanist", schemaKey: "arcanist" },
    { uiType: "arcanist-rework", schemaKey: "arcanist-rework" },
    { uiType: "tinkerer-alchemy", schemaKey: "tinkerer-alchemy" },
    { uiType: "tinkerer-infusion", schemaKey: "tinkerer-infusion" },
    { uiType: "tinkerer-magitech", schemaKey: "tinkerer-magitech" },
    { uiType: "cooking", schemaKey: "cooking" },
    { uiType: "magiseed", schemaKey: "magiseed" },
    { uiType: "pilot-vehicle", schemaKey: "pilot-vehicle" },
    { uiType: "gamble", schemaKey: "gamble" },
    { uiType: "deck", schemaKey: "deck" },
  ];

  for (const c of cases) {
    it(`builds schema-valid payload for ${c.uiType}`, () => {
      const payload = entry.buildPayload?.(
        {
          ...baseState,
          spellType: c.uiType,
        },
        context,
      );

      expect(payload).not.toBeNull();
      const schema = PlayerSpellSubtypeSchemas[c.schemaKey];
      const parsed = schema.safeParse(payload);
      expect(parsed.success, JSON.stringify(parsed, null, 2)).toBe(true);
    });
  }
});
