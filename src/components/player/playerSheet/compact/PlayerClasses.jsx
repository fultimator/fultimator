import React, { useState, useEffect, useMemo  } from "react";
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Collapse, IconButton, Grid, Box,
  Chip, Tooltip, ClickAwayListener
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp, MoreVert, Star } from "@mui/icons-material";
import { styled } from "@mui/system";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";

// Styled Components
const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });
const StyledTableCell = styled(TableCell)({ padding: 0 });

const StyledMarkdown = ({ children, ...props }) => (
  <div style={{ whiteSpace: "pre-line", display: "inline" }}>
    <ReactMarkdown
      {...props}
      components={{
        p: (p) => <p style={{ margin: 0 }} {...p} />,
        ul: (p) => <ul style={{ margin: 0 }} {...p} />,
        li: (p) => <li style={{ margin: 0 }} {...p} />,
        strong: (p) => <strong style={{ fontWeight: "bold" }} {...p} />,
        em: (p) => <em style={{ fontStyle: "italic" }} {...p} />,
      }}
    >
      {children}
    </ReactMarkdown>
  </div>
);

// Benefit Chip
const BenefitChip = ({ label, value, tooltipText }) => {
  const [open, setOpen] = useState(false);
  if (value === 0) return null;
  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Tooltip
        title={tooltipText}
        open={open}
        onClose={() => setOpen(false)}
        disableHoverListener
      >
        <Chip
          label={`${label}${typeof value === "number" ? ` +${value}` : ""}`}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 0, cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        />
      </Tooltip>
    </ClickAwayListener>
  );
};

// Benefit Chips
const BenefitChips = ({ benefits, t }) => {
  const chipConfigs = [
    {
      key: "hpplus",
      label: t("HP"),
      tooltip: t("Permanently increase your maximum Hit Points by"),
    },
    {
      key: "mpplus",
      label: t("MP"),
      tooltip: t("Permanently increase your maximum Mind Points by"),
    },
    {
      key: "ipplus",
      label: t("IP"),
      tooltip: t("Permanently increase your maximum Inventory Points by"),
    },
    {
      key: "rituals.ritualism",
      label: t("Ritualism"),
      tooltip: t("You may perform Rituals whose effects fall within the Ritualism discipline."),
    },
    {
      key: "martials.melee",
      label: t("Melee Weapons"),
      tooltip: t("Gain the ability to equip martial melee weapons."),
    },
    {
      key: "martials.ranged",
      label: t("Ranged Weapons"),
      tooltip: t("Gain the ability to equip martial ranged weapons."),
    },
    {
      key: "martials.shields",
      label: t("Shields"),
      tooltip: t("Gain the ability to equip martial shields."),
    },
    {
      key: "martials.armor",
      label: t("Armor"),
      tooltip: t("Gain the ability to equip martial armor."),
    },
  ];

  const getValueByPath = (obj, path) =>
    path.split(".").reduce((acc, part) => acc?.[part], obj);

  return (
    <>
      {chipConfigs.map(({ key, label, tooltip }) => {
        const value = getValueByPath(benefits, key);
        if (!value && value !== 0) return null;

        return (
          <BenefitChip
            key={key}
            label={label}
            value={typeof value === "number" ? value : undefined}
            tooltipText={typeof value === "number" ? `${tooltip} ${value}` : tooltip}
          />
        );
      })}

      {benefits.custom?.map((text, i) => (
        <BenefitChip key={`custom-${i}`} label={text} tooltipText={text} />
      ))}
    </>
  );
};

function highlightMatch(text, query) {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, 'ig');
  const parts = text.split(regex);

  return parts.map((part, idx) =>
    regex.test(part) ? (
      <span key={idx} style={{ backgroundColor: 'yellow' }}>{part}</span>
    ) : (
      part
    )
  );
}

// Main Component
export default function PlayerClasses({ player, isMainTab, searchQuery = '' }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  // Separate sessionStorage key per tab
  const storageKey = useMemo(
    () => `playerClassesOpenRows_${player?.id ?? "default"}_${isMainTab ? "main" : "secondary"}`,
    [player?.id, isMainTab]
  );

  const getInitialOpenRows = () => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);

    // Default open all rows if not isMainTab
    if (!isMainTab && player?.classes?.length) {
      const initialOpen = {};
      player.classes.forEach((cls, classIdx) => {
        const classKey = `class-${classIdx}`;
        initialOpen[classKey] = true;
      });
      return initialOpen;
    }

    return {};
  };

  const [openRows, setOpenRows] = useState(getInitialOpenRows);

  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(openRows));
  }, [openRows, storageKey]);

  const toggleRow = (key) =>
    setOpenRows((prev) => ({ ...prev, [key]: !prev[key] }));

  if (!player.classes?.length) return null;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow
            sx={{
              background: theme.primary,
              "& .MuiTypography-root": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                textTransform: "uppercase",
              },
            }}
          >
            <StyledTableCellHeader />
            <StyledTableCellHeader>
              <Typography variant="h4">{t("Class Name")}</Typography>
            </StyledTableCellHeader>
            <StyledTableCellHeader>
              <Typography variant="h4" textAlign="center">{t("Level")}</Typography>
            </StyledTableCellHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {player.classes
            .filter((cls) => {
              const query = searchQuery.toLowerCase();
              const classNameMatches = t(cls.name).toLowerCase().includes(query);
              const skillMatches = cls.skills?.some(skill =>
                t(skill.skillName).toLowerCase().includes(query)
              );
              const heroicMatches = cls.heroic &&
                t(cls.heroic.name).toLowerCase().includes(query);
              return classNameMatches || skillMatches || heroicMatches;
            })
            .map((cls, classIdx) => {
              const classKey = `class-${classIdx}`;
            return (
              <React.Fragment key={classKey}>
                <TableRow>
                  <StyledTableCell sx={{ width: '1%' }}>
                    <IconButton onClick={() => toggleRow(classKey)} size="small">
                      {openRows[classKey] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                  </StyledTableCell>
                  <StyledTableCell onClick={() => toggleRow(classKey)} sx={{ cursor: "pointer" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" fontWeight="bold">
                        {highlightMatch(t(cls.name), searchQuery)}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "nowrap", overflow: "hidden" }}>
                        <BenefitChips benefits={cls.benefits} t={t} />
                      </Box>
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: 60 }}>
                    <Typography variant="body2" fontWeight="bold" textAlign="center">{cls.lvl}</Typography>
                  </StyledTableCell>
                </TableRow>

                {/* Expanded Class Row */}
                <TableRow>
                  <StyledTableCell colSpan={3} sx={{ p: 0 }}>
                    <Collapse in={openRows[classKey]} timeout="auto" unmountOnExit>
                      <Grid container>
                        <Grid item xs={12}>
                          <Table>
                            <TableBody>
                              {cls.skills?.filter(s => s.currentLvl >= 1).map((skill, skillIdx) => {
                                const skillKey = `skill-${classIdx}-${skillIdx}`;
                                return (
                                  <React.Fragment key={skillKey}>
                                    <TableRow>
                                      <StyledTableCell sx={{ width: '1%' }}>
                                        <Tooltip title={t("Skill")}>
                                          <MoreVert />
                                        </Tooltip>
                                      </StyledTableCell>
                                      <StyledTableCell sx={{ width: '1%' }}>
                                        <IconButton onClick={() => toggleRow(skillKey)} size="small">
                                          {openRows[skillKey] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                        </IconButton>
                                      </StyledTableCell>
                                      <StyledTableCell onClick={() => toggleRow(skillKey)} sx={{ cursor: "pointer" }}>
                                        <Typography variant="body2" fontWeight="bold">
                                          {highlightMatch(t(skill.skillName), searchQuery)}
                                        </Typography>
                                      </StyledTableCell>
                                      <StyledTableCell sx={{ width: "60px" }}>
                                        <Typography variant="body2" fontWeight="bold" textAlign="center">{skill.currentLvl}</Typography>
                                      </StyledTableCell>
                                    </TableRow>
                                    <TableRow>
                                      <StyledTableCell colSpan={4} sx={{ p: 0 }}>
                                        <Collapse in={openRows[skillKey]} timeout="auto" unmountOnExit>
                                          <Box sx={{ p: 1 }}>
                                            <StyledMarkdown allowedElements={["strong"]} unwrapDisallowed>
                                              {t(skill.description)}
                                            </StyledMarkdown>
                                          </Box>
                                        </Collapse>
                                      </StyledTableCell>
                                    </TableRow>
                                  </React.Fragment>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </Grid>

                        {/* Heroic Skill */}
                        {cls.lvl === 10 && cls.heroic && (
                          <Grid item xs={12}>
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <StyledTableCell sx={{ width: '1%' }}>
                                    <Tooltip title={t("Heroic Skill")}>
                                      <Star />
                                    </Tooltip>
                                  </StyledTableCell>
                                  <StyledTableCell sx={{ width: '1%' }}>
                                    <IconButton onClick={() => toggleRow(`heroic-${classIdx}`)} size="small">
                                      {openRows[`heroic-${classIdx}`] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                    </IconButton>
                                  </StyledTableCell>
                                  <StyledTableCell onClick={() => toggleRow(`heroic-${classIdx}`)}>
                                    <Typography variant="body2" fontWeight="bold">
                                      {highlightMatch(t(cls.heroic.name), searchQuery)}
                                    </Typography>
                                  </StyledTableCell>
                                </TableRow>
                                <TableRow>
                                  <StyledTableCell colSpan={4} sx={{ p: 0 }}>
                                    <Collapse in={openRows[`heroic-${classIdx}`]} timeout="auto" unmountOnExit>
                                      <Box sx={{ p: 1 }}>
                                        <StyledMarkdown allowedElements={["strong"]} unwrapDisallowed>
                                          {t(cls.heroic.description)}
                                        </StyledMarkdown>
                                      </Box>
                                    </Collapse>
                                  </StyledTableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </Grid>
                        )}
                      </Grid>
                    </Collapse>
                  </StyledTableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
