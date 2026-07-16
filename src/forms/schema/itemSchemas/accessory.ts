import { z } from "zod";
import { MetaSchema } from "../meta";
import { BehaviorSchema } from "../shared/behaviorSchemas";

export const AccessoryModifiersSchema = z.object({
  def: z.number().int().default(0),
  mdef: z.number().int().default(0),
  init: z.number().int().default(0),
  magic: z.number().int().default(0),
  accuracy: z.number().int().default(0),
  damageMelee: z.number().int().default(0),
  damageRanged: z.number().int().default(0),
});

export const AccessorySchema = z.object({
  id: z.string().optional(),
  itemType: z.literal("accessory"),
  name: z.string().min(1),
  description: z.string().optional(),
  quality: z.string().optional(),
  cost: z.number().int().nonnegative().optional(),
  meta: MetaSchema.optional(),
});

export type Accessory = z.infer<typeof AccessorySchema>;

export const AccessoryFormStateSchema = z.object({
  fuid: z.string().optional(),
  behaviors: z.array(BehaviorSchema).optional(),
  qualityCost: z.coerce.number().int().nonnegative().default(0),
  selectedQuality: z.string().optional(),
  modifiers: AccessoryModifiersSchema.optional(),
  defModifier: z.number().int().default(0),
  mDefModifier: z.number().int().default(0),
  initModifier: z.number().int().default(0),
  magicModifier: z.number().int().default(0),
  precModifier: z.number().int().default(0),
  damageMeleeModifier: z.number().int().default(0),
  damageRangedModifier: z.number().int().default(0),
  isEquipped: z.boolean().optional(),
});

export const AccessoryPersistedSchema = AccessorySchema.extend(
  AccessoryFormStateSchema.shape,
);
export type AccessoryPersisted = z.infer<typeof AccessoryPersistedSchema>;

export function validateAccessory(
  data: unknown,
): ReturnType<typeof AccessorySchema.safeParse> {
  return AccessorySchema.safeParse(data);
}

export function validateAccessoryPersisted(
  data: unknown,
): ReturnType<typeof AccessoryPersistedSchema.safeParse> {
  return AccessoryPersistedSchema.safeParse(data);
}

export function normalizeAccessory(data: unknown): Accessory {
  return AccessorySchema.parse(data);
}

export type AccessoryCtx = Record<string, never>;

export function buildAccessoryFormState(
  item?: Partial<AccessoryPersisted> | null,
): AccessoryPersisted {
  return {
    itemType: "accessory",
    id: item?.id,
    fuid: item?.fuid,
    meta: {
      isOfficial: false,
      ...(item?.meta ?? {}),
      book: item?.meta?.book ?? (item as { book?: string })?.book ?? "homebrew",
    },
    name: item?.name ?? "",
    quality: item?.quality ?? "",
    qualityCost: item?.qualityCost ?? 0,
    selectedQuality: item?.selectedQuality ?? "",
    cost: item?.cost ?? 0,
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

export function buildAccessorySavePayload(
  formState: AccessoryPersisted,
): AccessoryPersisted {
  const def = parseInt(String(formState.defModifier));
  const mdef = parseInt(String(formState.mDefModifier));
  const init = parseInt(String(formState.initModifier));
  const magic = parseInt(String(formState.magicModifier));
  const accuracy = parseInt(String(formState.precModifier));
  const damageMelee = parseInt(String(formState.damageMeleeModifier));
  const damageRanged = parseInt(String(formState.damageRangedModifier));
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
    defModifier: def,
    mDefModifier: mdef,
    initModifier: init,
    magicModifier: magic,
    precModifier: accuracy,
    damageMeleeModifier: damageMelee,
    damageRangedModifier: damageRanged,
  };
}
