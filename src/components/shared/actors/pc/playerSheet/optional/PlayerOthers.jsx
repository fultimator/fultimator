import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp, StickyNote2Outlined } from "@mui/icons-material";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import CompactSectionHeader from "/src/components/shared/actors/pc/variants/compact/CompactSectionHeader";
import { useTranslate } from "/src/translation/translate";
import { useTheme } from "@mui/material/styles";
import Clock from "./Clock";
import ClockControls from "/src/components/shared/actors/pc/variants/compact/ClockControls";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useClock } from "/src/hooks/useClock";
import NotesMarkdown from "/src/components/common/NotesMarkdown";
import { highlightMatch, highlightMarkdownText } from "/src/components/shared/actors/pc/variants/compact/highlightUtils";

function OtherItemCompact({ other, index, setPlayer, searchQuery, normalizedQuery, primary, t }) {
  const muiTheme = useTheme();
  const [descOpen, setDescOpen] = useState(false);

  const sections = other.clock?.sections ?? 0;
  const hasClock = sections > 0;
  const clockState = hasClock ? (other.clockState ?? new Array(sections).fill(false)) : [];

  const persistState = (newState) => {
    if (!setPlayer) return;
    setPlayer((prev) => {
      const updated = [...(prev.others ?? [])];
      updated[index] = { ...updated[index], clockState: newState };
      return { ...prev, others: updated };
    });
  };

  const hasDetails = other.description || other.effect;
  const forceOpen =
    !!normalizedQuery &&
    (other.description?.toLowerCase().includes(normalizedQuery) ||
      other.effect?.toLowerCase().includes(normalizedQuery));
  const isOpen = descOpen || forceOpen;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
          {hasDetails ? (
            <IconButton size="small" sx={{ p: 0, flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); setDescOpen((v) => !v); }}>
              {isOpen ? <KeyboardArrowUp sx={{ fontSize: "1rem" }} /> : <KeyboardArrowDown sx={{ fontSize: "1rem" }} />}
            </IconButton>
          ) : (
            <StickyNote2Outlined sx={{ fontSize: "1rem", color: "text.secondary", flexShrink: 0 }} />
          )}
          <Typography sx={{ flex: 1, fontWeight: "bold", fontSize: "0.85rem", textTransform: "uppercase", lineHeight: 1.3 }} noWrap>
            {highlightMatch(other.name, searchQuery)}
          </Typography>
        </Box>
        {hasDetails && isOpen && (
          <Box sx={{ px: 1.5, py: 0.75, bgcolor: "rgba(0,0,0,0.03)", borderTop: "1px solid", borderColor: "divider" }}>
            {other.description && <NotesMarkdown compact>{highlightMarkdownText(other.description, searchQuery)}</NotesMarkdown>}
            {other.effect && <NotesMarkdown compact>{highlightMarkdownText(other.effect, searchQuery)}</NotesMarkdown>}
          </Box>
        )}
      </Box>
      {hasClock && (
        <ClockControls sections={sections} state={clockState} setState={persistState} label={t("Clock")} theme={{ primary }} />
      )}
    </Box>
  );
}

function OtherItemFull({ other, index, setPlayer, isEditMode, primary, isDark, t }) {
  const sections = other.clock?.sections ?? 0;
  const hasClock = sections > 0;
  const clockState = hasClock ? (other.clockState ?? new Array(sections).fill(false)) : [];

  const persistState = (newState) => {
    if (!setPlayer) return;
    setPlayer((prev) => {
      const updated = [...(prev.others ?? [])];
      updated[index] = { ...updated[index], clockState: newState };
      return { ...prev, others: updated };
    });
  };

  const { set, increment, decrement, reset } = useClock(sections, clockState, persistState);

  return (
    <React.Fragment>
      <Divider sx={{ my: 1 }} />
      <SectionCard title={other.name} noShadow>
        <Grid container>
          {hasClock && (
            <Grid sx={{ display: "flex", justifyContent: "center", pt: 1, pb: 0.5 }} size={12}>
              <Clock numSections={sections} size={180} state={clockState} setState={set} />
            </Grid>
          )}
          {isEditMode && setPlayer && hasClock && (
            <Grid sx={{ display: "flex", justifyContent: "center", pb: 1, gap: 1 }} size={12}>
              <Tooltip title={t("Decrement")} arrow>
                <IconButton color="primary" onClick={decrement} size="small" variant="outlined">
                  <RemoveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("Reset")} arrow>
                <IconButton color="primary" onClick={reset} size="small" variant="outlined">
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("Increment")} arrow>
                <IconButton color="primary" onClick={increment} size="small" variant="outlined">
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
          )}
          {other.description && (
            <Grid sx={{ background: `linear-gradient(to right, ${isDark ? "#2a2a3a" : "#e8eaf6"}, ${isDark ? "#252525" : "white"})`, borderTop: hasClock ? `1px solid ${primary}` : undefined, px: "10px", py: "5px" }} size={12}>
              <Box sx={{ fontStyle: "italic" }}><NotesMarkdown>{other.description}</NotesMarkdown></Box>
            </Grid>
          )}
          {other.effect && (
            <Grid sx={{ borderTop: `1px solid ${primary}`, px: "10px", py: "5px" }} size={12}>
              <NotesMarkdown>{other.effect}</NotesMarkdown>
            </Grid>
          )}
        </Grid>
      </SectionCard>
    </React.Fragment>
  );
}

export default function PlayerOthers({ player, setPlayer, isEditMode, compact = false, searchQuery = "" }) {
  const { t } = useTranslate();
  const muiTheme = useTheme();
  const primary = muiTheme.palette.primary.main;
  const isDark = muiTheme.palette.mode === "dark";

  const others = player.others;
  if (!others?.length) return null;

  if (compact) {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const visible = others
      .map((o, i) => ({ ...o, originalIndex: i }))
      .filter((o) => o?.name)
      .filter((o) =>
        !normalizedQuery ||
        o.name?.toLowerCase().includes(normalizedQuery) ||
        o.description?.toLowerCase().includes(normalizedQuery) ||
        o.effect?.toLowerCase().includes(normalizedQuery),
      );
    if (visible.length === 0) return null;

    return (
      <Paper sx={{ mb: 1, overflow: "hidden" }} elevation={0} variant="outlined">
        <CompactSectionHeader title={t("Other Optionals")} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", p: "4px" }}>
          {visible.map((other) => (
            <OtherItemCompact
              key={other.originalIndex}
              other={other}
              index={other.originalIndex}
              setPlayer={setPlayer}
              searchQuery={searchQuery}
              normalizedQuery={normalizedQuery}
              primary={primary}
              t={t}
            />
          ))}
        </Box>
      </Paper>
    );
  }

  return (
    <>
      {others.map((other, index) => {
        if (!other?.name) return null;
        return (
          <OtherItemFull
            key={index}
            other={other}
            index={index}
            setPlayer={setPlayer}
            isEditMode={isEditMode}
            primary={primary}
            isDark={isDark}
            t={t}
          />
        );
      })}
    </>
  );
}
