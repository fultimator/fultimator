import React from "react";
import {
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
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

const isCustomTherioform = (form) =>
  form.name === "mutant_therioform_custom" ||
  form.name === "mutant_therioform_custom_name";

export default function SpellTherioform({ spell }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";
  const visibleTherioforms = (spell.therioforms || []).filter((form) => {
    if (!form) return false;
    const isCustom = isCustomTherioform(form);
    const name = isCustom ? form.customName : form.name;
    const description = isCustom ? form.description : form.description;
    return [name, form.genoclepsis, description].some((value) =>
      String(value || "").trim(),
    );
  });

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        {/* Therioforms List */}
        {visibleTherioforms.map((form, index) => (
          <TableRow
            key={index}
            sx={{
              backgroundImage:
                index % 2 === 0
                  ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`
                  : `linear-gradient(to right, ${gradientColor}, ${gradientColor})`,
            }}
          >
            <StyledTableCell sx={{ width: "30%", fontWeight: "bold" }}>
              {isCustomTherioform(form)
                ? form.customName
                : t(form.name)}
              {form.genoclepsis && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    fontStyle: "italic",
                    color: "text.secondary",
                  }}
                >
                  {isCustomTherioform(form)
                    ? form.genoclepsis
                    : t(form.genoclepsis)}
                </Typography>
              )}
            </StyledTableCell>
            <StyledTableCell sx={{ width: "70%", fontSize: "0.85rem" }}>
              <ReactMarkdown
                components={{ p: ({ _node, ...props }) => <span {...props} /> }}
              >
                {isCustomTherioform(form)
                  ? form.description
                  : t(form.description)}
              </ReactMarkdown>
            </StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
