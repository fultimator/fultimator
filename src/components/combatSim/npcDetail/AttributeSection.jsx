import React from "react";
import { Box } from "@mui/material";
import { t } from "../../../translation/translate";
import { useTheme } from "@mui/material/styles";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import {
  DexAttributeIcon,
  InsAttributeIcon,
  MigAttributeIcon,
  WlpAttributeIcon,
} from "/src/components/icons";

const STAT_LABEL_SHADOW = "-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000";

const ATTRS = [
  { label: "DEX", Icon: DexAttributeIcon, calcArgs: ["Slow", "Enraged", "dexterity"], baseKey: "dexterity", colorKey: "info" },
  { label: "INS", Icon: InsAttributeIcon, calcArgs: ["Dazed", "Enraged", "insight"],   baseKey: "insight",   colorKey: "secondary" },
  { label: "MIG", Icon: MigAttributeIcon, calcArgs: ["Weak", "Poisoned", "might"],      baseKey: "might",     colorKey: "error" },
  { label: "WLP", Icon: WlpAttributeIcon, calcArgs: ["Shaken", "Poisoned", "will"],     baseKey: "will",      colorKey: "warning" },
];

export function DefStatsRow({ defValue, mdefValue, onDefClick, onMdefClick }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const trackBg = isDark ? theme.palette.grey[700] : theme.palette.grey[300];
  const color = theme.palette.primary.main;

  const stats = [
    { label: "DEF",   iconSrc: "/assets/icons/stats/icon_def.png",  value: defValue,  onClick: onDefClick },
    { label: "M.DEF", iconSrc: "/assets/icons/stats/icon_mdef.png", value: mdefValue, onClick: onMdefClick },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        borderTop: `1px solid ${theme.palette.divider}`,
        py: 0.75,
        px: 1,
        gap: 0.5,
        bgcolor: isDark ? theme.palette.grey[800] : theme.palette.grey[200],
      }}
    >
      {stats.map(({ label, iconSrc, value, onClick }) => (
        <Box
          key={label}
          onClick={onClick}
          sx={{
            display: "flex",
            alignItems: "stretch",
            flex: 1,
            borderRadius: "999px",
            overflow: "hidden",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
            cursor: onClick ? "pointer" : "default",
            "&:hover": onClick ? { filter: "brightness(1.08)" } : undefined,
          }}
        >
          <Box
              sx={{
                bgcolor: color,
                color: "#fff",
                px: 0.75,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontFamily: "Antonio",
                fontWeight: 700,
                fontSize: "0.95rem",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                textShadow: STAT_LABEL_SHADOW,
              }}
            >
            <Box component="img" src={iconSrc} alt={label} sx={{ width: "1.25em", height: "1.25em", objectFit: "contain" }} />
            {label}
          </Box>
          <Box
            sx={{
              bgcolor: trackBg,
              px: 0.75,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Antonio",
              fontWeight: 700,
              fontSize: "1rem",
              flex: 1,
            }}
          >
            {value ?? 0}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

const AttributeSection = ({ selectedNPC, calcAttr }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const trackBg = isDark ? theme.palette.grey[700] : theme.palette.grey[300];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        borderTop: `1px solid ${theme.palette.divider}`,
        py: 0.75,
        px: 1,
        gap: 0.5,
        bgcolor: isDark ? theme.palette.grey[800] : theme.palette.grey[200],
      }}
    >
      {ATTRS.map(({ label, Icon, calcArgs, baseKey, colorKey }) => {
        const value = calcAttr(...calcArgs, selectedNPC);
        const raw = selectedNPC?.attributes?.[baseKey];
        const base = raw && typeof raw === "object" ? raw.base : raw;
        const diff = base != null ? value - base : 0;
        const color = theme.palette[colorKey].main;

        return (
          <Box
            key={label}
            sx={{
              display: "flex",
              alignItems: "stretch",
              flex: 1,
              borderRadius: "999px",
              overflow: "hidden",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
            }}
          >
            <Box
              sx={{
                bgcolor: color,
                color: "#fff",
                px: 0.75,
                display: "flex",
                alignItems: "center",
                gap: "3px",
                fontFamily: "Antonio",
                fontWeight: 700,
                fontSize: "0.95rem",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                textShadow: STAT_LABEL_SHADOW,
              }}
            >
              <Icon size="1.3em" />
              {t(label)}
            </Box>
            <Box
              sx={{
                bgcolor: trackBg,
                px: 0.75,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1px",
                fontFamily: "Antonio",
                fontWeight: 700,
                fontSize: "1rem",
                flex: 1,
                color: diff > 0
                  ? theme.palette.success.main
                  : diff < 0
                    ? theme.palette.error.main
                    : "inherit",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {diff > 0 && <ArrowDropUp sx={{ fontSize: "1.2em", mr: "-4px", display: "block" }} />}
                {diff < 0 && <ArrowDropDown sx={{ fontSize: "1.2em", mr: "-4px", display: "block" }} />}
                {value}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default AttributeSection;
