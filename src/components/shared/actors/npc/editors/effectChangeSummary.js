const KEY_LABELS = {
  "bonuses.accuracy.all": "Accuracy (all)",
  "bonuses.accuracy.accuracyCheck": "Accuracy",
  "bonuses.accuracy.melee": "Melee accuracy",
  "bonuses.accuracy.ranged": "Ranged accuracy",
  "bonuses.accuracy.magic": "Magic",
  "bonuses.damage.all": "Damage (all)",
  "bonuses.damage.melee": "Melee damage",
  "bonuses.damage.ranged": "Ranged damage",
  "bonuses.damage.spell": "Spell damage",
};

function labelForKey(key) {
  if (KEY_LABELS[key]) return KEY_LABELS[key];
  if (key?.startsWith("bonuses.damage.")) {
    return `${key.split(".").pop()} damage`;
  }
  if (key?.startsWith("bonuses.incomingDamage.")) {
    return `incoming ${key.split(".").pop()}`;
  }
  if (key?.startsWith("affinities.")) {
    return `${key.split(".").pop()} affinity`;
  }
  return key ?? "";
}

const MODE_PREFIX = {
  0: "=", // override
  1: "×", // multiply
  2: "", // add (sign comes from the value)
  3: "↓", // downgrade
  4: "↑", // upgrade
};

function formatChange(change) {
  const label = labelForKey(change?.key);
  const raw = change?.value ?? "";
  const mode = change?.mode ?? 2;

  if (typeof change?.key === "string" && change.key.startsWith("affinities.")) {
    return `${label} ${raw}`.trim();
  }

  const num = Number(raw);
  if (mode === 2 && Number.isFinite(num)) {
    return `${label} ${num >= 0 ? "+" : ""}${num}`;
  }
  const prefix = MODE_PREFIX[mode] ?? "";
  return `${label} ${prefix}${raw}`.trim();
}

export function summarizeEffectChanges(effect) {
  const behaviors = Array.isArray(effect?.behaviors) ? effect.behaviors : [];
  const parts = [];
  for (const beh of behaviors) {
    if (beh?.trigger?.kind && beh.trigger.kind !== "passive") continue;
    for (const change of beh?.changes ?? []) {
      if (!change?.key) continue;
      parts.push(formatChange(change));
    }
  }
  return parts.join(" ⬥ ");
}
