import { useState, useEffect } from "react";

/** Returns true if any modifier field on the item is non-zero. */
function hasAnyModifier(item) {
  const fields = [
    "defModifier",
    "mDefModifier",
    "initModifier",
    "magicModifier",
    "precModifier",
    "damageMeleeModifier",
    "damageRangedModifier",
    "damageModifier",
  ];
  return fields.some((f) => item?.[f] && item[f] !== 0);
}

/**
 * Manages the shared modifier and equip state common to all equipment types
 * (weapons, armor, shields, accessories, custom weapons).
 *
 * All five equipment modals follow the same pattern:
 *   - modifier fields that reset from the item prop when it changes
 *   - modifiersExpanded auto-expands when the item has any non-zero modifier
 *   - isEquipped checkbox
 *
 * @param {object|null} item - The equipment item currently being edited.
 * @returns {object} Form state, setters, and helpers.
 */
export function useEquipmentForm(item) {
  // Armor/shield/accessory modifiers
  const [defModifier, setDefModifier] = useState(item?.defModifier || 0);
  const [mDefModifier, setMDefModifier] = useState(item?.mDefModifier || 0);
  const [initModifier, setInitModifier] = useState(item?.initModifier || 0);
  const [magicModifier, setMagicModifier] = useState(item?.magicModifier || 0);
  const [precModifier, setPrecModifier] = useState(item?.precModifier || 0);
  const [damageMeleeModifier, setDamageMeleeModifier] = useState(
    item?.damageMeleeModifier || 0
  );
  const [damageRangedModifier, setDamageRangedModifier] = useState(
    item?.damageRangedModifier || 0
  );
  // Weapon-only modifier
  const [damageModifier, setDamageModifier] = useState(
    item?.damageModifier || 0
  );
  // Common UX
  const [isEquipped, setIsEquipped] = useState(item?.isEquipped || false);
  const [modifiersExpanded, setModifiersExpanded] = useState(
    () => hasAnyModifier(item)
  );

  // Reset all state whenever the item being edited changes.
  useEffect(() => {
    setDefModifier(item?.defModifier || 0);
    setMDefModifier(item?.mDefModifier || 0);
    setInitModifier(item?.initModifier || 0);
    setMagicModifier(item?.magicModifier || 0);
    setPrecModifier(item?.precModifier || 0);
    setDamageMeleeModifier(item?.damageMeleeModifier || 0);
    setDamageRangedModifier(item?.damageRangedModifier || 0);
    setDamageModifier(item?.damageModifier || 0);
    setIsEquipped(item?.isEquipped || false);
    setModifiersExpanded(hasAnyModifier(item));
  }, [item]);

  /** Force-expand the accordion (e.g. after JSON upload sets a modifier). */
  const expandModifiers = () => setModifiersExpanded(true);

  /** Returns all modifier values as parsed integers, ready to spread into a saved item. */
  const modifiers = () => ({
    defModifier: parseInt(defModifier),
    mDefModifier: parseInt(mDefModifier),
    initModifier: parseInt(initModifier),
    magicModifier: parseInt(magicModifier),
    precModifier: parseInt(precModifier),
    damageMeleeModifier: parseInt(damageMeleeModifier),
    damageRangedModifier: parseInt(damageRangedModifier),
    damageModifier: parseInt(damageModifier),
    isEquipped,
  });

  /** Resets all modifier fields to zero and collapses the accordion. */
  const clearModifiers = () => {
    setDefModifier(0);
    setMDefModifier(0);
    setInitModifier(0);
    setMagicModifier(0);
    setPrecModifier(0);
    setDamageMeleeModifier(0);
    setDamageRangedModifier(0);
    setDamageModifier(0);
    setIsEquipped(false);
    setModifiersExpanded(false);
  };

  return {
    defModifier, setDefModifier,
    mDefModifier, setMDefModifier,
    initModifier, setInitModifier,
    magicModifier, setMagicModifier,
    precModifier, setPrecModifier,
    damageMeleeModifier, setDamageMeleeModifier,
    damageRangedModifier, setDamageRangedModifier,
    damageModifier, setDamageModifier,
    isEquipped, setIsEquipped,
    modifiersExpanded, setModifiersExpanded,
    expandModifiers,
    modifiers,
    clearModifiers,
  };
}
