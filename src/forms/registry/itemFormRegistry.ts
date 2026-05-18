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
import { QualitySchema } from "../schema/itemSchemas/quality";
import { HeroicSchema } from "../schema/itemSchemas/heroic";
import { NpcAttackSchema } from "../schema/itemSchemas/npcAttack";
import { NpcSpellSchema } from "../schema/itemSchemas/npcSpell";
import { ClassSchema } from "../schema/itemSchemas/class";
import {
  OptionalSchema,
  OptionalSubtypeSchemas,
} from "../schema/itemSchemas/optional";
import { MnemosphereSchema } from "../schema/itemSchemas/mnemosphere";
import { HoplosphereSchema } from "../schema/itemSchemas/hoplosphere";
import {
  PlayerSpellSchema,
  PlayerSpellSubtypeSchemas,
} from "../schema/itemSchemas/playerSpell";
import { weaponFieldConfig } from "../rendering/config/itemConfigs/weapon";
import { customWeaponFieldConfig } from "../rendering/config/itemConfigs/customWeapon";
import { armorFieldConfig } from "../rendering/config/itemConfigs/armor";
import { shieldFieldConfig } from "../rendering/config/itemConfigs/shield";
import { accessoryFieldConfig } from "../rendering/config/itemConfigs/accessory";
import { npcSpecialFieldConfig } from "../rendering/config/itemConfigs/npcSpecial";
import { npcActionFieldConfig } from "../rendering/config/itemConfigs/npcAction";
import { qualityFieldConfig } from "../rendering/config/itemConfigs/quality";
import { heroicFieldConfig } from "../rendering/config/itemConfigs/heroic";
import { npcAttackFieldConfig } from "../rendering/config/itemConfigs/npcAttack";
import { npcSpellFieldConfig } from "../rendering/config/itemConfigs/npcSpell";
import { classFieldConfig } from "../rendering/config/itemConfigs/class";
import { optionalFieldConfig } from "../rendering/config/itemConfigs/optional";
import { mnemosphereFieldConfig } from "../rendering/config/itemConfigs/mnemosphere";
import { hoplosphereFieldConfig } from "../rendering/config/itemConfigs/hoplosphere";
import {
  createDefaultStateFromFields,
  createSchemaPayloadBuilder,
  createSubtypePayloadBuilder,
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
    implementation: "schema-config",
    addItemType: "npc-special",
    exportDataType: "special",
    schema: NpcSpecialSchema,
    fields: npcSpecialFieldConfig,
    defaultState: () => createDefaultStateFromFields(npcSpecialFieldConfig),
    buildPayload: createSchemaPayloadBuilder(NpcSpecialSchema),
  },
  "npc-action": {
    key: "npc-action",
    label: labelByKey["npc-action"],
    implementation: "schema-config",
    addItemType: "npc-action",
    exportDataType: "actions",
    schema: NpcActionSchema,
    fields: npcActionFieldConfig,
    defaultState: () => createDefaultStateFromFields(npcActionFieldConfig),
    buildPayload: createSchemaPayloadBuilder(NpcActionSchema),
  },
  quality: {
    key: "quality",
    label: labelByKey.quality,
    implementation: "schema-config",
    addItemType: "quality",
    exportDataType: "qualities",
    schema: QualitySchema,
    fields: qualityFieldConfig,
    defaultState: () => createDefaultStateFromFields(qualityFieldConfig),
    buildPayload: createSchemaPayloadBuilder(QualitySchema),
  },
  heroic: {
    key: "heroic",
    label: labelByKey.heroic,
    implementation: "schema-config",
    addItemType: "heroic",
    exportDataType: "heroics",
    schema: HeroicSchema,
    fields: heroicFieldConfig,
    defaultState: () => createDefaultStateFromFields(heroicFieldConfig),
    buildPayload: createSchemaPayloadBuilder(HeroicSchema),
  },
  "npc-attack": {
    key: "npc-attack",
    label: labelByKey["npc-attack"],
    implementation: "schema-config",
    addItemType: "npc-attack",
    exportDataType: "attacks",
    schema: NpcAttackSchema,
    fields: npcAttackFieldConfig,
    defaultState: () => createDefaultStateFromFields(npcAttackFieldConfig),
    buildPayload: createSchemaPayloadBuilder(NpcAttackSchema),
  },
  "npc-spell": {
    key: "npc-spell",
    label: labelByKey["npc-spell"],
    implementation: "schema-config",
    addItemType: "npc-spell",
    exportDataType: "spells",
    schema: NpcSpellSchema,
    fields: npcSpellFieldConfig,
    defaultState: () => createDefaultStateFromFields(npcSpellFieldConfig),
    buildPayload: createSchemaPayloadBuilder(NpcSpellSchema),
  },
  class: {
    key: "class",
    label: labelByKey.class,
    implementation: "schema-config",
    addItemType: "class",
    exportDataType: "classes",
    schema: ClassSchema,
    fields: classFieldConfig,
    defaultState: () => createDefaultStateFromFields(classFieldConfig),
    buildPayload: createSchemaPayloadBuilder(ClassSchema),
  },
  optional: {
    key: "optional",
    label: labelByKey.optional,
    implementation: "schema-config",
    addItemType: "optional",
    exportDataType: "optionals",
    schema: OptionalSchema,
    fields: optionalFieldConfig,
    defaultState: () => createDefaultStateFromFields(optionalFieldConfig),
    discriminatorKey: "subtype",
    subtypeDefinitions: Object.fromEntries(
      Object.entries(OptionalSubtypeSchemas).map(([subtype, schema]) => [
        subtype,
        {
          schema: schema as unknown as typeof OptionalSchema,
          buildPayload: createSchemaPayloadBuilder(
            schema as unknown as typeof OptionalSchema,
          ),
        },
      ]),
    ),
    buildPayload: createSubtypePayloadBuilder(
      "subtype",
      OptionalSubtypeSchemas,
    ),
  },
  mnemosphere: {
    key: "mnemosphere",
    label: labelByKey.mnemosphere,
    implementation: "schema-config",
    addItemType: "mnemosphere",
    exportDataType: "mnemospheres",
    schema: MnemosphereSchema,
    fields: mnemosphereFieldConfig,
    defaultState: () => createDefaultStateFromFields(mnemosphereFieldConfig),
    buildPayload: createSchemaPayloadBuilder(MnemosphereSchema),
  },
  hoplosphere: {
    key: "hoplosphere",
    label: labelByKey.hoplosphere,
    implementation: "schema-config",
    addItemType: "hoplosphere",
    exportDataType: "hoplospheres",
    schema: HoplosphereSchema,
    fields: hoplosphereFieldConfig,
    defaultState: () => createDefaultStateFromFields(hoplosphereFieldConfig),
    buildPayload: createSchemaPayloadBuilder(HoplosphereSchema),
  },
  "player-spell": {
    key: "player-spell",
    label: labelByKey["player-spell"],
    implementation: "quick-create-panel",
    addItemType: "player-spell",
    exportDataType: "player-spells",
    schema: PlayerSpellSchema,
    discriminatorKey: "spellType",
    subtypeDefinitions: Object.fromEntries(
      Object.entries(PlayerSpellSubtypeSchemas).map(([subtype, schema]) => [
        subtype,
        {
          schema: schema as unknown as typeof PlayerSpellSchema,
          buildPayload: createSchemaPayloadBuilder(
            schema as unknown as typeof PlayerSpellSchema,
          ),
        },
      ]),
    ),
    buildPayload: (state: unknown) => {
      if (!state || typeof state !== "object") return null;
      const payload = state as Record<string, unknown>;
      const spellType = payload.spellType;
      if (typeof spellType !== "string") return null;

      const subtypeKey =
        spellType === "magichant"
          ? payload.magichantSubtype === "key"
            ? "magichant-key"
            : "magichant"
          : spellType;

      const schema =
        PlayerSpellSubtypeSchemas[
          subtypeKey as keyof typeof PlayerSpellSubtypeSchemas
        ];
      if (!schema) return null;
      const parsed = schema.safeParse(payload);
      return parsed.success ? parsed.data : null;
    },
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
