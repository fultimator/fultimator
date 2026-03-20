import React, { useState, useEffect, useMemo } from "react";
import { Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableRow, Collapse, IconButton, Tooltip } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp, MoreVert } from "@mui/icons-material";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../translation/translate";
import SpellDefault from "./spells/SpellDefault";
import SpellArcanist from "./spells/SpellArcanist";
import SpellEntropistGamble from "./spells/SpellEntropistGamble";
import SpellInvoker from "./spells/SpellInvoker";
import SpellGourmet from "./spells/SpellGourmet";
import SpellMagiseed from "./spells/SpellMagiseed";
import SpellGadget from "./spells/SpellGadget";
import SpellMagichant from "./spells/SpellMagichant";
import SpellSymbol from "./spells/SpellSymbol";
import SpellDance from "./spells/SpellDance";
import SpellGift from "./spells/SpellGift";
import SpellTherioform from "./spells/SpellTherioform";
import SpellVehicle from "./spells/SpellVehicle";
import SpellDeck from "./spells/SpellDeck";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";

// Styled Components
const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });
const StyledTableCell = styled(TableCell)({ padding: 0 });

export default function PlayerSpellsFull({ player, setPlayer, isCharacterSheet, searchQuery = '' }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  // Separate sessionStorage key per tab (compact sheet is usually one tab)
  const storageKey = useMemo(
    () => `playerSpellsOpenRows_${player?.id ?? "default"}`,
    [player?.id]
  );

  const getInitialOpenRows = () => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    return {};
  };

  const [openRows, setOpenRows] = useState(getInitialOpenRows);

  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(openRows));
  }, [openRows, storageKey]);

  const toggleRow = (key) =>
    setOpenRows((prev) => ({ ...prev, [key]: !prev[key] }));

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'ig');
    const parts = String(text).split(regex);
    return parts.map((part, idx) =>
      regex.test(part) ? (
        <span key={idx} style={{ backgroundColor: 'yellow' }}>{part}</span>
      ) : (
        part
      )
    );
  };

  const filterSpells = (spells, query) => {
    if (!query) return spells;
    const q = query.toLowerCase();
    return spells.filter(s => 
      (s.name && s.name.toLowerCase().includes(q)) || 
      (s.spellName && s.spellName.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q))
    );
  };

  const getSpellName = (spell) => {
    const name = spell.name || spell.spellName;
    if (name && name !== t("Unnamed Spell")) return name;
    
    switch(spell.spellType) {
      case "magiseed": return t("magiseed_garden");
      case "cooking": return t("Gourmet");
      case "invocation": return t("Invoker");
      case "deck": return t("ace_deck_management");
      case "tinkerer-alchemy": return t("Alchemy");
      case "tinkerer-infusion": return t("Infusion");
      case "tinkerer-magitech": return t("Magitech");
      case "magichant": return t("Magichant");
      case "symbol": return t("Symbol");
      case "dance": return t("Dance");
      case "gift": return t("Gift");
      case "therioform": return t("Therioform");
      case "pilot-vehicle": return t("Pilot Vehicle");
      case "arcanist": return t("Arcanist");
      case "arcanist-rework": return t("Arcanist-Rework");
      default: return t("Unnamed Spell");
    }
  };

  if (!player.classes?.length) return null;

  return (
    <TableContainer component={Paper}>
      {player.classes.some((c) =>
        c.spells.some(
          (spell) =>
            (spell.spellType === "default" || 
             spell.spellType === "gamble" ||
             spell.spellType === "invocation" ||
             spell.spellType === "cooking" ||
             spell.spellType === "magiseed" ||
             spell.spellType?.startsWith("tinkerer-") ||
             spell.spellType === "magichant" ||
             spell.spellType === "symbol" ||
             spell.spellType === "dance" ||
             spell.spellType === "gift" ||
             spell.spellType === "therioform" ||
             spell.spellType === "pilot-vehicle" ||
             spell.spellType === "deck" ||
             spell.spellType === "arcanist" ||
             spell.spellType === "arcanist-rework") &&
            (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
        )
      ) && (
        <Table size="small">
          <TableBody>
            {player.classes
              .map((c, classIndex) => {
                const spellsInClass = c.spells
                  .map(s => ({ ...s, className: c.name }))
                  .filter(spell => (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined));
                
                const filteredSpells = filterSpells(spellsInClass, searchQuery);
                
                if (filteredSpells.length === 0) return null;

                const classKey = `class-${classIndex}`;

                return (
                  <React.Fragment key={classKey}>
                    <TableRow sx={{ background: theme.primary }}>
                      <StyledTableCellHeader colSpan={3} sx={{ px: 1, py: 0.5 }}>
                        <Typography variant="h4" sx={{ textTransform: "uppercase", color: "white" }}>
                          {t("Spells") + " - " + t(c.name)}
                        </Typography>
                      </StyledTableCellHeader>
                    </TableRow>

                    {filteredSpells.map((spell, spellIndex) => {
                      const spellKey = `spell-${classIndex}-${spellIndex}`;
                      const spellName = getSpellName(spell);
                      
                      return (
                        <React.Fragment key={spellKey}>
                          <TableRow>
                            <StyledTableCell sx={{ width: '1%' }}>
                              <Tooltip title={t("Spell")}>
                                <MoreVert sx={{ color: theme.secondary, ml: 1 }} />
                              </Tooltip>
                            </StyledTableCell>
                            <StyledTableCell sx={{ width: '1%' }}>
                              <IconButton onClick={() => toggleRow(spellKey)} size="small">
                                {openRows[spellKey] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                              </IconButton>
                            </StyledTableCell>
                            <StyledTableCell onClick={() => toggleRow(spellKey)} sx={{ cursor: "pointer" }}>
                              <Typography variant="body2" fontWeight="bold">
                                {highlightMatch(spellName, searchQuery)}
                              </Typography>
                            </StyledTableCell>
                          </TableRow>
                          
                          <TableRow>
                            <StyledTableCell colSpan={3} sx={{ p: 0 }}>
                              <Collapse in={openRows[spellKey]} timeout="auto" unmountOnExit>
                                <Box sx={{ p: 1 }}>
                                  {spell.spellType === "default" && (
                                    <SpellDefault
                                      spellName={highlightMatch(spell.name, searchQuery)}
                                      mp={spell.mp}
                                      maxTargets={spell.maxTargets}
                                      targetDesc={spell.targetDesc}
                                      duration={spell.duration}
                                      description={highlightMatch(spell.description, searchQuery)}
                                      isEditMode={false}
                                      isOffensive={spell.isOffensive}
                                      isMagisphere={spell.isMagisphere || false}
                                      attr1={spell.attr1}
                                      attr2={spell.attr2}
                                    />
                                  )}
                                  {spell.spellType === "gamble" && (
                                    <SpellEntropistGamble
                                      gamble={spell}
                                      isEditMode={false}
                                    />
                                  )}
                                  {spell.spellType === "invocation" && <SpellInvoker spell={spell} setPlayer={setPlayer} open={true} />}
                                  {spell.spellType === "cooking" && <SpellGourmet spell={spell} open={true} />}
                                  {spell.spellType === "magiseed" && <SpellMagiseed spell={spell} setPlayer={setPlayer} open={true} />}
                                  {spell.spellType?.startsWith("tinkerer-") && <SpellGadget spell={spell} />}
                                  {spell.spellType === "magichant" && <SpellMagichant spell={spell} />}
                                  {spell.spellType === "symbol" && <SpellSymbol spell={spell} />}
                                  {spell.spellType === "dance" && <SpellDance spell={spell} />}
                                  {spell.spellType === "gift" && <SpellGift spell={spell} setPlayer={setPlayer} open={true} />}
                                  {spell.spellType === "therioform" && <SpellTherioform spell={spell} />}
                                  {spell.spellType === "pilot-vehicle" && <SpellVehicle spell={spell} />}
                                  {spell.spellType === "deck" && <SpellDeck spell={spell} setPlayer={setPlayer} open={true} />}
                                  {(spell.spellType === "arcanist" || spell.spellType === "arcanist-rework") && (
                                    <SpellArcanist
                                      arcana={spell}
                                      isEditMode={false}
                                      rework={spell.spellType === "arcanist-rework"}
                                    />
                                  )}
                                </Box>
                              </Collapse>
                            </StyledTableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
}
