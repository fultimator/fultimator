import type { ItemFieldConfig } from "../fieldConfig";
import type { ClassItem } from "../../../schema/itemSchemas/class";
import { metaFieldConfig } from "../metaFieldConfig";
import spellClassesList from "../../../../libs/spellClasses";
import specialSkillsList from "../../../../libs/skills";

// Form state mirrors ClassItem directly; no extra UI-only fields needed.
export type ClassFormState = ClassItem;

const BLANK_SKILL = {
  skillName: "",
  fuid: undefined as string | undefined,
  maxLvl: 1,
  description: "",
  specialSkill: "",
};

const CLASS_BOOK_SUGGESTIONS = [
  "core",
  "rework",
  "bonus",
  "high",
  "techno",
  "natural",
  "homebrew",
];

// Group special skills by class name for the grouped-select.
const groupedSpecialSkills = specialSkillsList.reduce<
  Record<string, { name: string; fuid: string }[]>
>((acc, skill) => {
  if (!acc[skill.class]) acc[skill.class] = [];
  acc[skill.class].push(skill);
  return acc;
}, {});

const specialSkillGroups = Object.keys(groupedSpecialSkills)
  .sort()
  .map((cls) => ({
    header: cls,
    options: groupedSpecialSkills[cls].map((s) => ({
      value: s.name,
      label: s.name,
    })),
  }));

const spellClassOptions = spellClassesList.map((sc) => ({ value: sc, label: sc }));

const martialOptions = [
  { key: "melee", label: "Martial Melee" },
  { key: "ranged", label: "Martial Ranged" },
  { key: "shields", label: "Martial Shields" },
  { key: "armor", label: "Martial Armor" },
];

const ritualOptions = [{ key: "ritualism", label: "Ritualism" }];

// Nested field config for each skill row used by the object-list renderer.
const skillRowFields: ItemFieldConfig<Record<string, unknown>> = [
  {
    key: "fuid",
    kind: "editable",
    label: "ID",
    component: "fuid",
    defaultValue: undefined,
    order: 0,
    gridSize: 12,
  },
  {
    key: "skillName",
    kind: "editable",
    label: "Skill Name",
    component: "text",
    defaultValue: "",
    order: 1,
    gridSize: { xs: 12, sm: 9 },
    componentProps: { maxLength: 50 },
    validationHints: { required: false },
  },
  {
    key: "maxLvl",
    kind: "editable",
    label: "Max Lvl",
    component: "number",
    defaultValue: 1,
    order: 2,
    gridSize: { xs: 12, sm: 3 },
    parse: (v) => Math.max(1, Math.min(10, Number(v) || 1)),
    validationHints: { min: 1, max: 10 },
  },
  {
    key: "description",
    kind: "editable",
    label: "Description",
    component: "textarea",
    defaultValue: "",
    order: 3,
    gridSize: 12,
    componentProps: { maxLength: 1500 },
  },
  {
    key: "specialSkill",
    kind: "editable",
    label: "Special Skill Effect",
    component: "grouped-select",
    defaultValue: "",
    order: 4,
    gridSize: 12,
    componentProps: {
      groups: specialSkillGroups,
      allowClear: true,
    },
  },
];

const G = {
  core: "core",
  benefits: "benefits",
  martials: "martials",
  spellClasses: "spellClasses",
  skills: "skills",
} as const;

export const classFieldConfig: ItemFieldConfig<ClassFormState> = [
  {
    key: "fuid",
    kind: "editable",
    label: "ID",
    component: "fuid",
    defaultValue: undefined,
    group: G.core,
    order: 0,
    gridSize: 12,
  },
  {
    key: "name",
    kind: "editable",
    label: "Class Name",
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 1,
    gridSize: { xs: 8, sm: 9 },
    componentProps: { maxLength: 50, autoFocus: true },
    validationHints: { required: true },
  },
  {
    key: "book",
    kind: "editable",
    label: "Book",
    component: "autocomplete",
    defaultValue: "homebrew",
    group: G.core,
    order: 2,
    gridSize: { xs: 4, sm: 3 },
    componentProps: {
      options: CLASS_BOOK_SUGGESTIONS.map((b) => ({ value: b, label: b })),
      freeSolo: true,
    },
  },
  {
    key: "benefits.hpplus",
    kind: "editable",
    label: "HP+",
    component: "number",
    defaultValue: 0,
    group: G.benefits,
    order: 0,
    parse: (v) => Number(v) || 0,
    componentProps: { min: 0, step: 5 },
    validationHints: { min: 0 },
  },
  {
    key: "benefits.mpplus",
    kind: "editable",
    label: "MP+",
    component: "number",
    defaultValue: 0,
    group: G.benefits,
    order: 1,
    parse: (v) => Number(v) || 0,
    componentProps: { min: 0, step: 5 },
    validationHints: { min: 0 },
  },
  {
    key: "benefits.ipplus",
    kind: "editable",
    label: "IP+",
    component: "number",
    defaultValue: 0,
    group: G.benefits,
    order: 2,
    parse: (v) => Number(v) || 0,
    componentProps: { min: 0, step: 2 },
    validationHints: { min: 0 },
  },
  {
    key: "benefits.martials",
    kind: "editable",
    label: "Martial Proficiencies",
    component: "toggle-group",
    defaultValue: { armor: false, shields: false, melee: false, ranged: false },
    group: G.martials,
    order: 0,
    gridSize: 12,
    componentProps: { options: martialOptions, color: "primary" },
  },
  {
    key: "benefits.rituals",
    kind: "editable",
    label: "Rituals",
    component: "toggle-group",
    defaultValue: { ritualism: false },
    group: G.martials,
    order: 1,
    gridSize: 12,
    componentProps: { options: ritualOptions, color: "primary" },
  },
  {
    key: "benefits.custom",
    kind: "editable",
    label: "Custom Benefits",
    component: "object-list",
    defaultValue: [],
    group: G.benefits,
    order: 3,
    gridSize: 12,
    componentProps: {
      fields: [
        {
          key: "value",
          kind: "editable",
          label: "Custom Benefit",
          component: "text",
          defaultValue: "",
          order: 0,
          gridSize: 12,
          componentProps: { maxLength: 500 },
        },
      ] as ItemFieldConfig<Record<string, unknown>>,
      itemDefaults: { value: "" },
      addLabel: "Add Custom Benefit",
    },
  },
  {
    key: "benefits.spellClasses",
    kind: "editable",
    label: "Spell Types",
    component: "chip-multi-select",
    defaultValue: [],
    group: G.spellClasses,
    order: 0,
    gridSize: 12,
    componentProps: { options: spellClassOptions, color: "secondary" },
  },
  {
    key: "skills",
    kind: "editable",
    label: "Skills",
    component: "object-list",
    defaultValue: Array.from({ length: 5 }, () => ({ ...BLANK_SKILL })),
    group: G.skills,
    order: 0,
    gridSize: 12,
    componentProps: {
      fields: skillRowFields,
      itemDefaults: { ...BLANK_SKILL },
      fixedCount: 5,
      rowLabel: (_row: Record<string, unknown>, i: number) => `Skill ${i + 1}`,
    },
  },
  ...(metaFieldConfig as unknown as ItemFieldConfig<ClassFormState>),
];
