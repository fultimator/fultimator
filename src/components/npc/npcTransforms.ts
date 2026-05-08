import { TypeNpc } from "../../types/Npcs";

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

const POST_LOAD_TRANSFORMS: VersionedTransform[] = [
  // No migrations yet - placeholder for future schema migrations.
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
