import type { ItemFieldConfig } from "../../fieldConfig";
import type { PlayerSpellFormState } from "./types";
import { isSymbol } from "./predicates";

export const symbolFields: ItemFieldConfig<PlayerSpellFormState> = [
  {
    key: "effect",
    kind: "editable",
    label: "spell.symbol.effect",
    component: "textarea",
    defaultValue: "",
    group: "effect",
    order: 70,
    fullWidth: true,
    dependencies: isSymbol,
  },
];
