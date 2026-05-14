export type FormSurface = "quickCreate" | "create" | "edit";

export interface SurfaceFieldParity {
  quickCreate: readonly string[];
  create: readonly string[];
  edit: readonly string[];
}

const WEAPON_FIELDS = [
  "itemType",
  "name",
  "category",
  "range",
  "hands",
  "martial",
  "accuracy",
  "damage",
  "modifiers",
  "rare",
  "quality",
  "cost",
  "special",
  "base",
  "damageBonus",
  "damageReworkBonus",
  "precBonus",
  "rework",
  "qualityCost",
  "totalBonus",
  "selectedQuality",
  "qualityName",
  "isEquipped",
] as const;

const CUSTOM_WEAPON_FIELDS = [
  "itemType",
  "name",
  "category",
  "range",
  "hands",
  "martial",
  "accuracy",
  "damage",
  "modifiers",
  "rare",
  "customizations",
  "quality",
  "qualityName",
  "qualityCost",
  "cost",
  "slots",
  "slotted",
  "secondName",
  "secondCategory",
  "secondRange",
  "secondAccuracy",
  "secondDamage",
  "secondModifiers",
  "secondCustomizations",
  "selectedQuality",
  "isEquipped",
  "dataType",
] as const;

export const ITEM_FIELD_PARITY = {
  weapon: {
    quickCreate: WEAPON_FIELDS,
    create: WEAPON_FIELDS,
    edit: WEAPON_FIELDS,
  },
  customWeapon: {
    quickCreate: CUSTOM_WEAPON_FIELDS,
    create: CUSTOM_WEAPON_FIELDS,
    edit: CUSTOM_WEAPON_FIELDS,
  },
} satisfies Record<string, SurfaceFieldParity>;
