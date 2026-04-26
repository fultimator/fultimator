import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { useSearchParams } from "react-router";
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
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
import IosShareIcon from "@mui/icons-material/IosShare";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";

import Layout from "../../components/Layout";
import { ManageModulesModal } from "../../components/manage-modules";
import Export from "../../components/Export";
import { useCompendiumPacks } from "../../hooks/useCompendiumPacks";
import AddToCompendiumButton from "../../components/compendium/AddToCompendiumButton";
import CompendiumItemCreateDialog from "../../components/compendium/CompendiumItemCreateDialog";
import QuickCreateModal from "../../components/compendium/QuickCreateModal";
import useDownloadImage from "../../hooks/useDownloadImage";
import { useTranslate, t as staticT } from "../../translation/translate";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { IS_ELECTRON } from "../../platform";
import {
  WeaponCard,
  ArmorCard,
  QualityCard,
  CustomWeaponCard,
  AccessoryCard,
} from "../../components/compendium/ItemCards";
import {
  SharedSpellCard,
  SharedPlayerSpellCard,
  SharedGambleSpellCard,
  SharedGiftCard,
  SharedDanceCard,
  SharedTherioformCard,
  SharedArcanumCard,
  SharedAlchemyCard,
  SharedInfusionCard,
  SharedMagitechCard,
  SharedInvocationCard,
  SharedCookingCard,
  SharedMagiseedCard,
  SharedPilotVehicleCard,
  SharedSymbolCard,
  SharedMagichantCard,
  SharedAttackCard,
  SharedSpecialRuleCard,
  SharedActionCard,
  SharedClassCard,
  SharedSkillCard,
  SharedHeroicCard,
  SharedOptionalCard,
} from "../../components/shared/itemCards";

import classList, { spellList, spellsByClass } from "../../libs/classes";
import _attributes from "../../libs/attributes";
import _types from "../../libs/types";
import { getDelicacyEffects } from "../../libs/gourmetCookingData";

// Pre-compute delicacy effects once at module load
const staticDelicacyEffects = getDelicacyEffects(staticT);
import {
  CLASS_BOOK_OPTIONS,
  QUALITY_FILTER_OPTIONS,
  QUALITY_CATEGORY_OPTIONS,
  ITEM_TYPES,
  PACK_ITEM_TYPES,
  VIEWER_TO_PACK_TYPE,
  getItems,
  getItemSearchText,
  toSlug,
  makeId,
  getNonStaticSpellItems,
} from "../../libs/compendium";

// ---------------------------------------------------------------------------
// Sidebar table columns per type
// ---------------------------------------------------------------------------

function SidebarSecondaryValue(type, item, t) {
  if (type === "weapons") return `${item.cost}z`;
  if (type === "custom-weapons") return `${item.cost || 300}z`;
  if (type === "armor") return `${item.cost}z`;
  if (type === "shields") return `${item.cost}z`;
  if (type === "accessories") return `${item.cost}z`;
  if (type === "qualities") return `${item.cost}z`;
  if (type === "spells") return `${item.mp} MP`;
  if (type === "player-spells")
    return item.mp != null ? `${item.mp} MP` : (item.wellspring ?? "");
  if (type === "attacks") return t(item.range);
  if (type === "classes") return item.book ?? "";
  if (type === "heroics") return item.book ?? "";
  if (type === "optionals") return item.subtype ?? "";
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
  if (type === "optionals") return t("Subtype");
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
  const stableItem = useMemo(() => item, [item]);
  const handleClick = useCallback(
    () => onItemClick(stableItem, idx),
    [onItemClick, stableItem, idx],
  );

  return (
    <TableRow
      onClick={handleClick}
      sx={{
        cursor: "pointer",
        backgroundColor: isSelected ? `${primaryColor}22` : undefined,
        borderLeft: isSelected
          ? `3px solid ${primaryColor}`
          : "3px solid transparent",
        "&:hover": !isSelected
          ? { backgroundColor: `${primaryColor}22` }
          : undefined,
      }}
    >
      <TableCell sx={{ pl: isSelected ? "5px" : "8px" }}>
        <Typography
          variant="body2"
          color={
            isSelected
              ? customTheme.mode === "dark"
                ? "primary.light"
                : primaryColor
              : "text.primary"
          }
          sx={{
            fontWeight: isSelected ? "bold" : "normal",
          }}
        >
          {t(item.name)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography
          variant="body2"
          color={
            isSelected
              ? customTheme.mode === "dark"
                ? "primary.light"
                : primaryColor
              : "text.secondary"
          }
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
  selectedModuleType = "",
  onModuleTypeChange,
  selectedMagichantSubtype = "",
  onMagichantSubtypeChange,
  selectedQualityFilters,
  onQualityFiltersChange,
  selectedQualityCategories,
  onQualityCategoriesChange,
  selectedBook,
  onBookChange,
  selectedHeroicClasses,
  onHeroicClassesChange,
  selectedOptionalSubtypes,
  onOptionalSubtypesChange,
  // pack props
  packs,
  selectedCompendium,
  onCompendiumChange,
  onNewPack,
  onManagePack,
  activePack,
  onToggleLock,
  onOpenCreateDialog,
  onOpenQuickCreate,
  restrictToTypes,
}) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();
  const isPackMode = selectedCompendium !== "official";
  const baseTypes = isPackMode ? PACK_ITEM_TYPES : ITEM_TYPES;
  const activeTypes = restrictToTypes?.length
    ? baseTypes.filter((x) => restrictToTypes.includes(x.key))
    : baseTypes;

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
          background:
            customTheme.mode === "dark"
              ? "rgba(255, 255, 255, 0.03)"
              : "rgba(0, 0, 0, 0.01)",
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
                .filter((p) => p.active !== false)
                .sort((a, b) => {
                  if (a.isPersonal !== b.isPersonal)
                    return a.isPersonal ? -1 : 1;
                  return a.name.localeCompare(b.name);
                })
                .map((pack) => (
                  <MenuItem key={pack.id} value={pack.id}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {pack.isPersonal && (
                        <StarIcon
                          sx={{ fontSize: 14, color: "warning.main" }}
                        />
                      )}
                      {pack.locked && (
                        <LockIcon sx={{ fontSize: 14, color: "error.main" }} />
                      )}
                      {pack.name}
                    </Box>
                  </MenuItem>
                ))}
              <Divider />
              <MenuItem value="__manage_modules__">
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <SettingsIcon fontSize="small" />
                  {t("Manage Modules")}
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
          <Tooltip title={t("New Pack")}>
            <IconButton size="small" onClick={onNewPack}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {isPackMode && (
            <Tooltip
              title={activePack?.locked ? t("Unlock Pack") : t("Lock Pack")}
            >
              <IconButton
                size="small"
                onClick={() => onToggleLock(selectedCompendium)}
                color={activePack?.locked ? "error" : "default"}
              >
                {activePack?.locked ? (
                  <LockIcon fontSize="small" />
                ) : (
                  <LockOpenIcon fontSize="small" />
                )}
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

        {(!restrictToTypes || restrictToTypes.length !== 1) && (
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Item Type")}</InputLabel>
              <Select
                value={
                  activeTypes.length > 0 &&
                  activeTypes.some((x) => x.key === selectedType)
                    ? selectedType
                    : activeTypes.length > 0
                      ? activeTypes[0].key
                      : ""
                }
                onChange={(e) => onTypeChange(e.target.value)}
                label={t("Item Type")}
              >
                {activeTypes.map((type) => (
                  <MenuItem key={type.key} value={type.key}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        gap: 1,
                      }}
                    >
                      <span>{t(type.label)}</span>
                      {type.context && type.context !== "both" && (
                        <Chip
                          label={type.context === "npc" ? "NPC" : "Player"}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: "0.6rem",
                            fontWeight: "bold",
                            backgroundColor:
                              type.context === "npc"
                                ? "rgba(211,47,47,0.15)"
                                : "rgba(25,118,210,0.15)",
                            color:
                              type.context === "npc"
                                ? customTheme.mode === "dark"
                                  ? "white"
                                  : "error.dark"
                                : customTheme.mode === "dark"
                                  ? "white"
                                  : "primary.dark",
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
              <Tooltip
                title={
                  activePack?.locked
                    ? t("Unlock pack to create items")
                    : t("Create New Item")
                }
              >
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
        )}

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

        {selectedType === "player-spells" &&
          String(selectedSpellClass).toLowerCase() === "pilot" &&
          typeof onModuleTypeChange === "function" && (
            <FormControl fullWidth size="small">
              <InputLabel>{t("Module Type")}</InputLabel>
              <Select
                value={selectedModuleType}
                onChange={(e) => onModuleTypeChange?.(e.target.value)}
                label={t("Module Type")}
              >
                <MenuItem value="">{t("All")}</MenuItem>
                <MenuItem value="frame">{t("Vehicle Frame")}</MenuItem>
                <MenuItem value="armor">{t("pilot_module_armor")}</MenuItem>
                <MenuItem value="weapon">{t("pilot_module_weapon")}</MenuItem>
                <MenuItem value="support">{t("pilot_module_support")}</MenuItem>
              </Select>
            </FormControl>
          )}

        {selectedType === "player-spells" &&
          String(selectedSpellClass).toLowerCase() === "chanter" &&
          typeof onMagichantSubtypeChange === "function" && (
            <FormControl fullWidth size="small">
              <InputLabel>{t("Chant Type")}</InputLabel>
              <Select
                value={selectedMagichantSubtype}
                onChange={(e) => onMagichantSubtypeChange?.(e.target.value)}
                label={t("Chant Type")}
              >
                <MenuItem value="">{t("All")}</MenuItem>
                <MenuItem value="key">{t("Key")}</MenuItem>
                <MenuItem value="tone">{t("Tone")}</MenuItem>
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
            value={CLASS_BOOK_OPTIONS.filter((o) =>
              selectedBook.includes(o.value),
            )}
            onChange={(e, newValue) =>
              onBookChange(newValue.map((v) => v.value))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("Book")}
                placeholder={t("Filters")}
              />
            )}
            renderValue={(value, getTagProps) =>
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
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                </InputAdornment>
              ),
            },
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
              <TextField
                {...params}
                label={t("Applicable To")}
                placeholder={t("All classes")}
              />
            )}
            renderValue={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    label={t(option)}
                    size="small"
                    {...tagProps}
                  />
                );
              })
            }
          />
        )}

        {selectedType === "optionals" && (
          <Autocomplete
            multiple
            size="small"
            fullWidth
            options={[
              "quirk",
              "camp-activities",
              "zero-trigger",
              "zero-effect",
              "zero-power",
              "other",
            ]}
            getOptionLabel={(o) =>
              t(
                {
                  quirk: "Quirk",
                  "camp-activities": "Camp Activities",
                  "zero-trigger": "Zero Trigger",
                  "zero-effect": "Zero Effect",
                  "zero-power": "Zero Power",
                  other: "Other",
                }[o] ?? o,
              )
            }
            value={selectedOptionalSubtypes}
            onChange={(e, newValue) => onOptionalSubtypesChange(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("Subtype")}
                placeholder={t("All subtypes")}
              />
            )}
            renderValue={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                const label =
                  {
                    quirk: "Quirk",
                    "camp-activities": "Camp Activities",
                    "zero-trigger": "Zero Trigger",
                    "zero-effect": "Zero Effect",
                    "zero-power": "Zero Power",
                    other: "Other",
                  }[option] ?? option;
                return (
                  <Chip key={key} label={t(label)} size="small" {...tagProps} />
                );
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
                value={QUALITY_CATEGORY_OPTIONS.filter((o) =>
                  selectedQualityCategories.includes(o.value),
                )}
                onChange={(e, newValue) =>
                  onQualityCategoriesChange(newValue.map((v) => v.value))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("Category")}
                    placeholder={t("Filters")}
                  />
                )}
                renderValue={(value, getTagProps) =>
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
                value={QUALITY_FILTER_OPTIONS.filter((o) =>
                  selectedQualityFilters.includes(o.value),
                )}
                onChange={(e, newValue) =>
                  onQualityFiltersChange(newValue.map((v) => v.value))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("Applicable To")}
                    placeholder={t("Filters")}
                  />
                )}
                renderValue={(value, getTagProps) =>
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
                key={`${selectedType}-${item.name}`}
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
// Card dispatcher
// ---------------------------------------------------------------------------

export const ItemCard = React.memo(function ItemCard({
  type,
  item,
  id,
  onHeaderClick,
}) {
  switch (type) {
    case "weapons":
      return <WeaponCard weapon={item} id={id} onHeaderClick={onHeaderClick} />;
    case "armor":
    case "shields":
      return <ArmorCard armor={item} id={id} onHeaderClick={onHeaderClick} />;
    case "spells":
      return (
        <SharedSpellCard item={item} id={id} onHeaderClick={onHeaderClick} />
      );
    case "player-spells":
      if (!item.spellType || item.spellType === "default") {
        return (
          <SharedPlayerSpellCard
            item={item}
            id={id}
            onHeaderClick={onHeaderClick}
          />
        );
      } else if (item.spellType === "gamble") {
        return (
          <SharedGambleSpellCard
            item={item}
            id={id}
            onHeaderClick={onHeaderClick}
          />
        );
      } else if (item.spellType === "gift") {
        return (
          <SharedGiftCard item={item} id={id} onHeaderClick={onHeaderClick} />
        );
      } else if (item.spellType === "dance") {
        return (
          <SharedDanceCard item={item} id={id} onHeaderClick={onHeaderClick} />
        );
      } else if (item.spellType === "therioform") {
        return (
          <SharedTherioformCard
            item={item}
            id={id}
            onHeaderClick={onHeaderClick}
          />
        );
      } else if (item.spellType === "magichant") {
        return (
          <SharedMagichantCard
            item={item}
            id={id}
            onHeaderClick={onHeaderClick}
          />
        );
      } else if (item.spellType === "symbol") {
        return (
          <SharedSymbolCard item={item} id={id} onHeaderClick={onHeaderClick} />
        );
      } else if (item.spellType === "invocation") {
        return (
          <SharedInvocationCard
            item={item}
            id={id}
            onHeaderClick={onHeaderClick}
          />
        );
      } else if (item.spellType === "magiseed") {
        return (
          <SharedMagiseedCard
            item={item}
            id={id}
            onHeaderClick={onHeaderClick}
          />
        );
      } else if (item.spellType === "tinkerer-alchemy") {
        return (
          <SharedAlchemyCard
            item={item}
            id={id}
            onHeaderClick={onHeaderClick}
          />
        );
      } else if (item.spellType === "tinkerer-infusion") {
        return (
          <SharedInfusionCard
            item={item}
            id={id}
            onHeaderClick={onHeaderClick}
          />
        );
      } else if (item.spellType === "tinkerer-magitech") {
        return (
          <SharedMagitechCard
            item={item}
            id={id}
            onHeaderClick={onHeaderClick}
          />
        );
      } else if (item.spellType === "cooking") {
        return (
          <SharedCookingCard
            item={item}
            id={id}
            onHeaderClick={onHeaderClick}
          />
        );
      } else if (item.spellType === "pilot-vehicle") {
        return (
          <SharedPilotVehicleCard
            item={item}
            id={id}
            onHeaderClick={onHeaderClick}
          />
        );
      } else if (
        item.spellType === "arcanist" ||
        item.spellType === "arcanist-rework"
      ) {
        return (
          <SharedArcanumCard
            item={item}
            id={id}
            onHeaderClick={onHeaderClick}
          />
        );
      }
      return (
        <SharedPlayerSpellCard
          item={item}
          id={id}
          onHeaderClick={onHeaderClick}
        />
      );
    case "attacks":
      return (
        <SharedAttackCard item={item} id={id} onHeaderClick={onHeaderClick} />
      );
    case "qualities":
      return (
        <QualityCard quality={item} id={id} onHeaderClick={onHeaderClick} />
      );
    case "classes":
      return (
        <SharedClassCard item={item} id={id} onHeaderClick={onHeaderClick} />
      );
    case "heroics":
      return (
        <SharedHeroicCard item={item} id={id} onHeaderClick={onHeaderClick} />
      );
    case "custom-weapons":
      return (
        <CustomWeaponCard weapon={item} id={id} onHeaderClick={onHeaderClick} />
      );
    case "accessories":
      return (
        <AccessoryCard accessory={item} id={id} onHeaderClick={onHeaderClick} />
      );
    case "special":
      return (
        <SharedSpecialRuleCard
          item={item}
          id={id}
          onHeaderClick={onHeaderClick}
        />
      );
    case "actions":
      return (
        <SharedActionCard item={item} id={id} onHeaderClick={onHeaderClick} />
      );
    case "optionals":
      return (
        <SharedOptionalCard item={item} id={id} onHeaderClick={onHeaderClick} />
      );
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
  const {
    packs,
    loading: _packsLoading,
    createPack,
    updatePack,
    deletePack,
    toggleLock,
    removeItem,
    ensurePersonalPack,
    exportAsModule,
  } = useCompendiumPacks();
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
  const [exportMeta, setExportMeta] = useState({
    version: "1.0.0",
    homepageUrl: "",
    manifestUrl: "",
    downloadUrl: "",
  });
  const [exporting, setExporting] = useState(false);

  const [manageModulesOpen, setManageModulesOpen] = useState(false);
  const [_pendingNavPackId, setPendingNavPackId] = useState(null);

  // Always ensure the personal pack exists so it shows in the dropdown
  useEffect(() => {
    ensurePersonalPack();
  }, [ensurePersonalPack]);

  const activePacks = useMemo(
    () => packs.filter((p) => p.active !== false),
    [packs],
  );
  const rawSelectedCompendium = searchParams.get("compendium") ?? "official";
  // If the selected pack was deactivated, fall back to official
  const selectedCompendium =
    rawSelectedCompendium === "official" ||
    activePacks.some((p) => p.id === rawSelectedCompendium)
      ? rawSelectedCompendium
      : "official";
  const activePack =
    selectedCompendium !== "official"
      ? (activePacks.find((p) => p.id === selectedCompendium) ?? null)
      : null;

  const selectedType = searchParams.get("type") ?? "weapons";
  const selectedSpellClass = searchParams.get("class") ?? "";
  const selectedModuleType = searchParams.get("moduleType") ?? "";
  const rawMagichantSubtype = searchParams.get("magichantSubtype") ?? "";
  const selectedMagichantSubtype =
    rawMagichantSubtype === "key" || rawMagichantSubtype === "tone"
      ? rawMagichantSubtype
      : "";
  const isPilotClassSelected =
    String(selectedSpellClass).toLowerCase() === "pilot";
  const isChanterClassSelected =
    String(selectedSpellClass).toLowerCase() === "chanter";
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
  const selectedOptionalSubtypes = useMemo(() => {
    const subtypes = searchParams.get("optionalSubtypes");
    return subtypes ? subtypes.split(",") : [];
  }, [searchParams]);

  useEffect(() => {
    const hasSubtypeParam = searchParams.has("magichantSubtype");
    if (!hasSubtypeParam) return;
    const shouldKeepSubtype =
      selectedType === "player-spells" &&
      isChanterClassSelected &&
      (selectedMagichantSubtype === "key" ||
        selectedMagichantSubtype === "tone");
    if (shouldKeepSubtype) return;
    const next = new URLSearchParams(searchParams);
    next.delete("magichantSubtype");
    setSearchParams(next, { replace: true });
  }, [
    searchParams,
    selectedType,
    isChanterClassSelected,
    selectedMagichantSubtype,
    setSearchParams,
  ]);

  const mainRef = useRef(null);
  const selectedCardRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const matchesPilotModuleType = useCallback((item, moduleType) => {
    const filter = String(moduleType || "").toLowerCase();
    if (!filter) return true;

    if (filter === "frame") {
      return (
        item?.pilotSubtype === "frame" ||
        String(item?.category || "").toLowerCase() === "frame" ||
        item?.passengers != null ||
        String(item?.name || "")
          .toLowerCase()
          .includes("pilot_frame_")
      );
    }

    const normalizedValues = [
      item?.type,
      item?.category,
      item?.name,
      item?.spellType,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    const matchesFlatField = normalizedValues.some(
      (value) =>
        value === `pilot_module_${filter}` ||
        value.endsWith(`_${filter}`) ||
        value.includes(`module_${filter}`) ||
        value.includes(`${filter} module`),
    );
    if (matchesFlatField) return true;

    if (!Array.isArray(item?.modules) || item.modules.length === 0)
      return false;
    return item.modules.some((module) => {
      const moduleValues = [module?.type, module?.category, module?.name]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
      return moduleValues.some(
        (value) =>
          value === `pilot_module_${filter}` ||
          value.endsWith(`_${filter}`) ||
          value.includes(`module_${filter}`) ||
          value.includes(`${filter} module`),
      );
    });
  }, []);

  // Lock page scroll while this route is mounted
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollTop(el.scrollTop > 300);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Compute filtered items
  const activeSpellCls = useMemo(() => {
    if (selectedType !== "player-spells" || !selectedSpellClass) return null;
    return classList.find((c) => c.name === selectedSpellClass) ?? null;
  }, [selectedType, selectedSpellClass]);

  const filteredItems = useMemo(() => {
    // Pack mode
    if (activePack) {
      const packType = VIEWER_TO_PACK_TYPE[selectedType];
      let items = activePack.items
        .filter((i) => !packType || i.type === packType)
        // Embed the pack item id so Remove can find it later
        .map((i) => ({ ...i.data, _packItemId: i.id }));

      if (selectedType === "qualities" && selectedQualityFilters.length > 0) {
        items = items.filter(
          (item) =>
            item.filter &&
            selectedQualityFilters.some((f) => item.filter.includes(f)),
        );
      }

      if (
        selectedType === "qualities" &&
        selectedQualityCategories.length > 0
      ) {
        items = items.filter(
          (item) =>
            item.category && selectedQualityCategories.includes(item.category),
        );
      }

      if (selectedType === "classes" && selectedBook.length > 0) {
        items = items.filter((item) => selectedBook.includes(item.book));
      }

      if (selectedType === "heroics" && selectedBook.length > 0) {
        items = items.filter((item) => selectedBook.includes(item.book));
      }

      if (selectedType === "heroics" && selectedHeroicClasses.length > 0) {
        items = items.filter(
          (item) =>
            item.applicableTo &&
            selectedHeroicClasses.some((c) => item.applicableTo.includes(c)),
        );
      }

      if (selectedType === "optionals" && selectedOptionalSubtypes.length > 0) {
        items = items.filter((item) =>
          selectedOptionalSubtypes.includes(item.subtype),
        );
      }

      if (selectedType === "player-spells" && selectedSpellClass) {
        const spellClasses = activeSpellCls?.benefits?.spellClasses ?? [];
        items = items.filter((item) => {
          if (
            spellClasses.includes("default") &&
            item.class === selectedSpellClass
          ) {
            return true;
          }
          return spellClasses.includes(item.spellType);
        });
      }
      if (
        selectedType === "player-spells" &&
        isPilotClassSelected &&
        selectedModuleType
      ) {
        items = items.filter((item) =>
          matchesPilotModuleType(item, selectedModuleType),
        );
      }
      if (
        selectedType === "player-spells" &&
        isChanterClassSelected &&
        selectedMagichantSubtype
      ) {
        items = items.filter((item) => {
          const isKey =
            item.magichantSubtype === "key" ||
            item.type ||
            item.status ||
            item.attribute ||
            item.recovery;
          return selectedMagichantSubtype === "key" ? isKey : !isKey;
        });
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        items = items.filter((item) => getItemSearchText(item).includes(q));
      }
      return items;
    }

    // Official mode
    if (selectedType !== "player-spells") {
      let items = getItems(selectedType);

      if (selectedType === "classes") {
        // Filter out blank classes and homebrew from official data
        items = items.filter(
          (c) => c.name !== "Blank Class" && c.book !== "homebrew",
        );
        if (selectedBook.length > 0) {
          items = items.filter((item) => selectedBook.includes(item.book));
        }
      }

      if (selectedType === "qualities" && selectedQualityFilters.length > 0) {
        items = items.filter(
          (item) =>
            item.filter &&
            selectedQualityFilters.some((f) => item.filter.includes(f)),
        );
      }

      if (
        selectedType === "qualities" &&
        selectedQualityCategories.length > 0
      ) {
        items = items.filter(
          (item) =>
            item.category && selectedQualityCategories.includes(item.category),
        );
      }

      if (selectedType === "heroics" && selectedBook.length > 0) {
        items = items.filter((item) => selectedBook.includes(item.book));
      }

      if (selectedType === "heroics" && selectedHeroicClasses.length > 0) {
        items = items.filter(
          (item) =>
            item.applicableTo &&
            selectedHeroicClasses.some((c) => item.applicableTo.includes(c)),
        );
      }

      if (selectedType === "optionals" && selectedOptionalSubtypes.length > 0) {
        items = items.filter((item) =>
          selectedOptionalSubtypes.includes(item.subtype),
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
          items.push(...(spellsByClass[activeSpellCls.name] || []));
        } else if (sc === "cooking") {
          items.push(
            ...staticDelicacyEffects.map((eff) => ({
              name: `Delicacy #${eff.id}`,
              spellType: "cooking",
              ...eff,
            })),
          );
        } else {
          const nonStatic = getNonStaticSpellItems(sc);
          if (nonStatic) items.push(...nonStatic);
        }
      }
    }

    if (isPilotClassSelected && selectedModuleType) {
      items = items.filter((item) =>
        matchesPilotModuleType(item, selectedModuleType),
      );
    }
    if (isChanterClassSelected && selectedMagichantSubtype) {
      items = items.filter((item) => {
        const isKey =
          item.magichantSubtype === "key" ||
          item.type ||
          item.status ||
          item.attribute ||
          item.recovery;
        return selectedMagichantSubtype === "key" ? isKey : !isKey;
      });
    }

    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) =>
      [item.name, item.class, item.spellType, item.wellspring]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [
    activePack,
    selectedType,
    searchQuery,
    activeSpellCls,
    selectedSpellClass,
    selectedQualityFilters,
    selectedQualityCategories,
    selectedBook,
    selectedHeroicClasses,
    selectedOptionalSubtypes,
    isPilotClassSelected,
    isChanterClassSelected,
    selectedModuleType,
    selectedMagichantSubtype,
    matchesPilotModuleType,
  ]);

  // Stable IDs per item (index in the filtered list)
  const itemIds = useMemo(
    () => filteredItems.map((item, idx) => makeId(item.name, idx)),
    [filteredItems],
  );

  const selectedItem = selectedIdx !== null ? filteredItems[selectedIdx] : null;
  const [downloadSelectedImage] = useDownloadImage(
    selectedItem?.name ?? "",
    selectedCardRef,
  );

  const handleShareUrl = useCallback(async () => {
    let url = window.location.href;
    if (IS_ELECTRON) {
      const baseUrl = "https://fultimator.com/compendium";
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
    const idx = filteredItems.findIndex(
      (item) => toSlug(item.name) === itemSlug,
    );
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

  const handleTypeChange = useCallback(
    (type) => {
      setSearchQuery("");
      setSelectedIdx(null);
      const base =
        selectedCompendium !== "official"
          ? { compendium: selectedCompendium }
          : {};
      setSearchParams({ ...base, type });
      if (mainRef.current) mainRef.current.scrollTop = 0;
    },
    [selectedCompendium, setSearchParams],
  );

  const handleSpellClassChange = useCallback(
    (cls) => {
      setSearchQuery("");
      setSelectedIdx(null);
      const base =
        selectedCompendium !== "official"
          ? { compendium: selectedCompendium }
          : {};
      const newParams = {
        ...base,
        type: selectedType,
        ...(cls ? { class: cls } : {}),
      };
      if (String(cls).toLowerCase() === "pilot" && selectedModuleType) {
        newParams.moduleType = selectedModuleType;
      }
      if (String(cls).toLowerCase() === "chanter" && selectedMagichantSubtype) {
        newParams.magichantSubtype = selectedMagichantSubtype;
      }
      setSearchParams(newParams);
      if (mainRef.current) mainRef.current.scrollTop = 0;
    },
    [
      selectedCompendium,
      selectedType,
      setSearchParams,
      selectedModuleType,
      selectedMagichantSubtype,
    ],
  );

  const handleModuleTypeChange = useCallback(
    (moduleType) => {
      setSearchQuery("");
      setSelectedIdx(null);
      const base =
        selectedCompendium !== "official"
          ? { compendium: selectedCompendium }
          : {};
      const newParams = {
        ...base,
        type: selectedType,
        ...(selectedSpellClass ? { class: selectedSpellClass } : {}),
        ...(moduleType ? { moduleType } : {}),
      };
      setSearchParams(newParams);
      if (mainRef.current) mainRef.current.scrollTop = 0;
    },
    [selectedCompendium, selectedType, selectedSpellClass, setSearchParams],
  );

  const handleMagichantSubtypeChange = useCallback(
    (magichantSubtype) => {
      setSearchQuery("");
      setSelectedIdx(null);
      const safeSubtype =
        magichantSubtype === "key" || magichantSubtype === "tone"
          ? magichantSubtype
          : "";
      const base =
        selectedCompendium !== "official"
          ? { compendium: selectedCompendium }
          : {};
      const newParams = {
        ...base,
        type: selectedType,
        ...(selectedSpellClass ? { class: selectedSpellClass } : {}),
        ...(selectedModuleType ? { moduleType: selectedModuleType } : {}),
        ...(safeSubtype ? { magichantSubtype: safeSubtype } : {}),
      };
      setSearchParams(newParams);
      if (mainRef.current) mainRef.current.scrollTop = 0;
    },
    [
      selectedCompendium,
      selectedSpellClass,
      selectedType,
      selectedModuleType,
      setSearchParams,
    ],
  );

  const handleBookChange = useCallback(
    (books) => {
      setSearchQuery("");
      setSelectedIdx(null);
      const base =
        selectedCompendium !== "official"
          ? { compendium: selectedCompendium }
          : {};
      const heroicClasses = searchParams.get("heroicClasses");
      const newParams = { ...base, type: selectedType };
      if (books.length > 0) newParams.book = books.join(",");
      if (heroicClasses) newParams.heroicClasses = heroicClasses;
      setSearchParams(newParams);
      if (mainRef.current) mainRef.current.scrollTop = 0;
    },
    [selectedCompendium, selectedType, setSearchParams, searchParams],
  );

  const handleQualityFiltersChange = useCallback(
    (filters) => {
      setSearchQuery("");
      setSelectedIdx(null);
      const base =
        selectedCompendium !== "official"
          ? { compendium: selectedCompendium }
          : {};
      const categories = searchParams.get("qualityCategories");
      const newParams = { ...base, type: selectedType };
      if (filters.length > 0) newParams.qualityFilters = filters.join(",");
      if (categories) newParams.qualityCategories = categories;
      setSearchParams(newParams);
      if (mainRef.current) mainRef.current.scrollTop = 0;
    },
    [selectedCompendium, selectedType, setSearchParams, searchParams],
  );

  const handleQualityCategoriesChange = useCallback(
    (categories) => {
      setSearchQuery("");
      setSelectedIdx(null);
      const base =
        selectedCompendium !== "official"
          ? { compendium: selectedCompendium }
          : {};
      const filters = searchParams.get("qualityFilters");
      const newParams = { ...base, type: selectedType };
      if (categories.length > 0)
        newParams.qualityCategories = categories.join(",");
      if (filters) newParams.qualityFilters = filters;
      setSearchParams(newParams);
      if (mainRef.current) mainRef.current.scrollTop = 0;
    },
    [selectedCompendium, selectedType, setSearchParams, searchParams],
  );

  const handleHeroicClassesChange = useCallback(
    (classes) => {
      setSearchQuery("");
      setSelectedIdx(null);
      const base =
        selectedCompendium !== "official"
          ? { compendium: selectedCompendium }
          : {};
      const book = searchParams.get("book");
      const newParams = { ...base, type: selectedType };
      if (classes.length > 0) newParams.heroicClasses = classes.join(",");
      if (book) newParams.book = book;
      setSearchParams(newParams);
      if (mainRef.current) mainRef.current.scrollTop = 0;
    },
    [selectedCompendium, selectedType, setSearchParams, searchParams],
  );

  const handleOptionalSubtypesChange = useCallback(
    (subtypes) => {
      setSearchQuery("");
      setSelectedIdx(null);
      const base =
        selectedCompendium !== "official"
          ? { compendium: selectedCompendium }
          : {};
      const book = searchParams.get("book");
      const newParams = { ...base, type: selectedType };
      if (subtypes.length > 0) newParams.optionalSubtypes = subtypes.join(",");
      if (book) newParams.book = book;
      setSearchParams(newParams);
      if (mainRef.current) mainRef.current.scrollTop = 0;
    },
    [selectedCompendium, selectedType, setSearchParams, searchParams],
  );

  const handleCompendiumChange = useCallback(
    (compendium) => {
      if (compendium === "__manage_modules__") {
        setManageModulesOpen(true);
        return;
      }
      setSearchQuery("");
      setSelectedIdx(null);
      const defaultType = compendium !== "official" ? "weapons" : "weapons";
      const base = compendium !== "official" ? { compendium } : {};
      setSearchParams({ ...base, type: defaultType });
      if (mainRef.current) mainRef.current.scrollTop = 0;
    },
    [setSearchParams],
  );

  const handleNewPack = useCallback(async () => {
    if (!newPackName.trim()) return;
    const id = await createPack(newPackName.trim());
    setNewPackName("");
    setPendingNavPackId(id); // navigate in onExited
    setNewPackDialogOpen(false);
  }, [newPackName, createPack]);

  const handleRemoveFromPack = useCallback(
    async (item) => {
      if (!activePack) return;
      await removeItem(activePack.id, item._packItemId);
      setSelectedIdx(null);
    },
    [activePack, removeItem],
  );

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

  const handleItemClick = useCallback(
    (item, idx) => {
      setSelectedIdx(idx);
      const base =
        selectedCompendium !== "official"
          ? { compendium: selectedCompendium }
          : {};
      setSearchParams({
        ...base,
        type: selectedType,
        ...(selectedSpellClass ? { class: selectedSpellClass } : {}),
        ...(selectedModuleType ? { moduleType: selectedModuleType } : {}),
        ...(selectedMagichantSubtype
          ? { magichantSubtype: selectedMagichantSubtype }
          : {}),
        ...(selectedBook.length > 0 ? { book: selectedBook.join(",") } : {}),
        ...(selectedQualityFilters.length > 0
          ? { qualityFilters: selectedQualityFilters.join(",") }
          : {}),
        ...(selectedQualityCategories.length > 0
          ? { qualityCategories: selectedQualityCategories.join(",") }
          : {}),
        ...(selectedHeroicClasses.length > 0
          ? { heroicClasses: selectedHeroicClasses.join(",") }
          : {}),
        ...(selectedOptionalSubtypes.length > 0
          ? { optionalSubtypes: selectedOptionalSubtypes.join(",") }
          : {}),
        item: toSlug(item.name),
      });
      const id = itemIds[idx];
      const scrollToItem = () => {
        const el = document.getElementById(id);
        if (el) {
          requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: "auto", block: "center" });
          });
        }
      };
      if (!isDesktop) {
        setDrawerOpen(false);
        setTimeout(scrollToItem, 300); // wait for drawer close animation
      } else {
        requestAnimationFrame(scrollToItem);
      }
    },
    [
      itemIds,
      isDesktop,
      selectedType,
      selectedSpellClass,
      selectedCompendium,
      selectedModuleType,
      selectedMagichantSubtype,
      selectedBook,
      selectedQualityFilters,
      selectedQualityCategories,
      selectedHeroicClasses,
      selectedOptionalSubtypes,
      setSearchParams,
    ],
  );

  // Memoize click handlers per item to prevent ItemCard re-renders from stale closures
  const itemClickHandlers = useMemo(
    () => filteredItems.map((item, idx) => () => handleItemClick(item, idx)),
    [filteredItems, handleItemClick],
  );

  const sidebarContent = (
    <CompendiumSidebar
      selectedType={selectedType}
      onTypeChange={handleTypeChange}
      searchQuery={searchQuery}
      onSearchChange={(q) => {
        setSearchQuery(q);
        setSelectedIdx(null);
        const base =
          selectedCompendium !== "official"
            ? { compendium: selectedCompendium }
            : {};
        setSearchParams({
          ...base,
          type: selectedType,
          ...(selectedSpellClass ? { class: selectedSpellClass } : {}),
          ...(selectedModuleType ? { moduleType: selectedModuleType } : {}),
          ...(selectedMagichantSubtype
            ? { magichantSubtype: selectedMagichantSubtype }
            : {}),
          ...(selectedBook.length > 0 ? { book: selectedBook.join(",") } : {}),
          ...(selectedQualityFilters.length > 0
            ? { qualityFilters: selectedQualityFilters.join(",") }
            : {}),
          ...(selectedQualityCategories.length > 0
            ? { qualityCategories: selectedQualityCategories.join(",") }
            : {}),
          ...(selectedOptionalSubtypes.length > 0
            ? { optionalSubtypes: selectedOptionalSubtypes.join(",") }
            : {}),
        });
      }}
      filteredItems={filteredItems}
      onItemClick={handleItemClick}
      selectedIdx={selectedIdx}
      selectedSpellClass={selectedSpellClass}
      onSpellClassChange={handleSpellClassChange}
      selectedModuleType={selectedModuleType}
      onModuleTypeChange={handleModuleTypeChange}
      selectedMagichantSubtype={selectedMagichantSubtype}
      onMagichantSubtypeChange={handleMagichantSubtypeChange}
      selectedQualityFilters={selectedQualityFilters}
      onQualityFiltersChange={handleQualityFiltersChange}
      selectedQualityCategories={selectedQualityCategories}
      onQualityCategoriesChange={handleQualityCategoriesChange}
      selectedBook={selectedBook}
      onBookChange={handleBookChange}
      selectedHeroicClasses={selectedHeroicClasses}
      onHeroicClassesChange={handleHeroicClassesChange}
      selectedOptionalSubtypes={selectedOptionalSubtypes}
      onOptionalSubtypesChange={handleOptionalSubtypesChange}
      packs={activePacks}
      selectedCompendium={selectedCompendium}
      onCompendiumChange={handleCompendiumChange}
      onNewPack={() => setNewPackDialogOpen(true)}
      onManagePack={() => {
        setEditingPackName(activePack?.name ?? "");
        setEditingDescription(activePack?.description ?? "");
        setEditingAuthor(activePack?.author ?? "");
        setExportMeta({
          version: "1.0.0",
          homepageUrl: "",
          manifestUrl: "",
          downloadUrl: "",
        });
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
              <Box sx={{ flex: 1, overflow: "hidden" }}>{sidebarContent}</Box>
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
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {t(
                    ITEM_TYPES.find((x) => x.key === selectedType)?.label ?? "",
                  )}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                  }}
                >
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

            {/* Scroll-to-top FAB */}
            {showScrollTop && (
              <Tooltip title={t("Scroll to top")}>
                <Fab
                  size="small"
                  color="primary"
                  onClick={() => {
                    if (mainRef.current) mainRef.current.scrollTop = 0;
                  }}
                  sx={{
                    position: "fixed",
                    bottom: 24,
                    right: 24,
                    zIndex: 1200,
                  }}
                >
                  <KeyboardArrowUpIcon />
                </Fab>
              </Tooltip>
            )}

            {/* Desktop section title */}
            {isDesktop && (
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                {t(ITEM_TYPES.find((x) => x.key === selectedType)?.label ?? "")}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    ml: 1,
                  }}
                >
                  ({filteredItems.length} {t("items")})
                </Typography>
              </Typography>
            )}

            {filteredItems.length === 0 ? (
              <Typography
                sx={{
                  color: "text.secondary",
                }}
              >
                {t("No items found.")}
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {filteredItems.map((item, idx) => (
                  <Grid
                    key={itemIds[idx]}
                    size={{
                      xs: 12,
                      lg: selectedType === "classes" ? 12 : 6,
                    }}
                    sx={{ contain: "layout paint" }}
                  >
                    <Box
                      ref={idx === selectedIdx ? selectedCardRef : null}
                      sx={{
                        borderRadius: 2,
                        border:
                          idx === selectedIdx
                            ? `2px solid ${customTheme.primary}`
                            : "2px solid transparent",
                        transition: "border-color 0.15s ease",
                        contain: "content",
                      }}
                    >
                      <ItemCard
                        type={selectedType}
                        item={item}
                        id={itemIds[idx]}
                        onHeaderClick={itemClickHandlers[idx]}
                      />
                    </Box>
                    {idx === selectedIdx && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <Tooltip title={t("Share URL")}>
                          <IconButton size="small" onClick={handleShareUrl}>
                            <ShareIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("Download as Image")}>
                          <IconButton
                            size="small"
                            onClick={downloadSelectedImage}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Export
                          name={item.name}
                          dataType={selectedType}
                          data={item}
                        />
                        {/* Add to compendium / Clone to Custom */}
                        {VIEWER_TO_PACK_TYPE[selectedType] && (
                          <AddToCompendiumButton
                            itemType={VIEWER_TO_PACK_TYPE[selectedType]}
                            data={item}
                            excludePackId={
                              selectedCompendium !== "official"
                                ? selectedCompendium
                                : undefined
                            }
                            tooltipOverride={
                              selectedType === "classes" &&
                              selectedCompendium === "official"
                                ? t("Clone to Custom")
                                : undefined
                            }
                          />
                        )}
                        {/* Edit class — pack mode only */}
                        {selectedCompendium !== "official" &&
                          selectedType === "classes" &&
                          item._packItemId &&
                          !activePack?.locked && (
                            <Tooltip title={t("Edit Class")}>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setEditClassItem({
                                    item,
                                    packItemId: item._packItemId,
                                  })
                                }
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        {/* Remove from pack — pack mode, only when unlocked */}
                        {selectedCompendium !== "official" &&
                          item._packItemId &&
                          !activePack?.locked && (
                            <Tooltip title={t("Remove from pack")}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveFromPack(item)}
                              >
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
          <Button
            onClick={() => {
              setNewPackDialogOpen(false);
              setNewPackName("");
            }}
          >
            {t("Cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleNewPack}
            disabled={!newPackName.trim()}
          >
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
        <DialogContent
          sx={{
            pt: "16px !important",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
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
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {t("Module Export")}
            </Typography>
          </Divider>

          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label={t("Version")}
              value={exportMeta.version}
              onChange={(e) =>
                setExportMeta((m) => ({ ...m, version: e.target.value }))
              }
              size="small"
              sx={{ width: 120 }}
              placeholder="1.0.0"
            />
            <TextField
              label={t("Homepage URL")}
              value={exportMeta.homepageUrl}
              onChange={(e) =>
                setExportMeta((m) => ({ ...m, homepageUrl: e.target.value }))
              }
              fullWidth
              size="small"
              placeholder="https://..."
            />
          </Box>
          <TextField
            label={t("Manifest URL")}
            value={exportMeta.manifestUrl}
            onChange={(e) =>
              setExportMeta((m) => ({ ...m, manifestUrl: e.target.value }))
            }
            fullWidth
            size="small"
            placeholder="https://.../manifest.json"
          />
          <TextField
            label={t("Download URL")}
            value={exportMeta.downloadUrl}
            onChange={(e) =>
              setExportMeta((m) => ({ ...m, downloadUrl: e.target.value }))
            }
            fullWidth
            size="small"
            placeholder="https://.../compendium.zip"
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
              startIcon={
                exporting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <IosShareIcon />
                )
              }
              onClick={handleExport}
              disabled={exporting}
            >
              {t("Export")}
            </Button>
            <Button
              onClick={() => setManageDialogOpen(false)}
              disabled={exporting}
            >
              {t("Cancel")}
            </Button>
            <Button
              variant="contained"
              disabled={
                exporting ||
                (!activePack?.isPersonal && !editingPackName.trim())
              }
              onClick={async () => {
                if (!activePack) return;
                const changes = {
                  ...(!activePack.isPersonal
                    ? { name: editingPackName.trim() }
                    : {}),
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
      <ManageModulesModal
        open={manageModulesOpen}
        onClose={() => setManageModulesOpen(false)}
        onImportSuccess={(id) => {
          setManageModulesOpen(false);
          handleCompendiumChange(id);
        }}
      />
    </ThemeProvider>
  );
}

export default CompendiumViewer;
