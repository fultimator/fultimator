import type { FormSurface } from "../../schema/fieldParity";

export type ComponentToken =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "grouped-select"
  | "type-select"
  | "checkbox"
  | "modifier-block"
  | "customization-list"
  | "slot-tier-picker"
  | "slot-editor"
  | "weapon-base-select"
  | "accuracy-check"
  | "accuracy-attr-pair"
  | "readonly-number"
  | "rare-bonus-block"
  | "martial-toggle"
  | "autocomplete"
  // NPC-specific tokens
  | "npc-attr-slider"
  | "npc-affinity-slider"
  | "npc-armor-select"
  | "npc-immunities"
  | "npc-defense-radio";

export type FieldKind =
  | "editable" // has a UI control; lands in the payload
  | "computed" // derived; no UI control; still lands in the payload
  | "form-state"; // persisted for edit reconstruction; not part of canonical shape

export type DependencyPredicate<TFormState extends Record<string, unknown>> = (
  values: TFormState,
) => boolean;

// Keys may be dot-notation paths ("damage.value") for nested writes.
// The renderer resolves these at apply time.
export type OnChangeEffects<TFormState extends Record<string, unknown>> = {
  [K in keyof TFormState]?: (values: TFormState) => TFormState[K];
} & { [path: string]: (values: TFormState) => unknown };

export interface FieldConfig<TFormState extends Record<string, unknown>> {
  key: keyof TFormState & string;
  kind: FieldKind;
  label: string; // i18n key
  component?: ComponentToken; // required for kind === "editable"
  defaultValue?: TFormState[keyof TFormState];
  surfaces?: FormSurface[]; // omit to mean all three
  group?: string;
  order: number;
  componentProps?: Record<string, unknown>;
  parse?: (raw: unknown) => TFormState[keyof TFormState];
  format?: (value: TFormState[keyof TFormState]) => unknown;
  dependencies?: DependencyPredicate<TFormState>;
  onChangeEffects?: OnChangeEffects<TFormState>;
  validationHints?: { min?: number; max?: number; required?: boolean };
  fullWidth?: boolean;
  gridSize?: "auto" | "grow" | number;
}

export type ItemFieldConfig<TFormState extends Record<string, unknown>> =
  FieldConfig<TFormState>[];
