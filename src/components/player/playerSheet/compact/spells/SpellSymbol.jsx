import React from "react";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";

const StyledTableCell = styled(TableCell)({ 
  padding: "2px 4px",
  fontSize: "0.8rem",
  borderBottom: "1px solid rgba(224, 224, 224, 1)"
});

export default function SpellSymbol({ spell }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? '#1f1f1f' : '#fff';

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        {/* Symbols List */}
        {spell.symbols?.map((sym, index) => (
          <TableRow key={index} sx={{ background: index % 2 === 0 ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})` : gradientColor }}>
            <StyledTableCell sx={{ width: "30%", fontWeight: "bold" }}>
              {sym.name === "symbol_custom_name" ? sym.customName : t(sym.name)}
            </StyledTableCell>
            <StyledTableCell sx={{ width: "70%", fontSize: "0.75rem" }}>
              <ReactMarkdown components={{ p: props => <span {...props} /> }}>
                {sym.name === "symbol_custom_name" ? sym.effect : t(sym.effect)}
              </ReactMarkdown>
            </StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
