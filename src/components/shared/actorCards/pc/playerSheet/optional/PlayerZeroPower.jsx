import React from "react";
import { Typography, Divider, Box } from "@mui/material";
import SectionCard from "../../../common/SectionCard";
import { useTranslate } from "../../../../../../translation/translate";
import { useCustomTheme } from "../../../../../../hooks/useCustomTheme";
import NotesMarkdown from "../../../../../common/NotesMarkdown";
import ClockControls from "../../../pc-compact/ClockControls";

export default function PlayerZeroPower({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const zeroPower = player.zeroPower;
  const sections = zeroPower?.clock?.sections ?? 6;
  const clockState = zeroPower?.clockState ?? new Array(sections).fill(false);

  const persistState = (newState) => {
    if (!setPlayer) return;
    setPlayer((prev) => ({
      ...prev,
      zeroPower: { ...prev.zeroPower, clockState: newState },
    }));
  };

  if (!zeroPower?.name) return null;

  const triggerName =
    typeof zeroPower.zeroTrigger === "string"
      ? zeroPower.zeroTrigger
      : (zeroPower.zeroTrigger?.name ?? "");
  const triggerDesc =
    typeof zeroPower.zeroTrigger === "object"
      ? (zeroPower.zeroTrigger?.description ?? "")
      : "";
  const effectName =
    typeof zeroPower.zeroEffect === "string"
      ? zeroPower.zeroEffect
      : (zeroPower.zeroEffect?.name ?? "");
  const effectDesc =
    typeof zeroPower.zeroEffect === "object"
      ? (zeroPower.zeroEffect?.description ?? "")
      : "";

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
      <SectionCard title={t("Zero Power")} noShadow>

        {/* Name + clock row */}
        <Box sx={{ display: "flex", alignItems: "stretch", borderBottom: "1px solid", borderColor: "divider" }}>
          <Box sx={{ flex: 1, px: "10px", py: "6px", display: "flex", alignItems: "center" }}>
            <Typography
              sx={{
                fontFamily: "Antonio",
                fontWeight: 800,
                fontSize: { xs: "1rem", sm: "1.1rem" },
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                lineHeight: 1.2,
              }}
            >
              {zeroPower.name}
            </Typography>
          </Box>
          {sections > 0 && (
            <Box sx={{ px: "10px", pr: "12px", display: "flex", alignItems: "center", borderLeft: "1px solid", borderColor: "divider" }}>
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
        </Box>

        {/* Trigger row */}
        {(triggerName || triggerDesc) && (
          <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "stretch" }}>
              <Box sx={labelPillSx}>
                <Typography sx={{ fontFamily: "Antonio", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", color: "inherit", letterSpacing: "0.05em" }}>
                  {t("Trigger")}
                </Typography>
              </Box>
              <Box sx={nameBandSx}>
                <Typography sx={{ fontWeight: "bold", fontSize: "0.9rem", lineHeight: 1.4 }}>
                  {triggerName}
                </Typography>
              </Box>
            </Box>
            {triggerDesc && (
              <Box sx={{ px: "10px", py: "6px", borderTop: "1px solid", borderColor: "divider" }}>
                <NotesMarkdown compact>{triggerDesc}</NotesMarkdown>
              </Box>
            )}
          </Box>
        )}

        {/* Effect row */}
        {(effectName || effectDesc) && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "stretch" }}>
              <Box sx={labelPillSx}>
                <Typography sx={{ fontFamily: "Antonio", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", color: "inherit", letterSpacing: "0.05em" }}>
                  {t("Effect")}
                </Typography>
              </Box>
              <Box sx={nameBandSx}>
                <Typography sx={{ fontWeight: "bold", fontSize: "0.9rem", lineHeight: 1.4 }}>
                  {effectName}
                </Typography>
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
