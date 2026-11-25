import React from "react";
import { Box, Typography } from "@mui/material";
import { TypeAffinity } from "./TypeAffinity";
import { AFFINITY_TYPES } from "/src/components/shared/actors/core-utils";

export default function DefenseAffinityRow({
  t,
  defValue,
  mDefValue,
  affinities,
  effectiveAffinities,
  panelBg,
  panelBorder,
  dividerColor,
  borderImage,
  editable = false,
  onChangeAffinity,
  compactBreakpoint = 560,
  showDefenseColumnsDesktop = true,
  mx = "2px",
  mb = "2px",
  mt,
  defColumnWidth,
  lineColor = "#7d6482",
}) {
  const segmented = Boolean(defColumnWidth);
  const line = `1px solid ${lineColor}`;
  const compactQuery = `@container (max-width: ${compactBreakpoint}px)`;
  const desktopColumns = showDefenseColumnsDesktop
    ? defColumnWidth
      ? `repeat(2, ${defColumnWidth}) repeat(9, minmax(0, 1fr))`
      : "auto auto repeat(9, minmax(0, 1fr))"
    : "repeat(9, minmax(0, 1fr))";

  return (
    <Box
      sx={{
        ...(segmented
          ? {}
          : {
              borderBottom: "1px solid #281127",
              borderTop: "1px solid #281127",
              borderLeft: "1px solid #281127",
              borderImage,
            }),
        mx,
        mb,
        mt,
        ...(segmented && {
          position: "relative",
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            left: 0,
            right: 0,
            height: "1px",
            pointerEvents: "none",
            background: `linear-gradient(90deg, ${lineColor} 0%, ${lineColor} 55%, transparent 100%)`,
            maskImage: `linear-gradient(90deg, #000 calc(2 * ${defColumnWidth}), transparent 0, transparent calc(2 * ${defColumnWidth} + 3px), #000 0)`,
            WebkitMaskImage: `linear-gradient(90deg, #000 calc(2 * ${defColumnWidth}), transparent 0, transparent calc(2 * ${defColumnWidth} + 3px), #000 0)`,
            [compactQuery]: { maskImage: "none", WebkitMaskImage: "none" },
          },
          "&::before": { top: 0 },
          "&::after": { bottom: 0 },
          fontSize: "1.1rem",
          alignItems: "stretch",
          [compactQuery]: { fontSize: "0.9rem", mt: 0 },
        }),
        display: "grid",
        gridTemplateColumns: desktopColumns,
        width: "calc(100% - 4px)",
        [compactQuery]: {
          gridTemplateColumns: "repeat(9, minmax(0, 1fr))",
        },
      }}
    >
      {showDefenseColumnsDesktop && (
        <>
          <Box
            sx={{
              bgcolor: panelBg,
              borderRight: `1px solid ${panelBorder}`,
              py: segmented ? 0.6 : 0.4,
              px: 0.5,
              minWidth: 58,

              whiteSpace: "nowrap",
              [compactQuery]: { display: "none" },
            }}
          >
            <Typography
              component="span"
              variant="body2"
              sx={{
                fontFamily: "'Antonio', fantasy, sans-serif",
                fontSize: segmented ? "inherit" : "0.75rem",
                fontWeight: segmented ? "inherit" : undefined,
                color: segmented ? "inherit" : undefined,
              }}
            >
              {t("DEF")} {defValue}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: panelBg,
              borderRight: `1px solid ${panelBorder}`,
              py: segmented ? 0.6 : 0.4,
              px: 0.5,
              minWidth: 66,
              ...(segmented && {
                borderRight: line,
              }),
              whiteSpace: "nowrap",
              [compactQuery]: { display: "none" },
            }}
          >
            <Typography
              component="span"
              variant="body2"
              sx={{
                fontFamily: "'Antonio', fantasy, sans-serif",
                fontSize: segmented ? "inherit" : "0.75rem",
                fontWeight: segmented ? "inherit" : undefined,
                color: segmented ? "inherit" : undefined,
              }}
            >
              {t("M.DEF")} {mDefValue}
            </Typography>
          </Box>
        </>
      )}

      {AFFINITY_TYPES.map((type, index) => (
        <Box
          key={type}
          sx={{
            py: segmented ? 0.6 : 0.4,
            borderRight:
              index < AFFINITY_TYPES.length - 1
                ? segmented
                  ? line
                  : `1px solid ${dividerColor}`
                : undefined,
            display: "flex",
            justifyContent: segmented ? "flex-start" : "center",
            pl: segmented ? 0.75 : undefined,
            alignItems: "center",
            minWidth: 0,
            ...(segmented && {
              [compactQuery]: { justifyContent: "center", pl: 0 },
              borderLeft: index === 0 ? line : undefined,
              ml: index === 0 ? "3px" : undefined,
            }),
            "& img, & svg": {
              width: segmented
                ? "clamp(16px, 3cqw, 30px) !important"
                : "1.35em !important",
              height: segmented
                ? "clamp(16px, 3cqw, 30px) !important"
                : "1.35em !important",
              flexShrink: 0,
              display: "block",
            },
            "& .MuiTypography-root": {
              fontSize: segmented
                ? "clamp(0.85rem, 2.5cqw, 1.5rem)"
                : "0.88rem",
              whiteSpace: "nowrap",
              lineHeight: segmented ? 1 : undefined,
              ...(segmented && { textBox: "trim-both cap alphabetic" }),
              letterSpacing: 0,
            },
            [`@container (max-width: 380px)`]: {
              py: segmented ? 0.6 : 0.25,
              "& img, & svg": {
                width: segmented
                  ? "clamp(15px, 4.4cqw, 24px) !important"
                  : "1.1em !important",
                height: segmented
                  ? "clamp(15px, 4.4cqw, 24px) !important"
                  : "1.1em !important",
              },
              "& .MuiTypography-root": {
                fontSize: segmented
                  ? "clamp(0.8rem, 3.7cqw, 1.15rem)"
                  : "0.72rem",
              },
            },
            [`@container (max-width: 300px)`]: {
              "& .MuiTypography-root": { display: "none" },
              "& img, & svg": {
                width: "1.4em !important",
                height: "1.4em !important",
              },
            },
          }}
        >
          <TypeAffinity
            type={type}
            affinity={
              editable
                ? affinities?.[type] || ""
                : effectiveAffinities?.[type] || affinities?.[type] || ""
            }
            currentAffinity={effectiveAffinities?.[type]}
            stackBelow={segmented ? compactBreakpoint : undefined}
            editable={editable}
            onChangeAffinity={onChangeAffinity?.(type)}
          />
        </Box>
      ))}
    </Box>
  );
}
