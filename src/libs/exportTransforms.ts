import { applyPostLoadTransforms, applyPreSaveTransforms } from "../libs/actor";
import { TypePlayer } from "../types/Players";
import {
  applyNpcPostLoadTransforms,
  applyNpcPreSaveTransforms,
} from "../libs/actor";
import { TypeNpc } from "../types/Npcs";
import { calcHP, calcMP } from "./npcs";
import {
  normalizeCustomWeaponLike,
  normalizeWeaponLike,
} from "./weaponNormalization";

export function canonicalizeForTransfer(
  dataType: string,
  data: unknown,
): unknown {
  try {
    if (!data || typeof data !== "object") return data;
    const asObj = data as Record<string, unknown>;
    if (dataType === "pc") {
      return applyPreSaveTransforms(
        applyPostLoadTransforms(asObj as unknown as TypePlayer),
      );
    }
    if (dataType === "npc") {
      return applyNpcPreSaveTransforms(
        applyNpcPostLoadTransforms(asObj as unknown as TypeNpc),
      );
    }
    if (dataType === "customWeapon") return normalizeCustomWeaponLike(asObj);
    if (dataType === "weapon") return normalizeWeaponLike(asObj);
    return asObj;
  } catch (error) {
    console.warn("canonicalizeForTransfer fallback:", error);
    return data;
  }
}

/**
 * Canonicalize for a JSON/text export.
 */
export function canonicalizeForExport(
  dataType: string,
  data: unknown,
): unknown {
  const canonical = canonicalizeForTransfer(dataType, data);
  if (dataType !== "npc" || !canonical || typeof canonical !== "object") {
    return canonical;
  }
  const npc = canonical as TypeNpc;
  const resources = npc.resources;
  if (!resources) return canonical;
  return {
    ...npc,
    resources: {
      ...resources,
      hp: { ...resources.hp, max: calcHP(npc) },
      mp: { ...resources.mp, max: calcMP(npc) },
    },
  };
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function stripUndefinedDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripUndefinedDeep);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue;
      out[k] = stripUndefinedDeep(v);
    }
    return out;
  }
  return value;
}

export function normalizeOwnershipForTarget(
  data: Record<string, unknown>,
  target: "local" | "cloud",
  cloudUid?: string,
): Record<string, unknown> {
  const next = asObject(stripUndefinedDeep({ ...(data ?? {}) }));
  delete next.id;
  if (target === "local") {
    return { ...next, uid: "local-user", published: false };
  }
  if (!cloudUid) {
    throw new Error("Missing cloud uid for cloud transfer");
  }
  return { ...next, uid: cloudUid, published: false };
}
