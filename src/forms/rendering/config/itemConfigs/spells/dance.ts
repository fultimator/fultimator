import type { ItemFieldConfig } from "../../fieldConfig";
import type { PlayerSpellFormState } from "./types";
import { isDance } from "./predicates";

export const danceFields: ItemFieldConfig<PlayerSpellFormState> = [
  {
    key: "effect",
    kind: "editable",
    label: "spell.dance.effect",
    component: "textarea",
    defaultValue: "",
    group: "effect",
    order: 70,
    fullWidth: true,
    dependencies: isDance,
  },
];
