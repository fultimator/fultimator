export const SHARED_LABEL_KEYS = {
  fuid: "shared.fuid",
  name: "shared.name",
  base: "shared.base",
  martial: "shared.martial",
  description: "shared.description",
  cost: "shared.cost",
  "cost.resource": "shared.cost.resource",
  "cost.amount": "shared.cost.amount",
  "cost.amountPerTarget": "shared.cost.amountPerTarget",
  "cost.perTarget": "shared.cost.perTarget",
  type: "shared.type",
  itemType: "shared.itemType",
  category: "shared.category",
  range: "shared.range",
  hands: "shared.hands",
  class: "shared.class",
  book: "shared.book",
  target: "shared.target",
  maxTargets: "shared.maxTargets",
  duration: "shared.duration",
  offensive: "shared.offensive",
  effect: "shared.effect",
  rework: "shared.rework",
  isEquipped: "shared.isEquipped",
  spCost: "shared.spCost",
  value: "shared.value",
  quantity: "shared.quantity",
  ipCost: "shared.ipCost",
  "quality.preset": "shared.quality.preset",
  "quality.text": "shared.quality.text",
  "quality.cost": "shared.quality.cost",
  "accuracy.attr1": "shared.accuracy.attr1",
  "accuracy.attr2": "shared.accuracy.attr2",
  "accuracy.bonus": "shared.accuracy.bonus",
  "accuracy.defense": "shared.accuracy.defense",
  "damage.value": "shared.damage.value",
  "damage.type": "shared.damage.type",
  "damage.hrZero": "shared.damage.hrZero",
} as const;

export type SharedLabelKey =
  (typeof SHARED_LABEL_KEYS)[keyof typeof SHARED_LABEL_KEYS];

export function prefixedLabel(prefix: string, key: SharedLabelKey): string {
  if (key.startsWith("shared.")) return key;
  return `${prefix}.${key}`;
}
