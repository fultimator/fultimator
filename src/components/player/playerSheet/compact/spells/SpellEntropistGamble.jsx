import React from "react";
import {
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Box,
} from "@mui/material";
import { styled } from "@mui/system";
import attributes from "../../../../../libs/attributes";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";

const StyledTableCell = styled(TableCell)({ 
  padding: "4px 8px",
  fontSize: "0.85rem",
  borderBottom: "1px solid rgba(224, 224, 224, 1)"
});

const StyledMarkdown = ({ children, ...props }) => {
  return (
    <div style={{ whiteSpace: "pre-line", display: "inline", margin: 0, padding: 0 }}>
      <ReactMarkdown
        {...props}
        components={{
          p: (props) => <p style={{ margin: 0, padding: 0, fontSize: "0.8rem" }} {...props} />,
          ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
          li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
          strong: (props) => (
            <strong style={{ fontWeight: "bold" }} {...props} />
          ),
          em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

export default function SpellEntropistGamble({ gamble }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? '#1f1f1f' : '#fff';

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        {/* Header Row */}
        <TableRow sx={{ backgroundColor: theme.primary }}>
          <StyledTableCell colSpan={4} sx={{ color: "white", fontWeight: "bold", fontSize: "0.8rem", textAlign: "center" }}>
            {gamble.spellName} - {gamble.mp}MP × {gamble.maxTargets} {t("Max Dices")} - {t(attributes[gamble.attr].shortcaps)}
          </StyledTableCell>
        </TableRow>

        {/* Target Effects */}
        {gamble.targets?.map((target, index) => (
          <TableRow key={index} sx={{ background: index % 2 === 0 ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})` : gradientColor }}>
            <StyledTableCell sx={{ width: "15%" }}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: "bold" }}>
                {target.rangeFrom === target.rangeTo 
                  ? target.rangeFrom 
                  : `${target.rangeFrom}-${target.rangeTo}`}
              </Typography>
            </StyledTableCell>
            <StyledTableCell colSpan={3} sx={{ width: "85%" }}>
              <Box>
                <Typography component="div" sx={{ fontSize: "0.75rem", marginBottom: 0.5 }}>
                  <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                    {target.effect}
                  </StyledMarkdown>
                </Typography>
                {target.secondRoll && target.secondEffects?.length > 0 && (
                  <Box sx={{ marginTop: 0.25, paddingLeft: 0.5 }}>
                    <Typography sx={{ fontSize: "0.7rem", fontStyle: "italic", fontWeight: "bold" }}>
                      {t("Second Roll:")}
                    </Typography>
                    {target.secondEffects.map((secondEffect, secondIndex) => (
                      <Typography key={secondIndex} sx={{ fontSize: "0.7rem", paddingLeft: 0.5 }}>
                        {secondEffect.rangeFrom === secondEffect.rangeTo 
                          ? secondEffect.rangeFrom 
                          : `${secondEffect.rangeFrom}-${secondEffect.rangeTo}`}: {secondEffect.effect}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            </StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
