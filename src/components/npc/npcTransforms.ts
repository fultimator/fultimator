import { TypeNpc } from "../../types/Npcs";
import { Affinities } from "../../types/Misc";

type NpcTransform = (npc: TypeNpc) => TypeNpc;

interface VersionedTransform {
  version: number;
  label: string;
  fn: NpcTransform;
}

// Pre-save transforms
const PRE_SAVE_TRANSFORMS: NpcTransform[] = [
  // No transforms yet - placeholder for future cleanup passes.
];

export function applyNpcPreSaveTransforms(npc: TypeNpc): TypeNpc {
  return PRE_SAVE_TRANSFORMS.reduce((n, fn) => fn(n), npc);
}

// Post-load transforms
// Each versioned transform brings the NPC up to its declared schema version.
// Add new transforms here as the schema evolves; order by ascending version.

function fixSheildTypo(npc: TypeNpc): TypeNpc {
  if (!("sheild" in npc)) return npc;
  const { sheild, ...rest } = npc as TypeNpc & { sheild?: TypeNpc["sheild"] };
  return sheild !== undefined ? { ...rest, shield: sheild } : rest;
}

function addMissingFireAffinity(npc: TypeNpc): TypeNpc {
  if (npc.affinities?.fire !== undefined) return npc;
  return {
    ...npc,
    affinities: { ...npc.affinities, fire: Affinities.None },
  };
}

function normalizeArmorAndShieldFields(npc: TypeNpc): TypeNpc {
  const normalizeArmor = (armor: TypeNpc["armor"]) => {
    if (!armor) return armor;
    const result = { ...armor };
    if ("martial" in result && result.isMartial === undefined) {
      result.isMartial = result.martial;
    }
    delete result.martial;
    if ("cost" in result && result.value === undefined) {
      result.value = result.cost;
    }
    delete result.cost;
    if (result.quality === undefined) {
      result.quality = "";
    }
    return result;
  };
  return {
    ...npc,
    armor: normalizeArmor(npc.armor),
    shield: normalizeArmor(npc.shield),
  };
}

const POST_LOAD_TRANSFORMS: VersionedTransform[] = [
  {
    version: 1,
    label: "Fix sheild typo",
    fn: fixSheildTypo,
  },
  {
    version: 2,
    label: "Add missing fire affinity",
    fn: addMissingFireAffinity,
  },
  {
    version: 3,
    label:
      "Normalize armor and shield fields (martial to isMartial, cost to value, add quality default)",
    fn: normalizeArmorAndShieldFields,
  },
];

export const NPC_CURRENT_SCHEMA_VERSION =
  POST_LOAD_TRANSFORMS.length > 0
    ? POST_LOAD_TRANSFORMS[POST_LOAD_TRANSFORMS.length - 1].version
    : 0;

export function applyNpcPostLoadTransforms(npc: TypeNpc): TypeNpc {
  let result = POST_LOAD_TRANSFORMS.reduce((n, t) => {
    if (n.schemaVersion !== undefined && n.schemaVersion >= t.version) return n;
    return { ...t.fn(n), schemaVersion: t.version };
  }, npc);
  if ((result.schemaVersion ?? 0) < NPC_CURRENT_SCHEMA_VERSION) {
    result = { ...result, schemaVersion: NPC_CURRENT_SCHEMA_VERSION };
  }
  return result;
}

// Migration detection

/** Returns the labels of transforms that would be applied to this NPC. */
export function getPendingNpcMigrations(npc: TypeNpc): string[] {
  const current = npc.schemaVersion ?? 0;
  return POST_LOAD_TRANSFORMS.filter((t) => t.version > current).map(
    (t) => t.label,
  );
}

/** Returns true if the NPC would be changed by applyNpcPostLoadTransforms. */
export function npcNeedsMigration(npc: TypeNpc): boolean {
  return (npc.schemaVersion ?? 0) < NPC_CURRENT_SCHEMA_VERSION;
}
