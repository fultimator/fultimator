const BASE_URL = (
  typeof import.meta !== "undefined" && import.meta.env?.BASE_URL
    ? import.meta.env.BASE_URL
    : "/"
).replace(/\/$/, "");

export const ACTION_ICON_BASE = `${BASE_URL}/assets/icons/actions`;

export const BASE_ACTION_ICON_KEYS = [
  "attack",
  "equipment",
  "guard",
  "hinder",
  "inventory",
  "objective",
  "spell",
  "skill",
  "study",
] as const;

export type BaseActionIconKey = (typeof BASE_ACTION_ICON_KEYS)[number];

export function getActionIconKey(rawType?: string): BaseActionIconKey | null {
  if (!rawType) return null;
  const normalized = String(rawType)
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "");

  switch (normalized) {
    case "attack":
    case "attacks":
      return "attack";

    case "equipment":
    case "weapon":
    case "weapons":
    case "armor":
    case "armors":
    case "shield":
    case "shields":
    case "accessory":
    case "accessories":
    case "loadout":
      return "equipment";

    case "guard":
      return "guard";

    case "hinder":
      return "hinder";

    case "inventory":
    case "item":
    case "items":
    case "consumable":
    case "consumables":
      return "inventory";

    case "objective":
    case "other":
      return "objective";

    case "spell":
    case "spells":
    case "invocation":
    case "invocations":
    case "wellspring":
    case "wellsprings":
    case "verse":
    case "magitech":
      return "spell";

    case "skill":
    case "skills":
    case "heroicskill":
    case "quirk":
    case "quirks":
    case "zeropower":
    case "campactivity":
    case "otheroptional":
    case "hoplosphere":
    case "mnemosphere":
      return "skill";

    case "study":
    case "studyroll":
    case "note":
    case "notes":
      return "study";

    default:
      if (BASE_ACTION_ICON_KEYS.includes(normalized as BaseActionIconKey)) {
        return normalized as BaseActionIconKey;
      }
      return null;
  }
}

export interface ActionIconInfo {
  key: BaseActionIconKey;
  src: string;
  fallbackSrc: string;
}

export function getActionIconSrc(rawType?: string): ActionIconInfo | null {
  const key = getActionIconKey(rawType);
  if (!key) return null;
  return {
    key,
    src: `${ACTION_ICON_BASE}/action_c_${key}.png`,
    fallbackSrc: `${ACTION_ICON_BASE}/action_${key}.png`,
  };
}

export const ACTION_ICON_SRC_BY_KEY: Record<string, string> = {
  attack: `${ACTION_ICON_BASE}/action_c_attack.png`,
  equipment: `${ACTION_ICON_BASE}/action_c_equipment.png`,
  weapon: `${ACTION_ICON_BASE}/action_c_equipment.png`,
  weapons: `${ACTION_ICON_BASE}/action_c_equipment.png`,
  armor: `${ACTION_ICON_BASE}/action_c_equipment.png`,
  armors: `${ACTION_ICON_BASE}/action_c_equipment.png`,
  shield: `${ACTION_ICON_BASE}/action_c_equipment.png`,
  shields: `${ACTION_ICON_BASE}/action_c_equipment.png`,
  accessory: `${ACTION_ICON_BASE}/action_c_equipment.png`,
  accessories: `${ACTION_ICON_BASE}/action_c_equipment.png`,
  loadout: `${ACTION_ICON_BASE}/action_c_equipment.png`,
  guard: `${ACTION_ICON_BASE}/action_c_guard.png`,
  hinder: `${ACTION_ICON_BASE}/action_c_hinder.png`,
  inventory: `${ACTION_ICON_BASE}/action_c_inventory.png`,
  item: `${ACTION_ICON_BASE}/action_c_inventory.png`,
  items: `${ACTION_ICON_BASE}/action_c_inventory.png`,
  consumable: `${ACTION_ICON_BASE}/action_c_inventory.png`,
  consumables: `${ACTION_ICON_BASE}/action_c_inventory.png`,
  objective: `${ACTION_ICON_BASE}/action_c_objective.png`,
  other: `${ACTION_ICON_BASE}/action_c_objective.png`,
  spell: `${ACTION_ICON_BASE}/action_c_spell.png`,
  spells: `${ACTION_ICON_BASE}/action_c_spell.png`,
  invocation: `${ACTION_ICON_BASE}/action_c_spell.png`,
  invocations: `${ACTION_ICON_BASE}/action_c_spell.png`,
  wellspring: `${ACTION_ICON_BASE}/action_c_spell.png`,
  wellsprings: `${ACTION_ICON_BASE}/action_c_spell.png`,
  verse: `${ACTION_ICON_BASE}/action_c_spell.png`,
  magitech: `${ACTION_ICON_BASE}/action_c_spell.png`,
  skill: `${ACTION_ICON_BASE}/action_c_skill.png`,
  skills: `${ACTION_ICON_BASE}/action_c_skill.png`,
  "heroic skill": `${ACTION_ICON_BASE}/action_c_skill.png`,
  heroicskill: `${ACTION_ICON_BASE}/action_c_skill.png`,
  quirk: `${ACTION_ICON_BASE}/action_c_skill.png`,
  quirks: `${ACTION_ICON_BASE}/action_c_skill.png`,
  zeropower: `${ACTION_ICON_BASE}/action_c_skill.png`,
  campactivity: `${ACTION_ICON_BASE}/action_c_skill.png`,
  otheroptional: `${ACTION_ICON_BASE}/action_c_skill.png`,
  hoplosphere: `${ACTION_ICON_BASE}/action_c_skill.png`,
  mnemosphere: `${ACTION_ICON_BASE}/action_c_skill.png`,
  study: `${ACTION_ICON_BASE}/action_c_study.png`,
  study_roll: `${ACTION_ICON_BASE}/action_c_study.png`,
  studyroll: `${ACTION_ICON_BASE}/action_c_study.png`,
  note: `${ACTION_ICON_BASE}/action_c_study.png`,
  notes: `${ACTION_ICON_BASE}/action_c_study.png`,
};
