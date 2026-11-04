/**
 * Clamps a value between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function classBenefitBonuses(player) {
  let hpBonus = 0;
  let mpBonus = 0;
  let ipBonus = 0;

  const innateClasses = player.settings?.optionalRules?.innateClasses ?? [];
  const isTechnospheres =
    player.settings?.optionalRules?.technospheres ?? false;
  const technospheresVariant =
    player.settings?.optionalRules?.technospheresVariant ?? "standard";
  const usesInnateClassRules =
    isTechnospheres && technospheresVariant !== "hoplospheres";

  (player.classes ?? []).forEach((cls) => {
    if (!cls.benefits) return;
    if (usesInnateClassRules && !innateClasses.includes(cls.name)) return;
    hpBonus += cls.benefits.hpplus || 0;
    mpBonus += cls.benefits.mpplus || 0;
    ipBonus += cls.benefits.ipplus || 0;
  });

  if (
    isTechnospheres &&
    (technospheresVariant === "standard" ||
      technospheresVariant === "mnemospheres")
  ) {
    hpBonus += 5;
    mpBonus += 5;
  }

  return { hpBonus, mpBonus, ipBonus };
}

export function calcMaxHp(player) {
  const lvl = Number(player.lvl) || 0;
  const might = Number(player.attributes?.might?.base) || 0;
  const baseMaxHP = lvl + might * 5;

  let hpBonus = classBenefitBonuses(player).hpBonus;

  if (player.modifiers) {
    hpBonus += player.resources?.hp?.bonus ?? player.modifiers.hp ?? 0;
  }

  const fortressBonus = (player.classes ?? [])
    .flatMap((cls) => cls.skills || [])
    .filter((skill) => skill.specialSkill === "Fortress")
    .reduce((acc, skill) => acc + Number(skill.currentLvl) * 3, 0);
  hpBonus += fortressBonus;

  return baseMaxHP + hpBonus;
}

export function calcMaxMp(player) {
  const lvl = Number(player.lvl) || 0;
  const willpower = Number(player.attributes?.willpower?.base) || 0;
  const baseMaxMP = lvl + willpower * 5;

  let mpBonus = classBenefitBonuses(player).mpBonus;

  if (player.modifiers) {
    mpBonus += player.resources?.mp?.bonus ?? player.modifiers.mp ?? 0;
  }

  const focusedBonus = (player.classes ?? [])
    .flatMap((cls) => cls.skills || [])
    .filter((skill) => skill.specialSkill === "Focused")
    .reduce((acc, skill) => acc + Number(skill.currentLvl) * 3, 0);
  mpBonus += focusedBonus;

  return baseMaxMP + mpBonus;
}

export function calcMaxIp(player) {
  let ipBonus = classBenefitBonuses(player).ipBonus;
  if (player.modifiers) {
    ipBonus += player.modifiers.ip || 0;
  }
  return 6 + ipBonus;
}

/**
 * Calculates the effective attribute die value for a player, applying active
 * debuff and buff statuses, then clamping to [min, max].
 *
 * @param {object} player - Player object with a `statuses` map of boolean flags.
 * @param {number} attributeValue - Base die size (e.g. 6, 8, 10, 12).
 * @param {string[]} debuffStatuses - Status names that each lower the die by 2.
 * @param {string[]} buffStatuses - Status names that each raise the die by 2.
 * @param {number} min - Minimum allowed die size (typically 6).
 * @param {number} max - Maximum allowed die size (typically 12).
 * @returns {number} Effective die size after applying all active statuses.
 */
export function calculateAttribute(
  player,
  attributeValue,
  debuffStatuses,
  buffStatuses,
  min,
  max,
) {
  let value = attributeValue;

  for (const status of debuffStatuses) {
    if (player.statuses?.[status]) {
      value -= 2;
    }
  }

  for (const status of buffStatuses) {
    if (player.statuses?.[status]) {
      value += 2;
    }
  }

  return clamp(value, min, max);
}

/**
 * Lightens a hex color by blending it toward white by the given percentage.
 *
 * @param {string} hexColor - Hex color string, e.g. "#f44336".
 * @param {number} percent - How much to blend toward white (0–100).
 * @returns {string} Lightened hex color string.
 */
export function newShade(hexColor, percent) {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const factor = percent / 100;
  const nr = Math.round(r + (255 - r) * factor);
  const ng = Math.round(g + (255 - g) * factor);
  const nb = Math.round(b + (255 - b) * factor);

  return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
}

/**
 * Calculates precision and damage for a custom weapon based on its
 * customizations and modifiers, for either its primary or secondary form.
 *
 * @param {object} customWeapon - Custom weapon data object.
 * @param {boolean} isSecondaryForm - Whether to use the secondary (transforming) form.
 * @returns {{ precision: number, damage: number }}
 */
export function calculateCustomWeaponStats(customWeapon, isSecondaryForm) {
  const customizations = isSecondaryForm
    ? customWeapon.secondCustomizations ||
      customWeapon.secondCurrentCustomizations ||
      []
    : customWeapon.customizations || [];

  const category = isSecondaryForm
    ? customWeapon.secondSelectedCategory
    : customWeapon.category;

  let damage = 5;
  let precision = 0;

  for (const c of customizations) {
    switch (c.name) {
      case "weapon_customization_accurate":
        precision += 2;
        break;
      case "weapon_customization_powerful":
        damage += category === "weapon_category_heavy" ? 7 : 5;
        break;
      case "weapon_customization_elemental":
        damage += 2;
        break;
      default:
        break;
    }
  }

  const rare = customWeapon.rare ?? {};
  if ((rare.accuracyBonus ?? customWeapon.rareAccuracyBonus) === true)
    precision += 1;
  if ((rare.damageBonus ?? customWeapon.rareDamageBonus) === true) damage += 4;

  if (isSecondaryForm) {
    damage += parseInt(
      customWeapon.secondModifiers?.damage ??
        customWeapon.secondDamageModifier ??
        0,
    );
    precision += parseInt(
      customWeapon.secondModifiers?.accuracy ??
        customWeapon.secondPrecModifier ??
        0,
    );
  } else {
    damage += parseInt(
      customWeapon.modifiers?.damage ?? customWeapon.damageModifier ?? 0,
    );
    precision += parseInt(
      customWeapon.modifiers?.accuracy ?? customWeapon.precModifier ?? 0,
    );
  }

  return { precision, damage };
}
