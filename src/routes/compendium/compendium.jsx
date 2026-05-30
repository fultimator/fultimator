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
  Chip,
  Fab,
  IconButton,
  Tooltip,
  Divider,
  InputAdornment,
  ThemeProvider,
  Snackbar,
  Autocomplete,
  useMediaQuery,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import ShareIcon from "@mui/icons-material/Share";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import StarIcon from "@mui/icons-material/Star";
import SettingsIcon from "@mui/icons-material/Settings";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import IosShareIcon from "@mui/icons-material/IosShare";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import Layout from "../../components/Layout";
import { ManageModulesModal } from "../../components/manage-modules";
import Export from "../../components/Export";
import { useCompendiumPacks } from "../../hooks/useCompendiumPacks";
import CompendiumItemCreateDialog from "../../components/compendium/CompendiumItemCreateDialog";
import QuickCreateModal from "../../components/compendium/QuickCreateModal";
import CompendiumBrowser from "../../components/compendium/CompendiumBrowser";
import { useTranslate } from "../../translation/translate";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { IS_ELECTRON } from "../../platform";
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
  SharedHeroicCard,
  SharedOptionalCard,
  SharedWeaponCard,
  SharedArmorCard,
  SharedShieldCard,
  SharedCustomWeaponCard,
  SharedAccessoryCard,
  SharedQualityCard,
  SharedMnemosphereCard,
  SharedHoplosphereCard,
} from "../../components/shared/items";

import classList from "../../libs/classes";
import {
  CLASS_BOOK_OPTIONS,
  QUALITY_FILTER_OPTIONS,
  QUALITY_CATEGORY_OPTIONS,
  ITEM_TYPES,
  PACK_ITEM_TYPES,
  toSlug,
} from "../../libs/compendium";

const INVOKER_WELLSPRINGS = ["Air", "Earth", "Fire", "Lightning", "Water"];

function SidebarSecondaryValue(type, item, t) {
  if (type === "weapons") return `${item.cost}z`;
  if (type === "custom-weapons") return `${item.cost || 300}z`;
  if (type === "armor") return `${item.cost}z`;
  if (type === "shields") return `${item.cost}z`;
  if (type === "accessories") return `${item.cost}z`;
  if (type === "qualities") return `${item.cost}z`;
  if (type === "spells") return `${item.cost?.amount} MP`;
  if (type === "player-spells")
    return item.cost?.amount != null
      ? `${item.cost.amount} MP`
      : (item.wellspring ?? "");
  if (type === "attacks") return t(item.range);
  if (type === "classes") return item.book ?? "";
  if (type === "heroics") return item.meta?.book ?? item.book ?? "";
  if (type === "mnemospheres") return `${item.class ?? ""} Lv.${item.lvl ?? 1}`;
  if (type === "hoplospheres") return `${item.cost ?? 0}z`;
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
  if (type === "mnemospheres") return t("Class");
  if (type === "hoplospheres") return t("Cost");
  if (type === "optionals") return t("Subtype");
  return t("Cost");
}
// Sidebar

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
  selectedWellspring = "",
  onWellspringChange,
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
  onOpenQuickCreate,
  restrictToTypes,
}) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isPackMode = selectedCompendium !== "official";
  const baseTypes = isPackMode ? PACK_ITEM_TYPES : ITEM_TYPES;
  const activeTypes = restrictToTypes?.length
    ? baseTypes.filter((x) => restrictToTypes.includes(x.key))
    : baseTypes;
  const selectedSpellClassKey = String(selectedSpellClass).trim().toLowerCase();
  const isPilotSelected = selectedSpellClassKey === "pilot";
  const isChanterSelected = selectedSpellClassKey === "chanter";
  const isInvokerSelected = selectedSpellClassKey === "invoker";
  const compactMultiAutocompleteSx = {
    "& .MuiOutlinedInput-root": {
      minHeight: 40,
      alignItems: "center",
    },
    "& .MuiAutocomplete-inputRoot": {
      flexWrap: "nowrap",
      pr: 4,
    },
    "& .MuiAutocomplete-tag": {
      maxWidth: 112,
      m: 0,
      mr: 0.5,
    },
    "& .MuiAutocomplete-input": {
      minWidth: 0,
    },
  };
  const selectMenuProps = {
    disableScrollLock: true,
    keepMounted: true,
    slotProps: {
      root: {
        sx: {
          zIndex: (theme) => theme.zIndex.modal + 3,
        },
      },
      paper: {
        sx: {
          zIndex: (theme) => theme.zIndex.modal + 3,
        },
      },
    },
  };
  const autocompleteOverlayProps = {
    disablePortal: false,
    slotProps: {
      popper: {
        sx: {
          zIndex: (theme) => theme.zIndex.modal + 3,
        },
      },
      paper: {
        sx: {
          zIndex: (theme) => theme.zIndex.modal + 3,
        },
      },
    },
  };

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
              MenuProps={selectMenuProps}
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
                MenuProps={selectMenuProps}
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
          </Box>
        )}

        {selectedType === "player-spells" && (
          <FormControl fullWidth size="small">
            <InputLabel>{t("Class")}</InputLabel>
            <Select
              value={selectedSpellClass}
              onChange={(e) => onSpellClassChange(e.target.value)}
              label={t("Class")}
              MenuProps={selectMenuProps}
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
          isPilotSelected &&
          typeof onModuleTypeChange === "function" && (
            <FormControl fullWidth size="small">
              <InputLabel>{t("Module Type")}</InputLabel>
              <Select
                value={selectedModuleType}
                onChange={(e) => onModuleTypeChange?.(e.target.value)}
                label={t("Module Type")}
                MenuProps={selectMenuProps}
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
          isChanterSelected &&
          typeof onMagichantSubtypeChange === "function" && (
            <FormControl fullWidth size="small">
              <InputLabel>{t("Chant Type")}</InputLabel>
              <Select
                value={selectedMagichantSubtype}
                onChange={(e) => onMagichantSubtypeChange?.(e.target.value)}
                label={t("Chant Type")}
                MenuProps={selectMenuProps}
              >
                <MenuItem value="">{t("All")}</MenuItem>
                <MenuItem value="key">{t("Key")}</MenuItem>
                <MenuItem value="tone">{t("Tone")}</MenuItem>
              </Select>
            </FormControl>
          )}

        {selectedType === "player-spells" && isInvokerSelected && (
          <FormControl fullWidth size="small">
            <InputLabel>{t("Wellspring")}</InputLabel>
            <Select
              value={selectedWellspring}
              onChange={(e) => onWellspringChange?.(e.target.value)}
              label={t("Wellspring")}
              MenuProps={selectMenuProps}
            >
              <MenuItem value="">{t("All")}</MenuItem>
              {INVOKER_WELLSPRINGS.map((wellspring) => (
                <MenuItem key={wellspring} value={wellspring}>
                  {t(wellspring)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {(selectedType === "classes" || selectedType === "heroics") && (
          <Autocomplete
            {...(isMobile ? autocompleteOverlayProps : {})}
            multiple
            limitTags={1}
            size="small"
            fullWidth
            sx={compactMultiAutocompleteSx}
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
            {...(isMobile ? autocompleteOverlayProps : {})}
            multiple
            limitTags={1}
            size="small"
            fullWidth
            sx={compactMultiAutocompleteSx}
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
            {...(isMobile ? autocompleteOverlayProps : {})}
            multiple
            limitTags={1}
            size="small"
            fullWidth
            sx={compactMultiAutocompleteSx}
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
                {...(isMobile ? autocompleteOverlayProps : {})}
                multiple
                limitTags={1}
                size="small"
                fullWidth
                sx={compactMultiAutocompleteSx}
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
            </Box>

            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
              <Autocomplete
                {...(isMobile ? autocompleteOverlayProps : {})}
                multiple
                limitTags={1}
                size="small"
                fullWidth
                sx={compactMultiAutocompleteSx}
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
            </Box>
          </>
        )}
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
                key={`${selectedType}-${idx}-${item.name ?? item.spellName}`}
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
// Card dispatcher

export const ItemCard = React.memo(function ItemCard({
  type,
  item,
  id,
  onHeaderClick,
  actionContent,
  imageMode = "slot",
  showImageToggle = false,
}) {
  const sharedProps = {
    item,
    id,
    onHeaderClick,
    actionContent,
    imageMode,
    showImageToggle,
  };
  switch (type) {
    case "weapons":
      return <SharedWeaponCard {...sharedProps} />;
    case "armor":
      return <SharedArmorCard {...sharedProps} />;
    case "shields":
      return <SharedShieldCard {...sharedProps} />;
    case "spells":
      return <SharedSpellCard {...sharedProps} />;
    case "player-spells":
      if (!item.spellType || item.spellType === "default") {
        return <SharedPlayerSpellCard {...sharedProps} />;
      } else if (item.spellType === "gamble") {
        return <SharedGambleSpellCard {...sharedProps} />;
      } else if (item.spellType === "gift") {
        return <SharedGiftCard {...sharedProps} />;
      } else if (item.spellType === "dance") {
        return <SharedDanceCard {...sharedProps} />;
      } else if (item.spellType === "therioform") {
        return <SharedTherioformCard {...sharedProps} />;
      } else if (item.spellType === "magichant") {
        return <SharedMagichantCard {...sharedProps} />;
      } else if (item.spellType === "symbol") {
        return <SharedSymbolCard {...sharedProps} />;
      } else if (item.spellType === "invocation") {
        return <SharedInvocationCard {...sharedProps} />;
      } else if (item.spellType === "magiseed") {
        return <SharedMagiseedCard {...sharedProps} />;
      } else if (item.spellType === "tinkerer-alchemy") {
        return <SharedAlchemyCard {...sharedProps} />;
      } else if (item.spellType === "tinkerer-infusion") {
        return <SharedInfusionCard {...sharedProps} />;
      } else if (item.spellType === "tinkerer-magitech") {
        return <SharedMagitechCard {...sharedProps} />;
      } else if (item.spellType === "cooking") {
        return <SharedCookingCard {...sharedProps} />;
      } else if (item.spellType === "pilot-vehicle") {
        return <SharedPilotVehicleCard {...sharedProps} />;
      } else if (
        item.spellType === "arcanist" ||
        item.spellType === "arcanist-rework"
      ) {
        return <SharedArcanumCard {...sharedProps} />;
      }
      return <SharedPlayerSpellCard {...sharedProps} />;
    case "attacks":
      return <SharedAttackCard {...sharedProps} />;
    case "qualities":
      return <SharedQualityCard {...sharedProps} />;
    case "classes":
      return <SharedClassCard {...sharedProps} />;
    case "heroics":
      return <SharedHeroicCard {...sharedProps} />;
    case "mnemospheres":
      return <SharedMnemosphereCard {...sharedProps} />;
    case "hoplospheres":
      return <SharedHoplosphereCard {...sharedProps} />;
    case "custom-weapons":
      return <SharedCustomWeaponCard {...sharedProps} />;
    case "accessories":
      return <SharedAccessoryCard {...sharedProps} />;
    case "special":
      return <SharedSpecialRuleCard {...sharedProps} />;
    case "actions":
      return <SharedActionCard {...sharedProps} />;
    case "optionals":
      return <SharedOptionalCard {...sharedProps} />;
    default:
      return null;
  }
});
// Main CompendiumViewer (full-page route)

function CompendiumViewer() {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [shareSnackOpen, setShareSnackOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainRef = useRef(null);

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
  const [newPackFuid, setNewPackFuid] = useState("");
  const [newPackFuidTouched, setNewPackFuidTouched] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [editClassItem, setEditClassItem] = useState(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [editingPackName, setEditingPackName] = useState("");
  const [editingPackFuid, setEditingPackFuid] = useState("");
  const [editingPackFuidTouched, setEditingPackFuidTouched] = useState(false);
  const [editingDescription, setEditingDescription] = useState("");
  const [editingAuthor, setEditingAuthor] = useState("");
  const [editingRequires, setEditingRequires] = useState([]);
  const [editingAutoRequires, setEditingAutoRequires] = useState([]);
  const [editingOptional, setEditingOptional] = useState([]);
  const [exportMeta, setExportMeta] = useState({
    version: "1.0.0",
    homepageUrl: "",
    manifestUrl: "",
    downloadUrl: "",
  });
  const [exporting, setExporting] = useState(false);
  const [manageModulesOpen, setManageModulesOpen] = useState(false);
  const [, setPendingNavPackId] = useState(null);

  useEffect(() => {
    ensurePersonalPack();
  }, [ensurePersonalPack]);

  const activePacks = useMemo(
    () => packs.filter((p) => p.active !== false),
    [packs],
  );
  const rawSelectedCompendium = searchParams.get("compendium") ?? "official";
  const selectedCompendium =
    rawSelectedCompendium === "official" ||
    activePacks.some((p) => p.id === rawSelectedCompendium)
      ? rawSelectedCompendium
      : "official";
  const activePack =
    selectedCompendium !== "official"
      ? (activePacks.find((p) => p.id === selectedCompendium) ?? null)
      : null;
  const activePackFuids = useMemo(
    () =>
      new Set(
        activePacks.map((p) => (p.fuid ? toSlug(p.fuid) : "")).filter(Boolean),
      ),
    [activePacks],
  );
  const normalizedNewPackFuid = toSlug(newPackFuid);
  const isNewPackFuidDuplicate =
    normalizedNewPackFuid.length > 0 &&
    activePackFuids.has(normalizedNewPackFuid);
  const normalizedEditingPackFuid = toSlug(editingPackFuid);
  const isEditingPackFuidDuplicate =
    normalizedEditingPackFuid.length > 0 &&
    activePacks.some(
      (p) =>
        p.id !== activePack?.id &&
        toSlug(p.fuid || "") === normalizedEditingPackFuid,
    );
  const dependencySuggestions = useMemo(() => {
    const installed = activePacks
      .map((p) => toSlug(p.fuid || p.name || ""))
      .filter(Boolean);
    const unique = Array.from(new Set(installed)).sort((a, b) =>
      a.localeCompare(b),
    );
    return ["official", ...unique.filter((v) => v !== "official")];
  }, [activePacks]);
  const mergedEditingRequires = useMemo(
    () =>
      Array.from(new Set([...editingRequires, ...editingAutoRequires])).sort(
        (a, b) => a.localeCompare(b),
      ),
    [editingRequires, editingAutoRequires],
  );

  // URL-backed filter values
  const selectedType = searchParams.get("type") ?? "weapons";
  const selectedSpellClass = searchParams.get("class") ?? "";
  const selectedModuleType = searchParams.get("moduleType") ?? "";
  const rawMagichantSubtype = searchParams.get("magichantSubtype") ?? "";
  const selectedWellspring = searchParams.get("wellspring") ?? "";
  const selectedMagichantSubtype =
    rawMagichantSubtype === "key" || rawMagichantSubtype === "tone"
      ? rawMagichantSubtype
      : "";
  const isPilotClassSelected =
    String(selectedSpellClass).toLowerCase() === "pilot";
  const isChanterClassSelected =
    String(selectedSpellClass).toLowerCase() === "chanter";
  const isInvokerClassSelected =
    String(selectedSpellClass).toLowerCase() === "invoker";
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

  // Cleanup stale magichantSubtype URL param
  useEffect(() => {
    const hasSubtypeParam = searchParams.has("magichantSubtype");
    if (!hasSubtypeParam) return;
    const shouldKeep =
      selectedType === "player-spells" &&
      isChanterClassSelected &&
      (selectedMagichantSubtype === "key" ||
        selectedMagichantSubtype === "tone");
    if (shouldKeep) return;
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

  // Lock page scroll while this route is mounted
  useEffect(() => {
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

  // Build filters + handlers objects that CompendiumBrowser expects
  const filters = {
    selectedType,
    selectedSpellClass,
    selectedModuleType,
    selectedMagichantSubtype,
    selectedWellspring,
    selectedBook,
    selectedQualityFilters,
    selectedQualityCategories,
    selectedHeroicClasses,
    selectedOptionalSubtypes,
    selectedCompendium,
    searchQuery,
    isPilotClassSelected,
    isChanterClassSelected,
    isInvokerClassSelected,
  };

  const urlBase = useCallback(
    () =>
      selectedCompendium !== "official"
        ? { compendium: selectedCompendium }
        : {},
    [selectedCompendium],
  );

  const handlers = useMemo(
    () => ({
      handleTypeChange: (type, { scrollRef } = {}) => {
        setSearchQuery("");
        setSelectedIdx(null);
        setSearchParams({ ...urlBase(), type });
        if (scrollRef?.current) scrollRef.current.scrollTop = 0;
      },
      handleSpellClassChange: (cls, { scrollRef } = {}) => {
        setSearchQuery("");
        setSelectedIdx(null);
        const newParams = {
          ...urlBase(),
          type: selectedType,
          ...(cls ? { class: cls } : {}),
        };
        if (String(cls).toLowerCase() === "pilot" && selectedModuleType)
          newParams.moduleType = selectedModuleType;
        if (String(cls).toLowerCase() === "chanter" && selectedMagichantSubtype)
          newParams.magichantSubtype = selectedMagichantSubtype;
        if (String(cls).toLowerCase() === "invoker" && selectedWellspring)
          newParams.wellspring = selectedWellspring;
        setSearchParams(newParams);
        if (scrollRef?.current) scrollRef.current.scrollTop = 0;
      },
      handleModuleTypeChange: (moduleType, { scrollRef } = {}) => {
        setSearchQuery("");
        setSelectedIdx(null);
        setSearchParams({
          ...urlBase(),
          type: selectedType,
          ...(selectedSpellClass ? { class: selectedSpellClass } : {}),
          ...(moduleType ? { moduleType } : {}),
        });
        if (scrollRef?.current) scrollRef.current.scrollTop = 0;
      },
      handleMagichantSubtypeChange: (magichantSubtype, { scrollRef } = {}) => {
        setSearchQuery("");
        setSelectedIdx(null);
        const safe =
          magichantSubtype === "key" || magichantSubtype === "tone"
            ? magichantSubtype
            : "";
        setSearchParams({
          ...urlBase(),
          type: selectedType,
          ...(selectedSpellClass ? { class: selectedSpellClass } : {}),
          ...(selectedModuleType ? { moduleType: selectedModuleType } : {}),
          ...(safe ? { magichantSubtype: safe } : {}),
        });
        if (scrollRef?.current) scrollRef.current.scrollTop = 0;
      },
      handleWellspringChange: (wellspring, { scrollRef } = {}) => {
        setSearchQuery("");
        setSelectedIdx(null);
        setSearchParams({
          ...urlBase(),
          type: selectedType,
          ...(selectedSpellClass ? { class: selectedSpellClass } : {}),
          ...(wellspring ? { wellspring } : {}),
        });
        if (scrollRef?.current) scrollRef.current.scrollTop = 0;
      },
      handleBookChange: (books, { scrollRef } = {}) => {
        setSearchQuery("");
        setSelectedIdx(null);
        const heroicClasses = searchParams.get("heroicClasses");
        const newParams = { ...urlBase(), type: selectedType };
        if (books.length > 0) newParams.book = books.join(",");
        if (heroicClasses) newParams.heroicClasses = heroicClasses;
        setSearchParams(newParams);
        if (scrollRef?.current) scrollRef.current.scrollTop = 0;
      },
      handleQualityFiltersChange: (filters, { scrollRef } = {}) => {
        setSearchQuery("");
        setSelectedIdx(null);
        const categories = searchParams.get("qualityCategories");
        const newParams = { ...urlBase(), type: selectedType };
        if (filters.length > 0) newParams.qualityFilters = filters.join(",");
        if (categories) newParams.qualityCategories = categories;
        setSearchParams(newParams);
        if (scrollRef?.current) scrollRef.current.scrollTop = 0;
      },
      handleQualityCategoriesChange: (categories, { scrollRef } = {}) => {
        setSearchQuery("");
        setSelectedIdx(null);
        const qFilters = searchParams.get("qualityFilters");
        const newParams = { ...urlBase(), type: selectedType };
        if (categories.length > 0)
          newParams.qualityCategories = categories.join(",");
        if (qFilters) newParams.qualityFilters = qFilters;
        setSearchParams(newParams);
        if (scrollRef?.current) scrollRef.current.scrollTop = 0;
      },
      handleHeroicClassesChange: (classes, { scrollRef } = {}) => {
        setSearchQuery("");
        setSelectedIdx(null);
        const book = searchParams.get("book");
        const newParams = { ...urlBase(), type: selectedType };
        if (classes.length > 0) newParams.heroicClasses = classes.join(",");
        if (book) newParams.book = book;
        setSearchParams(newParams);
        if (scrollRef?.current) scrollRef.current.scrollTop = 0;
      },
      handleOptionalSubtypesChange: (subtypes, { scrollRef } = {}) => {
        setSearchQuery("");
        setSelectedIdx(null);
        const book = searchParams.get("book");
        const newParams = { ...urlBase(), type: selectedType };
        if (subtypes.length > 0)
          newParams.optionalSubtypes = subtypes.join(",");
        if (book) newParams.book = book;
        setSearchParams(newParams);
        if (scrollRef?.current) scrollRef.current.scrollTop = 0;
      },
      handleCompendiumChange: (compendium, { scrollRef } = {}) => {
        if (compendium === "__manage_modules__") {
          setManageModulesOpen(true);
          return;
        }
        setSearchQuery("");
        setSelectedIdx(null);
        const base = compendium !== "official" ? { compendium } : {};
        setSearchParams({ ...base, type: selectedType });
        if (scrollRef?.current) scrollRef.current.scrollTop = 0;
      },
      handleItemClick: (
        item,
        idx,
        { isDesktop: _isDesktop, setDrawerOpen: _sd } = {},
      ) => {
        setSelectedIdx(idx);
        setSearchParams({
          ...urlBase(),
          type: selectedType,
          ...(selectedSpellClass ? { class: selectedSpellClass } : {}),
          ...(selectedModuleType ? { moduleType: selectedModuleType } : {}),
          ...(selectedMagichantSubtype
            ? { magichantSubtype: selectedMagichantSubtype }
            : {}),
          ...(selectedWellspring ? { wellspring: selectedWellspring } : {}),
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
      },
    }),
    [
      searchParams,
      setSearchParams,
      urlBase,
      selectedType,
      selectedSpellClass,
      selectedModuleType,
      selectedMagichantSubtype,
      selectedWellspring,
      selectedBook,
      selectedQualityFilters,
      selectedQualityCategories,
      selectedHeroicClasses,
      selectedOptionalSubtypes,
    ],
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

  const handleNewPack = useCallback(async () => {
    if (!newPackName.trim()) return;
    const fuid = toSlug(newPackFuid) || toSlug(newPackName) || undefined;
    const id = await createPack(newPackName.trim(), undefined, fuid);
    setNewPackName("");
    setNewPackFuid("");
    setNewPackFuidTouched(false);
    setPendingNavPackId(id);
    setNewPackDialogOpen(false);
  }, [newPackName, newPackFuid, createPack]);

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

  // Quickcreate subtype hint computed from active spell class
  const activeSpellCls = useMemo(() => {
    if (selectedType !== "player-spells" || !selectedSpellClass) return null;
    return classList.find((c) => c.name === selectedSpellClass) ?? null;
  }, [selectedType, selectedSpellClass]);
  const quickCreateInitialSubtype = useMemo(() => {
    if (selectedType !== "player-spells" || !activeSpellCls) return null;
    const spellClasses = activeSpellCls.benefits?.spellClasses ?? [];
    const nonDefault = spellClasses.find((sc) => sc !== "default");
    return nonDefault ?? (spellClasses.includes("default") ? "default" : null);
  }, [selectedType, activeSpellCls]);

  // Route-specific item actions (share, download, export, pack management)
  const renderItemActions = useCallback(
    (item, _idx, _selectedItem) => (
      <>
        <Tooltip title={t("Share URL")}>
          <IconButton size="small" onClick={handleShareUrl}>
            <ShareIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("Download as Image")}>
          {/* download is handled by CompendiumBrowser via showDownloadImage */}
          <span style={{ display: "none" }} />
        </Tooltip>
        <Export name={item.name} dataType={selectedType} data={item} />
        {selectedCompendium !== "official" &&
          selectedType === "classes" &&
          item._packItemId &&
          !activePack?.locked && (
            <Tooltip title={t("Edit Class")}>
              <IconButton
                size="small"
                onClick={() =>
                  setEditClassItem({ item, packItemId: item._packItemId })
                }
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
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
      </>
    ),
    [
      t,
      handleShareUrl,
      selectedType,
      selectedCompendium,
      activePack,
      handleRemoveFromPack,
    ],
  );

  return (
    <ThemeProvider theme={customTheme}>
      <Layout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 6em)",
            overflow: "hidden",
          }}
        >
          <CompendiumBrowser
            filters={filters}
            handlers={handlers}
            selectedIdx={selectedIdx}
            setSelectedIdx={setSelectedIdx}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            packs={activePacks}
            activePack={activePack}
            onNewPack={() => setNewPackDialogOpen(true)}
            onManagePack={() => {
              setEditingPackName(activePack?.name ?? "");
              setEditingPackFuid(
                activePack?.fuid ?? toSlug(activePack?.name ?? ""),
              );
              setEditingPackFuidTouched(false);
              setEditingDescription(activePack?.description ?? "");
              setEditingAuthor(activePack?.author ?? "");
              setEditingRequires(
                activePack?.requiresManual ?? activePack?.requires ?? [],
              );
              setEditingAutoRequires(activePack?.requiresAuto ?? []);
              setEditingOptional(activePack?.optional ?? []);
              setExportMeta({
                version: "1.0.0",
                homepageUrl: "",
                manifestUrl: "",
                downloadUrl: "",
              });
              setManageDialogOpen(true);
            }}
            onToggleLock={toggleLock}
            onOpenQuickCreate={() => setQuickCreateOpen(true)}
            showDownloadImage
            showShareUrl
            renderItemActions={renderItemActions}
            mainSx={{ flex: 1 }}
          />

          {/* Scroll-to-top FAB */}
          {showScrollTop && (
            <Tooltip title={t("Scroll to top")}>
              <Fab
                size="small"
                color="primary"
                onClick={() => {
                  if (mainRef.current) mainRef.current.scrollTop = 0;
                }}
                sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1200 }}
              >
                <KeyboardArrowUpIcon />
              </Fab>
            </Tooltip>
          )}
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
        lockedToViewerType={selectedType}
        initialSubtype={quickCreateInitialSubtype ?? undefined}
      />

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
        <DialogContent
          sx={{
            pt: "16px !important",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            label={t("Name")}
            value={newPackName}
            onChange={(e) => {
              const nextName = e.target.value;
              setNewPackName(nextName);
              if (!newPackFuidTouched) setNewPackFuid(toSlug(nextName));
            }}
            autoFocus
            fullWidth
            size="small"
            onKeyDown={(e) => e.key === "Enter" && handleNewPack()}
          />
          <TextField
            label="FUID"
            value={newPackFuid}
            onChange={(e) => {
              setNewPackFuid(e.target.value);
              setNewPackFuidTouched(true);
            }}
            fullWidth
            size="small"
            error={isNewPackFuidDuplicate}
            helperText={
              isNewPackFuidDuplicate
                ? "Another pack already uses this FUID"
                : "Used for cross-pack references"
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Copy FUID">
                      <span>
                        <IconButton
                          size="small"
                          disabled={!normalizedNewPackFuid}
                          onClick={async () => {
                            await navigator.clipboard.writeText(
                              normalizedNewPackFuid,
                            );
                            setShareSnackOpen(true);
                          }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Regenerate from name">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setNewPackFuid(toSlug(newPackName));
                          setNewPackFuidTouched(false);
                        }}
                      >
                        <AutorenewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setNewPackDialogOpen(false);
              setNewPackName("");
              setNewPackFuid("");
              setNewPackFuidTouched(false);
            }}
          >
            {t("Cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleNewPack}
            disabled={
              !newPackName.trim() ||
              !normalizedNewPackFuid ||
              isNewPackFuidDuplicate
            }
          >
            {t("Create")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Pack dialog */}
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
              onChange={(e) => {
                const nextName = e.target.value;
                setEditingPackName(nextName);
                if (!editingPackFuidTouched)
                  setEditingPackFuid(toSlug(nextName));
              }}
              fullWidth
              size="small"
            />
          )}
          {activePack && !activePack.isPersonal && (
            <TextField
              label="FUID"
              value={editingPackFuid}
              onChange={(e) => {
                setEditingPackFuid(e.target.value);
                setEditingPackFuidTouched(true);
              }}
              fullWidth
              size="small"
              error={isEditingPackFuidDuplicate}
              helperText={
                isEditingPackFuidDuplicate
                  ? "Another pack already uses this FUID"
                  : "Used for cross-pack references"
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Copy FUID">
                        <span>
                          <IconButton
                            size="small"
                            disabled={!normalizedEditingPackFuid}
                            onClick={async () => {
                              await navigator.clipboard.writeText(
                                normalizedEditingPackFuid,
                              );
                              setShareSnackOpen(true);
                            }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Regenerate from name">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingPackFuid(toSlug(editingPackName));
                            setEditingPackFuidTouched(false);
                          }}
                        >
                          <AutorenewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                },
              }}
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
          <Divider>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Dependencies
            </Typography>
          </Divider>
          <Autocomplete
            multiple
            freeSolo
            options={dependencySuggestions}
            value={mergedEditingRequires}
            onChange={(_event, values) => {
              const next = Array.from(
                new Set(values.map((v) => toSlug(String(v))).filter(Boolean)),
              );
              setEditingRequires(
                next.filter((dep) => !editingAutoRequires.includes(dep)),
              );
            }}
            renderValue={(value, getItemProps) =>
              value.map((option, index) => {
                const isSystem = editingAutoRequires.includes(option);
                const tagProps = getItemProps({ index });
                const { onDelete, ...safeTagProps } = tagProps;
                const chip = (
                  <Chip
                    {...safeTagProps}
                    label={isSystem ? `${option} (system)` : option}
                    size="small"
                    onDelete={isSystem ? undefined : onDelete}
                  />
                );
                return isSystem ? (
                  <Tooltip key={option} title="Required by referenced items">
                    {chip}
                  </Tooltip>
                ) : (
                  <React.Fragment key={option}>{chip}</React.Fragment>
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Requires"
                placeholder="author.pack-fuid"
                size="small"
                helperText="Hard dependencies"
              />
            )}
          />
          <Autocomplete
            multiple
            freeSolo
            options={dependencySuggestions}
            value={editingOptional}
            onChange={(_event, values) => {
              const next = Array.from(
                new Set(values.map((v) => toSlug(String(v))).filter(Boolean)),
              );
              setEditingOptional(next);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Optional"
                placeholder="author.pack-fuid"
                size="small"
                helperText="Soft dependencies"
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          {activePack && !activePack.isPersonal && (
            <Button
              color="error"
              disabled={exporting}
              onClick={async () => {
                await deletePack(activePack.id);
                setPendingNavPackId("official");
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
                (!activePack?.isPersonal &&
                  (!editingPackName.trim() ||
                    !normalizedEditingPackFuid ||
                    isEditingPackFuidDuplicate))
              }
              onClick={async () => {
                if (!activePack) return;
                const changes = {
                  ...(!activePack.isPersonal
                    ? {
                        name: editingPackName.trim(),
                        fuid: normalizedEditingPackFuid,
                      }
                    : {}),
                  description: editingDescription.trim() || undefined,
                  author: editingAuthor.trim() || undefined,
                  requiresManual: editingRequires,
                  optional: editingOptional,
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
          handlers.handleCompendiumChange(id);
        }}
      />
    </ThemeProvider>
  );
}

export default CompendiumViewer;
