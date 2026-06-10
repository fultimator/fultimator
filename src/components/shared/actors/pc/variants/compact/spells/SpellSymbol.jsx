import React from "react";
import { Box, Table, TableBody, TableRow, TableCell, Typography } from "@mui/material";
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

export default function SpellSymbol({ spell }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  const getSymbolName = (sym) => {
    const key = sym.key || sym.name;
    if (key === "symbol_custom_name") return sym.customName || t("symbol_custom_name");
    return sym.customName || t(key || sym.name || "");
  };

  const getSymbolEffect = (sym) => {
    const key = sym.key || sym.name;
    return key === "symbol_custom_name" ? sym.effect : t(sym.effect || "");
  };

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        {/* Symbols List */}
        {spell.symbols?.map((sym, index) => (
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
                <Typography sx={{ fontSize: "0.85rem", fontWeight: "bold", lineHeight: 1.25 }}>
                  {getSymbolName(sym)}
                </Typography>
              </Box>
            </StyledTableCell>
            <StyledTableCell sx={{ width: "66%", fontSize: "0.85rem" }}>
              <ReactMarkdown
                components={{ p: ({ _node, ...props }) => <span {...props} /> }}
              >
                {getSymbolEffect(sym)}
              </ReactMarkdown>
            </StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
