import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Box,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import {
  Add,
  Casino,
  Delete,
  Edit,
  Error as ErrorIcon,
  Menu as MenuIcon,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import CustomHeader from "../../common/CustomHeader";
import CompendiumViewerModal from "../../compendium/CompendiumViewerModal";
import SphereInventory from "./technospheres/SphereInventory";
import {
  clearSlotAction,
  equipItemToSlot,
} from "./slots/loadoutActions";
import { buildSphereData } from "../../../libs/technospheres";
import {
  SharedAccessoryCard,
  SharedArmorCard,
  SharedCustomWeaponCard,
  SharedShieldCard,
  SharedWeaponCard,
} from "../../shared/itemCards";
import {
  AccessoryIcon,
  ArmorIcon,
  DistanceIcon,
  MeleeIcon,
  ShieldIcon,
} from "../../icons";
import { normalizeWeaponLike } from "../../../libs/weaponNormalization";
import { buildAccessoryFormState, buildAccessorySavePayload } from "../../../forms/schema/itemSchemas/accessory";
import { buildArmorFormState, buildArmorSavePayload } from "../../../forms/schema/itemSchemas/armor";
import { buildShieldFormState, buildShieldSavePayload } from "../../../forms/schema/itemSchemas/shield";
import { buildCustomWeaponFormState, buildCustomWeaponSavePayload } from "../../../forms/schema/itemSchemas/customWeapon";
import ItemEditModal from "../../../forms/ui/ItemEditModal";
import { useCompendiumPacks } from "../../../hooks/useCompendiumPacks";
import { useChatMessagesStore } from "../../../store/chatMessagesStore";
import {
  buildAccuracyCheckMessage,
  prepareAccuracyCheck,
  processAccuracyCheck,
  rollAccuracyCheck,
} from "../../app-drawer/panels/chat/domain/accuracy-checks";
import { OpenBracket, CloseBracket } from "../../Bracket";

function isTransformingCustomWeapon(item) {
  return Boolean(
    item?.customizations?.some(
      (c) => c?.name === "weapon_customization_transforming",
    ),
  );
}

function resolveSlotLabel(item, source, index, slots) {
  const mainRef = slots?.mainHand;
  const offRef = slots?.offHand;
  const inMain =
    mainRef?.source === source &&
    (mainRef?.index === index || mainRef?.name === item?.name);
  const inOff =
    offRef?.source === source &&
    (offRef?.index === index || offRef?.name === item?.name);
  if (inMain && inOff) return "M+O";
  if (inMain) return "M";
  if (inOff) return "O";
  return null;
}

function metaText(item, equipType) {
  if (equipType === "accessory") return null;

  if (equipType === "shield" || equipType === "armor") {
    const def = item?.def ?? 0;
    const mdef = item?.mdef ?? 0;
    return (
      <>
        <OpenBracket />
        DEF:{def}
        <CloseBracket />
        {" \u2b25 "}
        <OpenBracket />
        MDEF:{mdef}
        <CloseBracket />
      </>
    );
  }

  const a1 = item?.accuracy?.attr1?.slice(0, 3)?.toUpperCase?.() || "DEX";
  const a2 = item?.accuracy?.attr2?.slice(0, 3)?.toUpperCase?.() || "MIG";
  const acc = item?.accuracy?.value ?? 0;
  const dmg = item?.damage?.value ?? 0;
  const type = item?.damage?.type ? ` ${item.damage.type}` : "";
  const hr = item?.damage?.hrZero ? "HR0" : "HR+";
  return (
    <>
      <OpenBracket />
      {a1}+{a2}
      <CloseBracket />
      {acc ? `${acc > 0 ? "+" : ""}${acc}` : ""}
      {" \u2b25 "}
      <OpenBracket />
      {hr}
      {dmg}
      <CloseBracket />
      {type}
    </>
  );
}

function EquipmentRow({ row, player, setPlayer, canEdit, onEditItem }) {
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const { ensurePersonalPack, addItem } = useCompendiumPacks();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const { item, source, index } = row;
  const CONTROL_SIZE = 32;
  const slots = player?.equippedSlots ?? {};
  const slotLabel = resolveSlotLabel(item, source, index, slots);
  const isEquipped = Boolean(slotLabel);
  const isCustom = source === "customWeapons";
  const isTwoHand = isCustom || item?.hands === 2 || item?.isTwoHand;
  const isTransforming = isCustom && isTransformingCustomWeapon(item);

  const equipType =
    source === "customWeapons"
      ? "custom-weapon"
      : source === "weapons"
        ? "weapon"
        : source === "shields"
          ? "shield"
          : source === "armor"
            ? "armor"
            : "accessory";

  const isMeleeWeapon =
    equipType === "weapon" || equipType === "custom-weapon"
      ? Boolean(
          item?.melee ||
            item?.range === "weapon_range_melee" ||
            item?.range === "melee",
        )
      : false;

  const EquipIcon =
    equipType === "weapon" || equipType === "custom-weapon"
      ? isMeleeWeapon
        ? MeleeIcon
        : DistanceIcon
      : equipType === "armor"
        ? ArmorIcon
        : equipType === "shield"
          ? ShieldIcon
          : AccessoryIcon;

  const onEquipToggle = (e) => {
    e.stopPropagation();
    if (!canEdit) return;

    if (isEquipped) {
      setPlayer((prev) => {
        let next = prev;
        if (slotLabel.includes("M")) next = clearSlotAction(next, "mainHand");
        if (slotLabel.includes("O")) next = clearSlotAction(next, "offHand");
        return next;
      });
      return;
    }

    const targetSlot =
      isTwoHand || !slots.mainHand
        ? "mainHand"
        : !slots.offHand
          ? "offHand"
          : "mainHand";

    setPlayer((prev) =>
      equipItemToSlot(prev, targetSlot, {
        source,
        label: item?.name || "",
        index,
        item,
      }),
    );
  };

  const onSwap = (e) => {
    e.stopPropagation();
    if (!canEdit || !isTransforming || !isEquipped || source !== "customWeapons")
      return;
    setPlayer((prev) => {
      const eq0 = prev?.equipment?.[0] ?? {};
      const updatedCustomWeapons = (eq0.customWeapons ?? []).map((cw, i) =>
        i !== index
          ? cw
          : {
              ...cw,
              activeForm: cw.activeForm === "secondary" ? "primary" : "secondary",
            },
      );
      const equipment = prev?.equipment
        ? [{ ...eq0, customWeapons: updatedCustomWeapons }, ...prev.equipment.slice(1)]
        : [{ ...eq0, customWeapons: updatedCustomWeapons }];
      return { ...prev, equipment };
    });
  };

  const onDeleteItem = (e) => {
    e.stopPropagation();
    if (!canEdit) return;
    setPlayer((prev) => {
      const eq0 = prev?.equipment?.[0] ?? {};
      const nextArr = (eq0?.[source] ?? []).filter((_, i) => i !== index);
      const equipment = prev?.equipment
        ? [{ ...eq0, [source]: nextArr }, ...prev.equipment.slice(1)]
        : [{ ...eq0, [source]: nextArr }];
      return { ...prev, equipment };
    });
  };

  const onEdit = (e) => {
    e.stopPropagation();
    if (!canEdit || !onEditItem) return;
    onEditItem(source, index, item);
  };

  const onAddToCompendium = async (e) => {
    e.stopPropagation();
    const typeMap = {
      weapons: "weapon",
      customWeapons: "custom-weapon",
      shields: "shield",
      armor: "armor",
      accessories: "accessory",
    };
    const dataType = typeMap[source];
    if (!dataType) return;
    const pack = await ensurePersonalPack();
    await addItem(pack.id, dataType, item);
  };

  const onRoll = (e) => {
    e.stopPropagation();
    if (!item?.accuracy) return;
    const attr1 = item.accuracy?.attr1 || "dexterity";
    const attr2 = item.accuracy?.attr2 || "might";
    const dieSizes = {
      primary: player?.attributes?.[attr1]?.base ?? player?.attributes?.[attr1] ?? 6,
      secondary: player?.attributes?.[attr2]?.base ?? player?.attributes?.[attr2] ?? 6,
    };
    const toRollKey = (attr) => {
      const key = String(attr || "").toLowerCase();
      if (key.startsWith("dex")) return "dex";
      if (key.startsWith("ins")) return "ins";
      if (key.startsWith("mig")) return "mig";
      if (key.startsWith("wil") || key.startsWith("wlp")) return "wlp";
      return "dex";
    };

    const intent = prepareAccuracyCheck({
      attr1: toRollKey(attr1),
      attr2: toRollKey(attr2),
      accuracyBonus: item?.accuracy?.value ?? 0,
      name: item?.name || "Attack",
      description: item?.description || undefined,
      baseDamage: item?.damage?.value ?? 0,
      damageType: item?.damage?.type ?? "physical",
      accuracyDefense: item?.accuracy?.defense ?? "def",
      range: item?.range ?? "melee",
      hrZero: item?.damage?.hrZero === true,
    });
    const rolls = rollAccuracyCheck(dieSizes);
    const result = processAccuracyCheck(intent, rolls, dieSizes, player?.name || "Player");
    addMessage(buildAccuracyCheckMessage(result));
  };

  const renderExpandedCard = () => {
    if (source === "weapons") return <SharedWeaponCard item={item} />;
    if (source === "customWeapons") {
      const cardItem = {
        ...item,
        secondWeaponName: item?.secondWeaponName ?? item?.secondName,
        secondSelectedCategory: item?.secondSelectedCategory ?? item?.secondCategory,
        secondSelectedRange: item?.secondSelectedRange ?? item?.secondRange,
        secondCurrentCustomizations:
          item?.secondCurrentCustomizations ?? item?.secondCustomizations,
      };
      return (
        <SharedCustomWeaponCard
          variant="sheet"
          item={{
            ...cardItem,
            hands: 2,
            cost: cardItem?.cost || 300,
            defModifier: cardItem?.defModifier || 0,
            mDefModifier: cardItem?.mDefModifier || 0,
            overrideDamageType: cardItem?.overrideDamageType || false,
          }}
          sphereData={buildSphereData(
            { slots: cardItem?.slots, slotted: cardItem?.slotted },
            player,
          )}
        />
      );
    }
    if (source === "shields") return <SharedShieldCard item={item} />;
    if (source === "armor") {
      return <SharedArmorCard item={item} sphereData={buildSphereData(item, player)} />;
    }
    if (source === "accessories") return <SharedAccessoryCard item={item} />;
    return null;
  };

  return (
    <Accordion disableGutters elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: 0.75, "&:before": { display: "none" }, bgcolor: "background.paper" }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: 56,
          "&.Mui-expanded": { minHeight: 56 },
          "& .MuiAccordionSummary-expandIconWrapper": {
            width: CONTROL_SIZE,
            height: CONTROL_SIZE,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 0.25,
          },
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            minWidth: 0,
            my: 0,
            "&.Mui-expanded": { my: 0 },
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }} onClick={(e) => e.stopPropagation()}>
          <Box sx={{ width: CONTROL_SIZE, height: CONTROL_SIZE, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Tooltip title="Roll">
              <IconButton component="span" size="small" onClick={onRoll} sx={{ width: CONTROL_SIZE, height: CONTROL_SIZE, p: 0.5 }}>
                <Casino sx={{ fontSize: "1.2rem" }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ width: CONTROL_SIZE, height: CONTROL_SIZE, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconButton
              component="span"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setMenuAnchorEl(e.currentTarget);
              }}
              sx={{ width: CONTROL_SIZE, height: CONTROL_SIZE, p: 0.5 }}
            >
              <MenuIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </Box>
          <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={() => setMenuAnchorEl(null)}>
            <MenuItem onClick={async (e) => { await onAddToCompendium(e); setMenuAnchorEl(null); }}>
              <ListItemText>Add to Compendium</ListItemText>
            </MenuItem>
            {isTransforming && (
              <MenuItem disabled={!isEquipped} onClick={(e) => { onSwap(e); setMenuAnchorEl(null); }}>
                <ListItemIcon><CompareArrowsIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Swap Form</ListItemText>
              </MenuItem>
            )}
            <MenuItem onClick={(e) => { onDeleteItem(e); setMenuAnchorEl(null); }} disabled={!canEdit} sx={{ color: "error.main" }}>
              <ListItemIcon><Delete color="error" fontSize="small" /></ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: "hidden", display: "flex", alignItems: "center", minHeight: 40 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography noWrap>{item?.name || "Unnamed Weapon"}</Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={0.25} alignItems="center" justifyContent="center" onClick={(e) => e.stopPropagation()} sx={{ ml: 1, alignSelf: "stretch" }}>
          {metaText(item, equipType) ? (
            <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5, whiteSpace: "nowrap", display: "flex", alignItems: "center", minHeight: CONTROL_SIZE, lineHeight: 1 }}>
              {metaText(item, equipType)}
            </Typography>
          ) : null}

          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={onEdit}
              disabled={!canEdit || !onEditItem}
              sx={{
                width: CONTROL_SIZE,
                height: CONTROL_SIZE,
                p: 0.5,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.primary",
                "& .MuiSvgIcon-root": { fontSize: "1.2rem" },
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>

          <Box sx={{ width: CONTROL_SIZE, height: CONTROL_SIZE, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Tooltip title={isEquipped ? "Unequip" : "Equip"}>
              <Badge badgeContent={slotLabel || null} color="primary" invisible={!slotLabel} sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", height: 14, minWidth: 14 } }}>
                <IconButton
                  size="small"
                  onClick={onEquipToggle}
                  disabled={!canEdit}
                  sx={{ p: 0.5, width: CONTROL_SIZE, height: CONTROL_SIZE, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "text.primary", opacity: 1, "& .MuiSvgIcon-root": { fontSize: "1.25rem", opacity: 1 } }}
                >
                  {isEquipped ? <EquipIcon /> : canEdit ? <RadioButtonUnchecked sx={{ fontSize: "1.2rem" }} /> : <ErrorIcon sx={{ fontSize: "1.2rem", color: "error.main" }} />}
                </IconButton>
              </Badge>
            </Tooltip>
          </Box>

          {isTransforming && (
            <Box sx={{ width: CONTROL_SIZE, height: CONTROL_SIZE, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconButton
                size="small"
                onClick={onSwap}
                disabled={!canEdit || !isEquipped}
                sx={{ p: 0.5, width: CONTROL_SIZE, height: CONTROL_SIZE, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "text.primary", opacity: 1, "& .MuiSvgIcon-root": { fontSize: "1.25rem", opacity: 1 } }}
              >
                <CompareArrowsIcon />
              </IconButton>
            </Box>
          )}
        </Stack>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={1}>
          <Box>{renderExpandedCard()}</Box>
          {item?.description ? (
            <Typography variant="caption" color="text.secondary">{item.description}</Typography>
          ) : null}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

function EquipmentGroup({
  title,
  rows,
  player,
  setPlayer,
  canEdit,
  headerType,
  onOpenCompendium,
  onAddItem,
  onEditItem,
}) {
  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <CustomHeader
          type={headerType}
          headerText={title}
          showIconButton={canEdit}
          icon={Add}
          addItem={onAddItem}
          openCompendium={onOpenCompendium}
        />
      </Grid>
      <Grid size={12}>
        {rows.length === 0 ? (
          <Typography color="text.secondary" variant="body2">No items.</Typography>
        ) : (
          <Grid container spacing={1}>
            {rows.map((row) => (
              <Grid key={`${row.source}-${row.index}-${row.item?.name}`} size={{ xs: 12, md: 6 }}>
                <EquipmentRow
                  row={row}
                  player={player}
                  setPlayer={setPlayer}
                  canEdit={canEdit}
                  onEditItem={onEditItem}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}

export default function EditPlayerEquipment({ player, setPlayer, isEditMode }) {
  const [compendiumOpen, setCompendiumOpen] = useState(false);
  const [compendiumType, setCompendiumType] = useState("weapons");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSource, setEditSource] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const isTechnospheres = player?.settings?.optionalRules?.technospheres ?? false;

  const inv = player?.equipment?.[0] || {};
  const weapons = (inv?.weapons || []).map((item, index) => ({ item, source: "weapons", index }));
  const customWeapons = (inv?.customWeapons || []).map((item, index) => ({ item, source: "customWeapons", index }));
  const shields = (inv?.shields || []).map((item, index) => ({ item, source: "shields", index }));
  const armor = (inv?.armor || []).map((item, index) => ({ item, source: "armor", index }));
  const accessories = (inv?.accessories || []).map((item, index) => ({ item, source: "accessories", index }));

  const patchInv = (source, updater) => {
    setPlayer((prev) => {
      const eq0 = {
        ...(prev?.equipment?.[0] ?? {}),
        [source]: updater(prev?.equipment?.[0]?.[source] ?? []),
      };
      const equipment = prev?.equipment ? [eq0, ...prev.equipment.slice(1)] : [eq0];
      return { ...prev, equipment };
    });
  };

  const SOURCE_TO_ITEM_TYPE = {
    weapons: "weapon",
    customWeapons: "customWeapon",
    shields: "shield",
    armor: "armor",
    accessories: "accessory",
  };

  const openEditDialog = (source, index, item) => {
    setEditSource(source);
    setEditIndex(index);
    setEditItem(item ?? null);
    setEditDialogOpen(true);
  };

  const saveEditDialog = (savedItem) => {
    if (!editSource || editIndex == null) return;
    patchInv(editSource, (arr) =>
      arr.map((it, i) => (i === editIndex ? savedItem : it)),
    );
    setEditDialogOpen(false);
  };

  const deleteEditDialog = (index) => {
    if (!editSource || index == null) return;
    patchInv(editSource, (arr) => arr.filter((_, i) => i !== index));
    setEditDialogOpen(false);
  };

  const handleAddNew = (source) => {
    if (!isEditMode) return;
    if (source === "weapons") {
      patchInv("weapons", (arr) => [...arr, normalizeWeaponLike({ name: "New Weapon", isEquipped: false })]);
      return;
    }
    if (source === "customWeapons") {
      patchInv("customWeapons", (arr) => [...arr, buildCustomWeaponSavePayload(buildCustomWeaponFormState(null))]);
      return;
    }
    if (source === "shields") {
      patchInv("shields", (arr) => [...arr, buildShieldSavePayload(buildShieldFormState(null))]);
      return;
    }
    if (source === "armor") {
      patchInv("armor", (arr) => [...arr, buildArmorSavePayload(buildArmorFormState(null))]);
      return;
    }
    if (source === "accessories") {
      patchInv("accessories", (arr) => [...arr, buildAccessorySavePayload(buildAccessoryFormState(null))]);
    }
  };

  const handleImportFromCompendium = (type, item) => {
    if (type === "weapons") {
      patchInv("weapons", (arr) => [...arr, normalizeWeaponLike({ ...item, base: item, name: item.name, isEquipped: false })]);
      return;
    }
    if (type === "custom-weapons") {
      patchInv("customWeapons", (arr) => [...arr, { ...item, isEquipped: false }]);
      return;
    }
    if (type === "armor") {
      patchInv("armor", (arr) => [...arr, { ...item, isEquipped: false }]);
      return;
    }
    if (type === "shields") {
      patchInv("shields", (arr) => [...arr, { ...item, isEquipped: false }]);
      return;
    }
    if (type === "accessories") {
      patchInv("accessories", (arr) => [...arr, { ...item, isEquipped: false }]);
    }
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: "15px", borderRadius: "8px", border: "2px solid", borderColor: "secondary.main" }}>
        <Stack spacing={2}>
          <EquipmentGroup
            title="Weapon"
            rows={weapons}
            player={player}
            setPlayer={setPlayer}
            canEdit={isEditMode}
            headerType="top"
            onOpenCompendium={() => { setCompendiumType("weapons"); setCompendiumOpen(true); }}
            onAddItem={() => handleAddNew("weapons")}
            onEditItem={openEditDialog}
          />
          <EquipmentGroup
            title="Custom Weapon"
            rows={customWeapons}
            player={player}
            setPlayer={setPlayer}
            canEdit={isEditMode}
            headerType="middle"
            onOpenCompendium={() => { setCompendiumType("custom-weapons"); setCompendiumOpen(true); }}
            onAddItem={() => handleAddNew("customWeapons")}
            onEditItem={openEditDialog}
          />
          <EquipmentGroup
            title="Shield"
            rows={shields}
            player={player}
            setPlayer={setPlayer}
            canEdit={isEditMode}
            headerType="middle"
            onOpenCompendium={() => { setCompendiumType("shields"); setCompendiumOpen(true); }}
            onAddItem={() => handleAddNew("shields")}
            onEditItem={openEditDialog}
          />
          <EquipmentGroup
            title="Armor"
            rows={armor}
            player={player}
            setPlayer={setPlayer}
            canEdit={isEditMode}
            headerType="middle"
            onOpenCompendium={() => { setCompendiumType("armor"); setCompendiumOpen(true); }}
            onAddItem={() => handleAddNew("armor")}
            onEditItem={openEditDialog}
          />
          <EquipmentGroup
            title="Accessory"
            rows={accessories}
            player={player}
            setPlayer={setPlayer}
            canEdit={isEditMode}
            headerType="middle"
            onOpenCompendium={() => { setCompendiumType("accessories"); setCompendiumOpen(true); }}
            onAddItem={() => handleAddNew("accessories")}
            onEditItem={openEditDialog}
          />
        </Stack>
      </Paper>

      <CompendiumViewerModal
        open={compendiumOpen}
        onClose={() => setCompendiumOpen(false)}
        onAddItem={(item) => handleImportFromCompendium(compendiumType, item)}
        initialType={compendiumType}
        restrictToTypes={[compendiumType]}
        context="player"
      />

      <ItemEditModal
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        itemType={SOURCE_TO_ITEM_TYPE[editSource]}
        item={editItem}
        editIndex={editIndex}
        onSave={saveEditDialog}
        onDelete={deleteEditDialog}
        ctx={{ player, setPlayer }}
      />

      {isTechnospheres && (
        <>
          <Box sx={{ my: 2 }} />
          <SphereInventory
            player={player}
            setPlayer={setPlayer}
            isEditMode={isEditMode}
            advancement={player?.settings?.advancement ?? false}
          />
        </>
      )}
    </>
  );
}
