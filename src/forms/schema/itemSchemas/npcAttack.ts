import { z } from "zod";

const AccuracySchema = z.object({
  attr1: z.string(),
  attr2: z.string(),
  value: z.number().int(),
  defense: z.enum(["def", "mdef"]).default("def"),
});

const DamageSchema = z.object({
  value: z.number().int(),
  type: z.string(),
  hrZero: z.boolean().default(false),
});

export const NpcAttackSchema = z.object({
  itemType: z.literal("basic"),
  name: z.string().min(1),
  fuid: z.string().optional(),
  range: z.enum(["melee", "ranged"]),
  accuracy: AccuracySchema,
  damage: DamageSchema,
  martial: z.boolean().default(false),
  category: z.string().default("Melee Attack"),
  special: z.array(z.string()).default([]),
});

export type NpcAttack = z.infer<typeof NpcAttackSchema>;
