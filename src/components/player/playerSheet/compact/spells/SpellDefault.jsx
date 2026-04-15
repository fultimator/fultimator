import React from "react";
import { Typography, Table, TableBody, TableRow, Box } from "@mui/material";
import { OffensiveSpellIcon } from "../../../../icons";
import attributes from "../../../../../libs/attributes";
import { CloseBracket, OpenBracket } from "../../../../Bracket";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import { StyledTableCell, StyledMarkdown } from "./StyledSpellComponents";

export default function SpellDefault({
  spellName,
  mp,
  maxTargets,
  targetDesc,
  duration,
  description,
  isOffensive,
  attr1,
  attr2,
  _isMagisphere,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        <TableRow
          sx={{
            backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
          }}
        >
          <StyledTableCell sx={{ width: "40%" }}>
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.85rem",
                }}
              >
                {spellName}
              </Typography>
              {isOffensive && (
                <OffensiveSpellIcon sx={{ fontSize: "0.85rem" }} />
              )}
            </Box>
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ width: "15%" }}>
            <Typography sx={{ fontSize: "0.8rem" }}>
              {mp}
              {maxTargets !== 1 ? " × " + t("T") : ""}
            </Typography>
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ width: "20%" }}>
            <Typography sx={{ fontSize: "0.8rem" }}>{targetDesc}</Typography>
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ width: "25%" }}>
            <Typography sx={{ fontSize: "0.8rem" }}>{duration}</Typography>
          </StyledTableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell colSpan={4}>
            <Box sx={{ padding: "4px 0" }}>
              <Typography
                component="div"
                sx={{ fontSize: "0.8rem", marginBottom: 0.5 }}
              >
                <StyledMarkdown
                  allowedElements={["p", "ul", "li", "strong", "em", "mark"]}
                  unwrapDisallowed
                >
                  {description}
                </StyledMarkdown>
              </Typography>
              {isOffensive && (
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    marginTop: 0.5,
                  }}
                >
                  {t("Magic Check") + ": "}
                  <strong>
                    <OpenBracket />
                    {t(attributes[attr1].shortcaps)}
                    {t(" + ")}
                    {t(attributes[attr2].shortcaps)}
                    <CloseBracket />
                  </strong>
                </Typography>
              )}
            </Box>
          </StyledTableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
