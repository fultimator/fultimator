import { z } from "zod";
import { MetaSchema } from "../meta";
import { BehaviorSchema } from "../shared/behaviorSchemas";
import { PlayerSpellSchema } from "./spells";

export const SkillSchema = z.looseObject({
  fuid: z.string().optional(),
  name: z.string().default(""),
  maxLvl: z.number().int().min(1).max(10).default(1),
  currentLvl: z.number().int().default(0),
  description: z.string().default(""),
  specialSkill: z.string().default(""),
  behaviors: z.array(BehaviorSchema).optional(),
});

export const HeroicSkillSchema = z.object({
  fuid: z.string().optional(),
  name: z.string().default(""),
  quote: z.string().default(""),
  description: z.string().default(""),
  specialSkill: z.string().optional(),
  meta: MetaSchema.optional(),
  behaviors: z.array(BehaviorSchema).optional(),
});

export const BenefitOtherSchema = z.object({
  description: z.string().default(""),
});

export const ClassBenefitsSchema = z.object({
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
  other: z.array(BenefitOtherSchema).default([]),
});

export const ClassSchema = z.object({
  itemType: z.literal("class").default("class"),
  name: z.string().min(1),
  fuid: z.string().optional(),
  lvl: z.number().int().default(1),
  meta: MetaSchema.optional(),
  benefits: ClassBenefitsSchema,
  skills: z.array(SkillSchema).default([]),
  heroic: z.array(HeroicSkillSchema).default([]),
  spells: z.array(PlayerSpellSchema).default([]),
});

export type Skill = z.infer<typeof SkillSchema>;
export type HeroicSkill = z.infer<typeof HeroicSkillSchema>;
export type ClassBenefits = z.infer<typeof ClassBenefitsSchema>;
export type ClassItem = z.infer<typeof ClassSchema>;

// Legacy aliases used by pc.ts
export const PlayerSkillSchema = SkillSchema;
export const PlayerClassSchema = ClassSchema;
export type PlayerSkill = Skill;
export type PlayerClass = ClassItem;
