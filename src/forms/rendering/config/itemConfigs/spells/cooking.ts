import type { ItemFieldConfig } from "../../fieldConfig";
import type { PlayerSpellFormState } from "./types";
import { isCooking } from "./predicates";

const BLANK_COOKBOOK_EFFECT = { effect: "" };

const cookbookRowFields: ItemFieldConfig<Record<string, unknown>> = [
  {
    key: "effect",
    kind: "editable",
    label: "spell.cooking.effect",
    component: "textarea",
    defaultValue: "",
    order: 0,
    gridSize: 12,
  },
];

export const cookingFields: ItemFieldConfig<PlayerSpellFormState> = [
  {
    key: "cookingEffects",
    kind: "editable",
    label: "spell.cooking.effects",
    component: "object-list",
    defaultValue: Array.from({ length: 12 }, () => ({
      ...BLANK_COOKBOOK_EFFECT,
    })),
    group: "effect",
    order: 70,
    gridSize: 12,
    dependencies: isCooking,
    componentProps: {
      fields: cookbookRowFields,
      itemDefaults: { ...BLANK_COOKBOOK_EFFECT },
      fixedCount: 12,
      rowLabel: (_row: Record<string, unknown>, i: number) => `Result ${i + 1}`,
    },
  },
];
