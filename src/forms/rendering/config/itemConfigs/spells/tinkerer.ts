import type { ItemFieldConfig } from "../../fieldConfig";
import type { PlayerSpellFormState } from "./types";
import { isTinkererAlchemy, isTinkererInfusion } from "./predicates";

export const tinkererFields: ItemFieldConfig<PlayerSpellFormState> = [
  {
    key: "category",
    kind: "editable",
    label: "spell.tinkerer.category",
    component: "text",
    defaultValue: "",
    group: "effect",
    order: 79,
    fullWidth: true,
    dependencies: isTinkererAlchemy,
  },
  {
    key: "infusionRank",
    kind: "editable",
    label: "spell.tinkerer.infusionRank",
    component: "number",
    defaultValue: null,
    group: "effect",
    order: 80,
    gridSize: { xs: 12, sm: 4 },
    parse: (v) =>
      v == null || v === "" ? null : Math.max(1, Math.min(3, Number(v) || 1)),
    validationHints: { min: 1, max: 3 },
    dependencies: isTinkererInfusion,
  },
];
