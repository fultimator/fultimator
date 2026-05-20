import { z } from "zod";
import { PlayerSpellNonStaticBaseSchema } from "./shared";

const InvocationTrackerSchema = z.object({
  innerWellspring: z.boolean().default(false),
  chosenWellspring: z.string().nullable().default(null),
  activeWellsprings: z.array(z.string()).default([]),
});

const InvocationItemSchema = z.object({
  fuid: z.string().optional(),
  key: z.string(),
  customName: z.string().default(""),
  type: z.string().default(""),
  effect: z.string().default(""),
  wellspring: z.string().default(""),
});

export const PlayerSpellInvocationSchema =
  PlayerSpellNonStaticBaseSchema.extend({
    spellType: z.literal("invocation"),
    spellName: z.string().default("Invocation"),
    tracker: InvocationTrackerSchema.default(() => ({
      innerWellspring: false,
      chosenWellspring: null,
      activeWellsprings: [],
    })),
    invocations: z.array(InvocationItemSchema).default([]),
  });
