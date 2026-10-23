import { npcSpells } from "../npcSpells";
import { backfillIds } from "../actor/itemIds";
import { STATUS_EFFECTS } from "./constants";

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

const isSpeciesSlot = (slot) =>
  typeof slot === "string" && slot.startsWith("species-");

export function hasSpeciesOptionPicks(npc) {
  const inSpeciesSlot = (s) => s._qaAdded && isSpeciesSlot(s._qaSlot);
  if ((npc.special ?? []).some(inSpeciesSlot)) return true;
  if ((npc.actions ?? []).some(inSpeciesSlot)) return true;
  return Object.keys(npc.qaSelections ?? {}).some(isSpeciesSlot);
}

export function clearSpeciesOptionPicks(npc, speciesStep) {
  const fixedStatuses = (speciesStep?.fixed ?? [])
    .filter((g) => g.kind === "statusImmunity")
    .flatMap((g) => g.options ?? []);
  const optionStatuses = new Set(
    (speciesStep?.options ?? [])
      .filter((g) => g.kind === "statusImmunity")
      .flatMap((g) => g.options ?? STATUS_EFFECTS)
      .filter((s) => !fixedStatuses.includes(s)),
  );
  const stripSpecies = (arr) =>
    (arr ?? []).filter((s) => !(s._qaAdded && isSpeciesSlot(s._qaSlot)));
  const immunities = { ...npc.immunities };
  for (const status of optionStatuses) delete immunities[status];
  const qaSelections = { ...npc.qaSelections };
  for (const key of Object.keys(qaSelections)) {
    if (isSpeciesSlot(key)) delete qaSelections[key];
  }
  return {
    ...npc,
    special: stripSpecies(npc.special),
    actions: stripSpecies(npc.actions),
    immunities,
    qaSelections,
  };
}

export function isSpeciesGrantApplied(grant, npc, opts = {}) {
  const need = opts.countOverride ?? grant?.count ?? 1;
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
      const exclude = opts.excludeStatuses ?? [];
      const options = (grant.options ?? STATUS_EFFECTS).filter(
        (s) => !exclude.includes(s),
      );
      return options.filter((s) => npc?.immunities?.[s]).length >= need;
    }
    case "hp":
      return (
        (npc?.resources?.hp?.bonus ?? npc?.extra?.hp ?? 0) >=
        (grant.amount ?? 10)
      );
    case "spell":
      return (grant.fuids ?? []).some((fuid) => npcHasSpell(npc, fuid));
    case "replaceAffinity": {
      const types = grant.type
        ? [grant.type]
        : Object.keys(npc?.affinities ?? {});
      return types.some((type) => npc?.affinities?.[type] === grant.to);
    }
    default:
      return false;
  }
}
