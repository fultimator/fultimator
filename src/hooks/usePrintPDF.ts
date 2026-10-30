import { PDF } from "@libpdf/core";
import {
  TypePlayer,
  Weapons,
  CustomWeapons,
  Shields,
  Armor,
  Accessories,
  VehicleModule,
} from "../types/Players";
import { calculateAttribute } from "../libs/playerCalculations";
import { isItemEquipped } from "../libs/player/slots/equipmentSlots";
import { t } from "../translation/translate";

function stripMarkdown(text: string | undefined | null): string {
  if (!text) return "";
  return text.replace(/\*\*/g, "").replace(/【/g, "[").replace(/】/g, "]");
}

function tr(key: string | undefined | null): string {
  return stripMarkdown(t(key ?? ""));
}

type LegacySkill = {
  skillName?: string;
  name: string;
  currentLvl: number;
  maxLvl: number;
  description: string;
};
type LegacyNamed = { skillName?: string; name: string; description: string };

// Page 1: first 3 classes
const CLASS_FIELDS_P1 = [
  {
    classe: "Campo testo 285",
    benefici: "Campo testo 286",
    info: "Campo testo 10208",
  },
  {
    classe: "Campo testo 287",
    benefici: "Campo testo 288",
    info: "Campo testo 10209",
  },
  {
    classe: "Campo testo 289",
    benefici: "Campo testo 290",
    info: "Campo testo 102010",
  },
];

// Page 2: classes 4-7
const CLASS_FIELDS_P2 = [
  {
    classe: "Campo testo 253",
    benefici: "Campo testo 254",
    info: "Campo testo 10266",
  },
  {
    classe: "Campo testo 255",
    benefici: "Campo testo 256",
    info: "Campo testo 10267",
  },
  {
    classe: "Campo testo 257",
    benefici: "Campo testo 258",
    info: "Campo testo 10268",
  },
  {
    classe: "Campo testo 259",
    benefici: "Campo testo 260",
    info: "Campo testo 10269",
  },
];

const CLASS_FIELDS = [...CLASS_FIELDS_P1, ...CLASS_FIELDS_P2];

const BOND_FIELDS = [
  {
    text: "Legame1",
    positive: ["C1059", "C185", "C187"],
    negative: ["C1044", "C186", "C188"],
  },
  {
    text: "Legame2",
    positive: ["C1045", "C189", "C191"],
    negative: ["C1046", "C190", "C192"],
  },
  {
    text: "Legame3",
    positive: ["C1047", "C193", "C195"],
    negative: ["C1048", "C194", "C196"],
  },
  {
    text: "Legame4",
    positive: ["C1049", "C197", "C199"],
    negative: ["C1050", "C198", "C200"],
  },
  {
    text: "Legame5",
    positive: ["C1051", "C201", "C203"],
    negative: ["C1052", "C202", "C204"],
  },
  {
    text: "Legame6",
    positive: ["C1053", "C205", "C207"],
    negative: ["C1054", "C206", "C2010"],
  },
] as const;

// Page 3: spells - left column then right column
const SPELL_FIELDS = [
  {
    name: "Campo testo 243",
    mp: "Campo testo 244",
    targets: "Campo testo 245",
    duration: "Campo testo 246",
    desc: "Campo testo 242",
  },
  {
    name: "Campo testo 10237",
    mp: "Campo testo 10238",
    targets: "Campo testo 10239",
    duration: "Campo testo 10240",
    desc: "Campo testo 10236",
  },
  {
    name: "Campo testo 10242",
    mp: "Campo testo 10243",
    targets: "Campo testo 10244",
    duration: "Campo testo 10245",
    desc: "Campo testo 10241",
  },
  {
    name: "Campo testo 10247",
    mp: "Campo testo 10248",
    targets: "Campo testo 10249",
    duration: "Campo testo 10250",
    desc: "Campo testo 10246",
  },
  {
    name: "Campo testo 10252",
    mp: "Campo testo 10253",
    targets: "Campo testo 10254",
    duration: "Campo testo 10255",
    desc: "Campo testo 10251",
  },
  {
    name: "Campo testo 10257",
    mp: "Campo testo 10258",
    targets: "Campo testo 10259",
    duration: "Campo testo 10260",
    desc: "Campo testo 10256",
  },
  {
    name: "Campo testo 10262",
    mp: "Campo testo 10263",
    targets: "Campo testo 10264",
    duration: "Campo testo 10265",
    desc: "Campo testo 10261",
  },
  {
    name: "Campo testo 238",
    mp: "Campo testo 239",
    targets: "Campo testo 240",
    duration: "Campo testo 241",
    desc: "Campo testo 237",
  },
  {
    name: "Campo testo 10212",
    mp: "Campo testo 10213",
    targets: "Campo testo 10214",
    duration: "Campo testo 10215",
    desc: "Campo testo 10211",
  },
  {
    name: "Campo testo 10217",
    mp: "Campo testo 10218",
    targets: "Campo testo 10219",
    duration: "Campo testo 10220",
    desc: "Campo testo 10216",
  },
  {
    name: "Campo testo 10222",
    mp: "Campo testo 10223",
    targets: "Campo testo 10224",
    duration: "Campo testo 10225",
    desc: "Campo testo 10221",
  },
  {
    name: "Campo testo 10227",
    mp: "Campo testo 10228",
    targets: "Campo testo 10229",
    duration: "Campo testo 10230",
    desc: "Campo testo 10226",
  },
  {
    name: "Campo testo 10232",
    mp: "Campo testo 10233",
    targets: "Campo testo 10234",
    duration: "Campo testo 10235",
    desc: "Campo testo 10231",
  },
];

// helpers

type DefItem = {
  modifiers?: { def?: number; mdef?: number; init?: number };
  defModifier?: number;
  mDefModifier?: number;
  initModifier?: number;
};

const modDef = (item: DefItem | null | undefined) =>
  item?.modifiers?.def ?? item?.defModifier ?? 0;
const modMDef = (item: DefItem | null | undefined) =>
  item?.modifiers?.mdef ?? item?.mDefModifier ?? 0;
const modInit = (item: DefItem | null | undefined) =>
  item?.modifiers?.init ?? item?.initModifier ?? 0;

const ATTRIBUTE_ABBREVIATIONS: Record<string, string> = {
  dexterity: "DEX",
  insight: "INS",
  might: "MIG",
  willpower: "WLP",
  dex: "DEX",
  ins: "INS",
  mig: "MIG",
  wlp: "WLP",
};

function buildClassSkillInfo(cls: TypePlayer["classes"][0]): {
  benefici: string;
  info: string;
} {
  const ben = cls.benefits as {
    hpplus?: number;
    mpplus?: number;
    ipplus?: number;
    other?: { description?: string }[];
  };
  const bonusParts: string[] = [];
  if (ben?.hpplus) bonusParts.push(`HP +${ben.hpplus}`);
  if (ben?.mpplus) bonusParts.push(`MP +${ben.mpplus}`);
  if (ben?.ipplus) bonusParts.push(`IP +${ben.ipplus}`);
  (ben?.other ?? []).forEach((o) => {
    if (o.description) bonusParts.push(tr(o.description));
  });

  const skillLines = (
    Array.isArray(cls.skills) ? (cls.skills as LegacySkill[]) : []
  )
    .filter((s) => (s.skillName ?? s.name) && (s.currentLvl ?? 0) >= 1)
    .map((s) => {
      const desc = s.description ? ` - ${tr(s.description)}` : "";
      return `${tr(s.skillName ?? s.name)} [${s.currentLvl}/${s.maxLvl}]${desc}`;
    });

  return { benefici: bonusParts.join(" | "), info: skillLines.join("\n") };
}

function buildWeaponDesc(item: Weapons | CustomWeapons): string {
  const w = item as Weapons & { type?: string };
  const parts: string[] = [];
  if (w.hands) parts.push(`${w.hands}-hand`);
  if (w.type) parts.push(w.type);
  if (w.damage) {
    const dmg = `${w.damage.value} ${w.damage.type}`.trim();
    if (dmg) parts.push(`DMG: ${dmg}`);
  }
  if (w.accuracy) {
    const mod = (w.accuracy as unknown as { modifier?: number }).modifier ?? 0;
    const acc = formatAccuracy(
      String(w.accuracy.attr1 ?? ""),
      String(w.accuracy.attr2 ?? ""),
      mod,
    );
    parts.push(`ACC: ${acc}`);
  }
  if (w.quality) parts.push(w.quality);
  if (w.description) parts.push(stripMarkdown(w.description));
  return parts.join(" | ");
}

function buildArmorDesc(item: Armor): string {
  const parts = [
    item.martial ? `DEF ${item.def}` : `DEF DEX+${item.def}`,
    `MDEF INS+${item.mdef}`,
  ];
  if (item.init) parts.push(`INIT ${item.init}`);
  if (item.description) parts.push(stripMarkdown(item.description));
  return parts.join(" | ");
}

function abbreviateAttributeName(value: string): string {
  const normalized = value.trim().toLowerCase();
  return ATTRIBUTE_ABBREVIATIONS[normalized] ?? value.toUpperCase();
}

function formatAccuracy(attr1: string, attr2: string, modifier = 0): string {
  return `${abbreviateAttributeName(attr1)}+${abbreviateAttributeName(attr2)} [${modifier >= 0 ? "+" : ""}${modifier}]`;
}

function setBondFields(
  fields: Record<string, string | boolean>,
  bond: NonNullable<TypePlayer["info"]>["bonds"][number],
  bondIndex: number,
): void {
  const entry = BOND_FIELDS[bondIndex];
  if (!entry) return;

  fields[entry.text] = bond.name ?? "";
  fields[entry.positive[0]] = bond.admiration ?? false;
  fields[entry.positive[1]] = bond.loyality ?? false;
  fields[entry.positive[2]] = bond.affection ?? false;
  fields[entry.negative[0]] = bond.inferiority ?? false;
  fields[entry.negative[1]] = bond.mistrust ?? false;
  fields[entry.negative[2]] = bond.hatred ?? false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSpecialSpellBlock(spell: any): string[] {
  const s = spell;
  const type: string = s.spellType ?? "unknown";
  const lines: string[] = [];

  const customOrTr = (
    obj: { name?: string; customName?: string },
    sentinel: string,
  ) =>
    obj.name === sentinel ? (obj.customName ?? obj.name ?? "") : tr(obj.name);

  switch (type) {
    case "pilot-vehicle":
      for (const v of s.vehicles ?? []) {
        lines.push(`[PILOT] ${v.customName || tr(v.name) || "Vehicle"}`);
        const frame = (v.modules ?? []).find(
          (m: { type?: string }) =>
            m.type === "pilot_module_frame" || m.type?.includes("frame"),
        );
        if (frame)
          lines.push(
            `  Frame: ${tr(frame.name)}${frame.description ? ` - ${tr(frame.description)}` : ""}`,
          );
        for (const w of (v.modules ?? []).filter(
          (m: { type?: string }) =>
            m.type === "pilot_module_weapon" || m.type?.includes("weapon"),
        )) {
          const acc = w.accuracy
            ? formatAccuracy(
                String(w.accuracy.attr1 ?? ""),
                String(w.accuracy.attr2 ?? ""),
                w.accuracy.modifier ?? 0,
              )
            : "";
          const dmg = w.damage
            ? `${w.damage.value ?? ""} ${w.damage.type ?? ""}`.trim()
            : "";
          lines.push(
            `  Weapon: ${tr(w.name)}${acc ? ` ACC:${acc}` : ""}${dmg ? ` DMG:${dmg}` : ""}${w.description ? ` - ${tr(w.description)}` : ""}`,
          );
        }
        const armor = (v.modules ?? []).find(
          (m: { type?: string }) =>
            m.type === "pilot_module_armor" || m.type?.includes("armor"),
        );
        if (armor)
          lines.push(
            `  Armor: ${tr(armor.name)} DEF+${armor.def ?? 0} MDEF+${armor.mdef ?? 0}${armor.description ? ` - ${tr(armor.description)}` : ""}`,
          );
        for (const sup of (v.modules ?? []).filter(
          (m: { type?: string }) =>
            m.type === "pilot_module_support" || m.type?.includes("support"),
        ))
          lines.push(
            `  Support: ${tr(sup.name)}${sup.description ? ` - ${tr(sup.description)}` : ""}`,
          );
      }
      break;
    case "dance":
      lines.push(`[DANCER]`);
      for (const d of s.dances ?? []) {
        const name = customOrTr(d, "dance_custom_name");
        const dur =
          d.name === "dance_custom_name"
            ? (d.duration ?? "")
            : tr(d.duration ?? "");
        const eff =
          d.name === "dance_custom_name"
            ? (d.effect ?? "")
            : tr(d.effect ?? "");
        lines.push(
          `  ${name}${dur ? ` (${dur})` : ""}${eff ? ` - ${stripMarkdown(eff)}` : ""}`,
        );
      }
      break;
    case "symbol":
      lines.push(`[SYMBOLIST]`);
      for (const sym of s.symbols ?? []) {
        const name = customOrTr(sym, "symbol_custom_name");
        const eff =
          sym.name === "symbol_custom_name"
            ? (sym.effect ?? "")
            : tr(sym.effect ?? "");
        lines.push(`  ${name}${eff ? ` - ${stripMarkdown(eff)}` : ""}`);
      }
      break;
    case "gift":
      lines.push(`[ESPER] Clock: ${s.clock ?? 0}/4`);
      for (const g of s.gifts ?? [])
        lines.push(
          `  ${tr(g.name ?? "")}${g.effect || g.description ? ` - ${stripMarkdown(tr(g.effect ?? g.description ?? ""))}` : ""}`,
        );
      break;
    case "therioform":
      lines.push(`[MUTANT]`);
      for (const f of s.therioforms ?? []) {
        const name = customOrTr(f, "mutant_therioform_custom_name");
        const desc =
          f.name === "mutant_therioform_custom_name"
            ? (f.description ?? "")
            : tr(f.description ?? "");
        lines.push(`  ${name}${desc ? ` - ${stripMarkdown(desc)}` : ""}`);
      }
      break;
    case "magichant":
      lines.push(`[CHANTER]`);
      for (const k of s.keys ?? []) {
        const name = customOrTr(k, "magichant_custom_name");
        lines.push(
          `  Key: ${name}${k.mp !== undefined ? ` (MP ${k.mp})` : ""}`,
        );
      }
      for (const tone of s.tones ?? []) {
        const name = customOrTr(tone, "magichant_custom_name");
        const eff =
          tone.name === "magichant_custom_name"
            ? (tone.effect ?? "")
            : tr(tone.effect ?? "");
        lines.push(`  Tone: ${name}${eff ? ` - ${stripMarkdown(eff)}` : ""}`);
      }
      break;
    case "invocation":
      lines.push(`[INVOKER]`);
      for (const inv of s.invocations ?? [])
        lines.push(
          `  ${tr(inv.name ?? "")}${inv.effect ? ` - ${stripMarkdown(tr(inv.effect))}` : ""}`,
        );
      break;
    case "magiseed":
      lines.push(`[FLORALIST]`);
      for (const seed of s.magiseeds ?? [])
        lines.push(`  ${seed.customName ?? tr(seed.name ?? "")}`);
      break;
    case "cooking":
      lines.push(`[GOURMET]`);
      for (const eff of s.cookbook?.effects ?? []) {
        const text = stripMarkdown(tr(eff.effect ?? ""));
        if (text) lines.push(`  ${text}`);
      }
      break;
    case "tinkerer-alchemy":
    case "tinkerer-infusion":
    case "tinkerer-magitech":
      lines.push(`[TINKERER - ${type.replace("tinkerer-", "").toUpperCase()}]`);
      for (const rank of s.ranks ?? s.gadgets ?? [])
        lines.push(
          `  ${tr(rank.name ?? "")}${rank.effect || rank.description ? ` - ${stripMarkdown(tr(rank.effect ?? rank.description ?? ""))}` : ""}`,
        );
      break;
    case "gamble":
      lines.push(`[ENTROPIST] ${s.spellName ?? tr(s.name ?? "")}`);
      if (s.mp) lines.push(`  MP: ${s.mp}`);
      for (const target of s.targets ?? []) {
        const effects = (target.effects ?? [])
          .map((e: { effect?: string }) => stripMarkdown(tr(e.effect ?? "")))
          .filter(Boolean)
          .join("; ");
        lines.push(
          `  Target: ${target.effect ?? ""}${effects ? ` [${effects}]` : ""}`,
        );
      }
      break;
    case "deck":
      lines.push(`[CARD PLAYER]`);
      if (s.description) lines.push(`  ${stripMarkdown(tr(s.description))}`);
      break;
    default:
      lines.push(`[${type.toUpperCase()}] ${tr(s.name ?? "")}`);
      if (s.cost?.amount) lines.push(`  MP: ${s.cost.amount}`);
      if (s.description) lines.push(`  ${stripMarkdown(tr(s.description))}`);
  }

  return lines;
}

function buildFieldMap(player: TypePlayer): Record<string, string | boolean> {
  const inv = player.equipment?.[0];
  const fields: Record<string, string | boolean> = {};

  // Identity
  fields["Nome"] = player.name ?? "";
  fields["Genere"] = player.info?.pronouns ?? "";
  fields["Identita"] = player.info?.identity ?? "";
  fields["Tema"] = player.info?.theme ?? "";
  fields["Origine"] = player.info?.origin ?? "";
  fields["PuntiFabula"] = String(player.info?.fabulapoints ?? "");
  fields["PuntiEsperienza"] = String(player.info?.exp ?? "");
  fields["Zenit"] = String(player.info?.zenit ?? "");
  fields["Campo testo 10207"] = String(player.lvl ?? "");
  fields["Campo testo 252"] = player.name ?? "";
  fields["Campo testo 236"] = player.name ?? "";

  // Attributes
  const currDex = calculateAttribute(
    player,
    player.attributes?.dexterity?.base,
    ["slow", "enraged"],
    ["dexUp"],
    6,
    12,
  );
  const currIns = calculateAttribute(
    player,
    player.attributes?.insight?.base,
    ["dazed", "enraged"],
    ["insUp"],
    6,
    12,
  );
  const currMig = calculateAttribute(
    player,
    player.attributes?.might?.base,
    ["weak", "poisoned"],
    ["migUp"],
    6,
    12,
  );
  const currWlp = calculateAttribute(
    player,
    player.attributes?.willpower?.base,
    ["shaken", "poisoned"],
    ["wlpUp"],
    6,
    12,
  );

  fields["Campo testo 270"] = String(player.attributes?.dexterity?.base ?? "");
  fields["Campo testo 271"] = String(currDex);
  fields["Campo testo 272"] = String(player.attributes?.insight?.base ?? "");
  fields["Campo testo 273"] = String(currIns);
  fields["Campo testo 274"] = String(player.attributes?.might?.base ?? "");
  fields["Campo testo 275"] = String(currMig);
  fields["Campo testo 276"] = String(player.attributes?.willpower?.base ?? "");
  fields["Campo testo 277"] = String(currWlp);

  // HP / MP / IP
  type RuntimeStat = { base: number; current: number; max?: number };
  const stats = player.stats as
    | { hp: RuntimeStat; mp: RuntimeStat; ip: RuntimeStat }
    | undefined;
  const hpMax = stats?.hp?.max ?? 0;
  fields["Campo testo 280"] = String(hpMax);
  fields["Campo testo 281"] = String(Math.floor(hpMax / 2));
  fields["Campo testo 282"] = String(stats?.hp?.current ?? "");
  fields["Campo testo 278"] = String(stats?.mp?.max ?? "");
  fields["Campo testo 283"] = String(stats?.mp?.current ?? "");
  fields["Campo testo 279"] = String(stats?.ip?.max ?? "");
  fields["Campo testo 284"] = String(stats?.ip?.current ?? "");

  // DEF / MDEF / Initiative
  const equippedArmor =
    inv?.armor?.find((a) => isItemEquipped(player, a)) ?? null;
  const equippedShields =
    inv?.shields?.filter((s) => isItemEquipped(player, s)) ?? [];
  const equippedWeapons =
    inv?.weapons?.filter((w) => isItemEquipped(player, w)) ?? [];
  const equippedCustomWeapons =
    inv?.customWeapons?.filter((w) => isItemEquipped(player, w)) ?? [];
  const equippedAccessory =
    inv?.accessories?.find((a) => isItemEquipped(player, a)) ?? null;

  const pilotSpells = (player.classes ?? [])
    .flatMap((c) => (Array.isArray(c.spells) ? c.spells : []))
    .filter((s) => s?.spellType === "pilot-vehicle");
  const activeVehicle = pilotSpells
    .flatMap((s) => s.vehicles ?? [])
    .find((v) => v.enabled);
  type ArmorModule = VehicleModule & {
    martial?: boolean;
    def?: number;
    mdef?: number;
  };
  const armorModule = (activeVehicle?.modules?.find(
    (m) => m.equipped && m.type === "pilot_module_armor",
  ) ?? null) as ArmorModule | null;

  const isMartialArmor = armorModule
    ? armorModule.martial
    : (equippedArmor?.martial ?? false);
  const dodgeBonus =
    equippedShields.length === 0 && !isMartialArmor
      ? (player.classes ?? [])
          .flatMap((c) => (Array.isArray(c.skills) ? c.skills : []))
          .filter((s) => s.specialSkill === "Dodge")
          .reduce((sum, s) => sum + (s.currentLvl || 0), 0)
      : 0;

  const baseDef = armorModule
    ? armorModule.martial
      ? armorModule.def || 0
      : currDex + (armorModule.def || 0)
    : equippedArmor
      ? equippedArmor.martial
        ? equippedArmor.def
        : currDex + equippedArmor.def
      : currDex;

  const currDef =
    baseDef +
    equippedShields.reduce((a, s) => a + (s.def || 0), 0) +
    (player.modifiers?.def || 0) +
    (armorModule ? 0 : modDef(equippedArmor)) +
    equippedShields.reduce((a, s: Shields) => a + modDef(s), 0) +
    modDef(equippedAccessory as Accessories & DefItem) +
    equippedWeapons.reduce((a, w: Weapons) => a + modDef(w), 0) +
    equippedCustomWeapons.reduce(
      (a, w: CustomWeapons) => a + (parseInt(String(modDef(w)), 10) || 0),
      0,
    ) +
    dodgeBonus;

  const baseMDef = armorModule
    ? armorModule.martial
      ? armorModule.mdef || 0
      : currIns + (armorModule.mdef || 0)
    : equippedArmor
      ? currIns + equippedArmor.mdef
      : currIns;

  const currMDef =
    baseMDef +
    equippedShields.reduce((a, s) => a + (s.mdef || 0), 0) +
    (player.modifiers?.mdef || 0) +
    (armorModule ? 0 : modMDef(equippedArmor)) +
    equippedShields.reduce((a, s: Shields) => a + modMDef(s), 0) +
    modMDef(equippedAccessory as Accessories & DefItem) +
    equippedWeapons.reduce((a, w: Weapons) => a + modMDef(w), 0) +
    equippedCustomWeapons.reduce(
      (a, w: CustomWeapons) => a + (parseInt(String(modMDef(w)), 10) || 0),
      0,
    );

  const currInit =
    (armorModule ? 0 : equippedArmor?.init || 0) +
    (player.modifiers?.init || 0) +
    (armorModule ? 0 : modInit(equippedArmor)) +
    equippedShields.reduce((a, s: Shields) => a + modInit(s), 0) +
    modInit(equippedAccessory as Accessories & DefItem);

  fields["Difesa"] = String(currDef);
  fields["DifesaMagica"] = String(currMDef);
  fields["ModIniziativa"] = currInit !== 0 ? String(currInit) : "";

  // Martials
  fields["EquipArmature"] = player.martials?.armor ?? false;
  fields["EquipScudi"] = player.martials?.shields ?? false;
  fields["EquipMischia"] = player.martials?.melee ?? false;
  fields["EquipDist"] = player.martials?.ranged ?? false;

  // Statuses
  fields["C44"] = player.statuses?.slow ?? false;
  fields["C45"] = player.statuses?.dazed ?? false;
  fields["C46"] = player.statuses?.weak ?? false;
  fields["C47"] = player.statuses?.shaken ?? false;
  fields["C48"] = player.statuses?.enraged ?? false;
  fields["C49"] = player.statuses?.poisoned ?? false;

  // Bonds
  (player.info?.bonds ?? []).slice(0, 6).forEach((bond, i) => {
    setBondFields(fields, bond, i);
  });

  // Equipment slots
  const findEquipItem = (ref: typeof player.equippedSlots.mainHand) => {
    if (!ref || !inv) return null;
    const arr = inv[ref.source as keyof typeof inv] as
      | { name: string }[]
      | undefined;
    if (!arr) return null;
    const matches = arr.filter((item) => item.name === ref.name);
    return matches[ref.index ?? 0] ?? matches[0] ?? null;
  };

  const mainHand = findEquipItem(player.equippedSlots?.mainHand);
  const offHand = findEquipItem(player.equippedSlots?.offHand);
  const armorItem = findEquipItem(player.equippedSlots?.armor);
  const accessoryItem = findEquipItem(player.equippedSlots?.accessory);

  if (mainHand) {
    fields["Mano1Equip"] = mainHand.name;
    fields["Mano1EquipDesc"] = buildWeaponDesc(mainHand as Weapons);
  }
  if (offHand) {
    fields["Mano2Equip"] = offHand.name;
    fields["Mano2EquipDesc"] = buildWeaponDesc(offHand as Weapons);
  }
  if (armorItem) {
    fields["ArmaturaEquip"] = armorItem.name;
    fields["ArmaturaEquipDesc"] = buildArmorDesc(armorItem as Armor);
  }
  if (accessoryItem) {
    fields["AccessorioEquip"] = accessoryItem.name;
    fields["AccessorioEquipDesc"] = stripMarkdown(
      (accessoryItem as Accessories).description ?? "",
    );
  }

  // Classes (up to 7)
  (player.classes ?? []).slice(0, 7).forEach((cls, i) => {
    const { benefici, info } = buildClassSkillInfo(cls);
    const f = CLASS_FIELDS[i];
    fields[f.classe] = `${cls.name} Lv.${cls.lvl}`;
    if (benefici) fields[f.benefici] = benefici;
    if (info) fields[f.info] = info;
  });

  // Heroic skills
  const heroics = (player.classes ?? []).flatMap((cls) =>
    (Array.isArray(cls.heroic) ? (cls.heroic as LegacyNamed[]) : [])
      .filter((h) => h.skillName ?? h.name)
      .map((h) =>
        h.description
          ? `${tr(h.skillName ?? h.name)} - ${tr(h.description)}`
          : tr(h.skillName ?? h.name),
      ),
  );
  if (heroics.length) fields["Campo testo 10270"] = heroics.join("\n");

  // Spells
  const STANDARD_SPELL_TYPES = new Set([
    "default",
    "arcane",
    "ritual",
    "gamble",
    "arcanist",
    "arcanist-rework",
    undefined,
    null,
    "",
  ]);
  const allSpells = (player.classes ?? []).flatMap((cls) =>
    Array.isArray(cls.spells) ? cls.spells : [],
  );
  const tableSpells = allSpells.filter((s) =>
    STANDARD_SPELL_TYPES.has(s.spellType ?? ""),
  );
  const specialSpells = allSpells.filter(
    (s) => !STANDARD_SPELL_TYPES.has(s.spellType ?? ""),
  );

  tableSpells.slice(0, SPELL_FIELDS.length).forEach((spell, i) => {
    const f = SPELL_FIELDS[i];
    fields[f.name] = tr(spell.name ?? "");
    fields[f.mp] = spell.cost?.amount ? String(spell.cost.amount) : "";
    fields[f.targets] = spell.maxTargets ? String(spell.maxTargets) : "";
    fields[f.duration] = tr(spell.duration ?? "");
    const effects = [
      spell.effect1,
      spell.effect2,
      spell.effect3,
      spell.effect4,
      spell.effect5,
      spell.effect6,
    ]
      .filter(Boolean)
      .map((e) => tr(e!))
      .join(" ");
    fields[f.desc] = effects || tr(spell.description ?? "");
  });

  const specialBlocks = specialSpells
    .map(buildSpecialSpellBlock)
    .filter((b) => b.length)
    .map((b) => b.join("\n"));
  if (specialBlocks.length)
    fields["Campo testo 10317"] = specialBlocks.join("\n\n");

  // Rituals
  fields["C208"] = player.rituals?.arcanism ?? false;
  fields["C209"] = player.rituals?.chimerism ?? false;
  fields["C210"] = player.rituals?.elementalism ?? false;
  fields["C211"] = player.rituals?.entropism ?? false;
  fields["C212"] = player.rituals?.ritualism ?? false;
  fields["C213"] = player.rituals?.spiritism ?? false;

  const ritualSpells = allSpells.filter((s) => s.spellType === "ritual");
  if (ritualSpells.length)
    fields["Campo testo 10210"] = ritualSpells
      .map((s) => tr(s.name ?? ""))
      .join(", ");

  // Notes / inventory
  const inventoryLines = (player.items ?? []).map(
    (item) =>
      `${item.name} x${item.quantity}${item.description ? ` - ${item.description}` : ""}`,
  );
  const consumableLines = (player.consumables ?? []).map(
    (c) =>
      `${c.name} (IP ${c.ipCost})${c.description ? ` - ${c.description}` : ""}`,
  );
  const noteLines = (player.notes ?? []).map((n) =>
    n.name ? `${n.name}: ${n.description}` : n.description,
  );

  if (inventoryLines.length || consumableLines.length)
    fields["ZainoAppunti 2"] = [...inventoryLines, ...consumableLines].join(
      "\n",
    );
  if (noteLines.length) fields["ZainoAppunti"] = noteLines.join("\n");

  return fields;
}

// PDF output helpers

function triggerDownload(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes.slice().buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const A4_W = 595.28;
const A4_H = 841.89;
const PDF_MARGIN = 28;

function computePageBreaks(
  element: HTMLElement,
  scale: number,
  pageHeightPx: number,
  totalHeightPx: number,
): number[] {
  const rootRect = element.getBoundingClientRect();
  const sectionEls = Array.from(
    element.querySelectorAll<HTMLElement>(".MuiPaper-root, .MuiGrid-item"),
  );
  const sections = sectionEls.map((el) => {
    const r = el.getBoundingClientRect();
    return {
      top: (r.top - rootRect.top) * scale,
      bottom: (r.bottom - rootRect.top) * scale,
    };
  });

  const breaks: number[] = [];
  let cursor = 0;

  while (cursor + pageHeightPx < totalHeightPx) {
    let breakY = cursor + pageHeightPx;

    const culprits = sections.filter(
      (s) =>
        s.top < breakY && s.bottom > breakY && s.bottom - s.top < pageHeightPx,
    );
    if (culprits.length > 0) {
      const earliest = culprits.reduce((a, b) => (a.top < b.top ? a : b));
      if (earliest.top > cursor) {
        breakY = earliest.top;
      }
    }

    breaks.push(breakY);
    cursor = breakY;
  }

  return breaks;
}

export async function buildAppPDF(
  canvas: HTMLCanvasElement,
  element: HTMLElement,
  scale: number,
  filename: string,
): Promise<void> {
  const contentW = A4_W - PDF_MARGIN * 2;
  const pageHeightPx = Math.round(
    (canvas.width * (A4_H - PDF_MARGIN * 2)) / (A4_W - PDF_MARGIN * 2),
  );
  const breakPoints = computePageBreaks(
    element,
    scale,
    pageHeightPx,
    canvas.height,
  );
  const boundaries = [0, ...breakPoints, canvas.height];

  const pdf = await PDF.create();

  for (let i = 0; i < boundaries.length - 1; i++) {
    const sliceY = boundaries[i];
    const sliceH = boundaries[i + 1] - sliceY;

    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sliceH;
    slice
      .getContext("2d")!
      .drawImage(
        canvas,
        0,
        sliceY,
        canvas.width,
        sliceH,
        0,
        0,
        canvas.width,
        sliceH,
      );

    const base64 = slice.toDataURL("image/png").split(",")[1];
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const image = await pdf.embedPng(bytes);
    const contentH = contentW * (sliceH / canvas.width);
    const pageH = contentH + PDF_MARGIN * 2;

    const page = pdf.addPage({ width: A4_W, height: pageH });
    page.drawImage(image, {
      x: PDF_MARGIN,
      y: PDF_MARGIN,
      width: contentW,
      height: contentH,
    });
  }

  triggerDownload(await pdf.save(), filename);
}

export default function usePrintPDF() {
  const printPDF = async (player: TypePlayer) => {
    const response = await fetch(
      "/pdf/Fabula-Ultima-Sheets-Quirks-Optional.pdf",
    );
    const pdf = await PDF.load(new Uint8Array(await response.arrayBuffer()));
    const form = pdf.getForm();
    if (!form) {
      console.warn("No form found in PDF");
      return;
    }
    form.fill(buildFieldMap(player));
    triggerDownload(
      await pdf.save(),
      `${player.name ?? "character"}_print.pdf`,
    );
  };

  return [printPDF] as const;
}
