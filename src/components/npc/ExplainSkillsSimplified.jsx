import React, { useState } from "react";
import {
  Popover,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Divider,
  useTheme,
  ThemeProvider,
  Button,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  calcAvailableSkills,
  calcAvailableSkillsFromSpecies,
  calcAvailableSkillsFromLevel,
  calcAvailableSkillsFromVulnerabilities,
  calcAvailableSkillsFromRank,
  calcUsedSkills,
  calcUsedSkillsFromSpecialAttacks,
  calcUsedSkillsFromSpells,
  calcUsedSkillsFromExtraDefs,
  calcUsedSkillsFromExtraHP,
  calcUsedSkillsFromExtraMP,
  calcUsedSkillsFromExtraInit,
  calcUsedSkillsFromExtraMagic,
  calcUsedSkillsFromExtraPrecision,
  calcUsedSkillsFromResistances,
  calcUsedSkillsFromImmunities,
  calcUsedSkillsFromAbsorbs,
  calcUsedSkillsFromSpecial,
  calcUsedSkillsFromOtherActions,
  calcUsedSkillsFromEquip,
} from "../../libs/npcs";
import { useTranslate } from "../../translation/translate";
import { darken } from "@mui/material/styles";

const SkillTableRow = ({ label, value, isHeader }) => (
  <TableRow>
    <TableCell sx={{ fontWeight: isHeader ? "bold" : "normal" }}>
      {label}
    </TableCell>
    <TableCell sx={{ fontWeight: isHeader ? "bold" : "normal" }}>
      {value}
    </TableCell>
  </TableRow>
);

export default function ExplainSkillsSimplified({ npc }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const darkerPrimary = darken(primary, 0.2);
  const hoverPrimary = darken(primary, 0.1);
  const totalAvailableSkills = calcAvailableSkills(npc);
  const totalUsedSkills = calcUsedSkills(npc);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "skills-popover" : undefined;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: "200px" }}>
        <Button
          aria-describedby={id}
          onClick={handleClick}
          sx={{
            backgroundColor: darkerPrimary,
            color: "#ffffff",
            borderRadius: "16px",
            padding: "6px",
            textTransform: "none",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            zIndex: theme.zIndex.appBar + 1,
            width: "100%",
            borderBottomLeftRadius: open ? 0 : "16px",
            borderBottomRightRadius: open ? 0 : "16px",
            borderBottom: open ? `1px solid ${primary}` : "none",
            "&:hover": {
              backgroundColor: hoverPrimary,
            }
          }}
        >
          <Typography variant="h3" sx={{ display: "flex", alignItems: "center" }}>
            {t("Available:")} {totalAvailableSkills}
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ mx: 1, background: "white" }} />
          <Typography variant="h3" sx={{ display: "flex", alignItems: "center" }}>
            {t("Used:")} {totalUsedSkills}
          </Typography>
          <ExpandMoreIcon sx={{ color: "white" }} />
        </Button>
      </Box>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        sx={{
          zIndex: theme.zIndex.appBar + 2,
        }}
      >
        <Table size="small" sx={{ minWidth: "200px" }}>
          <TableHead>
            <SkillTableRow
              label={t("Total SP Available")}
              value={totalAvailableSkills}
              isHeader={true}
            />
          </TableHead>
          <TableBody>
            {[
              [t("Species"), calcAvailableSkillsFromSpecies],
              [t("Levels"), calcAvailableSkillsFromLevel],
              [t("Vulnerabilities"), calcAvailableSkillsFromVulnerabilities],
              [t("Rank"), calcAvailableSkillsFromRank],
            ].map(
              ([innerLabel, calculator]) =>
                calculator(npc) > 0 && (
                  <SkillTableRow
                    key={innerLabel}
                    label={innerLabel}
                    value={calculator(npc)}
                  />
                )
            )}
          </TableBody>
          <TableHead>
            <SkillTableRow
              label={t("Total SP Used")}
              value={totalUsedSkills}
              isHeader={true}
            />
          </TableHead>
          <TableBody>
            {[
              [t("Special Attacks"), calcUsedSkillsFromSpecialAttacks],
              [t("Spells"), calcUsedSkillsFromSpells],
              [t("Extra Defense"), calcUsedSkillsFromExtraDefs],
              [t("Extra HP"), calcUsedSkillsFromExtraHP],
              [t("Extra MP"), calcUsedSkillsFromExtraMP],
              [t("Extra Initiative"), calcUsedSkillsFromExtraInit],
              [t("Extra Accuracy"), calcUsedSkillsFromExtraPrecision],
              [t("Extra Magic"), calcUsedSkillsFromExtraMagic],
              [t("Resistances"), calcUsedSkillsFromResistances],
              [t("Immunities"), calcUsedSkillsFromImmunities],
              [t("Absorption"), calcUsedSkillsFromAbsorbs],
              [t("Special Rules"), calcUsedSkillsFromSpecial],
              [t("Other Actions"), calcUsedSkillsFromOtherActions],
              [t("Equipment"), calcUsedSkillsFromEquip],
            ].map(
              ([innerLabel, calculator]) =>
                calculator(npc) > 0 && (
                  <SkillTableRow
                    key={innerLabel}
                    label={innerLabel}
                    value={calculator(npc)}
                  />
                )
            )}
          </TableBody>
        </Table>
      </Popover>
    </ThemeProvider>
  );
}
