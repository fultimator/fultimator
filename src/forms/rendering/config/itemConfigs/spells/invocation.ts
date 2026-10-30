import type { ItemFieldConfig } from "../../fieldConfig";
import type { PlayerSpellFormState } from "./types";
import { isInvocation } from "./predicates";
import { WELLSPRING_OPTIONS, INV_TYPE_OPTIONS } from "./options";

export const invocationFields: ItemFieldConfig<PlayerSpellFormState> = [
  {
    key: "wellspring",
    kind: "editable",
    label: "spell.invocation.wellspring",
    component: "autocomplete",
    defaultValue: "",
    group: "effect",
    order: 70,
    gridSize: { xs: 12, sm: 6 },
    dependencies: isInvocation,
    componentProps: { options: WELLSPRING_OPTIONS, freeSolo: true },
  },
  {
    key: "type",
    kind: "editable",
    label: "spell.invocation.type",
    component: "select",
    defaultValue: "",
    group: "effect",
    order: 71,
    gridSize: { xs: 12, sm: 6 },
    dependencies: isInvocation,
    componentProps: { options: INV_TYPE_OPTIONS },
  },
  {
    key: "effect",
    kind: "editable",
    label: "spell.invocation.effect",
    component: "textarea",
    defaultValue: "",
    group: "effect",
    order: 72,
    fullWidth: true,
    dependencies: isInvocation,
  },
];
