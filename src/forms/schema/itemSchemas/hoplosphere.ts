import { z } from "zod";

export const HoplosphereSchema = z.object({
  name: z.string().min(1),
  fuid: z.string().optional(),
  description: z.string().default(""),
  requiredSlots: z.union([z.literal(1), z.literal(2)]),
  socketable: z.enum(["all", "weapon"]),
  cost: z.number().int().nonnegative(),
  coagEffects: z.record(z.string()).default({}),
});

export type Hoplosphere = z.infer<typeof HoplosphereSchema>;
