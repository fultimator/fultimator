import type { ZodType } from "zod";
import type { CompendiumItemType } from "../../types/CompendiumPack";
import { QUICK_CREATE_TAB_KEYS } from "../../components/compendium/quickCreateTabKeys";
import { WeaponPersistedSchema } from "../schema/itemSchemas/weapon";
import { CustomWeaponPersistedSchema } from "../schema/itemSchemas/customWeapon";
import { ArmorPersistedSchema } from "../schema/itemSchemas/armor";
import { ShieldPersistedSchema } from "../schema/itemSchemas/shield";
import { AccessoryPersistedSchema } from "../schema/itemSchemas/accessory";
import { weaponFieldConfig } from "../rendering/config/itemConfigs/weapon";
import { customWeaponFieldConfig } from "../rendering/config/itemConfigs/customWeapon";
import { armorFieldConfig } from "../rendering/config/itemConfigs/armor";
import { shieldFieldConfig } from "../rendering/config/itemConfigs/shield";
import { accessoryFieldConfig } from "../rendering/config/itemConfigs/accessory";

type FormImplementation = "schema-config" | "quick-create-panel";

export interface ItemFormRegistryEntry {
  key: CompendiumItemType;
  implementation: FormImplementation;
  schema?: ZodType;
  fields?: unknown;
}

const schemaEntries: Partial<Record<CompendiumItemType, ItemFormRegistryEntry>> =
  {
    weapon: {
      key: "weapon",
      implementation: "schema-config",
      schema: WeaponPersistedSchema,
      fields: weaponFieldConfig,
    },
    "custom-weapon": {
      key: "custom-weapon",
      implementation: "schema-config",
      schema: CustomWeaponPersistedSchema,
      fields: customWeaponFieldConfig,
    },
    armor: {
      key: "armor",
      implementation: "schema-config",
      schema: ArmorPersistedSchema,
      fields: armorFieldConfig,
    },
    shield: {
      key: "shield",
      implementation: "schema-config",
      schema: ShieldPersistedSchema,
      fields: shieldFieldConfig,
    },
    accessory: {
      key: "accessory",
      implementation: "schema-config",
      schema: AccessoryPersistedSchema,
      fields: accessoryFieldConfig,
    },
  };

export const itemFormRegistry: Record<CompendiumItemType, ItemFormRegistryEntry> =
  Object.fromEntries(
    QUICK_CREATE_TAB_KEYS.map((key) => [
      key,
      schemaEntries[key] ?? { key, implementation: "quick-create-panel" },
    ]),
  ) as Record<CompendiumItemType, ItemFormRegistryEntry>;

export const ITEM_FORM_REGISTRY_KEYS = QUICK_CREATE_TAB_KEYS;
