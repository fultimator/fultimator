import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import MessageOutlined from "@mui/icons-material/MessageOutlined";
import NotesMarkdown from "../../../common/NotesMarkdown";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import SectionCard from "./SectionCard";
import { highlightMatch, highlightMarkdownText } from "../pc/variants/compact/highlightUtils";
import { sendDisplayMessage } from "../../../../hooks/useRollToChat";
import { getHoplosphereCoagKey } from "../../../../libs/technospheres";

function getSlottedHoplospheres(pc) {
  const eq0 = pc?.equipment?.[0] ?? {};
  const hoplospheres = eq0.hoplospheres ?? [];

  const slottedIds = new Set();
  const equipment = pc?.equipment ?? [];
  for (const item of equipment) {
    for (const v of Object.values(item)) {
      if (Array.isArray(v)) {
        for (const sub of v) {
          if (sub?.slotted) for (const id of sub.slotted) slottedIds.add(id);
        }
      }
    }
    if (item.slotted) for (const id of item.slotted) slottedIds.add(id);
  }

  const coagCounts = new Map();
  const seen = new Map();

  for (const hoplo of hoplospheres) {
    if (!slottedIds.has(hoplo.id)) continue;
    const key = getHoplosphereCoagKey(hoplo);
    coagCounts.set(key, (coagCounts.get(key) ?? 0) + 1);
    if (!seen.has(key)) seen.set(key, hoplo);
  }

  return [...seen.values()].map((hoplo) => ({
    ...hoplo,
    coagCount: coagCounts.get(getHoplosphereCoagKey(hoplo)) ?? 1,
  }));
}

// Non-compact row
function HoploRow({ hoplo, searchQuery, theme, t, pc }) {
  const [descOpen, setDescOpen] = useState(true);
  const hasDesc = !!hoplo.description;
  const hasCoag = hoplo.coagEffects && Object.keys(hoplo.coagEffects).length > 0;
  const hasDetails = hasDesc || hasCoag;
  const forceOpen = !!searchQuery?.trim();
  const expanded = hasDetails ? (descOpen || forceOpen) : false;

  return (
    <Accordion
      disableGutters
      elevation={0}
      square
      expanded={expanded}
      onChange={() => hasDetails && setDescOpen((v) => !v)}
      sx={{ borderTop: `1px solid ${theme.secondary}`, overflow: "hidden", background: "transparent", "&:before": { display: "none" } }}
    >
      <AccordionSummary
        sx={{
          minHeight: 0,
          p: 0,
          background: theme.primary,
          "& .MuiAccordionSummary-content": { m: 0 },
          "& .MuiAccordionSummary-expandIconWrapper": { display: "none" },
          cursor: hasDetails ? "pointer" : "default",
        }}
      >
      <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 0.5, gap: 1, minHeight: 40, width: "100%" }}>
        <Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.1rem" }, textTransform: "uppercase", color: "#fff", flex: 1, lineHeight: 1.3 }}>
          {highlightMatch(hoplo.name ?? "", searchQuery)}
          {hoplo.coagCount > 1 && (
            <Typography component="span" sx={{ fontFamily: "Antonio", fontSize: "0.8rem", color: "rgba(255,255,255,0.75)", ml: 1 }}>
              ×{hoplo.coagCount}
            </Typography>
          )}
        </Typography>
        <Chip
          label={`${hoplo.requiredSlots ?? 1} slot${(hoplo.requiredSlots ?? 1) > 1 ? "s" : ""}`}
          size="small"
          sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: "bold", fontSize: "0.7rem", height: 20 }}
        />
        {hoplo.socketable === "weapon" && (
          <Chip label={t("Weapon only")} size="small" sx={{ backgroundColor: "rgba(255,165,0,0.35)", color: "#fff", fontWeight: "bold", fontSize: "0.65rem", height: 20 }} />
        )}
        <Chip
          label={`${hoplo.cost ?? 0}z`}
          size="small"
          sx={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "0.7rem", height: 20 }}
        />
        {hasDesc && (
          <Tooltip title={t("Send to Chat")}>
            <IconButton size="small" sx={{ p: "3px", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px", flexShrink: 0 }}
              onClick={(e) => { e.stopPropagation(); sendDisplayMessage("hoplosphere", hoplo.name ?? "", { speaker: pc?.info?.name || pc?.name || "", description: hoplo.description || undefined }); }}>
              <MessageOutlined sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </Tooltip>
        )}
        {hasDetails && (
          <IconButton size="small" sx={{ p: "3px", color: "rgba(255,255,255,0.7)", flexShrink: 0 }}
            onClick={(e) => { e.stopPropagation(); setDescOpen((v) => !v); }}>
            {descOpen ? <KeyboardArrowUp sx={{ fontSize: "1.2rem" }} /> : <KeyboardArrowDown sx={{ fontSize: "1.2rem" }} />}
          </IconButton>
        )}
      </Box>
      </AccordionSummary>
      {hasDetails && (
        <AccordionDetails sx={{ p: 0 }}>
        <Box sx={{ px: 2, pb: 0.75, pt: 0.5 }}>
          {hasDesc && (
            <Typography variant="body2" component="div" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
              <NotesMarkdown compact>{highlightMarkdownText(hoplo.description, searchQuery)}</NotesMarkdown>
            </Typography>
          )}
          {hasCoag && (
            <Box sx={{ mt: hasDesc ? 0.5 : 0 }}>
              <Typography sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.05em", color: "text.secondary", mb: 0.25 }}>
                {t("Coagulation")}
              </Typography>
              {Object.entries(hoplo.coagEffects)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([threshold, effect]) => {
                  const active = hoplo.coagCount >= Number(threshold);
                  return (
                    <Box key={threshold} sx={{ display: "flex", gap: 1, alignItems: "baseline", opacity: active ? 1 : 0.4, py: 0.25 }}>
                      <Chip label={`x${threshold}`} size="small" variant={active ? "filled" : "outlined"}
                        sx={{ fontSize: "0.6rem", height: 16, flexShrink: 0, ...(active && { backgroundColor: theme.secondary, color: "#fff" }) }} />
                      <Typography variant="body2">{effect}</Typography>
                    </Box>
                  );
                })}
            </Box>
          )}
        </Box>
        </AccordionDetails>
      )}
    </Accordion>
  );
}

// Compact card
function HoploCardCompact({ hoplo, searchQuery, theme, t }) {
  const [collapsed, setCollapsed] = useState(true);
  const hasDesc = !!hoplo.description;
  const hasCoag = hoplo.coagEffects && Object.keys(hoplo.coagEffects).length > 0;

  return (
    <Box sx={{ mb: 0.5, border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
      <Box sx={{ pl: "10px", pr: "6px", py: "3px", bgcolor: "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontWeight: "bold", fontSize: "0.85rem", flex: 1 }} noWrap>
          {highlightMatch(hoplo.name ?? "", searchQuery)}
          {hoplo.coagCount > 1 && ` ×${hoplo.coagCount}`}
        </Typography>
        <Chip label={`${hoplo.requiredSlots ?? 1}s`} size="small" sx={{ height: 18, fontSize: "0.65rem" }} />
        {(hasDesc || hasCoag) && (
          <IconButton size="small" sx={{ p: "2px" }} onClick={() => setCollapsed((v) => !v)}>
            {collapsed ? <KeyboardArrowDown sx={{ fontSize: "1rem" }} /> : <KeyboardArrowUp sx={{ fontSize: "1rem" }} />}
          </IconButton>
        )}
      </Box>
      {!collapsed && (hasDesc || hasCoag) && (
        <Box sx={{ px: 1.5, py: 0.75, borderTop: "1px solid", borderColor: "divider", fontSize: { xs: "0.8rem", sm: "0.85rem" }, lineHeight: 1.5, color: "text.secondary" }}>
          {hasDesc && <Typography variant="body2" component="div" sx={{ color: "text.secondary", fontSize: "0.85rem" }}><NotesMarkdown compact>{highlightMarkdownText(hoplo.description, searchQuery)}</NotesMarkdown></Typography>}
          {hasCoag && (
            <Box sx={{ mt: hasDesc ? 0.5 : 0 }}>
              <Typography sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.05em", color: "text.secondary", mb: 0.25 }}>
                {t("Coagulation")}
              </Typography>
              {Object.entries(hoplo.coagEffects)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([threshold, effect]) => {
                  const active = hoplo.coagCount >= Number(threshold);
                  return (
                    <Box key={threshold} sx={{ display: "flex", gap: 0.5, alignItems: "baseline", opacity: active ? 1 : 0.4, py: 0.2 }}>
                      <Chip label={`x${threshold}`} size="small" variant={active ? "filled" : "outlined"}
                        sx={{ fontSize: "0.55rem", height: 14, flexShrink: 0, ...(active && { backgroundColor: theme.secondary, color: "#fff" }) }} />
                      <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>{effect}</Typography>
                    </Box>
                  );
                })}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default function PcHoplospheres({
  pc,
  variant = "compact",
  searchQuery = "",
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [open, setOpen] = useState(true);
  const isCompact = variant === "compact";

  const slottedHoplospheres = getSlottedHoplospheres(pc);

  const filtered = slottedHoplospheres.filter((hoplo) => {
    if (!searchQuery?.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (hoplo.name ?? "").toLowerCase().includes(q) || (hoplo.description ?? "").toLowerCase().includes(q);
  });

  if (!filtered.length) return null;

  const actions = (
    <IconButton size="small" sx={{ color: "#fff", p: "2px", flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>
      {open ? <KeyboardArrowUp sx={{ fontSize: isCompact ? "1.1rem" : "1.3rem" }} /> : <KeyboardArrowDown sx={{ fontSize: isCompact ? "1.1rem" : "1.3rem" }} />}
    </IconButton>
  );

  return (
    <SectionCard title={t("Hoplospheres")} actions={actions} sx={{ mb: 1 }}>
      <Collapse in={open}>
        <Box sx={{ p: isCompact ? "4px" : 0 }}>
          {filtered.map((hoplo) =>
            isCompact ? (
              <HoploCardCompact key={hoplo.id} hoplo={hoplo} searchQuery={searchQuery} theme={theme} t={t} />
            ) : (
              <HoploRow key={hoplo.id} hoplo={hoplo} searchQuery={searchQuery} theme={theme} t={t} pc={pc} />
            )
          )}
        </Box>
      </Collapse>
    </SectionCard>
  );
}
