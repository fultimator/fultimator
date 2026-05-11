import { useMemo } from "react";
import { useLocation } from "react-router";
import { useDatabase } from "../../../../../hooks/useDatabase";
import { useCombatEncounterStore } from "../../../../../stores/combatEncounterStore";
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
  hands?: 1 | 2;
  category?: string;
  range?: "melee" | "ranged" | string;
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
  | "hands"
  | "category"
  | "range"
> {
  if (!item) return {};
  const acc = item.accuracy as Record<string, unknown> | undefined;
  const normalizedRange =
    item.range === "ranged" || item.range === "weapon_range_ranged"
      ? "ranged"
      : "melee";
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
            hands: wa.hands === 2 ? 2 : wa.hands === 1 ? 1 : undefined,
            category: typeof wa.category === "string" ? wa.category : undefined,
            range:
              wa.range === "ranged" || wa.range === "weapon_range_ranged"
                ? "ranged"
                : "melee",
          });
        }
      }
    }
    return results;
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
  const val = attrs?.[ATTRIBUTE_KEY[attribute]];
  return typeof val === "number" && val > 0 ? val : 8;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const resolveSpeakerOptions = (contextActorName: string): string[] => [
  DEFAULT_SPEAKER,
  ...(contextActorName ? [contextActorName] : []),
];

type ActorEntry = { name: string; doc: Record<string, unknown> };

export const useCombatSimActors = (): ActorEntry[] => {
  const { selectedNPCs, selectedPCs } = useCombatEncounterStore();

  return useMemo(() => {
    return [...selectedNPCs, ...selectedPCs]
      .filter((a) => typeof a.name === "string" && a.name)
      .map((a) => ({ name: a.name as string, doc: a }));
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
    /^\/(?:player-edit|pc-gallery)\/([^/]+)$/,
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

  return {
    playerDoc: localPlayerDoc ?? cloudPlayerDoc ?? null,
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
