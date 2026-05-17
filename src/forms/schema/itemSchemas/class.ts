import { z } from "zod";

const SkillSchema = z.looseObject({
  fuid: z.string().optional(),
  skillName: z.string().default(""),
  maxLvl: z.number().int().min(1).max(10).default(1),
  description: z.string().default(""),
  specialSkill: z.string().default(""),
});

export const ClassSchema = z.object({
  name: z.string().min(1),
  fuid: z.string().optional(),
  book: z.string().default("homebrew"),
  benefits: z.looseObject({
    hpplus: z.number().int().default(0),
    mpplus: z.number().int().default(0),
    ipplus: z.number().int().default(0),
    isCustomBenefit: z.boolean().default(false),
    martials: z.looseObject({
      armor: z.boolean().default(false),
      shields: z.boolean().default(false),
      melee: z.boolean().default(false),
      ranged: z.boolean().default(false),
    }),
    rituals: z.looseObject({ ritualism: z.boolean().default(false) }),
    custom: z.array(z.unknown()).default([]),
    spellClasses: z.array(z.string()).default([]),
  }),
  skills: z.array(SkillSchema).default([]),
});

export type ClassItem = z.infer<typeof ClassSchema>;
