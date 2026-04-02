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
  Chip,
  Drawer,
  Fab,
  IconButton,
  Tooltip,
  Divider,
  InputAdornment,
  useMediaQuery,
  ThemeProvider,
  Snackbar,
  Autocomplete,
  Menu,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import StarIcon from "@mui/icons-material/Star";
import SettingsIcon from "@mui/icons-material/Settings";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import IosShareIcon from "@mui/icons-material/IosShare";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import LinkIcon from "@mui/icons-material/Link";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemIcon,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";

import Layout from "../../components/Layout";
import Export from "../../components/Export";
import { useCompendiumPacks } from "../../hooks/useCompendiumPacks";
import AddToCompendiumButton from "../../components/compendium/AddToCompendiumButton";
import CompendiumItemCreateDialog from "../../components/compendium/CompendiumItemCreateDialog";
import QuickCreateModal from "../../components/compendium/QuickCreateModal";
import useDownloadImage from "../../hooks/useDownloadImage";
import { useTranslate, t as staticT } from "../../translation/translate";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { IS_ELECTRON } from "../../platform";
import { StyledMarkdown, WeaponCard, ArmorCard, SpellCard, PlayerSpellCard, NonStaticSpellCard, AttackCard, QualityCard, HeroicCard, ClassCard, SpecialRuleCard, ActionCard } from "../../components/compendium/ItemCards";

import weapons from "../../libs/weapons";
import heroics from "../../libs/heroics";
import qualities from "../../libs/qualities";
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

export const CLASS_BOOK_OPTIONS = [
  { label: "Core", value: "core" },
  { label: "Rework", value: "rework" },
  { label: "Bonus", value: "bonus" },
  { label: "High Fantasy", value: "high" },
  { label: "Techno Fantasy", value: "techno" },
  { label: "Natural Fantasy", value: "natural" },
];

export const QUALITY_FILTER_OPTIONS = [
  { label: "Weapons", value: "weapon" },
  { label: "Custom Weapons", value: "customWeapon" },
  { label: "Armor", value: "armor" },
  { label: "Shields", value: "shield" },
  { label: "Accessories", value: "accessory" },
];

export const QUALITY_CATEGORY_OPTIONS = [
  { label: "Defensive", value: "Defensive" },
  { label: "Offensive", value: "Offensive" },
  { label: "Enhancement", value: "Enhancement" },
];

// ---------------------------------------------------------------------------
// Data preparation
// ---------------------------------------------------------------------------

const armors = baseArmors
  .filter((a) => a.name !== "No Armor")
  .map((a) => ({ ...a, category: "Armor" }));

const shields = baseShields
  .filter((s) => s.name !== "No Shield")
  .map((s) => ({ ...s, category: "Shield" }));

export const ITEM_TYPES = [
  { key: "weapons",      label: "Weapons",        context: "player" },
  { key: "armor",        label: "Armor",          context: "player" },
  { key: "shields",      label: "Shields",        context: "player" },
  { key: "spells",       label: "NPC Spells",     context: "npc" },
  { key: "attacks",      label: "NPC Attacks",    context: "npc" },
  { key: "special",      label: "Special Rules",  context: "npc" },
  { key: "actions",      label: "Other Actions",  context: "npc" },
  { key: "classes",      label: "Classes",        context: "player" },
  { key: "player-spells", label: "Spells",        context: "both" },
  { key: "qualities",    label: "Qualities",      context: "player" },
  { key: "heroics",      label: "Heroic Skills",  context: "player" },
];

// Item types available when browsing a pack (no classes / non-standard types)
export const PACK_ITEM_TYPES = [
  { key: "weapons",      label: "Weapons",        context: "player" },
  { key: "armor",        label: "Armor",          context: "player" },
  { key: "shields",      label: "Shields",        context: "player" },
  { key: "spells",       label: "NPC Spells",     context: "npc" },
  { key: "attacks",      label: "NPC Attacks",    context: "npc" },
  { key: "special",      label: "Special Rules",  context: "npc" },
  { key: "actions",      label: "Other Actions",  context: "npc" },
  { key: "player-spells", label: "Spells",        context: "both" },
  { key: "qualities",    label: "Qualities",      context: "player" },
  { key: "classes",      label: "Classes",        context: "player" },
  { key: "heroics",      label: "Heroic Skills",  context: "player" },
];

// viewer key → CompendiumItemType
export const VIEWER_TO_PACK_TYPE = {
  weapons:        "weapon",
  armor:          "armor",
  shields:        "shield",
  spells:         "npc-spell",
  attacks:        "npc-attack",
  special:        "npc-special",
  actions:        "npc-action",
  "player-spells": "player-spell",
  qualities:      "quality",
  classes:        "class",
  heroics:        "heroic",
};

export function getItems(type) {
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
    case "qualities":
      return qualities;
    case "heroics":
      return heroics;
    case "special":
    case "actions":
      return []; // pack-only, no official data
    default:
      return [];
  }
}

export function getItemSearchText(item) {
  const skillNames = item.skills
    ? item.skills.map((s) => s.skillName).join(" ")
    : "";
  return [item.name, item.category, item.type, item.range, item.book, skillNames, item.quality]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function makeId(name, idx) {
  return `compendium-item-${name.replace(/[^a-zA-Z0-9]/g, "-")}-${idx}`;
}

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ---------------------------------------------------------------------------
// Sidebar table columns per type
// ---------------------------------------------------------------------------

function SidebarSecondaryValue(type, item, t) {
  if (type === "weapons") return `${item.cost}z`;
  if (type === "armor") return `${item.cost}z`;
  if (type === "shields") return `${item.cost}z`;
  if (type === "qualities") return `${item.cost}z`;
  if (type === "spells") return `${item.mp} MP`;
  if (type === "player-spells") return item.mp != null ? `${item.mp} MP` : item.wellspring ?? "";
  if (type === "attacks") return t(item.range);
  if (type === "classes") return item.book ?? "";
  if (type === "heroics") return item.book ?? "";
  if (type === "special") return item.spCost != null ? `${item.spCost} SP` : "";
  if (type === "actions") return item.spCost != null ? `${item.spCost} SP` : "";
  return "";
}

function SidebarSecondaryLabel(type, t) {
  if (type === "spells") return t("MP");
  if (type === "player-spells") return t("MP");
  if (type === "attacks") return t("Range");
  if (type === "classes") return t("Book");
  if (type === "heroics") return t("Book");
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
  const customTheme = useCustomTheme();
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
          color={isSelected ? (customTheme.mode === "dark" ? "primary.light" : primaryColor) : "text.primary"}
        >
          {t(item.name)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography
          variant="body2"
          color={isSelected ? (customTheme.mode === "dark" ? "primary.light" : primaryColor) : "text.secondary"}
        >
          {SidebarSecondaryValue(selectedType, item, t)}
        </Typography>
      </TableCell>
    </TableRow>
  );
});

export const CompendiumSidebar = React.memo(function CompendiumSidebar({
  selectedType,
  onTypeChange,
  searchQuery,
  onSearchChange,
  filteredItems,
  onItemClick,
  selectedIdx,
  selectedSpellClass,
  onSpellClassChange,
  selectedQualityFilters,
  onQualityFiltersChange,
  selectedQualityCategories,
  onQualityCategoriesChange,
  selectedBook,
  onBookChange,
  selectedHeroicClasses,
  onHeroicClassesChange,
  // pack props
  packs,
  selectedCompendium,
  onCompendiumChange,
  onNewPack,
  onImportPack,
  onManagePack,
  activePack,
  onToggleLock,
  onOpenCreateDialog,
  onOpenQuickCreate,
}) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();
  const isPackMode = selectedCompendium !== "official";
  const activeTypes = isPackMode ? PACK_ITEM_TYPES : ITEM_TYPES;

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
      {/* Quick Create button */}
      <Button
        variant="contained"
        size="small"
        startIcon={<AutoFixHighIcon fontSize="small" />}
        onClick={onOpenQuickCreate}
        fullWidth
        sx={{ textTransform: "none" }}
      >
        {t("Quick Create")}
      </Button>

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
        {/* Compendium selector */}
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <FormControl fullWidth size="small">
            <InputLabel>{t("Compendium")}</InputLabel>
            <Select
              value={selectedCompendium}
              onChange={(e) => onCompendiumChange(e.target.value)}
              label={t("Compendium")}
            >
              <MenuItem value="official">{t("Official Data")}</MenuItem>
              {[...packs]
                .sort((a, b) => {
                  if (a.isPersonal !== b.isPersonal) return a.isPersonal ? -1 : 1;
                  return a.name.localeCompare(b.name);
                })
                .map((pack) => (
                  <MenuItem key={pack.id} value={pack.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      {pack.isPersonal && <StarIcon sx={{ fontSize: 14, color: "warning.main" }} />}
                      {pack.locked && <LockIcon sx={{ fontSize: 14, color: "error.main" }} />}
                      {pack.name}
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Tooltip title={t("New Pack")}>
            <IconButton size="small" onClick={onNewPack}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("Import Pack")}>
            <IconButton size="small" onClick={onImportPack}>
              <FileUploadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {isPackMode && (
            <Tooltip title={activePack?.locked ? t("Unlock Pack") : t("Lock Pack")}>
              <IconButton
                size="small"
                onClick={() => onToggleLock(selectedCompendium)}
                color={activePack?.locked ? "error" : "default"}
              >
                {activePack?.locked
                  ? <LockIcon fontSize="small" />
                  : <LockOpenIcon fontSize="small" />
                }
              </IconButton>
            </Tooltip>
          )}
          {isPackMode && (
            <Tooltip title={t("Manage Pack")}>
              <IconButton size="small" onClick={onManagePack}>
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <FormControl fullWidth size="small">
            <InputLabel>{t("Item Type")}</InputLabel>
            <Select
              value={activeTypes.some((x) => x.key === selectedType) ? selectedType : activeTypes[0].key}
              onChange={(e) => onTypeChange(e.target.value)}
              label={t("Item Type")}
            >
              {activeTypes.map((type) => (
                <MenuItem key={type.key} value={type.key}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 1 }}>
                    <span>{t(type.label)}</span>
                    {type.context && type.context !== "both" && (
                      <Chip
                        label={type.context === "npc" ? "NPC" : "Player"}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: "0.6rem",
                          fontWeight: "bold",
                          backgroundColor: type.context === "npc" ? "rgba(211,47,47,0.15)" : "rgba(25,118,210,0.15)",
                          color: type.context === "npc"
                            ? customTheme.mode === "dark" ? "white" : "error.dark"
                            : customTheme.mode === "dark" ? "white" : "primary.dark",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {isPackMode && (
            <Tooltip title={activePack?.locked ? t("Unlock pack to create items") : t("Create New Item")}>
              <span>
                <IconButton
                  size="small"
                  onClick={onOpenCreateDialog}
                  disabled={!!activePack?.locked}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>

        {selectedType === "player-spells" && !isPackMode && (
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

        {(selectedType === "classes" || selectedType === "heroics") && (
          <Autocomplete
            multiple
            size="small"
            fullWidth
            options={CLASS_BOOK_OPTIONS}
            getOptionLabel={(option) => t(option.label)}
            value={CLASS_BOOK_OPTIONS.filter((o) => selectedBook.includes(o.value))}
            onChange={(e, newValue) => onBookChange(newValue.map((v) => v.value))}
            renderInput={(params) => (
              <TextField {...params} label={t("Book")} placeholder={t("Filters")} />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    label={t(option.label)}
                    size="small"
                    {...tagProps}
                  />
                );
              })
            }
          />
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

        {selectedType === "heroics" && (
          <Autocomplete
            multiple
            size="small"
            fullWidth
            options={classList.map((c) => c.name)}
            value={selectedHeroicClasses}
            onChange={(e, newValue) => onHeroicClassesChange(newValue)}
            renderInput={(params) => (
              <TextField {...params} label={t("Applicable To")} placeholder={t("All classes")} />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return <Chip key={key} label={t(option)} size="small" {...tagProps} />;
              })
            }
          />
        )}

        {selectedType === "qualities" && (
          <>
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
              <Autocomplete
                multiple
                size="small"
                fullWidth
                options={QUALITY_CATEGORY_OPTIONS}
                getOptionLabel={(option) => t(option.label)}
                value={QUALITY_CATEGORY_OPTIONS.filter((o) => selectedQualityCategories.includes(o.value))}
                onChange={(e, newValue) => onQualityCategoriesChange(newValue.map((v) => v.value))}
                renderInput={(params) => (
                  <TextField {...params} label={t("Category")} placeholder={t("Filters")} />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={t(option.label)}
                        size="small"
                        {...tagProps}
                      />
                    );
                  })
                }
              />
              {/* <Tooltip title={t("Clear Filters")}>
                <IconButton size="small" onClick={() => onQualityCategoriesChange([])}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip> */}
            </Box>

            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
              <Autocomplete
                multiple
                size="small"
                fullWidth
                options={QUALITY_FILTER_OPTIONS}
                getOptionLabel={(option) => t(option.label)}
                value={QUALITY_FILTER_OPTIONS.filter((o) => selectedQualityFilters.includes(o.value))}
                onChange={(e, newValue) => onQualityFiltersChange(newValue.map((v) => v.value))}
                renderInput={(params) => (
                  <TextField {...params} label={t("Applicable To")} placeholder={t("Filters")} />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={t(option.label)}
                        size="small"
                        {...tagProps}
                      />
                    );
                  })
                }
              />
              {/* <Tooltip title={t("Clear Filters")}>
                <IconButton size="small" onClick={() => onQualityFiltersChange([])}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip> */}
            </Box>
          </>
        )}

        {/* <Typography variant="caption" color="text.secondary" sx={{ mt: -0.5 }}>
          {filteredItems.length} {t("items")}
        </Typography> */}
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
// Per-character spell-type item builder
// ---------------------------------------------------------------------------

export function getNonStaticSpellItems(sc) {
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

// ---------------------------------------------------------------------------
// Card dispatcher
// ---------------------------------------------------------------------------

export const ItemCard = React.memo(function ItemCard({ type, item, id, onHeaderClick }) {
  switch (type) {
    case "weapons":
      return <WeaponCard weapon={item} id={id} onHeaderClick={onHeaderClick} />;
    case "armor":
    case "shields":
      return <ArmorCard armor={item} id={id} onHeaderClick={onHeaderClick} />;
    case "spells":
      return <SpellCard spell={item} id={id} onHeaderClick={onHeaderClick} />;
    case "player-spells":
      return item.spellType && item.spellType !== "default" && item.spellType !== "gamble"
        ? <NonStaticSpellCard item={item} id={id} onHeaderClick={onHeaderClick} />
        : <PlayerSpellCard spell={item} id={id} onHeaderClick={onHeaderClick} />;
    case "attacks":
      return <AttackCard attack={item} id={id} onHeaderClick={onHeaderClick} />;
    case "qualities":
      return <QualityCard quality={item} id={id} onHeaderClick={onHeaderClick} />;
    case "classes":
      return <ClassCard cls={item} id={id} onHeaderClick={onHeaderClick} />;
    case "heroics":
      return <HeroicCard heroic={item} id={id} onHeaderClick={onHeaderClick} />;
    case "special":
      return <SpecialRuleCard item={item} id={id} onHeaderClick={onHeaderClick} />;
    case "actions":
      return <ActionCard item={item} id={id} onHeaderClick={onHeaderClick} />;
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

  // Pack state
  const { packs, loading: packsLoading, createPack, updatePack, deletePack, toggleLock, removeItem, ensurePersonalPack, exportAsModule, importFromFile, importFromManifestUrl } = useCompendiumPacks();
  const [newPackDialogOpen, setNewPackDialogOpen] = useState(false);
  const [newPackName, setNewPackName] = useState("");
  const [createItemDialogOpen, setCreateItemDialogOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [editClassItem, setEditClassItem] = useState(null); // { item, packItemId }
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [editingPackName, setEditingPackName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingAuthor, setEditingAuthor] = useState("");

  // Export meta lives inside the Manage Pack dialog (not a separate dialog)
  const [exportMeta, setExportMeta] = useState({ version: "1.0.0", homepageUrl: "", manifestUrl: "", downloadUrl: "" });
  const [exporting, setExporting] = useState(false);

  // Import dialog state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importTab, setImportTab] = useState(0); // 0 = file, 1 = URL
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  // Navigation is deferred to after the Dialog exit transition so MUI's focus
  // trap is fully released before we change the URL (avoids backdrop freeze).
  const [pendingNavPackId, setPendingNavPackId] = useState(null);

  // Always ensure the personal pack exists so it shows in the dropdown
  useEffect(() => { ensurePersonalPack(); }, [ensurePersonalPack]);

  const selectedCompendium = searchParams.get("compendium") ?? "official";
  const activePack = selectedCompendium !== "official"
    ? packs.find((p) => p.id === selectedCompendium) ?? null
    : null;

  const selectedType = searchParams.get("type") ?? "weapons";
  const selectedSpellClass = searchParams.get("class") ?? "";
  const selectedBook = useMemo(() => {
    const books = searchParams.get("book");
    return books ? books.split(",") : [];
  }, [searchParams]);
  const selectedQualityFilters = useMemo(() => {
    const filters = searchParams.get("qualityFilters");
    return filters ? filters.split(",") : [];
  }, [searchParams]);
  const selectedQualityCategories = useMemo(() => {
    const categories = searchParams.get("qualityCategories");
    return categories ? categories.split(",") : [];
  }, [searchParams]);
  const selectedHeroicClasses = useMemo(() => {
    const classes = searchParams.get("heroicClasses");
    return classes ? classes.split(",") : [];
  }, [searchParams]);

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
    // ── Pack mode ────────────────────────────────────────────────────────────
    if (activePack) {
      const packType = VIEWER_TO_PACK_TYPE[selectedType];
      let items = activePack.items
        .filter((i) => !packType || i.type === packType)
        // Embed the pack item id so Remove can find it later
        .map((i) => ({ ...i.data, _packItemId: i.id }));

      if (selectedType === "qualities" && selectedQualityFilters.length > 0) {
        items = items.filter((item) =>
          item.filter && selectedQualityFilters.some(f => item.filter.includes(f))
        );
      }

      if (selectedType === "qualities" && selectedQualityCategories.length > 0) {
        items = items.filter((item) =>
          item.category && selectedQualityCategories.includes(item.category)
        );
      }

      if (selectedType === "classes" && selectedBook.length > 0) {
        items = items.filter((item) => selectedBook.includes(item.book));
      }

      if (selectedType === "heroics" && selectedBook.length > 0) {
        items = items.filter((item) => selectedBook.includes(item.book));
      }

      if (selectedType === "heroics" && selectedHeroicClasses.length > 0) {
        items = items.filter((item) =>
          item.applicableTo && selectedHeroicClasses.some(c => item.applicableTo.includes(c))
        );
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        items = items.filter((item) => getItemSearchText(item).includes(q));
      }
      return items;
    }

    // ── Official mode ─────────────────────────────────────────────────────
    if (selectedType !== "player-spells") {
      let items = getItems(selectedType);

      if (selectedType === "classes") {
        // Filter out blank classes and homebrew from official data
        items = items.filter(c => c.name !== "Blank Class" && c.book !== "homebrew");
        if (selectedBook.length > 0) {
          items = items.filter((item) => selectedBook.includes(item.book));
        }
      }

      if (selectedType === "qualities" && selectedQualityFilters.length > 0) {
        items = items.filter((item) =>
          item.filter && selectedQualityFilters.some(f => item.filter.includes(f))
        );
      }

      if (selectedType === "qualities" && selectedQualityCategories.length > 0) {
        items = items.filter((item) =>
          item.category && selectedQualityCategories.includes(item.category)
        );
      }

      if (selectedType === "heroics" && selectedBook.length > 0) {
        items = items.filter((item) => selectedBook.includes(item.book));
      }

      if (selectedType === "heroics" && selectedHeroicClasses.length > 0) {
        items = items.filter((item) =>
          item.applicableTo && selectedHeroicClasses.some(c => item.applicableTo.includes(c))
        );
      }

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
  }, [activePack, selectedType, searchQuery, activeSpellCls, selectedSpellClass, selectedQualityFilters, selectedQualityCategories, selectedBook, selectedHeroicClasses]);

  // Stable IDs per item (index in the filtered list)
  const itemIds = useMemo(
    () => filteredItems.map((item, idx) => makeId(item.name, idx)),
    [filteredItems]
  );

  const selectedItem = selectedIdx !== null ? filteredItems[selectedIdx] : null;
  const [downloadSelectedImage] = useDownloadImage(selectedItem?.name ?? "", selectedCardRef);

  const handleShareUrl = useCallback(async () => {
    let url = window.location.href;
    if (IS_ELECTRON) {
      const baseUrl = "https://fultimator.com/compendium-viewer";
      const params = searchParams.toString();
      url = params ? `${baseUrl}?${params}` : baseUrl;
    }
    await navigator.clipboard.writeText(url);
    setShareSnackOpen(true);
  }, [searchParams]);

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
    const base = selectedCompendium !== "official" ? { compendium: selectedCompendium } : {};
    setSearchParams({ ...base, type });
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [selectedCompendium, setSearchParams]);

  const handleSpellClassChange = useCallback((cls) => {
    setSearchQuery("");
    setSelectedIdx(null);
    setSearchParams({ type: selectedType, ...(cls ? { class: cls } : {}) });
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [selectedType, setSearchParams]);

  const handleBookChange = useCallback((books) => {
    setSearchQuery("");
    setSelectedIdx(null);
    const base = selectedCompendium !== "official" ? { compendium: selectedCompendium } : {};
    setSearchParams({ ...base, type: selectedType, ...(books.length > 0 ? { book: books.join(",") } : {}) });
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [selectedCompendium, selectedType, setSearchParams]);

  const handleQualityFiltersChange = useCallback((filters) => {
    setSearchQuery("");
    setSelectedIdx(null);
    const base = selectedCompendium !== "official" ? { compendium: selectedCompendium } : {};
    const categories = searchParams.get("qualityCategories");
    const newParams = { ...base, type: selectedType };
    if (filters.length > 0) newParams.qualityFilters = filters.join(",");
    if (categories) newParams.qualityCategories = categories;
    setSearchParams(newParams);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [selectedCompendium, selectedType, setSearchParams, searchParams]);

  const handleQualityCategoriesChange = useCallback((categories) => {
    setSearchQuery("");
    setSelectedIdx(null);
    const base = selectedCompendium !== "official" ? { compendium: selectedCompendium } : {};
    const filters = searchParams.get("qualityFilters");
    const newParams = { ...base, type: selectedType };
    if (categories.length > 0) newParams.qualityCategories = categories.join(",");
    if (filters) newParams.qualityFilters = filters;
    setSearchParams(newParams);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [selectedCompendium, selectedType, setSearchParams, searchParams]);

  const handleHeroicClassesChange = useCallback((classes) => {
    setSearchQuery("");
    setSelectedIdx(null);
    const base = selectedCompendium !== "official" ? { compendium: selectedCompendium } : {};
    const newParams = { ...base, type: selectedType };
    if (classes.length > 0) newParams.heroicClasses = classes.join(",");
    setSearchParams(newParams);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [selectedCompendium, selectedType, setSearchParams]);

  const handleCompendiumChange = useCallback((compendium) => {
    setSearchQuery("");
    setSelectedIdx(null);
    const defaultType = compendium !== "official" ? "weapons" : "weapons";
    const base = compendium !== "official" ? { compendium } : {};
    setSearchParams({ ...base, type: defaultType });
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [setSearchParams]);

  const handleNewPack = useCallback(async () => {
    if (!newPackName.trim()) return;
    const id = await createPack(newPackName.trim());
    setNewPackName("");
    setPendingNavPackId(id); // navigate in onExited
    setNewPackDialogOpen(false);
  }, [newPackName, createPack]);

  const handleRemoveFromPack = useCallback(async (item) => {
    if (!activePack) return;
    await removeItem(activePack.id, item._packItemId);
    setSelectedIdx(null);
  }, [activePack, removeItem]);

  const handleExport = useCallback(async () => {
    if (!activePack) return;
    setExporting(true);
    try {
      await exportAsModule(activePack.id, exportMeta);
    } finally {
      setExporting(false);
      setManageDialogOpen(false);
    }
  }, [activePack, exportAsModule, exportMeta]);

  const handleImportFile = useCallback(async (file) => {
    if (importing) return; // guard against re-entry via the hidden <input>
    setImporting(true);
    setImportError("");
    try {
      const id = await importFromFile(file);
      setImportUrl("");
      setPendingNavPackId(id); // navigate in onExited, not here
      setImportDialogOpen(false);
    } catch (err) {
      setImportError(err.message ?? "Import failed");
    } finally {
      setImporting(false);
    }
  }, [importing, importFromFile]);

  const handleImportUrl = useCallback(async () => {
    if (!importUrl.trim() || importing) return;
    setImporting(true);
    setImportError("");
    try {
      const id = await importFromManifestUrl(importUrl.trim());
      setImportUrl("");
      setPendingNavPackId(id); // navigate in onExited, not here
      setImportDialogOpen(false);
    } catch (err) {
      setImportError(err.message ?? "Import failed");
    } finally {
      setImporting(false);
    }
  }, [importing, importUrl, importFromManifestUrl]);

  const handleItemClick = useCallback(
    (item, idx) => {
      setSelectedIdx(idx);
      const base = selectedCompendium !== "official" ? { compendium: selectedCompendium } : {};
      setSearchParams({ ...base, type: selectedType, ...(selectedSpellClass ? { class: selectedSpellClass } : {}), item: toSlug(item.name) });
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
    [itemIds, isDesktop, selectedType, selectedSpellClass, selectedCompendium, setSearchParams]
  );

  const sidebarContent = (
    <CompendiumSidebar
      selectedType={selectedType}
      onTypeChange={handleTypeChange}
      searchQuery={searchQuery}
      onSearchChange={(q) => {
        setSearchQuery(q);
        setSelectedIdx(null);
        const base = selectedCompendium !== "official" ? { compendium: selectedCompendium } : {};
        setSearchParams({
          ...base,
          type: selectedType,
          ...(selectedSpellClass ? { class: selectedSpellClass } : {}),
          ...(selectedBook.length > 0 ? { book: selectedBook.join(",") } : {}),
          ...(selectedQualityFilters.length > 0 ? { qualityFilters: selectedQualityFilters.join(",") } : {}),
          ...(selectedQualityCategories.length > 0 ? { qualityCategories: selectedQualityCategories.join(",") } : {}),
        });
      }}
      filteredItems={filteredItems}
      onItemClick={handleItemClick}
      selectedIdx={selectedIdx}
      selectedSpellClass={selectedSpellClass}
      onSpellClassChange={handleSpellClassChange}
      selectedQualityFilters={selectedQualityFilters}
      onQualityFiltersChange={handleQualityFiltersChange}
      selectedQualityCategories={selectedQualityCategories}
      onQualityCategoriesChange={handleQualityCategoriesChange}
      selectedBook={selectedBook}
      onBookChange={handleBookChange}
      selectedHeroicClasses={selectedHeroicClasses}
      onHeroicClassesChange={handleHeroicClassesChange}
      packs={packs}
      selectedCompendium={selectedCompendium}
      onCompendiumChange={handleCompendiumChange}
      onNewPack={() => setNewPackDialogOpen(true)}
      onImportPack={() => { setImportError(""); setImportTab(0); setImportUrl(""); setImportDialogOpen(true); }}
      onManagePack={() => {
        setEditingPackName(activePack?.name ?? "");
        setEditingDescription(activePack?.description ?? "");
        setEditingAuthor(activePack?.author ?? "");
        setExportMeta({ version: "1.0.0", homepageUrl: "", manifestUrl: "", downloadUrl: "" });
        setManageDialogOpen(true);
      }}
      activePack={activePack}
      onToggleLock={toggleLock}
      onOpenCreateDialog={() => setCreateItemDialogOpen(true)}
      onOpenQuickCreate={() => setQuickCreateOpen(true)}
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
                        onHeaderClick={() => handleItemClick(item, idx)}
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
                        {/* Add to compendium / Clone to Custom */}
                        {VIEWER_TO_PACK_TYPE[selectedType] && (
                          <AddToCompendiumButton
                            itemType={VIEWER_TO_PACK_TYPE[selectedType]}
                            data={item}
                            excludePackId={selectedCompendium !== "official" ? selectedCompendium : undefined}
                            tooltipOverride={selectedType === "classes" && selectedCompendium === "official" ? t("Clone to Custom") : undefined}
                          />
                        )}
                        {/* Edit class — pack mode only */}
                        {selectedCompendium !== "official" && selectedType === "classes" && item._packItemId && !activePack?.locked && (
                          <Tooltip title={t("Edit Class")}>
                            <IconButton size="small" onClick={() => setEditClassItem({ item, packItemId: item._packItemId })}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {/* Remove from pack — pack mode, only when unlocked */}
                        {selectedCompendium !== "official" && item._packItemId && !activePack?.locked && (
                          <Tooltip title={t("Remove from pack")}>
                            <IconButton size="small" color="error" onClick={() => handleRemoveFromPack(item)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
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

      {/* Quick Create modal */}
      <QuickCreateModal
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
      />

      {/* Create item dialog */}
      {activePack && (
        <CompendiumItemCreateDialog
          open={createItemDialogOpen}
          onClose={() => setCreateItemDialogOpen(false)}
          itemType={VIEWER_TO_PACK_TYPE[selectedType]}
          packId={activePack.id}
        />
      )}

      {/* Edit class dialog */}
      {activePack && editClassItem && (
        <CompendiumItemCreateDialog
          open={Boolean(editClassItem)}
          onClose={() => setEditClassItem(null)}
          itemType="class"
          packId={activePack.id}
          editData={editClassItem.item}
          editItemId={editClassItem.packItemId}
        />
      )}

      {/* New Pack dialog */}
      <Dialog
        open={newPackDialogOpen}
        onClose={() => setNewPackDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        TransitionProps={{
          onExited: () => {
            if (pendingNavPackId) {
              handleCompendiumChange(pendingNavPackId);
              setPendingNavPackId(null);
            }
          },
        }}
      >
        <DialogTitle
          sx={{
            background: customTheme.primary,
            color: "#ffffff",
            fontWeight: "bold",
            textTransform: "uppercase",
            fontSize: "0.95rem",
            py: 1.25,
          }}
        >
          {t("New Compendium Pack")}
        </DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          <TextField
            label={t("Name")}
            value={newPackName}
            onChange={(e) => setNewPackName(e.target.value)}
            autoFocus
            fullWidth
            size="small"
            onKeyDown={(e) => e.key === "Enter" && handleNewPack()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setNewPackDialogOpen(false); setNewPackName(""); }}>
            {t("Cancel")}
          </Button>
          <Button variant="contained" onClick={handleNewPack} disabled={!newPackName.trim()}>
            {t("Create")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Pack dialog — rename, description, author, module meta, export */}
      <Dialog
        open={manageDialogOpen}
        onClose={() => !exporting && setManageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionProps={{
          onExited: () => {
            if (pendingNavPackId) {
              handleCompendiumChange(pendingNavPackId);
              setPendingNavPackId(null);
            }
          },
        }}
      >
        <DialogTitle
          sx={{
            background: customTheme.primary,
            color: "#ffffff",
            fontWeight: "bold",
            textTransform: "uppercase",
            fontSize: "0.95rem",
            py: 1.25,
          }}
        >
          {activePack?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: "16px !important", display: "flex", flexDirection: "column", gap: 2 }}>
          {activePack && !activePack.isPersonal && (
            <TextField
              label={t("Pack name")}
              value={editingPackName}
              onChange={(e) => setEditingPackName(e.target.value)}
              fullWidth
              size="small"
            />
          )}
          <TextField
            label={t("Description")}
            value={editingDescription}
            onChange={(e) => setEditingDescription(e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={2}
          />
          <TextField
            label={t("Author")}
            value={editingAuthor}
            onChange={(e) => setEditingAuthor(e.target.value)}
            fullWidth
            size="small"
          />

          <Divider>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
              {t("Module Export")}
            </Typography>
          </Divider>

          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label={t("Version")}
              value={exportMeta.version}
              onChange={(e) => setExportMeta((m) => ({ ...m, version: e.target.value }))}
              size="small"
              sx={{ width: 120 }}
              placeholder="1.0.0"
            />
            <TextField
              label={t("Homepage URL")}
              value={exportMeta.homepageUrl}
              onChange={(e) => setExportMeta((m) => ({ ...m, homepageUrl: e.target.value }))}
              fullWidth
              size="small"
              placeholder="https://..."
            />
          </Box>
          <TextField
            label={t("Manifest URL")}
            value={exportMeta.manifestUrl}
            onChange={(e) => setExportMeta((m) => ({ ...m, manifestUrl: e.target.value }))}
            fullWidth
            size="small"
            placeholder="https://.../manifest.json"
          />
          <TextField
            label={t("Download URL")}
            value={exportMeta.downloadUrl}
            onChange={(e) => setExportMeta((m) => ({ ...m, downloadUrl: e.target.value }))}
            fullWidth
            size="small"
            placeholder="https://.../pack.fcp"
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          {activePack && !activePack.isPersonal && (
            <Button
              color="error"
              disabled={exporting}
              onClick={async () => {
                await deletePack(activePack.id);
                setPendingNavPackId("official"); // navigate in onExited
                setManageDialogOpen(false);
              }}
            >
              {t("Delete Pack")}
            </Button>
          )}
          <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
            <Button
              startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <IosShareIcon />}
              onClick={handleExport}
              disabled={exporting}
            >
              {t("Export")}
            </Button>
            <Button onClick={() => setManageDialogOpen(false)} disabled={exporting}>
              {t("Cancel")}
            </Button>
            <Button
              variant="contained"
              disabled={exporting || (!activePack?.isPersonal && !editingPackName.trim())}
              onClick={async () => {
                if (!activePack) return;
                const changes = {
                  ...(!activePack.isPersonal ? { name: editingPackName.trim() } : {}),
                  description: editingDescription.trim() || undefined,
                  author: editingAuthor.trim() || undefined,
                };
                await updatePack(activePack.id, changes);
                setManageDialogOpen(false);
              }}
            >
              {t("Save")}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Import Pack dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => !importing && setImportDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        TransitionProps={{
          onExited: () => {
            // Navigate only after focus trap + backdrop are fully unmounted
            if (pendingNavPackId) {
              handleCompendiumChange(pendingNavPackId);
              setPendingNavPackId(null);
            }
          },
        }}
      >
        <DialogTitle
          sx={{
            background: customTheme.primary,
            color: "#ffffff",
            fontWeight: "bold",
            textTransform: "uppercase",
            fontSize: "0.95rem",
            py: 1.25,
          }}
        >
          {t("Import Pack")}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important", display: "flex", flexDirection: "column", gap: 2 }}>
          <Tabs value={importTab} onChange={(_, v) => { setImportTab(v); setImportError(""); }}>
            <Tab label={t("Upload .fcp file")} />
            <Tab label={t("From URL")} icon={<LinkIcon fontSize="small" />} iconPosition="end" />
          </Tabs>

          {importTab === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {t("Select a .fcp file exported from Fultimator.")}
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<FileUploadIcon />}
                disabled={importing}
              >
                {t("Choose file")}
                <input
                  type="file"
                  accept=".fcp,.zip"
                  hidden
                  disabled={importing}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportFile(file);
                    e.target.value = "";
                  }}
                />
              </Button>
              {importing && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">{t("Importing…")}</Typography>
                </Box>
              )}
            </Box>
          )}

          {importTab === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {t("Paste a manifest.json URL to download and import the pack.")}
              </Typography>
              <TextField
                label={t("Manifest URL")}
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                fullWidth
                size="small"
                placeholder="https://.../manifest.json"
                disabled={importing}
                onKeyDown={(e) => e.key === "Enter" && handleImportUrl()}
              />
            </Box>
          )}

          {importError && <Alert severity="error">{importError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)} disabled={importing}>
            {t("Cancel")}
          </Button>
          {importTab === 1 && (
            <Button
              variant="contained"
              onClick={handleImportUrl}
              disabled={importing || !importUrl.trim()}
              startIcon={importing ? <CircularProgress size={16} color="inherit" /> : <FileUploadIcon />}
            >
              {t("Import")}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default CompendiumViewer;
