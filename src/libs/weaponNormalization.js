function normalizeRange(item = {}) {
  if (item.range === "ranged" || item.range === "distance") return "ranged";
  if (item.range === "melee") return "melee";
  if (item.ranged || item.isRanged) return "ranged";
  return "melee";
}

function categoryDefense(_category) {
  return "def";
}

export const getWeaponAttr1 = (item) => item?.accuracy?.attr1 ?? item?.att1;
export const getWeaponAttr2 = (item) => item?.accuracy?.attr2 ?? item?.att2;
export const getWeaponPrec = (item) => item?.accuracy?.value ?? item?.prec ?? 0;
export const getWeaponDamage = (item) =>
  item?.damage && typeof item.damage === "object"
    ? (item.damage.value ?? 0)
    : (item?.damage ?? 0);
export const getWeaponType = (item) =>
  item?.damage?.type ?? item?.type ?? "physical";
export const getWeaponRange = (item) =>
  item?.range ?? (item?.ranged ? "ranged" : "melee");
export const normalizeWeaponCategory = (category) =>
  category === "spear_category" ? "Spear" : category;

export function normalizeWeaponLike(item = {}) {
  const {
    att1,
    att2,
    attr1,
    attr2,
    prec,
    dmg,
    type,
    damageModifier,
    precModifier,
    defModifier,
    mDefModifier,
    damageBonus,
    damageReworkBonus,
    precBonus,
    melee: _melee,
    ranged: _ranged,
    isRanged: _isRanged,
    isMartial,
    isEquipped: _isEquipped,
    isExtraPrec: _isExtraPrec,
    isExtraDmg: _isExtraDmg,
    ...rest
  } = item;
  const accuracy = item.accuracy ?? {};
  const damage =
    item.damage && typeof item.damage === "object" ? item.damage : {};
  const damageValue =
    typeof damage.value === "number"
      ? damage.value
      : typeof item.damage === "number"
        ? item.damage
        : typeof dmg === "number"
          ? dmg
          : 0;

  return {
    ...rest,
    itemType: "weapon",
    category: normalizeWeaponCategory(item.category),
    range: normalizeRange(item),
    martial: item.martial ?? isMartial ?? false,
    accuracy: {
      attr1: accuracy.attr1 ?? attr1 ?? att1 ?? "dexterity",
      attr2: accuracy.attr2 ?? attr2 ?? att2 ?? "might",
      value: accuracy.value ?? prec ?? 0,
      defense: accuracy.defense ?? "def",
    },
    damage: {
      value: damageValue,
      type: damage.type ?? type ?? "physical",
    },
    modifiers: {
      damage:
        item.modifiers?.damage ??
        (damageModifier !== undefined ? parseInt(damageModifier, 10) || 0 : 0),
      accuracy:
        item.modifiers?.accuracy ??
        (precModifier !== undefined ? parseInt(precModifier, 10) || 0 : 0),
      def:
        item.modifiers?.def ??
        (defModifier !== undefined ? parseInt(defModifier, 10) || 0 : 0),
      mdef:
        item.modifiers?.mdef ??
        (mDefModifier !== undefined ? parseInt(mDefModifier, 10) || 0 : 0),
    },
    rare: {
      accuracyBonus:
        item.rare?.accuracyBonus ?? (precBonus === true ? true : false),
      damageBonus:
        item.rare?.damageBonus ??
        ((damageReworkBonus || damageBonus) === true ? true : false),
    },
  };
}

export function normalizeCustomWeaponLike(item = {}) {
  const accuracyCheck = item.accuracyCheck ?? {};
  const secondAccuracyCheck = item.secondSelectedAccuracyCheck ?? {};
  const accuracy = item.accuracy ?? {};
  const damage =
    item.damage && typeof item.damage === "object" ? item.damage : {};
  const {
    accuracy: _accuracy,
    damage: _damage,
    accuracyCheck: _accuracyCheck,
    type,
    damageModifier,
    precModifier,
    customDamageType,
    secondSelectedAccuracyCheck: _secondSelectedAccuracyCheck,
    secondSelectedType,
    secondDamageModifier,
    secondPrecModifier,
    secondCustomDamageType,
    rareAccuracyBonus,
    rareDamageBonus,
    overrideDamageType,
    overrideAccuracyAttributes,
    defModifier,
    mDefModifier,
    secondCurrentCustomizations,
    secondWeaponName,
    secondSelectedCategory,
    secondSelectedRange,
    secondDefModifier,
    secondMDefModifier,
    secondOverrideDamageType,
    isEquipped: _isEquipped,
    ...rest
  } = item;
  const primaryCategory = normalizeWeaponCategory(item.category);

  const next = {
    ...rest,
    itemType: "customWeapon",
    category: primaryCategory,
    range: normalizeRange(item),
    hands:
      item.hands === 2 || item.hands === 1
        ? item.hands
        : item.isTwoHand
          ? 2
          : 2,
    martial: item.martial ?? false,
    accuracy: {
      attr1:
        accuracy.attr1 ??
        accuracyCheck.attr1 ??
        accuracyCheck.att1 ??
        "dexterity",
      attr2:
        accuracy.attr2 ?? accuracyCheck.attr2 ?? accuracyCheck.att2 ?? "might",
      value: accuracy.value ?? precModifier ?? 0,
      defense: accuracy.defense ?? categoryDefense(primaryCategory),
    },
    damage: {
      value: damage.value ?? damageModifier ?? 0,
      type: damage.type ?? customDamageType ?? type ?? "physical",
    },
    modifiers: {
      damage:
        item.modifiers?.damage ??
        (damageModifier !== undefined ? parseInt(damageModifier, 10) || 0 : 0),
      accuracy:
        item.modifiers?.accuracy ??
        (precModifier !== undefined ? parseInt(precModifier, 10) || 0 : 0),
      def:
        item.modifiers?.def ??
        (defModifier !== undefined ? parseInt(defModifier, 10) || 0 : 0),
      mdef:
        item.modifiers?.mdef ??
        (mDefModifier !== undefined ? parseInt(mDefModifier, 10) || 0 : 0),
    },
    rare: {
      accuracyBonus:
        item.rare?.accuracyBonus ?? (rareAccuracyBonus === true ? true : false),
      damageBonus:
        item.rare?.damageBonus ?? (rareDamageBonus === true ? true : false),
      overrideDamageType:
        item.rare?.overrideDamageType ??
        (overrideDamageType === true ? true : false),
      overrideAccuracyAttributes:
        item.rare?.overrideAccuracyAttributes ??
        (overrideAccuracyAttributes === true ? true : false),
      overrideDamageTypeValue:
        item.rare?.overrideDamageTypeValue ??
        customDamageType ??
        damage.type ??
        type,
      overrideAccuracyAttr1:
        item.rare?.overrideAccuracyAttr1 ??
        accuracy.attr1 ??
        accuracyCheck.attr1 ??
        accuracyCheck.att1,
      overrideAccuracyAttr2:
        item.rare?.overrideAccuracyAttr2 ??
        accuracy.attr2 ??
        accuracyCheck.attr2 ??
        accuracyCheck.att2,
    },
  };

  if (
    item.secondAccuracy ||
    item.secondDamage ||
    secondWeaponName ||
    secondSelectedCategory ||
    secondSelectedRange
  ) {
    const secondaryCategory = normalizeWeaponCategory(
      secondSelectedCategory ?? primaryCategory,
    );
    next.secondAccuracy = item.secondAccuracy ?? {
      attr1:
        secondAccuracyCheck.attr1 ??
        secondAccuracyCheck.att1 ??
        next.accuracy.attr1,
      attr2:
        secondAccuracyCheck.attr2 ??
        secondAccuracyCheck.att2 ??
        next.accuracy.attr2,
      value: secondPrecModifier ?? 0,
      defense: categoryDefense(secondaryCategory),
    };
    next.secondDamage = item.secondDamage ?? {
      value: secondDamageModifier ?? 0,
      type: secondCustomDamageType ?? secondSelectedType ?? next.damage.type,
    };
    next.secondModifiers = {
      damage:
        item.secondModifiers?.damage ??
        (secondDamageModifier !== undefined
          ? parseInt(secondDamageModifier, 10) || 0
          : 0),
      accuracy:
        item.secondModifiers?.accuracy ??
        (secondPrecModifier !== undefined
          ? parseInt(secondPrecModifier, 10) || 0
          : 0),
      def:
        item.secondModifiers?.def ??
        (secondDefModifier !== undefined
          ? parseInt(secondDefModifier, 10) || 0
          : 0),
      mdef:
        item.secondModifiers?.mdef ??
        (secondMDefModifier !== undefined
          ? parseInt(secondMDefModifier, 10) || 0
          : 0),
    };
    next.secondSelectedCategory = secondaryCategory;
    next.secondSelectedRange = normalizeRange({
      range: secondSelectedRange,
      isRanged: secondSelectedRange === "ranged",
    });
    next.secondCustomizations =
      item.secondCustomizations ?? secondCurrentCustomizations ?? [];
    if (secondOverrideDamageType === true) {
      next.rare = {
        ...(next.rare ?? {}),
        overrideDamageType: true,
        overrideDamageTypeValue:
          next.rare?.overrideDamageTypeValue ??
          secondCustomDamageType ??
          next.damage.type,
      };
    }
  }

  return next;
}

export function normalizeCompendiumItemData(type, data) {
  if (!data || typeof data !== "object") return data;
  if (type === "weapon" || type === "weapons") return normalizeWeaponLike(data);
  if (type === "custom-weapon" || type === "custom-weapons") {
    return normalizeCustomWeaponLike(data);
  }
  return data;
}
