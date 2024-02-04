import React, { useState, useRef } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Divider,
  useTheme,
  ThemeProvider,
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
import { t } from "../../translation/translate";

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
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const totalAvailableSkills = calcAvailableSkills(npc);
  const totalUsedSkills = calcUsedSkills(npc);
  const [isExpanded, setExpanded] = useState(false);
  const accordionRef = useRef(null);

  const handleToggleAccordion = () => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  return (
    <ThemeProvider theme={theme}>
      <Accordion
        ref={accordionRef}
        expanded={isExpanded}
        onChange={handleToggleAccordion}
        sx={{
          borderRadius: "16px",
          boxShadow: "none",
          backgroundColor: "transparent",
          zIndex: 10,
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "#ffffff" }} />}
          sx={{
            backgroundColor: `${primary}`,
            color: "#ffffff",
            borderRadius: "16px",
            margin: "0",
            "&.Mui-expanded": {
              borderRadius: "16px 16px 0 0",
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}
          >
            <span>
              {t("Available:")} {totalAvailableSkills}
            </span>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 1, height: 24, background: "white" }}
            />
            <span>
              {t("Used:")} {totalUsedSkills}
            </span>
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            borderRadius: "0 0 16px 16px",
            boxShadow: "none",
            backgroundColor: "#ffffff",
            border: "1px solid black",
            p: 0,
            overflow: "auto",
            maxHeight: "300px",
            zIndex: 10,
          }}
        >
          <Table size="small">
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
        </AccordionDetails>
      </Accordion>
    </ThemeProvider>
  );
}
