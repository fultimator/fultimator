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
  addItemType: CompendiumItemType;
  exportDataType: string;
  schema?: ZodType;
  fields?: unknown;
}

const schemaEntries: Partial<Record<CompendiumItemType, ItemFormRegistryEntry>> =
  {
    weapon: {
      key: "weapon",
      implementation: "schema-config",
      addItemType: "weapon",
      exportDataType: "weapons",
      schema: WeaponPersistedSchema,
      fields: weaponFieldConfig,
    },
    "custom-weapon": {
      key: "custom-weapon",
      implementation: "schema-config",
      addItemType: "custom-weapon",
      exportDataType: "custom-weapons",
      schema: CustomWeaponPersistedSchema,
      fields: customWeaponFieldConfig,
    },
    armor: {
      key: "armor",
      implementation: "schema-config",
      addItemType: "armor",
      exportDataType: "armor",
      schema: ArmorPersistedSchema,
      fields: armorFieldConfig,
    },
    shield: {
      key: "shield",
      implementation: "schema-config",
      addItemType: "shield",
      exportDataType: "shields",
      schema: ShieldPersistedSchema,
      fields: shieldFieldConfig,
    },
    accessory: {
      key: "accessory",
      implementation: "schema-config",
      addItemType: "accessory",
      exportDataType: "accessories",
      schema: AccessoryPersistedSchema,
      fields: accessoryFieldConfig,
    },
  };

const exportDataTypeByKey: Record<CompendiumItemType, string> = {
  "npc-attack": "attacks",
  "npc-spell": "spells",
  "npc-special": "special",
  "npc-action": "actions",
  "player-spell": "player-spells",
  quality: "qualities",
  heroic: "heroics",
  class: "classes",
  mnemosphere: "mnemospheres",
  hoplosphere: "hoplospheres",
  weapon: "weapons",
  "custom-weapon": "custom-weapons",
  armor: "armor",
  shield: "shields",
  accessory: "accessories",
  optional: "optionals",
};

export const itemFormRegistry: Record<CompendiumItemType, ItemFormRegistryEntry> =
  Object.fromEntries(
    QUICK_CREATE_TAB_KEYS.map((key) => [
      key,
      schemaEntries[key] ?? {
        key,
        implementation: "quick-create-panel",
        addItemType: key,
        exportDataType: exportDataTypeByKey[key],
      },
    ]),
  ) as Record<CompendiumItemType, ItemFormRegistryEntry>;

export const ITEM_FORM_REGISTRY_KEYS = QUICK_CREATE_TAB_KEYS;
