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
  PlayerSpellDefaultSchema,
  PlayerSpellArcanistSchema,
  PlayerSpellArcanistReworkSchema,
  PlayerSpellTinkererAlchemySchema,
  PlayerSpellTinkererInfusionSchema,
} from "../schema/itemSchemas/playerSpell";
import {
  weaponFieldConfig,
  weaponTabs,
} from "../rendering/config/itemConfigs/weapon";
import {
  customWeaponFieldConfig,
  customWeaponTabs,
} from "../rendering/config/itemConfigs/customWeapon";
import {
  armorFieldConfig,
  armorTabs,
} from "../rendering/config/itemConfigs/armor";
import {
  shieldFieldConfig,
  shieldTabs,
} from "../rendering/config/itemConfigs/shield";
import {
  accessoryFieldConfig,
  accessoryTabs,
} from "../rendering/config/itemConfigs/accessory";
import {
  npcSpecialFieldConfig,
  npcSpecialTabs,
} from "../rendering/config/itemConfigs/npcSpecial";
import {
  npcActionFieldConfig,
  npcActionTabs,
} from "../rendering/config/itemConfigs/npcAction";
import { qualityFieldConfig } from "../rendering/config/itemConfigs/quality";
import {
  heroicFieldConfig,
  heroicTabs,
} from "../rendering/config/itemConfigs/heroic";
import {
  npcAttackFieldConfig,
  npcAttackTabs,
} from "../rendering/config/itemConfigs/npcAttack";
import {
  npcSpellFieldConfig,
  npcSpellTabs,
} from "../rendering/config/itemConfigs/npcSpell";
import { classFieldConfig } from "../rendering/config/itemConfigs/class";
import { itemFieldConfig } from "../rendering/config/itemConfigs/item";
import { consumableFieldConfig } from "../rendering/config/itemConfigs/consumable";
import { noteFieldConfig } from "../rendering/config/itemConfigs/note";
import { ItemSchema } from "../schema/itemSchemas/item";
import { ConsumableSchema } from "../schema/itemSchemas/consumable";
import { NoteSchema } from "../schema/itemSchemas/note";
import { optionalFieldConfig } from "../rendering/config/itemConfigs/optional";
import { mnemosphereFieldConfig } from "../rendering/config/itemConfigs/mnemosphere";
import {
  hoplosphereFieldConfig,
  hoplosphereTabs,
} from "../rendering/config/itemConfigs/hoplosphere";
import {
  playerSpellFieldConfig,
  playerSpellTabs,
  type PlayerSpellFormState,
} from "../rendering/config/itemConfigs/playerSpell";
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
  item: "Item",
  consumable: "Consumable",
  note: "Note",
  effect: "Effect",
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
    tabs: weaponTabs,
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
    tabs: customWeaponTabs,
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
    tabs: armorTabs,
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
    tabs: shieldTabs,
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
    tabs: accessoryTabs,
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
    tabs: npcSpecialTabs,
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
    tabs: npcActionTabs,
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
    tabs: heroicTabs,
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
    tabs: npcAttackTabs,
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
    tabs: npcSpellTabs,
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
    tabs: hoplosphereTabs,
    defaultState: () => createDefaultStateFromFields(hoplosphereFieldConfig),
    buildPayload: createSchemaPayloadBuilder(HoplosphereSchema),
  },
  "player-spell": {
    key: "player-spell",
    label: labelByKey["player-spell"],
    implementation: "schema-config",
    addItemType: "player-spell",
    exportDataType: "player-spells",
    schema: PlayerSpellSchema,
    fields: playerSpellFieldConfig,
    tabs: playerSpellTabs,
    defaultState: () => createDefaultStateFromFields(playerSpellFieldConfig),
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
    buildPayload: (state: unknown): unknown | null => {
      if (!state || typeof state !== "object") return null;
      const s = state as PlayerSpellFormState;
      const spellType =
        s.spellType === "magichant-key" ? "magichant" : s.spellType;
      if (!spellType) return null;

      const metaState =
        (
          s as unknown as {
            meta?: {
              book?: string;
              page?: string;
              bookName?: string;
              isOfficial?: boolean;
            };
          }
        ).meta ?? {};
      const metaObj = metaState.book
        ? {
            book: metaState.book,
            page: metaState.page,
            bookName: metaState.bookName || undefined,
            isOfficial: metaState.isOfficial,
          }
        : undefined;
      const showInPlayerSheet = s.showInPlayerSheet ?? true;

      // default spell: nested field groups from form state
      if (spellType === "default") {
        const nested = s as unknown as {
          cost?: { amount?: number; perTarget?: boolean };
          accuracy?: { attr1?: string; attr2?: string };
          damage?: { value?: number; type?: string; hrZero?: boolean };
        };
        const cost = nested.cost ?? {};
        const accuracy = nested.accuracy ?? {};
        const damage = nested.damage ?? {};
        const payload = {
          spellType: "default" as const,
          class: s.class,
          name: (s.name ?? "").trim(),
          fuid: s.fuid || undefined,
          meta: metaObj,
          showInPlayerSheet,
          description: (s.description ?? "").trim(),
          isOffensive: s.isOffensive,
          cost: {
            resource: "mp" as const,
            amount: cost.amount ?? 0,
            perTarget: cost.perTarget ?? true,
          },
          maxTargets: s.maxTargets,
          targetDescription:
            (s.targetDescription ?? "").trim() || "One creature",
          duration: (s.duration ?? "").trim() || "Instantaneous",
          accuracy: {
            attr1: accuracy.attr1,
            attr2: accuracy.attr2,
            value: 0,
            defense: "mdef" as const,
          },
          damage: {
            value: s.isOffensive ? (damage.value ?? 0) : 0,
            type: s.isOffensive ? (damage.type ?? "physical") : "physical",
            hrZero: damage.hrZero ?? false,
          },
        };
        const parsed = PlayerSpellDefaultSchema.safeParse(payload);
        return parsed.success ? parsed.data : null;
      }

      const base = {
        name: s.name.trim(),
        fuid: s.fuid || undefined,
        meta: metaObj,
        showInPlayerSheet,
        spellType,
        description: (s.description ?? "").trim() || undefined,
      };

      // arcanist: flat domain/merge/dismiss fields from form state
      if (spellType === "arcanist") {
        const payload = {
          ...base,
          spellType: "arcanist" as const,
          description: s.description.trim(),
          domain: s.domain.trim(),
          domainDesc: s.domainDesc.trim(),
          merge: s.merge.trim(),
          mergeDesc: s.mergeDesc.trim(),
          dismiss: s.dismiss.trim(),
          dismissDesc: s.dismissDesc.trim(),
        };
        const parsed = PlayerSpellArcanistSchema.safeParse(payload);
        return parsed.success ? parsed.data : null;
      }

      if (spellType === "arcanist-rework") {
        const payload = {
          ...base,
          spellType: "arcanist-rework" as const,
          description: s.description.trim(),
          domain: s.domain.trim(),
          domainDesc: s.domainDesc.trim(),
          merge: s.merge.trim(),
          mergeDesc: s.mergeDesc.trim(),
          dismiss: s.dismiss.trim(),
          dismissDesc: s.dismissDesc.trim(),
          pulse: s.pulse.trim(),
          pulseDesc: s.pulseDesc.trim(),
        };
        const parsed = PlayerSpellArcanistReworkSchema.safeParse(payload);
        return parsed.success ? parsed.data : null;
      }

      if (spellType === "tinkerer-alchemy") {
        const payload = {
          ...base,
          spellType: "tinkerer-alchemy" as const,
          category: s.category.trim() || undefined,
        };
        const parsed = PlayerSpellTinkererAlchemySchema.safeParse(payload);
        return parsed.success ? parsed.data : null;
      }

      if (spellType === "tinkerer-infusion") {
        const payload = {
          ...base,
          spellType: "tinkerer-infusion" as const,
          infusionRank: s.infusionRank != null ? s.infusionRank : undefined,
        };
        const parsed = PlayerSpellTinkererInfusionSchema.safeParse(payload);
        return parsed.success ? parsed.data : null;
      }

      if (spellType === "gift") {
        return {
          ...base,
          spellType: "gift" as const,
          clock: 0,
          gifts: [
            {
              key: s.name.trim() || "esper_gift_custom_name",
              customName: "",
              event: s.event.trim(),
              effect: s.effect.trim(),
            },
          ],
        };
      }

      if (spellType === "dance") {
        return {
          ...base,
          spellType: "dance" as const,
          dances: [
            {
              key: s.name.trim() || "dance_custom",
              customName: "",
              effect: s.effect.trim(),
              duration: s.duration.trim(),
            },
          ],
        };
      }

      if (spellType === "therioform") {
        return {
          ...base,
          spellType: "therioform" as const,
          therioforms: [
            {
              key: s.name.trim() || "mutant_therioform_custom_name",
              customName: "",
              genoclepsis: s.genoclepsis.trim(),
              description: s.effect.trim(),
            },
          ],
        };
      }

      if (spellType === "magichant") {
        if (s.spellType === "magichant-key") {
          return {
            ...base,
            spellType: "magichant" as const,
            keys: [
              {
                key: s.name.trim() || "magichant_custom_name",
                customName: "",
                type: s.type.trim(),
                status: s.status.trim(),
                attribute: s.attribute.trim(),
                recovery: s.recovery.trim(),
              },
            ],
            tones: [],
          };
        }
        return {
          ...base,
          spellType: "magichant" as const,
          keys: [],
          tones: [
            {
              key: s.name.trim() || "magichant_custom_name",
              customName: "",
              effect: s.effect.trim(),
            },
          ],
        };
      }

      if (spellType === "symbol") {
        return {
          ...base,
          spellType: "symbol" as const,
          symbols: [
            {
              key: s.name.trim() || "symbol_custom_name",
              customName: "",
              effect: s.effect.trim(),
            },
          ],
        };
      }

      if (spellType === "invocation") {
        return {
          ...base,
          spellType: "invocation" as const,
          name: s.name.trim(),
          type: s.type.trim(),
          effect: s.effect.trim(),
          wellspring: s.wellspring.trim(),
        };
      }

      if (spellType === "wellspring") {
        return {
          ...base,
          spellType: "wellspring" as const,
          name: s.name.trim(),
          color: (s.color as string) || "#888888",
          textColor: (s.textColor as "black" | "white") || "white",
          icon: (s.icon as string) || "untyped",
        };
      }

      if (spellType === "cooking") {
        return {
          ...base,
          spellType: "cooking" as const,
          spellName: s.name.trim() || "Cookbook",
          cookbook: {
            effects: (s.cookingEffects || []).map((row) => ({
              taste1: "",
              taste2: "",
              effect: (row.effect || "").trim(),
              customChoices: {},
            })),
            ingredientInventory: [],
          },
        };
      }

      if (spellType === "magiseed") {
        const extra = s as unknown as Record<string, unknown>;
        const importedSeeds = extra.magiseeds as typeof s.magiseeds | undefined;
        const effects = {
          0: s["effects.0"] ?? "",
          1: s["effects.1"] ?? "",
          2: s["effects.2"] ?? "",
          3: s["effects.3"] ?? "",
        };
        const hasSeedData =
          importedSeeds ||
          s.rangeStart !== 0 ||
          s.rangeEnd !== 3 ||
          Object.values(effects).some((v) => v !== "");
        const seeds: typeof s.magiseeds =
          importedSeeds ??
          (hasSeedData
            ? [
                {
                  key: s.name?.trim() || "magiseed_custom",
                  customName: "",
                  description: s.description ?? "",
                  rangeStart: s.rangeStart ?? 0,
                  rangeEnd: s.rangeEnd ?? 3,
                  effects,
                },
              ]
            : []);
        return {
          ...base,
          spellType: "magiseed" as const,
          description: undefined,
          growthClock: 0,
          gardenDescription: s.gardenDescription ?? "",
          currentMagiseed: null,
          magiseeds: seeds,
        };
      }

      if (spellType === "pilot-vehicle") {
        return {
          ...base,
          spellType: "pilot-vehicle" as const,
          vehicles: [],
        };
      }

      if (spellType === "tinkerer-magitech") {
        return {
          ...base,
          spellType: "tinkerer-magitech" as const,
          spellName: s.spellName?.trim() || "",
          rank: typeof s.rank === "number" ? s.rank : 1,
          magispheres: [],
        };
      }

      if (spellType === "gamble") {
        const gambleNested = s as unknown as {
          cost?: { amount?: number; perTarget?: boolean };
          accuracy?: { attr2?: string };
        };
        const gambleCost = gambleNested.cost ?? {};
        const gambleAccuracy = gambleNested.accuracy ?? {};
        return {
          ...base,
          spellType: "gamble" as const,
          spellName: s.name.trim() || "New Gamble",
          cost: {
            resource: "mp" as const,
            amount: gambleCost.amount ?? 0,
            perTarget: gambleCost.perTarget ?? true,
          },
          maxTargets: s.maxTargets ?? 2,
          targetDescription: s.targetDescription.trim() || "Special",
          duration: s.duration.trim() || "Instantaneous",
          attr: gambleAccuracy.attr2 || "will",
          targets: [],
        };
      }

      if (spellType === "deck") {
        return {
          ...base,
          spellType: "deck" as const,
          spellName: s.name.trim() || "Ace of Cards Deck",
          suitConfiguration: {
            Air: "air",
            Earth: "earth",
            Fire: "fire",
            Ice: "ice",
          },
          cardsInDeck: 30,
          hand: [],
          discardPile: [],
        };
      }

      return null;
    },
  },
  item: {
    key: "item",
    label: labelByKey.item,
    implementation: "schema-config",
    addItemType: "item",
    exportDataType: "items",
    schema: ItemSchema,
    fields: itemFieldConfig,
    defaultState: () => createDefaultStateFromFields(itemFieldConfig),
    buildPayload: createSchemaPayloadBuilder(ItemSchema),
  },
  consumable: {
    key: "consumable",
    label: labelByKey.consumable,
    implementation: "schema-config",
    addItemType: "consumable",
    exportDataType: "consumables",
    schema: ConsumableSchema,
    fields: consumableFieldConfig,
    defaultState: () => createDefaultStateFromFields(consumableFieldConfig),
    buildPayload: createSchemaPayloadBuilder(ConsumableSchema),
  },
  note: {
    key: "note",
    label: labelByKey.note,
    implementation: "schema-config",
    addItemType: "note",
    exportDataType: "notes",
    schema: NoteSchema,
    fields: noteFieldConfig,
    defaultState: () => createDefaultStateFromFields(noteFieldConfig),
    buildPayload: createSchemaPayloadBuilder(NoteSchema),
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
  item: "items",
  consumable: "consumables",
  note: "notes",
  effect: "effects",
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
