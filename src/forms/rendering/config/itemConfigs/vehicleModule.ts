import type { GroupLabels, ItemFieldConfig } from "../fieldConfig";
import type { SelectOption } from "../../fieldRenderers";
import weaponCategories from "../../../../libs/weaponCategories";
import attributes from "../../../../libs/attributes";
import { moduleTypes, availableModules } from "../../../../libs/pilotVehicleData";
import { typeOptions } from "../typeOptions";
import { metaFieldConfigWithGroup } from "../metaFieldConfig";

export type VehicleModuleFormState = {
  name: string;
  key?: string;
  customName?: string;
  type: string;
  description?: string;
  cost?: number;
  // armor
  def?: number;
  mdef?: number;
  martial?: boolean;
  // weapon
  category?: string;
  range?: string;
  cumbersome?: boolean;
  isShield?: boolean;
  quality?: string;
  qualityCost?: number;
  accuracy?: { attr1?: string; attr2?: string; value?: number };
  damage?: { value?: number; type?: string };
  // support
  isComplex?: boolean;
  // meta
  meta?: { book?: string; page?: number; bookName?: string; isOfficial?: boolean };
};

const isWeapon = (s: VehicleModuleFormState) => s.type === "pilot_module_weapon";
const isArmor = (s: VehicleModuleFormState) => s.type === "pilot_module_armor";
const isSupport = (s: VehicleModuleFormState) => s.type === "pilot_module_support";
export const isCustomModule = (s: VehicleModuleFormState) =>
  s.name === "pilot_custom_armor" ||
  s.name === "pilot_custom_weapon" ||
  s.name === "pilot_custom_support";

const categoryOptions: SelectOption[] = weaponCategories.map((c: string) => ({
  value: c,
  label: c,
}));

const attributeOptions: SelectOption[] = Object.entries(
  attributes as Record<string, { shortcaps: string }>,
).map(([key, val]) => ({ value: key, label: val.shortcaps }));

const rangeOptions: SelectOption[] = [
  { value: "Melee", label: "Melee" },
  { value: "Ranged", label: "Ranged" },
];

const moduleTypeOptions: SelectOption[] = moduleTypes.map((t: string) => ({
  value: t,
  label: t,
}));

type AvailableModule = { name: string; type: string; [key: string]: unknown };
const allModuleItems: AvailableModule[] = ([] as AvailableModule[]).concat(
  ...(Object.values(availableModules as Record<string, AvailableModule[]>)),
);

const moduleItemOptionsByType: Record<string, SelectOption[]> = {
  pilot_module_armor: allModuleItems
    .filter((m) => m.type === "pilot_module_armor")
    .map((m) => ({ value: m.name, label: m.name })),
  pilot_module_weapon: allModuleItems
    .filter((m) => m.type === "pilot_module_weapon")
    .map((m) => ({ value: m.name, label: m.name })),
  pilot_module_support: allModuleItems
    .filter((m) => m.type === "pilot_module_support")
    .map((m) => ({ value: m.name, label: m.name })),
};

const VM = "vehicle_module";

const G = {
  core: "core",
  armor: "armor",
  weapon: "weapon",
  accuracy: "accuracy",
  damage: "damage",
  quality: "quality",
  support: "support",
  description: "description",
  source: "source",
} as const;

export const vehicleModuleGroupLabels: GroupLabels = {
  armor: `${VM}.group.armor`,
  weapon: `${VM}.group.weapon`,
  accuracy: `${VM}.group.accuracy`,
  damage: `${VM}.group.damage`,
  quality: `${VM}.group.quality`,
  support: `${VM}.group.support`,
  description: "shared.description",
  source: "section.meta",
};

export const vehicleModuleTabs = [{ key: "main", label: "Details" }];

export const vehicleModuleFieldConfig: ItemFieldConfig<VehicleModuleFormState> = [
  // Core - module selector + custom overrides
  {
    key: "name",
    kind: "editable",
    label: `${VM}.name`,
    component: "select",
    defaultValue: "pilot_module_armor",
    group: G.core,
    order: 0,
    fullWidth: true,
    componentProps: (s: VehicleModuleFormState) => ({
      options: moduleItemOptionsByType[s.type] ?? moduleTypeOptions,
    }),
  },
  {
    key: "customName",
    kind: "editable",
    label: `${VM}.customName`,
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 1,
    dependencies: isCustomModule,
  },
  {
    key: "type",
    kind: "editable",
    label: "shared.type",
    component: "select",
    defaultValue: "pilot_module_armor",
    group: G.core,
    order: 2,
    dependencies: isCustomModule,
    componentProps: { options: moduleTypeOptions },
  },

  // Armor stats - group: "armor"
  {
    key: "martial",
    kind: "editable",
    label: "shared.martial",
    component: "martial-toggle",
    defaultValue: false,
    group: G.armor,
    order: 10,
    gridSize: 1,
    dependencies: isArmor,
  },
  {
    key: "def",
    kind: "editable",
    label: "shared.modifiers.def",
    component: "number",
    defaultValue: 0,
    group: G.armor,
    order: 11,
    gridSize: 3,
    parse: (v) => Number(v) || 0,
    dependencies: isArmor,
  },
  {
    key: "mdef",
    kind: "editable",
    label: "shared.modifiers.mdef",
    component: "number",
    defaultValue: 0,
    group: G.armor,
    order: 12,
    gridSize: 3,
    parse: (v) => Number(v) || 0,
    dependencies: isArmor,
  },
  {
    key: "cost",
    kind: "editable",
    label: "shared.cost",
    component: "number",
    defaultValue: 0,
    group: G.armor,
    order: 13,
    gridSize: 3,
    parse: (v) => Number(v) || 0,
    dependencies: isArmor,
  },

  // Weapon stats - group: "weapon" (Category, Range, Cumbersome, Shield)
  {
    key: "category",
    kind: "editable",
    label: "shared.category",
    component: "select",
    defaultValue: "",
    group: G.weapon,
    order: 20,
    gridSize: 4,
    dependencies: isWeapon,
    componentProps: { options: categoryOptions },
  },
  {
    key: "range",
    kind: "editable",
    label: "shared.range",
    component: "select",
    defaultValue: "Melee",
    group: G.weapon,
    order: 21,
    gridSize: 4,
    dependencies: isWeapon,
    componentProps: { options: rangeOptions },
  },
  {
    key: "cumbersome",
    kind: "editable",
    label: `${VM}.cumbersome`,
    component: "checkbox",
    defaultValue: false,
    group: G.weapon,
    order: 22,
    gridSize: 2,
    dependencies: isWeapon,
  },
  {
    key: "isShield",
    kind: "editable",
    label: `${VM}.shield`,
    component: "checkbox",
    defaultValue: false,
    group: G.weapon,
    order: 23,
    gridSize: 2,
    dependencies: isWeapon,
  },

  // Accuracy - group: "accuracy"
  {
    key: "accuracy.attr1",
    kind: "editable",
    label: "shared.accuracy.attr1",
    component: "select",
    defaultValue: "dexterity",
    group: G.accuracy,
    order: 30,
    gridSize: 4,
    dependencies: isWeapon,
    componentProps: { options: attributeOptions },
  },
  {
    key: "accuracy.attr2",
    kind: "editable",
    label: "shared.accuracy.attr2",
    component: "select",
    defaultValue: "insight",
    group: G.accuracy,
    order: 31,
    gridSize: 4,
    dependencies: isWeapon,
    componentProps: { options: attributeOptions },
  },
  {
    key: "accuracy.value",
    kind: "editable",
    label: "shared.accuracy.bonus",
    component: "number",
    defaultValue: 0,
    group: G.accuracy,
    order: 32,
    gridSize: 4,
    parse: (v) => Number(v) || 0,
    dependencies: isWeapon,
  },

  // Damage - group: "damage"
  {
    key: "damage.type",
    kind: "editable",
    label: "shared.damage.type",
    component: "type-select",
    defaultValue: "physical",
    group: G.damage,
    order: 40,
    gridSize: 4,
    dependencies: isWeapon,
    componentProps: { options: typeOptions },
  },
  {
    key: "damage.value",
    kind: "editable",
    label: "shared.damage.value",
    component: "number",
    defaultValue: 0,
    group: G.damage,
    order: 41,
    gridSize: 4,
    parse: (v) => Number(v) || 0,
    dependencies: isWeapon,
  },
  {
    key: "cost",
    kind: "editable",
    label: "shared.cost",
    component: "number",
    defaultValue: 0,
    group: G.damage,
    order: 42,
    gridSize: 4,
    parse: (v) => Number(v) || 0,
    dependencies: isWeapon,
  },

  // Quality - group: "quality"
  {
    key: "qualityCost",
    kind: "editable",
    label: "shared.quality.cost",
    component: "number",
    defaultValue: 0,
    group: G.quality,
    order: 50,
    gridSize: 4,
    parse: (v) => Number(v) || 0,
    dependencies: isWeapon,
  },
  {
    key: "quality",
    kind: "editable",
    label: "shared.quality.text",
    component: "textarea",
    defaultValue: "",
    group: G.quality,
    order: 51,
    fullWidth: true,
    dependencies: isWeapon,
  },

  // Support stats - group: "support"
  {
    key: "isComplex",
    kind: "editable",
    label: `${VM}.isComplex`,
    component: "checkbox",
    defaultValue: false,
    group: G.support,
    order: 60,
    dependencies: isSupport,
  },
  {
    key: "cost",
    kind: "editable",
    label: "shared.cost",
    component: "number",
    defaultValue: 0,
    group: G.support,
    order: 61,
    gridSize: 4,
    parse: (v) => Number(v) || 0,
    dependencies: isSupport,
  },

  // Description - custom modules only (non-custom shows read-only description above)
  {
    key: "description",
    kind: "editable",
    label: "shared.description",
    component: "textarea",
    defaultValue: "",
    group: G.description,
    order: 70,
    fullWidth: true,
    dependencies: isCustomModule,
  },

  ...(metaFieldConfigWithGroup(G.source) as unknown as ItemFieldConfig<VehicleModuleFormState>),
];
