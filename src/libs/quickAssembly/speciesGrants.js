import { npcSpells } from "../npcSpells";
import { backfillIds } from "../actor/itemIds";

export function findOfficialSpell(fuid) {
  return npcSpells.find((s) => s.fuid === fuid) ?? null;
}

export function resolveSpellOptions(fuids = []) {
  return fuids
    .map((fuid) => findOfficialSpell(fuid))
    .filter(Boolean)
    .map((s) => ({ fuid: s.fuid, name: s.name }));
}

export function npcHasSpell(npc, fuid) {
  return (npc?.spells ?? []).some((s) => s.fuid === fuid);
}

export function addOfficialSpell(npc, fuid) {
  if (npcHasSpell(npc, fuid)) return npc;
  const spell = findOfficialSpell(fuid);
  if (!spell) return npc;
  const spells = backfillIds([
    ...(npc.spells ?? []),
    { ...spell, _qaAdded: true },
  ]);
  return { ...npc, spells };
}

export function removeSpell(npc, fuid) {
  if (!npcHasSpell(npc, fuid)) return npc;
  return { ...npc, spells: (npc.spells ?? []).filter((s) => s.fuid !== fuid) };
}

const ALL_STATUSES = ["slow", "dazed", "weak", "shaken", "enraged", "poisoned"];

export function isSpeciesGrantApplied(grant, npc) {
  const need = grant?.count ?? 1;
  switch (grant?.kind) {
    case "affinity": {
      if (grant.type) return npc?.affinities?.[grant.type] === grant.value;
      const restrictNonPhysical = grant.note === "other than physical";
      const types = grant.options ?? Object.keys(npc?.affinities ?? {});
      const picked = types.filter(
        (type) =>
          npc?.affinities?.[type] === grant.value &&
          !(restrictNonPhysical && type === "physical"),
      ).length;
      return picked >= need;
    }
    case "statusImmunity": {
      const options = grant.options ?? ALL_STATUSES;
      return options.filter((s) => npc?.immunities?.[s]).length >= need;
    }
    case "hp":
      return (
        (npc?.resources?.hp?.bonus ?? npc?.extra?.hp ?? 0) >=
        (grant.amount ?? 10)
      );
    case "spell":
      return (grant.fuids ?? []).some((fuid) => npcHasSpell(npc, fuid));
    default:
      return false;
  }
}
