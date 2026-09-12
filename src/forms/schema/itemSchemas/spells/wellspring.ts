import { z } from "zod";
import { PlayerSpellNonStaticBaseSchema } from "./shared";

export const PlayerSpellWellspringSchema =
  PlayerSpellNonStaticBaseSchema.extend({
    spellType: z.literal("wellspring"),
    color: z.string().default("#888888"),
    textColor: z.enum(["black", "white"]).default("white"),
    icon: z.string().default("untyped"),
  });
