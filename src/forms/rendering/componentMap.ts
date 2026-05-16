import React from "react";
import type { ComponentToken } from "./config/fieldConfig";
import type { FieldRendererProps } from "./fieldRendererProps";
import {
  TextRenderer,
  CustomTextareaRenderer,
  NumberRenderer,
  CheckboxRenderer,
  MartialToggleRenderer,
  SelectRenderer,
  GroupedSelectRenderer,
  TypeSelectRenderer,
  AccuracyCheckRenderer,
  AccuracyAttrPairRenderer,
  CustomizationListRenderer,
  SlotTierPickerRenderer,
  SlotEditorRenderer,
  ReadonlyNumberRenderer,
  RareBonusBlockRenderer,
  NpcAttrSliderRenderer,
  NpcAffinitySliderRenderer,
  NpcArmorSelectRenderer,
  NpcImmunitiesRenderer,
  NpcDefenseRadioRenderer,
} from "./fieldRenderers";

type RendererComponent = React.ComponentType<FieldRendererProps>;

export const componentMap: Record<ComponentToken, RendererComponent> = {
  text: TextRenderer,
  textarea: CustomTextareaRenderer,
  number: NumberRenderer,
  checkbox: CheckboxRenderer,
  select: SelectRenderer,
  "grouped-select": GroupedSelectRenderer,
  "type-select": TypeSelectRenderer,
  "customization-list": CustomizationListRenderer,
  "slot-tier-picker": SlotTierPickerRenderer,
  "slot-editor": SlotEditorRenderer,
  "readonly-number": ReadonlyNumberRenderer,
  // Legacy tokens kept for compatibility during migration.
  "weapon-base-select": GroupedSelectRenderer,
  "accuracy-check": AccuracyCheckRenderer,
  "accuracy-attr-pair": AccuracyAttrPairRenderer,
  "modifier-block": () => null,
  "rare-bonus-block": RareBonusBlockRenderer,
  "martial-toggle": MartialToggleRenderer,
  "npc-attr-slider": NpcAttrSliderRenderer,
  "npc-affinity-slider": NpcAffinitySliderRenderer,
  "npc-armor-select": NpcArmorSelectRenderer,
  "npc-immunities": NpcImmunitiesRenderer,
  "npc-defense-radio": NpcDefenseRadioRenderer,
};
