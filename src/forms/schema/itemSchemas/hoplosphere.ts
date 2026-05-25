import { z } from "zod";
import { MetaSchema } from "../meta";
import { PassiveSchema, BehaviorSchema } from "../shared/behaviorSchemas";

export const HoplosphereSchema = z.object({
  itemType: z.literal("hoplosphere").default("hoplosphere"),
  name: z.string().min(1),
  fuid: z.string().optional(),
  description: z.string().default(""),
  requiredSlots: z.union([z.literal(1), z.literal(2)]),
  socketable: z.enum(["all", "weapon"]),
  cost: z.number().int().nonnegative(),
  coagEffects: z.record(z.string(), z.string()).default({}),
  meta: MetaSchema.optional(),
  passives: z.array(PassiveSchema).optional(),
  behaviors: z.array(BehaviorSchema).optional(),
});

export type Hoplosphere = z.infer<typeof HoplosphereSchema>;
