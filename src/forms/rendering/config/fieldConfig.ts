import type { FormSurface } from "../../schema/fieldParity";

export type ComponentToken =
  | "fuid"
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
  | "offensive-toggle"
  | "autocomplete"
  | "toggle-group"
  | "chip-multi-select"
  | "object-list"
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

export type FieldGridSize =
  | "auto"
  | "grow"
  | number
  | Partial<Record<"xs" | "sm" | "md" | "lg" | "xl", "auto" | "grow" | number>>;

export interface TabDefinition {
  key: string;
  label: string;
}

export interface FieldConfig<TFormState extends Record<string, unknown>> {
  key: string;
  kind: FieldKind;
  label: string | ((state: TFormState) => string);
  component?: ComponentToken; // required for kind === "editable"
  defaultValue?: unknown;
  surfaces?: FormSurface[]; // omit to mean all three
  tab?: string; // omit to place in the first tab
  group?: string;
  order: number;
  componentProps?: Record<string, unknown> | ((state: TFormState) => Record<string, unknown>);
  parse?: (raw: unknown) => unknown;
  format?: (value: unknown) => unknown;
  dependencies?: DependencyPredicate<TFormState>;
  onChangeEffects?: OnChangeEffects<TFormState>;
  validationHints?: { min?: number; max?: number; required?: boolean };
  fullWidth?: boolean;
  gridSize?: FieldGridSize;
}

export type ItemFieldConfig<TFormState extends Record<string, unknown>> =
  FieldConfig<TFormState>[];

// Maps group keys to dot-path label strings, co-located with each item config.
export type GroupLabels = Record<string, string>;
