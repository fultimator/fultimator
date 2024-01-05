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
  ThemeProvider
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

const SkillTableRow = ({ label, value, isHeader }) => (
  <TableRow>
    <TableCell sx={{ fontWeight: isHeader ? "bold" : "normal" }}>{label}</TableCell>
    <TableCell sx={{ fontWeight: isHeader ? "bold" : "normal" }}>{value}</TableCell>
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
          expandIcon={<ExpandMoreIcon sx={{ color: '#ffffff' }} />}
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
          <Typography variant="body2" sx={{ fontWeight: "bold", display: 'flex', alignItems: 'center' }}>
            <span>Available: {totalAvailableSkills}</span>
            <Divider  orientation="vertical" flexItem sx={{ mx: 1, height: 24, background: 'white' }} />
            <span>Used: {totalUsedSkills}</span>
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
              <SkillTableRow label="Total SP Available" value={totalAvailableSkills} isHeader={true} />
            </TableHead>
            <TableBody>
              {[
                ["Species", calcAvailableSkillsFromSpecies],
                ["Levels", calcAvailableSkillsFromLevel],
                ["Vulnerabilities", calcAvailableSkillsFromVulnerabilities],
                ["Rank", calcAvailableSkillsFromRank],
              ].map(([innerLabel, calculator]) => (
                calculator(npc) > 0 && (
                  <SkillTableRow key={innerLabel} label={innerLabel} value={calculator(npc)} />
                )
              ))}
            </TableBody>
            <TableHead>
              <SkillTableRow label="Total SP Used" value={totalUsedSkills} isHeader={true} />
            </TableHead>
            <TableBody>
              {[
                ["Special Attacks", calcUsedSkillsFromSpecialAttacks],
                ["Spells", calcUsedSkillsFromSpells],
                ["Extra Defense", calcUsedSkillsFromExtraDefs],
                ["Extra HP", calcUsedSkillsFromExtraHP],
                ["Extra MP", calcUsedSkillsFromExtraMP],
                ["Extra Initiative", calcUsedSkillsFromExtraInit],
                ["Extra Accuracy", calcUsedSkillsFromExtraPrecision],
                ["Extra Magic", calcUsedSkillsFromExtraMagic],
                ["Resistances", calcUsedSkillsFromResistances],
                ["Immunities", calcUsedSkillsFromImmunities],
                ["Absorption", calcUsedSkillsFromAbsorbs],
                ["Special Rules", calcUsedSkillsFromSpecial],
                ["Other Actions", calcUsedSkillsFromOtherActions],
                ["Equipment", calcUsedSkillsFromEquip],
              ].map(([innerLabel, calculator]) => (
                calculator(npc) > 0 && (
                  <SkillTableRow key={innerLabel} label={innerLabel} value={calculator(npc)} />
                )
              ))}
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>
    </ThemeProvider>
  );
}
