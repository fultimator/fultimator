/**
 * Experimental two-column backpack layout.
 * Replaces the 5-column table (expand / name / col1 / col2 / actions) with:
 *   [name + stat subtitle line]   [actions]
 * Stats are shown inline under the name instead of in separate header columns.
 */
import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Casino,
  RadioButtonUnchecked,
  Add,
  Search as SearchIcon,
  Error as ErrorIcon,
  Message,
} from "@mui/icons-material";
import NotesMarkdown from "../../../../common/NotesMarkdown";
import { OpenBracket, CloseBracket } from "../../../../Bracket";
import {
  Martial,
  MeleeIcon,
  DistanceIcon,
  ArmorIcon,
  ShieldIcon,
  AccessoryIcon,
} from "../../../../icons";
import {
  SharedWeaponCard,
  SharedArmorCard,
  SharedShieldCard,
  SharedCustomWeaponCard,
  SharedAccessoryCard,
} from "../../../../shared/items";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import types from "../../../../../libs/types";
import attributes from "../../../../../libs/attributes";
import { calculateAttribute } from "../../../../../libs/playerCalculations";
import {
  deriveVehicleSlots,
  isTwoHandedEquipped,
} from "../../../../../libs/player/slots/equipmentSlots";
import { clearSlotAction } from "../../../../../libs/player/slots/loadoutActions";
import { normalizeWeaponLike } from "../../../../../libs/weaponNormalization";
import {
  prepareAccuracyCheck,
  rollAccuracyCheck,
  processAccuracyCheck,
  buildAccuracyCheckMessage,
} from "../../../../app-drawer/panels/chat/domain/accuracy-checks";
import {
  sendRollMessage,
  sendDisplayMessage,
} from "../../../../../hooks/useRollToChat";
import CompendiumViewerModal from "../../../../compendium/CompendiumViewerModal";
import ItemEditModal from "../../../../../forms/ui/ItemEditModal";
import CompactSphereInventory from "../playerSheet/compact/CompactSphereInventory";
import PcCompactLoadout from "../panels/PcCompactLoadout";
import SpellVehiclePanel from "../spells/SpellVehiclePanel";
// Helpers

function highlightMatch(text, query) {
  const source = text == null ? "" : String(text);
  const trimmed = query?.trim();
  if (!trimmed) return source;
  const safe = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return source.split(new RegExp(`(${safe})`, "ig")).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} style={{ backgroundColor: "yellow", padding: 0 }}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function highlightMarkdownText(markdown, query) {
  const source = markdown == null ? "" : String(markdown);
  const trimmed = query?.trim();
  if (!trimmed) return source;
  const safe = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return source.replace(new RegExp(`(${safe})`, "ig"), "<mark>$1</mark>");
}

function normalizeAttrKey(raw) {
  const key = String(raw || "").toLowerCase();
  if (key === "dex" || key === "dexterity") return "dexterity";
  if (key === "ins" || key === "insight") return "insight";
  if (key === "mig" || key === "might") return "might";
  if (key === "wlp" || key === "will" || key === "willpower")
    return "willpower";
  return "dexterity";
}

function asArray(v) {
  return Array.isArray(v) ? v : [];
}
// Stat subtitle

function StatSubtitle({ item, t }) {
  if (item.equipType === "weapon" || item.equipType === "custom-weapon") {
    const accuracy = item.accuracy ?? {};
    const damage = item.damage ?? {};
    const attr1 = normalizeAttrKey(accuracy.attr1);
    const attr2 = normalizeAttrKey(accuracy.attr2);
    const prec = accuracy.value ?? 0;
    const dmgVal = damage.value ?? 0;
    const dmgType = damage.type ?? "physical";
    return (
      <Typography
        sx={{
          fontSize: "0.68rem",
          color: "text.secondary",
          lineHeight: 1.3,
          mt: "1px",
          fontWeight: "bold",
        }}
      >
        <OpenBracket />
        {`${attributes[attr1]?.shortcaps ?? "DEX"}+${attributes[attr2]?.shortcaps ?? "MIG"}`}
        <CloseBracket />
        {prec !== 0 ? (prec > 0 ? "+" : "") + prec : ""}
        {"  "}
        <OpenBracket />
        {t("HR")}
        {dmgVal >= 0 ? "+" : ""}
        {dmgVal}
        <CloseBracket /> {types[dmgType]?.long ?? types.physical.long}
      </Typography>
    );
  }
  if (item.equipType === "armor") {
    const def = (item.def || 0) + (item.defModifier || 0);
    const mdef = (item.mdef || 0) + (item.mDefModifier || 0);
    const defStr = item.martial
      ? String(def)
      : def === 0
        ? t("DEX die")
        : `${t("DEX die")} +${def}`;
    const mdefStr = mdef === 0 ? t("INS die") : `${t("INS die")} +${mdef}`;
    return (
      <Typography
        sx={{
          fontSize: "0.68rem",
          color: "text.secondary",
          lineHeight: 1.3,
          mt: "1px",
          fontWeight: "bold",
        }}
      >
        {t("DEF")} {defStr}
        {" · "}
        {t("M.DEF")} {mdefStr}
      </Typography>
    );
  }
  if (item.equipType === "shield") {
    const def = (item.def || 0) + (item.defModifier || 0);
    const mdef = (item.mdef || 0) + (item.mDefModifier || 0);
    return (
      <Typography
        sx={{
          fontSize: "0.68rem",
          color: "text.secondary",
          lineHeight: 1.3,
          mt: "1px",
          fontWeight: "bold",
        }}
      >
        {t("DEF")} +{def}
        {" · "}
        {t("M.DEF")} +{mdef}
      </Typography>
    );
  }
  if (item.equipType === "accessory") {
    return (
      <Typography
        sx={{
          fontSize: "0.68rem",
          color: "text.secondary",
          lineHeight: 1.3,
          mt: "1px",
          fontWeight: "bold",
        }}
      >
        {item.cost}z
      </Typography>
    );
  }
  return null;
}
// Single item row

function ItemRow({
  item,
  player,
  isEditMode,
  searchQuery,
  handleEquipment,
  handleDiceRoll,
  handleEdit,
  checkIfEquippable,
  theme,
  t,
  onPreviewItem,
}) {
  const [descOpen, setDescOpen] = useState(false);

  const getDefaultUnarmedStrikeInfo = () => {
    const settings = player.settings ?? {};
    const defaultRef = settings.defaultUnarmedStrikeRef;
    const autoEquipEnabled = settings.autoEquipUnarmed ?? !!defaultRef;
    if (!defaultRef || !autoEquipEnabled) return null;
    const source =
      item.equipType === "custom-weapon" ? "customWeapons" : "weapons";
    const name =
      item.equipType === "custom-weapon" ? item.originalData?.name : item.name;
    return defaultRef.source === source && defaultRef.name === name
      ? { isDefault: true, settings }
      : null;
  };

  const slotMatches = (ref, source, name, index, sourceArr) => {
    if (!ref || ref.source !== source) return false;
    if (ref.index !== undefined) return ref.index === index;
    // name-only fallback: only match the first item with that name to avoid duplicate badges
    const firstIdx = (sourceArr ?? []).findIndex((it) => it.name === name);
    return firstIdx === index;
  };

  const getBadge = () => {
    const slots = player.equippedSlots ?? {};
    const settings = player.settings ?? {};
    const defaultRef = settings.defaultUnarmedStrikeRef;
    const idx = item.originalIndex;
    const eq0 = player.equipment?.[0];
    if (item.equipType === "weapon" || item.equipType === "custom-weapon") {
      const source =
        item.equipType === "custom-weapon" ? "customWeapons" : "weapons";
      const name =
        item.equipType === "custom-weapon"
          ? item.originalData?.name
          : item.name;
      const srcArr = eq0?.[source] ?? [];
      const isDefaultUnarmed =
        defaultRef && defaultRef.source === source && defaultRef.name === name;
      const autoEquipEnabled = settings.autoEquipUnarmed ?? !!defaultRef;
      if (isDefaultUnarmed && autoEquipEnabled) {
        const mE = !slots.mainHand,
          oE = !slots.offHand;
        if (mE && oE) return "M+O";
        if (mE) return "M";
        if (oE) return "O";
        return null;
      }
      if (slotMatches(slots.mainHand, source, name, idx, srcArr))
        return item.hands === 2 ||
          item.isTwoHand ||
          item.equipType === "custom-weapon"
          ? "M+O"
          : "M";
      if (slotMatches(slots.offHand, source, name, idx, srcArr)) return "O";
    } else if (item.equipType === "shield") {
      const srcArr = eq0?.shields ?? [];
      if (slotMatches(slots.mainHand, "shields", item.name, idx, srcArr))
        return "M";
      if (slotMatches(slots.offHand, "shields", item.name, idx, srcArr))
        return "O";
    } else if (item.equipType === "armor") {
      return slotMatches(slots.armor, "armor", item.name, idx, eq0?.armor ?? [])
        ? "E"
        : null;
    } else if (item.equipType === "accessory") {
      return slotMatches(
        slots.accessory,
        "accessories",
        item.name,
        idx,
        eq0?.accessories ?? [],
      )
        ? "E"
        : null;
    }
    return null;
  };

  const Icon =
    item.equipType === "weapon" || item.equipType === "custom-weapon"
      ? item.melee
        ? MeleeIcon
        : DistanceIcon
      : item.equipType === "armor"
        ? ArmorIcon
        : item.equipType === "shield"
          ? ShieldIcon
          : AccessoryIcon;

  return (
    <React.Fragment>
      {/* Card */}
      <Box
        onClick={() => {
          if (isEditMode) handleEdit(item);
          else if (item.quality || item.description) setDescOpen((v) => !v);
          else onPreviewItem?.(item);
        }}
        sx={{
          border: "1px solid",
          borderColor: theme.secondary,
          borderRadius: `${theme.panelRadius}px`,
          overflow: "hidden",
          cursor: "pointer",
          transition: "border-color 0.15s ease",
          "&:hover": { borderColor: theme.primary },
        }}
      >
        {/* Card body: name + subtitle + actions row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: "6px",
            py: "4px",
          }}
        >
          {/* Name + subtitle */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.85rem",
                  lineHeight: 1.3,
                }}
                noWrap
              >
                {highlightMatch(t(item.name), searchQuery)}
              </Typography>
              {item.martial && <Martial />}
            </Box>
            <StatSubtitle item={item} t={t} />
          </Box>

          {/* Actions */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              width: "56px",
              minWidth: "56px",
              maxWidth: "56px",
              gap: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip
              title={checkIfEquippable(item) ? t("Equip") : t("Not proficient")}
              arrow
            >
              {(() => {
                const badge = getBadge();
                const btn = (
                  <IconButton
                    size="small"
                    sx={{ p: 0, width: 28, height: 28 }}
                    onClick={(e) => handleEquipment(item, e)}
                    disabled={!!getDefaultUnarmedStrikeInfo()}
                  >
                    {badge !== null ? (
                      <Icon sx={{ fontSize: "1.15rem" }} />
                    ) : !checkIfEquippable(item) ? (
                      <ErrorIcon
                        sx={{ fontSize: "1.15rem", color: "error.main" }}
                      />
                    ) : (
                      <RadioButtonUnchecked sx={{ fontSize: "1.35rem" }} />
                    )}
                  </IconButton>
                );
                return badge !== null ? (
                  <Badge
                    badgeContent={badge}
                    color="primary"
                    sx={{
                      width: 28,
                      height: 28,
                      flexShrink: 0,
                      "& .MuiBadge-badge": {
                        fontSize: "0.55rem",
                        height: 11,
                        minWidth: 11,
                        p: 0,
                        top: 1,
                        right: 1,
                        transform: "none",
                      },
                    }}
                  >
                    {btn}
                  </Badge>
                ) : (
                  btn
                );
              })()}
            </Tooltip>
            {(item.equipType === "weapon" ||
              item.equipType === "custom-weapon") && (
              <IconButton
                size="small"
                sx={{ p: 0, width: 28, height: 28 }}
                onClick={() => handleDiceRoll(item)}
              >
                <Casino sx={{ fontSize: "1.15rem" }} />
              </IconButton>
            )}
            {item.equipType !== "weapon" &&
              item.equipType !== "custom-weapon" && (
                <Tooltip title={t("Send to Chat")} arrow>
                  <IconButton
                    size="small"
                    sx={{ p: 0, width: 28, height: 28 }}
                    onClick={() => {
                      const tags = [];
                      if (item.equipType === "armor") {
                        const def = item.def + (item.defModifier || 0);
                        const mdef = item.mdef + (item.mDefModifier || 0);
                        const init = item.init + (item.initModifier || 0);
                        tags.push(
                          `DEF: ${item.martial ? def : def === 0 ? t("DEX die") : `${t("DEX die")} + ${def}`}`,
                        );
                        tags.push(
                          `M.DEF: ${mdef === 0 ? t("INS die") : `${t("INS die")} + ${mdef}`}`,
                        );
                        if (init !== 0)
                          tags.push(`Init ${init > 0 ? "+" : ""}${init}`);
                      } else if (item.equipType === "shield") {
                        const def = item.def + (item.defModifier || 0);
                        const mdef = item.mdef + (item.mDefModifier || 0);
                        const init = item.initModifier || 0;
                        tags.push(`DEF +${def}`);
                        tags.push(`M.DEF +${mdef}`);
                        if (init !== 0)
                          tags.push(`Init ${init > 0 ? "+" : ""}${init}`);
                      }
                      sendDisplayMessage("item", t(item.name), {
                        speaker: player?.info?.name || player?.name || "",
                        tags,
                        description:
                          item.quality || item.description || undefined,
                      });
                    }}
                  >
                    <Message sx={{ fontSize: "1.15rem" }} />
                  </IconButton>
                </Tooltip>
              )}
          </Box>
        </Box>

        {/* Inline description */}
        {(item.quality || item.description) &&
          (descOpen || !!searchQuery?.trim()) && (
            <Box
              sx={{
                px: 1.5,
                py: 0.75,
                bgcolor: "rgba(0,0,0,0.03)",
                borderTop: "1px solid",
                borderColor: theme.secondary,
              }}
            >
              <NotesMarkdown compact>
                {highlightMarkdownText(
                  t(item.quality || item.description || ""),
                  searchQuery,
                )}
              </NotesMarkdown>
            </Box>
          )}
      </Box>
    </React.Fragment>
  );
}
// Transforming weapon pair

function TransformingWeaponPair({
  item,
  player,
  isEditMode,
  searchQuery,
  handleEquipment,
  handleDiceRoll,
  handleSwapForm,
  handleEdit,
  checkIfEquippable,
  theme,
  t,
  onPreviewItem,
}) {
  const [primaryDescOpen, setPrimaryDescOpen] = useState(false);
  const [secondaryDescOpen, setSecondaryDescOpen] = useState(false);
  const isPrimaryActive = (item.activeForm ?? "primary") === "primary";
  const cwName = item.originalData?.name;
  const slots = player.equippedSlots ?? {};
  const isEquipped =
    slots.mainHand?.source === "customWeapons" &&
    slots.mainHand?.name === cwName;

  const renderFormCard = (
    form,
    isActive,
    onInactiveClick,
    descOpen,
    setDescOpen,
  ) => {
    const Icon = form.melee ? MeleeIcon : DistanceIcon;

    return (
      <Box
        onClick={() => {
          if (!isActive) {
            onInactiveClick?.();
            return;
          }
          if (isEditMode) handleEdit(item);
          else if (form.quality) setDescOpen((v) => !v);
          else onPreviewItem?.(form);
        }}
        sx={{
          flex: 1,
          minWidth: 0,
          border: "1px solid",
          borderColor: theme.secondary,
          borderRadius: `${theme.panelRadius}px`,
          overflow: "hidden",
          opacity: isActive ? 1 : 0.4,
          cursor: "pointer",
          transition: "opacity 0.25s ease, border-color 0.15s ease",
          "&:hover": { borderColor: theme.primary },
        }}
      >
        {/* Card body */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: "6px",
            py: "4px",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.85rem",
                  lineHeight: 1.3,
                }}
                noWrap
              >
                {highlightMatch(t(form.name), searchQuery)}
              </Typography>
              {form.martial && <Martial />}
            </Box>
            <StatSubtitle item={form} t={t} />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              width: "56px",
              minWidth: "56px",
              maxWidth: "56px",
              gap: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isActive && (
              <Tooltip
                title={
                  checkIfEquippable(form) ? t("Equip") : t("Not proficient")
                }
                arrow
              >
                <IconButton
                  size="small"
                  sx={{ p: 0, width: 28, height: 28 }}
                  onClick={(e) => handleEquipment(form, e)}
                >
                  {isEquipped ? (
                    <Icon sx={{ fontSize: "1.15rem" }} />
                  ) : !checkIfEquippable(form) ? (
                    <ErrorIcon
                      sx={{ fontSize: "1.15rem", color: "error.main" }}
                    />
                  ) : (
                    <RadioButtonUnchecked sx={{ fontSize: "1.35rem" }} />
                  )}
                </IconButton>
              </Tooltip>
            )}
            {isActive && (
              <IconButton
                size="small"
                sx={{ p: 0, width: 28, height: 28 }}
                onClick={() => handleDiceRoll(form)}
              >
                <Casino sx={{ fontSize: "1.15rem" }} />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Inline description */}
        {form.quality && (descOpen || !!searchQuery?.trim()) && (
          <Box
            sx={{
              px: 1.5,
              py: 0.75,
              bgcolor: "rgba(0,0,0,0.03)",
              borderTop: "1px solid",
              borderColor: theme.secondary,
            }}
          >
            <NotesMarkdown compact>
              {highlightMarkdownText(t(form.quality), searchQuery)}
            </NotesMarkdown>
          </Box>
        )}
      </Box>
    );
  };

  const swapFn = () => handleSwapForm(item.primaryForm);

  return (
    <Box
      sx={{
        gridColumn: "1 / -1",
        display: "flex",
        alignItems: "stretch",
        gap: "4px",
      }}
    >
      {renderFormCard(
        item.primaryForm,
        isPrimaryActive,
        swapFn,
        primaryDescOpen,
        setPrimaryDescOpen,
      )}
      {renderFormCard(
        item.secondaryForm,
        !isPrimaryActive,
        swapFn,
        secondaryDescOpen,
        setSecondaryDescOpen,
      )}
    </Box>
  );
}
// Section

function Section({
  group,
  children,
  isEditMode,
  isMainTab,
  onAdd,
  onCompendium,
  t,
  theme,
}) {
  return (
    <Paper sx={{ mb: 1, overflow: "hidden" }} elevation={0} variant="outlined">
      {/* Header bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          pl: "46px",
          pr: "6px",
          pt: "2.8px",
          pb: "2.8px",
          background: theme.primary,
        }}
      >
        <Typography
          sx={{
            flex: 1,
            color: "#fff",
            fontFamily: "Antonio",
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            textTransform: "uppercase",
          }}
        >
          {group.label}
        </Typography>
        {isEditMode && !isMainTab && (
          <Box sx={{ display: "flex", gap: 0.25 }}>
            <Tooltip title={`${t("Add")} ${group.label}`}>
              <IconButton
                size="small"
                sx={{ p: "2px", color: "#fff" }}
                onClick={onAdd}
              >
                <Add sx={{ fontSize: "1.15rem" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("Search Compendium")}>
              <IconButton
                size="small"
                sx={{ p: "2px", color: "#fff" }}
                onClick={onCompendium}
              >
                <SearchIcon sx={{ fontSize: "1.15rem" }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
      {/* 2-column card grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: "4px",
          p: "4px",
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}
// Main export

export default function BackpackTab({
  player,
  setPlayer,
  isEditMode = false,
  isMainTab = false,
  searchQuery = "",
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [compendiumType, setCompendiumType] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSource, setEditSource] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editItemData, setEditItemData] = useState(null);

  const isTechnospheres =
    player?.settings?.optionalRules?.technospheres ?? false;

  // ---- skill helpers ----
  const getSkillLevel = (skillName) =>
    player.classes
      .flatMap((c) => c.skills)
      .filter((s) => s.specialSkill === skillName)
      .reduce((acc, s) => acc + s.currentLvl, 0);

  const defensiveMasteryBonus = getSkillLevel("Defensive Mastery");
  const meleeMasteryModifier = getSkillLevel("Melee Weapon Mastery");
  const rangedMasteryModifier = getSkillLevel("Ranged Weapon Mastery");

  const hasDualShieldBearer = player.classes.some((cls) =>
    cls.skills.some(
      (s) => s.specialSkill === "Dual Shieldbearer" && s.currentLvl === 1,
    ),
  );

  const twinShields = useMemo(
    () => ({
      name: "Twin Shields",
      category: "Brawling",
      melee: true,
      ranged: false,
      type: "physical",
      hands: 2,
      att1: "might",
      att2: "might",
      martial: false,
      quality: t(
        "Deals extra damage equal to your【 **SL**】in **defensive mastery**.",
      ),
      cost: 0,
      damage: { value: 5 + defensiveMasteryBonus, type: "physical" },
      accuracy: { attr1: "might", attr2: "might", value: 0 },
      prec: 0,
      isEquipped: true,
    }),
    [defensiveMasteryBonus, t],
  );

  const inv = player.equipment?.[0];

  const formatCustomWeapon = (cw, forceSecondary = null) => {
    const isTransforming = asArray(cw.customizations).some(
      (c) => c.name === "weapon_customization_transforming",
    );
    const isSecondary =
      forceSecondary !== null ? forceSecondary : cw.activeForm === "secondary";
    const name = isSecondary
      ? cw.secondWeaponName || `${cw.name} (Transforming)`
      : cw.name;
    const accuracy = isSecondary
      ? (cw.secondAccuracy ?? cw.accuracy)
      : cw.accuracy;
    const damage = isSecondary ? (cw.secondDamage ?? cw.damage) : cw.damage;
    const category = isSecondary ? cw.secondSelectedCategory : cw.category;
    const quality = isSecondary ? cw.secondQuality : cw.quality;
    const martialCustomizations = [
      "weapon_customization_quick",
      "weapon_customization_magicdefenseboost",
      "weapon_customization_powerful",
    ];
    const customizations = isSecondary
      ? asArray(cw.secondCurrentCustomizations)
      : asArray(cw.customizations);
    const isMartial = customizations.some((c) =>
      martialCustomizations.includes(c.name),
    );
    return {
      name,
      category,
      accuracy,
      damage,
      quality,
      att1: accuracy?.attr1 || "dexterity",
      att2: accuracy?.attr2 || "might",
      prec: accuracy?.value ?? 0,
      type: damage?.type || "physical",
      hands: 2,
      melee:
        (isSecondary ? cw.secondSelectedRange : cw.range) ===
        "weapon_range_melee",
      ranged:
        (isSecondary ? cw.secondSelectedRange : cw.range) ===
        "weapon_range_ranged",
      martial: isMartial,
      cost: cw.cost || 300,
      isEquipped: cw.isEquipped,
      isCustomWeapon: true,
      isTransforming,
      isSecondaryForm: isSecondary,
      originalData: cw,
    };
  };

  const allEquipment = useMemo(() => {
    const items = [];
    if (!inv) return items;
    (inv.weapons || []).forEach((w, i) => {
      const isUnarmed =
        w.name === "Unarmed Strike" || w.base?.name === "Unarmed Strike";
      if (!isTechnospheres || isUnarmed)
        items.push({ ...w, equipType: "weapon", originalIndex: i });
    });
    (inv.customWeapons || []).forEach((cw, i) => {
      const isTransforming = asArray(cw.customizations).some(
        (c) => c.name === "weapon_customization_transforming",
      );
      if (isTransforming) {
        items.push({
          equipType: "transforming-pair",
          originalIndex: i,
          originalData: cw,
          primaryForm: {
            ...formatCustomWeapon(cw, false),
            equipType: "custom-weapon",
            originalIndex: i,
          },
          secondaryForm: {
            ...formatCustomWeapon(cw, true),
            equipType: "custom-weapon",
            originalIndex: i,
          },
          activeForm: cw.activeForm ?? "primary",
          isEquipped: cw.isEquipped,
          name: cw.name,
        });
      } else {
        items.push({
          ...formatCustomWeapon(cw),
          equipType: "custom-weapon",
          originalIndex: i,
        });
      }
    });
    if (!isTechnospheres)
      (inv.shields || []).forEach((s, i) =>
        items.push({ ...s, equipType: "shield", originalIndex: i }),
      );
    (inv.armor || []).forEach((a, i) =>
      items.push({ ...a, equipType: "armor", originalIndex: i }),
    );
    (inv.accessories || []).forEach((a, i) =>
      items.push({ ...a, equipType: "accessory", originalIndex: i }),
    );
    return items;
  }, [inv, isTechnospheres]);

  const equippedShields = useMemo(
    () =>
      allEquipment.filter((it) => it.equipType === "shield" && it.isEquipped),
    [allEquipment],
  );

  const filteredItems = useMemo(() => {
    let items = [...allEquipment];
    if (isMainTab) {
      items = items.filter((it) => it.isEquipped);
      if (hasDualShieldBearer && equippedShields.length >= 2)
        items.push({
          ...twinShields,
          equipType: "weapon",
          isTwinShields: true,
        });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((it) => {
        if (it.equipType === "transforming-pair") {
          return (
            t(it.primaryForm.name).toLowerCase().includes(q) ||
            t(it.secondaryForm.name).toLowerCase().includes(q) ||
            t(it.primaryForm.quality || "")
              .toLowerCase()
              .includes(q) ||
            t(it.secondaryForm.quality || "")
              .toLowerCase()
              .includes(q)
          );
        }
        return (
          t(it.name).toLowerCase().includes(q) ||
          t(it.quality || "")
            .toLowerCase()
            .includes(q) ||
          t(it.category || "")
            .toLowerCase()
            .includes(q)
        );
      });
    }
    return items;
  }, [
    allEquipment,
    isMainTab,
    searchQuery,
    hasDualShieldBearer,
    equippedShields,
    twinShields,
    t,
  ]);

  const groupedItems = useMemo(() => {
    const groups = [
      ...(!isTechnospheres
        ? [
            {
              label: t("Weapons"),
              types: ["weapon"],
              key: "weapons",
              compendium: "weapons",
            },
          ]
        : []),
      {
        label: t("Custom Weapons"),
        types: ["custom-weapon"],
        key: "customWeapons",
        compendium: "custom-weapons",
      },
      ...(!isTechnospheres
        ? [
            {
              label: t("Shields"),
              types: ["shield"],
              key: "shields",
              compendium: "shields",
            },
          ]
        : []),
      {
        label: t("Armor"),
        types: ["armor"],
        key: "armor",
        compendium: "armor",
      },
      {
        label: t("Accessories"),
        types: ["accessory"],
        key: "accessories",
        compendium: "accessories",
      },
    ];
    return groups
      .map((g) => ({
        ...g,
        items: filteredItems.filter(
          (it) =>
            g.types.includes(it.equipType) ||
            (it.equipType === "transforming-pair" && g.key === "customWeapons"),
        ),
      }))
      .filter((g) => g.items.length > 0 || (isEditMode && !isMainTab));
  }, [filteredItems, isEditMode, isMainTab, isTechnospheres, t]);

  // ---- modifiers ----
  const equippedArmorItems = allEquipment.filter(
    (it) => it.equipType === "armor" && it.isEquipped,
  );
  const equippedAccessoryItems = allEquipment.filter(
    (it) => it.equipType === "accessory" && it.isEquipped,
  );

  const precMeleeModifier =
    (player.modifiers?.meleePrec || 0) +
    (equippedArmorItems[0]?.modifiers?.accuracy ?? 0) +
    equippedShields.reduce((s, x) => s + (x.modifiers?.accuracy ?? 0), 0) +
    equippedAccessoryItems.reduce(
      (s, x) => s + (x.modifiers?.accuracy ?? 0),
      0,
    ) +
    meleeMasteryModifier;

  const precRangedModifier =
    (player.modifiers?.rangedPrec || 0) +
    (equippedArmorItems[0]?.modifiers?.accuracy ?? 0) +
    equippedShields.reduce((s, x) => s + (x.modifiers?.accuracy ?? 0), 0) +
    equippedAccessoryItems.reduce(
      (s, x) => s + (x.modifiers?.accuracy ?? 0),
      0,
    ) +
    rangedMasteryModifier;

  const damageMeleeModifier =
    (equippedArmorItems[0]?.damageMeleeModifier || 0) +
    equippedShields.reduce((s, x) => s + (x.damageMeleeModifier || 0), 0) +
    equippedAccessoryItems.reduce(
      (s, x) => s + (x.damageMeleeModifier || 0),
      0,
    );

  const damageRangedModifier =
    (equippedArmorItems[0]?.damageRangedModifier || 0) +
    equippedShields.reduce((s, x) => s + (x.damageRangedModifier || 0), 0) +
    equippedAccessoryItems.reduce(
      (s, x) => s + (x.damageRangedModifier || 0),
      0,
    );

  const currDex = calculateAttribute(
    player,
    player.attributes.dexterity?.base,
    ["slow", "enraged"],
    ["dexUp"],
    6,
    12,
  );
  const currInsight = calculateAttribute(
    player,
    player.attributes.insight?.base,
    ["dazed", "enraged"],
    ["insUp"],
    6,
    12,
  );
  const currMight = calculateAttribute(
    player,
    player.attributes.might?.base,
    ["weak", "poisoned"],
    ["migUp"],
    6,
    12,
  );
  const currWillpower = calculateAttribute(
    player,
    player.attributes.willpower?.base,
    ["shaken", "poisoned"],
    ["wlpUp"],
    6,
    12,
  );
  const attributeMap = {
    dexterity: currDex,
    insight: currInsight,
    might: currMight,
    willpower: currWillpower,
  };

  // ---- equip helpers ----
  const patchInv = (p, source, updater) => {
    const eq0 = {
      ...(p.equipment?.[0] ?? {}),
      [source]: updater(p.equipment?.[0]?.[source] ?? []),
    };
    return {
      ...p,
      equipment: p.equipment ? [eq0, ...p.equipment.slice(1)] : [eq0],
    };
  };

  const equipToSlot = (source, itemName, itemIndex, slot, isTwoHand) => {
    if (slot === "offHand") {
      const mainRef = player.equippedSlots?.mainHand;
      if (mainRef) {
        if (mainRef.source === "customWeapons") return;
        const inv0 = player.equipment?.[0];
        const mainWeapon =
          mainRef.index !== undefined
            ? inv0?.weapons?.[mainRef.index]
            : inv0?.weapons?.find((w) => w.name === mainRef.name);
        if (mainWeapon?.hands === 2 || mainWeapon?.isTwoHand) return;
      }
    }
    const unequipRef = (p, ref) => {
      if (!ref) return p;
      return patchInv(p, ref.source, (arr) =>
        arr.map((it, idx) => {
          const match =
            ref.index !== undefined ? idx === ref.index : it.name === ref.name;
          return match ? { ...it, isEquipped: false } : it;
        }),
      );
    };
    let updated = unequipRef(player, player.equippedSlots?.[slot]);
    if (isTwoHand && slot === "mainHand")
      updated = unequipRef(updated, updated.equippedSlots?.offHand);
    updated = patchInv(updated, source, (arr) =>
      arr.map((it, idx) => {
        const match =
          itemIndex !== undefined ? idx === itemIndex : it.name === itemName;
        return match ? { ...it, isEquipped: true } : it;
      }),
    );
    const prevSlots = updated.equippedSlots ?? {
      mainHand: null,
      offHand: null,
      armor: null,
      accessory: null,
    };
    setPlayer({
      ...updated,
      equippedSlots: {
        ...prevSlots,
        [slot]: { source, name: itemName, index: itemIndex },
        ...(isTwoHand && slot === "mainHand" ? { offHand: null } : {}),
      },
      vehicleSlots: deriveVehicleSlots(updated),
    });
  };

  const unequipItem = (source, itemName) => {
    const slots = player.equippedSlots ?? {};
    const slotKey = Object.keys(slots).find(
      (k) => slots[k]?.source === source && slots[k]?.name === itemName,
    );
    if (slotKey) setPlayer((prev) => clearSlotAction(prev, slotKey));
    else {
      const updated = patchInv(player, source, (arr) =>
        arr.map((it) =>
          it.name === itemName ? { ...it, isEquipped: false } : it,
        ),
      );
      setPlayer({ ...updated, vehicleSlots: deriveVehicleSlots(updated) });
    }
  };

  const [slotMenuAnchor, setSlotMenuAnchor] = useState(null);
  const [slotMenuWeapon, setSlotMenuWeapon] = useState(null);
  const [shieldMenuAnchor, setShieldMenuAnchor] = useState(null);
  const [shieldMenuItem, setShieldMenuItem] = useState(null);
  const [shieldEquipWarningOpen, setShieldEquipWarningOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const handleWeaponSlotSelect = (slot) => {
    if (slotMenuWeapon)
      equipToSlot(
        "weapons",
        slotMenuWeapon.name,
        slotMenuWeapon.index,
        slot,
        false,
      );
    setSlotMenuAnchor(null);
    setSlotMenuWeapon(null);
  };

  const handleShieldSlotSelect = (slot) => {
    if (shieldMenuItem)
      equipToSlot(
        "shields",
        shieldMenuItem.name,
        shieldMenuItem.index,
        slot,
        false,
      );
    setShieldMenuAnchor(null);
    setShieldMenuItem(null);
  };

  const checkIfEquippable = (item) => {
    if (!item.martial) return true;
    const isTechStandard =
      player.settings?.optionalRules?.technospheres &&
      ["standard", "hoplospheres"].includes(
        player.settings?.optionalRules?.technospheresVariant ?? "standard",
      );
    if (
      isTechStandard &&
      (item.equipType === "weapon" || item.equipType === "custom-weapon")
    )
      return true;
    return player.classes.some((cls) => {
      const m = cls.benefits.martials;
      if (!m) return false;
      if (
        (item.equipType === "weapon" || item.equipType === "custom-weapon") &&
        ((item.melee && m.melee) || (item.ranged && m.ranged))
      )
        return true;
      if (item.equipType === "armor" && m.armor) return true;
      if (item.equipType === "shield" && m.shield) return true;
      return false;
    });
  };

  const handleEquipment = (item, event) => {
    if (!setPlayer || item.isTwinShields) return;
    const eq0 = player.equipment?.[0];
    if (item.equipType === "custom-weapon") {
      const cw = item.originalData;
      const cwIndex = eq0?.customWeapons?.findIndex((w) => w === cw) ?? -1;
      if (cw.isEquipped) unequipItem("customWeapons", cw.name);
      else
        equipToSlot(
          "customWeapons",
          cw.name,
          cwIndex >= 0 ? cwIndex : undefined,
          "mainHand",
          true,
        );
      return;
    }
    const source =
      item.equipType === "weapon"
        ? "weapons"
        : item.equipType === "shield"
          ? "shields"
          : item.equipType === "armor"
            ? "armor"
            : "accessories";
    const arr = eq0?.[source] ?? [];
    const idx =
      item.originalIndex !== undefined
        ? item.originalIndex
        : arr.findIndex((it) => it.name === item.name);
    if (idx === -1) return;
    const invItem = arr[idx];
    if (invItem.isEquipped) {
      unequipItem(source, invItem.name);
    } else {
      if (item.equipType === "shield") {
        if (isTwoHandedEquipped(player) && !checkIfEquippable(item)) {
          setShieldEquipWarningOpen(true);
          return;
        }
        if (hasDualShieldBearer && event) {
          setShieldMenuAnchor({ top: event.clientY, left: event.clientX });
          setShieldMenuItem({ name: invItem.name, index: idx });
        } else equipToSlot("shields", invItem.name, idx, "offHand", false);
      } else if (item.equipType === "armor") {
        equipToSlot("armor", invItem.name, idx, "armor", false);
      } else if (item.equipType === "weapon") {
        const isTwoHand = invItem.hands === 2 || invItem.isTwoHand;
        if (isTwoHand)
          equipToSlot("weapons", invItem.name, idx, "mainHand", true);
        else if (event) {
          setSlotMenuAnchor({ top: event.clientY, left: event.clientX });
          setSlotMenuWeapon({ name: invItem.name, index: idx });
        } else {
          const slots = player.equippedSlots ?? {};
          const slot = !slots.mainHand
            ? "mainHand"
            : !slots.offHand
              ? "offHand"
              : null;
          if (slot) equipToSlot("weapons", invItem.name, idx, slot, false);
        }
      } else if (item.equipType === "accessory") {
        equipToSlot("accessories", invItem.name, idx, "accessory", false);
      }
    }
  };

  const handleSwapForm = (item) => {
    if (!setPlayer || !item.originalData) return;
    setPlayer((prev) => {
      const cwList = prev.equipment?.[0]?.customWeapons ?? [];
      const idx = cwList.findIndex((w) => w === item.originalData);
      if (idx === -1) return prev;
      return {
        ...prev,
        equipment: [
          {
            ...prev.equipment[0],
            customWeapons: cwList.map((cw, i) =>
              i === idx
                ? {
                    ...cw,
                    activeForm:
                      cw.activeForm === "secondary" ? "primary" : "secondary",
                  }
                : cw,
            ),
          },
          ...(prev.equipment?.slice(1) ?? []),
        ],
      };
    });
  };

  const handleDiceRoll = (weapon) => {
    const attr1 = normalizeAttrKey(weapon.accuracy?.attr1);
    const attr2 = normalizeAttrKey(weapon.accuracy?.attr2);
    const isRanged = !weapon.melee;
    const precModifier = isRanged ? precRangedModifier : precMeleeModifier;
    const damageModifier = isRanged
      ? damageRangedModifier
      : damageMeleeModifier;
    const intent = prepareAccuracyCheck({
      arg: weapon.name || "",
      name: weapon.name || "",
      attr1,
      attr2,
      accuracyBonus: (weapon.accuracy?.value ?? 0) + precModifier,
      baseDamage: (weapon.damage?.value ?? 0) + damageModifier,
      damageType: weapon.damage?.type ?? "physical",
      accuracyDefense: weapon.accuracy?.defense ?? "def",
      hands: weapon.hands,
      category: weapon.category,
      range: isRanged ? "ranged" : "melee",
    });
    const dieSizes = {
      primary: attributeMap[attr1] ?? currDex,
      secondary: attributeMap[attr2] ?? currMight,
    };
    const rolls = rollAccuracyCheck(dieSizes);
    const result = processAccuracyCheck(
      intent,
      rolls,
      dieSizes,
      player?.info?.name || player?.name || "",
    );
    sendRollMessage(buildAccuracyCheckMessage(result));
  };

  const SOURCE_TO_ITEM_TYPE = {
    weapons: "weapon",
    customWeapons: "customWeapon",
    shields: "shield",
    armor: "armor",
    accessories: "accessory",
  };

  const handleEdit = (item) => {
    if (!isEditMode) return;
    const source =
      item.equipType === "weapon"
        ? "weapons"
        : item.equipType === "custom-weapon"
          ? "customWeapons"
          : item.equipType === "shield"
            ? "shields"
            : item.equipType === "armor"
              ? "armor"
              : "accessories";
    const rawItem =
      item.originalData ??
      player.equipment?.[0]?.[source]?.[item.originalIndex];
    setEditSource(source);
    setEditIndex(item.originalIndex ?? null);
    setEditItemData(rawItem ?? null);
    setEditDialogOpen(true);
  };

  const saveEditDialog = (savedItem) => {
    if (!editSource || editIndex == null) return;
    setPlayer((prev) => {
      const eq0 = {
        ...(prev.equipment?.[0] ?? {}),
        [editSource]: (prev.equipment?.[0]?.[editSource] ?? []).map((it, i) =>
          i === editIndex ? savedItem : it,
        ),
      };
      return { ...prev, equipment: [eq0, ...(prev.equipment?.slice(1) ?? [])] };
    });
    setEditDialogOpen(false);
  };

  const deleteEditDialog = (index) => {
    if (!editSource || index == null) return;
    setPlayer((prev) => {
      const eq0 = {
        ...(prev.equipment?.[0] ?? {}),
        [editSource]: (prev.equipment?.[0]?.[editSource] ?? []).filter(
          (_, i) => i !== index,
        ),
      };
      return { ...prev, equipment: [eq0, ...(prev.equipment?.slice(1) ?? [])] };
    });
    setEditDialogOpen(false);
  };

  const handleImportFromCompendium = (item, type) => {
    if (!setPlayer) return;
    setPlayer((prev) => {
      const source =
        type === "weapons"
          ? "weapons"
          : type === "armor"
            ? "armor"
            : type === "shields"
              ? "shields"
              : type === "custom-weapons"
                ? "customWeapons"
                : "accessories";
      let newItem;
      if (type === "weapons")
        newItem = normalizeWeaponLike({
          ...item,
          base: item,
          name: item.name,
          category: item.category || "",
          martial: item.martial || false,
          quality: "",
          cost: item.cost || 0,
          isEquipped: false,
        });
      else if (type === "armor" || type === "shields")
        newItem = {
          base: item,
          name: item.name,
          quality: "",
          category: type === "armor" ? "Armor" : "Shield",
          martial: item.martial || false,
          def: item.def || 0,
          mdef: item.mdef || 0,
          init: item.init || 0,
          cost: item.cost || 0,
          isEquipped: false,
        };
      else newItem = { ...item, isEquipped: false };
      return patchInv(prev, source, (arr) => [...arr, newItem]);
    });
  };

  const handleAddAction = () => {
    // no-op in experiment
  };

  if (groupedItems.length === 0) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <PcCompactLoadout
        pc={player}
        onUpdate={setPlayer}
        isInteractive={isEditMode}
        searchQuery={searchQuery}
      />

      <SpellVehiclePanel player={player} searchQuery={searchQuery} />

      {groupedItems.map((group) => (
        <Section
          key={group.key}
          group={group}
          isEditMode={isEditMode}
          isMainTab={isMainTab}
          onAdd={handleAddAction}
          onCompendium={() => setCompendiumType(group.compendium)}
          t={t}
          theme={theme}
        >
          {group.items.map((item, idx) =>
            item.equipType === "transforming-pair" ? (
              <TransformingWeaponPair
                key={`transforming-pair-${item.originalIndex ?? idx}`}
                item={item}
                player={player}
                isEditMode={isEditMode}
                searchQuery={searchQuery}
                handleEquipment={handleEquipment}
                handleDiceRoll={handleDiceRoll}
                handleSwapForm={handleSwapForm}
                handleEdit={handleEdit}
                checkIfEquippable={checkIfEquippable}
                theme={theme}
                t={t}
                onPreviewItem={setPreviewItem}
              />
            ) : (
              <ItemRow
                key={`${item.equipType}-${item.originalIndex ?? idx}`}
                item={item}
                player={player}
                isEditMode={isEditMode}
                searchQuery={searchQuery}
                handleEquipment={handleEquipment}
                handleDiceRoll={handleDiceRoll}
                handleSwapForm={handleSwapForm}
                handleEdit={handleEdit}
                checkIfEquippable={checkIfEquippable}
                theme={theme}
                t={t}
                onPreviewItem={setPreviewItem}
              />
            ),
          )}
        </Section>
      ))}

      {/* Sphere inventory - technospheres mode */}
      {isTechnospheres && (
        <CompactSphereInventory
          player={player}
          setPlayer={setPlayer}
          isEditMode={isEditMode}
        />
      )}

      {/* Weapon slot picker */}
      <Menu
        open={Boolean(slotMenuAnchor)}
        onClose={() => {
          setSlotMenuAnchor(null);
          setSlotMenuWeapon(null);
        }}
        anchorReference="anchorPosition"
        anchorPosition={slotMenuAnchor ?? undefined}
      >
        <MenuItem onClick={() => handleWeaponSlotSelect("mainHand")}>
          {t("Main Hand")}
        </MenuItem>
        <MenuItem onClick={() => handleWeaponSlotSelect("offHand")}>
          {t("Off Hand")}
        </MenuItem>
      </Menu>

      {/* Shield slot picker */}
      <Menu
        open={Boolean(shieldMenuAnchor)}
        onClose={() => {
          setShieldMenuAnchor(null);
          setShieldMenuItem(null);
        }}
        anchorReference="anchorPosition"
        anchorPosition={shieldMenuAnchor ?? undefined}
      >
        <MenuItem onClick={() => handleShieldSlotSelect("mainHand")}>
          {t("Main Hand")}
        </MenuItem>
        <MenuItem onClick={() => handleShieldSlotSelect("offHand")}>
          {t("Off Hand")}
        </MenuItem>
      </Menu>

      {/* Shield equip warning */}
      <Snackbar
        open={shieldEquipWarningOpen}
        autoHideDuration={3000}
        onClose={() => setShieldEquipWarningOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="warning"
          onClose={() => setShieldEquipWarningOpen(false)}
        >
          {t("Cannot equip shield while two-handed weapon is equipped")}
        </Alert>
      </Snackbar>

      {/* Compendium viewer */}
      {compendiumType && (
        <CompendiumViewerModal
          open={Boolean(compendiumType)}
          onClose={() => setCompendiumType(null)}
          onAddItem={handleImportFromCompendium}
          initialType={compendiumType}
          restrictToTypes={[compendiumType]}
          context="player"
        />
      )}

      {/* Item edit modal */}
      <ItemEditModal
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        itemType={SOURCE_TO_ITEM_TYPE[editSource]}
        item={editItemData}
        editIndex={editIndex}
        onSave={saveEditDialog}
        onDelete={deleteEditDialog}
        ctx={{ player, setPlayer }}
      />

      <Dialog
        open={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent sx={{ p: 0 }}>
          {previewItem?.equipType === "custom-weapon" ? (
            <SharedCustomWeaponCard item={previewItem} />
          ) : previewItem?.equipType === "weapon" ? (
            <SharedWeaponCard item={previewItem} />
          ) : previewItem?.equipType === "armor" ? (
            <SharedArmorCard item={previewItem} />
          ) : previewItem?.equipType === "shield" ? (
            <SharedShieldCard item={previewItem} />
          ) : previewItem?.equipType === "accessory" ? (
            <SharedAccessoryCard item={previewItem} />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPreviewItem(null)}
            variant="contained"
            color="primary"
          >
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
