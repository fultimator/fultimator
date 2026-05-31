import React, { useState } from "react";
import { Typography, Divider, Box, Paper, IconButton } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import SectionCard from "../../../common/SectionCard";
import CompactSectionHeader from "../../variants/compact/CompactSectionHeader";
import { useTranslate } from "../../../../../../translation/translate";
import { useTheme } from "@mui/material/styles";
import NotesMarkdown from "../../../../../common/NotesMarkdown";
import ClockControls from "../../variants/compact/ClockControls";
import { highlightMatch, highlightMarkdownText } from "../../variants/compact/highlightUtils";

export default function PlayerZeroPower({ player, setPlayer, compact = false, searchQuery = "" }) {
  const { t } = useTranslate();
  const muiTheme = useTheme();
  const primary = muiTheme.palette.primary.main;
  const [descOpen, setDescOpen] = useState(false);

  const zeroPower = player.zeroPower;
  const sections = zeroPower?.clock?.sections ?? 6;
  const clockState = zeroPower?.clockState ?? new Array(sections).fill(false);

  const persistState = (newState) => {
    if (!setPlayer) return;
    setPlayer((prev) => ({ ...prev, zeroPower: { ...prev.zeroPower, clockState: newState } }));
  };

  if (!zeroPower?.name) return null;

  const triggerName = typeof zeroPower.zeroTrigger === "string" ? zeroPower.zeroTrigger : (zeroPower.zeroTrigger?.name ?? "");
  const triggerDesc = typeof zeroPower.zeroTrigger === "object" ? (zeroPower.zeroTrigger?.description ?? "") : "";
  const effectName = typeof zeroPower.zeroEffect === "string" ? zeroPower.zeroEffect : (zeroPower.zeroEffect?.name ?? "");
  const effectDesc = typeof zeroPower.zeroEffect === "object" ? (zeroPower.zeroEffect?.description ?? "") : "";

  const hasDetails = triggerName || effectName;

  if (compact) {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matches =
      !normalizedQuery ||
      zeroPower.name?.toLowerCase().includes(normalizedQuery) ||
      triggerName?.toLowerCase().includes(normalizedQuery) ||
      triggerDesc?.toLowerCase().includes(normalizedQuery) ||
      effectName?.toLowerCase().includes(normalizedQuery) ||
      effectDesc?.toLowerCase().includes(normalizedQuery);
    if (!matches) return null;

    const forceOpen =
      !!normalizedQuery &&
      (triggerName?.toLowerCase().includes(normalizedQuery) ||
        triggerDesc?.toLowerCase().includes(normalizedQuery) ||
        effectName?.toLowerCase().includes(normalizedQuery) ||
        effectDesc?.toLowerCase().includes(normalizedQuery));
    const isOpen = descOpen || forceOpen;

    return (
      <Paper sx={{ mb: 1, overflow: "hidden" }} elevation={0} variant="outlined">
        <CompactSectionHeader title={t("Zero Power")} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", p: "4px" }}>
          <Box
            onClick={() => hasDetails && setDescOpen((v) => !v)}
            sx={{
              border: "1px solid", borderColor: "divider",
              borderRadius: `${muiTheme.shape.borderRadius}px`, overflow: "hidden",
              cursor: hasDetails ? "pointer" : "default",
              transition: "border-color 0.15s ease",
              "&:hover": { borderColor: primary },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: "8px", py: "5px" }}>
              {hasDetails && (
                <IconButton size="small" sx={{ p: 0, flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); setDescOpen((v) => !v); }}>
                  {isOpen ? <KeyboardArrowUp sx={{ fontSize: "1rem" }} /> : <KeyboardArrowDown sx={{ fontSize: "1rem" }} />}
                </IconButton>
              )}
              <Typography sx={{ flex: 1, fontWeight: "bold", fontSize: "0.85rem", textTransform: "uppercase", lineHeight: 1.3 }} noWrap>
                {highlightMatch(zeroPower.name, searchQuery)}
              </Typography>
            </Box>
            {hasDetails && isOpen && (
              <Box sx={{ px: 1.5, py: 0.75, bgcolor: "rgba(0,0,0,0.03)", borderTop: "1px solid", borderColor: "divider" }}>
                {triggerName && (
                  <Typography sx={{ fontSize: "0.85rem", mb: 0.5, lineHeight: 1.45, color: "text.secondary" }}>
                    <strong>{t("Trigger")}: </strong>{highlightMatch(triggerName, searchQuery)}
                  </Typography>
                )}
                {triggerDesc && <NotesMarkdown compact>{highlightMarkdownText(triggerDesc, searchQuery)}</NotesMarkdown>}
                {effectName && (
                  <Typography sx={{ fontSize: "0.85rem", mb: 0.5, lineHeight: 1.45, color: "text.secondary" }}>
                    <strong>{t("Effect")}: </strong>{highlightMatch(effectName, searchQuery)}
                  </Typography>
                )}
                {effectDesc && <NotesMarkdown compact>{highlightMarkdownText(effectDesc, searchQuery)}</NotesMarkdown>}
              </Box>
            )}
          </Box>
          <ClockControls
            sections={sections} state={clockState} setState={persistState}
            label={<Typography sx={{ fontWeight: "bold", fontSize: "0.85rem", lineHeight: 1.3 }} noWrap>{t("Clock")}</Typography>}
            clockSize={36} compact theme={{ primary }}
          />
        </Box>
      </Paper>
    );
  }

  const labelPillSx = {
    background: primary, px: "10px", py: "4px", color: "#fff",
    display: "flex", alignItems: "center", alignSelf: "stretch",
    flexShrink: 0, minWidth: 72, justifyContent: "center",
  };
  const nameBandSx = { px: "10px", py: "4px", display: "flex", alignItems: "center", flex: 1, minHeight: 32, bgcolor: "rgba(0,0,0,0.02)" };

  return (
    <>
      <Divider sx={{ my: 1 }} />
      <SectionCard title={t("Zero Power")} noShadow>
        <Box sx={{ display: "flex", alignItems: "stretch", borderBottom: "1px solid", borderColor: "divider" }}>
          <Box sx={{ flex: 1, px: "10px", py: "6px", display: "flex", alignItems: "center" }}>
            <Typography sx={{ fontFamily: "Antonio", fontWeight: 800, fontSize: { xs: "1rem", sm: "1.1rem" }, textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.2 }}>
              {zeroPower.name}
            </Typography>
          </Box>
          {sections > 0 && (
            <Box sx={{ px: "10px", pr: "12px", display: "flex", alignItems: "center", borderLeft: "1px solid", borderColor: "divider" }}>
              <ClockControls sections={sections} state={clockState} setState={persistState} clockSize={44} compact theme={{ primary }} label={null} />
            </Box>
          )}
        </Box>
        {(triggerName || triggerDesc) && (
          <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "stretch" }}>
              <Box sx={labelPillSx}>
                <Typography sx={{ fontFamily: "Antonio", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", color: "inherit", letterSpacing: "0.05em" }}>{t("Trigger")}</Typography>
              </Box>
              <Box sx={nameBandSx}>
                <Typography sx={{ fontWeight: "bold", fontSize: "0.9rem", lineHeight: 1.4 }}>{triggerName}</Typography>
              </Box>
            </Box>
            {triggerDesc && (
              <Box sx={{ px: "10px", py: "6px", borderTop: "1px solid", borderColor: "divider" }}>
                <NotesMarkdown compact>{triggerDesc}</NotesMarkdown>
              </Box>
            )}
          </Box>
        )}
        {(effectName || effectDesc) && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "stretch" }}>
              <Box sx={labelPillSx}>
                <Typography sx={{ fontFamily: "Antonio", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", color: "inherit", letterSpacing: "0.05em" }}>{t("Effect")}</Typography>
              </Box>
              <Box sx={nameBandSx}>
                <Typography sx={{ fontWeight: "bold", fontSize: "0.9rem", lineHeight: 1.4 }}>{effectName}</Typography>
              </Box>
            </Box>
            {effectDesc && (
              <Box sx={{ px: "10px", py: "6px", borderTop: "1px solid", borderColor: "divider" }}>
                <NotesMarkdown compact>{effectDesc}</NotesMarkdown>
              </Box>
            )}
          </Box>
        )}
      </SectionCard>
    </>
  );
}
