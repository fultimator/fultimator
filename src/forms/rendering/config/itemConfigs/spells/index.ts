import type { ItemFieldConfig } from "../../fieldConfig";
import { metaFieldConfig } from "../../metaFieldConfig";
import type { PlayerSpellFormState } from "./types";
import { SPELL_TYPE_OPTIONS } from "./options";
import { defaultFields } from "./default";
import { arcanistFields } from "./arcanist";
import { tinkererFields } from "./tinkerer";
import { pilotVehicleFields } from "./pilotVehicle";

export type { PlayerSpellFormState, PlayerSpellUiType } from "./types";

export const playerSpellFieldConfig: ItemFieldConfig<PlayerSpellFormState> = [
  {
    key: "spellType",
    kind: "editable",
    label: "Spell Type",
    component: "select",
    defaultValue: "default",
    group: "core",
    order: 0,
    gridSize: { xs: 12, sm: 5 },
    componentProps: { options: SPELL_TYPE_OPTIONS },
  },
  {
    key: "fuid",
    kind: "editable",
    label: "ID",
    component: "fuid",
    defaultValue: undefined,
    group: "core",
    order: 1,
    gridSize: 12,
  },
  {
    key: "name",
    kind: "editable",
    label: "Name",
    component: "text",
    defaultValue: "",
    group: "core",
    order: 2,
    gridSize: "grow",
    validationHints: { required: true },
  },

  ...defaultFields,
  ...arcanistFields,
  ...tinkererFields,
  ...pilotVehicleFields,
  ...(metaFieldConfig as unknown as ItemFieldConfig<PlayerSpellFormState>),
];
