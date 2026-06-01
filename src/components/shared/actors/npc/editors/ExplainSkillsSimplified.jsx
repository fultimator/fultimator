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
  List,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
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
  calcUsedSkillsFromStatusImmunity,
} from "/src/libs/npcs";
import { useTranslate } from "/src/translation/translate";
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

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top, behavior: "smooth" });
}

export default function ExplainSkillsSimplified({ npc }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
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

  const navItems = [
    { label: t("Sheet"), section: `npc-sheet-top-${npc?.id}` },
    { label: t("Basic Info"), section: "edit-section-basics" },
    { label: t("Affinities"), section: "edit-section-affinities" },
    { label: t("Attacks"), section: "edit-section-attacks" },
    { label: t("Spells"), section: "edit-section-spells" },
    { label: t("Other Actions"), section: "edit-section-actions" },
    { label: t("Special Rules"), section: "edit-section-special" },
    { label: t("Rare Equipment"), section: "edit-section-raregear" },
    { label: t("Notes"), section: "edit-section-notes" },
    { label: t("Attack Chance"), section: "edit-section-attackchance" },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: "100%", maxWidth: isSmallScreen ? 300 : 360, minWidth: 0 }}>
        <Button
          aria-describedby={id}
          onClick={handleClick}
          sx={{
            backgroundColor: darkerPrimary,
            color: "#ffffff",
            borderRadius: "16px",
            px: isSmallScreen ? 1 : 1.5,
            py: 0.75,
            textTransform: "none",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isSmallScreen ? 0.5 : 1,
            zIndex: theme.zIndex.appBar + 1,
            width: "100%",
            minWidth: 0,
            borderBottomLeftRadius: open ? 0 : "16px",
            borderBottomRightRadius: open ? 0 : "16px",
            borderBottom: open ? `1px solid ${primary}` : "none",
            "&:hover": {
              backgroundColor: hoverPrimary,
            },
          }}
        >
          <Typography
            variant="h3"
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: isSmallScreen ? "1.05rem" : undefined,
              whiteSpace: "nowrap",
            }}
          >
            {t("Available:")} {totalAvailableSkills}
          </Typography>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: isSmallScreen ? 0.5 : 1, background: "white" }}
          />
          <Typography
            variant="h3"
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: isSmallScreen ? "1.05rem" : undefined,
              whiteSpace: "nowrap",
            }}
          >
            {t("Used:")} {totalUsedSkills}
          </Typography>
          <ExpandMoreIcon sx={{ color: "white", flexShrink: 0 }} />
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
        <Box sx={{ display: "flex" }}>
          {/* SP breakdown table */}
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
                  ),
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
                [
                  t("Status Effect Immunities"),
                  calcUsedSkillsFromStatusImmunity,
                ],
              ].map(
                ([innerLabel, calculator]) =>
                  calculator(npc) > 0 && (
                    <SkillTableRow
                      key={innerLabel}
                      label={innerLabel}
                      value={calculator(npc)}
                    />
                  ),
              )}
            </TableBody>
          </Table>

          {/* Section nav */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              borderLeft: `1px solid ${theme.palette.divider}`,
              minWidth: "120px",
            }}
          >
            <Typography
              sx={{
                px: 1.5,
                pt: 1,
                pb: 0.5,
                fontSize: "0.7rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                color: "text.secondary",
                letterSpacing: "0.07em",
              }}
            >
              {t("Go to")}
            </Typography>
            <Divider />
            <List disablePadding sx={{ overflowY: "auto", flex: 1 }}>
              {navItems.map(({ label, section }) => {
                if (!document.getElementById(section)) return null;
                return (
                  <ListItemButton
                    key={section}
                    onClick={() => {
                      handleClose();
                      setTimeout(() => scrollToSection(section), 50);
                    }}
                    sx={{ py: 1.25, px: 1.5 }}
                  >
                    <ListItemText
                      primary={label}
                      slotProps={{
                        primary: {
                          fontSize: "0.9rem",
                          fontWeight: 500,
                        },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        </Box>
      </Popover>
    </ThemeProvider>
  );
}
