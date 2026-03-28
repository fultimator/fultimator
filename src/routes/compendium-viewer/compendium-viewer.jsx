import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Card,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Drawer,
  Fab,
  IconButton,
  Tooltip,
  Divider,
  InputAdornment,
  useMediaQuery,
  ThemeProvider,
  Snackbar,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";

import Layout from "../../components/Layout";
import Export from "../../components/Export";
import useDownloadImage from "../../hooks/useDownloadImage";
import { useTranslate, t as staticT } from "../../translation/translate";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { Martial } from "../../components/icons";
import { OpenBracket, CloseBracket } from "../../components/Bracket";
import Diamond from "../../components/Diamond";

import weapons from "../../libs/weapons";
import { baseArmors, baseShields } from "../../libs/equip";
import { npcSpells } from "../../libs/npcSpells";
import { npcAttacks } from "../../libs/npcAttacks";
import classList, { spellList, tinkererAlchemy, tinkererInfusion, arcanumList } from "../../libs/classes";
import attributes from "../../libs/attributes";
import types from "../../libs/types";
import { availableFrames, availableModules } from "../../libs/pilotVehicleData";
import { magiseeds } from "../../libs/floralistMagiseedData";
import { getDelicacyEffects } from "../../libs/gourmetCookingData";
import { availableGifts } from "../../components/player/spells/SpellGiftGiftsModal";
import { availableDances } from "../../components/player/spells/SpellDancerDancesModal";
import { availableTherioforms } from "../../components/player/spells/SpellMutantTherioformsModal";
import { availableTones } from "../../components/player/spells/SpellChanterTonesModal";
import { availableSymbols } from "../../components/player/spells/SpellSymbolistSymbolsModal";
import { invocationsByWellspring } from "../../components/player/spells/SpellInvokerInvocationsModal";

// ---------------------------------------------------------------------------
// Spell type description keys (per-character types have no static list)
// ---------------------------------------------------------------------------

const SPELL_TYPE_DESC_KEYS = {
  dance:             ["dance_details_1"],
  symbol:            ["symbol_details_1"],
  magichant:         ["magichant_details_1", "magichant_details_2", "magichant_details_3", "magichant_details_4"],
  cooking:           ["Cooking_desc"],
  invocation:        ["Invocation_desc"],
  "pilot-vehicle":   ["pilot_details_1"],
  magiseed:          ["magiseed_details_1"],
  gift:              [],
  therioform:        [],
  deck:              [],
  arcanist:          [],
  "arcanist-rework": [],
  "tinkerer-alchemy":  [],
  "tinkerer-infusion": [],
  "tinkerer-magitech": [],
  gamble:            [],
};

// ---------------------------------------------------------------------------
// Data preparation
// ---------------------------------------------------------------------------

const armors = baseArmors
  .filter((a) => a.name !== "No Armor")
  .map((a) => ({ ...a, category: "Armor" }));

const shields = baseShields
  .filter((s) => s.name !== "No Shield")
  .map((s) => ({ ...s, category: "Shield" }));

const ITEM_TYPES = [
  { key: "weapons", label: "Weapons" },
  { key: "armor", label: "Armor" },
  { key: "shields", label: "Shields" },
  { key: "spells", label: "NPC Spells" },
  { key: "attacks", label: "NPC Attacks" },
  { key: "classes", label: "Classes" },
  { key: "player-spells", label: "Spells" },
];

function getItems(type) {
  switch (type) {
    case "weapons":
      return weapons;
    case "armor":
      return armors;
    case "shields":
      return shields;
    case "spells":
      return npcSpells;
    case "attacks":
      return npcAttacks;
    case "classes":
      return classList;
    case "player-spells":
      return spellList;
    default:
      return [];
  }
}

function getItemSearchText(item) {
  const skillNames = item.skills
    ? item.skills.map((s) => s.skillName).join(" ")
    : "";
  return [item.name, item.category, item.type, item.range, item.book, skillNames]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function makeId(name, idx) {
  return `compendium-item-${name.replace(/[^a-zA-Z0-9]/g, "-")}-${idx}`;
}

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ---------------------------------------------------------------------------
// Styled markdown (defined once outside components to avoid re-creation)
// ---------------------------------------------------------------------------

const StyledMarkdown = styled(ReactMarkdown)({ whiteSpace: "pre-line" });

// ---------------------------------------------------------------------------
// Sidebar table columns per type
// ---------------------------------------------------------------------------

function SidebarSecondaryValue(type, item, t) {
  if (type === "weapons") return `${item.cost}z`;
  if (type === "armor") return `${item.cost}z`;
  if (type === "shields") return `${item.cost}z`;
  if (type === "spells") return `${item.mp} MP`;
  if (type === "player-spells") return item.mp != null ? `${item.mp} MP` : item.wellspring ?? "";
  if (type === "attacks") return t(item.range);
  if (type === "classes") return item.book ?? "";
  return "";
}

function SidebarSecondaryLabel(type, t) {
  if (type === "spells") return t("MP");
  if (type === "player-spells") return t("MP");
  if (type === "attacks") return t("Range");
  if (type === "classes") return t("Book");
  return t("Cost");
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

const SidebarRow = React.memo(function SidebarRow({
  item,
  idx,
  isSelected,
  selectedType,
  onItemClick,
  primaryColor,
}) {
  const { t } = useTranslate();
  const handleClick = useCallback(() => onItemClick(item, idx), [onItemClick, item, idx]);

  return (
    <TableRow
      onClick={handleClick}
      sx={{
        cursor: "pointer",
        backgroundColor: isSelected ? `${primaryColor}22` : undefined,
        borderLeft: isSelected ? `3px solid ${primaryColor}` : "3px solid transparent",
        "&:hover": !isSelected
          ? { backgroundColor: `${primaryColor}22` }
          : undefined,
      }}
    >
      <TableCell sx={{ pl: isSelected ? "5px" : "8px" }}>
        <Typography
          variant="body2"
          fontWeight={isSelected ? "bold" : "normal"}
          color={isSelected ? primaryColor : "text.primary"}
        >
          {t(item.name)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2" color="text.secondary">
          {SidebarSecondaryValue(selectedType, item, t)}
        </Typography>
      </TableCell>
    </TableRow>
  );
});

const CompendiumSidebar = React.memo(function CompendiumSidebar({
  selectedType,
  onTypeChange,
  searchQuery,
  onSearchChange,
  filteredItems,
  onItemClick,
  selectedIdx,
  selectedSpellClass,
  onSpellClassChange,
}) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        p: 2,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          background: customTheme.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.01)",
        }}
      >
        <FormControl fullWidth size="small">
          <InputLabel>{t("Item Type")}</InputLabel>
          <Select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            label={t("Item Type")}
          >
            {ITEM_TYPES.map((type) => (
              <MenuItem key={type.key} value={type.key}>
                {t(type.label)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedType === "player-spells" && (
          <FormControl fullWidth size="small">
            <InputLabel>{t("Class")}</InputLabel>
            <Select
              value={selectedSpellClass}
              onChange={(e) => onSpellClassChange(e.target.value)}
              label={t("Class")}
            >
              <MenuItem value="">{t("All")}</MenuItem>
              {classList
                .filter((c) => c.benefits?.spellClasses?.length > 0)
                .map((c) => (
                  <MenuItem key={c.name} value={c.name}>
                    {t(c.name)}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        )}

        <TextField
          size="small"
          fullWidth
          placeholder={t("Search...")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ mt: -0.5 }}>
          {filteredItems.length} {t("items")}
        </Typography>
      </Paper>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ flex: 1, overflow: "auto" }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                "& .MuiTableCell-head": {
                  background: customTheme.primary,
                  color: "#ffffff",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: "0.8rem",
                },
              }}
            >
              <TableCell>{t("Name")}</TableCell>
              <TableCell align="right">
                {SidebarSecondaryLabel(selectedType, t)}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item, idx) => (
              <SidebarRow
                key={idx}
                item={item}
                idx={idx}
                isSelected={idx === selectedIdx}
                selectedType={selectedType}
                onItemClick={onItemClick}
                primaryColor={customTheme.primary}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
});

// ---------------------------------------------------------------------------
// WeaponCard
// ---------------------------------------------------------------------------

const WeaponCard = React.memo(function WeaponCard({ weapon, id }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const attr1 = attributes[weapon.att1];
  const attr2 = attributes[weapon.att2];
  const dmgType = types[weapon.type];

  return (
    <Card id={id} elevation={1}>
      <Stack>
        {/* Header */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            "& .MuiTypography-root": {
              fontSize: "0.9rem",
              textTransform: "uppercase",
            },
          }}
        >
          <Grid item xs={4}>
            <Typography variant="h4">{t("Weapon")}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h4" textAlign="center">
              {t("Cost")}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">
              {t("Accuracy")}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">
              {t("Damage")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + stats */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid item xs={4} sx={{ display: "flex", alignItems: "center" }}>
            <Typography fontWeight="bold" sx={{ mr: 0.5 }}>
              {t(weapon.name)}
            </Typography>
            {weapon.martial && <Martial />}
          </Grid>
          <Grid item xs={2}>
            <Typography textAlign="center">{`${weapon.cost}z`}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography fontWeight="bold" textAlign="center">
              <OpenBracket />
              {attr1?.shortcaps} + {attr2?.shortcaps}
              <CloseBracket />
              {weapon.prec > 0 ? `+${weapon.prec}` : ""}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography fontWeight="bold" textAlign="center">
              <OpenBracket />
              {t("HR +")} {weapon.damage}
              <CloseBracket />
              {dmgType?.long}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 2 – category / hands / range */}
        <Grid
          container
          justifyContent="space-between"
          sx={{
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid item xs={4}>
            <Typography fontWeight="bold">{t(weapon.category)}</Typography>
          </Grid>
          <Grid item xs={1}>
            <Diamond color={customTheme.primary} />
          </Grid>
          <Grid item xs={3}>
            <Typography textAlign="center">
              {weapon.hands === 1 ? t("One-handed") : t("Two-handed")}
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <Diamond color={customTheme.primary} />
          </Grid>
          <Grid item xs={3}>
            <Typography textAlign="center">
              {weapon.melee ? t("Melee") : t("Ranged")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 3 – quality */}
        <Box sx={{ px: 1, py: 0.75 }}>
          <Typography variant="body2">
            {!weapon.quality ? (
              t("No Qualities")
            ) : (
              <StyledMarkdown
                allowedElements={["strong", "em"]}
                unwrapDisallowed
              >
                {weapon.quality}
              </StyledMarkdown>
            )}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// ArmorCard  (handles both Armor and Shield)
// ---------------------------------------------------------------------------

function getArmorDefDisplay(armor, t) {
  if (armor.category === "Shield") {
    const bonus = armor.defbonus !== undefined ? armor.defbonus : armor.def;
    return `+${bonus}`;
  }
  if (armor.martial) return `${armor.def}`;
  const bonus = armor.defbonus !== undefined ? armor.defbonus : 0;
  return bonus === 0 ? t("DEX die") : `${t("DEX die")} +${bonus}`;
}

function getArmorMDefDisplay(armor, t) {
  if (armor.category === "Shield") {
    const bonus = armor.mdefbonus !== undefined ? armor.mdefbonus : armor.mdef;
    return `+${bonus}`;
  }
  const bonus = armor.mdefbonus !== undefined ? armor.mdefbonus : 0;
  return bonus === 0 ? t("INS die") : `${t("INS die")} +${bonus}`;
}

const ArmorCard = React.memo(function ArmorCard({ armor, id }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  return (
    <Card id={id} elevation={1}>
      <Stack>
        {/* Header */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            "& .MuiTypography-root": {
              fontSize: "0.9rem",
              textTransform: "uppercase",
            },
          }}
        >
          <Grid item xs={3}>
            <Typography variant="h4">{t(armor.category)}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h4" textAlign="center">
              {t("Cost")}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h4" textAlign="center">
              {t("Defense")}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">
              {t("M. Defense")}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h4" textAlign="center">
              {t("Init.")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + stats */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid item xs={3} sx={{ display: "flex", alignItems: "center" }}>
            <Typography fontWeight="bold" sx={{ mr: 0.5 }}>
              {t(armor.name)}
            </Typography>
            {armor.martial && <Martial />}
          </Grid>
          <Grid item xs={2}>
            <Typography textAlign="center">{`${armor.cost}z`}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography fontWeight="bold" textAlign="center">
              {getArmorDefDisplay(armor, t)}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography fontWeight="bold" textAlign="center">
              {getArmorMDefDisplay(armor, t)}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography fontWeight="bold" textAlign="center">
              {armor.init === 0 ? "—" : armor.init}
            </Typography>
          </Grid>
        </Grid>

        {/* quality row (optional) */}
        {armor.quality && (
          <Box sx={{ px: 1, py: 0.75 }}>
            <Typography variant="body2">
              <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                {armor.quality}
              </StyledMarkdown>
            </Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// SpellCard
// ---------------------------------------------------------------------------

const SpellCard = React.memo(function SpellCard({ spell, id }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const attr1 = attributes[spell.attr1];
  const attr2 = attributes[spell.attr2];

  return (
    <Card id={id} elevation={1}>
      <Stack>
        {/* Header */}
        <Grid
          container
          alignItems="center"
          sx={{
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            "& .MuiTypography-root": {
              fontSize: "0.9rem",
              textTransform: "uppercase",
            },
          }}
        >
          <Grid item xs={4}>
            <Typography variant="h4">{t("Spell")}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h4" textAlign="center">
              {t("MP")}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">
              {t("Duration")}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">
              {t("Target")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + cost + duration + target */}
        <Grid
          container
          alignItems="center"
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid item xs={4}>
            <Typography fontWeight="bold">{t(spell.name)}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography textAlign="center">{spell.mp}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography textAlign="center">{spell.duration}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography textAlign="center">{spell.target}</Typography>
          </Grid>
        </Grid>

        {/* Row 2 – accuracy (if applicable) */}
        {attr1 && attr2 && (
          <Grid
            container
            alignItems="center"
            sx={{
              borderBottom: `1px solid ${customTheme.secondary}`,
              px: 1,
              py: "4px",
            }}
          >
            <Grid item xs={12}>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="right"
                fontWeight="bold"
              >
                {attr1.shortcaps} + {attr2.shortcaps}
              </Typography>
            </Grid>
          </Grid>
        )}

        {/* Effect */}
        <Box sx={{ px: 1, py: 0.75 }}>
          <Typography variant="body2">{spell.effect}</Typography>
        </Box>
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// PlayerSpellCard
// ---------------------------------------------------------------------------

const PlayerSpellCard = React.memo(function PlayerSpellCard({ spell, id }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const attr1 = attributes[spell.attr1];
  const attr2 = attributes[spell.attr2];

  return (
    <Card id={id} elevation={1}>
      <Stack>
        {/* Header */}
        <Grid
          container
          alignItems="center"
          sx={{
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            "& .MuiTypography-root": {
              fontSize: "0.9rem",
              textTransform: "uppercase",
            },
          }}
        >
          <Grid item xs={4}>
            <Typography variant="h4">{t("Spell")}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h4" textAlign="center">{t("MP")}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">{t("Duration")}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">{t("Target")}</Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + mp + duration + target */}
        <Grid
          container
          alignItems="center"
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid item xs={4}>
            <Typography fontWeight="bold">{t(spell.name)}</Typography>
            <Typography variant="caption" color="text.secondary">{spell.class}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography textAlign="center">{spell.mp}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography textAlign="center">{t(spell.duration)}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography textAlign="center">{t(spell.targetDesc)}</Typography>
          </Grid>
        </Grid>

        {/* Row 2 – accuracy (if applicable) */}
        {attr1 && attr2 && (
          <Grid
            container
            alignItems="center"
            sx={{
              borderBottom: `1px solid ${customTheme.secondary}`,
              px: 1,
              py: "4px",
            }}
          >
            <Grid item xs={12}>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="right"
                fontWeight="bold"
              >
                <OpenBracket />{attr1.shortcaps} + {attr2.shortcaps}<CloseBracket />
              </Typography>
            </Grid>
          </Grid>
        )}

        {/* Description */}
        <Box sx={{ px: 1, py: 0.75 }}>
          <Typography variant="body2">
            <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
              {t(spell.description)}
            </StyledMarkdown>
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// NonStaticSpellCard
// ---------------------------------------------------------------------------

const NonStaticSpellCard = React.memo(function NonStaticSpellCard({ item, id }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const md = (text) => (
    <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>{text || ""}</StyledMarkdown>
  );

  const renderBody = () => {
    switch (item.spellType) {
      case "gift":
        return (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mb: 0.5 }}>
              {md(t(item.event))}
            </Typography>
            <Typography variant="body2" color="text.secondary">{md(t(item.effect))}</Typography>
          </>
        );
      case "dance":
        return (
          <>
            {item.duration && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                <strong>{t("Duration")}:</strong> {t(item.duration)}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">{md(t(item.effect))}</Typography>
          </>
        );
      case "therioform":
        return (
          <>
            {item.genoclepsis && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mb: 0.5 }}>
                {md(t(item.genoclepsis))}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">{md(t(item.description))}</Typography>
          </>
        );
      case "magichant":
      case "symbol":
        return <Typography variant="body2" color="text.secondary">{md(t(item.effect))}</Typography>;
      case "invocation":
        return (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              {item.wellspring && (
                <Chip label={item.wellspring} size="small" variant="outlined"
                  sx={{ fontSize: "0.65rem", height: 18 }} />
              )}
              {item.type && (
                <Chip label={item.type} size="small" variant="outlined"
                  sx={{ fontSize: "0.65rem", height: 18 }} />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">{md(t(item.effect))}</Typography>
          </>
        );
      case "magiseed":
        return (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{md(t(item.description))}</Typography>
            {Array.from({ length: item.rangeEnd - item.rangeStart + 1 }, (_, j) => {
              const tier = item.rangeStart + j;
              const effect = item.effects?.[tier];
              return effect ? (
                <Box key={tier} sx={{ display: "flex", gap: 1, mb: 0.25 }}>
                  <Typography variant="caption" fontWeight="bold" color={customTheme.primary}
                    sx={{ minWidth: 22, flexShrink: 0, pt: "1px" }}>
                    T{tier}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{md(t(effect))}</Typography>
                </Box>
              ) : null;
            })}
          </>
        );
      case "arcanist":
      case "arcanist-rework":
        return (
          <Stack divider={<Divider />}>
            {item.domainDesc && (
              <Box>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.25 }}>{t("Domain")}</Typography>
                <Typography variant="body2" color="text.secondary">{md(t(item.domainDesc))}</Typography>
              </Box>
            )}
            {item.mergeDesc && (
              <Box>
                <Typography variant="body2" fontWeight="bold" sx={{ textTransform: "uppercase", mb: 0.25 }}>{t("Merge")}</Typography>
                <Typography variant="body2" color="text.secondary">{md(t(item.mergeDesc))}</Typography>
              </Box>
            )}
            {item.dismissDesc && (
              <Box>
                <Typography variant="body2" fontWeight="bold" sx={{ textTransform: "uppercase", mb: 0.25 }}>{t("Dismiss")}</Typography>
                <Typography variant="body2" color="text.secondary">{md(t(item.dismissDesc))}</Typography>
              </Box>
            )}
          </Stack>
        );
      case "tinkerer-alchemy":
        return (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: "bold" }}>
              {item.category}
            </Typography>
            <Typography variant="body2" color="text.secondary">{md(item.effect)}</Typography>
          </>
        );
      case "tinkerer-infusion":
        return (
          <>
            {item.infusionRank && (
              <Typography variant="caption" color="text.secondary">Rank {item.infusionRank}</Typography>
            )}
            <Typography variant="body2" color="text.secondary">{md(item.effect ?? item.description ?? "")}</Typography>
          </>
        );
      case "pilot-vehicle":
        return (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: "bold", mb: 0.25, display: "block" }}>
              {item.category}
            </Typography>
            {item.passengers != null && (
              <Typography variant="caption" color="text.secondary">
                Passengers: {item.passengers} · Distance: {item.distance}
              </Typography>
            )}
            {item.def != null && (
              <Typography variant="caption" color="text.secondary">
                DEF {item.def} · MDEF {item.mdef}{item.martial ? " · Martial" : ""}
              </Typography>
            )}
            {(item.damage != null || item.range) && (
              <Typography variant="caption" color="text.secondary">
                {[item.category, `HR+${item.damage}`, item.range, item.prec !== 0 ? `+${item.prec} acc` : null, item.cumbersome ? "Cumbersome" : null].filter(Boolean).join(" · ")}
              </Typography>
            )}
            {item.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{md(t(item.description))}</Typography>}
          </>
        );
      case "cooking":
        return <Typography variant="body2" color="text.secondary">{md(item.effect ?? "")}</Typography>;
      default:
        return null;
    }
  };

  const typeLabel = {
    gift: "Gift",
    dance: "Dance",
    therioform: "Therioform",
    magichant: "Tone",
    symbol: "Symbol",
    invocation: "Invocation",
    magiseed: "Magiseed",
    arcanist: "Arcanum",
    "arcanist-rework": "Arcanum",
    "tinkerer-alchemy": "Alchemy",
    "tinkerer-infusion": "Infusion",
    "pilot-vehicle": "Pilot Vehicle",
    cooking: "Delicacy",
  }[item.spellType] ?? item.spellType;

  return (
    <Card id={id} elevation={1}>
      <Stack>
        <Box
          sx={{
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" sx={{ textTransform: "uppercase", fontWeight: "bold" }}>
            {t(typeLabel)}
          </Typography>
        </Box>
        <Box
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Typography fontWeight="bold">{t(item.name)}</Typography>
        </Box>
        <Box sx={{ px: 1, py: 0.75 }}>
          {renderBody()}
        </Box>
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// AttackCard
// ---------------------------------------------------------------------------

const AttackCard = React.memo(function AttackCard({ attack, id }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const attr1 = attributes[attack.attr1];
  const attr2 = attributes[attack.attr2];
  const dmgType = types[attack.type];

  return (
    <Card id={id} elevation={1}>
      <Stack>
        {/* Header */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            "& .MuiTypography-root": {
              fontSize: "0.9rem",
              textTransform: "uppercase",
            },
          }}
        >
          <Grid item xs={3}>
            <Typography variant="h4">{t(attack.category)}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">
              {t("Accuracy")}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">
              {t("Damage")}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">
              {t("Range")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 1 – stats */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{
            background,
            px: 1,
            py: "5px",
          }}
        >
          <Grid item xs={3} sx={{ display: "flex", alignItems: "center" }}>
            <Typography fontWeight="bold" sx={{ mr: 0.5 }}>
              {t(attack.name)}
            </Typography>
            {attack.martial && <Martial />}
          </Grid>
          <Grid item xs={3}>
            <Typography fontWeight="bold" textAlign="center">
              {attr1 && attr2 ? (
                <>
                  <OpenBracket />
                  {attr1.shortcaps} + {attr2.shortcaps}
                  <CloseBracket />
                  {attack.flathit > 0 ? `+${attack.flathit}` : ""}
                </>
              ) : (
                "—"
              )}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography fontWeight="bold" textAlign="center">
              <OpenBracket />
              HR + {attack.flatdmg}
              <CloseBracket />
              {dmgType?.long}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography textAlign="center">{t(attack.range)}</Typography>
          </Grid>
        </Grid>
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// Per-character spell-type item renderer
// ---------------------------------------------------------------------------

function getNonStaticSpellItems(sc) {
  switch (sc) {
    case "gift":
      return availableGifts
        .filter(g => !g.name.includes("_custom_"))
        .map(g => ({ ...g, spellType: "gift" }));
    case "dance":
      return availableDances
        .filter(d => !d.name.includes("_custom_"))
        .map(d => ({ ...d, spellType: "dance" }));
    case "therioform":
      return availableTherioforms
        .filter(tf => !tf.name.includes("_custom_"))
        .map(tf => ({ ...tf, spellType: "therioform" }));
    case "magichant":
      return availableTones
        .filter(tone => !tone.name.includes("_custom_"))
        .map(tone => ({ ...tone, spellType: "magichant" }));
    case "symbol":
      return availableSymbols
        .filter(s => !s.name.includes("_custom_"))
        .map(s => ({ ...s, spellType: "symbol" }));
    case "invocation":
      return Object.entries(invocationsByWellspring).flatMap(([wellspring, invocations]) =>
        invocations.map(inv => ({ ...inv, spellType: "invocation", wellspring }))
      );
    case "magiseed":
      return magiseeds.map(ms => ({ ...ms, spellType: "magiseed" }));
    case "arcanist":
    case "arcanist-rework":
      return arcanumList.map(arc => ({ ...arc, spellType: sc }));
    case "tinkerer-alchemy":
      return [
        ...tinkererAlchemy.targets.map(t => ({
          name: t.rangeFrom === t.rangeTo ? `${t.rangeFrom}` : `${t.rangeFrom}–${t.rangeTo}`,
          spellType: "tinkerer-alchemy",
          category: "Target",
          effect: t.effect,
        })),
        ...tinkererAlchemy.effects.map(e => ({
          name: `Die: ${e.dieValue}`,
          spellType: "tinkerer-alchemy",
          category: "Effect",
          effect: e.effect,
        })),
      ];
    case "tinkerer-infusion":
      return tinkererInfusion.effects.map(e => ({
        name: `Rank ${e.infusionRank}: ${e.name ?? ""}`.trim().replace(/: $/, ""),
        spellType: "tinkerer-infusion",
        ...e,
      }));
    case "pilot-vehicle":
      return [
        ...availableFrames.map(f => ({ ...f, spellType: "pilot-vehicle", category: "Frame" })),
        ...availableModules.armor
          .filter(m => !m.customName && m.name !== "pilot_custom_armor")
          .map(m => ({ ...m, spellType: "pilot-vehicle", category: "Armor Module" })),
        ...availableModules.weapon.map(m => ({ ...m, spellType: "pilot-vehicle", category: "Weapon Module" })),
        ...availableModules.support
          .filter(m => m.name !== "pilot_custom_support")
          .map(m => ({ ...m, spellType: "pilot-vehicle", category: "Support Module" })),
      ];
    default:
      return null;
  }
}

function renderSpellTypeContent(sc, t, customTheme) {
  const border = { borderTop: `1px solid ${customTheme.secondary}` };
  const itemSx = { ...border, px: 2, py: 0.75 };
  const sectionHeaderSx = {
    ...border, px: 2, py: 0.5,
    backgroundColor: `${customTheme.primary}11`,
  };
  const captionHeader = (label) => (
    <Typography variant="caption" fontWeight="bold" color="text.secondary"
      sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </Typography>
  );
  const md = (text) => (
    <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>{text}</StyledMarkdown>
  );

  switch (sc) {

    case "gift":
      return availableGifts
        .filter(g => !g.name.includes("_custom_"))
        .map((g, i) => (
          <Box key={i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, mb: 0.25, flexWrap: "wrap" }}>
              <Typography variant="body2" fontWeight="bold">{t(g.name)}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                {md(t(g.event))}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">{md(t(g.effect))}</Typography>
          </Box>
        ));

    case "dance":
      return availableDances
        .filter(d => !d.name.includes("_custom_"))
        .map((d, i) => (
          <Box key={i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
              <Typography variant="body2" fontWeight="bold">{t(d.name)}</Typography>
              {d.duration && (
                <Typography variant="caption" color="text.secondary">· {t(d.duration)}</Typography>
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">{md(t(d.effect))}</Typography>
          </Box>
        ));

    case "therioform":
      return availableTherioforms
        .filter(tf => !tf.name.includes("_custom_"))
        .map((tf, i) => (
          <Box key={i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, mb: 0.25, flexWrap: "wrap" }}>
              <Typography variant="body2" fontWeight="bold">{t(tf.name)}</Typography>
              {tf.genoclepsis && (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                  {md(t(tf.genoclepsis))}
                </Typography>
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">{md(t(tf.description))}</Typography>
          </Box>
        ));

    case "magichant":
      return availableTones
        .filter(tone => !tone.name.includes("_custom_"))
        .map((tone, i) => (
          <Box key={i} sx={itemSx}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.25 }}>{t(tone.name)}</Typography>
            <Typography variant="body2" color="text.secondary">{md(t(tone.effect))}</Typography>
          </Box>
        ));

    case "symbol":
      return availableSymbols
        .filter(s => !s.name.includes("_custom_"))
        .map((s, i) => (
          <Box key={i} sx={itemSx}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.25 }}>{t(s.name)}</Typography>
            <Typography variant="body2" color="text.secondary">{md(t(s.effect))}</Typography>
          </Box>
        ));

    case "invocation":
      return Object.entries(invocationsByWellspring).flatMap(([wellspring, invocations]) => [
        <Box key={wellspring + "_h"} sx={sectionHeaderSx}>{captionHeader(wellspring)}</Box>,
        ...invocations.map((inv, i) => (
          <Box key={wellspring + i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
              <Typography variant="body2" fontWeight="bold">{t(inv.name)}</Typography>
              <Chip label={inv.type} size="small" variant="outlined"
                sx={{ fontSize: "0.6rem", height: 16 }} />
            </Box>
            <Typography variant="body2" color="text.secondary">{md(t(inv.effect))}</Typography>
          </Box>
        )),
      ]);

    case "magiseed":
      return magiseeds.map((ms, i) => (
        <Box key={i} sx={itemSx}>
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.25 }}>{t(ms.name)}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{md(t(ms.description))}</Typography>
          {Array.from({ length: ms.rangeEnd - ms.rangeStart + 1 }, (_, j) => {
            const tier = ms.rangeStart + j;
            const effect = ms.effects[tier];
            return effect ? (
              <Box key={tier} sx={{ display: "flex", gap: 1, mb: 0.25 }}>
                <Typography variant="caption" fontWeight="bold" color={`${customTheme.primary}`}
                  sx={{ minWidth: 22, flexShrink: 0, pt: "1px" }}>
                  T{tier}
                </Typography>
                <Typography variant="body2" color="text.secondary">{md(t(effect))}</Typography>
              </Box>
            ) : null;
          })}
        </Box>
      ));

    case "cooking": {
      const effects = getDelicacyEffects(t);
      return effects.map((eff, i) => (
        <Box key={i} sx={itemSx}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary"
              sx={{ minWidth: 22, flexShrink: 0, pt: "1px" }}>
              {eff.id}.
            </Typography>
            <Typography variant="body2" color="text.secondary">{md(eff.effect)}</Typography>
          </Box>
        </Box>
      ));
    }

    case "tinkerer-alchemy": {
      return [
        <Box key="targets_h" sx={sectionHeaderSx}>{captionHeader(t("Targets"))}</Box>,
        ...tinkererAlchemy.targets.map((target, i) => (
          <Box key={"t" + i} sx={itemSx}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary"
                sx={{ minWidth: 36, flexShrink: 0, pt: "1px" }}>
                {target.rangeFrom === target.rangeTo
                  ? target.rangeFrom
                  : `${target.rangeFrom}–${target.rangeTo}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">{md(target.effect)}</Typography>
            </Box>
          </Box>
        )),
        <Box key="effects_h" sx={sectionHeaderSx}>{captionHeader(t("Effects"))}</Box>,
        ...tinkererAlchemy.effects.map((eff, i) => (
          <Box key={"e" + i} sx={itemSx}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary"
                sx={{ minWidth: 24, flexShrink: 0, pt: "1px" }}>
                {eff.dieValue}
              </Typography>
              <Typography variant="body2" color="text.secondary">{md(eff.effect)}</Typography>
            </Box>
          </Box>
        )),
      ];
    }

    case "tinkerer-infusion": {
      const byRank = {};
      tinkererInfusion.effects.forEach(eff => {
        const r = eff.infusionRank;
        if (!byRank[r]) byRank[r] = [];
        byRank[r].push(eff);
      });
      return Object.entries(byRank).flatMap(([rank, effs]) => [
        <Box key={"rank_" + rank} sx={sectionHeaderSx}>
          {captionHeader(`${t("Rank")} ${rank}`)}
        </Box>,
        ...effs.map((eff, i) => (
          <Box key={"r" + rank + "_" + i} sx={itemSx}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.25 }}>{eff.name}</Typography>
            <Typography variant="body2" color="text.secondary">{md(eff.effect)}</Typography>
          </Box>
        )),
      ]);
    }

    case "tinkerer-magitech": {
      const magitechRanks = [
        { rankLabel: t("Basic"),    name: t("Magitech Override"), descKeys: ["MagitechOverride_desc"] },
        { rankLabel: t("Advanced"), name: t("Magicannon"),        descKeys: ["Magicannon_desc1", "Magicannon_desc2"] },
        { rankLabel: t("Superior"), name: t("Magispheres"),       descKeys: ["Magispheres_desc1", "Magispheres_desc2", "Magispheres_desc3"] },
      ];
      return magitechRanks.flatMap((rank, ri) => [
        <Box key={"mtr_" + ri} sx={sectionHeaderSx}>
          {captionHeader(`${rank.rankLabel} — ${rank.name}`)}
        </Box>,
        <Box key={"mtc_" + ri} sx={itemSx}>
          {rank.descKeys.map((key, ki) => (
            <Typography key={ki} variant="body2" color="text.secondary" sx={{ mb: ki < rank.descKeys.length - 1 ? 0.5 : 0 }}>
              {md(t(key))}
            </Typography>
          ))}
        </Box>,
      ]);
    }

    case "arcanist":
    case "arcanist-rework": {
      return arcanumList.flatMap((arc, i) => [
        <Box key={"arc_h_" + i} sx={sectionHeaderSx}>
          {captionHeader(arc.name)}
        </Box>,
        <Box key={"arc_domain_" + i} sx={itemSx}>
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.25 }}>{t("Domain")}</Typography>
          <Typography variant="body2" color="text.secondary">{md(t(arc.domainDesc))}</Typography>
        </Box>,
        <Box key={"arc_merge_" + i} sx={itemSx}>
          <Typography variant="body2" fontWeight="bold" sx={{ textTransform: "uppercase", mb: 0.25 }}>{t("Merge")}</Typography>
          <Typography variant="body2" color="text.secondary">{md(t(arc.mergeDesc))}</Typography>
        </Box>,
        <Box key={"arc_dismiss_" + i} sx={itemSx}>
          <Typography variant="body2" fontWeight="bold" sx={{ textTransform: "uppercase", mb: 0.25 }}>{t("Dismiss")}</Typography>
          <Typography variant="body2" color="text.secondary">{md(t(arc.dismissDesc))}</Typography>
        </Box>,
      ]);
    }

    case "pilot-vehicle": {
      return [
        <Box key="frames_h" sx={sectionHeaderSx}>{captionHeader(t("Frames"))}</Box>,
        ...availableFrames.map((frame, i) => (
          <Box key={"fr" + i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25, flexWrap: "wrap" }}>
              <Typography variant="body2" fontWeight="bold">{t(frame.name)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {t("Passengers")}: {frame.passengers} · {t("Distance")}: {frame.distance}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">{md(t(frame.description))}</Typography>
          </Box>
        )),

        <Box key="armor_h" sx={sectionHeaderSx}>{captionHeader(t("Armor Modules"))}</Box>,
        ...availableModules.armor
          .filter(m => !m.customName && m.name !== "pilot_custom_armor")
          .map((m, i) => (
            <Box key={"am" + i} sx={itemSx}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                <Typography variant="body2" fontWeight="bold">{t(m.name)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  DEF {m.def} · MDEF {m.mdef}{m.martial ? " · Martial" : ""}
                </Typography>
              </Box>
            </Box>
          )),

        <Box key="weapon_h" sx={sectionHeaderSx}>{captionHeader(t("Weapon Modules"))}</Box>,
        ...availableModules.weapon.map((m, i) => (
          <Box key={"wm" + i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
              <Typography variant="body2" fontWeight="bold">{t(m.name)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {m.category} · HR+{m.damage} · {m.range}
                {m.prec !== 0 ? ` · +${m.prec} acc` : ""}
                {m.cumbersome ? " · Cumbersome" : ""}
              </Typography>
            </Box>
          </Box>
        )),

        <Box key="support_h" sx={sectionHeaderSx}>{captionHeader(t("Support Modules"))}</Box>,
        ...availableModules.support
          .filter(m => m.name !== "pilot_custom_support")
          .map((m, i) => (
            <Box key={"sm" + i} sx={itemSx}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: m.description ? 0.25 : 0 }}>
                {t(m.name)}
              </Typography>
              {m.description && (
                <Typography variant="body2" color="text.secondary">{md(t(m.description))}</Typography>
              )}
            </Box>
          )),
      ];
    }

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// ClassCard
// ---------------------------------------------------------------------------

const ClassCard = React.memo(function ClassCard({ cls, id }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const benefits = cls.benefits;
  const benefitLines = [];
  if (benefits) {
    if (benefits.hpplus > 0)
      benefitLines.push(
        t("Permanently increase your maximum Hit Points by") + ` ${benefits.hpplus}.`
      );
    if (benefits.mpplus > 0)
      benefitLines.push(
        t("Permanently increase your maximum Mind Points by") + ` ${benefits.mpplus}.`
      );
    if (benefits.ipplus > 0)
      benefitLines.push(
        t("Permanently increase your maximum Inventory Points by") + ` ${benefits.ipplus}.`
      );
    if (benefits.martials?.armor)
      benefitLines.push(t("Gain the ability to equip martial armor."));
    if (benefits.martials?.melee)
      benefitLines.push(t("Gain the ability to equip martial melee weapons."));
    if (benefits.martials?.ranged)
      benefitLines.push(t("Gain the ability to equip martial ranged weapons."));
    if (benefits.martials?.shields)
      benefitLines.push(t("Gain the ability to equip martial shields."));
    if (benefits.rituals?.ritualism)
      benefitLines.push(
        t("You may perform Rituals whose effects fall within the Ritualism discipline.")
      );
  }

  return (
    <Card id={id} elevation={1}>
      <Stack>
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1,
            background: customTheme.primary,
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            variant="h4"
            sx={{ textTransform: "uppercase", fontSize: "1.1rem", fontWeight: "bold" }}
          >
            {t(cls.name)}
          </Typography>
          {cls.book && (
            <Chip
              label={cls.book}
              size="small"
              sx={{
                textTransform: "capitalize",
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#ffffff",
                fontWeight: "bold",
                fontSize: "0.7rem",
                flexShrink: 0,
              }}
            />
          )}
        </Box>

        {/* Free Benefits */}
        {benefitLines.length > 0 && (
          <Box sx={{ background, px: 2, py: 1, borderBottom: `1px solid ${customTheme.secondary}` }}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
              {t("Free Benefits")}
            </Typography>
            <Stack spacing={0.25}>
              {benefitLines.map((line, i) => (
                <Typography key={i} variant="body2">• {line}</Typography>
              ))}
            </Stack>
          </Box>
        )}

        {/* Skills */}
        {/* Spells accordion */}
        {(() => {
          const classSpells = spellList.filter((s) => s.class === cls.name);
          const hasCustomSpells =
            cls.benefits?.spellClasses?.length > 0 && classSpells.length === 0;
          if (!cls.benefits?.spellClasses?.length && classSpells.length === 0)
            return null;
          return (
            <Accordion disableGutters elevation={0} square
              sx={{ borderTop: `1px solid ${customTheme.secondary}`, "&:before": { display: "none" } }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 40, "& .MuiAccordionSummary-content": { my: 0.5 } }}>
                <Typography variant="body2" fontWeight="bold">
                  {t("Spells")}
                  {classSpells.length > 0 && (
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({classSpells.length})
                    </Typography>
                  )}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {hasCustomSpells ? (
                  /* Per-character spell types */
                  cls.benefits.spellClasses.map((sc) => {
                    const descKeys = SPELL_TYPE_DESC_KEYS[sc] ?? [];
                    const content = renderSpellTypeContent(sc, t, customTheme);
                    const hasContent = Array.isArray(content) ? content.length > 0 : content !== null;
                    return (
                      <Box key={sc} sx={{ borderTop: `1px solid ${customTheme.secondary}` }}>
                        {/* Header: chip + optional desc keys */}
                        <Box sx={{ px: 2, py: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: descKeys.length ? 0.75 : 0 }}>
                            <Chip
                              label={sc}
                              size="small"
                              sx={{
                                fontSize: "0.65rem",
                                textTransform: "capitalize",
                                backgroundColor: `${customTheme.primary}22`,
                                color: customTheme.primary,
                                fontWeight: "bold",
                              }}
                            />
                            {!descKeys.length && !hasContent && (
                              <Typography variant="caption" color="text.secondary" fontStyle="italic">
                                {t("Defined per character")}
                              </Typography>
                            )}
                          </Box>
                          {descKeys.map((key) => (
                            <Typography key={key} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                                {t(key)}
                              </StyledMarkdown>
                            </Typography>
                          ))}
                        </Box>
                        {/* Individual items */}
                        {content}
                      </Box>
                    );
                  })
                ) : (
                  /* Static spell list (default / gamble types) */
                  classSpells.map((spell, i) => (
                    <Box
                      key={i}
                      sx={{
                        borderTop: `1px solid ${customTheme.secondary}`,
                        px: 2,
                        py: 0.75,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {t(spell.name)}
                        </Typography>
                        <Chip
                          label={spell.isOffensive ? t("Offensive") : t("Support")}
                          size="small"
                          color={spell.isOffensive ? "error" : "success"}
                          variant="outlined"
                          sx={{ fontSize: "0.6rem", height: 16 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                          {spell.mp} MP
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, mb: 0.25 }}>
                        <Typography variant="caption" color="text.secondary">
                          {spell.targetDesc}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">·</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {spell.duration}
                        </Typography>
                        {spell.attr1 && spell.attr2 && (
                          <>
                            <Typography variant="caption" color="text.secondary">·</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {attributes[spell.attr1]?.shortcaps} + {attributes[spell.attr2]?.shortcaps}
                            </Typography>
                          </>
                        )}
                      </Box>
                      {spell.spellType === "gamble" ? (
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                              {t("GambleSpell_desc")}
                            </StyledMarkdown>
                          </Typography>
                          {spell.targets?.map((target, j) => (
                            <Box key={j} sx={{ display: "flex", gap: 1, mb: 0.25 }}>
                              <Typography variant="caption" fontWeight="bold" color="text.secondary"
                                sx={{ minWidth: 32, flexShrink: 0, pt: "1px" }}>
                                {target.rangeFrom === target.rangeTo
                                  ? target.rangeFrom
                                  : `${target.rangeFrom}–${target.rangeTo}`}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                                  {target.effect}
                                </StyledMarkdown>
                              </Typography>
                            </Box>
                          ))}
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                            {t(spell.description)}
                          </StyledMarkdown>
                        </Typography>
                      )}
                    </Box>
                  ))
                )}
              </AccordionDetails>
            </Accordion>
          );
        })()}
        <Divider />

        {cls.skills?.map((skill, i) => (
          <Box
            key={i}
            sx={{
              borderBottom: i < cls.skills.length - 1
                ? `1px solid ${customTheme.secondary}`
                : undefined,
            }}
          >
            {/* Skill header row */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2,
                pt: 0.75,
                pb: 0.25,
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {t(skill.skillName)}
              </Typography>
              <Chip
                label={`Max ${skill.maxLvl}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.65rem", height: 18, flexShrink: 0 }}
              />
            </Box>
            {/* Skill description */}
            <Box sx={{ px: 2, pb: 0.75 }}>
              <Typography variant="body2" color="text.secondary">
                <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                  {t(skill.description)}
                </StyledMarkdown>
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// Card dispatcher
// ---------------------------------------------------------------------------

const ItemCard = React.memo(function ItemCard({ type, item, id }) {
  switch (type) {
    case "weapons":
      return <WeaponCard weapon={item} id={id} />;
    case "armor":
    case "shields":
      return <ArmorCard armor={item} id={id} />;
    case "spells":
      return <SpellCard spell={item} id={id} />;
    case "player-spells":
      return item.spellType && item.spellType !== "default" && item.spellType !== "gamble"
        ? <NonStaticSpellCard item={item} id={id} />
        : <PlayerSpellCard spell={item} id={id} />;
    case "attacks":
      return <AttackCard attack={item} id={id} />;
    case "classes":
      return <ClassCard cls={item} id={id} />;
    default:
      return null;
  }
});

// ---------------------------------------------------------------------------
// Main CompendiumViewer
// ---------------------------------------------------------------------------

const SIDEBAR_WIDTH = 300;

function CompendiumViewer() {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("md"));
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [shareSnackOpen, setShareSnackOpen] = useState(false);

  const selectedType = searchParams.get("type") ?? "weapons";
  const selectedSpellClass = searchParams.get("class") ?? "";

  const mainRef = useRef(null);
  const selectedCardRef = useRef(null);

  // Lock page scroll while this route is mounted
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Compute filtered items
  const activeSpellCls = useMemo(() => {
    if (selectedType !== "player-spells" || !selectedSpellClass) return null;
    return classList.find((c) => c.name === selectedSpellClass) ?? null;
  }, [selectedType, selectedSpellClass]);

  const filteredItems = useMemo(() => {
    if (selectedType !== "player-spells") {
      const items = getItems(selectedType);
      if (!searchQuery.trim()) return items;
      const q = searchQuery.toLowerCase();
      return items.filter((item) => getItemSearchText(item).includes(q));
    }

    // Build player-spells list
    let items;
    if (!activeSpellCls) {
      // No class selected — show all static spells
      items = spellList;
    } else {
      const scs = activeSpellCls.benefits?.spellClasses ?? [];
      items = [];
      for (const sc of scs) {
        if (sc === "default") {
          items.push(...spellList.filter((s) => s.class === activeSpellCls.name));
        } else if (sc === "cooking") {
          const cookingEffects = getDelicacyEffects(staticT);
          items.push(...cookingEffects.map(eff => ({
            name: `Delicacy #${eff.id}`,
            spellType: "cooking",
            ...eff,
          })));
        } else {
          const nonStatic = getNonStaticSpellItems(sc);
          if (nonStatic) items.push(...nonStatic);
        }
      }
    }

    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) =>
      [item.name, item.class, item.spellType, item.wellspring]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [selectedType, searchQuery, activeSpellCls, selectedSpellClass]);

  // Stable IDs per item (index in the filtered list)
  const itemIds = useMemo(
    () => filteredItems.map((item, idx) => makeId(item.name, idx)),
    [filteredItems]
  );

  const selectedItem = selectedIdx !== null ? filteredItems[selectedIdx] : null;
  const [downloadSelectedImage] = useDownloadImage(selectedItem?.name ?? "", selectedCardRef);

  const handleShareUrl = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShareSnackOpen(true);
  }, []);

  // Restore selection from URL params on mount / when filteredItems change
  useEffect(() => {
    const itemSlug = searchParams.get("item");
    if (!itemSlug) return;
    const idx = filteredItems.findIndex((item) => toSlug(item.name) === itemSlug);
    if (idx === -1) return;
    setSelectedIdx(idx);
    const id = itemIds[idx];
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
    });
  // Only run when filteredItems/itemIds change (covers initial load + type change from URL)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredItems, itemIds]);

  const handleTypeChange = useCallback((type) => {
    setSearchQuery("");
    setSelectedIdx(null);
    setSearchParams({ type });
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [setSearchParams]);

  const handleSpellClassChange = useCallback((cls) => {
    setSearchQuery("");
    setSelectedIdx(null);
    setSearchParams({ type: selectedType, ...(cls ? { class: cls } : {}) });
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [selectedType, setSearchParams]);

  const handleItemClick = useCallback(
    (item, idx) => {
      setSelectedIdx(idx);
      setSearchParams({ type: selectedType, ...(selectedSpellClass ? { class: selectedSpellClass } : {}), item: toSlug(item.name) });
      const id = itemIds[idx];
      const scrollToItem = () => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
      };
      if (!isDesktop) {
        setDrawerOpen(false);
        setTimeout(scrollToItem, 300); // wait for drawer close animation
      } else {
        requestAnimationFrame(scrollToItem);
      }
    },
    [itemIds, isDesktop, selectedType, selectedSpellClass, setSearchParams]
  );

  const sidebarContent = (
    <CompendiumSidebar
      selectedType={selectedType}
      onTypeChange={handleTypeChange}
      searchQuery={searchQuery}
      onSearchChange={(q) => { setSearchQuery(q); setSelectedIdx(null); setSearchParams({ type: selectedType, ...(selectedSpellClass ? { class: selectedSpellClass } : {}) }); }}
      filteredItems={filteredItems}
      onItemClick={handleItemClick}
      selectedIdx={selectedIdx}
      selectedSpellClass={selectedSpellClass}
      onSpellClassChange={handleSpellClassChange}
    />
  );

  return (
    <ThemeProvider theme={customTheme}>
      <Layout>
        <Box
          sx={{
            display: "flex",
            height: "calc(100vh - 6em)",
            overflow: "hidden",
          }}
        >
          {/* ---- Desktop sidebar ---- */}
          {isDesktop && (
            <Box
              sx={{
                width: SIDEBAR_WIDTH,
                flexShrink: 0,
                borderRight: `1px solid ${muiTheme.palette.divider}`,
                height: "100%",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {sidebarContent}
            </Box>
          )}

          {/* ---- Mobile drawer ---- */}
          {!isDesktop && (
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              PaperProps={{ sx: { width: "85vw", maxWidth: 340 } }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  p: 1,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="close sidebar"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              <Divider />
              <Box sx={{ flex: 1, overflow: "hidden" }}>
                {sidebarContent}
              </Box>
            </Drawer>
          )}

          {/* ---- Main content area ---- */}
          <Box
            ref={mainRef}
            sx={{
              flex: 1,
              overflowY: "auto",
              p: { xs: 1.5, md: 2 },
            }}
          >
            {/* Mobile header */}
            {!isDesktop && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {t(
                    ITEM_TYPES.find((x) => x.key === selectedType)?.label ?? ""
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({filteredItems.length})
                </Typography>
              </Box>
            )}

            {/* Mobile FAB — fixed bottom-left */}
            {!isDesktop && (
              <Tooltip title={t("Open filters & navigation")}>
                <Fab
                  color="primary"
                  size="medium"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="open sidebar"
                  sx={{
                    position: "fixed",
                    bottom: 24,
                    left: 24,
                    zIndex: (theme) => theme.zIndex.speedDial,
                  }}
                >
                  <MenuIcon />
                </Fab>
              </Tooltip>
            )}

            {/* Desktop section title */}
            {isDesktop && (
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                {t(
                  ITEM_TYPES.find((x) => x.key === selectedType)?.label ?? ""
                )}
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  ({filteredItems.length} {t("items")})
                </Typography>
              </Typography>
            )}

            {filteredItems.length === 0 ? (
              <Typography color="text.secondary">{t("No items found.")}</Typography>
            ) : (
              <Grid container spacing={2}>
                {filteredItems.map((item, idx) => (
                  <Grid item xs={12} lg={selectedType === "classes" ? 12 : 6} key={itemIds[idx]}>
                    <Box
                      ref={idx === selectedIdx ? selectedCardRef : null}
                      sx={{
                        borderRadius: 1,
                        outline: idx === selectedIdx
                          ? `2px solid ${customTheme.primary}`
                          : "2px solid transparent",
                        transition: "outline 0.15s ease",
                      }}
                    >
                      <ItemCard
                        type={selectedType}
                        item={item}
                        id={itemIds[idx]}
                      />
                    </Box>
                    {idx === selectedIdx && (
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, mt: 0.5 }}>
                        <Tooltip title={t("Share URL")}>
                          <IconButton size="small" onClick={handleShareUrl}>
                            <ShareIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("Download as Image")}>
                          <IconButton size="small" onClick={downloadSelectedImage}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Export name={item.name} dataType={selectedType} data={item} />
                      </Box>
                    )}
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Layout>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={shareSnackOpen}
        autoHideDuration={2000}
        onClose={() => setShareSnackOpen(false)}
        message={t("Copied to Clipboard!")}
      />
    </ThemeProvider>
  );
}

export default CompendiumViewer;
