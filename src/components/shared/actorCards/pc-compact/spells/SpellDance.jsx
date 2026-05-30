import React from "react";
import { Table, TableBody, TableRow, TableCell } from "@mui/material";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";

const StyledTableCell = styled(TableCell)({
  padding: "4px 8px",
  fontSize: "0.85rem",
  borderBottom: "1px solid rgba(224, 224, 224, 1)",
});

export default function SpellDance({ spell }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

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
            }}
          >
            <StyledTableCell sx={{ width: "30%", fontWeight: "bold" }}>
              {dance.name === "dance_custom_name"
                ? dance.customName
                : t(dance.name)}
            </StyledTableCell>
            <StyledTableCell sx={{ width: "20%", fontSize: "0.75rem" }}>
              {dance.name === "dance_custom_name"
                ? dance.duration
                : t(dance.duration)}
            </StyledTableCell>
            <StyledTableCell sx={{ width: "50%", fontSize: "0.75rem" }}>
              <ReactMarkdown
                components={{ p: ({ _node, ...props }) => <span {...props} /> }}
              >
                {dance.name === "dance_custom_name"
                  ? dance.effect
                  : t(dance.effect)}
              </ReactMarkdown>
            </StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
