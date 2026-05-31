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

export default function PlayerQuirk({ player, setPlayer, compact = false, searchQuery = "" }) {
  const { t } = useTranslate();
  const muiTheme = useTheme();
  const primary = muiTheme.palette.primary.main;
  const [descOpen, setDescOpen] = useState(false);

  const quirk = player.quirk;
  if (!quirk?.name) return null;

  const sections = quirk.clock?.sections ?? 0;
  const clockState = sections > 0 ? (quirk.clockState ?? new Array(sections).fill(false)) : [];

  const persistState = (newState) => {
    if (!setPlayer) return;
    setPlayer((prev) => ({ ...prev, quirk: { ...prev.quirk, clockState: newState } }));
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasDetails = quirk.description || quirk.effect;

  if (compact) {
    const matches =
      !normalizedQuery ||
      quirk.name?.toLowerCase().includes(normalizedQuery) ||
      quirk.description?.toLowerCase().includes(normalizedQuery) ||
      quirk.effect?.toLowerCase().includes(normalizedQuery);
    if (!matches) return null;

    const forceOpen =
      !!normalizedQuery &&
      (quirk.description?.toLowerCase().includes(normalizedQuery) ||
        quirk.effect?.toLowerCase().includes(normalizedQuery));
    const isOpen = descOpen || forceOpen;

    return (
      <Paper sx={{ mb: 1, overflow: "hidden" }} elevation={0} variant="outlined">
        <CompactSectionHeader title={t("Quirk")} />
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
                {highlightMatch(quirk.name, searchQuery)}
              </Typography>
            </Box>
            {hasDetails && isOpen && (
              <Box sx={{ px: 1.5, py: 0.75, bgcolor: "rgba(0,0,0,0.03)", borderTop: "1px solid", borderColor: "divider" }}>
                {quirk.description && <NotesMarkdown compact>{highlightMarkdownText(quirk.description, searchQuery)}</NotesMarkdown>}
                {quirk.effect && <NotesMarkdown compact>{highlightMarkdownText(quirk.effect, searchQuery)}</NotesMarkdown>}
              </Box>
            )}
          </Box>
          {sections > 0 && (
            <ClockControls
              sections={sections} state={clockState} setState={persistState}
              label={<Typography sx={{ fontWeight: "bold", fontSize: "0.85rem", lineHeight: 1.3 }} noWrap>{t("Clock")}</Typography>}
              clockSize={36} compact theme={{ primary }}
            />
          )}
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
      <SectionCard title={t("Quirk") + ": " + quirk.name} noShadow>
        {sections > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", px: "8px", py: "6px", borderBottom: "1px solid", borderColor: "divider" }}>
            <ClockControls sections={sections} state={clockState} setState={persistState} clockSize={44} compact theme={{ primary }} label={null} />
          </Box>
        )}
        {quirk.description && (
          <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "stretch" }}>
              <Box sx={labelPillSx}>
                <Typography sx={{ fontFamily: "Antonio", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", color: "inherit", letterSpacing: "0.05em" }}>
                  {t("Description")}
                </Typography>
              </Box>
              <Box sx={nameBandSx} />
            </Box>
            <Box sx={{ px: "10px", py: "6px", borderTop: "1px solid", borderColor: "divider" }}>
              <NotesMarkdown compact>{quirk.description}</NotesMarkdown>
            </Box>
          </Box>
        )}
        {quirk.effect && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "stretch" }}>
              <Box sx={labelPillSx}>
                <Typography sx={{ fontFamily: "Antonio", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", color: "inherit", letterSpacing: "0.05em" }}>
                  {t("Effect")}
                </Typography>
              </Box>
              <Box sx={nameBandSx} />
            </Box>
            <Box sx={{ px: "10px", py: "6px", borderTop: "1px solid", borderColor: "divider" }}>
              <NotesMarkdown compact>{quirk.effect}</NotesMarkdown>
            </Box>
          </Box>
        )}
      </SectionCard>
    </>
  );
}
