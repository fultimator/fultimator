import { TypeNpc } from '../../types/Npcs';

// ─── Types ────────────────────────────────────────────────────────────────────

type NpcTransform = (npc: TypeNpc) => TypeNpc;

// ─── Pre-save transforms ──────────────────────────────────────────────────────

const PRE_SAVE_TRANSFORMS: NpcTransform[] = [
  // No transforms yet - placeholder for future cleanup passes.
];

export function applyNpcPreSaveTransforms(npc: TypeNpc): TypeNpc {
  return PRE_SAVE_TRANSFORMS.reduce((n, fn) => fn(n), npc);
}

// ─── Post-load transforms ─────────────────────────────────────────────────────

const POST_LOAD_TRANSFORMS: NpcTransform[] = [
  // No transforms yet - placeholder for future schema migrations.
];

export function applyNpcPostLoadTransforms(npc: TypeNpc): TypeNpc {
  return POST_LOAD_TRANSFORMS.reduce((n, fn) => fn(n), npc);
}

// ─── Migration detection ──────────────────────────────────────────────────────

/**
 * Returns true if the NPC would be changed by applyNpcPostLoadTransforms.
 * Used by the gallery to detect actors that need a migration pass.
 */
export function npcNeedsMigration(npc: TypeNpc): boolean {
  // No migrations exist yet for NPCs - always false until a POST_LOAD_TRANSFORMS
  // entry is added that actually changes the shape.
  if (POST_LOAD_TRANSFORMS.length === 0) return false;
  const transformed = applyNpcPostLoadTransforms(npc);
  // Shallow structural check: if any top-level key differs, migration is needed.
  return JSON.stringify(transformed) !== JSON.stringify(npc);
}
