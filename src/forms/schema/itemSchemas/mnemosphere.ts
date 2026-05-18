import { z } from "zod";
import { MetaSchema } from "../meta";

export const MnemosphereSchema = z.looseObject({
  fuid: z.string().optional(),
  name: z.string().min(1),
  class: z.string().optional(),
  lvl: z.number().int().optional(),
  cost: z.number().int().nonnegative().optional(),
  skills: z.array(z.unknown()).optional(),
  heroic: z.array(z.unknown()).optional(),
  spells: z.array(z.unknown()).optional(),
  meta: MetaSchema.optional(),
});

export type Mnemosphere = z.infer<typeof MnemosphereSchema>;
