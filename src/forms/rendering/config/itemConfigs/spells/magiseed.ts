import type { ItemFieldConfig } from "../../fieldConfig";
import type { PlayerSpellFormState } from "./types";
import { isMagiseed } from "./predicates";

export const magiseedFields: ItemFieldConfig<PlayerSpellFormState> = [
  {
    key: "seedDescription",
    kind: "editable",
    label: "spell.magiseed.description",
    component: "textarea",
    defaultValue: "",
    group: "effect",
    order: 70,
    fullWidth: true,
    dependencies: isMagiseed,
  },
  {
    key: "seedRangeStart",
    kind: "editable",
    label: "spell.magiseed.rangeStart",
    component: "number",
    defaultValue: 1,
    group: "effect",
    order: 71,
    gridSize: { xs: 6, sm: 3 },
    parse: (v) => Number(v) || 1,
    validationHints: { min: 1 },
    dependencies: isMagiseed,
  },
  {
    key: "seedRangeEnd",
    kind: "editable",
    label: "spell.magiseed.rangeEnd",
    component: "number",
    defaultValue: 4,
    group: "effect",
    order: 72,
    gridSize: { xs: 6, sm: 3 },
    parse: (v) => Number(v) || 4,
    validationHints: { min: 1 },
    dependencies: isMagiseed,
  },
];
