import { t as staticT } from "../translation/translate";
import attributes from "./attributes";
import types from "./types";
import { calcHP, calcMP, calcInit, calcDef, calcMDef, calcDamage, calcPrecision, calcMagic } from "./npcs";

// 
// Helpers
// 

const ATTR_SHORT = {
  dexterity: "DEX",
  insight: "INS",
  might: "MIG",
  will: "WLP",
};

const DAMAGE_TYPE_LABEL = {
  physical: "Physical",
  wind: "Air",
  bolt: "Bolt",
  dark: "Dark",
  earth: "Earth",
  fire: "Fire",
  ice: "Ice",
  light: "Light",
  poison: "Poison",
};

const AFFINITY_LABEL = { vu: "VU", rs: "RS", im: "IM", ab: "AB" };

// "wind" in NPC data → "air" in Obsidian fu-vault format
const OBSIDIAN_AFFINITY_KEY = { wind: "air" };

const NPC_AFFINITY_ORDER = ["physical", "wind", "bolt", "dark", "earth", "fire", "ice", "light", "poison"];

function npcRankLabel(rank) {
  const labels = {
    soldier: "Soldier",
    elite: "Elite",
    champion1: "Champion (1)",
    champion2: "Champion (2)",
    champion3: "Champion (3)",
    champion4: "Champion (4)",
    champion5: "Champion (5)",
    champion6: "Champion (6)",
    companion: "Companion",
    groupvehicle: "Group Vehicle",
  };
  return labels[rank] || rank || "Soldier";
}

function formatAttackDesc(attack, npc, md) {
  const a1 = ATTR_SHORT[attack.attr1] ?? attack.attr1;
  const a2 = ATTR_SHORT[attack.attr2] ?? attack.attr2;
  const prec = calcPrecision(attack, npc);
  const precStr = prec > 0 ? ` +${prec}` : prec < 0 ? ` ${prec}` : "";
  const checkPart = `[${a1} + ${a2}]${precStr}`;

  let desc;
  if (attack.type === "nodmg") {
    desc = md ? `**${checkPart}**` : checkPart;
  } else {
    const dmg = calcDamage(attack, npc);
    const dmgType = DAMAGE_TYPE_LABEL[attack.type] ?? attack.type;
    const core = `${checkPart} ~ [HR+${dmg}] ${dmgType}`;
    desc = md ? `**${core}** damage` : `${core} damage`;
  }

  const specials = Array.isArray(attack.special)
    ? attack.special.filter(Boolean).join("; ")
    : (typeof attack.special === "string" ? attack.special : "");
  if (specials) desc += `, ${specials}`;
  return desc;
}

function formatNpcAffinities(affinities, md) {
  if (!affinities) return null;
  const b = (s) => (md ? `**${s}**` : s);
  const parts = NPC_AFFINITY_ORDER
    .filter((k) => affinities[k] && AFFINITY_LABEL[affinities[k]])
    .map((k) => `${DAMAGE_TYPE_LABEL[k] ?? k} ${AFFINITY_LABEL[affinities[k]]}`);
  return parts.length ? `${b("Affinities:")} ${parts.join(", ")}` : null;
}

// 
// NPC text formatter
// 

function buildNpcText(npc, md) {
  const b = (s) => (md ? `**${s}**` : s);
  const h1 = (s) => (md ? `# ${s}` : s.toUpperCase());
  const h2 = (s) => (md ? `## ${s}` : `--- ${s.toUpperCase()} ---`);

  const rank = npc.rank || "soldier";
  const rankStr = rank !== "soldier" ? ` | ${npcRankLabel(rank)}` : "";
  const parts = [h1(npc.name)];
  parts.push(`Lv. ${npc.lvl}${rankStr} | ${npc.species ?? ""}`);

  if (npc.description) parts.push(npc.description);
  if (npc.traits) parts.push(`${b("Typical Traits:")} ${npc.traits}`);

  // Attributes
  const a = npc.attributes ?? {};
  parts.push(
    `${b("DEX")} d${a.dexterity}  ${b("INS")} d${a.insight}  ${b("MIG")} d${a.might}  ${b("WLP")} d${a.will}`
  );

  // Derived stats
  const hp = calcHP(npc);
  const mp = calcMP(npc);
  const init = calcInit(npc);
  const def = calcDef(npc);
  const mdef = calcMDef(npc);
  parts.push(
    `${b("HP:")} ${hp}  ${b("MP:")} ${mp}  ${b("Init:")} ${init}  ${b("DEF:")} ${def}  ${b("M.DEF:")} ${mdef}`
  );

  // Affinities
  const affinityLine = formatNpcAffinities(npc.affinities, md);
  if (affinityLine) parts.push(affinityLine);

  // Attacks
  const allAttacks = [...(npc.attacks ?? [])];
  if (allAttacks.length) {
    const lines = allAttacks.map((atk) => {
      const rangeIcon = atk.range === "distance" ? "[Ranged]" : "[Melee]";
      const desc = formatAttackDesc(atk, npc, md);
      return `${rangeIcon} ${b(atk.name)}  -  ${desc}`;
    });
    parts.push(`${h2("Basic Attacks")}\n${lines.join("\n")}`);
  }

  // Spells
  if (npc.spells?.length) {
    const lines = npc.spells.map((spell) => {
      const offensive = spell.type === "offensive";
      const magic = calcMagic(npc);
      let header = b(spell.name);
      if (offensive) {
        const a1 = ATTR_SHORT[spell.attr1] ?? spell.attr1;
        const a2 = ATTR_SHORT[spell.attr2] ?? spell.attr2;
        const magicStr = magic > 0 ? ` +${magic}` : "";
        header += ` (Offensive)  -  ${b(`[${a1} + ${a2}]${magicStr}`)}  -  ${spell.mp} MP  -  ${spell.target}  -  ${spell.duration}`;
      } else {
        header += `  -  ${spell.mp} MP  -  ${spell.target}  -  ${spell.duration}`;
      }
      return `${header}\n${spell.effect ?? ""}`;
    });
    parts.push(`${h2("Spells")}\n${lines.join("\n\n")}`);
  }

  // Special Rules
  if (npc.special?.length) {
    const lines = npc.special.map((s) => `${b(s.name)}\n${s.effect ?? ""}`);
    parts.push(`${h2("Special Rules")}\n${lines.join("\n\n")}`);
  }

  // Other Actions
  if (npc.actions?.length) {
    const lines = npc.actions.map((s) => `${b(s.name)}\n${s.effect ?? ""}`);
    parts.push(`${h2("Other Actions")}\n${lines.join("\n\n")}`);
  }

  return parts.join("\n\n");
}

// 
// NPC → Obsidian fu-vault formatter
// 

function buildNpcObsidian(npc) {
  const rank = npc.rank || "soldier";
  const a = npc.attributes ?? {};

  const lines = ["```statblock", "layout: Fabula Ultima NPC"];
  lines.push(`name: "${npc.name ?? ""}"`);
  if (rank !== "soldier") lines.push(`rank: ${npcRankLabel(rank)}`);
  lines.push(`level: ${npc.lvl ?? 1}`);
  if (npc.species) lines.push(`species: "${npc.species}"`);
  if (npc.description) lines.push(`description: "${npc.description.replace(/"/g, '\\"').replace(/\n/g, " ")}"`);
  if (npc.traits) lines.push(`traits: "${npc.traits.replace(/"/g, '\\"')}"`);

  lines.push(`\nDEX: ${a.dexterity ?? 6}`);
  lines.push(`INS: ${a.insight ?? 6}`);
  lines.push(`MIG: ${a.might ?? 6}`);
  lines.push(`WLP: ${a.will ?? 6}`);

  lines.push(`\nHP: ${calcHP(npc)}`);
  lines.push(`MP: ${calcMP(npc)}`);
  lines.push(`DEF: ${calcDef(npc)}`);
  lines.push(`MDEF: ${calcMDef(npc)}`);
  lines.push(`initiative: ${calcInit(npc)}`);

  // Affinities
  if (npc.affinities) {
    const affinityLines = [];
    for (const key of NPC_AFFINITY_ORDER) {
      const val = npc.affinities[key];
      if (val && AFFINITY_LABEL[val]) {
        const obsKey = OBSIDIAN_AFFINITY_KEY[key] ?? key;
        affinityLines.push(`${obsKey}: ${AFFINITY_LABEL[val]}`);
      }
    }
    if (affinityLines.length) {
      lines.push("");
      lines.push(...affinityLines);
    }
  }

  // Attacks : split melee/ranged
  const meleeAttacks = (npc.attacks ?? []).filter((a) => a.range !== "distance");
  const rangedAttacks = (npc.attacks ?? []).filter((a) => a.range === "distance");

  if (meleeAttacks.length) {
    lines.push("\nattacks-m:");
    for (const atk of meleeAttacks) {
      const desc = formatAttackDesc(atk, npc, true);
      lines.push(`  - name: "${atk.name ?? ""}"`);
      lines.push(`    desc: "${desc.replace(/"/g, '\\"')}"`);
    }
  }
  if (rangedAttacks.length) {
    lines.push("\nattacks-r:");
    for (const atk of rangedAttacks) {
      const desc = formatAttackDesc(atk, npc, true);
      lines.push(`  - name: "${atk.name ?? ""}"`);
      lines.push(`    desc: "${desc.replace(/"/g, '\\"')}"`);
    }
  }

  // Spells
  if (npc.spells?.length) {
    const magic = calcMagic(npc);
    lines.push("\nspells:");
    for (const spell of npc.spells) {
      const offensive = spell.type === "offensive";
      let name = spell.name ?? "";
      if (offensive) {
        const a1 = ATTR_SHORT[spell.attr1] ?? spell.attr1;
        const a2 = ATTR_SHORT[spell.attr2] ?? spell.attr2;
        const magicStr = magic > 0 ? ` +${magic}` : "";
        name += ` ($) ~ [${a1} + ${a2}]${magicStr}`;
      }
      name += ` ~ ${spell.mp} MP ~ ${spell.target} ~ ${spell.duration}`;
      lines.push(`  - name: "${name.replace(/"/g, '\\"')}"`);
      lines.push(`    desc: "${(spell.effect ?? "").replace(/"/g, '\\"').replace(/\n/g, " ")}"`);
    }
  }

  // Other Actions (skills in fu-vault)
  if (npc.actions?.length) {
    lines.push("\nskills:");
    for (const action of npc.actions) {
      lines.push(`  - name: "${(action.name ?? "").replace(/"/g, '\\"')}"`);
      lines.push(`    desc: "${(action.effect ?? "").replace(/"/g, '\\"').replace(/\n/g, " ")}"`);
    }
  }

  // Special Rules
  if (npc.special?.length) {
    lines.push("\nrules:");
    for (const rule of npc.special) {
      lines.push(`  - name: "${(rule.name ?? "").replace(/"/g, '\\"')}"`);
      lines.push(`    desc: "${(rule.effect ?? "").replace(/"/g, '\\"').replace(/\n/g, " ")}"`);
    }
  }

  lines.push("```");
  return lines.join("\n");
}

// 
// PC text formatter
// 

function buildPcText(player, md) {
  const b = (s) => (md ? `**${s}**` : s);
  const h1 = (s) => (md ? `# ${s}` : s.toUpperCase());
  const h2 = (s) => (md ? `## ${s}` : `--- ${s.toUpperCase()} ---`);

  const parts = [h1(player.name)];
  parts.push(`${b("Level:")} ${player.lvl}`);

  const info = player.info ?? {};
  const infoFields = [
    info.identity && `${b("Identity:")} ${info.identity}`,
    info.theme && `${b("Theme:")} ${info.theme}`,
    info.origin && `${b("Origin:")} ${info.origin}`,
    info.pronouns && `${b("Pronouns:")} ${info.pronouns}`,
  ].filter(Boolean);
  if (infoFields.length) parts.push(infoFields.join("  |  "));
  if (info.description) parts.push(info.description);

  // Attributes
  const a = player.attributes ?? {};
  parts.push(
    `${b("DEX")} d${a.dexterity}  ${b("INS")} d${a.insight}  ${b("MIG")} d${a.might}  ${b("WLP")} d${a.will}`
  );

  // Stats
  const stats = player.stats ?? {};
  const hp = stats.hp ?? {};
  const mp = stats.mp ?? {};
  const ip = stats.ip ?? {};
  parts.push(
    `${b("HP:")} ${hp.current ?? 0}/${hp.base ?? 0}  ${b("MP:")} ${mp.current ?? 0}/${mp.base ?? 0}  ${b("IP:")} ${ip.current ?? 0}/${ip.base ?? 0}`
  );

  const extraFields = [
    player.info?.zenit != null && `${b("Zenit:")} ${player.info.zenit}`,
    player.info?.fabulapoints != null && `${b("FP:")} ${player.info.fabulapoints}`,
    player.info?.exp != null && `${b("Exp:")} ${player.info.exp}`,
  ].filter(Boolean);
  if (extraFields.length) parts.push(extraFields.join("  |  "));

  // Affinities
  const affinityLine = formatNpcAffinities(player.affinities, md);
  if (affinityLine) parts.push(affinityLine);

  // Classes
  if (player.classes?.length) {
    const classLines = [];
    for (const cls of player.classes) {
      classLines.push(`${b(cls.name)} (Lv. ${cls.lvl})`);
      if (cls.skills?.length) {
        for (const skill of cls.skills) {
          if (skill.currentLvl > 0) {
            classLines.push(`  • ${skill.name} (Lv. ${skill.currentLvl}/${skill.maxLvl}): ${skill.description ?? ""}`);
          }
        }
      }
    }
    parts.push(`${h2("Classes")}\n${classLines.join("\n")}`);
  }

  // Equipment summary
  const equip = player.equipment ?? {};
  const equipLines = [];
  if (equip.weapons?.length) {
    for (const w of equip.weapons) {
      const rangeStr = w.isRanged ? "Ranged" : "Melee";
      const handsStr = w.isTwoHand ? "Two-handed" : "One-handed";
      equipLines.push(`${b(w.name)} (${rangeStr}, ${handsStr})`);
    }
  }
  if (equip.armor?.length) {
    for (const armor of equip.armor) {
      if (armor.name) equipLines.push(`${b("Armor:")} ${armor.name}`);
    }
  }
  if (equip.shields?.length) {
    for (const shield of equip.shields) {
      if (shield.name) equipLines.push(`${b("Shield:")} ${shield.name}`);
    }
  }
  if (equipLines.length) {
    parts.push(`${h2("Equipment")}\n${equipLines.join("\n")}`);
  }

  return parts.join("\n\n");
}

// 
// Main dispatcher
// 

export function buildItemText(type, item, fmt) {
  if (type === "npc") {
    if (fmt === "obsidian") return buildNpcObsidian(item);
    return buildNpcText(item, fmt === "markdown");
  }

  if (type === "pc") {
    return buildPcText(item, fmt === "markdown");
  }

  const md = fmt === "markdown";
  const b = (s) => (md ? `**${s}**` : s);
  const em = (s) => (md ? `*${s}*` : s);
  const h1 = (s) => (md ? `# ${s}` : s.toUpperCase());
  const field = (label, value) => (value != null && value !== "" ? `${b(label + ":")} ${value}` : null);
  const resolve = (s) => (typeof s === "string" ? s.replace(/\\n/g, "\n") : String(s ?? ""));

  switch (type) {
    case "heroics": {
      const parts = [h1(resolve(item.name))];
      if (item.quote) parts.push(em(resolve(item.quote)));
      if (item.description) parts.push(resolve(item.description));
      const meta = [
        item.applicableTo?.length && field("Applicable To", item.applicableTo.join(", ")),
        item.book && field("Book", item.book),
        item.source && field("Source", resolve(item.source)),
      ].filter(Boolean);
      if (meta.length) parts.push(meta.join("\n"));
      return parts.join("\n\n");
    }
    case "spells":
    case "player-spells": {
      const st = item.spellType;
      const parts = [h1(resolve(staticT(item.name) || item.name))];

      // Non-static spell types (gifts, dances, etc.)
      if (st && st !== "default" && st !== "gamble") {
        const typeLabel = {
          gift: "Gift", dance: "Dance", therioform: "Therioform",
          magichant: "Tone", symbol: "Symbol", invocation: "Invocation",
          magiseed: "Magiseed", arcanist: "Arcanum", "arcanist-rework": "Arcanum",
          "tinkerer-alchemy": "Alchemy", "tinkerer-infusion": "Infusion",
          "pilot-vehicle": "Pilot Vehicle", cooking: "Delicacy",
        }[st] ?? st;
        parts[0] = `${h1(resolve(staticT(item.name) || item.name))} ${md ? `*(${typeLabel})*` : `(${typeLabel})`}`;

        switch (st) {
          case "gift":
            if (item.event) parts.push(em(resolve(staticT(item.event))));
            if (item.effect) parts.push(resolve(staticT(item.effect)));
            break;
          case "dance":
            if (item.duration) parts.push(field("Duration", resolve(staticT(item.duration))));
            if (item.effect) parts.push(resolve(staticT(item.effect)));
            break;
          case "therioform":
            if (item.genoclepsis) parts.push(em(resolve(staticT(item.genoclepsis))));
            if (item.description) parts.push(resolve(staticT(item.description)));
            break;
          case "magichant":
          case "symbol":
          case "cooking":
            if (item.effect) parts.push(resolve(staticT(item.effect)));
            break;
          case "invocation": {
            const meta = [item.wellspring, item.type].filter(Boolean);
            if (meta.length) parts.push(meta.join(" · "));
            if (item.effect) parts.push(resolve(staticT(item.effect)));
            break;
          }
          case "magiseed":
            if (item.description) parts.push(resolve(staticT(item.description)));
            if (item.effects) {
              const tiers = Object.entries(item.effects)
                .map(([tier, fx]) => `T${tier}: ${resolve(staticT(fx))}`);
              if (tiers.length) parts.push(tiers.join("\n"));
            }
            break;
          case "arcanist":
          case "arcanist-rework":
            if (item.domainDesc) parts.push(`${b("Domain:")} ${resolve(staticT(item.domainDesc))}`);
            if (item.mergeDesc) parts.push(`${b("Merge:")} ${resolve(staticT(item.mergeDesc))}`);
            if (item.dismissDesc) parts.push(`${b("Dismiss:")} ${resolve(staticT(item.dismissDesc))}`);
            break;
          case "tinkerer-alchemy":
            if (item.category) parts.push(b(item.category));
            if (item.effect) parts.push(resolve(item.effect));
            break;
          case "tinkerer-infusion":
            if (item.infusionRank != null) parts.push(field("Rank", item.infusionRank));
            if (item.effect ?? item.description) parts.push(resolve(item.effect ?? item.description));
            break;
          case "pilot-vehicle": {
            const stats2 = [
              item.category && field("Category", item.category),
              item.passengers != null && field("Passengers", item.passengers),
              item.distance && field("Distance", item.distance),
              item.def != null && field("DEF", item.def),
              item.mdef != null && field("MDEF", item.mdef),
              item.martial && field("Martial", "Yes"),
              item.damage != null && field("Damage", `HR+${item.damage}`),
              item.range && field("Range", item.range),
            ].filter(Boolean);
            if (stats2.length) parts.push(stats2.join("\n"));
            if (item.description) parts.push(resolve(staticT(item.description)));
            break;
          }
          default:
            if (item.effect) parts.push(resolve(staticT(item.effect)));
            else if (item.description) parts.push(resolve(staticT(item.description)));
        }
        return parts.join("\n\n");
      }

      // Gamble spell
      if (st === "gamble") {
        const target = item.targetDesc ?? item.target;
        const stats = [
          item.mp != null && field("MP", item.mp),
          target && field("Target", resolve(target)),
          item.duration && field("Duration", resolve(item.duration)),
          item.attr1 && item.attr2 && field("Roll", `${attributes[item.attr1]?.shortcaps} + ${attributes[item.attr2]?.shortcaps}`),
        ].filter(Boolean);
        if (stats.length) parts.push(stats.join("\n"));
        if (item.targets?.length) {
          const rows = item.targets.map((t2) => {
            const range = t2.rangeFrom === t2.rangeTo ? `${t2.rangeFrom}` : `${t2.rangeFrom}–${t2.rangeTo}`;
            return `${range}: ${resolve(staticT(t2.effect))}`;
          });
          parts.push(rows.join("\n"));
        }
        return parts.join("\n\n");
      }

      // Default static spell
      const target = item.targetDesc ?? item.target;
      const stats = [
        item.mp != null && field("MP", item.mp),
        target && field("Target", resolve(target)),
        item.duration && field("Duration", resolve(item.duration)),
        item.attr1 && item.attr2 && field("Roll", `${attributes[item.attr1]?.shortcaps} + ${attributes[item.attr2]?.shortcaps}`),
      ].filter(Boolean);
      if (stats.length) parts.push(stats.join("\n"));
      const effect = item.effect ?? item.description;
      if (effect) parts.push(resolve(staticT(effect)));
      if (item.quality) parts.push(em(resolve(item.quality)));
      return parts.join("\n\n");
    }
    case "weapons": {
      const attr1 = attributes[item.att1];
      const attr2 = attributes[item.att2];
      const dmgType = types[item.type];
      const precStr = item.prec > 0 ? ` +${item.prec}` : item.prec < 0 ? ` ${item.prec}` : "";
      const parts = [h1(resolve(item.name))];
      const stats = [
        item.category && field("Category", resolve(item.category)),
        field("Hands", item.hands === 1 ? "One-handed" : "Two-handed"),
        field("Range", item.melee ? "Melee" : "Ranged"),
        item.martial && field("Martial", "Yes"),
        item.cost != null && field("Cost", `${item.cost}z`),
        attr1 && attr2 && field("Accuracy", `[${attr1.shortcaps} + ${attr2.shortcaps}]${precStr}`),
        item.damage != null && field("Damage", `[HR + ${item.damage}] ${dmgType?.long ?? ""}`),
      ].filter(Boolean);
      if (stats.length) parts.push(stats.join("\n"));
      if (item.quality) parts.push(resolve(item.quality));
      return parts.join("\n\n");
    }
    case "armor":
    case "shields": {
      const parts = [h1(resolve(item.name))];
      const defDisplay = item.category === "Shield"
        ? `+${item.defbonus ?? item.def}`
        : item.martial
          ? String(item.def)
          : item.defbonus ? `DEX die +${item.defbonus}` : "DEX die";
      const mdefDisplay = item.martial
        ? item.mdefbonus ? `INS die +${item.mdefbonus}` : "INS die"
        : item.mdefbonus ? `INS die +${item.mdefbonus}` : "INS die";
      const stats = [
        item.category && field("Category", resolve(item.category)),
        field("DEF", defDisplay),
        field("MDEF", mdefDisplay),
        item.init != null && field("Initiative", item.init === 0 ? " - " : item.init),
        item.cost != null && field("Cost", `${item.cost}z`),
        item.martial && field("Martial", "Yes"),
      ].filter(Boolean);
      if (stats.length) parts.push(stats.join("\n"));
      if (item.quality) parts.push(resolve(item.quality));
      return parts.join("\n\n");
    }
    case "qualities": {
      const parts = [h1(resolve(item.name))];
      const meta = [
        item.category && field("Category", item.category),
        item.cost != null && field("Cost", `${item.cost}z`),
        item.filter?.length && field("Applies To", item.filter.join(", ")),
      ].filter(Boolean);
      if (meta.length) parts.push(meta.join("\n"));
      const effect = item.quality ?? item.effect;
      if (effect) parts.push(resolve(effect));
      return parts.join("\n\n");
    }
    case "classes": {
      const parts = [h1(resolve(item.name))];
      if (item.book) parts.push(field("Book", item.book));
      // Free benefits
      const benefits = item.benefits;
      if (benefits) {
        const bLines = [
          benefits.hpplus > 0 && `+${benefits.hpplus} max HP`,
          benefits.mpplus > 0 && `+${benefits.mpplus} max MP`,
          benefits.ipplus > 0 && `+${benefits.ipplus} max IP`,
          benefits.martials?.armor && "Martial Armor",
          benefits.martials?.melee && "Martial Melee Weapons",
          benefits.martials?.ranged && "Martial Ranged Weapons",
          benefits.martials?.shields && "Martial Shields",
          benefits.rituals?.ritualism && "Ritualism",
        ].filter(Boolean);
        if (bLines.length) parts.push(`${b("Free Benefits:")}\n${bLines.map((l) => `• ${l}`).join("\n")}`);
      }
      // Skills
      if (item.skills?.length) {
        const skillText = item.skills.map((skill) =>
          `${b(resolve(staticT(skill.skillName)))} (Max ${skill.maxLvl})\n${resolve(staticT(skill.description))}`
        ).join("\n\n");
        parts.push(skillText);
      }
      return parts.join("\n\n");
    }
    case "attacks": {
      const attr1 = attributes[item.attr1];
      const attr2 = attributes[item.attr2];
      const dmgType = types[item.type];
      const hitBonus = item.flathit > 0 ? ` +${item.flathit}` : "";
      const parts = [h1(resolve(item.name))];
      const stats = [
        item.category && field("Category", resolve(item.category)),
        item.martial && field("Martial", "Yes"),
        item.range && field("Range", resolve(staticT(item.range))),
        attr1 && attr2
          ? field("Accuracy", `[${attr1.shortcaps} + ${attr2.shortcaps}]${hitBonus}`)
          : field("Accuracy", " - "),
        field("Damage", `[HR + ${item.flatdmg ?? 0}] ${dmgType?.long ?? ""}`),
      ].filter(Boolean);
      if (stats.length) parts.push(stats.join("\n"));
      return parts.join("\n\n");
    }
    case "special":
    case "actions": {
      const parts = [h1(resolve(item.name))];
      if (item.spCost != null && item.spCost !== "") {
        parts.push(field("SP Cost", `${item.spCost} SP`));
      }
      if (item.effect) parts.push(resolve(item.effect));
      else if (item.description) parts.push(resolve(item.description));
      return parts.join("\n\n");
    }
    default: {
      const parts = [h1(resolve(item.name))];
      if (item.description) parts.push(resolve(item.description));
      else if (item.effect) parts.push(resolve(item.effect));
      return parts.join("\n\n");
    }
  }
}
