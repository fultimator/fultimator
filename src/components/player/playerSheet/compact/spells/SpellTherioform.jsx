import React from "react";
import {
  Typography,
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

export default function SpellTherioform({ spell }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? '#1f1f1f' : '#fff';

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        {/* Therioforms List */}
        {spell.therioforms?.map((form, index) => (
          <TableRow key={index} sx={{ backgroundImage: index % 2 === 0 ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})` : `linear-gradient(to right, ${gradientColor}, ${gradientColor})` }}>
            <StyledTableCell sx={{ width: "30%", fontWeight: "bold" }}>
              {form.name === "mutant_therioform_custom_name" ? form.customName : t(form.name)}
              {form.genoclepsis && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    fontStyle: "italic",
                    color: "text.secondary"
                  }}>
                  {form.name === "mutant_therioform_custom_name" ? form.genoclepsis : t(form.genoclepsis)}
                </Typography>
              )}
            </StyledTableCell>
            <StyledTableCell sx={{ width: "70%", fontSize: "0.75rem" }}>
              <ReactMarkdown components={{ p: ({ _node, ...props }) => <span {...props} /> }}>
                {form.name === "mutant_therioform_custom_name" ? form.description : t(form.description)}
              </ReactMarkdown>
            </StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
