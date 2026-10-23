export const spellActivationPolicies = {
  "pilot-vehicle": {
    scope: "nested",
    collection: "vehicles",
    field: "enabled",
    mode: "single",
    allowNone: false,
  },
  arcanist: {
    scope: "spellList",
    field: "enabled",
    mode: "single",
    group: ["arcanist", "arcanist-rework"],
    allowNone: false,
  },
  "arcanist-rework": {
    scope: "spellList",
    field: "enabled",
    mode: "single",
    group: ["arcanist", "arcanist-rework"],
    allowNone: false,
  },
  therioform: {
    scope: "nested",
    collection: "therioforms",
    field: "enabled",
    mode: "multi",
    allowNone: true,
  },
  magiseed: {
    scope: "nested",
    collection: "magiseeds",
    field: "enabled",
    mode: "single",
    allowNone: true,
    currentField: "currentMagiseed",
  },
  symbol: {
    scope: "nested",
    collection: "symbols",
    field: "enabled",
    mode: "single",
    allowNone: true,
    temporary: true,
  },
};

export function getActivationPolicy(policyKey) {
  return spellActivationPolicies[policyKey] || null;
}

export function getActivationKey(item, fallbackIndex) {
  return (
    item?.id ??
    item?.fuid ??
    item?._packItemId ??
    item?.key ??
    item?.name ??
    fallbackIndex
  );
}

function isSpellInPolicyGroup(spell, policy, policyKey) {
  const group = policy.group || [policyKey];
  return group.includes(spell?.spellType);
}

export function isNestedItemActive(spell, itemIndex, policyKey) {
  const policy = getActivationPolicy(policyKey);
  if (!policy || policy.scope !== "nested") return false;

  const collection = spell?.[policy.collection] || [];
  const item = collection[itemIndex];
  if (!item) return false;

  if (policy.currentField) {
    const current = spell?.[policy.currentField];
    return Boolean(
      current &&
      getActivationKey(current, -1) === getActivationKey(item, itemIndex),
    );
  }

  return Boolean(item[policy.field]);
}

export function toggleNestedActivation(spell, itemIndex, policyKey) {
  const policy = getActivationPolicy(policyKey);
  if (!policy || policy.scope !== "nested") return spell;

  const collection = spell?.[policy.collection] || [];
  if (!collection[itemIndex]) return spell;

  const wasActive = isNestedItemActive(spell, itemIndex, policyKey);
  const shouldActivate = policy.allowNone ? !wasActive : true;

  if (policy.mode === "single") {
    const nextCollection = collection.map((item, index) => ({
      ...item,
      [policy.field]: index === itemIndex ? shouldActivate : false,
    }));

    return {
      ...spell,
      [policy.collection]: nextCollection,
      ...(policy.currentField
        ? {
            [policy.currentField]: shouldActivate
              ? nextCollection[itemIndex]
              : null,
          }
        : {}),
    };
  }

  if (policy.mode === "multi") {
    return {
      ...spell,
      [policy.collection]: collection.map((item, index) =>
        index === itemIndex ? { ...item, [policy.field]: !wasActive } : item,
      ),
    };
  }

  return spell;
}

export function setNestedActivation(spell, itemIndex, policyKey, active) {
  const currentActive = isNestedItemActive(spell, itemIndex, policyKey);
  if (currentActive === active) return spell;
  return toggleNestedActivation(spell, itemIndex, policyKey);
}

export function toggleSpellListActivation(spells, spellIndex, policyKey) {
  const policy = getActivationPolicy(policyKey);
  if (!policy || policy.scope !== "spellList") return spells;

  const target = spells?.[spellIndex];
  if (!target || !isSpellInPolicyGroup(target, policy, policyKey))
    return spells;

  const wasActive = Boolean(target[policy.field]);
  const shouldActivate = policy.allowNone ? !wasActive : true;

  if (policy.mode !== "single") return spells;

  return spells.map((spell, index) => {
    if (!isSpellInPolicyGroup(spell, policy, policyKey)) return spell;
    return {
      ...spell,
      [policy.field]: index === spellIndex ? shouldActivate : false,
    };
  });
}

export function setSpellListActivation(spells, spellIndex, policyKey, active) {
  const policy = getActivationPolicy(policyKey);
  if (!policy || policy.scope !== "spellList") return spells;

  const target = spells?.[spellIndex];
  if (!target || !isSpellInPolicyGroup(target, policy, policyKey))
    return spells;

  if (policy.mode !== "single") return spells;

  return spells.map((spell, index) => {
    if (!isSpellInPolicyGroup(spell, policy, policyKey)) return spell;
    if (!active && index !== spellIndex) return spell;
    return {
      ...spell,
      [policy.field]: active && index === spellIndex,
    };
  });
}

export function hasActiveSpellInList(spells, policyKey) {
  const policy = getActivationPolicy(policyKey);
  if (!policy || policy.scope !== "spellList") return false;
  return (spells || []).some(
    (spell) =>
      isSpellInPolicyGroup(spell, policy, policyKey) &&
      Boolean(spell[policy.field]),
  );
}
