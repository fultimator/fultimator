import { z } from "zod";
import { PlayerSpellNonStaticBaseSchema } from "./shared";

const TherioformItemSchema = z.object({
  key: z.string(),
  customName: z.string().default(""),
  genoclepsis: z.string().default(""),
  description: z.string().default(""),
});

export const PlayerSpellTherioformSchema =
  PlayerSpellNonStaticBaseSchema.extend({
    spellType: z.literal("therioform"),
    therioforms: z.array(TherioformItemSchema).default([]),
  });
