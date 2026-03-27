/**
 * Clamps a value between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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
  max
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
    ? customWeapon.secondCurrentCustomizations || []
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

  if (isSecondaryForm) {
    damage += parseInt(customWeapon.secondDamageModifier || 0);
    precision += parseInt(customWeapon.secondPrecModifier || 0);
  } else {
    damage += parseInt(customWeapon.damageModifier || 0);
    precision += parseInt(customWeapon.precModifier || 0);
  }

  return { precision, damage };
}
