import classList from "./classes";

export const MNEMOSPHERE_LEVELS = [0, 1, 2, 3, 4, 5];

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const mnemosphereClassList = classList.map((classDef) => ({
  name: classDef.name,
  book: classDef.book,
}));

export function getMnemosphereCost(lvl = 1) {
  return 500 + Number(lvl) * 300;
}

export function getMnemosphereClassDefinition(className) {
  return classList.find((classDef) => classDef.name === className);
}

export function buildMnemosphereFromDef(classDef, lvl = 1) {
  const className = classDef?.name ?? "";
  const parsedLvl = Number(lvl);
  const numericLvl = Number.isFinite(parsedLvl)
    ? Math.max(0, Math.min(5, parsedLvl))
    : 1;

  return {
    name: `${className} Mnemosphere`,
    class: className,
    lvl: numericLvl,
    skills: (classDef?.skills ?? []).map((skill) => ({
      name: skill.skillName,
      description: skill.description,
      specialSkill: skill.specialSkill || undefined,
      maxLvl: skill.maxLvl,
      currentLvl: 0,
    })),
    heroic:
      numericLvl >= 5
        ? (classDef?.heroic ?? []).map((heroic) => ({
            name: heroic.name ?? heroic.skillName ?? "",
            description: heroic.description,
            specialSkill: heroic.specialSkill || undefined,
          }))
        : [],
    spells: [],
  };
}

export function buildMnemosphere(className, lvl = 1) {
  return buildMnemosphereFromDef(getMnemosphereClassDefinition(className), lvl);
}

export function createMnemosphere(className, lvl = 1) {
  return {
    id: genId(),
    _packItemId: `builtin:${slugify(className)}`,
    ...buildMnemosphere(className, lvl),
  };
}

export function createMnemosphereFromDef(classDef, lvl = 1) {
  const _packItemId = classDef?.name
    ? `builtin:${slugify(classDef.name)}`
    : undefined;
  return {
    id: genId(),
    _packItemId,
    ...buildMnemosphereFromDef(classDef, lvl),
  };
}

export const mnemospheres = mnemosphereClassList.map((classDef) =>
  buildMnemosphere(classDef.name, 1),
);

export default mnemosphereClassList;
