import { PDF } from "@libpdf/core";
import { TypeNpc } from "../types/Npcs";
import { calcHP, calcMP, calcInit, calcDef, calcMDef } from "../libs/npcs";
import { t } from "../translation/translate";

function stripMarkdown(text: string | undefined | null): string {
  if (!text) return "";
  return text.replace(/\*\*/g, "").replace(/【/g, "[").replace(/】/g, "]");
}

function tr(key: string | undefined | null): string {
  return stripMarkdown(t(key ?? ""));
}

// Two-letter abbreviations used by the PDF form for affinity values
const AFFINITY_ABBREV: Record<string, string> = {
  vu: "VU",
  rs: "RS",
  im: "IM",
  ab: "AB",
  no: "-",
  "": "-",
};

const AFFINITY_FIELDS: Record<string, string> = {
  physical: "Campo testo 2043",
  air: "Campo testo 2044",
  bolt: "Campo testo 2045",
  dark: "Campo testo 2046",
  earth: "Campo testo 2047",
  fire: "Campo testo 2048",
  ice: "Campo testo 2049",
  light: "Campo testo 2050",
  poison: "Campo testo 2051",
};

function rankLabel(npc: TypeNpc): string {
  switch (npc.rank) {
    case "elite":
      return "Elite";
    case "champion1":
      return "Champion (1)";
    case "champion2":
      return "Champion (2)";
    case "champion3":
      return "Champion (3)";
    case "champion4":
      return "Champion (4)";
    case "champion5":
      return "Champion (5)";
    case "champion6":
      return "Champion (6)";
    case "companion":
      return "Companion";
    case "groupvehicle": {
      const size = npc.sizes ? ` - ${npc.sizes}` : "";
      return `Group Vehicle${size}`;
    }
    default:
      return "";
  }
}

function buildDescriptionBlock(npc: TypeNpc): string {
  const headerParts: string[] = [];

  const rank = rankLabel(npc);
  if (rank) headerParts.push(rank);
  if (npc.phases) headerParts.push(`Phases: ${npc.phases}`);
  if (npc.villain) headerParts.push(`Villain: ${npc.villain}`);
  if (npc.multipart) headerParts.push(`Multi-Part: ${npc.multipart}`);

  const header = headerParts.join(" | ");
  const desc = stripMarkdown(npc.description ?? "");

  if (header && desc) return `${header}\n${desc}`;
  return header || desc;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatNpcAccuracy(acc: any): string {
  if (!acc) return "";
  const a1 = String(acc.attr1 ?? "")
    .toUpperCase()
    .slice(0, 3);
  const a2 = String(acc.attr2 ?? "")
    .toUpperCase()
    .slice(0, 3);
  if (!a1 && !a2) return "";
  const mod =
    acc.value !== undefined
      ? ` [${acc.value >= 0 ? "+" : ""}${acc.value}]`
      : "";
  return `${a1}+${a2}${mod}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatNpcDamage(dmg: any): string {
  if (!dmg) return "";
  const parts: string[] = [];
  if (dmg.value) parts.push(String(dmg.value));
  if (dmg.type) parts.push(dmg.type);
  if (dmg.hrZero) parts.push("HR 0");
  return parts.join(" ");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatAttack(atk: any): string {
  const parts: string[] = [tr(atk.name)];
  const acc = formatNpcAccuracy(atk.accuracy);
  if (acc) parts.push(acc);
  const dmg = formatNpcDamage(atk.damage);
  if (dmg) parts.push(`DMG: ${dmg}`);
  if (atk.effect) parts.push(stripMarkdown(atk.effect));
  return parts.join(" | ");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatSpell(spell: any): string {
  const parts: string[] = [tr(spell.name)];
  if (spell.cost?.amount !== undefined) parts.push(`MP: ${spell.cost.amount}`);
  if (spell.maxTargets !== undefined)
    parts.push(`Targets: ${spell.maxTargets}`);
  if (spell.duration) parts.push(`Duration: ${tr(spell.duration)}`);
  const acc = formatNpcAccuracy(spell.accuracy);
  if (acc) parts.push(acc);
  if (spell.isOffensive !== false) {
    const dmg = formatNpcDamage(spell.damage);
    if (dmg) parts.push(`DMG: ${dmg}`);
  }
  const desc = stripMarkdown(spell.effect ?? spell.description ?? "");
  if (desc) parts.push(desc);
  return parts.join(" | ");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatAction(action: any): string {
  const parts: string[] = [tr(action.name)];
  if (action.spCost !== undefined) parts.push(`SP: ${action.spCost}`);
  const desc = stripMarkdown(action.effect ?? action.description ?? "");
  if (desc) parts.push(desc);
  return parts.join(" | ");
}

function buildFieldMap(npc: TypeNpc): Record<string, string> {
  const fields: Record<string, string> = {};

  fields["Campo testo 204"] = npc.name ?? "";
  fields["Campo testo 2052"] = String(npc.lvl ?? "");
  fields["Campo testo 2053"] = npc.species ?? "";
  fields["Campo testo 102018"] = buildDescriptionBlock(npc);
  fields["Campo testo 102019"] = stripMarkdown(npc.traits ?? "");

  const attrs = npc.attributes ?? ({} as TypeNpc["attributes"]);
  fields["Campo testo 2033"] = String(attrs.dexterity?.base ?? "");
  fields["Campo testo 2034"] = String(attrs.insight?.base ?? "");
  fields["Campo testo 2035"] = String(attrs.might?.base ?? "");
  fields["Campo testo 2036"] = String(attrs.will?.base ?? "");

  const hp = calcHP(npc);
  fields["Campo testo 2039"] = String(hp);
  fields["Campo testo 2040"] = String(Math.floor(hp / 2));
  fields["Campo testo 2041"] = String(calcMP(npc));
  fields["Campo testo 2042"] = String(calcInit(npc));
  fields["Campo testo 2037"] = String(calcDef(npc));
  fields["Campo testo 2038"] = String(calcMDef(npc));

  for (const [type, fieldId] of Object.entries(AFFINITY_FIELDS)) {
    const val = String(
      ((npc.affinities as Record<string, string>) ?? {})[type] ?? "",
    );
    fields[fieldId] = AFFINITY_ABBREV[val] ?? val.toUpperCase();
  }

  // Equipment (armor + shield)
  const equipParts: string[] = [];
  if (npc.armor?.name) {
    const armorParts = [npc.armor.name];
    if (npc.armor.def !== undefined) armorParts.push(`DEF +${npc.armor.def}`);
    if (npc.armor.mdef !== undefined)
      armorParts.push(`M.DEF +${npc.armor.mdef}`);
    if (npc.armor.init !== undefined && npc.armor.init !== 0)
      armorParts.push(`INIT ${npc.armor.init}`);
    equipParts.push(armorParts.join(" "));
  }
  if (npc.shield?.name) {
    const shieldParts = [npc.shield.name];
    if (npc.shield.def !== undefined)
      shieldParts.push(`DEF +${npc.shield.def}`);
    if (npc.shield.mdef !== undefined)
      shieldParts.push(`M.DEF +${npc.shield.mdef}`);
    shieldParts.push("(Shield)");
    equipParts.push(shieldParts.join(" "));
  }
  if (equipParts.length) fields["Campo testo 102025"] = equipParts.join("\n");

  const allAttacks = [...(npc.attacks ?? []), ...(npc.weaponattacks ?? [])];
  const melee = allAttacks.filter((a) => !a.range || a.range === "melee");
  const ranged = allAttacks.filter((a) => a.range === "ranged");

  if (melee.length)
    fields["Campo testo 102020"] = melee.map(formatAttack).join("\n");
  if (ranged.length)
    fields["Campo testo 102021"] = ranged.map(formatAttack).join("\n");

  if (npc.spells?.length)
    fields["Campo testo 102022"] = npc.spells.map(formatSpell).join("\n");
  if (npc.actions?.length)
    fields["Campo testo 102023"] = npc.actions.map(formatAction).join("\n");

  const specialLines = (npc.special ?? []).map(formatAction);
  const noteLines = (npc.notes ?? [])
    .map((n) =>
      n.name
        ? `${n.name}: ${stripMarkdown(n.description ?? n.effect ?? "")}`
        : stripMarkdown(n.description ?? n.effect ?? ""),
    )
    .filter(Boolean);
  const rareGearLines = (npc.raregear ?? []).map(formatAction);
  const specialBlock = [...specialLines, ...rareGearLines, ...noteLines].join(
    "\n",
  );
  if (specialBlock) fields["Campo testo 102024"] = specialBlock;

  return fields;
}

function triggerDownload(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes.slice().buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function useNpcPrintPDF() {
  const printPDF = async (npc: TypeNpc) => {
    const response = await fetch("/pdf/Fabula-Ultima-NPC-Sheet.pdf");
    const pdf = await PDF.load(new Uint8Array(await response.arrayBuffer()));
    const form = pdf.getForm();
    if (!form) {
      console.warn("No form found in PDF");
      return;
    }
    form.fill(buildFieldMap(npc));
    triggerDownload(await pdf.save(), `${npc.name ?? "npc"}_print.pdf`);
  };

  return [printPDF] as const;
}
