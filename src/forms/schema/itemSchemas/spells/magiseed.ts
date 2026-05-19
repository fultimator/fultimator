import { z } from "zod";
import { PlayerSpellNonStaticBaseSchema } from "./shared";

const MagiseedItemSchema = z.object({
  name: z.string(),
  customName: z.string().default(""),
  description: z.string().default(""),
  rangeStart: z.number().int().default(0),
  rangeEnd: z.number().int().default(3),
  effects: z.record(z.string(), z.unknown()).default({}),
});

export const PlayerSpellMagiseedSchema = PlayerSpellNonStaticBaseSchema.extend({
  spellType: z.literal("magiseed"),
  growthClock: z.number().int().default(0),
  gardenDescription: z.string().default(""),
  currentMagiseed: z.string().nullable().default(null),
  magiseeds: z.array(MagiseedItemSchema).default([]),
});
