import type {
  GroupLabels,
  ItemFieldConfig,
  TabDefinition,
} from "../fieldConfig";
import {
  behaviorsTabField,
  behaviorGroupLabels,
  behaviorRowFields,
  BLANK_BEHAVIOR,
  BLANK_EFFECT_CHANGE,
  BEHAVIOR_GROUPS,
  makeEffectChangeRowFields,
  EFFECT_CHANGE_KEY_OPTIONS,
} from "../shared/behaviorFields";
import {
  ITEM_SCOPED_KEYS,
} from "../shared/itemScopedKeys";

export const EFFECT_APPLICABLE_TYPE_OPTIONS = [
  { value: "weapon", label: "Weapon" },
  { value: "customWeapon", label: "Custom Weapon" },
  { value: "armor", label: "Armor" },
  { value: "shield", label: "Shield" },
  { value: "accessory", label: "Accessory" },
  { value: "hoplosphere", label: "Hoplosphere" },
  { value: "playerSpell", label: "Player Spell" },
  { value: "npcAttack", label: "NPC Attack" },
  { value: "npcSpell", label: "NPC Spell" },
  { value: "npcAction", label: "Other Action" },
  { value: "npcSpecial", label: "Special Rule" },
];

// transfer=true (or no types): actor-level keys.
// transfer=false + 1 type: all that type's keys.
// transfer=false + 2+ types: intersection only.
// transfer=false + 0 types: no suggestions (item type unknown).
export function effectKeyOptionsFromTypes(
  applicableTypes: string[],
  transfer: boolean,
): string[] {
  if (transfer) return EFFECT_CHANGE_KEY_OPTIONS;
  if (!applicableTypes.length) return [];
  const perType = applicableTypes.map((t) => new Set(ITEM_SCOPED_KEYS[t] ?? []));
  if (perType.length === 1) return [...perType[0]];
  const [first, ...rest] = perType;
  return [...first].filter((k) => rest.every((s) => s.has(k)));
}

export type EffectFormState = {
  behaviors: Array<Record<string, unknown>>;
} & Record<string, unknown>;

export const effectTabs: TabDefinition[] = [];

export const effectGroupLabels: GroupLabels = {
  ...behaviorGroupLabels,
};

export function makeEffectFieldConfig(
  applicableTypes: string[] = [],
): ItemFieldConfig<EffectFormState> {

  const applicableTypesField = {
    key: "applicableTypes",
    kind: "editable",
    label: "effect.applicableTypes",
    component: "chip-multi-select",
    defaultValue: [],
    order: -1,
    group: BEHAVIOR_GROUPS.selfEffects,
    gridSize: 12,
    componentProps: {
      options: EFFECT_APPLICABLE_TYPE_OPTIONS,
      placeholder: "effect.applicableTypes.placeholder",
    },
  } as unknown as (typeof behaviorRowFields)[number];

  const scopedBehaviorRowFields = [
    ...behaviorRowFields.map((f) => {
      if (f.key !== "changes") return f;
      const baseProps = f.componentProps as Record<string, unknown>;
      return {
        ...f,
        componentProps: (rowState: Record<string, unknown>) => {
          const transfer = rowState.transfer as boolean | undefined;
          const keys = effectKeyOptionsFromTypes(
            applicableTypes,
            transfer ?? false,
          );
          return {
            ...baseProps,
            fields: makeEffectChangeRowFields(keys),
            itemDefaults: { ...BLANK_EFFECT_CHANGE },
          };
        },
      };
    }),
    applicableTypesField,
  ];

  return [
    {
      ...behaviorsTabField,
      tab: undefined,
      label: "effect.behavior",
      componentProps: {
        ...(behaviorsTabField.componentProps as Record<string, unknown>),
        fields: scopedBehaviorRowFields,
        itemDefaults: BLANK_BEHAVIOR,
        fixedCount: 1,
        initialExpandedIndex: 0,
        enableCompendiumPicker: false,
      },
    } as unknown as ItemFieldConfig<EffectFormState>[number],
  ];
}

export const effectFieldConfig: ItemFieldConfig<EffectFormState> =
  makeEffectFieldConfig([]);
