import { z } from "zod";
import { MetaSchema } from "../meta";
import { SkillSchema, HeroicSkillSchema } from "./class";
import { PlayerSpellSchema } from "./spells";

export const MnemosphereSchema = z.looseObject({
  itemType: z.literal("mnemosphere").default("mnemosphere"),
  id: z.string().optional(),
  fuid: z.string().optional(),
  name: z.string().min(1),
  class: z.string().optional(),
  lvl: z.number().int().optional(),
  cost: z.number().int().nonnegative().optional(),
  skills: z.array(SkillSchema).optional(),
  heroic: z.array(HeroicSkillSchema).optional(),
  spells: z.array(PlayerSpellSchema).optional(),
  meta: MetaSchema.optional(),
});

export type Mnemosphere = z.infer<typeof MnemosphereSchema>;
