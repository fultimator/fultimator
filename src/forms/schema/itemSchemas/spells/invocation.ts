import { z } from "zod";
import { PlayerSpellNonStaticBaseSchema } from "./shared";

const InvocationItemSchema = z.object({
  fuid: z.string().optional(),
  name: z.string(),
  customName: z.string().default(""),
  type: z.string().default(""),
  effect: z.string().default(""),
  wellspring: z.string().default(""),
});

export const PlayerSpellInvocationSchema =
  PlayerSpellNonStaticBaseSchema.extend({
    spellType: z.literal("invocation"),
    spellName: z.string().default("Invocation"),
    activeWellsprings: z.array(z.string()).default([]),
    chosenWellspring: z.string().nullable().default(null),
    innerWellspring: z.boolean().default(false),
    invocations: z.array(InvocationItemSchema).default([]),
  });
