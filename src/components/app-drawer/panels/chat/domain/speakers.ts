import { useMemo } from "react";
import { useLocation } from "react-router";
import { useDatabase } from "../../../../../hooks/useDatabase";
import { useCombatEncounterStore } from "../../../../../stores/combatEncounterStore";
import { applyPostLoadTransforms } from "../../../../../libs/actor/playerTransforms";
import {
  resolveEffectiveSlot,
  getActiveVehicle,
} from "../../../../../libs/player/slots/equipmentSlots";
import {
  getAvailableSupportModules,
  getPilotSpellInfo,
  getSlotLocks,
} from "../../../../../libs/player/slots/loadoutSelectors";
import type { TypePlayer } from "../../../../../types/Players";
import { DEFAULT_SPEAKER } from "../constants";
import type { Attribute } from "../types";

export type AttackOption = {
  arg: string; // quoted-if-needed string to pass as command arg
  name: string; // display label
  slot?: "(Main)" | "(Off)" | "(Both)";
  attr1?: Attribute;
  attr2?: Attribute;
  baseDamage?: number; // weapon base damage added to HR
  accuracyBonus?: number; // flat accuracy modifier (weapon prec field)
  accuracyDefense?: "def" | "mdef" | string;
  damageType?: string;
  damageHrZero?: boolean;
  hands?: 1 | 2;
  category?: string;
  range?: "melee" | "ranged" | string;
  isWeaponModule?: boolean;
  description?: string;
};

export type SpellOption = {
  arg: string;
  name: string;
  description?: string;
  effect?: string;
  spellType?: string;
  isOffensive?: boolean;
  attr1?: Attribute;
  attr2?: Attribute;
  baseDamage?: number;
  accuracyBonus?: number;
  accuracyDefense?: "def" | "mdef" | string;
  damageType?: string;
  damageHrZero?: boolean;
  extraTags?: string[];
};

function quoteArg(name: string): string {
  return name.includes(" ") ? `"${name}"` : name;
}

// Normalizes both long-form (Equipment.Weapon: "dexterity") and short-form ("dex") to Attribute
const LONG_TO_ATTR: Record<string, Attribute> = {
  might: "mig",
  mig: "mig",
  dexterity: "dex",
  dex: "dex",
  insight: "ins",
  ins: "ins",
  will: "wlp",
  willpower: "wlp",
  wlp: "wlp",
};

function toAttr(raw: unknown): Attribute | undefined {
  if (typeof raw !== "string") return undefined;
  return LONG_TO_ATTR[raw.toLowerCase()] ?? undefined;
}

function toNumber(raw: unknown): number | undefined {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function toRange(raw: unknown): "melee" | "ranged" {
  if (typeof raw !== "string") return "melee";
  const normalized = raw.toLowerCase();
  return normalized === "ranged" || normalized === "weapon_range_ranged"
    ? "ranged"
    : "melee";
}

export function resolveSpellOptions(
  doc: Record<string, unknown> | null,
): SpellOption[] {
  if (!doc) return [];

  const results: SpellOption[] = [];
  const pushSpell = (spell: Record<string, unknown>) => {
    const name = typeof spell.name === "string" ? spell.name : "";
    if (!name) return;
    const isOffensive =
      spell.isOffensive === true || spell.type === "offensive";
    const acc = spell.accuracy as Record<string, unknown> | undefined;
    const dmg = spell.damage as Record<string, unknown> | undefined;
    const spellType =
      typeof spell.spellType === "string" ? spell.spellType : undefined;
    results.push({
      arg: quoteArg(spellType ? `${name} ${spellType}` : name),
      name,
      description:
        typeof spell.description === "string"
          ? spell.description
          : typeof spell.effect === "string"
            ? spell.effect
            : undefined,
      effect: typeof spell.effect === "string" ? spell.effect : undefined,
      spellType,
      isOffensive,
      attr1: toAttr(acc?.attr1),
      attr2: toAttr(acc?.attr2),
      baseDamage: toNumber(dmg?.value) ?? 0,
      accuracyBonus:
        (toNumber(acc?.value) ?? 0) !== 0 ? toNumber(acc?.value) : undefined,
      accuracyDefense: typeof acc?.defense === "string" ? acc.defense : "mdef",
      damageType: typeof dmg?.type === "string" ? dmg.type : "physical",
      damageHrZero: dmg?.hrZero === true,
    });
  };

  if (Array.isArray(doc.spells)) {
    for (const s of doc.spells) {
      if (s && typeof s === "object") pushSpell(s as Record<string, unknown>);
    }
  }
  if (Array.isArray(doc.classes)) {
    for (const cls of doc.classes) {
      if (!cls || typeof cls !== "object") continue;
      const spells = (cls as Record<string, unknown>).spells;
      if (!Array.isArray(spells)) continue;
      for (const s of spells) {
        if (s && typeof s === "object") pushSpell(s as Record<string, unknown>);
      }
    }
  }
  const equipment =
    Array.isArray(doc.equipment) && doc.equipment.length > 0
      ? (doc.equipment[0] as Record<string, unknown>)
      : null;
  if (equipment && Array.isArray(equipment.mnemospheres)) {
    for (const mnemo of equipment.mnemospheres) {
      if (!mnemo || typeof mnemo !== "object") continue;
      const spells = (mnemo as Record<string, unknown>).spells;
      if (!Array.isArray(spells)) continue;
      for (const s of spells) {
        if (s && typeof s === "object") pushSpell(s as Record<string, unknown>);
      }
    }
  }

  const deduped = new Map<string, SpellOption>();
  for (const s of results) {
    const key = `${s.name}:${s.spellType ?? ""}`;
    deduped.set(key, s);
  }
  return [...deduped.values()];
}

function extractPcWeaponStats(
  item: Record<string, unknown> | undefined,
  source: string,
): Pick<
  AttackOption,
  | "attr1"
  | "attr2"
  | "baseDamage"
  | "accuracyBonus"
  | "accuracyDefense"
  | "damageType"
  | "damageHrZero"
  | "hands"
  | "category"
  | "range"
> {
  if (!item) return {};
  const acc = item.accuracy as Record<string, unknown> | undefined;
  const normalizedRange = toRange(item.range);
  const category =
    typeof item.category === "string" ? item.category : undefined;
  const hands = item.hands === 2 ? 2 : item.hands === 1 ? 1 : undefined;
  if (source === "customWeapons") {
    const dmg = item.damage as Record<string, unknown> | undefined;
    return {
      attr1: toAttr(acc?.attr1),
      attr2: toAttr(acc?.attr2),
      baseDamage: typeof dmg?.value === "number" ? dmg.value : undefined,
      accuracyBonus:
        typeof acc?.value === "number" && acc.value !== 0
          ? acc.value
          : undefined,
      accuracyDefense:
        typeof acc?.defense === "string" ? acc.defense : undefined,
      damageType: typeof dmg?.type === "string" ? dmg.type : undefined,
      damageHrZero: dmg?.hrZero === true,
      hands,
      category,
      range: normalizedRange,
    };
  }
  // standard Weapons
  const dmg = item.damage as Record<string, unknown> | undefined;
  const baseDamage = typeof dmg?.value === "number" ? dmg.value : undefined;
  return {
    attr1: toAttr(acc?.attr1),
    attr2: toAttr(acc?.attr2),
    baseDamage,
    accuracyBonus:
      typeof acc?.value === "number" && acc.value !== 0 ? acc.value : undefined,
    accuracyDefense: typeof acc?.defense === "string" ? acc.defense : undefined,
    damageType: typeof dmg?.type === "string" ? dmg.type : undefined,
    damageHrZero: dmg?.hrZero === true,
    hands,
    category,
    range: normalizedRange,
  };
}

export function resolveAttackOptions(
  doc: Record<string, unknown> | null,
): AttackOption[] {
  if (!doc) return [];

  // NPC: has attacks / weaponattacks arrays
  const attacks = doc.attacks;
  const weaponattacks = doc.weaponattacks;
  if (Array.isArray(attacks) || Array.isArray(weaponattacks)) {
    const results: AttackOption[] = [];
    if (Array.isArray(attacks)) {
      for (const a of attacks) {
        if (a && typeof a.name === "string" && a.name) {
          const acc = a.accuracy as Record<string, unknown> | undefined;
          const dmg = a.damage as Record<string, unknown> | undefined;
          results.push({
            arg: quoteArg(a.name),
            name: a.name,
            attr1: toAttr(acc?.attr1),
            attr2: toAttr(acc?.attr2),
            damageType: typeof dmg?.type === "string" ? dmg.type : undefined,
            damageHrZero: dmg?.hrZero === true,
            range: toRange(a.range),
          });
        }
      }
    }
    if (Array.isArray(weaponattacks)) {
      for (const wa of weaponattacks) {
        const name =
          wa && typeof wa.name === "string" && wa.name ? wa.name : undefined;
        if (typeof name === "string" && name) {
          const acc = wa.accuracy as Record<string, unknown> | undefined;
          const dmg = wa.damage as Record<string, unknown> | undefined;
          results.push({
            arg: quoteArg(name),
            name,
            attr1: toAttr(acc?.attr1),
            attr2: toAttr(acc?.attr2),
            baseDamage: typeof dmg?.value === "number" ? dmg.value : undefined,
            accuracyBonus:
              typeof acc?.value === "number" && acc.value !== 0
                ? acc.value
                : undefined,
            accuracyDefense:
              typeof acc?.defense === "string" ? acc.defense : undefined,
            damageType: typeof dmg?.type === "string" ? dmg.type : undefined,
            damageHrZero: dmg?.hrZero === true,
            hands: wa.hands === 2 ? 2 : wa.hands === 1 ? 1 : undefined,
            category: typeof wa.category === "string" ? wa.category : undefined,
            range: toRange(wa.range),
          });
        }
      }
    }
    return results;
  }

  const classes = Array.isArray(doc.classes) ? doc.classes : [];
  const vehicleWeapons: AttackOption[] = [];

  for (const cls of classes) {
    if (!cls || typeof cls !== "object") continue;
    const spells = (cls as Record<string, unknown>).spells;
    if (!Array.isArray(spells)) continue;
    for (const spell of spells) {
      if (
        spell &&
        typeof spell === "object" &&
        (spell as Record<string, unknown>).spellType === "pilot-vehicle"
      ) {
        const vehicles =
          (spell as Record<string, unknown>).vehicles ??
          (spell as Record<string, unknown>).currentVehicles;
        if (Array.isArray(vehicles)) {
          const activeVehicle = vehicles.find(
            (v: unknown) =>
              v &&
              typeof v === "object" &&
              (v as Record<string, unknown>).enabled === true,
          ) as Record<string, unknown> | undefined;

          if (
            activeVehicle &&
            typeof activeVehicle === "object" &&
            Array.isArray((activeVehicle as Record<string, unknown>).modules)
          ) {
            const vehicleModules = (activeVehicle as Record<string, unknown>)
              .modules as Record<string, unknown>[];
            const vehicleSlotsObj =
              ((activeVehicle as Record<string, unknown>).slots as
                | Record<string, unknown>
                | undefined) ?? {};

            const weaponsBySlot: Record<string, Record<string, unknown>> = {};
            for (const slot of ["main", "off"] as const) {
              const key = vehicleSlotsObj[slot] as string | undefined;
              if (!key) continue;
              const mod = vehicleModules.find(
                (m) =>
                  ((m.key as string | undefined) ?? m.name) === key &&
                  m.type === "pilot_module_weapon",
              );
              if (mod && !weaponsBySlot[slot]) {
                weaponsBySlot[slot] = mod;
              }
            }
            // Handle "both" (cumbersome): same key in main and off
            if (
              vehicleSlotsObj.main &&
              vehicleSlotsObj.main === vehicleSlotsObj.off &&
              weaponsBySlot["main"]
            ) {
              weaponsBySlot["both"] = weaponsBySlot["main"];
              delete weaponsBySlot["main"];
              delete weaponsBySlot["off"];
            }

            if (Object.keys(weaponsBySlot).length > 0) {
              const humanizeModuleName = (internalName: string): string => {
                return internalName
                  .replace(/^pilot_module_/, "")
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");
              };

              const seen = new Set<string>();
              const resolveVehicleWeapon = (
                slotName: "main" | "off" | "both",
                label: "(Main)" | "(Off)" | "(Both)",
              ) => {
                const module = weaponsBySlot[slotName];
                if (!module) return;

                let name = "";
                if (
                  module.customName &&
                  typeof module.customName === "string" &&
                  module.customName.trim()
                ) {
                  name = module.customName;
                } else if (module.name && typeof module.name === "string") {
                  name = humanizeModuleName(module.name);
                }
                if (!name) return;

                const byNameIdx = vehicleWeapons.findIndex(
                  (r) => r.name === name,
                );
                if (byNameIdx >= 0) {
                  const existing = vehicleWeapons[byNameIdx];
                  if (
                    existing.slot === "(Both)" ||
                    label === "(Both)" ||
                    (existing.slot === "(Main)" && label === "(Off)") ||
                    (existing.slot === "(Off)" && label === "(Main)")
                  ) {
                    vehicleWeapons[byNameIdx] = {
                      ...existing,
                      slot: "(Both)",
                    };
                  }
                  return;
                }

                const key = `${slotName}:${name}`;
                if (seen.has(key)) return;
                seen.add(key);

                const dmg = module.damage as
                  | { value?: number; type?: string; hrZero?: boolean }
                  | undefined;
                const acc = module.accuracy as
                  | {
                      attr1?: string;
                      attr2?: string;
                      value?: number;
                      defense?: string;
                    }
                  | undefined;
                const prec = acc?.value;
                vehicleWeapons.push({
                  arg: quoteArg(name),
                  name,
                  slot: label,
                  attr1: toAttr(acc?.attr1),
                  attr2: toAttr(acc?.attr2),
                  baseDamage:
                    typeof dmg?.value === "number" ? dmg.value : undefined,
                  accuracyBonus:
                    typeof prec === "number" && prec !== 0 ? prec : undefined,
                  accuracyDefense: acc?.defense === "mdef" ? "mdef" : "def",
                  damageType:
                    typeof dmg?.type === "string" ? dmg.type : "physical",
                  damageHrZero: module.hrZero === true,
                  hands: module.cumbersome ? 2 : 1,
                  category:
                    typeof module.category === "string"
                      ? module.category
                      : undefined,
                  isWeaponModule: true,
                  range: toRange(module.range),
                });
              };

              if (weaponsBySlot["both"]) {
                resolveVehicleWeapon("both", "(Both)");
              } else {
                if (weaponsBySlot["main"]) {
                  resolveVehicleWeapon("main", "(Main)");
                }
                if (weaponsBySlot["off"]) {
                  resolveVehicleWeapon("off", "(Off)");
                }
              }
            }
          }
        }
        break;
      }
    }
    if (vehicleWeapons.length > 0) break;
  }

  if (vehicleWeapons.length > 0) {
    return vehicleWeapons;
  }

  // PC: read equippedSlots + equipment
  const equippedSlots =
    doc.equippedSlots && typeof doc.equippedSlots === "object"
      ? (doc.equippedSlots as Record<string, unknown>)
      : null;
  const equipment =
    Array.isArray(doc.equipment) && doc.equipment.length > 0
      ? (doc.equipment[0] as Record<string, unknown>)
      : null;

  if (!equippedSlots || !equipment) return [];

  const results: AttackOption[] = [];
  const seen = new Set<string>();

  const resolveSlotItem = (
    slotKey: "mainHand" | "offHand",
    label: "(Main)" | "(Off)",
  ) => {
    const slotRef = equippedSlots[slotKey];
    if (!slotRef || typeof slotRef !== "object") return;
    const ref = slotRef as Record<string, unknown>;
    const source = ref.source as string | undefined;
    const itemName = ref.name as string | undefined;
    if (!source || !itemName) return;

    const collection = equipment[source];
    if (!Array.isArray(collection)) return;

    // Prefer name lookup (index can become stale after edits/reordering);
    // fall back to index when needed.
    const idx = typeof ref.index === "number" ? ref.index : -1;
    const item: Record<string, unknown> | undefined =
      collection.find(
        (i: unknown) =>
          i &&
          typeof i === "object" &&
          (i as Record<string, unknown>).name === itemName,
      ) ??
      (idx >= 0 && idx < collection.length
        ? (collection[idx] as Record<string, unknown>)
        : undefined);

    const name = (item?.name as string | undefined) ?? itemName;
    const twoHanded = item?.hands === 2;
    const effectiveLabel: "(Main)" | "(Off)" | "(Both)" = twoHanded
      ? "(Both)"
      : label;
    const byNameIdx = results.findIndex((r) => r.name === name);
    if (byNameIdx >= 0) {
      const existing = results[byNameIdx];
      if (
        existing.slot === "(Both)" ||
        effectiveLabel === "(Both)" ||
        (existing.slot === "(Main)" && effectiveLabel === "(Off)") ||
        (existing.slot === "(Off)" && effectiveLabel === "(Main)")
      ) {
        results[byNameIdx] = { ...existing, slot: "(Both)" };
      }
      return;
    }
    const key = `${slotKey}:${name}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push({
      arg: quoteArg(name),
      name,
      slot: effectiveLabel,
      ...extractPcWeaponStats(item, source),
    });
  };

  resolveSlotItem("mainHand", "(Main)");
  resolveSlotItem("offHand", "(Off)");

  // Fallback: if no equippedSlots data, list all weapons/customWeapons
  if (results.length === 0) {
    const weapons = Array.isArray(equipment.weapons) ? equipment.weapons : [];
    const customWeapons = Array.isArray(equipment.customWeapons)
      ? equipment.customWeapons
      : [];
    for (const w of weapons) {
      if (w && typeof w.name === "string" && w.name) {
        results.push({
          arg: quoteArg(w.name),
          name: w.name,
          ...extractPcWeaponStats(w, "weapons"),
        });
      }
    }
    for (const w of customWeapons) {
      if (w && typeof w.name === "string" && w.name) {
        results.push({
          arg: quoteArg(w.name),
          name: w.name,
          ...extractPcWeaponStats(w, "customWeapons"),
        });
      }
    }
  }

  return results;
}

const ATTRIBUTE_KEY: Record<Attribute, string> = {
  mig: "might",
  ins: "insight",
  wlp: "will",
  dex: "dexterity",
};

export const resolveAttributeDie = (
  playerDoc: Record<string, unknown> | null,
  attribute: Attribute,
): number => {
  const attrs =
    playerDoc &&
    typeof playerDoc.attributes === "object" &&
    playerDoc.attributes
      ? (playerDoc.attributes as Record<string, unknown>)
      : null;
  const raw = attrs?.[ATTRIBUTE_KEY[attribute]];
  const val =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>).base
      : raw;
  return typeof val === "number" && val > 0 ? val : 8;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const resolveSpeakerOptions = (contextActorName: string): string[] => [
  DEFAULT_SPEAKER,
  ...(contextActorName ? [contextActorName] : []),
];

type ActorEntry = {
  name: string;
  doc: Record<string, unknown>;
  source: "pc" | "npc";
};

export const useCombatSimActors = (): ActorEntry[] => {
  const { selectedNPCs, selectedPCs } = useCombatEncounterStore();

  return useMemo(() => {
    const npcs = selectedNPCs.map((a) => ({ ...a, source: "npc" as const }));
    const pcs = selectedPCs.map((a) => ({ ...a, source: "pc" as const }));
    return [...npcs, ...pcs]
      .filter((a) => {
        const actor = a as Record<string, unknown>;
        return typeof actor.name === "string" && actor.name;
      })
      .map((a) => {
        const actor = a as Record<string, unknown>;
        return { name: actor.name as string, doc: actor, source: a.source };
      });
  }, [selectedNPCs, selectedPCs]);
};

export const useRouteActor = (): {
  playerDoc: Record<string, unknown> | null;
  npcDoc: Record<string, unknown> | null;
} => {
  const location = useLocation();
  const localDb = useDatabase("local");
  const cloudDb = useDatabase("cloud");

  const playerIdMatch = location.pathname.match(
    /^\/(?:player-edit|pc-gallery|character-sheet)\/([^/]+)$/,
  );
  const npcIdMatch = location.pathname.match(/^\/npc-gallery\/([^/]+)$/);
  const playerId = playerIdMatch?.[1] ?? "";
  const npcId = npcIdMatch?.[1] ?? "";
  const isLocalPlayer = UUID_RE.test(playerId);
  const isLocalNpc = UUID_RE.test(npcId);

  // Only open the one relevant listener, null skips the Firestore subscription entirely.
  const localPlayerRef = isLocalPlayer
    ? localDb.doc("player-personal", playerId)
    : null;
  const cloudPlayerRef =
    !isLocalPlayer && playerId
      ? cloudDb.doc("player-personal", playerId)
      : null;
  const localNpcRef = isLocalNpc ? localDb.doc("npc-personal", npcId) : null;
  const cloudNpcRef =
    !isLocalNpc && npcId ? cloudDb.doc("npc-personal", npcId) : null;

  const [localPlayerDoc] = localDb.useDocumentData(localPlayerRef) as [
    Record<string, unknown> | null,
    boolean,
    unknown,
  ];
  const [cloudPlayerDoc] = cloudDb.useDocumentData(cloudPlayerRef) as [
    Record<string, unknown> | null,
    boolean,
    unknown,
  ];
  const [localNpcDoc] = localDb.useDocumentData(localNpcRef) as [
    Record<string, unknown> | null,
    boolean,
    unknown,
  ];
  const [cloudNpcDoc] = cloudDb.useDocumentData(cloudNpcRef) as [
    Record<string, unknown> | null,
    boolean,
    unknown,
  ];

  const rawPlayerDoc = localPlayerDoc ?? cloudPlayerDoc ?? null;
  const playerDoc = useMemo(
    () =>
      rawPlayerDoc
        ? (applyPostLoadTransforms(
            rawPlayerDoc as unknown as TypePlayer,
          ) as unknown as Record<string, unknown>)
        : null,
    [rawPlayerDoc],
  );

  return {
    playerDoc,
    npcDoc: localNpcDoc ?? cloudNpcDoc ?? null,
  };
};

export const useActorName = (
  playerDoc: Record<string, unknown> | null,
  npcDoc: Record<string, unknown> | null,
): string => {
  return useMemo(() => {
    const playerInfo =
      playerDoc && typeof playerDoc.info === "object" && playerDoc.info
        ? (playerDoc.info as Record<string, unknown>)
        : null;
    return (
      (playerInfo?.name as string | undefined) ||
      (playerDoc?.name as string | undefined) ||
      (npcDoc?.name as string | undefined) ||
      ""
    );
  }, [playerDoc, npcDoc]);
};

export type EquipmentSlot = {
  slotKey: string;
  pickerSlot?: "mainHand" | "offHand" | "armor" | "accessory";
  actionType?: "toggleVehicle" | "swapVehicle" | "openSupportModules";
  section?: "slot" | "support" | "action";
  label: string;
  currentItem?: { name: string; stats: string };
  isLocked?: boolean;
  isVehicleSlot?: boolean;
};

export function resolveEquipmentSlots(
  doc: Record<string, unknown> | null,
): EquipmentSlot[] {
  if (!doc) return [];

  // NPCs use attacks[]/weaponattacks[] only
  if (Array.isArray(doc.attacks) || Array.isArray(doc.weaponattacks)) return [];

  const player = doc as unknown as TypePlayer;
  const { mainHandLocked, offHandLocked } = getSlotLocks(player);
  const slotConfig: Array<{
    key: "mainHand" | "offHand" | "armor" | "accessory";
    label: string;
    isLocked: boolean;
  }> = [
    { key: "mainHand", label: "Main Hand", isLocked: mainHandLocked },
    { key: "offHand", label: "Off Hand", isLocked: offHandLocked },
    { key: "armor", label: "Armor", isLocked: false },
    { key: "accessory", label: "Accessory", isLocked: false },
  ];
  const slots: EquipmentSlot[] = [
    ...slotConfig.map((slot) => {
      const resolved = resolveEffectiveSlot(player, slot.key);
      const isVehicleSlot = resolved?.kind === "vehicleModule";
      const itemName = (() => {
        if (!resolved) return undefined;
        if (resolved.kind === "vehicleModule") {
          return resolved.module.customName || resolved.module.name || " - ";
        }
        return resolved.item?.name || " - ";
      })();
      const statLine = (() => {
        if (!resolved) return "";
        if (resolved.kind === "vehicleModule") {
          const module = resolved.module;
          const parts: string[] = [];
          if (
            typeof module.accuracy?.value === "number" &&
            module.accuracy.value !== 0
          ) {
            parts.push(
              `${module.accuracy.value > 0 ? "+" : ""}${module.accuracy.value} Acc`,
            );
          }
          if (
            typeof module.damage?.value === "number" &&
            module.damage.value !== 0
          ) {
            parts.push(`${module.damage.value} DMG`);
          }
          if (
            typeof module.def === "number" ||
            typeof module.mdef === "number"
          ) {
            parts.push(`DEF +${module.def ?? 0} / MDEF +${module.mdef ?? 0}`);
          }
          return parts.join(" / ");
        }
        const item = resolved.item as unknown as Record<string, unknown>;
        const source = player.equippedSlots?.[slot.key]?.source;
        if (source === "weapons" || source === "customWeapons") {
          const dmg = (item.damage as Record<string, unknown> | undefined)
            ?.value;
          const acc = (item.accuracy as Record<string, unknown> | undefined)
            ?.value;
          const parts: string[] = [];
          if (typeof acc === "number" && acc !== 0) parts.push(`+${acc} Acc`);
          if (typeof dmg === "number" && dmg !== 0) parts.push(`${dmg} DMG`);
          const hands = item.hands === 2 ? "2H" : "1H";
          parts.push(hands);
          return parts.join(" / ");
        }
        if (source === "armor") {
          return `DEF +${item.def ?? 0} / MDEF +${item.mdef ?? 0}`;
        }
        if (source === "accessories") {
          return "Accessory";
        }
        return "";
      })();

      return {
        slotKey: slot.key,
        pickerSlot: slot.key,
        section: "slot" as const,
        label: slot.label,
        isLocked: slot.isLocked,
        isVehicleSlot,
        currentItem:
          itemName && !slot.isLocked
            ? {
                name: itemName,
                stats: statLine,
              }
            : undefined,
      };
    }),
  ];

  const pilotInfo = getPilotSpellInfo(player);
  const pilotVehicles = pilotInfo
    ? Array.isArray(pilotInfo.spell.currentVehicles)
      ? pilotInfo.spell.currentVehicles
      : Array.isArray(pilotInfo.spell.vehicles)
        ? pilotInfo.spell.vehicles
        : []
    : [];
  const vehicleActive = pilotVehicles.some(
    (vehicle) => vehicle && vehicle.enabled === true,
  );

  if (vehicleActive) {
    const supportModules = getAvailableSupportModules(player);
    const activeVehicleObj = getActiveVehicle(player);
    const supportKeys = new Set<string>(activeVehicleObj?.slots?.support ?? []);
    const activeSupportModules = supportModules.filter((module) =>
      supportKeys.has(module.key ?? module.name),
    );
    if (activeSupportModules.length > 0) {
      for (const [idx, module] of activeSupportModules.entries()) {
        slots.push({
          slotKey: `support-${module.originalIndex}-${idx}`,
          section: "support",
          actionType: "openSupportModules",
          label: "Support Modules",
          isVehicleSlot: true,
          currentItem: {
            name: module.customName || module.name || " - ",
            stats: module.isComplex ? "Complex" : "Support",
          },
        });
      }
    }

    if (supportModules.length > 0) {
      slots.push({
        slotKey: "support-modules-action",
        section: "action",
        actionType: "openSupportModules",
        label: "Support Modules",
        currentItem: undefined,
      });
    }
  }
  if (pilotInfo) {
    slots.push({
      slotKey: "vehicle-toggle",
      section: "action",
      actionType: "toggleVehicle",
      label: vehicleActive ? "Exit Vehicle" : "Enter Vehicle",
      currentItem: undefined,
    });
    if (pilotVehicles.length > 1) {
      slots.push({
        slotKey: "vehicle-swap",
        section: "action",
        actionType: "swapVehicle",
        label: "Swap Vehicle",
        currentItem: undefined,
      });
    }
  }

  return slots;
}
