import React, { useState, useMemo, useCallback, memo } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from "@mui/material";
import {
  Casino,
  RadioButtonUnchecked,
  Add,
  Search as SearchIcon,
  Error as ErrorIcon,
  Message,
  SwapHoriz,
  Delete,
  Edit,
  Menu as MenuIcon,
  ChatOutlined,
  AddToPhotos as AddToPhotosIcon,
} from "@mui/icons-material";
import NotesMarkdown from "/src/components/common/NotesMarkdown";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import {
  Martial,
  MeleeIcon,
  DistanceIcon,
  ArmorIcon,
  ShieldIcon,
  AccessoryIcon,
} from "/src/components/icons";
import {
  SharedWeaponCard,
  SharedArmorCard,
  SharedShieldCard,
  SharedCustomWeaponCard,
  SharedAccessoryCard,
} from "/src/components/shared/items";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import { calculateAttribute } from "/src/libs/playerCalculations";
import {
  deriveVehicleSlots,
  isTwoHandedEquipped,
  isItemEquipped,
} from "/src/libs/player/slots/equipmentSlots";
import {
  clearSlotAction,
  equipItemToSlot,
} from "/src/libs/player/slots/loadoutActions";
import { normalizeWeaponLike } from "/src/libs/weaponNormalization";
import {
  prepareAccuracyCheck,
  rollAccuracyCheck,
  processAccuracyCheck,
  buildAccuracyCheckMessage,
} from "/src/components/app-drawer/panels/chat/domain/accuracy-checks";
import {
  sendRollMessage,
  sendDisplayMessage,
} from "/src/hooks/useRollToChat";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import ItemStatSubtitle from "/src/components/shared/actors/common/ItemStatSubtitle";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import ItemEditModal from "/src/forms/ui/ItemEditModal";
import { useCompendiumPacks } from "/src/hooks/useCompendiumPacks";
import {
  buildAccessoryFormState,
  buildAccessorySavePayload,
} from "/src/forms/schema/itemSchemas/accessory";
import {
  buildArmorFormState,
  buildArmorSavePayload,
} from "/src/forms/schema/itemSchemas/armor";
import {
  buildShieldFormState,
  buildShieldSavePayload,
} from "/src/forms/schema/itemSchemas/shield";
import {
  buildCustomWeaponFormState,
  buildCustomWeaponSavePayload,
} from "/src/forms/schema/itemSchemas/customWeapon";

// --- Helpers ---

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

function asArray(v) {
  return Array.isArray(v) ? v : [];
}

function normalizeAttrKey(raw) {
  const key = String(raw || "").toLowerCase();
  if (key === "dex" || key === "dexterity") return "dexterity";
  if (key === "ins" || key === "insight") return "insight";
  if (key === "mig" || key === "might") return "might";
  if (key === "wlp" || key === "will" || key === "willpower") return "willpower";
  return "dexterity";
}

function isTransformingCustomWeapon(item) {
  return Boolean(
    asArray(item?.customizations).some(
      (c) => c?.name === "weapon_customization_transforming",
    ),
  );
}

// --- Section component (compact variant) ---

function CompactSection({ group, children, isEditMode, isMainTab, onAdd, onCompendium, t, theme }) {
  return (
    <Paper sx={{ mb: 1, overflow: "hidden" }} elevation={0} variant="outlined">
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
              <IconButton size="small" sx={{ p: "2px", color: "#fff" }} onClick={onAdd}>
                <Add sx={{ fontSize: "1.15rem" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("Search Compendium")}>
              <IconButton size="small" sx={{ p: "2px", color: "#fff" }} onClick={onCompendium}>
                <SearchIcon sx={{ fontSize: "1.15rem" }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: "5px",
          p: "5px",
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}

// --- Full-width Section header (non-compact variant) ---

function FullSectionHeader({ label, isEditMode, onAdd, onCompendium, primary, t }) {
  return (
    <Grid size={12}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 40,
          px: 1,
          py: 0.5,
          borderRadius: "8px",
          bgcolor: primary,
          gap: 1,
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontFamily: "Antonio",
            fontWeight: 800,
            fontSize: { xs: "1rem", sm: "1.1rem" },
            textTransform: "uppercase",
            lineHeight: 1.2,
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </Typography>
        {isEditMode && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title={t("Add Item")}>
              <IconButton
                size="small"
                onClick={onAdd}
                sx={{ p: "4px", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px" }}
              >
                <Add fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("Open Compendium")}>
              <IconButton
                size="small"
                onClick={onCompendium}
                sx={{ p: "4px", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px" }}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Grid>
  );
}

// --- Compact item row ---

function CompactItemRow({
  item,
  player,
  isEditMode,
  searchQuery,
  handleEquipment,
  handleDiceRoll,
  handleEdit,
  checkIfEquippable,
  equipToSlot,
  unequipItem,
  hasDualShieldBearer,
  theme,
  t,
  onPreviewItem,
}) {
  const slotMatches = (ref, source, name, index, sourceArr) => {
    if (!ref || ref.source !== source) return false;
    if (ref.index !== undefined) return ref.index === index;
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
      const source = item.equipType === "custom-weapon" ? "customWeapons" : "weapons";
      const name = item.equipType === "custom-weapon" ? item.originalData?.name : item.name;
      const srcArr = eq0?.[source] ?? [];
      const isDefaultUnarmed = defaultRef && defaultRef.source === source && defaultRef.name === name;
      const autoEquipEnabled = settings.autoEquipUnarmed ?? !!defaultRef;
      if (isDefaultUnarmed && autoEquipEnabled) {
        const mE = !slots.mainHand, oE = !slots.offHand;
        if (mE && oE) return "M+O";
        if (mE) return "M";
        if (oE) return "O";
        return null;
      }
      if (slotMatches(slots.mainHand, source, name, idx, srcArr))
        return item.hands === 2 || item.isTwoHand || item.equipType === "custom-weapon" ? "M+O" : "M";
      if (slotMatches(slots.offHand, source, name, idx, srcArr)) return "O";
    } else if (item.equipType === "shield") {
      const srcArr = eq0?.shields ?? [];
      if (slotMatches(slots.mainHand, "shields", item.name, idx, srcArr)) return "M";
      if (slotMatches(slots.offHand, "shields", item.name, idx, srcArr)) return "O";
    } else if (item.equipType === "armor") {
      return slotMatches(slots.armor, "armor", item.name, idx, eq0?.armor ?? []) ? "E" : null;
    } else if (item.equipType === "accessory") {
      return slotMatches(slots.accessory, "accessories", item.name, idx, eq0?.accessories ?? []) ? "E" : null;
    }
    return null;
  };

  const getDefaultUnarmedStrikeInfo = () => {
    const settings = player.settings ?? {};
    const defaultRef = settings.defaultUnarmedStrikeRef;
    const autoEquipEnabled = settings.autoEquipUnarmed ?? !!defaultRef;
    if (!defaultRef || !autoEquipEnabled) return null;
    const source = item.equipType === "custom-weapon" ? "customWeapons" : "weapons";
    const name = item.equipType === "custom-weapon" ? item.originalData?.name : item.name;
    return defaultRef.source === source && defaultRef.name === name ? { isDefault: true, settings } : null;
  };

  const Icon =
    item.equipType === "weapon" || item.equipType === "custom-weapon"
      ? item.melee ? MeleeIcon : DistanceIcon
      : item.equipType === "armor" ? ArmorIcon
      : item.equipType === "shield" ? ShieldIcon
      : AccessoryIcon;

  const [menuAnchor, setMenuAnchor] = useState(null);
  const badge = getBadge();
  const isWeapon = item.equipType === "weapon" || item.equipType === "custom-weapon";
  const sendToChatAction = () => {
    const tags = [];
    if (item.equipType === "armor") {
      const def = item.def + (item.defModifier || 0);
      const mdef = item.mdef + (item.mDefModifier || 0);
      const init = item.init + (item.initModifier || 0);
      tags.push(`DEF: ${item.martial ? def : def === 0 ? t("DEX die") : `${t("DEX die")} + ${def}`}`);
      tags.push(`M.DEF: ${mdef === 0 ? t("INS die") : `${t("INS die")} + ${mdef}`}`);
      if (init !== 0) tags.push(`Init ${init > 0 ? "+" : ""}${init}`);
    } else if (item.equipType === "shield") {
      const def = item.def + (item.defModifier || 0);
      const mdef = item.mdef + (item.mDefModifier || 0);
      const init = item.initModifier || 0;
      tags.push(`DEF +${def}`);
      tags.push(`M.DEF +${mdef}`);
      if (init !== 0) tags.push(`Init ${init > 0 ? "+" : ""}${init}`);
    }
    sendDisplayMessage("item", t(item.name), { speaker: player?.info?.name || player?.name || "", tags, description: item.quality || item.description || undefined });
  };

  return (
    <>
      <ItemRowCard
        onCardClick={() => onPreviewItem?.(item)}
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, minWidth: 0 }}>
            <Typography noWrap sx={{ fontFamily: "Antonio", fontWeight: 800, fontSize: "0.9rem", textTransform: "uppercase", lineHeight: 1.3 }}>
              {highlightMatch(t(item.name), searchQuery)}
            </Typography>
            {item.martial && <Martial />}
          </Box>
        }
        subtitle={<ItemStatSubtitle item={item} />}
        actions={
          <>
            {isWeapon ? (
              <IconButton size="small" onClick={() => handleDiceRoll(item)}><Casino /></IconButton>
            ) : (
              <Tooltip title={t("Send to Chat")} arrow>
                <IconButton size="small" onClick={sendToChatAction}><Message /></IconButton>
              </Tooltip>
            )}
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}>
              <MenuIcon sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          </>
        }
        variant="outlined"
        compact
        paperSx={{
          transition: "border-color 0.15s ease",
          "&:hover": { borderColor: "primary.main" },
        }}
      />
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        {(() => {
          const eq0 = player.equipment?.[0];
          const isDefaultUnarmed = !!getDefaultUnarmedStrikeInfo();
          const canEquip = isEditMode && !isDefaultUnarmed;

          if (badge !== null) {
            // Already equipped — show Unequip
            return (
              <MenuItem
                disabled={!isEditMode}
                onClick={(e) => { handleEquipment(item, e); setMenuAnchor(null); }}
              >
                <Badge badgeContent={badge} color="primary" sx={{ mr: 1.5, "& .MuiBadge-badge": { fontSize: "0.55rem", height: 11, minWidth: 11, p: 0 } }}><Icon fontSize="small" /></Badge>
                <ListItemText>{`${t("Unequip")}${badge && badge !== "E" ? ` (${badge})` : ""}`}</ListItemText>
              </MenuItem>
            );
          }

          const equipIcon = !checkIfEquippable(item)
            ? <ErrorIcon fontSize="small" sx={{ mr: 1.5, color: "error.light" }} />
            : <RadioButtonUnchecked fontSize="small" sx={{ mr: 1.5 }} />;

          // Weapons (single-hand) — show Main Hand / Off Hand
          if (item.equipType === "weapon" && item.hands !== 2 && !item.isTwoHand) {
            const source = "weapons";
            const arr = eq0?.[source] ?? [];
            const idx = item.originalIndex !== undefined ? item.originalIndex : arr.findIndex((it) => it.name === item.name);
            return [
              <MenuItem
                key="main"
                disabled={!canEquip}
                onClick={() => { equipToSlot(source, item.name, idx, "mainHand", false); setMenuAnchor(null); }}
              >
                {equipIcon}
                <ListItemText>{t("Main Hand")}</ListItemText>
              </MenuItem>,
              <MenuItem
                key="off"
                disabled={!canEquip}
                onClick={() => { equipToSlot(source, item.name, idx, "offHand", false); setMenuAnchor(null); }}
              >
                {equipIcon}
                <ListItemText>{t("Off Hand")}</ListItemText>
              </MenuItem>,
            ];
          }

          // Shields with Dual Shieldbearer — show Main Hand / Off Hand
          if (item.equipType === "shield" && hasDualShieldBearer) {
            const source = "shields";
            const arr = eq0?.[source] ?? [];
            const idx = item.originalIndex !== undefined ? item.originalIndex : arr.findIndex((it) => it.name === item.name);
            return [
              <MenuItem
                key="main"
                disabled={!canEquip}
                onClick={() => { equipToSlot(source, item.name, idx, "mainHand", false); setMenuAnchor(null); }}
              >
                {equipIcon}
                <ListItemText>{t("Main Hand")}</ListItemText>
              </MenuItem>,
              <MenuItem
                key="off"
                disabled={!canEquip}
                onClick={() => { equipToSlot(source, item.name, idx, "offHand", false); setMenuAnchor(null); }}
              >
                {equipIcon}
                <ListItemText>{t("Off Hand")}</ListItemText>
              </MenuItem>,
            ];
          }

          // Everything else (2H weapon, custom-weapon, armor, accessory, shield without DSB)
          return (
            <MenuItem
              disabled={!canEquip}
              onClick={(e) => { handleEquipment(item, e); setMenuAnchor(null); }}
            >
              {equipIcon}
              <ListItemText>{t("Equip")}</ListItemText>
            </MenuItem>
          );
        })()}
        <MenuItem
          disabled={!isEditMode}
          onClick={() => { handleEdit(item); setMenuAnchor(null); }}
        >
          <Edit fontSize="small" sx={{ mr: 1.5, flexShrink: 0 }} />
          <ListItemText>{t("Edit")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

// --- Compact transforming weapon pair ---

function TransformingFormCard({ form, isActive, isEquipped, isEditMode, onInactiveClick, onEquip, onRoll, onEdit, checkIfEquippable, searchQuery, theme, t }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const Icon = form.melee ? MeleeIcon : DistanceIcon;
  const badge = isEquipped ? "M+O" : null;

  return (
    <>
      <ItemRowCard
        onCardClick={() => {
          if (!isActive) { onInactiveClick?.(); return; }
        }}
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, minWidth: 0 }}>
            <Typography noWrap sx={{ fontFamily: "Antonio", fontWeight: 800, fontSize: "0.9rem", textTransform: "uppercase", lineHeight: 1.3 }}>
              {highlightMatch(t(form.name), searchQuery)}
            </Typography>
            {form.martial && <Martial />}
          </Box>
        }
        subtitle={<ItemStatSubtitle item={form} />}
        actions={isActive ? (
          <>
            <IconButton size="small" onClick={() => onRoll(form)}><Casino /></IconButton>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}>
              <MenuIcon sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          </>
        ) : null}
        variant="outlined"
        compact
        paperSx={{
          flex: 1,
          minWidth: 0,
          opacity: isActive ? 1 : 0.4,
          transition: "opacity 0.25s ease, border-color 0.15s ease",
          "&:hover": { borderColor: theme.primary },
        }}
      />
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem
          disabled={!isEditMode}
          onClick={(e) => { onEquip(form, e); setMenuAnchor(null); }}
        >
          {badge !== null
            ? <Badge badgeContent={badge} color="primary" sx={{ mr: 1.5, "& .MuiBadge-badge": { fontSize: "0.55rem", height: 11, minWidth: 11, p: 0 } }}><Icon fontSize="small" /></Badge>
            : !checkIfEquippable(form)
              ? <ErrorIcon fontSize="small" sx={{ mr: 1.5, color: "error.light" }} />
              : <RadioButtonUnchecked fontSize="small" sx={{ mr: 1.5 }} />
          }
          <ListItemText>{badge !== null ? t("Unequip") : t("Equip")}</ListItemText>
        </MenuItem>
        <MenuItem disabled={!isEditMode} onClick={() => { onEdit(form); setMenuAnchor(null); }}>
          <Edit fontSize="small" sx={{ mr: 1.5, flexShrink: 0 }} />
          <ListItemText>{t("Edit")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

function CompactTransformingPair({
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
  const isPrimaryActive = (item.activeForm ?? "primary") === "primary";
  const cwName = item.originalData?.name;
  const slots = player.equippedSlots ?? {};
  const isEquipped = slots.mainHand?.source === "customWeapons" && slots.mainHand?.name === cwName;
  const swapFn = () => handleSwapForm(item.primaryForm);

  return (
    <Box sx={{ gridColumn: "1 / -1", display: "flex", alignItems: "stretch", gap: "4px" }}>
      <TransformingFormCard
        form={item.primaryForm}
        isActive={isPrimaryActive}
        isEquipped={isEquipped}
        isEditMode={isEditMode}
        onInactiveClick={swapFn}
        onEquip={handleEquipment}
        onRoll={handleDiceRoll}
        onEdit={handleEdit}
        checkIfEquippable={checkIfEquippable}
        searchQuery={searchQuery}
        theme={theme}
        t={t}
      />
      <TransformingFormCard
        form={item.secondaryForm}
        isActive={!isPrimaryActive}
        isEquipped={isEquipped}
        isEditMode={isEditMode}
        onInactiveClick={swapFn}
        onEquip={handleEquipment}
        onRoll={handleDiceRoll}
        onEdit={handleEdit}
        checkIfEquippable={checkIfEquippable}
        searchQuery={searchQuery}
        theme={theme}
        t={t}
      />
    </Box>
  );
}

// --- Full (non-compact) item row ---

const FullItemRow = memo(function FullItemRow({
  item,
  source,
  index,
  slotLabel,
  isEditMode,
  onEquip,
  onEquipToSlot,
  onDelete,
  onEdit,
  onRoll,
  onSendToChat,
  onAddToCompendium,
  onPreview,
  hasDualShieldBearer,
  t,
}) {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isEquipped = Boolean(slotLabel);
  const isCustom = source === "customWeapons";
  const isTwoHand = isCustom || item?.hands === 2 || item?.isTwoHand;
  const isWeapon = source === "weapons" || source === "customWeapons";
  const equipType =
    source === "customWeapons" ? "custom-weapon"
    : source === "weapons" ? "weapon"
    : source === "shields" ? "shield"
    : source === "armor" ? "armor"
    : "accessory";
  const EquipIcon =
    equipType === "weapon" || equipType === "custom-weapon"
      ? item?.melee ? MeleeIcon : DistanceIcon
      : equipType === "armor" ? ArmorIcon
      : equipType === "shield" ? ShieldIcon
      : AccessoryIcon;

  return (
    <ItemRowCard
      variant="outlined"
      onCardClick={() => onPreview?.(item, equipType)}
      label={
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
          <Typography noWrap sx={{ fontFamily: "Antonio", fontWeight: 800, fontSize: "1rem", textTransform: "uppercase", lineHeight: 1.3 }}>
            {item?.name || t("Unnamed")}
          </Typography>
        </Box>
      }
      subtitle={<ItemStatSubtitle item={{ ...item, equipType }} />}
      actions={
        <>
          {isWeapon && (
            <Tooltip title={t("Roll")}>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onRoll(item); }}>
                <Casino />
              </IconButton>
            </Tooltip>
          )}
          {!isWeapon && (
            <Tooltip title={t("Send to chat")}>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onSendToChat?.(item); }}>
                <ChatOutlined />
              </IconButton>
            </Tooltip>
          )}
          <>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchorEl(e.currentTarget); }}>
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={() => setMenuAnchorEl(null)}>
              {isEquipped ? (
                <MenuItem disabled={!isEditMode} onClick={() => { onEquip(source, index, item, isTwoHand, slotLabel, null); setMenuAnchorEl(null); }}>
                  <EquipIcon fontSize="small" sx={{ mr: 1.5, flexShrink: 0 }} />
                  <ListItemText>{`${t("Unequip")}${slotLabel && slotLabel !== "E" ? ` (${slotLabel})` : ""}`}</ListItemText>
                </MenuItem>
              ) : source === "weapons" && !isTwoHand ? (
                [
                  <MenuItem key="main" disabled={!isEditMode} onClick={() => { onEquipToSlot?.(source, index, item, "mainHand"); setMenuAnchorEl(null); }}>
                    <RadioButtonUnchecked fontSize="small" sx={{ mr: 1.5, flexShrink: 0 }} />
                    <ListItemText>{t("Main Hand")}</ListItemText>
                  </MenuItem>,
                  <MenuItem key="off" disabled={!isEditMode} onClick={() => { onEquipToSlot?.(source, index, item, "offHand"); setMenuAnchorEl(null); }}>
                    <RadioButtonUnchecked fontSize="small" sx={{ mr: 1.5, flexShrink: 0 }} />
                    <ListItemText>{t("Off Hand")}</ListItemText>
                  </MenuItem>,
                ]
              ) : source === "shields" && hasDualShieldBearer ? (
                [
                  <MenuItem key="main" disabled={!isEditMode} onClick={() => { onEquipToSlot?.(source, index, item, "mainHand"); setMenuAnchorEl(null); }}>
                    <RadioButtonUnchecked fontSize="small" sx={{ mr: 1.5, flexShrink: 0 }} />
                    <ListItemText>{t("Main Hand")}</ListItemText>
                  </MenuItem>,
                  <MenuItem key="off" disabled={!isEditMode} onClick={() => { onEquipToSlot?.(source, index, item, "offHand"); setMenuAnchorEl(null); }}>
                    <RadioButtonUnchecked fontSize="small" sx={{ mr: 1.5, flexShrink: 0 }} />
                    <ListItemText>{t("Off Hand")}</ListItemText>
                  </MenuItem>,
                ]
              ) : (
                <MenuItem disabled={!isEditMode} onClick={(e) => { onEquip(source, index, item, isTwoHand, slotLabel, e); setMenuAnchorEl(null); }}>
                  <RadioButtonUnchecked fontSize="small" sx={{ mr: 1.5, flexShrink: 0 }} />
                  <ListItemText>{t("Equip")}</ListItemText>
                </MenuItem>
              )}
              <MenuItem disabled={!isEditMode} onClick={() => { onEdit(source, index, item); setMenuAnchorEl(null); }}>
                <Edit fontSize="small" sx={{ mr: 1.5, flexShrink: 0 }} />
                <ListItemText>{t("Edit")}</ListItemText>
              </MenuItem>
              <MenuItem disabled={!isEditMode} onClick={() => { onDelete(source, index, item); setMenuAnchorEl(null); }} sx={{ "&:not(.Mui-disabled)": { color: "error.main" } }}>
                <Delete fontSize="small" sx={{ mr: 1.5, flexShrink: 0 }} />
                <ListItemText>{t("Delete")}</ListItemText>
              </MenuItem>
              {onAddToCompendium && (
                <MenuItem onClick={async () => { await onAddToCompendium(source, item); setMenuAnchorEl(null); }}>
                  <AddToPhotosIcon fontSize="small" sx={{ mr: 1.5, flexShrink: 0 }} />
                  <ListItemText>{t("Add to Compendium")}</ListItemText>
                </MenuItem>
              )}
            </Menu>
          </>
        </>
      }
    />
  );
});

// --- Full transforming weapon pair ---

const FullTransformingPair = memo(function FullTransformingPair({
  item,
  index,
  slotLabel,
  isEditMode,
  onEdit,
  onEquip,
  onDelete,
  onRoll,
  onSwap,
  onAddToCompendium,
  onPreview,
  t,
}) {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isEquipped = Boolean(slotLabel);
  const activeForm = item.activeForm === "secondary" ? "secondary" : "primary";

  const buildFormData = (cw, form) =>
    form === "primary"
      ? { name: cw.name, category: cw.category || "weapon_category_brawling", range: cw.range || "weapon_range_melee", accuracy: cw.accuracy, damage: cw.damage, equipType: "custom-weapon" }
      : { name: cw.secondWeaponName || `${cw.name} (Alt)`, category: cw.secondSelectedCategory || "weapon_category_brawling", range: cw.secondSelectedRange || "weapon_range_melee", accuracy: cw.secondAccuracy ?? cw.accuracy, damage: cw.secondDamage ?? cw.damage, equipType: "custom-weapon" };

  return (
    <>
      {["primary", "secondary"].map((form) => {
        const fd = buildFormData(item, form);
        const isActive = activeForm === form;
        return (
          <Grid key={form} size={{ xs: 12, sm: 6 }}>
            <Box
              onClick={!isActive ? () => onSwap(index) : undefined}
              sx={{ opacity: isActive ? 1 : 0.45, cursor: isActive ? "default" : "pointer", transition: "opacity 0.2s ease" }}
            >
              <ItemRowCard
                variant="outlined"
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontFamily: "Antonio", fontWeight: 800, fontSize: "1rem", textTransform: "uppercase", lineHeight: 1.3 }}>
                      {fd.name}
                    </Typography>
                  </Box>
                }
                subtitle={<ItemStatSubtitle item={fd} />}
                onCardClick={!isActive ? () => onSwap(index) : () => onPreview?.(fd)}
                actions={
                  isActive ? (
                    <>
                      <Tooltip title={t("Roll")}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onRoll(fd); }}>
                          <Casino />
                        </IconButton>
                      </Tooltip>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchorEl(e.currentTarget); }}>
                        <MenuIcon />
                      </IconButton>
                      <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={() => setMenuAnchorEl(null)}>
                        {isEquipped ? (
                          <MenuItem disabled={!isEditMode} onClick={() => { onEquip("customWeapons", index, item, true, slotLabel, null); setMenuAnchorEl(null); }}>
                            <MeleeIcon fontSize="small" sx={{ mr: 1.5, flexShrink: 0 }} />
                            <ListItemText>{`${t("Unequip")}${slotLabel ? ` (${slotLabel})` : ""}`}</ListItemText>
                          </MenuItem>
                        ) : (
                          <MenuItem disabled={!isEditMode} onClick={() => { onEquip("customWeapons", index, item, true, slotLabel, null); setMenuAnchorEl(null); }}>
                            <RadioButtonUnchecked fontSize="small" sx={{ mr: 1.5, flexShrink: 0 }} />
                            <ListItemText>{t("Equip")}</ListItemText>
                          </MenuItem>
                        )}
                        <MenuItem disabled={!isEditMode} onClick={() => { onEdit("customWeapons", index, item); setMenuAnchorEl(null); }}>
                          <Edit fontSize="small" sx={{ mr: 1.5, flexShrink: 0 }} />
                          <ListItemText>{t("Edit")}</ListItemText>
                        </MenuItem>
                        <MenuItem disabled={!isEditMode} onClick={() => { onDelete("customWeapons", index, item); setMenuAnchorEl(null); }} sx={{ "&:not(.Mui-disabled)": { color: "error.main" } }}>
                          <Delete fontSize="small" sx={{ mr: 1.5, flexShrink: 0 }} />
                          <ListItemText>{t("Delete")}</ListItemText>
                        </MenuItem>
                        {onAddToCompendium && (
                          <MenuItem onClick={async () => { await onAddToCompendium("customWeapons", item); setMenuAnchorEl(null); }}>
                            <AddToPhotosIcon fontSize="small" sx={{ mr: 1.5, flexShrink: 0 }} />
                            <ListItemText>{t("Add to Compendium")}</ListItemText>
                          </MenuItem>
                        )}
                      </Menu>
                    </>
                  ) : (
                    <Tooltip title={t("weapon_customization_swap_form")}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); onSwap(index); }}>
                        <SwapHoriz />
                      </IconButton>
                    </Tooltip>
                  )
                }
              />
            </Box>
          </Grid>
        );
      })}
    </>
  );
});

// --- Bonus row (PlayerEquipment only) ---

function BonusRow({ label, value, compact }) {
  return (
    <ItemRowCard
      variant="outlined"
      compact={compact}
      label={
        <Typography sx={{ fontFamily: "Antonio", fontWeight: 800, fontSize: { xs: "0.82rem", sm: "0.88rem" }, textTransform: "uppercase", color: "text.primary" }}>
          {label}
        </Typography>
      }
      actions={
        <Typography sx={{ color: "#fff", fontFamily: "Antonio", fontWeight: 800, fontSize: { xs: "0.82rem", sm: "0.88rem" }, minWidth: 36, textAlign: "center" }}>
          {value > 0 ? `+${value}` : value}
        </Typography>
      }
    />
  );
}

// --- resolveSlotLabel (full variant) ---

function resolveSlotLabel(source, index, slots, itemName, item) {
  const mainRef = slots?.mainHand;
  const offRef = slots?.offHand;
  const armorRef = slots?.armor;
  const accessoryRef = slots?.accessory;
  const inMain = mainRef?.source === source && (mainRef?.index === index || mainRef?.name === itemName);
  const inOff = offRef?.source === source && (offRef?.index === index || offRef?.name === itemName);
  const inArmor = source === "armor" && armorRef && (armorRef?.index === index || armorRef?.name === itemName);
  const inAccessory = source === "accessories" && accessoryRef && (accessoryRef?.index === index || accessoryRef?.name === itemName);
  const isTwoHand =
    source === "customWeapons" || item?.hands === 2 || item?.isTwoHand;
  if (inMain && isTwoHand) return "M+O";
  if (inMain && inOff) return "M+O";
  if (inMain) return "M";
  if (inOff) return "O";
  if (inArmor || inAccessory) return "E";
  return null;
}

// --- Main export ---

/**
 * Unified equipment panel used by BackpackTab, EditPlayerEquipment, and PlayerEquipment.
 *
 * Props:
 *   compact        - true = Paper/CSS-grid layout (BackpackTab style)
 *                    false = Grid/SectionCard layout (EditPlayerEquipment style)
 *   isMainTab      - only show equipped items (no add/compendium buttons)
 *   showBonusRows  - show accuracy/damage modifier summary rows (PlayerEquipment style)
 *   showSectionCard - wrap in a SectionCard (default true when !compact)
 *   noShadow       - passed to SectionCard (isCharacterSheet mode)
 *   searchQuery    - highlight matches + filter items
 */
export default function PcEquipment({
  player,
  setPlayer,
  isEditMode = false,
  compact = false,
  isMainTab = false,
  searchQuery = "",
  showBonusRows = false,
  showSectionCard = true,
  noShadow = false,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const [compendiumType, setCompendiumType] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSource, setEditSource] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editItemData, setEditItemData] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [slotMenuAnchor, setSlotMenuAnchor] = useState(null);
  const [slotMenuWeapon, setSlotMenuWeapon] = useState(null);
  const [shieldMenuAnchor, setShieldMenuAnchor] = useState(null);
  const [shieldMenuItem, setShieldMenuItem] = useState(null);
  const [shieldEquipWarningOpen, setShieldEquipWarningOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { source, index, name }

  const { ensurePersonalPack, addItem: addCompendiumItem } = useCompendiumPacks();

  const isTechnospheres = player?.settings?.optionalRules?.technospheres ?? false;

  // ---- skill helpers ----
  const getSkillLevel = useCallback((skillName) =>
    (player.classes ?? [])
      .flatMap((c) => c.skills ?? [])
      .filter((s) => s.specialSkill === skillName)
      .reduce((acc, s) => acc + s.currentLvl, 0),
    [player.classes],
  );

  const defensiveMasteryBonus = getSkillLevel("Defensive Mastery");
  const meleeMasteryModifier = getSkillLevel("Melee Weapon Mastery");
  const rangedMasteryModifier = getSkillLevel("Ranged Weapon Mastery");
  const hasDualShieldBearer = (player.classes ?? []).some((cls) =>
    (cls.skills ?? []).some((s) => s.specialSkill === "Dual Shieldbearer" && s.currentLvl === 1),
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
      quality: t("Deals extra damage equal to your【 **SL**】in **defensive mastery**."),
      cost: 0,
      damage: { value: 5 + defensiveMasteryBonus, type: "physical" },
      accuracy: { attr1: "might", attr2: "might", value: 0 },
      prec: 0,
      isEquipped: true,
    }),
    [defensiveMasteryBonus, t],
  );

  const inv = player.equipment?.[0];

  // ---- format custom weapon ----
  const formatCustomWeapon = useCallback((cw, forceSecondary = null) => {
    const isTransformingCW = asArray(cw.customizations).some(
      (c) => c.name === "weapon_customization_transforming",
    );
    const isSecondary = forceSecondary !== null ? forceSecondary : cw.activeForm === "secondary";
    const name = isSecondary ? cw.secondWeaponName || `${cw.name} (Transforming)` : cw.name;
    const accuracy = isSecondary ? (cw.secondAccuracy ?? cw.accuracy) : cw.accuracy;
    const damage = isSecondary ? (cw.secondDamage ?? cw.damage) : cw.damage;
    const category = isSecondary ? cw.secondSelectedCategory : cw.category;
    const quality = isSecondary ? cw.secondQuality : cw.quality;
    const martialCustomizations = [
      "weapon_customization_quick",
      "weapon_customization_magicdefenseboost",
      "weapon_customization_powerful",
    ];
    const customizations = isSecondary ? asArray(cw.secondCurrentCustomizations) : asArray(cw.customizations);
    const isMartial = customizations.some((c) => martialCustomizations.includes(c.name));
    return {
      name, category, accuracy, damage, quality,
      att1: accuracy?.attr1 || "dexterity",
      att2: accuracy?.attr2 || "might",
      prec: accuracy?.value ?? 0,
      type: damage?.type || "physical",
      hands: 2,
      melee: (isSecondary ? cw.secondSelectedRange : cw.range) === "weapon_range_melee",
      ranged: (isSecondary ? cw.secondSelectedRange : cw.range) === "weapon_range_ranged",
      martial: isMartial,
      cost: cw.cost || 300,
      isEquipped: cw.isEquipped,
      isCustomWeapon: true,
      isTransforming: isTransformingCW,
      isSecondaryForm: isSecondary,
      originalData: cw,
    };
  }, []);

  // ---- allEquipment (compact mode) ----
  const allEquipment = useMemo(() => {
    const items = [];
    if (!inv) return items;
    (inv.weapons || []).forEach((w, i) => {
      const isUnarmed = w.name === "Unarmed Strike" || w.base?.name === "Unarmed Strike";
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
          primaryForm: { ...formatCustomWeapon(cw, false), equipType: "custom-weapon", originalIndex: i },
          secondaryForm: { ...formatCustomWeapon(cw, true), equipType: "custom-weapon", originalIndex: i },
          activeForm: cw.activeForm ?? "primary",
          isEquipped: cw.isEquipped,
          name: cw.name,
        });
      } else {
        items.push({ ...formatCustomWeapon(cw), equipType: "custom-weapon", originalIndex: i });
      }
    });
    if (!isTechnospheres)
      (inv.shields || []).forEach((s, i) => items.push({ ...s, equipType: "shield", originalIndex: i }));
    (inv.armor || []).forEach((a, i) => items.push({ ...a, equipType: "armor", originalIndex: i }));
    (inv.accessories || []).forEach((a, i) => items.push({ ...a, equipType: "accessory", originalIndex: i }));
    return items;
  }, [inv, isTechnospheres, formatCustomWeapon]);

  const equippedShields = useMemo(
    () => allEquipment.filter((it) => it.equipType === "shield" && it.isEquipped),
    [allEquipment],
  );

  const filteredItems = useMemo(() => {
    let items = [...allEquipment];
    if (isMainTab) {
      items = items.filter((it) => it.isEquipped);
      if (hasDualShieldBearer && equippedShields.length >= 2)
        items.push({ ...twinShields, equipType: "weapon", isTwinShields: true });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((it) => {
        if (it.equipType === "transforming-pair") {
          return (
            t(it.primaryForm.name).toLowerCase().includes(q) ||
            t(it.secondaryForm.name).toLowerCase().includes(q) ||
            t(it.primaryForm.quality || "").toLowerCase().includes(q) ||
            t(it.secondaryForm.quality || "").toLowerCase().includes(q)
          );
        }
        return (
          t(it.name).toLowerCase().includes(q) ||
          t(it.quality || "").toLowerCase().includes(q) ||
          t(it.category || "").toLowerCase().includes(q)
        );
      });
    }
    return items;
  }, [allEquipment, isMainTab, searchQuery, hasDualShieldBearer, equippedShields, twinShields, t]);

  const groupedItems = useMemo(() => {
    const groups = [
      ...(!isTechnospheres ? [{ label: t("Weapons"), types: ["weapon"], key: "weapons", compendium: "weapons" }] : []),
      { label: t("Custom Weapons"), types: ["custom-weapon"], key: "customWeapons", compendium: "custom-weapons" },
      ...(!isTechnospheres ? [{ label: t("Shields"), types: ["shield"], key: "shields", compendium: "shields" }] : []),
      { label: t("Armor"), types: ["armor"], key: "armor", compendium: "armor" },
      { label: t("Accessories"), types: ["accessory"], key: "accessories", compendium: "accessories" },
    ];
    return groups
      .map((g) => ({
        ...g,
        items: filteredItems.filter(
          (it) => g.types.includes(it.equipType) || (it.equipType === "transforming-pair" && g.key === "customWeapons"),
        ),
      }))
      .filter((g) => g.items.length > 0 || (isEditMode && !isMainTab));
  }, [filteredItems, isEditMode, isMainTab, isTechnospheres, t]);

  // ---- modifier sums ----
  const equippedArmorItems = allEquipment.filter((it) => it.equipType === "armor" && it.isEquipped);
  const equippedAccessoryItems = allEquipment.filter((it) => it.equipType === "accessory" && it.isEquipped);

  const precMeleeModifier =
    (player.modifiers?.meleePrec || 0) +
    (equippedArmorItems[0]?.modifiers?.accuracy ?? 0) +
    equippedShields.reduce((s, x) => s + (x.modifiers?.accuracy ?? 0), 0) +
    equippedAccessoryItems.reduce((s, x) => s + (x.modifiers?.accuracy ?? 0), 0) +
    meleeMasteryModifier;

  const precRangedModifier =
    (player.modifiers?.rangedPrec || 0) +
    (equippedArmorItems[0]?.modifiers?.accuracy ?? 0) +
    equippedShields.reduce((s, x) => s + (x.modifiers?.accuracy ?? 0), 0) +
    equippedAccessoryItems.reduce((s, x) => s + (x.modifiers?.accuracy ?? 0), 0) +
    rangedMasteryModifier;

  const damageMeleeModifier =
    (equippedArmorItems[0]?.damageMeleeModifier || 0) +
    equippedShields.reduce((s, x) => s + (x.damageMeleeModifier || 0), 0) +
    equippedAccessoryItems.reduce((s, x) => s + (x.damageMeleeModifier || 0), 0);

  const damageRangedModifier =
    (equippedArmorItems[0]?.damageRangedModifier || 0) +
    equippedShields.reduce((s, x) => s + (x.damageRangedModifier || 0), 0) +
    equippedAccessoryItems.reduce((s, x) => s + (x.damageRangedModifier || 0), 0);

  // ---- attribute die sizes (status-aware) ----
  const currDex = calculateAttribute(player, player.attributes?.dexterity?.base, ["slow", "enraged"], ["dexUp"], 6, 12);
  const currInsight = calculateAttribute(player, player.attributes?.insight?.base, ["dazed", "enraged"], ["insUp"], 6, 12);
  const currMight = calculateAttribute(player, player.attributes?.might?.base, ["weak", "poisoned"], ["migUp"], 6, 12);
  const currWillpower = calculateAttribute(player, player.attributes?.willpower?.base, ["shaken", "poisoned"], ["wlpUp"], 6, 12);
  const attributeMap = { dexterity: currDex, insight: currInsight, might: currMight, willpower: currWillpower };

  // ---- inv patch helper ----
  const patchInv = useCallback((p, source, updater) => {
    const eq0 = { ...(p.equipment?.[0] ?? {}), [source]: updater(p.equipment?.[0]?.[source] ?? []) };
    return { ...p, equipment: p.equipment ? [eq0, ...p.equipment.slice(1)] : [eq0] };
  }, []);

  const patchInvCallback = useCallback((source, updater) => {
    setPlayer((prev) => patchInv(prev, source, updater));
  }, [setPlayer, patchInv]);

  // ---- equip helpers ----
  const equipToSlot = useCallback((source, itemName, itemIndex, slot, isTwoHand) => {
    if (slot === "offHand") {
      const mainRef = player.equippedSlots?.mainHand;
      if (mainRef) {
        if (mainRef.source === "customWeapons") return;
        const inv0 = player.equipment?.[0];
        const mainWeapon = mainRef.index !== undefined
          ? inv0?.weapons?.[mainRef.index]
          : inv0?.weapons?.find((w) => w.name === mainRef.name);
        if (mainWeapon?.hands === 2 || mainWeapon?.isTwoHand) return;
      }
    }
    const unequipRef = (p, ref) => {
      if (!ref) return p;
      return patchInv(p, ref.source, (arr) =>
        arr.map((it, idx) => {
          const match = ref.index !== undefined ? idx === ref.index : it.name === ref.name;
          return match ? { ...it, isEquipped: false } : it;
        }),
      );
    };
    let updated = unequipRef(player, player.equippedSlots?.[slot]);
    if (isTwoHand && slot === "mainHand") updated = unequipRef(updated, updated.equippedSlots?.offHand);
    updated = patchInv(updated, source, (arr) =>
      arr.map((it, idx) => {
        const match = itemIndex !== undefined ? idx === itemIndex : it.name === itemName;
        return match ? { ...it, isEquipped: true } : it;
      }),
    );
    const prevSlots = updated.equippedSlots ?? { mainHand: null, offHand: null, armor: null, accessory: null };
    setPlayer({
      ...updated,
      equippedSlots: {
        ...prevSlots,
        [slot]: { source, name: itemName, index: itemIndex },
        ...(isTwoHand && slot === "mainHand" ? { offHand: null } : {}),
      },
      vehicleSlots: deriveVehicleSlots(updated),
    });
  }, [player, setPlayer, patchInv]);

  const unequipItem = useCallback((source, itemName) => {
    const slots = player.equippedSlots ?? {};
    const slotKey = Object.keys(slots).find((k) => slots[k]?.source === source && slots[k]?.name === itemName);
    if (slotKey) setPlayer((prev) => clearSlotAction(prev, slotKey));
    else {
      const updated = patchInv(player, source, (arr) =>
        arr.map((it) => it.name === itemName ? { ...it, isEquipped: false } : it),
      );
      setPlayer({ ...updated, vehicleSlots: deriveVehicleSlots(updated) });
    }
  }, [player, setPlayer, patchInv]);

  const checkIfEquippable = useCallback((item) => {
    if (!item.martial) return true;
    const isTechStandard =
      player.settings?.optionalRules?.technospheres &&
      ["standard", "hoplospheres"].includes(player.settings?.optionalRules?.technospheresVariant ?? "standard");
    if (isTechStandard && (item.equipType === "weapon" || item.equipType === "custom-weapon")) return true;
    return (player.classes ?? []).some((cls) => {
      const m = cls.benefits?.martials;
      if (!m) return false;
      if ((item.equipType === "weapon" || item.equipType === "custom-weapon") && ((item.melee && m.melee) || (item.ranged && m.ranged))) return true;
      if (item.equipType === "armor" && m.armor) return true;
      if (item.equipType === "shield" && m.shield) return true;
      return false;
    });
  }, [player]);

  // handleEquipment for compact mode
  const handleEquipment = useCallback((item, event) => {
    if (!setPlayer || item.isTwinShields) return;
    const eq0 = player.equipment?.[0];
    if (item.equipType === "custom-weapon") {
      const cw = item.originalData;
      const cwIndex = eq0?.customWeapons?.findIndex((w) => w === cw) ?? -1;
      if (cw.isEquipped) unequipItem("customWeapons", cw.name);
      else equipToSlot("customWeapons", cw.name, cwIndex >= 0 ? cwIndex : undefined, "mainHand", true);
      return;
    }
    const source =
      item.equipType === "weapon" ? "weapons"
      : item.equipType === "shield" ? "shields"
      : item.equipType === "armor" ? "armor"
      : "accessories";
    const arr = eq0?.[source] ?? [];
    const idx = item.originalIndex !== undefined ? item.originalIndex : arr.findIndex((it) => it.name === item.name);
    if (idx === -1) return;
    const invItem = arr[idx];
    if (invItem.isEquipped) {
      unequipItem(source, invItem.name);
    } else {
      if (item.equipType === "shield") {
        if (isTwoHandedEquipped(player) && !checkIfEquippable(item)) { setShieldEquipWarningOpen(true); return; }
        if (hasDualShieldBearer && event) {
          setShieldMenuAnchor({ top: event.clientY, left: event.clientX });
          setShieldMenuItem({ name: invItem.name, index: idx });
        } else equipToSlot("shields", invItem.name, idx, "offHand", false);
      } else if (item.equipType === "armor") {
        equipToSlot("armor", invItem.name, idx, "armor", false);
      } else if (item.equipType === "weapon") {
        const isTwoHand = invItem.hands === 2 || invItem.isTwoHand;
        if (isTwoHand) equipToSlot("weapons", invItem.name, idx, "mainHand", true);
        else if (event) {
          setSlotMenuAnchor({ top: event.clientY, left: event.clientX });
          setSlotMenuWeapon({ name: invItem.name, index: idx });
        } else {
          const slots = player.equippedSlots ?? {};
          const slot = !slots.mainHand ? "mainHand" : !slots.offHand ? "offHand" : null;
          if (slot) equipToSlot("weapons", invItem.name, idx, slot, false);
        }
      } else if (item.equipType === "accessory") {
        equipToSlot("accessories", invItem.name, idx, "accessory", false);
      }
    }
  }, [player, setPlayer, equipToSlot, unequipItem, checkIfEquippable, hasDualShieldBearer, isTwoHandedEquipped]);

  // handleEquip for full mode - pure functional updates matching bak logic
  const handleEquipFull = useCallback((source, index, item, isTwoHand, slotLabel, event) => {
    if (!setPlayer) return;
    if (slotLabel) {
      setPlayer((prev) => {
        let next = prev;
        if (slotLabel.includes("M")) next = clearSlotAction(next, "mainHand");
        if (slotLabel.includes("O")) next = clearSlotAction(next, "offHand");
        if (slotLabel === "E") {
          const slotKey = source === "armor" ? "armor" : "accessory";
          next = clearSlotAction(next, slotKey);
        }
        return next;
      });
      return;
    }
    const isWeapon = source === "weapons";
    const isShield = source === "shields";
    if (!isTwoHand && (isWeapon || isShield) && event) {
      const anchor = { top: event.clientY, left: event.clientX };
      if (isShield) {
        if (isTwoHandedEquipped(player)) { setShieldEquipWarningOpen(true); return; }
        if (!hasDualShieldBearer) {
          setPlayer((prev) => equipItemToSlot(prev, "offHand", { source, label: item?.name || "", index, item }));
          return;
        }
        setShieldMenuAnchor(anchor);
        setShieldMenuItem({ name: item?.name || "", index, item });
      } else {
        setSlotMenuAnchor(anchor);
        setSlotMenuWeapon({ name: item?.name || "", index, item });
      }
      return;
    }
    if (source === "armor") {
      setPlayer((prev) => equipItemToSlot(prev, "armor", { source, label: item?.name || "", index, item }));
      return;
    }
    if (source === "accessories") {
      setPlayer((prev) => equipItemToSlot(prev, "accessory", { source, label: item?.name || "", index, item }));
      return;
    }
    const slots = player?.equippedSlots ?? {};
    const targetSlot = isTwoHand || !slots.mainHand ? "mainHand" : !slots.offHand ? "offHand" : "mainHand";
    setPlayer((prev) => equipItemToSlot(prev, targetSlot, { source, label: item?.name || "", index, item }));
  }, [setPlayer, player?.equippedSlots, hasDualShieldBearer, isTwoHandedEquipped, player]);

  const handleEquipToSlot = useCallback((source, index, item, slot) => {
    if (!setPlayer) return;
    setPlayer((prev) => equipItemToSlot(prev, slot, { source, label: item?.name || "", index, item }));
  }, [setPlayer]);

  const handleSwapForm = useCallback((item) => {
    if (!setPlayer) return;
    // compact mode passes the primaryForm object; full mode passes original cw index
    if (typeof item === "number") {
      // full mode
      setPlayer((prev) => {
        const eq0 = prev?.equipment?.[0] ?? {};
        const updated = (eq0.customWeapons ?? []).map((cw, i) =>
          i !== item ? cw : { ...cw, activeForm: cw.activeForm === "secondary" ? "primary" : "secondary" },
        );
        return { ...prev, equipment: prev?.equipment ? [{ ...eq0, customWeapons: updated }, ...prev.equipment.slice(1)] : [{ ...eq0, customWeapons: updated }] };
      });
    } else {
      // compact mode - item is primaryForm with originalData
      if (!item.originalData) return;
      setPlayer((prev) => {
        const cwList = prev.equipment?.[0]?.customWeapons ?? [];
        const idx = cwList.findIndex((w) => w === item.originalData);
        if (idx === -1) return prev;
        return {
          ...prev,
          equipment: [
            { ...prev.equipment[0], customWeapons: cwList.map((cw, i) => i === idx ? { ...cw, activeForm: cw.activeForm === "secondary" ? "primary" : "secondary" } : cw) },
            ...(prev.equipment?.slice(1) ?? []),
          ],
        };
      });
    }
  }, [setPlayer]);

  const handleDiceRoll = useCallback((weapon) => {
    const attr1 = normalizeAttrKey(weapon.accuracy?.attr1);
    const attr2 = normalizeAttrKey(weapon.accuracy?.attr2);
    const isRanged = !weapon.melee;
    const precModifier = isRanged ? precRangedModifier : precMeleeModifier;
    const damageModifier = isRanged ? damageRangedModifier : damageMeleeModifier;
    const intent = prepareAccuracyCheck({
      arg: weapon.name || "",
      name: weapon.name || "",
      attr1,
      attr2,
      accuracyBonus: (weapon.accuracy?.value ?? 0) + precModifier,
      baseDamage: (weapon.damage?.value ?? weapon.damage ?? 0) + damageModifier,
      damageType: weapon.damage?.type ?? weapon.type ?? "physical",
      accuracyDefense: weapon.accuracy?.defense ?? "def",
      hands: weapon.hands,
      category: weapon.category,
      range: isRanged ? "ranged" : "melee",
    });
    const dieSizes = { primary: attributeMap[attr1] ?? currDex, secondary: attributeMap[attr2] ?? currMight };
    const rolls = rollAccuracyCheck(dieSizes);
    const result = processAccuracyCheck(intent, rolls, dieSizes, player?.info?.name || player?.name || "");
    sendRollMessage(buildAccuracyCheckMessage(result));
  }, [precMeleeModifier, precRangedModifier, damageMeleeModifier, damageRangedModifier, attributeMap, currDex, currMight, player]);

  const handleSendToChat = useCallback((item) => {
    sendDisplayMessage("item", item?.name || "", {
      description: item?.description ?? item?.quality ?? "",
      speaker: player?.info?.name || player?.name || "",
    });
  }, [player]);

  const handleEdit = useCallback((item) => {
    if (!isEditMode) return;
    const source =
      item.equipType === "weapon" ? "weapons"
      : item.equipType === "custom-weapon" ? "customWeapons"
      : item.equipType === "shield" ? "shields"
      : item.equipType === "armor" ? "armor"
      : "accessories";
    const rawItem = item.originalData ?? player.equipment?.[0]?.[source]?.[item.originalIndex];
    setEditSource(source);
    setEditIndex(item.originalIndex ?? null);
    setEditItemData(rawItem ?? null);
    setEditDialogOpen(true);
  }, [isEditMode, player]);

  const openEditDialog = useCallback((source, index, item) => {
    setEditSource(source);
    setEditIndex(index);
    setEditItemData(item ?? null);
    setEditDialogOpen(true);
  }, []);

  const openEditFromPreview = useCallback((previewItem) => {
    if (!previewItem) return;
    const source = previewItem._source ?? (
      previewItem.equipType === "weapon" ? "weapons"
      : previewItem.equipType === "custom-weapon" ? "customWeapons"
      : previewItem.equipType === "shield" ? "shields"
      : previewItem.equipType === "armor" ? "armor"
      : "accessories"
    );
    const index = previewItem._index ?? previewItem.originalIndex ?? null;
    const rawItem = previewItem.originalData ?? (index != null ? player.equipment?.[0]?.[source]?.[index] : null) ?? previewItem;
    setPreviewItem(null);
    openEditDialog(source, index, rawItem);
  }, [player, openEditDialog]);

  const handleSave = useCallback((savedItem) => {
    if (!editSource || editIndex == null) return;
    patchInvCallback(editSource, (arr) => arr.map((it, i) => (i === editIndex ? savedItem : it)));
    setEditDialogOpen(false);
  }, [editSource, editIndex, patchInvCallback]);

  const handleDeleteItem = useCallback((index) => {
    if (!editSource || index == null) return;
    patchInvCallback(editSource, (arr) => arr.filter((_, i) => i !== index));
    setEditDialogOpen(false);
  }, [editSource, patchInvCallback]);

  const handleDelete = useCallback((source, index) => {
    setPlayer((prev) => {
      const eq0 = prev?.equipment?.[0] ?? {};
      const nextArr = (eq0?.[source] ?? []).filter((_, i) => i !== index);
      const equipment = prev?.equipment ? [{ ...eq0, [source]: nextArr }, ...prev.equipment.slice(1)] : [{ ...eq0, [source]: nextArr }];
      return { ...prev, equipment };
    });
  }, [setPlayer]);

  const requestDelete = useCallback((source, index, item) => {
    setDeleteConfirm({ source, index, name: item?.name || t("this item") });
  }, [t]);

  const handleAddNew = useCallback((source) => {
    if (!isEditMode) return;
    const builders = {
      weapons: () => normalizeWeaponLike({ name: "New Weapon", isEquipped: false }),
      customWeapons: () => buildCustomWeaponSavePayload(buildCustomWeaponFormState(null)),
      shields: () => buildShieldSavePayload(buildShieldFormState(null)),
      armor: () => buildArmorSavePayload(buildArmorFormState(null)),
      accessories: () => buildAccessorySavePayload(buildAccessoryFormState(null)),
    };
    if (!builders[source]) return;
    const newItem = builders[source]();
    const newIndex = (player.equipment?.[0]?.[source] ?? []).length;
    patchInvCallback(source, (arr) => [...arr, newItem]);
    openEditDialog(source, newIndex, newItem);
  }, [isEditMode, patchInvCallback, openEditDialog, player.equipment]);

  const handleImportFromCompendium = useCallback((item, type) => {
    if (!setPlayer) return;
    const source =
      type === "weapons" ? "weapons"
      : type === "armor" ? "armor"
      : type === "shields" ? "shields"
      : type === "custom-weapons" ? "customWeapons"
      : "accessories";
    let newItem;
    if (type === "weapons")
      newItem = normalizeWeaponLike({ ...item, base: item, name: item.name, category: item.category || "", martial: item.martial || false, quality: "", cost: item.cost || 0, isEquipped: false });
    else if (type === "armor" || type === "shields")
      newItem = { base: item, name: item.name, quality: "", category: type === "armor" ? "Armor" : "Shield", martial: item.martial || false, def: item.def || 0, mdef: item.mdef || 0, init: item.init || 0, cost: item.cost || 0, isEquipped: false };
    else newItem = { ...item, isEquipped: false };
    patchInvCallback(source, (arr) => [...arr, newItem]);
  }, [setPlayer, patchInvCallback]);

  const handleAddToCompendium = useCallback(async (source, item) => {
    const typeMap = { weapons: "weapon", customWeapons: "custom-weapon", shields: "shield", armor: "armor", accessories: "accessory" };
    const dataType = typeMap[source];
    if (!dataType) return;
    const pack = await ensurePersonalPack();
    await addCompendiumItem(pack.id, dataType, item);
  }, [ensurePersonalPack, addCompendiumItem]);

  const SOURCE_TO_ITEM_TYPE = { weapons: "weapon", customWeapons: "customWeapon", shields: "shield", armor: "armor", accessories: "accessory" };

  // ---- full-mode sections (row data by source key) ----
  const fullSections = useMemo(() => [
    { key: "weapons", label: t("Weapons"), rows: (inv?.weapons || []).map((item, index) => ({ item, source: "weapons", index })) },
    { key: "customWeapons", label: t("Custom Weapons"), rows: (inv?.customWeapons || []).map((item, index) => ({ item, source: "customWeapons", index })) },
    { key: "shields", label: t("Shields"), rows: (inv?.shields || []).map((item, index) => ({ item, source: "shields", index })) },
    { key: "armor", label: t("Armor"), rows: (inv?.armor || []).map((item, index) => ({ item, source: "armor", index })) },
    { key: "accessories", label: t("Accessories"), rows: (inv?.accessories || []).map((item, index) => ({ item, source: "accessories", index })) },
  ], [t, inv]);

  const equippedSlots = player?.equippedSlots ?? {};

  // ---- render ----

  if (compact) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {groupedItems.map((group) => (
          <CompactSection
            key={group.key}
            group={group}
            isEditMode={isEditMode}
            isMainTab={isMainTab}
            onAdd={() => handleAddNew(group.key)}
            onCompendium={() => setCompendiumType(group.compendium)}
            t={t}
            theme={theme}
          >
            {group.items.map((item, idx) =>
              item.equipType === "transforming-pair" ? (
                <CompactTransformingPair
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
                <CompactItemRow
                  key={`${item.equipType}-${item.originalIndex ?? idx}`}
                  item={item}
                  player={player}
                  isEditMode={isEditMode}
                  searchQuery={searchQuery}
                  handleEquipment={handleEquipment}
                  handleDiceRoll={handleDiceRoll}
                  handleEdit={handleEdit}
                  checkIfEquippable={checkIfEquippable}
                  equipToSlot={equipToSlot}
                  unequipItem={unequipItem}
                  hasDualShieldBearer={hasDualShieldBearer}
                  theme={theme}
                  t={t}
                  onPreviewItem={setPreviewItem}
                />
              ),
            )}
          </CompactSection>
        ))}

        {/* Slot menus & modals below */}
        <Menu
          open={Boolean(slotMenuAnchor)}
          onClose={() => { setSlotMenuAnchor(null); setSlotMenuWeapon(null); }}
          anchorReference="anchorPosition"
          anchorPosition={slotMenuAnchor ?? undefined}
        >
          <MenuItem onClick={() => { if (slotMenuWeapon) equipToSlot("weapons", slotMenuWeapon.name, slotMenuWeapon.index, "mainHand", false); setSlotMenuAnchor(null); setSlotMenuWeapon(null); }}>{t("Main Hand")}</MenuItem>
          <MenuItem onClick={() => { if (slotMenuWeapon) equipToSlot("weapons", slotMenuWeapon.name, slotMenuWeapon.index, "offHand", false); setSlotMenuAnchor(null); setSlotMenuWeapon(null); }}>{t("Off Hand")}</MenuItem>
        </Menu>
        <Menu
          open={Boolean(shieldMenuAnchor)}
          onClose={() => { setShieldMenuAnchor(null); setShieldMenuItem(null); }}
          anchorReference="anchorPosition"
          anchorPosition={shieldMenuAnchor ?? undefined}
        >
          <MenuItem onClick={() => { if (shieldMenuItem) equipToSlot("shields", shieldMenuItem.name, shieldMenuItem.index, "mainHand", false); setShieldMenuAnchor(null); setShieldMenuItem(null); }}>{t("Main Hand")}</MenuItem>
          <MenuItem onClick={() => { if (shieldMenuItem) equipToSlot("shields", shieldMenuItem.name, shieldMenuItem.index, "offHand", false); setShieldMenuAnchor(null); setShieldMenuItem(null); }}>{t("Off Hand")}</MenuItem>
        </Menu>
        <Snackbar open={shieldEquipWarningOpen} autoHideDuration={3000} onClose={() => setShieldEquipWarningOpen(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert severity="warning" onClose={() => setShieldEquipWarningOpen(false)}>
            {t("Cannot equip shield while two-handed weapon is equipped")}
          </Alert>
        </Snackbar>
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
        <ItemEditModal
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          itemType={SOURCE_TO_ITEM_TYPE[editSource]}
          item={editItemData}
          editIndex={editIndex}
          onSave={handleSave}
          onDelete={handleDeleteItem}
          ctx={{ player, setPlayer }}
        />
        <Dialog open={Boolean(previewItem)} onClose={() => setPreviewItem(null)} fullWidth maxWidth="sm">
          <DialogContent sx={{ p: 0 }}>
            {previewItem?.equipType === "custom-weapon" ? <SharedCustomWeaponCard item={previewItem} />
            : previewItem?.equipType === "weapon" ? <SharedWeaponCard item={previewItem} />
            : previewItem?.equipType === "armor" ? <SharedArmorCard item={previewItem} />
            : previewItem?.equipType === "shield" ? <SharedShieldCard item={previewItem} />
            : previewItem?.equipType === "accessory" ? <SharedAccessoryCard item={previewItem} />
            : null}
          </DialogContent>
          <DialogActions sx={{ justifyContent: "space-between" }}>
            {isEditMode && setPlayer && <Button onClick={() => openEditFromPreview(previewItem)} startIcon={<Edit />} variant="outlined">{t("Edit")}</Button>}
            <Button onClick={() => setPreviewItem(null)} variant="contained" color="primary" sx={{ ml: "auto" }}>{t("Close")}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // ---- full (non-compact) layout ----
  const primary = theme.primary;

  const body = (
    <Grid container spacing={1} sx={{ p: 0.75, width: "100%" }}>
      {fullSections.map(({ key, label, rows }) => (
        <React.Fragment key={key}>
          <FullSectionHeader
            label={label}
            isEditMode={isEditMode}
            onAdd={() => handleAddNew(key)}
            onCompendium={() => setCompendiumType(key === "customWeapons" ? "custom-weapons" : key)}
            primary={primary}
            t={t}
          />
          {rows.length === 0 ? (
            <Grid size={12}>
              <Typography color="text.secondary" variant="body2" sx={{ px: 1, py: 0.5 }}>{t("No items.")}</Typography>
            </Grid>
          ) : (
            rows.map((row) => {
              const slotLabel = resolveSlotLabel(row.source, row.index, equippedSlots, row.item?.name, row.item);
              if (row.source === "customWeapons" && isTransformingCustomWeapon(row.item)) {
                return (
                  <FullTransformingPair
                    key={`${row.source}-${row.index}`}
                    item={row.item}
                    index={row.index}
                    slotLabel={slotLabel}
                    isEditMode={isEditMode}
                    onEdit={openEditDialog}
                    onEquip={handleEquipFull}
                    onDelete={requestDelete}
                    onRoll={handleDiceRoll}
                    onSwap={handleSwapForm}
                    onAddToCompendium={handleAddToCompendium}
                    onPreview={(it) => setPreviewItem(it)}
                    t={t}
                  />
                );
              }
              return (
                <Grid key={`${row.source}-${row.index}`} size={{ xs: 12, md: 6 }}>
                  <FullItemRow
                    item={row.item}
                    source={row.source}
                    index={row.index}
                    slotLabel={slotLabel}
                    isEditMode={isEditMode}
                    onEdit={openEditDialog}
                    onEquip={handleEquipFull}
                    onEquipToSlot={handleEquipToSlot}
                    onDelete={requestDelete}
                    onRoll={handleDiceRoll}
                    onSendToChat={handleSendToChat}
                    onAddToCompendium={handleAddToCompendium}
                    onPreview={(it, equipType) => setPreviewItem({ ...it, equipType, _source: row.source, _index: row.index })}
                    hasDualShieldBearer={hasDualShieldBearer}
                    t={t}
                  />
                </Grid>
              );
            })
          )}
        </React.Fragment>
      ))}
      {showBonusRows &&
        [
          { label: t("Melee Accuracy Bonus"), value: precMeleeModifier },
          { label: t("Ranged Accuracy Bonus"), value: precRangedModifier },
          { label: t("Melee Damage Bonus"), value: damageMeleeModifier },
          { label: t("Ranged Damage Bonus"), value: damageRangedModifier },
        ]
          .filter(({ value }) => value !== 0)
          .map(({ label, value }) => (
            <Grid key={label} size={{ xs: 12, sm: 6 }}>
              <BonusRow label={label} value={value} />
            </Grid>
          ))}
    </Grid>
  );

  return (
    <>
      {showSectionCard ? (
        <SectionCard title={t("Equipment")} noShadow={noShadow}>
          {body}
        </SectionCard>
      ) : body}

      <Menu
        open={Boolean(slotMenuAnchor)}
        onClose={() => { setSlotMenuAnchor(null); setSlotMenuWeapon(null); }}
        anchorReference="anchorPosition"
        anchorPosition={slotMenuAnchor ?? undefined}
      >
        <MenuItem onClick={() => { if (slotMenuWeapon) setPlayer((prev) => equipItemToSlot(prev, "mainHand", { source: "weapons", label: slotMenuWeapon.name, index: slotMenuWeapon.index, item: slotMenuWeapon.item })); setSlotMenuAnchor(null); setSlotMenuWeapon(null); }}>{t("Main Hand")}</MenuItem>
        <MenuItem onClick={() => { if (slotMenuWeapon) setPlayer((prev) => equipItemToSlot(prev, "offHand", { source: "weapons", label: slotMenuWeapon.name, index: slotMenuWeapon.index, item: slotMenuWeapon.item })); setSlotMenuAnchor(null); setSlotMenuWeapon(null); }}>{t("Off Hand")}</MenuItem>
      </Menu>
      <Menu
        open={Boolean(shieldMenuAnchor)}
        onClose={() => { setShieldMenuAnchor(null); setShieldMenuItem(null); }}
        anchorReference="anchorPosition"
        anchorPosition={shieldMenuAnchor ?? undefined}
      >
        <MenuItem onClick={() => { if (shieldMenuItem) setPlayer((prev) => equipItemToSlot(prev, "mainHand", { source: "shields", label: shieldMenuItem.name, index: shieldMenuItem.index, item: shieldMenuItem.item })); setShieldMenuAnchor(null); setShieldMenuItem(null); }}>{t("Main Hand")}</MenuItem>
        <MenuItem onClick={() => { if (shieldMenuItem) setPlayer((prev) => equipItemToSlot(prev, "offHand", { source: "shields", label: shieldMenuItem.name, index: shieldMenuItem.index, item: shieldMenuItem.item })); setShieldMenuAnchor(null); setShieldMenuItem(null); }}>{t("Off Hand")}</MenuItem>
      </Menu>
      <Snackbar open={shieldEquipWarningOpen} autoHideDuration={3000} onClose={() => setShieldEquipWarningOpen(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="warning" onClose={() => setShieldEquipWarningOpen(false)}>
          {t("Cannot equip shield while two-handed weapon is equipped")}
        </Alert>
      </Snackbar>

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
      <ItemEditModal
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        itemType={SOURCE_TO_ITEM_TYPE[editSource]}
        item={editItemData}
        editIndex={editIndex}
        onSave={handleSave}
        onDelete={handleDeleteItem}
        ctx={{ player, setPlayer }}
      />
      <Dialog open={Boolean(previewItem)} onClose={() => setPreviewItem(null)} fullWidth maxWidth="sm">
        <DialogContent sx={{ p: 0 }}>
          {previewItem?.equipType === "custom-weapon" ? <SharedCustomWeaponCard item={previewItem} />
          : previewItem?.equipType === "weapon" ? <SharedWeaponCard item={previewItem} />
          : previewItem?.equipType === "armor" ? <SharedArmorCard item={previewItem} />
          : previewItem?.equipType === "shield" ? <SharedShieldCard item={previewItem} />
          : previewItem?.equipType === "accessory" ? <SharedAccessoryCard item={previewItem} />
          : null}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          {isEditMode && <Button onClick={() => openEditFromPreview(previewItem)} startIcon={<Edit />} variant="outlined">{t("Edit")}</Button>}
          <Button onClick={() => setPreviewItem(null)} variant="contained" color="primary" sx={{ ml: "auto" }}>{t("Close")}</Button>
        </DialogActions>
      </Dialog>
      <DeleteConfirmationDialog
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => { if (deleteConfirm) handleDelete(deleteConfirm.source, deleteConfirm.index); }}
        title={t("Delete Item")}
        message={`${t("Are you sure you want to delete")} ${deleteConfirm?.name ?? t("this item")}?`}
      />
    </>
  );
}
