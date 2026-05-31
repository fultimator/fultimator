import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Remove,
  Star,
} from "@mui/icons-material";
import MessageOutlined from "@mui/icons-material/MessageOutlined";
import NotesMarkdown from "/src/components/common/NotesMarkdown";
import StatTooltip from "/src/components/common/StatTooltip";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import SectionCard from "./SectionCard";
import CompactSectionHeader from "/src/components/shared/actors/pc/variants/compact/CompactSectionHeader";
import { highlightMatch, highlightMarkdownText } from "/src/components/shared/actors/pc/variants/compact/highlightUtils";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";
import {
  getMnemosphereSkillDescription,
  getMnemosphereHeroicDescription,
} from "/src/libs/player/mnemosphereClassUtils";
import { getMnemosphereCost } from "/src/libs/mnemospheres";
import ItemRowCard from "./ItemRowCard";
import { SharedSkillCard, SharedHeroicCard } from "/src/components/shared/items/class/SharedClassCards";

function DescriptionArea({ children }) {
  return (
    <Box sx={{ px: 1.5, py: 0.75, borderTop: "1px solid", borderColor: "divider", lineHeight: 1.5, color: "text.secondary" }}>
      {children}
    </Box>
  );
}

function SectionSubHeader({ children, theme }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 0.5, background: theme.ternary, minHeight: 32 }}>
      {children}
    </Box>
  );
}

function MnemoSkillRow({ skill, isInteractive, budgetExhausted, onIncrease, onDecrease, translatedDescription, searchQuery, theme, t, pc }) {
  const [descOpen, setDescOpen] = useState(true);
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
            {highlightMatch(t(skill.skillName ?? skill.name ?? ""), searchQuery)}
          </Typography>
          {isInteractive ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
              <Tooltip title={t("Decrease Level")}><span>
                <IconButton size="small" sx={{ p: "3px", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px" }} onClick={onDecrease} disabled={skill.currentLvl <= 0}>
                  <Remove sx={{ fontSize: "1rem" }} />
                </IconButton>
              </span></Tooltip>
              <Typography sx={{ fontFamily: "Antonio", fontSize: "0.85rem", fontWeight: "bold", color: "#fff", lineHeight: 1, minWidth: 40, textAlign: "center" }}>
                SL{skill.currentLvl}/{skill.maxLvl}
              </Typography>
              <Tooltip title={t("Increase Level")}><span>
                <IconButton size="small" sx={{ p: "3px", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px" }} onClick={onIncrease} disabled={skill.currentLvl >= skill.maxLvl || budgetExhausted}>
                  <Add sx={{ fontSize: "1rem" }} />
                </IconButton>
              </span></Tooltip>
            </Box>
          ) : (
            <Typography sx={{ fontFamily: "Antonio", fontSize: "0.85rem", fontWeight: "bold", color: "rgba(255,255,255,0.9)", lineHeight: 1 }}>
              SL{skill.currentLvl}/{skill.maxLvl}
            </Typography>
          )}
          <Tooltip title={t("Send to Chat")}>
            <IconButton size="small" sx={{ p: "3px", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px", flexShrink: 0 }}
              onClick={(e) => { e.stopPropagation(); sendDisplayMessage("skill", t(skill.skillName ?? skill.name ?? ""), { speaker: pc?.info?.name || pc?.name || "", description: translatedDescription || undefined }); }}>
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

function MnemoHeroicRow({ heroicSkill, translatedDescription, searchQuery, theme, t, pc }) {
  const [descOpen, setDescOpen] = useState(true);
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 0.5, minHeight: 40, width: "100%" }}>
          <Star sx={{ color: "gold", fontSize: "1.2rem", flexShrink: 0 }} />
          <Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.1rem" }, textTransform: "uppercase", color: "#fff", flex: 1, lineHeight: 1.3 }}>
            {highlightMatch(t(heroicSkill.name ?? ""), searchQuery)}
          </Typography>
          {hasDesc && (
            <Tooltip title={t("Send to Chat")}>
              <IconButton size="small" sx={{ p: "3px", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px", flexShrink: 0 }}
                onClick={(e) => { e.stopPropagation(); sendDisplayMessage("heroic skill", t(heroicSkill.name ?? ""), { speaker: pc?.info?.name || pc?.name || "", description: translatedDescription || undefined }); }}>
                <MessageOutlined sx={{ fontSize: "1.2rem" }} />
              </IconButton>
            </Tooltip>
          )}
          {hasDesc && (
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

// Single mnemosphere card (non-compact)
function MnemoCard({ mnemo, isInteractive, budgetExhausted, onIncreaseSkillLevel, onDecreaseSkillLevel, onInvestLevel, onRefundLevel, availableLevels, searchQuery, theme, t, pc }) {
  const [expanded, setExpanded] = useState(true);
  const secondary = theme.secondary;

  const sphereLvl = mnemo.lvl ?? 1;
  const baseLvl = mnemo.baseLvl ?? mnemo.lvl ?? 1;
  const showBaseLevel = baseLvl !== sphereLvl;
  const cost = getMnemosphereCost(sphereLvl);
  const showLevelControls = isInteractive && (onInvestLevel || onRefundLevel);

  const skills = (mnemo.skills ?? []).filter((s) => isInteractive || (s.currentLvl ?? 0) >= 1);
  const heroics = mnemo.heroic ?? [];

  const filteredSkills = skills.filter((skill) => {
    if (!searchQuery?.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const desc = t(getMnemosphereSkillDescription(mnemo, skill) ?? "");
    return t(skill.skillName ?? skill.name ?? "").toLowerCase().includes(q) || desc.toLowerCase().includes(q);
  });

  const filteredHeroics = heroics.filter((h) => {
    if (!searchQuery?.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const desc = t(getMnemosphereHeroicDescription(mnemo, h) ?? "");
    return t(h.name ?? "").toLowerCase().includes(q) || desc.toLowerCase().includes(q);
  });

  if (searchQuery?.trim() && filteredSkills.length === 0 && filteredHeroics.length === 0) return null;

  return (
    <Accordion
      disableGutters
      elevation={0}
      square
      expanded={expanded}
      onChange={() => setExpanded((v) => !v)}
      sx={{ mb: 1.5, borderRadius: "8px", overflow: "hidden", border: "2px solid", borderColor: secondary, boxShadow: 3, "&:before": { display: "none" } }}
    >
      <AccordionSummary
        sx={{
          minHeight: 0,
          p: 0,
          background: theme.primary,
          "& .MuiAccordionSummary-content": { m: 0 },
          "& .MuiAccordionSummary-expandIconWrapper": { display: "none" },
        }}
      >
      <Box sx={{ px: 1, py: "6px", display: "flex", alignItems: "center", gap: 1, width: "100%", cursor: "pointer", userSelect: "none" }}>
        <Typography noWrap sx={{ color: "#fff", fontFamily: "Antonio", fontWeight: 800, fontSize: { xs: "1.1rem", sm: "1.2rem" }, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1.2, flex: 1 }}>
          {highlightMatch(t(mnemo.class ?? mnemo.name ?? ""), searchQuery)}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          {cost > 0 && (
            <Typography sx={{ color: "rgba(255,255,255,0.75)", fontFamily: "Antonio", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
              {cost}z · {t("Slotted")}
            </Typography>
          )}
          {showBaseLevel && (
            <Typography sx={{ color: "rgba(255,255,255,0.75)", fontFamily: "Antonio", fontSize: "0.8rem", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              {t("Base")} {baseLvl}
            </Typography>
          )}
          {showLevelControls ? (
            <>
              <Tooltip title={t("Refund Level")}><span>
                <IconButton component="span" size="small" sx={{ p: "6px", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px" }}
                  onClick={() => onRefundLevel?.()} disabled={!onRefundLevel || sphereLvl <= baseLvl}>
                  <Remove sx={{ fontSize: "1.15rem" }} />
                </IconButton>
              </span></Tooltip>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 36, px: "10px", borderRadius: "4px", bgcolor: "rgba(255,255,255,0.18)", flexShrink: 0 }}>
                <Typography sx={{ color: "#fff", fontFamily: "Antonio", fontSize: "1rem", fontWeight: "bold", lineHeight: 1 }}>Lv {sphereLvl}/5</Typography>
              </Box>
              <Tooltip title={t("Invest Level")}><span>
                <IconButton component="span" size="small" sx={{ p: "6px", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px" }}
                  onClick={() => onInvestLevel?.()} disabled={!onInvestLevel || sphereLvl >= 5 || (availableLevels != null && availableLevels <= 0)}>
                  <Add sx={{ fontSize: "1.15rem" }} />
                </IconButton>
              </span></Tooltip>
            </>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 36, px: "8px", borderRadius: "4px", bgcolor: "rgba(255,255,255,0.18)" }}>
              <Typography sx={{ color: "#fff", fontFamily: "Antonio", fontSize: "1rem", fontWeight: "bold", lineHeight: 1 }}>Lv {sphereLvl}/5</Typography>
            </Box>
          )}
          <IconButton component="span" size="small" sx={{ p: "4px", color: "#fff", flexShrink: 0 }} onClick={() => setExpanded((v) => !v)}>
            {expanded ? <KeyboardArrowUp sx={{ fontSize: "1.3rem" }} /> : <KeyboardArrowDown sx={{ fontSize: "1.3rem" }} />}
          </IconButton>
        </Box>
      </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {filteredSkills.length > 0 && (
          <>
            <SectionSubHeader theme={theme}>
              <Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.1rem" }, textTransform: "uppercase", color: "text.primary", letterSpacing: "0.04em", lineHeight: 1.2 }}>
                {t("Skills")}
              </Typography>
            </SectionSubHeader>
            {filteredSkills.map((skill, skillIdx) => {
              const desc = t(getMnemosphereSkillDescription(mnemo, skill) ?? "");
              return (
                <MnemoSkillRow
                  key={`skill-${skillIdx}`}
                  skill={skill}
                  isInteractive={isInteractive}
                  budgetExhausted={budgetExhausted}
                  onIncrease={() => onIncreaseSkillLevel?.(skillIdx)}
                  onDecrease={() => onDecreaseSkillLevel?.(skillIdx)}
                  translatedDescription={desc}
                  searchQuery={searchQuery}
                  theme={theme}
                  t={t}
                  pc={pc}
                />
              );
            })}
          </>
        )}
        {filteredHeroics.length > 0 && (
          <>
            <SectionSubHeader theme={theme}>
              <Star sx={{ fontSize: "1rem", color: secondary, mr: 0.5, flexShrink: 0 }} />
              <Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.1rem" }, textTransform: "uppercase", color: "text.primary", letterSpacing: "0.04em", lineHeight: 1.2 }}>
                {t("Heroic Skills")}
              </Typography>
            </SectionSubHeader>
            {filteredHeroics.map((h, hIdx) => {
              const desc = t(getMnemosphereHeroicDescription(mnemo, h) ?? "");
              return (
                <MnemoHeroicRow
                  key={`heroic-${hIdx}`}
                  heroicSkill={h}
                  translatedDescription={desc}
                  searchQuery={searchQuery}
                  theme={theme}
                  t={t}
                  pc={pc}
                />
              );
            })}
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

// Single mnemosphere card (compact)
function MnemoCardCompact({ mnemo, searchQuery, theme, t, pc }) {
  const [collapsed, setCollapsed] = useState(true);
  const [preview, setPreview] = useState(null);

  const skills = (mnemo.skills ?? []).filter((s) => (s.currentLvl ?? 0) >= 1);
  const heroics = mnemo.heroic ?? [];

  const filteredSkills = skills.filter((skill) => {
    if (!searchQuery?.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const desc = t(getMnemosphereSkillDescription(mnemo, skill) ?? "");
    return t(skill.skillName ?? skill.name ?? "").toLowerCase().includes(q) || desc.toLowerCase().includes(q);
  });

  const filteredHeroics = heroics.filter((h) => {
    if (!searchQuery?.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const desc = t(getMnemosphereHeroicDescription(mnemo, h) ?? "");
    return t(h.name ?? "").toLowerCase().includes(q) || desc.toLowerCase().includes(q);
  });

  if (searchQuery?.trim() && filteredSkills.length === 0 && filteredHeroics.length === 0) return null;

  return (
    <Accordion
      disableGutters
      elevation={0}
      square
      expanded={!collapsed}
      onChange={() => setCollapsed((v) => !v)}
      sx={{ mb: 0.5, border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden", "&:before": { display: "none" } }}
    >
      <AccordionSummary
        component="div"
        sx={{
          minHeight: 0,
          p: 0,
          bgcolor: "rgba(0,0,0,0.04)",
          "& .MuiAccordionSummary-content": { m: 0 },
          "& .MuiAccordionSummary-expandIconWrapper": { display: "none" },
        }}
      >
      <Box sx={{ pl: "10px", pr: "6px", py: "3px", display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
        <Typography sx={{ fontWeight: "bold", fontSize: "0.85rem", flex: 1 }}>{highlightMatch(t(mnemo.class ?? mnemo.name ?? ""), searchQuery)}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 24, px: "6px", borderRadius: "4px", bgcolor: "action.selected", flexShrink: 0 }}>
          <Typography sx={{ fontFamily: "Antonio", fontSize: "0.75rem", fontWeight: "bold", lineHeight: 1 }}>Lv {mnemo.lvl ?? 1}/5</Typography>
        </Box>
        <IconButton component="span" size="small" sx={{ p: "2px" }} onClick={(e) => { e.stopPropagation(); setCollapsed((v) => !v); }}>
          {collapsed ? <KeyboardArrowDown sx={{ fontSize: "1rem" }} /> : <KeyboardArrowUp sx={{ fontSize: "1rem" }} />}
        </IconButton>
      </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: "4px", display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "4px" }}>
        {filteredSkills.map((skill, skillIdx) => {
          const desc = t(getMnemosphereSkillDescription(mnemo, skill) ?? "");
          return (
            <ItemRowCard
              key={`skill-${skillIdx}`}
              compact
              variant="outlined"
              onCardClick={desc ? () => setPreview({ type: "skill", skill, desc }) : undefined}
              paperSx={{ transition: "border-color 0.15s ease", "&:hover": { borderColor: theme.secondary } }}
              label={
                <Typography noWrap sx={{ fontFamily: "Antonio", fontWeight: 800, fontSize: "0.9rem", textTransform: "uppercase", lineHeight: 1.3 }}>
                  {highlightMatch(t(skill.skillName ?? skill.name ?? ""), searchQuery)}
                </Typography>
              }
              actions={
                <>
                  <Box sx={{ fontFamily: "Antonio", fontSize: "0.8rem", fontWeight: "bold", color: "#fff", px: "4px", flexShrink: 0 }}>
                    {skill.currentLvl}/{skill.maxLvl}
                  </Box>
                  <Tooltip title={t("Send to Chat")}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); sendDisplayMessage("skill", t(skill.skillName ?? skill.name ?? ""), { speaker: pc?.info?.name || pc?.name || "", description: desc || undefined }); }}>
                      <MessageOutlined />
                    </IconButton>
                  </Tooltip>
                </>
              }
            />
          );
        })}
        {filteredHeroics.map((h, hIdx) => {
          const desc = t(getMnemosphereHeroicDescription(mnemo, h) ?? "");
          return (
            <ItemRowCard
              key={`heroic-${hIdx}`}
              compact
              variant="outlined"
              onCardClick={desc ? () => setPreview({ type: "heroic", heroic: h, desc }) : undefined}
              paperSx={{ gridColumn: "1 / -1", transition: "border-color 0.15s ease", "&:hover": { borderColor: theme.secondary } }}
              label={
                <Typography noWrap sx={{ fontFamily: "Antonio", fontWeight: 800, fontSize: "0.9rem", textTransform: "uppercase", lineHeight: 1.3 }}>
                  <Star sx={{ fontSize: "0.85rem", color: theme.secondary, verticalAlign: "middle", mr: "4px", mb: "2px" }} />
                  {highlightMatch(t(h.name ?? ""), searchQuery)}
                </Typography>
              }
              actions={
                desc ? (
                  <Tooltip title={t("Send to Chat")}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); sendDisplayMessage("heroic skill", t(h.name ?? ""), { speaker: pc?.info?.name || pc?.name || "", description: desc || undefined }); }}>
                      <MessageOutlined />
                    </IconButton>
                  </Tooltip>
                ) : null
              }
            />
          );
        })}
      </AccordionDetails>

      <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} fullWidth maxWidth="sm">
        <DialogContent sx={{ p: 0 }}>
          {preview?.type === "skill" && (
            <SharedSkillCard item={{ skillName: preview.skill.skillName ?? preview.skill.name ?? "", description: preview.skill.description, currentLvl: preview.skill.currentLvl, className: mnemo.class ?? mnemo.name ?? "" }} />
          )}
          {preview?.type === "heroic" && (
            <SharedHeroicCard item={preview.heroic} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreview(null)} variant="contained">{t("Close")}</Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  );
}

export default function PcMnemospheres({
  pc,
  slottedMnemospheres,
  allMnemospheres,
  variant = "compact",
  isInteractive = false,
  searchQuery = "",
  totalMnemoInvested,
  characterLevel,
  totalInnateInvested = 0,
  usesInnateClassRules = false,
  onChangeMnemoSkillLevel,
  onInvestLevel,
  onRefundLevel,
  getMnemoAvailableLevels,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isCompact = variant === "compact";
  const [open, setOpen] = useState(!isCompact);

  const bankSpheres = allMnemospheres ?? [];
  const breakdown = bankSpheres
    .map((m) => ({ invested: Math.max(0, (m.lvl ?? 1) - (m.baseLvl ?? m.lvl ?? 1)), label: `${t(m.class ?? m.name ?? "?")} Lv.${m.lvl ?? 1}` }))
    .filter((r) => r.invested > 0)
    .map((r) => ({ label: r.label, value: `+${r.invested}` }));
  const fromBank = bankSpheres.reduce((s, m) => s + Math.max(0, (m.lvl ?? 1) - (m.baseLvl ?? m.lvl ?? 1)), 0);
  const soldOrDeleted = (totalMnemoInvested ?? 0) - fromBank;
  if (soldOrDeleted > 0) breakdown.push({ label: t("Sold / deleted"), value: `+${soldOrDeleted}`, dim: true });

  const actions = (
    <Box sx={{ display: "flex", alignItems: "center", gap: isCompact ? 0.5 : 1 }}>
      {totalMnemoInvested != null && characterLevel != null && (
        <>
          <Typography sx={{ color: "rgba(255,255,255,0.8)", fontFamily: "Antonio", fontWeight: 700, fontSize: isCompact ? { xs: "0.65rem", sm: "0.75rem" } : { xs: "0.75rem", sm: "0.875rem" }, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", flexShrink: 0 }}>
            {t("Total Invested Levels")}
          </Typography>
          <StatTooltip title={t("Invested Mnemosphere Levels")} breakdown={breakdown.length > 0 ? breakdown : undefined} total={totalMnemoInvested} display="flex" sx={{ flexShrink: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
              {[totalMnemoInvested, usesInnateClassRules ? characterLevel - totalInnateInvested : characterLevel].map((val, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center" }}>
                  {i === 1 && <Typography sx={{ color: "#fff", fontFamily: "Antonio", fontWeight: 700, fontSize: isCompact ? "0.8rem" : "1rem", px: "2px" }}>/</Typography>}
                  <Box sx={{ background: "#fff", color: theme.primary, fontFamily: "Antonio", fontWeight: 700, fontSize: isCompact ? "0.8rem" : "1rem", px: isCompact ? 0.5 : 0.75, py: "1px", minWidth: isCompact ? 24 : 32, textAlign: "center", borderRadius: "2px" }}>{val}</Box>
                </Box>
              ))}
            </Box>
          </StatTooltip>
        </>
      )}
      <IconButton component="span" size="small" sx={{ color: "#fff", p: "2px", flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>
        {open ? <KeyboardArrowUp sx={{ fontSize: isCompact ? "1.1rem" : "1.3rem" }} /> : <KeyboardArrowDown sx={{ fontSize: isCompact ? "1.1rem" : "1.3rem" }} />}
      </IconButton>
    </Box>
  );

  if (!slottedMnemospheres?.length) return null;

  const content = (
    <Collapse in={open}>
      <Box sx={{ p: isCompact ? "4px" : 1 }}>
        {slottedMnemospheres.map((mnemo) => {
          if (isCompact) {
            return (
              <MnemoCardCompact
                key={`mnemo-${mnemo.id}`}
                mnemo={mnemo}
                searchQuery={searchQuery}
                theme={theme}
                t={t}
                pc={pc}
              />
            );
          }

          const availableLevels = getMnemoAvailableLevels ? getMnemoAvailableLevels(mnemo) : null;
          const budgetExhausted = availableLevels !== null && availableLevels <= 0;

          return (
            <MnemoCard
              key={`mnemo-${mnemo.id}`}
              mnemo={mnemo}
              isInteractive={isInteractive}
              budgetExhausted={budgetExhausted}
              onIncreaseSkillLevel={(skillIdx) => onChangeMnemoSkillLevel?.(mnemo.id, skillIdx, 1)}
              onDecreaseSkillLevel={(skillIdx) => onChangeMnemoSkillLevel?.(mnemo.id, skillIdx, -1)}
              onInvestLevel={isInteractive ? () => onInvestLevel?.(mnemo.id) : null}
              onRefundLevel={isInteractive ? () => onRefundLevel?.(mnemo.id) : null}
              availableLevels={isInteractive ? availableLevels : null}
              searchQuery={searchQuery}
              theme={theme}
              t={t}
              pc={pc}
            />
          );
        })}
      </Box>
    </Collapse>
  );

  return isCompact ? (
    <Paper sx={{ mb: 1, overflow: "hidden" }} elevation={0} variant="outlined">
      <CompactSectionHeader title={t("Mnemospheres")}>{actions}</CompactSectionHeader>
      {content}
    </Paper>
  ) : (
    <SectionCard title={t("Mnemospheres")} actions={actions} sx={{ mb: 1 }}>
      {content}
    </SectionCard>
  );
}
