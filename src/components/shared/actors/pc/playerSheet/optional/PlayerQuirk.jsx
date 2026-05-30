import React from "react";
import { Typography, Divider, Box } from "@mui/material";
import SectionCard from "../../../common/SectionCard";
import { useTranslate } from "../../../../../../translation/translate";
import { useCustomTheme } from "../../../../../../hooks/useCustomTheme";
import NotesMarkdown from "../../../../../common/NotesMarkdown";
import ClockControls from "../../../pc-compact/ClockControls";

export default function PlayerQuirk({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const quirk = player.quirk;
  if (!quirk?.name) return null;

  const sections = quirk.clock?.sections ?? 0;
  const clockState =
    sections > 0
      ? (quirk.clockState ?? new Array(sections).fill(false))
      : [];

  const persistState = (newState) => {
    if (!setPlayer) return;
    setPlayer((prev) => ({
      ...prev,
      quirk: { ...prev.quirk, clockState: newState },
    }));
  };

  const labelPillSx = {
    background: theme.primary,
    px: "10px",
    py: "4px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    alignSelf: "stretch",
    flexShrink: 0,
    minWidth: 72,
    justifyContent: "center",
  };

  const nameBandSx = {
    px: "10px",
    py: "4px",
    display: "flex",
    alignItems: "center",
    flex: 1,
    minHeight: 32,
    bgcolor: "rgba(0,0,0,0.02)",
  };

  return (
    <>
      <Divider sx={{ my: 1 }} />
      <SectionCard title={t("Quirk") + ": " + quirk.name} noShadow>

        {/* Clock row */}
        {sections > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: "8px",
              py: "6px",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <ClockControls
              sections={sections}
              state={clockState}
              setState={persistState}
              clockSize={44}
              compact
              theme={theme}
              label={null}
            />
          </Box>
        )}

        {/* Description row */}
        {quirk.description && (
          <Box
            sx={{
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "stretch" }}>
              <Box sx={labelPillSx}>
                <Typography
                  sx={{
                    fontFamily: "Antonio",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    color: "inherit",
                    letterSpacing: "0.05em",
                  }}
                >
                  {t("Description")}
                </Typography>
              </Box>
              <Box sx={nameBandSx} />
            </Box>
            <Box
              sx={{
                px: "10px",
                py: "6px",
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <NotesMarkdown compact>{quirk.description}</NotesMarkdown>
            </Box>
          </Box>
        )}

        {/* Effect row */}
        {quirk.effect && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "stretch" }}>
              <Box sx={labelPillSx}>
                <Typography
                  sx={{
                    fontFamily: "Antonio",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    color: "inherit",
                    letterSpacing: "0.05em",
                  }}
                >
                  {t("Effect")}
                </Typography>
              </Box>
              <Box sx={nameBandSx} />
            </Box>
            <Box
              sx={{
                px: "10px",
                py: "6px",
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <NotesMarkdown compact>{quirk.effect}</NotesMarkdown>
            </Box>
          </Box>
        )}
      </SectionCard>
    </>
  );
}
