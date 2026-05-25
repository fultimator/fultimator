import { z } from "zod";
import { MetaSchema } from "../meta";
import allArmor from "../../../libs/armor";
import { SLOT_TIERS } from "../../../components/player/equipment/technospheres/slotTiers";
import { PassiveSchema, BehaviorSchema } from "../shared/behaviorSchemas";

const SlotTierValues = ["alpha", "beta", "gamma", "delta"] as const;

export const ArmorModifiersSchema = z.object({
  def: z.number().int().default(0),
  mdef: z.number().int().default(0),
  init: z.number().int().default(0),
  magic: z.number().int().default(0),
  accuracy: z.number().int().default(0),
  damageMelee: z.number().int().default(0),
  damageRanged: z.number().int().default(0),
});

export const ArmorSchema = z.object({
  itemType: z.literal("armor"),
  name: z.string().min(1),
  description: z.string().optional(),
  martial: z.boolean().default(false),
  def: z.number().int().default(0),
  mdef: z.number().int().default(0),
  init: z.number().int().default(0),
  rework: z.boolean().default(false),
  quality: z.string().optional(),
  cost: z.number().int().nonnegative().optional(),
  modifiers: ArmorModifiersSchema.optional(),
  slots: z.enum(SlotTierValues).optional(),
  slotted: z.array(z.string()).optional(),
  meta: MetaSchema.optional(),
});

export type Armor = z.infer<typeof ArmorSchema>;

export const ArmorFormStateSchema = z.object({
  base: z.unknown().optional(),
  fuid: z.string().optional(),
  passives: z.array(PassiveSchema).optional(),
  behaviors: z.array(BehaviorSchema).optional(),
  qualityCost: z.coerce.number().int().nonnegative().default(0),
  selectedQuality: z.string().optional(),
  isSlotsVariant: z.boolean().default(false),
  defModifier: z.number().int().default(0),
  mDefModifier: z.number().int().default(0),
  initModifier: z.number().int().default(0),
  magicModifier: z.number().int().default(0),
  precModifier: z.number().int().default(0),
  damageMeleeModifier: z.number().int().default(0),
  damageRangedModifier: z.number().int().default(0),
  isEquipped: z.boolean().optional(),
});

export const ArmorPersistedSchema = ArmorSchema.extend(
  ArmorFormStateSchema.shape,
);
export type ArmorPersisted = z.infer<typeof ArmorPersistedSchema>;

export function validateArmor(
  data: unknown,
): ReturnType<typeof ArmorSchema.safeParse> {
  return ArmorSchema.safeParse(data);
}

export function validateArmorPersisted(
  data: unknown,
): ReturnType<typeof ArmorPersistedSchema.safeParse> {
  return ArmorPersistedSchema.safeParse(data);
}

export function normalizeArmor(data: unknown): Armor {
  return ArmorSchema.parse(data);
}

export interface ArmorCtx {
  player?: {
    settings?: {
      optionalRules?: {
        technospheres?: boolean;
        technospheresVariant?: string;
      };
    };
    info?: { zenit?: number };
    equipment?: Array<{
      hoplospheres?: Array<{ id: string; requiredSlots?: number }>;
    }>;
  };
  setPlayer?: (updater: (prev: unknown) => unknown) => void;
}

export function resolveArmorSlotsVariant(ctx?: ArmorCtx): boolean {
  const rules = ctx?.player?.settings?.optionalRules;
  return (
    (rules?.technospheres ?? false) &&
    (rules?.technospheresVariant ?? "standard") !== "mnemospheres"
  );
}

export function buildArmorFormState(
  item?: Partial<ArmorPersisted> | null,
  ctx?: ArmorCtx,
): ArmorPersisted {
  const isSlotsVariant = resolveArmorSlotsVariant(ctx);
  const base = (item?.base as (typeof allArmor)[0] | undefined) ?? allArmor[0];
  return {
    itemType: "armor",
    base,
    fuid: item?.fuid,
    meta: {
      isOfficial: false,
      ...(item?.meta ?? {}),
      book: item?.meta?.book ?? (item as { book?: string })?.book ?? "homebrew",
    },
    name: item?.name ?? base.name,
    martial: item?.martial ?? base.martial,
    def: item?.def ?? base.def,
    mdef: item?.mdef ?? base.mdef,
    init: item?.init ?? base.init,
    rework: item?.rework ?? false,
    quality: item?.quality ?? "",
    qualityCost: item?.qualityCost ?? 0,
    selectedQuality: item?.selectedQuality ?? "",
    isSlotsVariant,
    slots: item?.slots ?? "alpha",
    slotted: item?.slotted ?? [],
    cost: item?.cost ?? (base as { cost?: number }).cost,
    defModifier: item?.modifiers?.def ?? item?.defModifier ?? 0,
    mDefModifier: item?.modifiers?.mdef ?? item?.mDefModifier ?? 0,
    initModifier: item?.modifiers?.init ?? item?.initModifier ?? 0,
    magicModifier: item?.modifiers?.magic ?? item?.magicModifier ?? 0,
    precModifier: item?.modifiers?.accuracy ?? item?.precModifier ?? 0,
    damageMeleeModifier: item?.damageMeleeModifier ?? 0,
    damageRangedModifier: item?.damageRangedModifier ?? 0,
    isEquipped: item?.isEquipped ?? false,
  };
}

export function buildArmorSavePayload(
  formState: ArmorPersisted,
  originalItem?: Partial<ArmorPersisted> | null,
): ArmorPersisted {
  const def = parseInt(String(formState.defModifier));
  const mdef = parseInt(String(formState.mDefModifier));
  const init = parseInt(String(formState.initModifier));
  const magic = parseInt(String(formState.magicModifier));
  const accuracy = parseInt(String(formState.precModifier));
  const damageMelee = parseInt(String(formState.damageMeleeModifier));
  const damageRanged = parseInt(String(formState.damageRangedModifier));
  const base = formState.base as { def?: number; mdef?: number } | undefined;
  return {
    ...formState,
    modifiers: {
      ...(formState.modifiers ?? {}),
      def,
      mdef,
      init,
      magic,
      accuracy,
      damageMelee,
      damageRanged,
    },
    def: base?.def ?? formState.def,
    mdef: base?.mdef ?? formState.mdef,
    defModifier: def,
    mDefModifier: mdef,
    initModifier: init,
    magicModifier: magic,
    precModifier: accuracy,
    damageMeleeModifier: damageMelee,
    damageRangedModifier: damageRanged,
    isEquipped:
      (originalItem?.martial ?? false) !== formState.martial
        ? false
        : formState.isEquipped,
    ...(formState.isSlotsVariant || originalItem?.slots || originalItem?.slotted
      ? { slots: formState.slots, slotted: formState.slotted }
      : {}),
  };
}

export function applyArmorSlotTierChange(
  formState: ArmorPersisted,
  newTier: string,
  ctx?: ArmorCtx,
): ArmorPersisted {
  const tier = SLOT_TIERS.find((t) => t.value === newTier);
  const hoplospheres = ctx?.player?.equipment?.[0]?.hoplospheres ?? [];
  const kept: string[] = [];
  let used = 0;
  for (const id of formState.slotted ?? []) {
    const hoplo = hoplospheres.find((h) => h.id === id);
    const slotCost = hoplo?.requiredSlots ?? 1;
    if (used + slotCost <= (tier?.slots ?? 1)) {
      kept.push(id);
      used += slotCost;
    }
  }
  return {
    ...formState,
    slots: newTier as ArmorPersisted["slots"],
    slotted: kept,
  };
}

export function getArmorSlotCostInfo(
  formState: ArmorPersisted,
  originalItem?: Partial<ArmorPersisted> | null,
  ctx?: ArmorCtx,
): { delta: number; currentZenit: number; cannotAfford: boolean } | null {
  if (!formState.isSlotsVariant) return null;
  const paidSlots = originalItem?.slots ?? "alpha";
  const paidTier =
    SLOT_TIERS.find((t) => t.value === paidSlots) ?? SLOT_TIERS[0];
  const selectedTier =
    SLOT_TIERS.find((t) => t.value === formState.slots) ?? SLOT_TIERS[0];
  const delta = selectedTier.cost - paidTier.cost;
  const currentZenit = ctx?.player?.info?.zenit ?? 0;
  return { delta, currentZenit, cannotAfford: delta > currentZenit };
}

export function applyArmorZenitSideEffect(
  formState: ArmorPersisted,
  originalItem?: Partial<ArmorPersisted> | null,
  ctx?: ArmorCtx,
): void {
  const info = getArmorSlotCostInfo(formState, originalItem, ctx);
  if (!info || info.delta === 0 || !ctx?.setPlayer) return;
  ctx.setPlayer((prev: unknown) => {
    const p = prev as { info?: { zenit?: number } };
    return {
      ...p,
      info: {
        ...p.info,
        zenit: Math.max(0, (p.info?.zenit ?? 0) - info.delta),
      },
    };
  });
}
