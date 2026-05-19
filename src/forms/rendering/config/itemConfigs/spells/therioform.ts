import type { ItemFieldConfig } from "../../fieldConfig";
import type { PlayerSpellFormState } from "./types";
import { isTherioform } from "./predicates";

export const therioformFields: ItemFieldConfig<PlayerSpellFormState> = [
  {
    key: "genoclepsis",
    kind: "editable",
    label: "spell.therioform.genoclepsis",
    component: "textarea",
    defaultValue: "",
    group: "effect",
    order: 70,
    fullWidth: true,
    dependencies: isTherioform,
  },
];
