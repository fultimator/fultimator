import React from "react";
import { Paper, Typography, Box, Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Collapse, IconButton, Tooltip } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp, MoreVert } from "@mui/icons-material";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../translation/translate";
import { usePlayerSheetCompactStore } from "../../../../store/playerSheetCompactStore";
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

function collectStringValues(value, bag = []) {
  if (typeof value === "string") {
    bag.push(value);
    return bag;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => collectStringValues(entry, bag));
    return bag;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((entry) => collectStringValues(entry, bag));
  }
  return bag;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMarkdownText(text, query) {
  if (!text || !query) return text;
  const pattern = new RegExp(`(${escapeRegExp(query)})`, "ig");
  return String(text).replace(pattern, "<mark>$1</mark>");
}

function renderSpellContent(spell, setPlayer, searchQuery, highlightMatchFn) {
  switch (spell.spellType) {
    case "default":
      return (
        <SpellDefault
          spellName={highlightMatchFn(spell.name, searchQuery)}
          mp={spell.mp}
          maxTargets={spell.maxTargets}
          targetDesc={spell.targetDesc}
          duration={spell.duration}
          description={highlightMatchFn(spell.description, searchQuery)}
          isEditMode={false}
          isOffensive={spell.isOffensive}
          isMagisphere={spell.isMagisphere || false}
          attr1={spell.attr1}
          attr2={spell.attr2}
        />
      );
    case "gamble":
      return <SpellEntropistGamble gamble={spell} isEditMode={false} />;
    case "invocation":
      return <SpellInvoker spell={spell} setPlayer={setPlayer} open={true} />;
    case "cooking":
      return <SpellGourmet spell={spell} open={true} />;
    case "magiseed":
      return <SpellMagiseed spell={spell} setPlayer={setPlayer} open={true} />;
    case "magichant":
      return <SpellMagichant spell={spell} />;
    case "symbol":
      return <SpellSymbol spell={spell} />;
    case "dance":
      return <SpellDance spell={spell} />;
    case "gift":
      return <SpellGift spell={spell} setPlayer={setPlayer} open={true} />;
    case "therioform":
      return <SpellTherioform spell={spell} />;
    case "pilot-vehicle":
      return <SpellVehicle spell={spell} />;
    case "deck":
      return <SpellDeck spell={spell} setPlayer={setPlayer} open={true} />;
    case "arcanist":
    case "arcanist-rework":
      return (
        <SpellArcanist
          arcana={spell}
          isEditMode={false}
          rework={spell.spellType === "arcanist-rework"}
        />
      );
    default:
      if (spell.spellType?.startsWith("tinkerer-")) return <SpellGadget spell={spell} />;
      return null;
  }
}

export default function PlayerSpellsFull({ player, setPlayer, isCharacterSheet, searchQuery = '' }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const { openRows, toggleRow } = usePlayerSheetCompactStore();

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
    return spells.filter((spell) => {
      const rawStrings = collectStringValues(spell, []);
      const translatedStrings = rawStrings.map((text) => t(text));
      return [...rawStrings, ...translatedStrings]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {player.classes
        .map((c, classIndex) => {
          const spellsInClass = c.spells
            .map(s => ({ ...s, className: c.name }))
            .filter(spell => (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined));
          
          const filteredSpells = filterSpells(spellsInClass, searchQuery);
          
          if (filteredSpells.length === 0) return null;

          return (
            <TableContainer key={classIndex} component={Paper} sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                <TableHead>
                  <TableRow sx={{ background: theme.primary }}>
                    <StyledTableCellHeader sx={{ width: 36 }} />
                    <StyledTableCellHeader>
                      <Typography variant="h4" sx={{ textTransform: "uppercase", color: "white" }}>
                        {t("Spells") + " - " + t(c.name)}
                      </Typography>
                    </StyledTableCellHeader>
                    <StyledTableCellHeader sx={{ width: { xs: 55, sm: 80 }, display: { xs: 'none', sm: 'table-cell' } }} />
                    <StyledTableCellHeader sx={{ width: { xs: 65, sm: 90 }, display: { xs: 'none', sm: 'table-cell' } }} />
                    <StyledTableCellHeader sx={{ width: { xs: 110, sm: 110 }, textAlign: "right" }}>
                      <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', color: '#fff', opacity: 0.8, fontSize: '0.65rem' }}>{t("Actions")}</Typography>
                    </StyledTableCellHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSpells.map((spell, spellIndex) => {
                    const spellKey = `spell-${classIndex}-${spellIndex}`;
                    const spellName = getSpellName(spell, t);
                    
                    return (
                      <React.Fragment key={spellKey}>
                        <TableRow sx={{ backgroundColor: openRows.spells[spellKey] ? 'rgba(0,0,0,0.02)' : 'inherit' }}>
                          <StyledTableCell sx={{ width: 36 }}>
                            <IconButton onClick={(e) => { e.stopPropagation(); toggleRow('spells', spellKey); }} size="small" sx={{ p: 0.5 }}>
                              {openRows.spells[spellKey] ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                            </IconButton>
                          </StyledTableCell>
                          <StyledTableCell onClick={(e) => { e.stopPropagation(); toggleRow('spells', spellKey); }} sx={{ cursor: "pointer", minWidth: { xs: 60, sm: 100 }, wordBreak: "break-word" }}>
                            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
                              <Typography variant="body2" fontWeight="bold" sx={{ mr: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, wordBreak: "break-word", overflowWrap: "break-word" }}>
                                {highlightMatch(spellName, searchQuery)}
                              </Typography>
                              <Tooltip title={t("Spell")}>
                                <MoreVert sx={{ color: theme.secondary, fontSize: '1rem' }} />
                              </Tooltip>
                            </Box>
                          </StyledTableCell>
                          <StyledTableCell sx={{ width: { xs: 55, sm: 80 }, display: { xs: 'none', sm: 'table-cell' } }} />
                          <StyledTableCell sx={{ width: { xs: 65, sm: 90 }, display: { xs: 'none', sm: 'table-cell' } }} />
                          <StyledTableCell sx={{ width: { xs: 110, sm: 110 }, textAlign: "right" }}>
                            {/* Actions if any */}
                          </StyledTableCell>
                        </TableRow>
                        
                        <TableRow>
                          <StyledTableCell colSpan={5} sx={{ p: 0 }}>
                            <Collapse in={openRows.spells[spellKey]} timeout="auto" unmountOnExit>
                              <Box sx={{ p: 1, ml: { xs: 1, sm: 4 } }}>
                                {renderSpellContent(spell, setPlayer, searchQuery, highlightMatch)}
                              </Box>
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
        })}
    </Box>
  );
}
