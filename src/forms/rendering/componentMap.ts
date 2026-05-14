import React from "react";
import type { ComponentToken } from "./config/fieldConfig";
import type { FieldRendererProps } from "./fieldRendererProps";
import {
  TextRenderer,
  CustomTextareaRenderer,
  NumberRenderer,
  CheckboxRenderer,
  SelectRenderer,
  GroupedSelectRenderer,
  TypeSelectRenderer,
  AccuracyCheckRenderer,
  CustomizationListRenderer,
  SlotTierPickerRenderer,
  SlotEditorRenderer,
  ReadonlyNumberRenderer,
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
  "modifier-block": () => null,
};
