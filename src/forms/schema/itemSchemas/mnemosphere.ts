import { z } from "zod";

export const MnemosphereSchema = z.looseObject({
  fuid: z.string().optional(),
  name: z.string().min(1),
  class: z.string().optional(),
  lvl: z.number().int().optional(),
  cost: z.number().int().nonnegative().optional(),
  skills: z.array(z.unknown()).optional(),
  heroic: z.array(z.unknown()).optional(),
  spells: z.array(z.unknown()).optional(),
});

export type Mnemosphere = z.infer<typeof MnemosphereSchema>;
