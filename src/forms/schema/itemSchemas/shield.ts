import { z } from "zod";
import { MetaSchema } from "../meta";
import allShields from "../../../libs/shields";

export const ShieldModifiersSchema = z.object({
  def: z.number().int().default(0),
  mdef: z.number().int().default(0),
  init: z.number().int().default(0),
  magic: z.number().int().default(0),
  accuracy: z.number().int().default(0),
  damageMelee: z.number().int().default(0),
  damageRanged: z.number().int().default(0),
});

export const ShieldSchema = z.object({
  itemType: z.literal("shield"),
  name: z.string().min(1),
  description: z.string().optional(),
  book: z.string().default("homebrew"),
  martial: z.boolean().default(false),
  def: z.number().int().default(0),
  mdef: z.number().int().default(0),
  init: z.number().int().default(0),
  rework: z.boolean().default(false),
  quality: z.string().optional(),
  cost: z.number().int().nonnegative().optional(),
  modifiers: ShieldModifiersSchema.optional(),
  meta: MetaSchema.optional(),
});

export type Shield = z.infer<typeof ShieldSchema>;

export const ShieldFormStateSchema = z.object({
  base: z.unknown().optional(),
  fuid: z.string().optional(),
  qualityCost: z.coerce.number().int().nonnegative().default(0),
  selectedQuality: z.string().optional(),
  defModifier: z.number().int().default(0),
  mDefModifier: z.number().int().default(0),
  initModifier: z.number().int().default(0),
  magicModifier: z.number().int().default(0),
  precModifier: z.number().int().default(0),
  damageMeleeModifier: z.number().int().default(0),
  damageRangedModifier: z.number().int().default(0),
  isEquipped: z.boolean().optional(),
});

export const ShieldPersistedSchema = ShieldSchema.extend(
  ShieldFormStateSchema.shape,
);
export type ShieldPersisted = z.infer<typeof ShieldPersistedSchema>;

export function validateShield(
  data: unknown,
): ReturnType<typeof ShieldSchema.safeParse> {
  return ShieldSchema.safeParse(data);
}

export function validateShieldPersisted(
  data: unknown,
): ReturnType<typeof ShieldPersistedSchema.safeParse> {
  return ShieldPersistedSchema.safeParse(data);
}

export function normalizeShield(data: unknown): Shield {
  return ShieldSchema.parse(data);
}

export type ShieldCtx = Record<string, never>;

export function buildShieldFormState(item?: Partial<ShieldPersisted> | null): ShieldPersisted {
  const base = (item?.base as typeof allShields[0] | undefined) ?? allShields[0];
  return {
    itemType: "shield",
    base,
    fuid: item?.fuid,
    book: item?.book ?? "homebrew",
    name: item?.name ?? base.name,
    martial: item?.martial ?? base.martial,
    def: item?.def ?? base.def,
    mdef: item?.mdef ?? base.mdef,
    init: item?.init ?? base.init,
    rework: item?.rework ?? false,
    quality: item?.quality ?? "",
    qualityCost: item?.qualityCost ?? 0,
    selectedQuality: item?.selectedQuality ?? "",
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

export function buildShieldSavePayload(
  formState: ShieldPersisted,
  originalItem?: Partial<ShieldPersisted> | null,
): ShieldPersisted {
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
    modifiers: { ...(formState.modifiers ?? {}), def, mdef, init, magic, accuracy, damageMelee, damageRanged },
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
      (originalItem?.martial ?? false) !== formState.martial ? false : formState.isEquipped,
  };
}
