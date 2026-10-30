import { z } from "zod";
import { PlayerSpellNonStaticBaseSchema } from "./shared";

const MagichantKeyItemSchema = z.object({
  key: z.string(),
  customName: z.string().default(""),
  type: z.string().default(""),
  status: z.string().default(""),
  attribute: z.string().default(""),
  recovery: z.string().default(""),
});

const MagichantToneItemSchema = z.object({
  key: z.string(),
  customName: z.string().default(""),
  effect: z.string().default(""),
});

export const PlayerSpellMagichantSchema = PlayerSpellNonStaticBaseSchema.extend(
  {
    spellType: z.literal("magichant"),
    keys: z.array(MagichantKeyItemSchema).default([]),
    tones: z.array(MagichantToneItemSchema).default([]),
  },
);
