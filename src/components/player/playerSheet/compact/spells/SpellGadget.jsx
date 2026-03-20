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

export default function SpellGadget({ spell }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? '#1f1f1f' : '#fff';
  const ranks = [t("Basic"), t("Advanced"), t("Superior")];

  const renderAlchemy = () => (
    <>
      <TableRow sx={{ backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})` }}>
        <StyledTableCell colSpan={2}>
          <Typography variant="caption" fontWeight="bold">
            {t("Mix")}: {ranks[spell.rank - 1]} ({t("IP Cost")}: {spell.rank + 2})
          </Typography>
        </StyledTableCell>
      </TableRow>
      <TableRow sx={{ backgroundColor: theme.secondary }}>
        <StyledTableCell sx={{ color: "white", fontWeight: "bold", fontSize: "0.75rem", py: 0 }}>
          {t("Targets")}
        </StyledTableCell>
        <StyledTableCell sx={{ color: "white", fontWeight: "bold", fontSize: "0.75rem", py: 0 }}>
          {t("The potions affects...")}
        </StyledTableCell>
      </TableRow>
      {spell.targets?.map((target, i) => (
        <TableRow key={`target-${i}`}>
          <StyledTableCell sx={{ fontWeight: "bold", width: "30%" }}>
            {target.rangeFrom}-{target.rangeTo}
          </StyledTableCell>
          <StyledTableCell sx={{ width: "70%", fontSize: "0.75rem" }}>
            {target.effect}
          </StyledTableCell>
        </TableRow>
      ))}
      <TableRow sx={{ backgroundColor: theme.secondary }}>
        <StyledTableCell sx={{ color: "white", fontWeight: "bold", fontSize: "0.75rem", py: 0 }}>
          {t("Die")}
        </StyledTableCell>
        <StyledTableCell sx={{ color: "white", fontWeight: "bold", fontSize: "0.75rem", py: 0 }}>
          {t("Effect")}
        </StyledTableCell>
      </TableRow>
      {spell.effects?.map((effect, i) => (
        <TableRow key={`effect-${i}`}>
          <StyledTableCell sx={{ fontWeight: "bold", width: "30%" }}>
            {effect.dieValue === 0 ? t("Any") : effect.dieValue}
          </StyledTableCell>
          <StyledTableCell sx={{ width: "70%", fontSize: "0.75rem" }}>
            {effect.effect}
          </StyledTableCell>
        </TableRow>
      ))}
    </>
  );

  const renderInfusion = () => (
    <>
      <TableRow sx={{ backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})` }}>
        <StyledTableCell colSpan={2}>
          <Typography variant="caption" fontWeight="bold">
            {t("Current Rank")}: {ranks[spell.rank - 1]}
          </Typography>
        </StyledTableCell>
      </TableRow>
      {spell.effects?.map((effect, i) => (
        <TableRow key={`infusion-${i}`}>
          <StyledTableCell sx={{ fontWeight: "bold", width: "30%" }}>
            {effect.name}
          </StyledTableCell>
          <StyledTableCell sx={{ width: "70%", fontSize: "0.75rem" }}>
            <ReactMarkdown components={{ p: props => <span {...props} /> }}>
              {effect.effect}
            </ReactMarkdown>
          </StyledTableCell>
        </TableRow>
      ))}
    </>
  );

  const renderMagitech = () => (
    <>
      <TableRow sx={{ backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})` }}>
        <StyledTableCell colSpan={2}>
          <Typography variant="caption" fontWeight="bold">
            {t("Current Rank")}: {ranks[spell.rank - 1]}
          </Typography>
        </StyledTableCell>
      </TableRow>
      {spell.rank >= 1 && (
        <TableRow>
          <StyledTableCell sx={{ fontWeight: "bold", width: "30%" }}>{t("Magitech Override")}</StyledTableCell>
          <StyledTableCell sx={{ width: "70%", fontSize: "0.7rem" }}>
            <ReactMarkdown components={{ p: props => <span {...props} /> }}>
              {t("MagitechOverride_desc")}
            </ReactMarkdown>
          </StyledTableCell>
        </TableRow>
      )}
      {spell.rank >= 2 && (
        <TableRow>
          <StyledTableCell sx={{ fontWeight: "bold", width: "30%" }}>{t("Magicannon")}</StyledTableCell>
          <StyledTableCell sx={{ width: "70%", fontSize: "0.7rem" }}>
            <ReactMarkdown components={{ p: props => <span {...props} /> }}>
              {t("Magicannon_desc1")}
            </ReactMarkdown>
          </StyledTableCell>
        </TableRow>
      )}
      {spell.rank >= 3 && (
        <TableRow>
          <StyledTableCell sx={{ fontWeight: "bold", width: "30%" }}>{t("Magispheres")}</StyledTableCell>
          <StyledTableCell sx={{ width: "70%", fontSize: "0.7rem" }}>
            <ReactMarkdown components={{ p: props => <span {...props} /> }}>
              {t("Magispheres_desc1")}
            </ReactMarkdown>
          </StyledTableCell>
        </TableRow>
      )}
    </>
  );

  const getTitle = () => {
    switch (spell.spellType) {
      case "tinkerer-alchemy": return t("Alchemy");
      case "tinkerer-infusion": return t("Infusion");
      case "tinkerer-magitech": return t("Magitech");
      default: return t("Gadget");
    }
  };

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        {/* Header Row */}
        <TableRow sx={{ backgroundColor: theme.primary }}>
          <StyledTableCell colSpan={2} sx={{ color: "white", fontWeight: "bold", fontSize: "0.85rem" }}>
            {getTitle()} - {t(spell.className)}
          </StyledTableCell>
        </TableRow>

        {spell.spellType === "tinkerer-alchemy" && renderAlchemy()}
        {spell.spellType === "tinkerer-infusion" && renderInfusion()}
        {spell.spellType === "tinkerer-magitech" && renderMagitech()}
      </TableBody>
    </Table>
  );
}
