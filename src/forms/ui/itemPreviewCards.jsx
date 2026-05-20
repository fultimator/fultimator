import React from "react";
import {
  SharedAccessoryCard,
  SharedArmorCard,
  SharedCustomWeaponCard,
  SharedHeroicCard,
  SharedShieldCard,
  SharedWeaponCard,
} from "../../components/shared/itemCards";
import { calcWeaponPreview } from "../schema/itemSchemas/weapon";
import { normalizeWeaponLike } from "../../libs/weaponNormalization";
import { buildSphereData } from "../../libs/technospheres";
import { calculateCustomWeaponStats } from "../../components/player/common/playerCalculations";

export function AccessoryPreviewCard({ formState }) {
  return (
    <SharedAccessoryCard
      item={{ name: formState.name, cost: formState.cost, quality: formState.quality }}
    />
  );
}

export function ArmorPreviewCard({ formState, ctx }) {
  return (
    <SharedArmorCard
      item={{
        base: formState.base,
        ...formState.base,
        name: formState.name,
        cost: formState.cost,
        martial: formState.martial,
        quality: formState.quality,
        init: formState.init,
        rework: formState.rework,
        defModifier: parseInt(String(formState.defModifier)),
        mDefModifier: parseInt(String(formState.mDefModifier)),
        initModifier: parseInt(String(formState.initModifier)),
        slots: formState.slots,
        slotted: formState.slotted,
      }}
      sphereData={buildSphereData(
        { slots: formState.slots, slotted: formState.slotted },
        ctx?.player,
      )}
    />
  );
}

export function ShieldPreviewCard({ formState }) {
  return (
    <SharedShieldCard
      item={{
        base: formState.base,
        name: formState.name,
        cost: formState.cost,
        martial: formState.martial,
        quality: formState.quality,
        init: formState.init,
        rework: formState.rework,
        defModifier: parseInt(String(formState.defModifier)),
        mDefModifier: parseInt(String(formState.mDefModifier)),
        initModifier: parseInt(String(formState.initModifier)),
      }}
    />
  );
}

export function HeroicPreviewCard({ formState }) {
  return <SharedHeroicCard item={formState} />;
}

export function CustomWeaponPreviewCard({ formState, ctx }) {
  const {
    selectedCategory,
    selectedAccuracyCheck,
    overrideAccuracyAttributes,
    rareAccuracyBonus,
    hasTransforming,
    secondSelectedCategory,
    slots,
    slotted,
    primaryHrZero,
    customDamageType,
    overrideDamageType,
    damageModifier,
    precModifier,
    secondSelectedAccuracyCheck,
    secondaryHrZero,
    secondOverrideDamageType,
    secondCustomDamageType,
    secondDamageModifier,
    secondPrecModifier,
    secondCustomizations,
  } = formState;

  const { precision: pPrec, damage: pDmg } = calculateCustomWeaponStats(
    {
      category: selectedCategory,
      customizations: formState.customizations,
      rareAccuracyBonus,
      rareDamageBonus: formState.rareDamageBonus,
      damageModifier: parseInt(damageModifier) || 0,
      precModifier: parseInt(precModifier) || 0,
    },
    false,
  );
  const pHasElemental = (formState.customizations ?? []).some(
    (c) => c.name === "weapon_customization_elemental",
  );
  const pType = pHasElemental ? customDamageType : overrideDamageType ? customDamageType : "physical";

  const { precision: s2Prec, damage: s2Dmg } = hasTransforming
    ? calculateCustomWeaponStats(
        {
          secondSelectedCategory,
          secondCurrentCustomizations: secondCustomizations,
          rareAccuracyBonus,
          rareDamageBonus: formState.rareDamageBonus,
          secondDamageModifier: parseInt(secondDamageModifier) || 0,
          secondPrecModifier: parseInt(secondPrecModifier) || 0,
        },
        true,
      )
    : { precision: 0, damage: 0 };
  const s2HasElemental = (secondCustomizations ?? []).some(
    (c) => c.name === "weapon_customization_elemental",
  );
  const s2Type = s2HasElemental ? secondCustomDamageType : secondOverrideDamageType ? secondCustomDamageType : "physical";

  return (
    <SharedCustomWeaponCard
      item={{
        name: formState.name,
        category: selectedCategory,
        range: formState.selectedRange,
        accuracy: {
          attr1: selectedAccuracyCheck.attr1,
          attr2: selectedAccuracyCheck.attr2,
          value: pPrec,
          defense: "def",
        },
        damage: { value: pDmg, type: pType, hrZero: primaryHrZero },
        customizations: formState.customizations,
        quality: formState.quality,
        cost: formState.cost ?? 300,
        hands: 2,
        martial: formState.martial,
        rareAccuracyBonus,
        rareDamageBonus: formState.rareDamageBonus,
        overrideAccuracyAttributes,
        overrideDamageType,
        defModifier: parseInt(formState.defModifier) || 0,
        mDefModifier: parseInt(formState.mDefModifier) || 0,
        slots,
        slotted,
        secondWeaponName: formState.secondWeaponName,
        secondSelectedCategory: formState.secondSelectedCategory,
        secondSelectedRange: formState.secondSelectedRange,
        secondAccuracy: hasTransforming
          ? { attr1: secondSelectedAccuracyCheck.attr1, attr2: secondSelectedAccuracyCheck.attr2, value: s2Prec, defense: "def" }
          : undefined,
        secondDamage: hasTransforming
          ? { value: s2Dmg, type: s2Type, hrZero: secondaryHrZero }
          : undefined,
        secondCurrentCustomizations: hasTransforming ? secondCustomizations : undefined,
      }}
      sphereData={buildSphereData({ slots, slotted }, ctx?.player)}
    />
  );
}

export function WeaponPreviewCard({ formState }) {
  const { cost, damage, prec } = calcWeaponPreview(formState);
  return (
    <SharedWeaponCard
      item={normalizeWeaponLike({
        base: formState.base,
        name: formState.name,
        type: formState.type,
        hands: formState.hands,
        att1: formState.att1,
        att2: formState.att2,
        martial: formState.martial,
        damageBonus: formState.damageBonus,
        damageReworkBonus: formState.damageReworkBonus,
        precBonus: formState.precBonus,
        rework: formState.rework,
        quality: formState.quality,
        cost,
        damage: { value: damage, type: formState.type, hrZero: formState.damageHrZero },
        prec,
        defModifier: parseInt(String(formState.defModifier)),
        mDefModifier: parseInt(String(formState.mDefModifier)),
      })}
    />
  );
}
