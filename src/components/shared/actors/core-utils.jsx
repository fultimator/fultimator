import React from "react";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { calculateAttribute } from "../../../libs/playerCalculations";
import { isItemEquipped } from "../../../libs/player/slots/equipmentSlots";

export const ACTOR_DEFAULTS = {
  variant: "interactive",
  onAttackRoll: null,
  onSpellRoll: null,
};

// variants: "interactive" | "display" | "print"
export function isInteractive(variant) {
  return variant === "interactive";
}

export function getActorVariantScale(variant) {
  if (variant === "print")
    return { section: "1rem", body: "0.85rem", heading: "0.85rem" };
  return { section: "1.1rem", body: "1rem", heading: "1rem" };
}

export function getNpcBackground(customTheme) {
  return customTheme.mode === "dark"
    ? `linear-gradient(90deg, #583871 0%, rgba(255, 255, 255, 0) 100%)`
    : `linear-gradient(90deg, #6e468d 0%, #ffffff 100%)`;
}

export function useActorCardSetup(variant) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();
  const scale = getActorVariantScale(variant);
  const background = getNpcBackground(customTheme);
  return { t, customTheme, scale, background };
}

// Shared PC constants

export const AFFINITY_TYPES = [
  "physical",
  "air",
  "bolt",
  "dark",
  "earth",
  "fire",
  "ice",
  "light",
  "poison",
];

// Combat stat derivation

export function deriveCombatStats(pc) {
  const inv = pc.equipment?.[0];
  const equippedArmor = inv?.armor?.find((a) => isItemEquipped(pc, a)) || null;
  const equippedShields =
    inv?.shields?.filter((s) => isItemEquipped(pc, s)) || [];
  const equippedWeapons =
    inv?.weapons?.filter((w) => isItemEquipped(pc, w)) || [];
  const equippedCustomWeapons =
    inv?.customWeapons?.filter((w) => isItemEquipped(pc, w)) || [];
  const equippedAccessory =
    inv?.accessories?.find((a) => isItemEquipped(pc, a)) || null;

  const pilotSpells = (pc.classes || [])
    .flatMap((c) => c.spells || [])
    .filter(
      (s) => s?.spellType === "pilot-vehicle" && s.showInPlayerSheet !== false,
    );
  const activeVehicle = pilotSpells
    .flatMap((s) => s.vehicles || [])
    .find((v) => v.enabled);
  const equippedModules =
    activeVehicle?.modules?.filter((m) => m.equipped) || [];
  const armorModule = equippedModules.find(
    (m) => m.type === "pilot_module_armor",
  );

  const currDex = calculateAttribute(
    pc,
    pc.attributes.dexterity?.base,
    ["slow", "enraged"],
    ["dexUp"],
    6,
    12,
  );
  const currInsight = calculateAttribute(
    pc,
    pc.attributes.insight?.base,
    ["dazed", "enraged"],
    ["insUp"],
    6,
    12,
  );

  const isMartialArmor = armorModule
    ? armorModule.martial
    : equippedArmor?.martial || false;
  const dodgeBonus =
    equippedShields.length === 0 && !isMartialArmor
      ? (pc.classes || [])
          .flatMap((c) => c.skills || [])
          .filter((s) => s.specialSkill === "Dodge")
          .reduce((sum, s) => sum + (s.currentLvl || 0), 0)
      : 0;

  const baseDef = armorModule
    ? armorModule.martial
      ? armorModule.def || 0
      : currDex + (armorModule.def || 0)
    : equippedArmor
      ? equippedArmor.martial
        ? equippedArmor.def
        : currDex + equippedArmor.def
      : currDex;

  const currDef =
    baseDef +
    equippedShields.reduce((t, s) => t + (s.def || 0), 0) +
    (pc.modifiers?.def || 0) +
    (armorModule
      ? 0
      : (equippedArmor?.modifiers?.def ?? equippedArmor?.defModifier ?? 0)) +
    equippedShields.reduce(
      (t, s) => t + (s?.modifiers?.def ?? s?.defModifier ?? 0),
      0,
    ) +
    (equippedAccessory?.modifiers?.def ?? equippedAccessory?.defModifier ?? 0) +
    equippedWeapons.reduce(
      (t, w) => t + (w?.modifiers?.def ?? w?.defModifier ?? 0),
      0,
    ) +
    equippedCustomWeapons.reduce(
      (t, w) =>
        t + (parseInt(w?.modifiers?.def ?? w?.defModifier ?? 0, 10) || 0),
      0,
    ) +
    dodgeBonus;

  const baseMDef = armorModule
    ? armorModule.martial
      ? armorModule.mdef || 0
      : currInsight + (armorModule.mdef || 0)
    : equippedArmor
      ? currInsight + equippedArmor.mdef
      : currInsight;

  const currMDef =
    baseMDef +
    equippedShields.reduce((t, s) => t + (s.mdef || 0), 0) +
    (pc.modifiers?.mdef || 0) +
    (armorModule
      ? 0
      : (equippedArmor?.modifiers?.mdef ?? equippedArmor?.mDefModifier ?? 0)) +
    equippedShields.reduce(
      (t, s) => t + (s?.modifiers?.mdef ?? s?.mDefModifier ?? 0),
      0,
    ) +
    (equippedAccessory?.modifiers?.mdef ??
      equippedAccessory?.mDefModifier ??
      0) +
    equippedWeapons.reduce(
      (t, w) => t + (w?.modifiers?.mdef ?? w?.mDefModifier ?? 0),
      0,
    ) +
    equippedCustomWeapons.reduce(
      (t, w) =>
        t + (parseInt(w?.modifiers?.mdef ?? w?.mDefModifier ?? 0, 10) || 0),
      0,
    );

  const baseInit = armorModule ? 0 : equippedArmor?.init || 0;
  const currInit =
    baseInit +
    (pc.modifiers?.init || 0) +
    (armorModule ? 0 : equippedArmor?.initModifier || 0) +
    equippedShields.reduce((t, s) => t + (s.initModifier || 0), 0) +
    (equippedAccessory?.initModifier || 0);

  return {
    currDef,
    currMDef,
    currInit,
    baseDef,
    baseMDef,
    baseInit,
    equippedArmor,
    equippedShields,
    equippedAccessory,
    equippedWeapons,
    isMartialArmor,
    dodgeBonus,
    currDex,
    currInsight,
  };
}

// Search highlighting

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightMatch(text, query) {
  const source = text == null ? "" : String(text);
  const trimmed = query?.trim();
  if (!trimmed) return source;
  const safe = escapeRegExp(trimmed);
  return source.split(new RegExp(`(${safe})`, "ig")).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} style={{ backgroundColor: "yellow", padding: 0 }}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
