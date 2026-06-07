import type {
  FieldConfig,
  ItemFieldConfig,
  TabDefinition,
} from "../fieldConfig";

export const BEHAVIOR_TAB_KEY = "behavior";
export const PASSIVES_TAB_KEY = "passives";
export const BEHAVIORS_TAB_KEY = "behaviors";

export const DEFAULT_ITEM_TABS: TabDefinition[] = [
  { key: "attributes", label: "tab.attributes" },
  { key: "passives", label: "tab.passives" },
  { key: "behaviors", label: "tab.behaviors" },
];

export const PASSIVE_ITEM_TABS: TabDefinition[] = [
  { key: "attributes", label: "tab.attributes" },
  { key: "passives", label: "tab.passives" },
  { key: "behaviors", label: "tab.behaviors" },
];
// EffectChange key autocomplete options

export const EFFECT_CHANGE_KEY_OPTIONS: string[] = [
  "bonuses.accuracy.all",
  "bonuses.accuracy.melee",
  "bonuses.accuracy.ranged",
  "bonuses.accuracy.magic",
  "bonuses.damage.all",
  "bonuses.damage.melee",
  "bonuses.damage.ranged",
  "bonuses.damage.spell",
  "bonuses.incomingDamage.all",
  "bonuses.incomingDamage.physical",
  "bonuses.incomingDamage.fire",
  "bonuses.incomingDamage.ice",
  "bonuses.incomingDamage.wind",
  "bonuses.incomingDamage.earth",
  "bonuses.incomingDamage.lightning",
  "bonuses.incomingDamage.dark",
  "bonuses.incomingDamage.light",
  "bonuses.incomingDamage.poison",
  "bonuses.incomingLoss.hp",
  "bonuses.incomingLoss.mp",
  "bonuses.incomingLoss.ip",
  "bonuses.incomingRecovery.hp",
  "bonuses.incomingRecovery.mp",
  "bonuses.incomingRecovery.ip",
  "bonuses.outgoingRecovery.hp",
  "bonuses.outgoingRecovery.mp",
  "bonuses.outgoingRecovery.ip",
  "multipliers.incomingLoss.hp",
  "multipliers.incomingLoss.mp",
  "multipliers.incomingLoss.ip",
  "multipliers.incomingRecovery.hp",
  "multipliers.incomingRecovery.mp",
  "multipliers.incomingRecovery.ip",
  "multipliers.outgoingRecovery.hp",
  "multipliers.outgoingRecovery.mp",
  "multipliers.outgoingRecovery.ip",
];

const EFFECT_MODE_OPTIONS = [
  { value: 0, label: "effect.mode.override" },
  { value: 1, label: "effect.mode.multiply" },
  { value: 2, label: "effect.mode.add" },
  { value: 3, label: "effect.mode.downgrade" },
  { value: 4, label: "effect.mode.upgrade" },
  { value: 5, label: "effect.mode.custom" },
];
// EffectChange row fields (used inside Passive.changes object-list)

function makeEffectChangeRowFields(
  keyOptions: string[],
): ItemFieldConfig<Record<string, unknown>> {
  return [
    {
      key: "key",
      kind: "editable",
      label: "behavior.change.key",
      component: "autocomplete",
      defaultValue: "",
      order: 0,
      gridSize: "grow",
      componentProps: {
        options: keyOptions,
        freeSolo: true,
        ...(keyOptions.length === 0
          ? { noOptionsText: "No stat keys available for this type" }
          : {}),
      },
    },
    {
      key: "mode",
      kind: "editable",
      label: "behavior.change.mode",
      component: "select",
      defaultValue: 2,
      order: 1,
      gridSize: 4,
      componentProps: { options: EFFECT_MODE_OPTIONS },
      parse: (v) => Number(v),
    },
    {
      key: "value",
      kind: "editable",
      label: "behavior.change.value",
      component: "text",
      defaultValue: "0",
      order: 2,
      gridSize: 4,
    },
  ];
}

// Backwards-compat export: actor-scoped keys (transfer=true context)
export const effectChangeRowFields = makeEffectChangeRowFields(
  EFFECT_CHANGE_KEY_OPTIONS,
);

export const BLANK_EFFECT_CHANGE = { key: "", mode: 2, value: "0" };
// Group keys for behavior/passive sections

export const BEHAVIOR_GROUPS = {
  trigger: "behavior-trigger",
  selfEffects: "behavior-self-effects",
  appliesEffect: "behavior-applies",
  afterEffects: "behavior-after-effects",
} as const;

export const PASSIVE_GROUPS = {
  core: "passive-core",
  duration: "passive-duration",
  changes: "passive-changes",
} as const;
// Passive row fields (used inside the top-level passives object-list)

const EFFECT_DURATION_EVENT_OPTIONS = [
  { value: "none", label: "effect.duration.none" },
  { value: "rest", label: "effect.duration.rest" },
  { value: "end-of-scene", label: "effect.duration.end-of-scene" },
  { value: "start-of-turn", label: "effect.duration.start-of-turn" },
  { value: "end-of-turn", label: "effect.duration.end-of-turn" },
  { value: "end-of-round", label: "effect.duration.end-of-round" },
];

const EFFECT_TRACKING_OPTIONS = [
  { value: "self", label: "effect.tracking.self" },
  { value: "source", label: "effect.tracking.source" },
];

const CRISIS_INTERACTION_OPTIONS = [
  { value: "none", label: "effect.crisis.none" },
  { value: "active", label: "effect.crisis.active" },
  { value: "inactive", label: "effect.crisis.inactive" },
];

function makePassiveRowFields(
  itemScopedKeys: string[],
): ItemFieldConfig<Record<string, unknown>> {
  const actorChangeFields = makeEffectChangeRowFields(
    EFFECT_CHANGE_KEY_OPTIONS,
  );
  const itemChangeFields = makeEffectChangeRowFields(itemScopedKeys);
  return [
    {
      key: "id",
      kind: "form-state",
      label: "passive.id",
      defaultValue: "",
      order: -1,
    },
    {
      key: "name",
      kind: "editable",
      label: "passive.name",
      component: "text",
      defaultValue: "",
      order: 0,
      group: PASSIVE_GROUPS.core,
      gridSize: 12,
      validationHints: { required: true },
    },
    {
      key: "description",
      kind: "editable",
      label: "passive.description",
      component: "textarea",
      defaultValue: "",
      order: 1,
      group: PASSIVE_GROUPS.core,
      gridSize: 12,
    },
    {
      key: "transfer",
      kind: "editable",
      label: "passive.transfer",
      component: "checkbox",
      defaultValue: false,
      order: 1,
      group: PASSIVE_GROUPS.core,
      gridSize: 4,
    },
    {
      key: "disabled",
      kind: "editable",
      label: "passive.disabled",
      component: "checkbox",
      defaultValue: false,
      order: 2,
      group: PASSIVE_GROUPS.core,
      gridSize: 4,
    },
    {
      key: "duration.event",
      kind: "editable",
      label: "passive.duration",
      component: "select",
      defaultValue: "none",
      order: 3,
      group: PASSIVE_GROUPS.duration,
      gridSize: 6,
      componentProps: { options: EFFECT_DURATION_EVENT_OPTIONS },
    },
    {
      key: "duration.tracking",
      kind: "editable",
      label: "passive.tracking",
      component: "select",
      defaultValue: "self",
      order: 4,
      group: PASSIVE_GROUPS.duration,
      gridSize: 6,
      componentProps: { options: EFFECT_TRACKING_OPTIONS },
      dependencies: (s) => {
        const event = (s as { duration?: { event?: string } }).duration?.event;
        return (
          event === "start-of-turn" ||
          event === "end-of-turn" ||
          event === "end-of-round"
        );
      },
    },
    {
      key: "predicate.crisisInteraction",
      kind: "editable",
      label: "passive.crisisInteraction",
      component: "select",
      defaultValue: "none",
      order: 5,
      group: PASSIVE_GROUPS.duration,
      gridSize: 6,
      componentProps: { options: CRISIS_INTERACTION_OPTIONS },
    },
    // transfer=true: suggest actor-level stat keys
    {
      key: "changes",
      kind: "editable",
      label: "passive.changes",
      component: "object-list",
      defaultValue: [],
      order: 6,
      group: PASSIVE_GROUPS.changes,
      gridSize: 12,
      dependencies: (s) => s.transfer === true,
      componentProps: {
        fields: actorChangeFields,
        itemDefaults: { ...BLANK_EFFECT_CHANGE },
        addLabel: "passive.addChange",
        rowLabel: (_row: Record<string, unknown>, i: number) =>
          `Change ${i + 1}`,
      },
    },
    // transfer=false: suggest item-scoped keys
    {
      key: "changes",
      kind: "editable",
      label: "passive.changes",
      component: "object-list",
      defaultValue: [],
      order: 6,
      group: PASSIVE_GROUPS.changes,
      gridSize: 12,
      dependencies: (s) => s.transfer !== true,
      componentProps: {
        fields: itemChangeFields,
        itemDefaults: { ...BLANK_EFFECT_CHANGE },
        addLabel: "passive.addChange",
        rowLabel: (_row: Record<string, unknown>, i: number) =>
          `Change ${i + 1}`,
      },
    },
  ];
}

// Backwards-compat export: actor-scoped keys only (no item scope)
export const passiveRowFields = makePassiveRowFields([]);

/** @deprecated Use passiveRowFields */
export const itemEffectRowFields = passiveRowFields;

export const BLANK_PASSIVE = () => ({
  id: crypto.randomUUID(),
  name: "",
  transfer: false,
  disabled: false,
  changes: [],
  duration: { event: "none" },
  predicate: { crisisInteraction: "none" },
});

/** @deprecated Use BLANK_PASSIVE */
export const BLANK_ITEM_EFFECT = BLANK_PASSIVE;
// AfterEffect row fields

const AFTER_EFFECT_RESOURCE_OPTIONS = [
  { value: "hp", label: "resource.hp" },
  { value: "mp", label: "resource.mp" },
  { value: "ip", label: "resource.ip" },
];

const AFTER_EFFECT_DIRECTION_OPTIONS = [
  { value: "loss", label: "afterEffect.direction.loss" },
  { value: "recovery", label: "afterEffect.direction.recovery" },
];

const AFTER_EFFECT_AMOUNT_OPTIONS = [
  { value: "__fixed__", label: "afterEffect.amount.fixed" },
  { value: "half-damage", label: "afterEffect.amount.half-damage" },
  { value: "half-loss", label: "afterEffect.amount.half-loss" },
  { value: "__expr__", label: "afterEffect.amount.expr" },
];

const AFTER_EFFECT_TARGET_OPTIONS = [
  { value: "self", label: "afterEffect.target.self" },
  { value: "targets", label: "afterEffect.target.targets" },
  { value: "cover-target", label: "afterEffect.target.cover-target" },
];

export const afterEffectRowFields: ItemFieldConfig<Record<string, unknown>> = [
  {
    key: "resource",
    kind: "editable",
    label: "behavior.afterEffect.resource",
    component: "select",
    defaultValue: "hp",
    order: 0,
    gridSize: 4,
    componentProps: { options: AFTER_EFFECT_RESOURCE_OPTIONS },
  },
  {
    key: "direction",
    kind: "editable",
    label: "behavior.afterEffect.direction",
    component: "select",
    defaultValue: "loss",
    order: 1,
    gridSize: 4,
    componentProps: { options: AFTER_EFFECT_DIRECTION_OPTIONS },
  },
  {
    // Persists the amount selector state: "__fixed__", "__expr__", "half-damage", "half-loss"
    key: "_amountKind",
    kind: "form-state",
    label: "behavior.afterEffect.amountKind",
    defaultValue: "__fixed__",
    order: 2,
  },
  {
    key: "_amountKindSelect",
    kind: "editable",
    label: "behavior.afterEffect.amount",
    component: "select",
    defaultValue: "__fixed__",
    order: 2,
    gridSize: 4,
    componentProps: { options: AFTER_EFFECT_AMOUNT_OPTIONS },
    onChangeEffects: {
      _amountKind: (s) => s._amountKindSelect,
      amount: (s) => {
        const kind = s._amountKindSelect as string;
        if (kind === "__fixed__") return 0;
        if (kind === "__expr__") return { expr: "$sl" };
        return kind; // "half-damage" | "half-loss"
      },
    },
  },
  {
    key: "_amountFixed",
    kind: "editable",
    label: "behavior.afterEffect.amountValue",
    component: "number",
    defaultValue: 0,
    order: 3,
    gridSize: 4,
    parse: (v) => Number(v) || 0,
    validationHints: { min: 0 },
    dependencies: (s) => s._amountKind === "__fixed__",
    onChangeEffects: {
      amount: (s) => Number(s._amountFixed) || 0,
    },
  },
  {
    key: "_amountExpr",
    kind: "editable",
    label: "behavior.afterEffect.amountExpr",
    component: "text",
    defaultValue: "$sl",
    order: 3,
    gridSize: 8,
    dependencies: (s) => s._amountKind === "__expr__",
    onChangeEffects: {
      amount: (s) => ({ expr: String(s._amountExpr || "$sl") }),
    },
  },
  {
    // Canonical amount written to payload - not shown directly
    key: "amount",
    kind: "form-state",
    label: "behavior.afterEffect.amountCanonical",
    defaultValue: 0,
    order: 99,
  },
  {
    key: "target",
    kind: "editable",
    label: "behavior.afterEffect.target",
    component: "select",
    defaultValue: "targets",
    order: 4,
    gridSize: 4,
    componentProps: { options: AFTER_EFFECT_TARGET_OPTIONS },
  },
  {
    key: "predicate.crisisInteraction",
    kind: "editable",
    label: "behavior.afterEffect.crisisInteraction",
    component: "select",
    defaultValue: "none",
    order: 5,
    gridSize: 6,
    componentProps: { options: CRISIS_INTERACTION_OPTIONS },
  },
];

export const BLANK_AFTER_EFFECT = {
  resource: "hp",
  direction: "loss",
  _amountKind: "__fixed__",
  _amountKindSelect: "__fixed__",
  _amountFixed: 0,
  _amountExpr: "$sl",
  amount: 0,
  target: "targets",
  predicate: { crisisInteraction: "none" },
};
// AppliesEffect fields (relative keys - used inside a behavior row)

const APPLIES_EFFECT_TARGET_OPTIONS = [
  { value: "single", label: "appliesEffect.target.single" },
  { value: "all", label: "appliesEffect.target.all" },
  { value: "self", label: "appliesEffect.target.self" },
  { value: "cover-target", label: "appliesEffect.target.cover-target" },
];

export const appliesEffectRowFields: ItemFieldConfig<Record<string, unknown>> =
  [
    {
      key: "appliesEffect.label",
      kind: "editable",
      label: "behavior.appliesEffect.label",
      component: "text",
      defaultValue: "",
      order: 0,
      gridSize: 12,
    },
    {
      key: "appliesEffect.target",
      kind: "editable",
      label: "behavior.appliesEffect.target",
      component: "select",
      defaultValue: "single",
      order: 1,
      gridSize: 4,
      componentProps: { options: APPLIES_EFFECT_TARGET_OPTIONS },
    },
    {
      key: "appliesEffect.duration.event",
      kind: "editable",
      label: "behavior.appliesEffect.duration",
      component: "select",
      defaultValue: "none",
      order: 2,
      gridSize: 6,
      componentProps: { options: EFFECT_DURATION_EVENT_OPTIONS },
    },
    {
      key: "appliesEffect.duration.tracking",
      kind: "editable",
      label: "behavior.appliesEffect.tracking",
      component: "select",
      defaultValue: "self",
      order: 3,
      gridSize: 6,
      componentProps: { options: EFFECT_TRACKING_OPTIONS },
      dependencies: (s) => {
        const ae = s.appliesEffect as
          | { duration?: { event?: string } }
          | undefined;
        const event = ae?.duration?.event;
        return (
          event === "start-of-turn" ||
          event === "end-of-turn" ||
          event === "end-of-round"
        );
      },
    },
    {
      key: "appliesEffect.predicate.crisisInteraction",
      kind: "editable",
      label: "behavior.appliesEffect.crisisInteraction",
      component: "select",
      defaultValue: "none",
      order: 4,
      gridSize: 6,
      componentProps: { options: CRISIS_INTERACTION_OPTIONS },
    },
    {
      key: "appliesEffect.changes",
      kind: "editable",
      label: "behavior.appliesEffect.changes",
      component: "object-list",
      defaultValue: [],
      order: 5,
      gridSize: 12,
      componentProps: {
        fields: effectChangeRowFields,
        itemDefaults: { ...BLANK_EFFECT_CHANGE },
        addLabel: "behavior.addChange",
        rowLabel: (_row: Record<string, unknown>, i: number) =>
          `Change ${i + 1}`,
      },
    },
  ];

/** @deprecated Use appliesEffectRowFields (scoped to behavior row) */
export const appliesEffectFields = appliesEffectRowFields;
// ActionTrigger row fields (relative keys - used inside a behavior row)

const TRIGGER_KIND_OPTIONS = [
  { value: "none", label: "trigger.kind.none" },
  { value: "active", label: "trigger.kind.active" },
  { value: "chat-action", label: "trigger.kind.chat-action" },
  { value: "reactive", label: "trigger.kind.reactive" },
  { value: "combat-start", label: "trigger.kind.combat-start" },
  { value: "on-hit", label: "trigger.kind.on-hit" },
  { value: "on-damage-taken", label: "trigger.kind.on-damage-taken" },
];

const TRIGGER_ACTION_OPTIONS = [
  { value: "guard", label: "trigger.action.guard" },
  { value: "attack", label: "trigger.action.attack" },
  { value: "spell", label: "trigger.action.spell" },
  { value: "equipment", label: "trigger.action.equipment" },
];

const GUARD_VARIANT_OPTIONS = [
  { value: "", label: "trigger.guardVariant.either" },
  { value: "cover", label: "trigger.guardVariant.cover" },
  { value: "no-cover", label: "trigger.guardVariant.no-cover" },
];

const REACTIVE_EVENT_OPTIONS = [
  { value: "ally-targeted", label: "trigger.event.ally-targeted" },
];

const COOLDOWN_OPTIONS = [
  { value: "", label: "trigger.cooldown.none" },
  { value: "until-next-turn", label: "trigger.cooldown.until-next-turn" },
  { value: "until-next-round", label: "trigger.cooldown.until-next-round" },
];

export const actionTriggerRowFields: ItemFieldConfig<Record<string, unknown>> =
  [
    {
      // "none" means trigger is undefined in payload
      key: "_triggerKind",
      kind: "editable",
      label: "behavior.trigger.kind",
      component: "select",
      defaultValue: "none",
      order: 0,
      gridSize: 6,
      componentProps: { options: TRIGGER_KIND_OPTIONS },
      onChangeEffects: {
        trigger: (s) => {
          const kind = s._triggerKind as string;
          if (kind === "none") return undefined;
          if (kind === "active") return { kind: "active" };
          if (kind === "combat-start") return { kind: "combat-start" };
          if (kind === "on-damage-taken") return { kind: "on-damage-taken" };
          if (kind === "chat-action")
            return { kind: "chat-action", action: "attack" };
          if (kind === "reactive")
            return { kind: "reactive", event: "ally-targeted" };
          if (kind === "on-hit") return { kind: "on-hit" };
          return undefined;
        },
      },
    },
    {
      key: "trigger.action",
      kind: "editable",
      label: "behavior.trigger.action",
      component: "select",
      defaultValue: "attack",
      order: 1,
      gridSize: 6,
      componentProps: { options: TRIGGER_ACTION_OPTIONS },
      dependencies: (s) => s._triggerKind === "chat-action",
    },
    {
      key: "trigger.condition.guardVariant",
      kind: "editable",
      label: "behavior.trigger.guardVariant",
      component: "select",
      defaultValue: "",
      order: 2,
      gridSize: 6,
      componentProps: { options: GUARD_VARIANT_OPTIONS },
      dependencies: (s) =>
        s._triggerKind === "chat-action" &&
        (s.trigger as { action?: string } | undefined)?.action === "guard",
    },
    {
      key: "trigger.event",
      kind: "editable",
      label: "behavior.trigger.event",
      component: "select",
      defaultValue: "ally-targeted",
      order: 1,
      gridSize: 6,
      componentProps: { options: REACTIVE_EVENT_OPTIONS },
      dependencies: (s) => s._triggerKind === "reactive",
    },
    {
      key: "trigger.cooldown",
      kind: "editable",
      label: "behavior.trigger.cooldown",
      component: "select",
      defaultValue: "",
      order: 2,
      gridSize: 6,
      componentProps: { options: COOLDOWN_OPTIONS },
      dependencies: (s) => s._triggerKind === "reactive",
    },
    {
      key: "trigger.condition.singleTarget",
      kind: "editable",
      label: "behavior.trigger.singleTarget",
      component: "checkbox",
      defaultValue: false,
      order: 1,
      gridSize: 6,
      dependencies: (s) => s._triggerKind === "on-hit",
    },
    {
      key: "trigger.condition.targetHasStatusEffects",
      kind: "editable",
      label: "behavior.trigger.targetHasStatusEffects",
      component: "checkbox",
      defaultValue: false,
      order: 2,
      gridSize: 6,
      dependencies: (s) => s._triggerKind === "on-hit",
    },
  ];

/** @deprecated Use actionTriggerRowFields (scoped to behavior row) */
export const actionTriggerFields = actionTriggerRowFields;
// Behavior row fields (id + name + trigger + appliesEffect + afterEffects)
// Used inside the top-level behaviors object-list.

export const behaviorRowFields: ItemFieldConfig<Record<string, unknown>> = [
  {
    key: "id",
    kind: "form-state",
    label: "behavior.id",
    defaultValue: "",
    order: -1,
  },
  {
    key: "name",
    kind: "editable",
    label: "behavior.name",
    component: "text",
    defaultValue: "",
    order: 0,
    group: BEHAVIOR_GROUPS.selfEffects,
    gridSize: 12,
    validationHints: { required: true },
  },
  {
    key: "description",
    kind: "editable",
    label: "behavior.description",
    component: "textarea",
    defaultValue: "",
    order: 1,
    group: BEHAVIOR_GROUPS.selfEffects,
    gridSize: 12,
  },
  ...actionTriggerRowFields.map((f) => ({
    ...f,
    order: (f.order ?? 0) + 10,
    group: BEHAVIOR_GROUPS.trigger,
  })),
  {
    key: "chatOutput.text",
    kind: "editable",
    label: "behavior.chatOutput.text",
    component: "textarea",
    defaultValue: "",
    order: 99,
    group: BEHAVIOR_GROUPS.selfEffects,
    gridSize: 12,
    dependencies: (s) =>
      (s._triggerKind as string | undefined) !== "none" &&
      (s._triggerKind as string | undefined) != null,
  },
  ...appliesEffectRowFields.map((f) => ({
    ...f,
    order: (f.order ?? 0) + 100,
    group: BEHAVIOR_GROUPS.appliesEffect,
  })),
  {
    key: "afterEffects",
    kind: "editable",
    label: "behavior.afterEffects",
    component: "object-list",
    defaultValue: [],
    order: 200,
    group: BEHAVIOR_GROUPS.afterEffects,
    gridSize: 12,
    componentProps: {
      fields: afterEffectRowFields,
      itemDefaults: { ...BLANK_AFTER_EFFECT },
      addLabel: "behavior.addAfterEffect",
      rowLabel: (row: Record<string, unknown>, i: number) => {
        const r = row.resource as string | undefined;
        const d = row.direction as string | undefined;
        return r && d ? `${d} ${r.toUpperCase()}` : `After Effect ${i + 1}`;
      },
    },
  },
];

export const BLANK_BEHAVIOR = () => ({
  id: crypto.randomUUID(),
  name: "",
  _triggerKind: "none",
});

export const behaviorGroupLabels: Record<string, string> = {
  [BEHAVIOR_GROUPS.trigger]: "behavior.trigger.action",
  [BEHAVIOR_GROUPS.selfEffects]: "behavior.effects",
  [BEHAVIOR_GROUPS.appliesEffect]: "behavior.appliesEffect.label",
  [BEHAVIOR_GROUPS.afterEffects]: "behavior.afterEffects",
};

export const passiveGroupLabels: Record<string, string> = {
  [PASSIVE_GROUPS.core]: "section.core",
  [PASSIVE_GROUPS.duration]: "passive.duration",
  [PASSIVE_GROUPS.changes]: "passive.changes",
};
// Passives tab field (shared by all item types)

export function makePassivesTabField(
  itemScopedKeys:
    | string[]
    | ((outerState: Record<string, unknown>) => string[]),
): FieldConfig<Record<string, unknown>> {
  const staticFields =
    typeof itemScopedKeys === "function"
      ? null
      : makePassiveRowFields(itemScopedKeys);
  const shared = {
    itemDefaults: BLANK_PASSIVE,
    addLabel: "passive.add",
    variant: "behavior-card",
    groupLabels: passiveGroupLabels,
    rowLabel: (row: Record<string, unknown>) =>
      typeof row.name === "string" && row.name ? row.name : "Passive",
  };
  return {
    key: "passives",
    kind: "editable",
    label: "passive.list",
    component: "object-list",
    tab: PASSIVES_TAB_KEY,
    defaultValue: [],
    order: 0,
    gridSize: 12,
    componentProps:
      typeof itemScopedKeys === "function"
        ? (outerState: Record<string, unknown>) => ({
            ...shared,
            fields: makePassiveRowFields(itemScopedKeys(outerState)),
          })
        : { ...shared, fields: staticFields! },
  };
}

export const passivesTabField = makePassivesTabField([]);
// Behaviors tab field (shared by all item types)

export const behaviorsTabField: FieldConfig<Record<string, unknown>> = {
  key: "behaviors",
  kind: "editable",
  label: "behavior.list",
  component: "object-list",
  tab: BEHAVIORS_TAB_KEY,
  defaultValue: [],
  order: 0,
  gridSize: 12,
  componentProps: {
    fields: behaviorRowFields,
    itemDefaults: BLANK_BEHAVIOR,
    addLabel: "behavior.add",
    variant: "behavior-card",
    groupLabels: behaviorGroupLabels,
    rowLabel: (row: Record<string, unknown>) =>
      typeof row.name === "string" && row.name ? row.name : "Behavior",
  },
};
// Legacy exports - kept for existing item configs during migration

/** @deprecated Item configs now use passivesTabField + behaviorsTabField directly */
export const behaviorGroupFields: FieldConfig<Record<string, unknown>>[] = [
  { ...passivesTabField, tab: BEHAVIOR_TAB_KEY },
  { ...behaviorsTabField, tab: BEHAVIOR_TAB_KEY },
];

/** @deprecated Item configs now use passivesTabField + behaviorsTabField directly */
export const passiveEffectsGroupFields: FieldConfig<Record<string, unknown>>[] =
  [
    { ...passivesTabField, tab: BEHAVIOR_TAB_KEY },
    { ...behaviorsTabField, tab: BEHAVIOR_TAB_KEY },
  ];
