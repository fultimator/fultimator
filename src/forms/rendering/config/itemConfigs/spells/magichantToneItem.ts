import type { ItemFieldConfig } from "../../fieldConfig";
import { availableMagichantTones } from "../../../../../libs/player/spellOptionData";

export type MagichantToneItemState = {
  key: string;
  customName: string;
  effect: string;
};

const TONE_PRESET_OPTIONS = [
  ...availableMagichantTones.map((t: { name: string }) => ({
    value: t.name,
    label: t.name,
  })),
  { value: "magichant_custom_name", label: "magichant_custom_name" },
];

export const magichantToneItemFields: ItemFieldConfig<MagichantToneItemState> =
  [
    {
      key: "key",
      kind: "editable",
      label: "magichant_tone",
      component: "select",
      defaultValue: "magichant_custom_name",
      group: "",
      order: 0,
      gridSize: { xs: 12, sm: 6 },
      componentProps: { options: TONE_PRESET_OPTIONS },
    },
    {
      key: "customName",
      kind: "editable",
      label: "magichant_name",
      component: "text",
      defaultValue: "",
      group: "",
      order: 1,
      gridSize: { xs: 12, sm: 6 },
    },
    {
      key: "effect",
      kind: "editable",
      label: "spell.magichant.toneEffect",
      component: "textarea",
      defaultValue: "",
      group: "",
      order: 2,
      fullWidth: true,
    },
  ];
