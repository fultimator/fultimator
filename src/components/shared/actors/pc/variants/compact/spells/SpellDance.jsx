import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";

const StyledTableCell = styled(TableCell)({
  padding: "4px 8px",
  fontSize: "0.85rem",
  lineHeight: 1.35,
  verticalAlign: "middle",
  borderBottom: "1px solid rgba(224, 224, 224, 1)",
});

const CUSTOM_DANCE_KEYS = new Set(["dance_custom", "dance_custom_name"]);

export default function SpellDance({ spell }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  const getDanceName = (dance) => {
    const key = dance.key || dance.name;
    if (CUSTOM_DANCE_KEYS.has(key))
      return dance.customName || t("dance_custom_name");
    return dance.customName || t(key || dance.name || "");
  };

  const getDanceDuration = (dance) => {
    const key = dance.key || dance.name;
    return CUSTOM_DANCE_KEYS.has(key)
      ? dance.duration
      : t(dance.duration || "");
  };

  const getDanceEffect = (dance) => {
    const key = dance.key || dance.name;
    return CUSTOM_DANCE_KEYS.has(key) ? dance.effect : t(dance.effect || "");
  };

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        {/* Dances List */}
        {spell.dances?.map((dance, index) => (
          <TableRow
            key={index}
            sx={{
              background:
                index % 2 === 0
                  ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`
                  : gradientColor,
              minHeight: 44,
            }}
          >
            <StyledTableCell sx={{ width: "34%" }}>
              <Box sx={{ display: "grid", gap: 0.25 }}>
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    lineHeight: 1.25,
                  }}
                >
                  {getDanceName(dance)}
                </Typography>
                <Typography
                  sx={{ fontSize: "0.78rem", lineHeight: 1.25, opacity: 0.85 }}
                >
                  {getDanceDuration(dance)}
                </Typography>
              </Box>
            </StyledTableCell>
            <StyledTableCell sx={{ width: "66%", fontSize: "0.85rem" }}>
              <ReactMarkdown
                components={{ p: ({ _node, ...props }) => <span {...props} /> }}
              >
                {getDanceEffect(dance)}
              </ReactMarkdown>
            </StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
