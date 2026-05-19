import { z } from "zod";
import { PlayerSpellNonStaticBaseSchema } from "./shared";

const DanceItemSchema = z.object({
  name: z.string(),
  customName: z.string().default(""),
  effect: z.string().default(""),
  duration: z.string().default(""),
});

export const PlayerSpellDanceSchema = PlayerSpellNonStaticBaseSchema.extend({
  spellType: z.literal("dance"),
  dances: z.array(DanceItemSchema).default([]),
});
