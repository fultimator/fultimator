import React, { useState, useMemo, useEffect } from "react";
import {
  Paper,
  Typography,
  IconButton,
  Box,
  Chip,
  Tooltip,
  ClickAwayListener,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import {
  Star,
  AutoFixHigh,
  ExpandMore,
  Search,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Add,
  Remove,
  DeleteForever,
  Edit,
  UnfoldMore,
  UnfoldLess,
} from "@mui/icons-material";
import MessageOutlined from "@mui/icons-material/MessageOutlined";
import NotesMarkdown from "/src/components/common/NotesMarkdown";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import { EditPlayerClassModal } from "/src/components/shared/actors/pc/editors";
import PcMnemospheres from "./PcMnemospheres";
import FuidField from "/src/components/common/FuidField";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";
import {
  getSlottedMnemospheres,
} from "/src/libs/player/mnemosphereClassUtils";
import SpellDefault from "/src/components/shared/actors/pc/variants/compact/spells/SpellDefault";
import SpellArcanist from "/src/components/shared/actors/pc/variants/compact/spells/SpellArcanist";
import SpellEntropistGamble from "/src/components/shared/actors/pc/variants/compact/spells/SpellEntropistGamble";
import SpellInvoker from "/src/components/shared/actors/pc/variants/compact/spells/SpellInvoker";
import SpellGourmet from "/src/components/shared/actors/pc/variants/compact/spells/SpellGourmet";
import SpellMagiseed from "/src/components/shared/actors/pc/variants/compact/spells/SpellMagiseed";
import SpellGadget from "/src/components/shared/actors/pc/variants/compact/spells/SpellGadget";
import SpellMagichant from "/src/components/shared/actors/pc/variants/compact/spells/SpellMagichant";
import SpellSymbol from "/src/components/shared/actors/pc/variants/compact/spells/SpellSymbol";
import SpellDance from "/src/components/shared/actors/pc/variants/compact/spells/SpellDance";
import SpellGift from "/src/components/shared/actors/pc/variants/compact/spells/SpellGift";
import SpellTherioform from "/src/components/shared/actors/pc/variants/compact/spells/SpellTherioform";
import SpellVehicle from "/src/components/shared/actors/pc/variants/compact/spells/SpellVehicle";
import SpellDeck from "/src/components/shared/actors/pc/variants/compact/spells/SpellDeck";
import { highlightMatch, highlightMarkdownText } from "/src/components/shared/actors/pc/variants/compact/highlightUtils";
import {
  isAutomaticClassLevelEnabled,
  syncAutomaticClassLevels,
} from "/src/libs/player/classLevelUtils";
import useSphereBank from "/src/hooks/useSphereBank";
import SectionCard from "./SectionCard";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import SelectCompanionModal from "/src/components/shared/actors/pc/editors/classes/SelectCompanionModal";
import {
  firestore,
  query,
  orderBy,
  collection,
  where,
  getDocs,
} from "@platform/db";
import CompactSectionHeader from "/src/components/shared/actors/pc/variants/compact/CompactSectionHeader";
import { SharedSkillCard, SharedHeroicCard } from "/src/components/shared/items/class/SharedClassCards";
import { SharedPlayerSpellCard } from "/src/components/shared/items/spells/SharedSpellCards";
// Utilities

function SectionSubHeader({ children, theme }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 0.5, background: theme.ternary, minHeight: 32 }}>
      {children}
    </Box>
  );
}

function collectStringValues(value, bag = []) {
  if (typeof value === "string") { bag.push(value); return bag; }
  if (Array.isArray(value)) { value.forEach((e) => collectStringValues(e, bag)); return bag; }
  if (value && typeof value === "object") Object.values(value).forEach((e) => collectStringValues(e, bag));
  return bag;
}

function getSpellSearchText(spell, t) {
  const raw = collectStringValues(spell, []);
  return [...raw, ...raw.map((s) => t(s))].join(" ").toLowerCase();
}

function getSpellName(spell, t) {
  const name = spell.name || spell.spellName;
  if (name && name !== t("Unnamed Spell")) return name;
  switch (spell.spellType) {
    case "magiseed": return t("magiseed_garden");
    case "cooking": return t("Gourmet");
    case "invocation": return t("Invoker");
    case "deck": return t("ace_deck_management");
    case "tinkerer-alchemy": return t("Alchemy");
    case "tinkerer-infusion": return t("Infusion");
    case "tinkerer-magitech": return t("Magitech");
    case "magichant": return t("Magichant");
    case "symbol": return t("Symbol");
    case "dance": return t("Dance");
    case "gift": return t("Gift");
    case "therioform": return t("Therioform");
    case "pilot-vehicle": return t("Pilot Vehicle");
    case "arcanist": return t("Arcanist");
    case "arcanist-rework": return t("Arcanist-Rework");
    default: return t("Unnamed Spell");
  }
}

function isVisibleSpell(spell) {
  return (
    (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined) &&
    (spell.spellType === "default" ||
      spell.spellType === "gamble" ||
      spell.spellType === "invocation" ||
      spell.spellType === "cooking" ||
      spell.spellType === "magiseed" ||
      spell.spellType?.startsWith("tinkerer-") ||
      spell.spellType === "magichant" ||
      spell.spellType === "symbol" ||
      spell.spellType === "dance" ||
      spell.spellType === "gift" ||
      spell.spellType === "therioform" ||
      spell.spellType === "pilot-vehicle" ||
      spell.spellType === "deck" ||
      spell.spellType === "arcanist" ||
      spell.spellType === "arcanist-rework")
  );
}

function isComplexSpell(spell) {
  return spell.spellType !== "default" && spell.spellType !== "gamble";
}

function renderSpellContent(spell, onUpdate, searchQuery, highlightMatchFn) {
  switch (spell.spellType) {
    case "default":
      return (
        <SpellDefault
          spellName={highlightMatchFn(spell.name, searchQuery)}
          mp={spell.cost?.amount}
          perTarget={spell.cost?.perTarget ?? true}
          maxTargets={spell.maxTargets}
          targetDescription={spell.targetDescription}
          duration={spell.duration}
          description={highlightMatchFn(spell.description, searchQuery)}
          isEditMode={false}
          isOffensive={spell.isOffensive}
          isMagisphere={spell.isMagisphere || false}
          attr1={spell.accuracy?.attr1}
          attr2={spell.accuracy?.attr2}
        />
      );
    case "gamble": return <SpellEntropistGamble gamble={spell} isEditMode={false} />;
    case "invocation": return <SpellInvoker spell={spell} setPlayer={onUpdate} open={true} />;
    case "cooking": return <SpellGourmet spell={spell} open={true} />;
    case "magiseed": return <SpellMagiseed spell={spell} setPlayer={onUpdate} open={true} />;
    case "magichant": return <SpellMagichant spell={spell} />;
    case "symbol": return <SpellSymbol spell={spell} />;
    case "dance": return <SpellDance spell={spell} />;
    case "gift": return <SpellGift spell={spell} setPlayer={onUpdate} open={true} />;
    case "therioform": return <SpellTherioform spell={spell} />;
    case "pilot-vehicle": return <SpellVehicle spell={spell} />;
    case "deck": return <SpellDeck spell={spell} setPlayer={onUpdate} open={true} />;
    case "arcanist":
    case "arcanist-rework":
      return <SpellArcanist arcana={spell} isEditMode={false} rework={spell.spellType === "arcanist-rework"} />;
    default:
      if (spell.spellType?.startsWith("tinkerer-")) return <SpellGadget spell={spell} />;
      return null;
  }
}
// BenefitChips

const BenefitChip = ({ label, value, tooltipText }) => {
  const [open, setOpen] = useState(false);
  if (value === 0) return null;
  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Tooltip title={tooltipText} open={open} onClose={() => setOpen(false)} disableHoverListener>
        <Chip
          label={`${label}${typeof value === "number" ? ` +${value}` : ""}`}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 0, cursor: "pointer" }}
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        />
      </Tooltip>
    </ClickAwayListener>
  );
};

const BenefitChips = ({ benefits }) => {
  const { t } = useTranslate();
  const chipConfigs = [
    { key: "hpplus", label: t("HP"), tooltip: t("Permanently increase your maximum Hit Points by") },
    { key: "mpplus", label: t("MP"), tooltip: t("Permanently increase your maximum Mind Points by") },
    { key: "ipplus", label: t("IP"), tooltip: t("Permanently increase your maximum Inventory Points by") },
    { key: "rituals.ritualism", label: t("Ritualism"), tooltip: t("You may perform Rituals whose effects fall within the Ritualism discipline.") },
    { key: "martials.melee", label: t("Melee Weapons"), tooltip: t("Gain the ability to equip martial melee weapons.") },
    { key: "martials.ranged", label: t("Ranged Weapons"), tooltip: t("Gain the ability to equip martial ranged weapons.") },
    { key: "martials.shields", label: t("Shields"), tooltip: t("Gain the ability to equip martial shields.") },
    { key: "martials.armor", label: t("Armor"), tooltip: t("Gain the ability to equip martial armor.") },
  ];
  const getValueByPath = (obj, path) => path.split(".").reduce((acc, part) => acc?.[part], obj);
  const getCustomBenefitDisplayText = (text) => {
    if (text.includes("You may start Projects to create unique foods and drinks")) return "Project";
    if (text.includes("You may choose to permanently increase your maximum Hit Points or Mind Points by 5")) return "HP/MP +5 (Choice)";
    return text;
  };
  return (
    <>
      {chipConfigs.map(({ key, label, tooltip }) => {
        const value = getValueByPath(benefits, key);
        if (!value && value !== 0) return null;
        return (
          <BenefitChip
            key={key}
            label={label}
            value={typeof value === "number" ? value : undefined}
            tooltipText={typeof value === "number" ? `${tooltip} ${value}` : tooltip}
          />
        );
      })}
      {benefits.custom?.map((text, i) => (
        <BenefitChip key={`custom-${i}`} label={getCustomBenefitDisplayText(text)} tooltipText={text} />
      ))}
    </>
  );
};

function buildBenefitLines(benefits, t) {
  const lines = [];
  if (!benefits) return lines;
  if (benefits.hpplus > 0) lines.push(`${t("Permanently increase your maximum Hit Points by")} ${benefits.hpplus}.`);
  if (benefits.mpplus > 0) lines.push(`${t("Permanently increase your maximum Mind Points by")} ${benefits.mpplus}.`);
  if (benefits.ipplus > 0) lines.push(`${t("Permanently increase your maximum Inventory Points by")} ${benefits.ipplus}.`);
  if (benefits.martials?.armor) lines.push(t("Gain the ability to equip martial armor."));
  if (benefits.martials?.melee) lines.push(t("Gain the ability to equip martial melee weapons."));
  if (benefits.martials?.ranged) lines.push(t("Gain the ability to equip martial ranged weapons."));
  if (benefits.martials?.shields) lines.push(t("Gain the ability to equip martial shields."));
  if (benefits.rituals?.ritualism) lines.push(t("You may perform Rituals whose effects fall within the Ritualism discipline."));
  if (benefits.custom?.length > 0) lines.push(...benefits.custom);
  return lines;
}

const BenefitText = ({ benefits, clsName, t, theme }) => {
  const lines = buildBenefitLines(benefits, t);
  if (!lines.length) return null;
  const benefitsMarkdown = lines.map((line) => `• ${line}`).join("\n\n");
  return (
    <>
      <SectionSubHeader theme={theme}><Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.1rem" }, textTransform: "uppercase", color: "text.primary", letterSpacing: "0.04em", lineHeight: 1.2 }}>{`${t(clsName)} ${t("Free Benefits")}`}</Typography></SectionSubHeader>
      <Box sx={{ px: 2, py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
        <NotesMarkdown uniform fontSize="1rem">{benefitsMarkdown}</NotesMarkdown>
      </Box>
    </>
  );
};

function hasBenefits(benefits) {
  if (!benefits) return false;
  if (benefits.hpplus || benefits.mpplus || benefits.ipplus) return true;
  if (benefits.rituals?.ritualism) return true;
  if (benefits.martials && Object.values(benefits.martials).some(Boolean)) return true;
  if (benefits.custom?.length) return true;
  return false;
}
// DescriptionArea

function DescriptionArea({ children }) {
  return (
    <Box sx={{ px: 1.5, py: 0.75, borderTop: "1px solid", borderColor: "divider", lineHeight: 1.5, color: "text.secondary" }}>
      {children}
    </Box>
  );
}
// SkillStars

function SkillStars({ current, max, secondaryColor }) {
  const size = 26;
  return (
    <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, gap: "1px" }}>
      {[...Array(Number(max))].map((_, i) =>
        i < Number(current) ? (
          <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95.74 95.98" width={size} height={size}>
            <path fill="gold" opacity=".96" stroke={secondaryColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="6px"
              d="M33.55,33.94l-28.7,11.66c-2.5,1.01-2.46,4.56.06,5.52l29,11.08,11.7,28.97c.98,2.43,4.44,2.41,5.39-.04l11.28-29.09,28.57-11.79c2.54-1.05,2.51-4.66-.05-5.66l-28.84-11.27-11.73-28.5c-1.02-2.47-4.54-2.43-5.5.06l-11.18,29.04Z"
            />
          </svg>
        ) : (
          <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95.74 95.98" width={size} height={size}>
            <path fill="white" opacity=".96" stroke={secondaryColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="6px"
              d="M33.55,33.94l-28.7,11.66c-2.5,1.01-2.46,4.56.06,5.52l29,11.08,11.7,28.97c.98,2.43,4.44,2.41,5.39-.04l11.28-29.09,28.57-11.79c2.54-1.05,2.51-4.66-.05-5.66l-28.84-11.27-11.73-28.5c-1.02-2.47-4.54-2.43-5.5.06l-11.18,29.04Z"
            />
          </svg>
        )
      )}
    </Box>
  );
}
// SkillCard

function SkillCard({ skill, originalIdx, classIdx, translatedDescription, pc, isInteractive, onUpdate, updateMaxStats, searchQuery, compact, theme, t, onPreview }) {
  const [descOpen, setDescOpen] = useState(!compact);
  const cls = pc?.classes?.[classIdx];
  const totalSkillLevels = (cls?.skills ?? []).reduce((sum, s) => sum + (Number(s.currentLvl) || 0), 0);
  const atClassLevelCap = isAutomaticClassLevelEnabled(pc)
    ? (pc?.classes ?? []).reduce((sum, c) => sum + (c?.skills ?? []).reduce((s, sk) => s + (Number(sk.currentLvl) || 0), 0), 0) >= (pc?.lvl ?? 0)
    : cls && totalSkillLevels >= (cls.lvl ?? 0);

  const handleIncrement = () => {
    if (!onUpdate || skill.currentLvl >= skill.maxLvl || atClassLevelCap) return;
    onUpdate((prev) => ({ ...prev, classes: prev.classes.map((c, ci) => ci !== classIdx ? c : { ...c, skills: c.skills.map((s, si) => si === originalIdx ? { ...s, currentLvl: s.currentLvl + 1 } : s) }) }));
    if (updateMaxStats) updateMaxStats();
  };

  const handleDecrement = () => {
    if (!onUpdate || skill.currentLvl <= 0) return;
    onUpdate((prev) => ({ ...prev, classes: prev.classes.map((c, ci) => ci !== classIdx ? c : { ...c, skills: c.skills.map((s, si) => si === originalIdx ? { ...s, currentLvl: s.currentLvl - 1 } : s) }) }));
    if (updateMaxStats) updateMaxStats();
  };

  if (!compact) {
    const hasDesc = !!translatedDescription;
    const forceOpen = !!searchQuery?.trim();
    const expanded = hasDesc ? (descOpen || forceOpen) : false;
    return (
      <Accordion
        disableGutters
        elevation={0}
        square
        expanded={expanded}
        onChange={() => hasDesc && setDescOpen((v) => !v)}
        sx={{ borderTop: `1px solid ${theme.secondary}`, overflow: "hidden", background: "transparent", "&:before": { display: "none" } }}
      >
        <AccordionSummary
          component="div"
          sx={{
            minHeight: 0,
            p: 0,
            background: theme.primary,
            "& .MuiAccordionSummary-content": { m: 0 },
            "& .MuiAccordionSummary-expandIconWrapper": { display: "none" },
            cursor: hasDesc ? "pointer" : "default",
          }}
        >
        <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 0.5, gap: 1, minHeight: 40, width: "100%" }}>
          <Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.1rem" }, textTransform: "uppercase", color: "#fff", flex: 1, lineHeight: 1.3 }}>
            {highlightMatch(t(skill.skillName), searchQuery)}
          </Typography>
          {isInteractive && onUpdate ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
              <SkillStars current={skill.currentLvl} max={skill.maxLvl} secondaryColor={theme.secondary} />
              <Tooltip title={t("Decrease Level")}><span>
                <IconButton size="small" sx={{ p: "3px", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px" }} onClick={handleDecrement} disabled={skill.currentLvl <= 0}>
                  <Remove sx={{ fontSize: "1rem" }} />
                </IconButton>
              </span></Tooltip>
              <Typography sx={{ fontFamily: "Antonio", fontSize: "0.85rem", fontWeight: "bold", color: "#fff", lineHeight: 1 }}>SL{skill.currentLvl}</Typography>
              <Tooltip title={t("Increase Level")}><span>
                <IconButton size="small" sx={{ p: "3px", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px" }} onClick={handleIncrement} disabled={skill.currentLvl >= skill.maxLvl || atClassLevelCap}>
                  <Add sx={{ fontSize: "1rem" }} />
                </IconButton>
              </span></Tooltip>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
              <SkillStars current={skill.currentLvl} max={skill.maxLvl} secondaryColor={theme.secondary} />
              <Typography sx={{ fontFamily: "Antonio", fontSize: "0.85rem", fontWeight: "bold", color: "rgba(255,255,255,0.9)", lineHeight: 1 }}>SL{skill.currentLvl}</Typography>
            </Box>
          )}
          <Tooltip title={t("Send to Chat")}>
            <IconButton size="small" sx={{ p: "3px", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px", flexShrink: 0 }}
              onClick={(e) => { e.stopPropagation(); sendDisplayMessage("skill", t(skill.skillName), { speaker: pc?.info?.name || pc?.name || "", description: translatedDescription || undefined }); }}>
              <MessageOutlined sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </Tooltip>
          {translatedDescription && (
            <IconButton size="small" sx={{ p: "3px", color: "rgba(255,255,255,0.7)", flexShrink: 0 }}
              onClick={(e) => { e.stopPropagation(); setDescOpen((v) => !v); }}>
              {descOpen ? <KeyboardArrowUp sx={{ fontSize: "1.2rem" }} /> : <KeyboardArrowDown sx={{ fontSize: "1.2rem" }} />}
            </IconButton>
          )}
        </Box>
        </AccordionSummary>
        {hasDesc && (
          <AccordionDetails sx={{ p: 0 }}>
            <DescriptionArea>
              <NotesMarkdown uniform fontSize="1rem">{highlightMarkdownText(translatedDescription, searchQuery)}</NotesMarkdown>
            </DescriptionArea>
          </AccordionDetails>
        )}
      </Accordion>
    );
  }

  return (
    <ItemRowCard
      compact
      variant="outlined"
      onCardClick={translatedDescription ? () => onPreview?.({ type: "skill", skill }) : undefined}
      paperSx={{
        transition: "border-color 0.15s ease",
        "&:hover": { borderColor: theme.secondary },
      }}
      label={
        <Typography noWrap sx={{ fontFamily: "Antonio", fontWeight: 800, fontSize: "0.9rem", textTransform: "uppercase", lineHeight: 1.3 }}>
          {highlightMatch(t(skill.skillName), searchQuery)}
        </Typography>
      }
      actions={
        <>
          {isInteractive && onUpdate ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: "2px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
              <Tooltip title={t("Decrease Level")}><span>
                <IconButton size="small" sx={{ p: 0, width: 28, height: 28 }} onClick={handleDecrement} disabled={skill.currentLvl <= 0}><Remove sx={{ fontSize: "1.1rem" }} /></IconButton>
              </span></Tooltip>
              <Box sx={{ fontFamily: "Antonio", fontSize: "0.8rem", fontWeight: "bold", minWidth: 28, textAlign: "center", color: "#fff" }}>{skill.currentLvl}/{skill.maxLvl}</Box>
              <Tooltip title={t("Increase Level")}><span>
                <IconButton size="small" sx={{ p: 0, width: 28, height: 28 }} onClick={handleIncrement} disabled={skill.currentLvl >= skill.maxLvl || atClassLevelCap}><Add sx={{ fontSize: "1.1rem" }} /></IconButton>
              </span></Tooltip>
            </Box>
          ) : (
            <Box sx={{ fontFamily: "Antonio", fontSize: "0.8rem", fontWeight: "bold", color: "#fff", px: "4px", flexShrink: 0 }}>{skill.currentLvl}/{skill.maxLvl}</Box>
          )}
          <Tooltip title={t("Send to Chat")}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); sendDisplayMessage("skill", t(skill.skillName), { speaker: pc?.info?.name || pc?.name || "", description: translatedDescription || undefined }); }}>
              <MessageOutlined />
            </IconButton>
          </Tooltip>
        </>
      }
    />
  );
}

// SpellCard

function SpellCard({ spell, onUpdate, searchQuery, compact, theme, t }) {
  const [descOpen, setDescOpen] = useState(!compact);
  const [preview, setPreview] = useState(false);
  const spellName = getSpellName(spell, t);
  const complex = isComplexSpell(spell);

  if (!compact) {
    const forceOpen = !!searchQuery?.trim();
    const expanded = descOpen || forceOpen;
    return (
      <Accordion
        disableGutters
        elevation={0}
        square
        expanded={expanded}
        onChange={() => setDescOpen((v) => !v)}
        sx={{ borderTop: `1px solid ${theme.secondary}`, overflow: "hidden", background: "transparent", "&:before": { display: "none" } }}
      >
        <AccordionSummary
          component="div"
          sx={{
            minHeight: 0,
            p: 0,
            background: theme.primary,
            "& .MuiAccordionSummary-content": { m: 0 },
            "& .MuiAccordionSummary-expandIconWrapper": { display: "none" },
            cursor: "pointer",
          }}
        >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 0.5, minHeight: 40, width: "100%" }}>
          <AutoFixHigh sx={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.8)", flexShrink: 0 }} />
          <Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.1rem" }, textTransform: "uppercase", color: "#fff", flex: 1, lineHeight: 1.3 }}>
            {highlightMatch(spellName, searchQuery)}
          </Typography>
          <Tooltip title={t("Send to Chat")}>
            <IconButton size="small" sx={{ p: "3px", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px", flexShrink: 0 }}
              onClick={(e) => { e.stopPropagation(); sendDisplayMessage("spell", spellName, { speaker: "", description: spell.description ? t(spell.description) : undefined }); }}>
              <MessageOutlined sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </Tooltip>
          <IconButton size="small" sx={{ p: "3px", color: "rgba(255,255,255,0.7)", flexShrink: 0 }}
            onClick={(e) => { e.stopPropagation(); setDescOpen((v) => !v); }}>
            {descOpen ? <KeyboardArrowUp sx={{ fontSize: "1.2rem" }} /> : <KeyboardArrowDown sx={{ fontSize: "1.2rem" }} />}
          </IconButton>
        </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Box sx={{ px: 2, pb: 0.75, pt: 0.5 }}>{renderSpellContent(spell, onUpdate, searchQuery, highlightMatch)}</Box>
        </AccordionDetails>
      </Accordion>
    );
  }

  return (
    <>
      <ItemRowCard
        compact
        variant="outlined"
        onCardClick={() => setPreview(true)}
        paperSx={{
          gridColumn: complex ? "1 / -1" : undefined,
          transition: "border-color 0.15s ease",
          "&:hover": { borderColor: theme.secondary },
        }}
        label={
          <Typography noWrap sx={{ fontFamily: "Antonio", fontWeight: 800, fontSize: "0.9rem", textTransform: "uppercase", lineHeight: 1.3 }}>
            {highlightMatch(spellName, searchQuery)}
          </Typography>
        }
        actions={
          <Tooltip title={t("Send to Chat")}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); sendDisplayMessage("spell", spellName, { speaker: "", description: spell.description ? t(spell.description) : undefined }); }}>
              <MessageOutlined />
            </IconButton>
          </Tooltip>
        }
      />
      <Dialog open={preview} onClose={() => setPreview(false)} fullWidth maxWidth="sm">
        <DialogContent sx={{ p: 0 }}>
          <SharedPlayerSpellCard item={spell} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreview(false)} variant="contained">{t("Close")}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
// HeroicCard

function HeroicCard({ cls, classIdx, isInteractive, onUpdate, pc, searchQuery, setHeroicPickerClassIdx, compact, theme, t, onPreview }) {
  const [descOpen, setDescOpen] = useState(!compact);
  const hasHeroic = !!cls.heroic?.name;
  const translatedDesc = cls.heroic?.description ? t(cls.heroic.description) : "";

  if (!compact) {
    const forceOpen = !!searchQuery?.trim();
    const expanded = hasHeroic && translatedDesc ? (descOpen || forceOpen) : false;
    return (
      <Accordion
        disableGutters
        elevation={0}
        square
        expanded={expanded}
        onChange={() => hasHeroic && translatedDesc && setDescOpen((v) => !v)}
        sx={{ borderTop: `1px solid ${theme.secondary}`, overflow: "hidden", background: "transparent", "&:before": { display: "none" } }}
      >
        <AccordionSummary
          component="div"
          sx={{
            minHeight: 0,
            p: 0,
            background: theme.primary,
            "& .MuiAccordionSummary-content": { m: 0 },
            "& .MuiAccordionSummary-expandIconWrapper": { display: "none" },
            cursor: hasHeroic && translatedDesc ? "pointer" : "default",
          }}
        >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 0.5, minHeight: 40, width: "100%" }}>
          <Star sx={{ color: "gold", fontSize: "1.2rem", flexShrink: 0 }} />
          <Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.1rem" }, textTransform: "uppercase", color: hasHeroic ? "#fff" : "rgba(255,255,255,0.5)", flex: 1, lineHeight: 1.3 }}>
            {hasHeroic ? highlightMatch(t(cls.heroic.name), searchQuery) : <em>{t("No Heroic Skill")}</em>}
          </Typography>
          {hasHeroic && (
            <Tooltip title={t("Send to Chat")}>
              <IconButton size="small" sx={{ p: "3px", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px", flexShrink: 0 }}
                onClick={(e) => { e.stopPropagation(); sendDisplayMessage("heroic skill", t(cls.heroic.name), { speaker: pc?.info?.name || pc?.name || "", description: translatedDesc || undefined }); }}>
                <MessageOutlined sx={{ fontSize: "1.2rem" }} />
              </IconButton>
            </Tooltip>
          )}
          {hasHeroic && translatedDesc && (
            <IconButton size="small" sx={{ p: "3px", color: "rgba(255,255,255,0.7)", flexShrink: 0 }}
              onClick={(e) => { e.stopPropagation(); setDescOpen((v) => !v); }}>
              {descOpen ? <KeyboardArrowUp sx={{ fontSize: "1.2rem" }} /> : <KeyboardArrowDown sx={{ fontSize: "1.2rem" }} />}
            </IconButton>
          )}
        </Box>
        </AccordionSummary>
        {hasHeroic && translatedDesc && (
          <AccordionDetails sx={{ p: 0 }}>
            <DescriptionArea>
              <NotesMarkdown uniform fontSize="1rem">{highlightMarkdownText(translatedDesc, searchQuery)}</NotesMarkdown>
            </DescriptionArea>
          </AccordionDetails>
        )}
      </Accordion>
    );
  }

  return (
    <ItemRowCard
      compact
      variant="outlined"
      onCardClick={hasHeroic && translatedDesc ? () => onPreview?.({ type: "heroic", heroic: cls.heroic }) : undefined}
      paperSx={{
        transition: "border-color 0.15s ease",
        "&:hover": { borderColor: theme.secondary },
      }}
      label={
        <Typography noWrap sx={{ fontFamily: "Antonio", fontWeight: 800, fontSize: "0.9rem", textTransform: "uppercase", lineHeight: 1.3, color: hasHeroic ? "inherit" : "text.disabled" }}>
          {hasHeroic ? highlightMatch(t(cls.heroic.name), searchQuery) : <em>{t("No Heroic Skill")}</em>}
        </Typography>
      }
      actions={
        hasHeroic ? (
          <Tooltip title={t("Send to Chat")}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); sendDisplayMessage("heroic skill", t(cls.heroic.name), { speaker: pc?.info?.name || pc?.name || "", description: translatedDesc || undefined }); }}>
              <MessageOutlined />
            </IconButton>
          </Tooltip>
        ) : null
      }
    />
  );
}
// SpellTypeAccordion

function getSpellTypeLabel(spellType, t) {
  switch (spellType) {
    case "default": return t("Spells");
    case "gamble": return t("Gamble");
    case "invocation": return t("Invoker");
    case "cooking": return t("Gourmet");
    case "magiseed": return t("magiseed_garden");
    case "tinkerer-alchemy": return t("Alchemy");
    case "tinkerer-infusion": return t("Infusion");
    case "tinkerer-magitech": return t("Magitech");
    case "magichant": return t("Magichant");
    case "symbol": return t("Symbol");
    case "dance": return t("Dance");
    case "gift": return t("Gift");
    case "therioform": return t("Therioform");
    case "pilot-vehicle": return t("Pilot Vehicle");
    case "deck": return t("ace_deck_management");
    case "arcanist": return t("Arcanist");
    case "arcanist-rework": return t("Arcanist-Rework");
    default: return t("Spells");
  }
}

function SpellTypeAccordion({ spellType, spells, classIdx, onUpdate, searchQuery, theme, t }) {
  const label = getSpellTypeLabel(spellType, t);
  return (
    <Accordion disableGutters elevation={0} square
      sx={{ borderTop: `1px solid ${theme.secondary}`, "&:before": { display: "none" }, background: "transparent" }}>
      <AccordionSummary expandIcon={<ExpandMore sx={{ color: "#fff", fontSize: "1.2rem" }} />}
        sx={{ minHeight: 36, px: 2, py: 0, background: theme.primary, "& .MuiAccordionSummary-content": { my: 0.5, alignItems: "center" } }}>
        <Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: "0.85rem", textTransform: "uppercase", color: "#fff", letterSpacing: "0.04em" }}>
          {label}
          <Typography component="span" sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", ml: 1, fontFamily: "Antonio" }}>({spells.length})</Typography>
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {spells.map((spell, spellIdx) => (
          <SpellCard key={`spell-${classIdx}-${spellIdx}`} spell={spell} onUpdate={onUpdate} searchQuery={searchQuery} compact={false} theme={theme} t={t} />
        ))}
      </AccordionDetails>
    </Accordion>
  );
}
// ClassSection

function ClassSection({ cls, classIdx, isInteractive, onUpdate, updateMaxStats, onLevelChange, onRemoveClass, onEditClass, pc, searchQuery, setHeroicPickerClassIdx, compact, defaultExpanded = false, forceExpanded, theme, t }) {
  const [collapsed, setCollapsedState] = useState(compact ? true : !defaultExpanded);
  const [preview, setPreview] = useState(null);
  const [companionModalOpen, setCompanionModalOpen] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState(cls.companion ?? null);
  const [companionList, setCompanionList] = useState([]);
  const [companionLoading, setCompanionLoading] = useState(false);
  const [companionErr, setCompanionErr] = useState(null);

  const isFaithfulCompanionSkill = (sk) =>
    sk.specialSkill === "Faithful Companion" ||
    sk.fuid === "faithful-companion" ||
    sk.skillName === "Faithful Companion";

  const faithfulCompanionSkill = (cls.skills || []).find(
    (sk) => isFaithfulCompanionSkill(sk) && sk.currentLvl > 0,
  );
  const allFaithfulSkills = (pc?.classes || [])
    .flatMap((c) => c.skills || [])
    .filter((sk) => isFaithfulCompanionSkill(sk) && sk.currentLvl > 0);
  const showCompanionSection = Boolean(faithfulCompanionSkill) && allFaithfulSkills.length >= 1;

  useEffect(() => {
    if (!showCompanionSection || !isInteractive) return;
    setCompanionLoading(true);
    setCompanionErr(null);
    const companionsQuery = query(
      collection(firestore, "npc-personal"),
      where("uid", "==", pc.uid),
      where("rank", "==", "companion"),
      orderBy("lvl", "asc"),
      orderBy("name", "asc"),
    );
    getDocs(companionsQuery)
      .then((snap) => setCompanionList(snap.docs.map((d) => ({ ...d.data(), id: d.id }))))
      .catch((e) => setCompanionErr(e.message))
      .finally(() => setCompanionLoading(false));
  }, [showCompanionSection, isInteractive, pc?.uid]);

  const handleSaveCompanion = () => {
    if (!onUpdate || selectedCompanion === null) return;
    onUpdate((prev) => ({
      ...prev,
      classes: prev.classes.map((c, i) =>
        i === classIdx ? { ...c, companion: selectedCompanion } : c,
      ),
    }));
    setCompanionModalOpen(false);
  };

  useEffect(() => {
    if (!compact) return;
    if (searchQuery?.trim()) setCollapsedState(false);
  }, [compact, searchQuery]);
  useEffect(() => {
    if (forceExpanded === null) return;
    setCollapsedState(!forceExpanded.expanded);
  }, [forceExpanded]);

  const visibleSpells = (cls.spells || []).filter(isVisibleSpell);

  const filteredSkills = (cls.skills || [])
    .map((skill, originalIdx) => ({ skill, originalIdx }))
    .filter(({ skill }) => isInteractive || skill.currentLvl >= 1)
    .filter(({ skill }) => {
      if (!searchQuery?.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return t(skill.skillName).toLowerCase().includes(q) || t(skill.description || "").toLowerCase().includes(q);
    });

  const filteredSpells = visibleSpells.filter((spell) => {
    if (!searchQuery?.trim()) return true;
    return getSpellSearchText(spell, t).includes(searchQuery.trim().toLowerCase());
  });

  const heroicVisible =
    cls.lvl === 10 &&
    (!searchQuery?.trim() || (cls.heroic?.name && t(cls.heroic.name).toLowerCase().includes(searchQuery.trim().toLowerCase())));

  const hasContent = filteredSkills.length > 0 || filteredSpells.length > 0 || heroicVisible;
  if (!hasContent && searchQuery?.trim()) return null;

  if (compact) {
    return (
      <>
      <Paper elevation={0} variant="outlined" sx={{ mb: 1, overflow: "hidden" }}>
        <CompactSectionHeader
          title={highlightMatch(t(cls.name), searchQuery)}
          onToggle={() => setCollapsedState((v) => !v)}
          isCollapsed={collapsed}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 28, px: "8px", borderRadius: "4px", bgcolor: "rgba(255,255,255,0.18)" }}>
            <Typography sx={{ color: "#fff", fontFamily: "Antonio", fontSize: "0.85rem", fontWeight: "bold", lineHeight: 1 }}>Lv {cls.lvl}/10</Typography>
          </Box>
          {onEditClass && (
            <Tooltip title={t("Edit Class")} arrow>
              <IconButton size="small" sx={{ p: "3px", color: "rgba(255,255,255,0.85)" }} onClick={(e) => { e.stopPropagation(); onEditClass(classIdx); }}>
                <Edit sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Tooltip>
          )}
        </CompactSectionHeader>
        {!collapsed && (
          <>
            {hasBenefits(cls.benefits) && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, px: "10px", py: "4px", borderBottom: "1px solid", borderColor: "divider", bgcolor: "rgba(0,0,0,0.02)" }}>
                <BenefitChips benefits={cls.benefits} />
              </Box>
            )}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "4px", p: "4px" }}>
              {filteredSkills.map(({ skill, originalIdx }) => (
                <SkillCard key={`skill-${classIdx}-${originalIdx}`} skill={skill} originalIdx={originalIdx} classIdx={classIdx} translatedDescription={t(skill.description || "")} pc={pc} isInteractive={isInteractive} onUpdate={onUpdate} updateMaxStats={updateMaxStats} searchQuery={searchQuery} compact={true} theme={theme} t={t} onPreview={setPreview} />
              ))}
              {heroicVisible && (
                <HeroicCard cls={cls} classIdx={classIdx} isInteractive={isInteractive} onUpdate={onUpdate} pc={pc} searchQuery={searchQuery} setHeroicPickerClassIdx={setHeroicPickerClassIdx} compact={true} theme={theme} t={t} onPreview={setPreview} />
              )}
              {filteredSpells.map((spell, spellIdx) => (
                <SpellCard key={`spell-${classIdx}-${spellIdx}`} spell={spell} onUpdate={onUpdate} searchQuery={searchQuery} compact={true} theme={theme} t={t} />
              ))}
            </Box>
            {showCompanionSection && (
              <Box sx={{ px: "10px", pb: "8px" }}>
                <Divider sx={{ mb: 1 }} />
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: "0.95rem", textTransform: "uppercase" }}>
                    {t("Faithful Companion")}
                    {cls.companion && ` - ${cls.companion.name} Lv ${cls.companion.lvl}`}
                  </Typography>
                  {isInteractive && (
                    <Button size="small" variant="outlined" onClick={() => setCompanionModalOpen(true)} sx={{ height: 26, fontSize: "0.8em" }}>
                      {t("Select")}
                    </Button>
                  )}
                </Box>
                {!cls.companion && <Typography variant="body2" color="text.secondary">{t("No Companion Selected")}</Typography>}
              </Box>
            )}
          </>
        )}
      </Paper>

      {showCompanionSection && (
        <SelectCompanionModal
          open={companionModalOpen}
          onClose={() => setCompanionModalOpen(false)}
          onSave={handleSaveCompanion}
          companionList={companionList}
          setSelectedCompanion={setSelectedCompanion}
        />
      )}

      <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} fullWidth maxWidth="sm">
        <DialogContent sx={{ p: 0 }}>
          {preview?.type === "skill" && (
            <SharedSkillCard item={{ ...preview.skill, skillName: preview.skill.skillName, description: preview.skill.description, currentLvl: preview.skill.currentLvl, className: cls.name }} />
          )}
          {preview?.type === "heroic" && (
            <SharedHeroicCard item={preview.heroic} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreview(null)} variant="contained">{t("Close")}</Button>
        </DialogActions>
      </Dialog>
      </>
    );
  }

  return (
    <>
    <Paper elevation={3} sx={{ mb: 1.5, overflow: "hidden", borderRadius: "8px" }}>
      <Box onClick={() => setCollapsedState((v) => !v)}
        sx={{ background: theme.primary, px: 1, py: "6px", display: "flex", alignItems: "center", borderRadius: collapsed ? "8px" : "8px 8px 0 0", cursor: "pointer", userSelect: "none" }}>
        <Typography noWrap sx={{ color: "#fff", fontFamily: "Antonio", fontWeight: 800, fontSize: { xs: "1.1rem", sm: "1.2rem" }, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1.2, flex: 1 }}>
          {highlightMatch(t(cls.name), searchQuery)}
        </Typography>
        {isInteractive && onLevelChange ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
            <Tooltip title={t("Decrease Level")} arrow><span>
              <IconButton size="small" sx={{ p: "6px", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px" }} disabled={cls.lvl <= 1} onClick={() => onLevelChange(classIdx, Math.max(1, cls.lvl - 1))}>
                <Remove sx={{ fontSize: "1.15rem" }} />
              </IconButton>
            </span></Tooltip>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 36, px: "10px", borderRadius: "4px", bgcolor: "rgba(255,255,255,0.18)", flexShrink: 0 }}>
              <Typography sx={{ color: "#fff", fontFamily: "Antonio", fontSize: "1rem", fontWeight: "bold", lineHeight: 1 }}>Lv {cls.lvl}/10</Typography>
            </Box>
            <Tooltip title={t("Increase Level")} arrow><span>
              <IconButton size="small" sx={{ p: "6px", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px" }} disabled={cls.lvl >= 10} onClick={() => onLevelChange(classIdx, Math.min(10, cls.lvl + 1))}>
                <Add sx={{ fontSize: "1.15rem" }} />
              </IconButton>
            </span></Tooltip>
            {onEditClass && (
              <Tooltip title={t("Edit Class")} arrow>
                <IconButton size="small" sx={{ p: "6px", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px" }} onClick={() => onEditClass(classIdx)}>
                  <Edit sx={{ fontSize: "1.15rem" }} />
                </IconButton>
              </Tooltip>
            )}
            {onRemoveClass && (
              <Tooltip title={t("Remove Class")} arrow>
                <IconButton size="small" sx={{ p: "6px", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "4px" }} onClick={() => onRemoveClass(classIdx)}>
                  <DeleteForever sx={{ fontSize: "1.15rem" }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 36, px: "8px", borderRadius: "4px", bgcolor: "rgba(255,255,255,0.18)" }}>
              <Typography sx={{ color: "#fff", fontFamily: "Antonio", fontSize: "1rem", fontWeight: "bold", lineHeight: 1 }}>Lv {cls.lvl}/10</Typography>
            </Box>
            {onEditClass && (
              <Tooltip title={t("Edit Class")} arrow>
                <IconButton size="small" sx={{ p: "6px", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px" }} onClick={(e) => { e.stopPropagation(); onEditClass(classIdx); }}>
                  <Edit sx={{ fontSize: "1.15rem" }} />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" sx={{ p: "4px", color: "#fff", flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); setCollapsedState((v) => !v); }}>
              {collapsed ? <KeyboardArrowDown sx={{ fontSize: "1.3rem" }} /> : <KeyboardArrowUp sx={{ fontSize: "1.3rem" }} />}
            </IconButton>
          </Box>
        )}
      </Box>
      {!collapsed && (
        <>
          {hasBenefits(cls.benefits) && <BenefitText benefits={cls.benefits} clsName={cls.name} t={t} theme={theme} />}
          <Box>
            {filteredSkills.length > 0 && <SectionSubHeader theme={theme}><Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.1rem" }, textTransform: "uppercase", color: "text.primary", letterSpacing: "0.04em", lineHeight: 1.2 }}>{t("Skills")}</Typography></SectionSubHeader>}
            {filteredSkills.map(({ skill, originalIdx }) => (
              <SkillCard key={`skill-${classIdx}-${originalIdx}`} skill={skill} originalIdx={originalIdx} classIdx={classIdx} translatedDescription={t(skill.description || "")} pc={pc} isInteractive={isInteractive} onUpdate={onUpdate} updateMaxStats={updateMaxStats} searchQuery={searchQuery} compact={false} theme={theme} t={t} />
            ))}
            {heroicVisible && (
              <>
                <SectionSubHeader theme={theme}><Star sx={{ fontSize: "1rem", color: theme.secondary, mr: 0.5, flexShrink: 0 }} /><Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.1rem" }, textTransform: "uppercase", color: "text.primary", letterSpacing: "0.04em", lineHeight: 1.2 }}>{t("Heroic Skill")}</Typography></SectionSubHeader>
                <HeroicCard cls={cls} classIdx={classIdx} isInteractive={isInteractive} onUpdate={onUpdate} pc={pc} searchQuery={searchQuery} setHeroicPickerClassIdx={setHeroicPickerClassIdx} compact={false} theme={theme} t={t} />
              </>
            )}
            {Object.entries(
              filteredSpells.reduce((groups, spell) => {
                const key = spell.spellType ?? "default";
                if (!groups[key]) groups[key] = [];
                groups[key].push(spell);
                return groups;
              }, {})
            ).map(([spellType, spells]) => (
              <SpellTypeAccordion key={`spellgroup-${classIdx}-${spellType}`} spellType={spellType} spells={spells} classIdx={classIdx} onUpdate={onUpdate} searchQuery={searchQuery} theme={theme} t={t} />
            ))}
            {showCompanionSection && (
              <>
                <SectionSubHeader theme={theme}>
                  <Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.1rem" }, textTransform: "uppercase", color: "text.primary", letterSpacing: "0.04em", lineHeight: 1.2 }}>
                    {t("Faithful Companion")}
                  </Typography>
                  {isInteractive && (
                    <Button size="small" variant="outlined" onClick={() => setCompanionModalOpen(true)} sx={{ height: 28, fontSize: "0.85em", ml: "auto", mr: 1 }}>
                      {t("Select")}
                    </Button>
                  )}
                </SectionSubHeader>
                <Box sx={{ px: 2, py: 1 }}>
                  {cls.companion
                    ? <Typography sx={{ fontFamily: "Antonio", fontSize: "1rem" }}>{cls.companion.name} - {t("Lvl")} {cls.companion.lvl}</Typography>
                    : <Typography color="text.secondary">{t("No Companion Selected")}</Typography>
                  }
                  {companionLoading && <Typography variant="body2">{t("Loading...")}</Typography>}
                  {companionErr && <Typography variant="body2" color="error">{t("Error Loading Companion List")}: {companionErr}</Typography>}
                </Box>
              </>
            )}
          </Box>
        </>
      )}
    </Paper>
    {showCompanionSection && (
      <SelectCompanionModal
        open={companionModalOpen}
        onClose={() => setCompanionModalOpen(false)}
        onSave={handleSaveCompanion}
        companionList={companionList}
        setSelectedCompanion={setSelectedCompanion}
      />
    )}
    </>
  );
}
// Main export

export default function PcClasses({
  pc,
  variant = "compact",
  isInteractive = false,
  onUpdate,
  updateMaxStats,
  searchQuery = "",
  defaultExpanded = false,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();


  const isCompact = variant === "compact";

  const isTechnospheres = pc?.settings?.optionalRules?.technospheres ?? false;
  const technospheresVariant = pc?.settings?.optionalRules?.technospheresVariant ?? "standard";
  const usesInnateClassRules = isTechnospheres && technospheresVariant !== "hoplospheres";
  const mnemoHidden = isTechnospheres && (technospheresVariant === "mnemospheres" || technospheresVariant === "hoplospheres");
  const automaticClassLevel = isAutomaticClassLevelEnabled(pc);
  const canAddMoreClasses = !usesInnateClassRules || (pc?.classes?.length ?? 0) < 3;

  const [heroicPickerClassIdx, setHeroicPickerClassIdx] = useState(null);
  const [editClassIdx, setEditClassIdx] = useState(null);
  const [pendingEditClassRef, setPendingEditClassRef] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassFuid, setNewClassFuid] = useState(undefined);
  const [compendiumOpen, setCompendiumOpen] = useState(false);
  const [expandSignal, setExpandSignal] = useState(null); // null=unset, {expanded,seq}

  const syncClassLevels = (next) => automaticClassLevel ? syncAutomaticClassLevels(next) : next;

  const syncInnateClasses = (next) => {
    if (!usesInnateClassRules) return next;
    const innateClasses = (next.classes ?? []).map((cls) => cls.name).filter(Boolean).slice(0, 3);
    return { ...next, settings: { ...next.settings, optionalRules: { ...next.settings?.optionalRules, innateClasses } } };
  };

  const applyUpdate = (updater) => {
    if (!onUpdate) return;
    onUpdate((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return syncInnateClasses(syncClassLevels(next));
    });
  };

  const addClassToPlayer = (name, isHomebrew, fuid, sourceItem = null, autoOpenEditor = false) => {
    const classExists = (pc?.classes ?? []).some((cls) => cls.name.toLowerCase() === name.toLowerCase());
    if (classExists) { alert(t("This class type already exists for the character")); return; }
    const sortedSkills = (sourceItem?.skills || []).slice().sort((a, b) => {
      if (a.skillName < b.skillName) return -1;
      if (a.skillName > b.skillName) return 1;
      return 0;
    });
    applyUpdate((prev) => ({
      ...prev,
      classes: [...(Array.isArray(prev.classes) ? prev.classes : []), {
        name,
        fuid,
        lvl: 1,
        _packItemId: sourceItem?._packItemId,
        benefits: {
          ...(sourceItem?.benefits ?? {}),
          rituals: {
            ritualism: false,
            arcanism: false,
            elementalism: false,
            ...(sourceItem?.benefits?.rituals ?? {}),
          },
        },
        skills: sortedSkills,
        heroic: sourceItem?.heroic || { name: "", description: "" },
        spells: sourceItem?.spells || [],
        isHomebrew: isHomebrew || false,
      }],
    }));
    if (autoOpenEditor) {
      setPendingEditClassRef({ name, fuid: fuid ?? null });
    } else {
      setPendingEditClassRef(null);
    }
    if (updateMaxStats) updateMaxStats();
    setDialogOpen(false);
    setNewClassName("");
    setNewClassFuid(undefined);
  };

  useEffect(() => {
    if (!pendingEditClassRef) return;
    const idx = (pc?.classes ?? []).findIndex(
      (cls) => cls?.name === pendingEditClassRef.name && (cls?.fuid ?? null) === pendingEditClassRef.fuid,
    );
    if (idx < 0) return;
    setEditClassIdx(idx);
    setPendingEditClassRef(null);
  }, [pendingEditClassRef, pc?.classes]);

  const handleRemoveClass = (index) => {
    applyUpdate((prev) => ({ ...prev, classes: prev.classes.filter((_, i) => i !== index) }));
    if (updateMaxStats) updateMaxStats();
  };

  const handleLevelChange = (index, newLevel) => {
    applyUpdate((prev) => {
      const updatedClasses = prev.classes.map((cls, i) => i === index ? { ...cls, lvl: newLevel } : cls);
      if (newLevel === 10 && !updatedClasses[index].heroic) updatedClasses[index].heroic = { name: "", description: "" };
      const totalLevels = updatedClasses.reduce((acc, cls) => acc + parseInt(cls.lvl), 0);
      return { ...prev, classes: updatedClasses, lvl: totalLevels };
    });
    if (updateMaxStats) updateMaxStats();
  };

  const handleSaveClassEdit = (index, patch) => {
    applyUpdate((prev) => ({
      ...prev,
      classes: prev.classes.map((cls, i) => {
        if (i !== index) return cls;
        const mergedSkills = patch.skills.map((ps) => {
          const existing = cls.skills?.find((s) => s.skillName === ps.skillName);
          return existing ? { ...ps, currentLvl: existing.currentLvl } : { ...ps, currentLvl: 0 };
        });
        return { ...cls, ...patch, skills: mergedSkills };
      }),
    }));
    if (updateMaxStats) updateMaxStats();
  };

  const handleAddHeroic = (item) => {
    if (heroicPickerClassIdx === null || !onUpdate) return;
    applyUpdate((prev) => ({
      ...prev,
      classes: prev.classes.map((cls, i) => i === heroicPickerClassIdx ? { ...cls, heroic: { name: item.name, description: item.description } } : cls),
    }));
  };

  const openEditClass = (idx) => setEditClassIdx(idx);

  const {
    changeMnemoSkillLevel,
    getMnemoAvailableLevels,
    investMnemoLevel,
    refundMnemoLevel,
  } = useSphereBank(isInteractive && onUpdate ? pc : null, isInteractive && onUpdate ? (updater) => onUpdate(updater) : () => {});

  const advancement = pc?.settings?.advancement ?? false;

  const slottedMnemospheres = useMemo(
    () => usesInnateClassRules && !mnemoHidden ? getSlottedMnemospheres(pc) : [],
    [usesInnateClassRules, mnemoHidden, pc],
  );

  const warnings = (() => {
    const w = [];
    if (usesInnateClassRules) {
      const innateCount = pc.classes?.length ?? 0;
      if (innateCount !== 3) w.push("Technospheres: character must have exactly 3 innate classes.");
      const innateTotal = pc.classes ? pc.classes.reduce((s, c) => s + parseInt(c.lvl), 0) : 0;
      const mnemoTotal = pc.info?.mnemoLevelsSpent ?? 0;
      if (innateTotal + mnemoTotal > pc.lvl) w.push("Sum of innate class levels and invested mnemosphere levels exceeds character level.");
    } else {
      if (!pc.classes || pc.classes.length < 2) w.push("Character must have at least 2 classes.");
      const maxLvlCount = pc.classes ? pc.classes.filter((c) => c.lvl >= 10).length : 0;
      if (pc.classes && pc.classes.length - maxLvlCount > 3) w.push("The number of classes exceeds the limit beyond the number of classes at level 10.");
      const total = pc.classes ? pc.classes.reduce((s, c) => s + parseInt(c.lvl), 0) : 0;
      if (total !== pc.lvl) w.push("Sum of class levels isn't equal to character level.");
    }
    return w;
  })();

  const totalInvested = (pc?.classes ?? []).reduce((s, c) => s + (parseInt(c.lvl) || 0), 0);
  const characterLevel = pc?.lvl ?? 0;
  const totalMnemoInvested = pc?.info?.mnemoLevelsSpent ?? 0;
  const editingClass = editClassIdx !== null ? pc?.classes?.[editClassIdx] : null;

  const filteredClasses = (pc?.classes ?? []).filter((cls) => {
    if (!searchQuery?.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      t(cls.name).toLowerCase().includes(q) ||
      cls.skills?.some((s) => t(s.skillName).toLowerCase().includes(q) || t(s.description || "").toLowerCase().includes(q)) ||
      (cls.heroic && t(cls.heroic.name).toLowerCase().includes(q)) ||
      cls.spells?.some((spell) => getSpellSearchText(spell, t).includes(q))
    );
  });

  const classesActions = (
    <Box sx={{ display: "flex", alignItems: "center", gap: isCompact ? 0.5 : 1 }}>
      {isInteractive && (
        <>
          <Tooltip title={t("Add Blank Class")}>
            <span>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setDialogOpen(true);
                }}
                disabled={!canAddMoreClasses}
                sx={{ color: "#fff", p: "2px", flexShrink: 0 }}
              >
                <Add sx={{ fontSize: isCompact ? "1rem" : "1.1rem" }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t("Search Class Compendium")}>
            <span>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setCompendiumOpen(true);
                }}
                sx={{ color: "#fff", p: "2px", flexShrink: 0 }}
              >
                <Search sx={{ fontSize: isCompact ? "1rem" : "1.1rem" }} />
              </IconButton>
            </span>
          </Tooltip>
        </>
      )}
      <Typography sx={{ color: "rgba(255,255,255,0.8)", fontFamily: "Antonio", fontWeight: 700, fontSize: isCompact ? { xs: "0.65rem", sm: "0.75rem" } : { xs: "0.75rem", sm: "0.875rem" }, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", flexShrink: 0 }}>
        {t("Total Invested Levels")}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: "2px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
        {[totalInvested, usesInnateClassRules ? characterLevel - totalMnemoInvested : characterLevel].map((val, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "center" }}>
            {i === 1 && <Typography sx={{ color: "#fff", fontFamily: "Antonio", fontWeight: 700, fontSize: isCompact ? "0.8rem" : "1rem", px: "2px" }}>/</Typography>}
            <Box sx={{ background: "#fff", color: theme.primary, fontFamily: "Antonio", fontWeight: 700, fontSize: isCompact ? "0.8rem" : "1rem", px: isCompact ? 0.5 : 0.75, py: "1px", minWidth: isCompact ? 24 : 32, textAlign: "center", borderRadius: "2px" }}>{val}</Box>
          </Box>
        ))}
      </Box>
      <Tooltip title={expandSignal?.expanded ? t("Collapse All Classes") : t("Expand All Classes")}>
        <IconButton
          size="small"
          data-expand-all-classes={expandSignal?.expanded ? "expanded" : "collapsed"}
          onClick={(e) => { e.stopPropagation(); setExpandSignal((v) => ({ expanded: !v?.expanded, seq: (v?.seq ?? 0) + 1 })); }}
          sx={{ color: "#fff", p: "2px", flexShrink: 0 }}
        >
          {expandSignal?.expanded
            ? <UnfoldLess sx={{ fontSize: isCompact ? "1.1rem" : "1.3rem" }} />
            : <UnfoldMore sx={{ fontSize: isCompact ? "1.1rem" : "1.3rem" }} />}
        </IconButton>
      </Tooltip>
    </Box>
  );

  const classesContent = (
    <>

      <Box sx={{ p: isCompact ? "4px" : 1 }}>
            {warnings.length > 0 && (
              <Box sx={{ mb: 0.5 }}>
                {warnings.map((w, i) => (
                  <Alert
                    key={i}
                    severity="warning"
                    sx={{ py: 0, mb: 0.25, "& .MuiAlert-message": { fontSize: "1rem" } }}
                  >
                    {t(w)}
                  </Alert>
                ))}
              </Box>
            )}

            {filteredClasses.map((cls, classIdx) => (
              <ClassSection
                key={`class-${classIdx}`}
                cls={cls}
                classIdx={classIdx}
                isInteractive={isInteractive}
                onUpdate={isInteractive ? applyUpdate : undefined}
                updateMaxStats={updateMaxStats}
                onLevelChange={isInteractive && !automaticClassLevel ? handleLevelChange : undefined}
                onRemoveClass={isInteractive ? handleRemoveClass : undefined}
                onEditClass={isInteractive ? openEditClass : undefined}
                pc={pc}
                searchQuery={searchQuery}
                setHeroicPickerClassIdx={setHeroicPickerClassIdx}
                compact={isCompact}
                defaultExpanded={defaultExpanded}
                forceExpanded={expandSignal}
                theme={theme}
                t={t}
              />
            ))}
            {filteredClasses.length === 0 && (
              <Typography
                sx={{
                  px: 1,
                  py: 1.25,
                  textAlign: "center",
                  color: "text.secondary",
                  fontFamily: "Antonio",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {t("No classes added yet")}
              </Typography>
            )}
      </Box>

      <EditPlayerClassModal
        open={editClassIdx !== null}
        onClose={() => setEditClassIdx(null)}
        cls={editingClass}
        onSave={(patch) => handleSaveClassEdit(editClassIdx, patch)}
        onDelete={() => {
          handleRemoveClass(editClassIdx);
          setEditClassIdx(null);
        }}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t("Add Blank Class")}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField fullWidth label={t("Class Name")} value={newClassName} onChange={(e) => setNewClassName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && newClassName.trim() && addClassToPlayer(newClassName.trim(), true, newClassFuid, null, true)} />
            <FuidField value={newClassFuid} name={newClassName} onChange={setNewClassFuid} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t("Cancel")}</Button>
          <Button variant="contained" disabled={!newClassName.trim()} onClick={() => addClassToPlayer(newClassName.trim(), true, newClassFuid, null, true)}>{t("Add")}</Button>
        </DialogActions>
      </Dialog>

      <CompendiumViewerModal open={compendiumOpen} onClose={() => setCompendiumOpen(false)} onAddItem={(item) => { if (!item) return; setPendingEditClassRef(null); addClassToPlayer(item.name, item.isHomebrew ?? false, item.fuid, item, false); setCompendiumOpen(false); }} initialType="classes" restrictToTypes={["classes"]} context="player" />

      <CompendiumViewerModal open={heroicPickerClassIdx !== null} onClose={() => setHeroicPickerClassIdx(null)} onAddItem={handleAddHeroic} initialType="heroics" restrictToTypes={["heroics"]} context="player" />
    </>
  );

  return (
    <>
      {isCompact ? (
        <Paper sx={{ mb: 1, overflow: "hidden" }} elevation={0} variant="outlined">
          <CompactSectionHeader title={t(usesInnateClassRules ? "Innate Classes" : "Classes")}>
            {classesActions}
          </CompactSectionHeader>
          {classesContent}
        </Paper>
      ) : (
        <SectionCard
          title={t(usesInnateClassRules ? "Innate Classes" : "Classes")}
          sx={{ minWidth: 0, mb: 1 }}
          actions={classesActions}
        >
          {classesContent}
        </SectionCard>
      )}

      {usesInnateClassRules && slottedMnemospheres.length > 0 && (
        <PcMnemospheres
          pc={pc}
          slottedMnemospheres={slottedMnemospheres}
          allMnemospheres={pc?.equipment?.[0]?.mnemospheres ?? []}
          variant={variant}
          isInteractive={isInteractive && !advancement}
          searchQuery={searchQuery}
          totalMnemoInvested={totalMnemoInvested}
          characterLevel={characterLevel}
          totalInnateInvested={totalInvested}
          usesInnateClassRules={usesInnateClassRules}
          onChangeMnemoSkillLevel={changeMnemoSkillLevel}
          onInvestLevel={investMnemoLevel}
          onRefundLevel={refundMnemoLevel}
          getMnemoAvailableLevels={getMnemoAvailableLevels}
        />
      )}
    </>
  );
}
