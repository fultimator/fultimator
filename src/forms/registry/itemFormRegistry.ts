import type { CompendiumItemType } from "../../types/CompendiumPack";
import { QUICK_CREATE_TAB_KEYS } from "../../components/compendium/quickCreateTabKeys";
import type { ItemFormDefinition } from "./types";
import { WeaponPersistedSchema } from "../schema/itemSchemas/weapon";
import { CustomWeaponPersistedSchema } from "../schema/itemSchemas/customWeapon";
import { ArmorPersistedSchema } from "../schema/itemSchemas/armor";
import { ShieldPersistedSchema } from "../schema/itemSchemas/shield";
import { AccessoryPersistedSchema } from "../schema/itemSchemas/accessory";
import { NpcSpecialSchema } from "../schema/itemSchemas/npcSpecial";
import { NpcActionSchema } from "../schema/itemSchemas/npcAction";
import { weaponFieldConfig } from "../rendering/config/itemConfigs/weapon";
import { customWeaponFieldConfig } from "../rendering/config/itemConfigs/customWeapon";
import { armorFieldConfig } from "../rendering/config/itemConfigs/armor";
import { shieldFieldConfig } from "../rendering/config/itemConfigs/shield";
import { accessoryFieldConfig } from "../rendering/config/itemConfigs/accessory";
import {
  createDefaultStateFromFields,
  createSchemaPayloadBuilder,
} from "./helpers";

const labelByKey: Record<CompendiumItemType, string> = {
  "npc-attack": "NPC Attack",
  "npc-spell": "NPC Spell",
  "npc-special": "Special Rule",
  "npc-action": "Other Action",
  "player-spell": "Player Spell",
  quality: "Quality",
  heroic: "Heroic Skill",
  class: "Class",
  mnemosphere: "Mnemosphere",
  hoplosphere: "Hoplosphere",
  weapon: "Weapon",
  "custom-weapon": "Custom Weapon",
  armor: "Armor",
  shield: "Shield",
  accessory: "Accessory",
  optional: "Optional",
};

const schemaEntries: Partial<Record<CompendiumItemType, ItemFormDefinition>> = {
  weapon: {
    key: "weapon",
    label: labelByKey.weapon,
    implementation: "schema-config",
    addItemType: "weapon",
    exportDataType: "weapons",
    schema: WeaponPersistedSchema,
    fields: weaponFieldConfig,
    defaultState: () => createDefaultStateFromFields(weaponFieldConfig),
    buildPayload: createSchemaPayloadBuilder(WeaponPersistedSchema),
  },
  "custom-weapon": {
    key: "custom-weapon",
    label: labelByKey["custom-weapon"],
    implementation: "schema-config",
    addItemType: "custom-weapon",
    exportDataType: "custom-weapons",
    schema: CustomWeaponPersistedSchema,
    fields: customWeaponFieldConfig,
    defaultState: () => createDefaultStateFromFields(customWeaponFieldConfig),
    buildPayload: createSchemaPayloadBuilder(CustomWeaponPersistedSchema),
  },
  armor: {
    key: "armor",
    label: labelByKey.armor,
    implementation: "schema-config",
    addItemType: "armor",
    exportDataType: "armor",
    schema: ArmorPersistedSchema,
    fields: armorFieldConfig,
    defaultState: () => createDefaultStateFromFields(armorFieldConfig),
    buildPayload: createSchemaPayloadBuilder(ArmorPersistedSchema),
  },
  shield: {
    key: "shield",
    label: labelByKey.shield,
    implementation: "schema-config",
    addItemType: "shield",
    exportDataType: "shields",
    schema: ShieldPersistedSchema,
    fields: shieldFieldConfig,
    defaultState: () => createDefaultStateFromFields(shieldFieldConfig),
    buildPayload: createSchemaPayloadBuilder(ShieldPersistedSchema),
  },
  accessory: {
    key: "accessory",
    label: labelByKey.accessory,
    implementation: "schema-config",
    addItemType: "accessory",
    exportDataType: "accessories",
    schema: AccessoryPersistedSchema,
    fields: accessoryFieldConfig,
    defaultState: () => createDefaultStateFromFields(accessoryFieldConfig),
    buildPayload: createSchemaPayloadBuilder(AccessoryPersistedSchema),
  },
  "npc-special": {
    key: "npc-special",
    label: labelByKey["npc-special"],
    implementation: "quick-create-panel",
    addItemType: "npc-special",
    exportDataType: "special",
    schema: NpcSpecialSchema,
    buildPayload: createSchemaPayloadBuilder(NpcSpecialSchema),
  },
  "npc-action": {
    key: "npc-action",
    label: labelByKey["npc-action"],
    implementation: "quick-create-panel",
    addItemType: "npc-action",
    exportDataType: "actions",
    schema: NpcActionSchema,
    buildPayload: createSchemaPayloadBuilder(NpcActionSchema),
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

export const itemFormRegistry: Record<CompendiumItemType, ItemFormDefinition> =
  Object.fromEntries(
    QUICK_CREATE_TAB_KEYS.map((key) => [
      key,
      schemaEntries[key] ?? {
        key,
        label: labelByKey[key],
        implementation: "quick-create-panel",
        addItemType: key,
        exportDataType: exportDataTypeByKey[key],
      },
    ]),
  ) as Record<CompendiumItemType, ItemFormDefinition>;

export const ITEM_FORM_REGISTRY_KEYS = QUICK_CREATE_TAB_KEYS;
