import React from "react";
import { Box, LinearProgress } from "@mui/material";
import { alpha } from "@mui/material/styles";

function MiniBar({ value, color, track }) {
  return (
    <LinearProgress
      variant="determinate"
      value={Math.max(0, Math.min(100, value))}
      sx={{
        height: 7,
        borderRadius: 99,
        bgcolor: track,
        "& .MuiLinearProgress-bar": {
          borderRadius: 99,
          backgroundColor: color,
          transition: (t) =>
            t.transitions.create("transform", {
              duration: t.transitions.duration.shorter,
              easing: t.transitions.easing.easeOut,
            }),
        },
      }}
    />
  );
}

export default function ResourceInlineBars({
  hpPct,
  mpPct,
  ipPct = null,
  hpColor,
  mpColor,
  ipColor = "#4CAF50",
  tone = "neutral",
}) {
  const hasIp = Number.isFinite(ipPct);
  const toneBg =
    tone === "npc"
      ? "rgba(120,24,39,0.10)"
      : tone === "pc"
        ? "rgba(20,92,84,0.10)"
        : "rgba(0,0,0,0.06)";
  const toneBorder =
    tone === "npc"
      ? "rgba(166,58,76,0.35)"
      : tone === "pc"
        ? "rgba(43,134,122,0.35)"
        : null;
  return (
    <Box
      sx={{
        mt: 0.5,
        px: 0.5,
        py: 0.45,
        borderRadius: "6px",
        bgcolor: (t) =>
          t.palette.mode === "dark"
            ? alpha(t.palette.common.black, 0.26)
            : toneBg,
        border: (t) =>
          `1px solid ${
            toneBorder ??
            alpha(
              t.palette.common.white,
              t.palette.mode === "dark" ? 0.12 : 0.6,
            )
          }`,
        display: { xs: "none", sm: "grid" },
        gridTemplateColumns: hasIp ? "1fr 1fr 0.55fr" : "1fr 1fr",
        gap: 0.75,
        "@container initiative-row (max-width: 620px)": {
          display: "none",
        },
      }}
    >
      <MiniBar value={hpPct} color={hpColor} track={alpha(hpColor, 0.2)} />
      <MiniBar value={mpPct} color={mpColor} track={alpha(mpColor, 0.2)} />
      {hasIp && <MiniBar value={ipPct} color={ipColor} track={alpha(ipColor, 0.2)} />}
    </Box>
  );
}
