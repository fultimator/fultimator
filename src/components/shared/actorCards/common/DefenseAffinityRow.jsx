import React from "react";
import { Box, Typography } from "@mui/material";
import { TypeAffinity } from "../../../player/stats/types";

const AFFINITY_TYPES = [
  "physical",
  "air",
  "bolt",
  "dark",
  "earth",
  "fire",
  "ice",
  "light",
  "poison",
];

export default function DefenseAffinityRow({
  t,
  defValue,
  mDefValue,
  affinities,
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
}) {
  const compactQuery = `@container (max-width: ${compactBreakpoint}px)`;
  const desktopColumns = showDefenseColumnsDesktop
    ? "auto auto repeat(9, minmax(0, 1fr))"
    : "repeat(9, minmax(0, 1fr))";

  return (
    <Box
      sx={{
        borderBottom: "1px solid #281127",
        borderTop: "1px solid #281127",
        borderLeft: "1px solid #281127",
        borderImage,
        mx,
        mb,
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
              py: 0.4,
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
                fontSize: "0.75rem",
              }}
            >
              {t("DEF")} {defValue}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: panelBg,
              borderRight: `1px solid ${panelBorder}`,
              py: 0.4,
              px: 0.5,
              minWidth: 66,
              whiteSpace: "nowrap",
              [compactQuery]: { display: "none" },
            }}
          >
            <Typography
              component="span"
              variant="body2"
              sx={{
                fontFamily: "'Antonio', fantasy, sans-serif",
                fontSize: "0.75rem",
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
            py: 0.4,
            borderRight:
              index < AFFINITY_TYPES.length - 1
                ? `1px solid ${dividerColor}`
                : undefined,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <TypeAffinity
            type={type}
            affinity={affinities?.[type] || ""}
            editable={editable}
            onChangeAffinity={onChangeAffinity?.(type)}
          />
        </Box>
      ))}
    </Box>
  );
}
