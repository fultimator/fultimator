import { getMnemosphereClassDefinition } from "../../../libs/mnemospheres";

export function getMnemosphereSkillDescription(item, skill) {
  if (skill.description) return skill.description;
  const classDef = getMnemosphereClassDefinition(item.class);
  return classDef?.skills?.find(
    (classSkill) => classSkill.skillName === skill.name,
  )?.description;
}

export function getMnemosphereHeroicDescription(item, heroicSkill) {
  if (heroicSkill.description) return heroicSkill.description;
  const classDef = getMnemosphereClassDefinition(item.class);
  return classDef?.heroic?.find(
    (classHeroic) =>
      (classHeroic.name ?? classHeroic.skillName) === heroicSkill.name,
  )?.description;
}

export function getSlottedMnemospheres(player) {
  const eq0 = player?.equipment?.[0] ?? {};
  const mnemospheres = eq0.mnemospheres ?? [];
  const slottedIds = new Set();

  for (const bank of [
    eq0.customWeapons,
    eq0.armor,
    eq0.weapons,
    eq0.shields,
    eq0.accessories,
  ]) {
    for (const item of bank ?? []) {
      for (const id of item.slotted ?? []) {
        slottedIds.add(id);
      }
    }
  }

  for (const id of eq0.mnemoReceptacle ?? []) {
    slottedIds.add(id);
  }

  return mnemospheres.filter((mnemo) => slottedIds.has(mnemo.id));
}
