import React, { useRef } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Paper,
  Grid,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { UploadFile, WarningAmber } from "@mui/icons-material";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import { useTranslate } from "../../../translation/translate";
import useUploadJSON from "../../../hooks/useUploadJSON";
import CustomHeader from "../../common/CustomHeader";
import PlayerWeapons from "./weapons/PlayerWeapons";
import PlayerCustomWeapons from "./customWeapons/PlayerCustomWeapons";
import PlayerArmor from "./armor/PlayerArmor";
import PlayerShields from "./shields/PlayerShields";
import PlayerAccessories from "./accessories/PlayerAccessories";
import PlayerWeaponModal from "./weapons/PlayerWeaponModal";
import PlayerCustomWeaponModal from "./customWeapons/PlayerCustomWeaponModal";
import PlayerArmorModal from "./armor/PlayerArmorModal";
import PlayerShieldModal from "./shields/PlayerShieldModal";
import PlayerAccessoryModal from "./accessories/PlayerAccessoryModal";
import CompendiumViewerModal from "../../compendium/CompendiumViewerModal";

import { MeleeIcon, ArmorIcon, ShieldIcon, AccessoryIcon } from "../../icons";
import { deriveVehicleSlots, validateSlots } from "./slots/equipmentSlots";

export default function EditPlayerEquipment({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [openNewWeapon, setOpenNewWeapon] = React.useState(false);
  const [editWeaponIndex, setEditWeaponIndex] = React.useState(null);
  const [weapon, setWeapon] = React.useState(null);

  const [openNewCustomWeapon, setOpenNewCustomWeapon] = React.useState(false);
  const [editCustomWeaponIndex, setEditCustomWeaponIndex] =
    React.useState(null);
  const [customWeapon, setCustomWeapon] = React.useState(null);

  const [openNewArmor, setOpenNewArmor] = React.useState(false);
  const [editArmorIndex, setEditArmorIndex] = React.useState(null);
  const [armor, setArmor] = React.useState(null);

  const [openNewShields, setOpenNewShields] = React.useState(false);
  const [editShieldIndex, setEditShieldIndex] = React.useState(null);
  const [shields, setShields] = React.useState(null);

  const [openNewAccessory, setOpenNewAccessory] = React.useState(false);
  const [editAccessoryIndex, setEditAccessoryIndex] = React.useState(null);
  const [accessory, setAccessory] = React.useState(null);

  const [openEquipmentCompendium, setOpenEquipmentCompendium] =
    React.useState(false);
  const [openWeaponCompendium, setOpenWeaponCompendium] = React.useState(false);
  const [openArmorCompendium, setOpenArmorCompendium] = React.useState(false);
  const [openShieldCompendium, setOpenShieldCompendium] = React.useState(false);
  const [openCustomWeaponCompendium, setOpenCustomWeaponCompendium] =
    React.useState(false);
  const [openAccessoryCompendium, setOpenAccessoryCompendium] =
    React.useState(false);
  const [martialWarning, setMartialWarning] = React.useState(null); // { itemName, onConfirm }

  const inv = player.equipment?.[0] || {};

  const MARTIAL_CUSTOMIZATIONS = [
    "weapon_customization_quick",
    "weapon_customization_magicdefenseboost",
    "weapon_customization_powerful",
  ];

  // Helper: update one source array inside equipment[0] and return a new player.
  const patchInv = (p, source, updater) => {
    const eq0 = {
      ...(p.equipment?.[0] ?? {}),
      [source]: updater(p.equipment?.[0]?.[source] ?? []),
    };
    const equipment = p.equipment ? [eq0, ...p.equipment.slice(1)] : [eq0];
    return { ...p, equipment };
  };

  const hasMartialProficiency = (itemType, item) => {
    if (!item) return false;

    let isMartial = false;
    if (itemType === "customWeapons") {
      isMartial = (item.customizations ?? []).some((c) =>
        MARTIAL_CUSTOMIZATIONS.includes(c.name),
      );
    } else {
      isMartial = !!item.martial;
    }
    if (!isMartial) return true;

    for (const cls of player?.classes ?? []) {
      const martials = cls.benefits?.martials;
      if (!martials) continue;
      const shieldProf = !!(martials.shield || martials.shields);
      if (itemType === "weapons" && item.melee && martials.melee) return true;
      if (itemType === "weapons" && item.ranged && martials.ranged) return true;
      if (
        itemType === "customWeapons" &&
        item.range === "weapon_range_ranged" &&
        martials.ranged
      )
        return true;
      if (
        itemType === "customWeapons" &&
        item.range !== "weapon_range_ranged" &&
        martials.melee
      )
        return true;
      if (itemType === "shields" && shieldProf) return true;
      if (itemType === "armor" && martials.armor) return true;
      if (itemType === "accessories") return true;
    }

    return false;
  };

  const guardMartialEquip = (itemType, item, onConfirm) => {
    if (hasMartialProficiency(itemType, item)) {
      onConfirm();
      return;
    }
    setMartialWarning({ itemName: item?.name ?? "", onConfirm });
  };

  // For add/edit/delete operations: preserve existing equippedSlots (only clear slots
  // whose items no longer exist), then refresh vehicleSlots. Do NOT re-derive
  // equippedSlots from isEquipped flags : that would unequip items when saving edits.
  const preserveSlots = (p) => {
    const validated = validateSlots(p);
    return { ...validated, vehicleSlots: deriveVehicleSlots(validated) };
  };

  // FILE UPLOAD
  const fileInputRef = useRef(null);

  const { handleFileUpload } = useUploadJSON((data) => {
    if (data && data.dataType) {
      switch (data.dataType) {
        case "weapon":
          if (data.customizations) {
            handleAddCustomWeapon(data);
          } else {
            handleAddWeapon(data);
          }
          break;
        case "armor":
          handleAddArmor(data);
          break;
        case "shield":
          handleAddShield(data);
          break;
        case "accessory":
          handleAddAccessory(data);
          break;
        default:
          console.warn("Unknown equipment type:", data.dataType);
      }
    }
  });

  const handleUploadJSON = () => {
    fileInputRef.current.click();
  };

  // OPEN MODALS
  const handleOpenNewWeapon = () => {
    setWeapon(null);
    setEditWeaponIndex(null);
    setOpenNewWeapon(true);
  };

  const handleOpenNewCustomWeapon = () => {
    setCustomWeapon(null);
    setEditCustomWeaponIndex(null);
    setOpenNewCustomWeapon(true);
  };

  const handleOpenNewArmor = () => {
    setArmor(null);
    setEditArmorIndex(null);
    setOpenNewArmor(true);
  };

  const handleOpenNewShield = () => {
    setShields(null);
    setEditShieldIndex(null);
    setOpenNewShields(true);
  };

  const handleOpenNewAccessory = () => {
    setAccessory(null);
    setEditAccessoryIndex(null);
    setOpenNewAccessory(true);
  };

  // CLOSE MODALS
  const handleCloseNewWeapon = () => {
    setOpenNewWeapon(false);
    setWeapon(null);
    setEditWeaponIndex(null);
  };

  const handleCloseNewCustomWeapon = () => {
    setOpenNewCustomWeapon(false);
    setCustomWeapon(null);
    setEditCustomWeaponIndex(null);
  };

  const handleCloseNewArmor = () => {
    setOpenNewArmor(false);
    setArmor(null);
    setEditArmorIndex(null);
  };

  const handleCloseNewShield = () => {
    setOpenNewShields(false);
    setShields(null);
    setEditShieldIndex(null);
  };

  const handleCloseNewAccessory = () => {
    setOpenNewAccessory(false);
    setAccessory(null);
    setEditAccessoryIndex(null);
  };

  // ADD NEW
  const handleAddWeapon = (newWeapon) => {
    const updated = patchInv(player, "weapons", (arr) => [...arr, newWeapon]);
    setPlayer(preserveSlots(updated));
  };

  const handleAddCustomWeapon = (newCustomWeapon) => {
    const updated = patchInv(player, "customWeapons", (arr) => [
      ...arr,
      newCustomWeapon,
    ]);
    setPlayer(preserveSlots(updated));
  };

  const handleAddArmor = (newArmor) => {
    const updated = patchInv(player, "armor", (arr) => [...arr, newArmor]);
    setPlayer(preserveSlots(updated));
  };

  const handleAddShield = (newShields) => {
    const updated = patchInv(player, "shields", (arr) => [...arr, newShields]);
    setPlayer(preserveSlots(updated));
  };

  const handleAddAccessory = (newAccessory) => {
    const updated = patchInv(player, "accessories", (arr) => [
      ...arr,
      newAccessory,
    ]);
    setPlayer(preserveSlots(updated));
  };

  const handleImportFromCompendium = (equipType, itemData) => {
    if (equipType === "weapon") {
      handleAddWeapon({
        base: itemData,
        name: itemData.name,
        category: itemData.category || "",
        melee: itemData.melee || false,
        ranged: !itemData.melee,
        type: itemData.type,
        hands: itemData.hands,
        att1: itemData.att1,
        att2: itemData.att2,
        martial: itemData.martial || false,
        damageBonus: false,
        damageReworkBonus: false,
        precBonus: false,
        rework: false,
        quality: "",
        qualityCost: 0,
        totalBonus: 0,
        selectedQuality: "",
        cost: itemData.cost || 0,
        damage: itemData.damage || 0,
        prec: itemData.prec || 0,
        isEquipped: false,
      });
    } else if (equipType === "armor") {
      handleAddArmor({
        base: itemData,
        name: itemData.name,
        quality: "",
        martial: itemData.martial || false,
        qualityCost: 0,
        selectedQuality: "",
        init: itemData.init || 0,
        rework: false,
        cost: itemData.cost || 0,
        def: (itemData.def || 0) + (itemData.defbonus || 0),
        mdef: (itemData.mdef || 0) + (itemData.mdefbonus || 0),
        isEquipped: false,
      });
    } else if (equipType === "shield") {
      handleAddShield({
        base: itemData,
        name: itemData.name,
        quality: "",
        martial: itemData.martial || false,
        qualityCost: 0,
        selectedQuality: "",
        init: itemData.init || 0,
        rework: false,
        cost: itemData.cost || 0,
        def: (itemData.def || 0) + (itemData.defbonus || 0),
        mdef: (itemData.mdef || 0) + (itemData.mdefbonus || 0),
        isEquipped: false,
      });
    } else if (equipType === "custom-weapon") {
      handleAddCustomWeapon({ ...itemData, isEquipped: false });
    } else if (equipType === "accessory") {
      handleAddAccessory({ ...itemData, isEquipped: false });
    }
  };

  // DELETE
  const handleDeleteWeapon = (index) => {
    const updated = patchInv(player, "weapons", (arr) =>
      arr.filter((_, i) => i !== index),
    );
    setPlayer(preserveSlots(updated));
  };

  const handleDeleteCustomWeapon = (index) => {
    const updated = patchInv(player, "customWeapons", (arr) =>
      arr.filter((_, i) => i !== index),
    );
    setPlayer(preserveSlots(updated));
  };

  const handleDeleteArmor = (index) => {
    const updated = patchInv(player, "armor", (arr) =>
      arr.filter((_, i) => i !== index),
    );
    setPlayer(preserveSlots(updated));
  };

  const handleDeleteShield = (index) => {
    const updated = patchInv(player, "shields", (arr) =>
      arr.filter((_, i) => i !== index),
    );
    setPlayer(preserveSlots(updated));
  };

  const handleDeleteAccessory = (index) => {
    const updated = patchInv(player, "accessories", (arr) =>
      arr.filter((_, i) => i !== index),
    );
    setPlayer(preserveSlots(updated));
  };

  // EDIT
  const handleEditWeapon = (index) => {
    setWeapon(inv.weapons[index]);
    setEditWeaponIndex(index);
    setOpenNewWeapon(true);
  };

  const handleEditCustomWeapon = (index) => {
    setCustomWeapon(inv.customWeapons[index]);
    setEditCustomWeaponIndex(index);
    setOpenNewCustomWeapon(true);
  };

  const handleEditArmor = (index) => {
    setArmor(inv.armor[index]);
    setEditArmorIndex(index);
    setOpenNewArmor(true);
  };

  const handleEditShield = (index) => {
    setShields(inv.shields[index]);
    setEditShieldIndex(index);
    setOpenNewShields(true);
  };

  const handleEditAccessory = (index) => {
    setAccessory(inv.accessories[index]);
    setEditAccessoryIndex(index);
    setOpenNewAccessory(true);
  };

  // SAVE
  const handleSaveWeapon = (updatedWeapon) => {
    if (editWeaponIndex !== null) {
      const updated = patchInv(player, "weapons", (arr) =>
        arr.map((weapon, i) =>
          i === editWeaponIndex ? updatedWeapon : weapon,
        ),
      );
      setPlayer(preserveSlots(updated));
    } else {
      handleAddWeapon(updatedWeapon);
    }
    setOpenNewWeapon(false);
  };

  const handleSaveCustomWeapon = (updatedCustomWeapon) => {
    if (editCustomWeaponIndex !== null) {
      const updated = patchInv(player, "customWeapons", (arr) =>
        arr.map((customWeapon, i) =>
          i === editCustomWeaponIndex ? updatedCustomWeapon : customWeapon,
        ),
      );
      setPlayer(preserveSlots(updated));
    } else {
      handleAddCustomWeapon(updatedCustomWeapon);
    }
    setOpenNewCustomWeapon(false);
  };

  const handleSaveArmor = (updatedArmor) => {
    if (editArmorIndex !== null) {
      const updated = patchInv(player, "armor", (arr) =>
        arr.map((armor, i) => (i === editArmorIndex ? updatedArmor : armor)),
      );
      setPlayer(preserveSlots(updated));
    } else {
      handleAddArmor(updatedArmor);
    }
    setOpenNewArmor(false);
  };

  const handleSaveShield = (updatedShield) => {
    if (editShieldIndex !== null) {
      const updated = patchInv(player, "shields", (arr) =>
        arr.map((shield, i) =>
          i === editShieldIndex ? updatedShield : shield,
        ),
      );
      setPlayer(preserveSlots(updated));
    } else {
      handleAddShield(updatedShield);
    }
    setOpenNewShields(false);
  };

  const handleSaveAccessory = (updatedAccessory) => {
    if (editAccessoryIndex !== null) {
      const updated = patchInv(player, "accessories", (arr) =>
        arr.map((accessory, i) =>
          i === editAccessoryIndex ? updatedAccessory : accessory,
        ),
      );
      setPlayer(preserveSlots(updated));
    } else {
      handleAddAccessory(updatedAccessory);
    }
    setOpenNewAccessory(false);
  };

  // TOGGLE EQUIPPED

  // Equip an item to a specific slot, displacing the current occupant.
  const equipToSlot = (source, itemName, itemIndex, slot, isTwoHand) => {
    let updated = player;

    // Clear current occupant of the target slot
    const currentRef = updated.equippedSlots?.[slot];
    if (currentRef) {
      updated = patchInv(updated, currentRef.source, (arr) =>
        arr.map((it, idx) => {
          const match =
            currentRef.index !== undefined
              ? idx === currentRef.index
              : it.name === currentRef.name;
          return match ? { ...it, isEquipped: false } : it;
        }),
      );
    }

    // 2H in mainHand also clears offHand
    if (isTwoHand && slot === "mainHand") {
      const offRef = updated.equippedSlots?.offHand;
      if (offRef) {
        updated = patchInv(updated, offRef.source, (arr) =>
          arr.map((it, idx) => {
            const match =
              offRef.index !== undefined
                ? idx === offRef.index
                : it.name === offRef.name;
            return match ? { ...it, isEquipped: false } : it;
          }),
        );
      }
    }

    // Equip the item
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

  // Unequip an item by clearing whichever slot it currently occupies.
  const unequipItem = (source, itemName, itemIndex) => {
    const slots = player.equippedSlots ?? {};
    const slotKey = Object.keys(slots).find((k) => {
      const ref = slots[k];
      if (!ref || ref.source !== source) return false;
      if (ref.index !== undefined && itemIndex !== undefined)
        return ref.index === itemIndex;
      return ref.name === itemName;
    });
    const slotRef = slotKey ? slots[slotKey] : null;

    let updated = patchInv(player, source, (arr) =>
      arr.map((it, idx) => {
        const match =
          slotRef?.index !== undefined
            ? idx === slotRef.index
            : it.name === itemName;
        return match ? { ...it, isEquipped: false } : it;
      }),
    );

    if (slotKey) {
      const prevSlots = updated.equippedSlots ?? {
        mainHand: null,
        offHand: null,
        armor: null,
        accessory: null,
      };
      setPlayer({
        ...updated,
        equippedSlots: { ...prevSlots, [slotKey]: null },
        vehicleSlots: deriveVehicleSlots(updated),
      });
    } else {
      setPlayer(preserveSlots(updated));
    }
  };

  const handleEquipWeapon = (index, slot) => {
    const weapon = (inv.weapons ?? [])[index];
    if (!weapon) return;
    guardMartialEquip("weapons", weapon, () => {
      equipToSlot(
        "weapons",
        weapon.name,
        index,
        slot,
        weapon.hands === 2 || weapon.isTwoHand,
      );
    });
  };

  const handleUnequipWeapon = (index) => {
    const weapon = (inv.weapons ?? [])[index];
    if (!weapon) return;
    unequipItem("weapons", weapon.name, index);
  };

  const handleEquipCustomWeapon = (index) => {
    const cw = (inv.customWeapons ?? [])[index];
    if (!cw) return;
    guardMartialEquip("customWeapons", cw, () => {
      equipToSlot("customWeapons", cw.name, index, "mainHand", true);
    });
  };

  const handleUnequipCustomWeapon = (index) => {
    const cw = (inv.customWeapons ?? [])[index];
    if (!cw) return;
    unequipItem("customWeapons", cw.name, index);
  };

  const handleUpdateCustomWeapons = (updatedCustomWeapons) => {
    const updated = patchInv(
      player,
      "customWeapons",
      () => updatedCustomWeapons,
    );
    setPlayer(preserveSlots(updated));
  };

  const handleEquipArmor = (armorIndex) => {
    const armor = (inv.armor ?? [])[armorIndex];
    if (!armor) return;
    if (armor.isEquipped) {
      unequipItem("armor", armor.name, armorIndex);
    } else {
      guardMartialEquip("armor", armor, () => {
        equipToSlot("armor", armor.name, armorIndex, "armor", false);
      });
    }
  };

  const handleEquipShield = (index, slot) => {
    const shield = (inv.shields ?? [])[index];
    if (!shield) return;
    guardMartialEquip("shields", shield, () => {
      equipToSlot("shields", shield.name, index, slot, false);
    });
  };

  const handleUnequipShield = (index) => {
    const shield = (inv.shields ?? [])[index];
    if (!shield) return;
    unequipItem("shields", shield.name, index);
  };

  const handleEquipAccessory = (accessoryIndex) => {
    const accessory = (inv.accessories ?? [])[accessoryIndex];
    if (!accessory) return;
    if (accessory.isEquipped) {
      unequipItem("accessories", accessory.name, accessoryIndex);
    } else {
      guardMartialEquip("accessories", accessory, () => {
        equipToSlot(
          "accessories",
          accessory.name,
          accessoryIndex,
          "accessory",
          false,
        );
      });
    }
  };

  return (
    <>
      {isEditMode ? (
        <>
          <Paper
            elevation={3}
            sx={{
              p: "15px",
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
            }}
          >
            <Grid container spacing={2}>
              <Grid size={12}>
                <CustomHeader
                  type="top"
                  headerText={t("Equipment")}
                  showIconButton={false}
                />
              </Grid>
              <Grid container sx={{ justifyContent: "center" }} spacing={2}>
                <Grid
                  container
                  sx={{ justifyContent: "center" }}
                  size={{
                    xs: 6,
                    sm: 2.4,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleOpenNewWeapon}
                    startIcon={<MeleeIcon />}
                    size="small"
                  >
                    {t("Add Weapon")}
                  </Button>
                </Grid>
                <Grid
                  container
                  sx={{ justifyContent: "center" }}
                  size={{
                    xs: 6,
                    sm: 2.4,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleOpenNewCustomWeapon}
                    startIcon={<MeleeIcon />}
                    size="small"
                  >
                    {t("Add Custom Weapon")}
                  </Button>
                </Grid>
                <Grid
                  container
                  sx={{ justifyContent: "center" }}
                  size={{
                    xs: 6,
                    sm: 2.4,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleOpenNewArmor}
                    startIcon={<ArmorIcon />}
                    disabled={inv.armor && inv.armor.length >= 10}
                    size="small"
                  >
                    {t("Add Armor")}
                  </Button>
                </Grid>
                <Grid
                  container
                  sx={{ justifyContent: "center" }}
                  size={{
                    xs: 6,
                    sm: 2.4,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleOpenNewShield}
                    startIcon={<ShieldIcon />}
                    disabled={inv.shields && inv.shields.length >= 10}
                    size="small"
                  >
                    {t("Add Shield")}
                  </Button>
                </Grid>
                <Grid
                  container
                  sx={{ justifyContent: "center" }}
                  size={{
                    xs: 6,
                    sm: 2.4,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleOpenNewAccessory}
                    startIcon={<AccessoryIcon />}
                    disabled={inv.accessories && inv.accessories.length >= 10}
                    size="small"
                  >
                    {t("Add Accessory")}
                  </Button>
                </Grid>
                <Grid
                  container
                  sx={{ justifyContent: "center" }}
                  size={{
                    xs: 6,
                    sm: "auto",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleUploadJSON}
                    startIcon={<UploadFile />}
                    size="small"
                  >
                    {t("Upload JSON")}
                  </Button>
                </Grid>
                <Grid
                  container
                  sx={{ justifyContent: "center" }}
                  size={{
                    xs: 6,
                    sm: "auto",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setOpenEquipmentCompendium(true)}
                    startIcon={<LibraryAddIcon />}
                    size="small"
                  >
                    {t("Import from Pack")}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <Divider sx={{ my: 2 }} />
        </>
      ) : null}
      <PlayerWeapons
        player={player}
        weapons={inv.weapons || []}
        onEditWeapon={handleEditWeapon}
        onDeleteWeapon={handleDeleteWeapon}
        onEquipWeapon={handleEquipWeapon}
        onUnequipWeapon={handleUnequipWeapon}
        onAddItem={handleOpenNewWeapon}
        isEditMode={isEditMode}
        onOpenCompendium={
          isEditMode ? () => setOpenWeaponCompendium(true) : undefined
        }
      />
      <PlayerCustomWeapons
        player={player}
        customWeapons={inv.customWeapons || []}
        onEditCustomWeapon={handleEditCustomWeapon}
        onDeleteCustomWeapon={handleDeleteCustomWeapon}
        onEquipCustomWeapon={handleEquipCustomWeapon}
        onUnequipCustomWeapon={handleUnequipCustomWeapon}
        onUpdateCustomWeapons={handleUpdateCustomWeapons}
        onAddItem={handleOpenNewCustomWeapon}
        onOpenCompendium={
          isEditMode ? () => setOpenCustomWeaponCompendium(true) : undefined
        }
        isEditMode={isEditMode}
      />
      <PlayerArmor
        player={player}
        armor={inv.armor || []}
        onEditArmor={handleEditArmor}
        onDeleteArmor={handleDeleteArmor}
        onEquipArmor={handleEquipArmor}
        onAddItem={handleOpenNewArmor}
        isEditMode={isEditMode}
        onOpenCompendium={
          isEditMode ? () => setOpenArmorCompendium(true) : undefined
        }
      />
      <PlayerShields
        player={player}
        shields={inv.shields || []}
        onEditShield={handleEditShield}
        onDeleteShield={handleDeleteShield}
        onEquipShield={handleEquipShield}
        onUnequipShield={handleUnequipShield}
        onAddItem={handleOpenNewShield}
        isEditMode={isEditMode}
        onOpenCompendium={
          isEditMode ? () => setOpenShieldCompendium(true) : undefined
        }
      />
      <PlayerAccessories
        player={player}
        accessories={inv.accessories || []}
        onEditAccessory={handleEditAccessory}
        onDeleteAccessory={handleDeleteAccessory}
        onEquipAccessory={handleEquipAccessory}
        onAddItem={handleOpenNewAccessory}
        onOpenCompendium={
          isEditMode ? () => setOpenAccessoryCompendium(true) : undefined
        }
        isEditMode={isEditMode}
      />
      {/* Modals */}
      <PlayerWeaponModal
        open={openNewWeapon}
        onClose={handleCloseNewWeapon}
        editWeaponIndex={editWeaponIndex}
        weapon={weapon}
        setWeapon={setWeapon}
        onAddWeapon={handleSaveWeapon}
        onDeleteWeapon={handleDeleteWeapon}
      />
      <PlayerCustomWeaponModal
        open={openNewCustomWeapon}
        onClose={handleCloseNewCustomWeapon}
        editCustomWeaponIndex={editCustomWeaponIndex}
        customWeapon={customWeapon}
        setCustomWeapon={setCustomWeapon}
        onAddCustomWeapon={handleSaveCustomWeapon}
        onDeleteCustomWeapon={handleDeleteCustomWeapon}
      />
      <PlayerArmorModal
        open={openNewArmor}
        onClose={handleCloseNewArmor}
        editArmorIndex={editArmorIndex}
        armorPlayer={armor}
        setArmorPlayer={setArmor}
        onAddArmor={handleSaveArmor}
        onDeleteArmor={handleDeleteArmor}
      />
      <PlayerShieldModal
        open={openNewShields}
        onClose={handleCloseNewShield}
        editShieldIndex={editShieldIndex}
        shield={shields}
        setShield={setShields}
        onAddShield={handleSaveShield}
        onDeleteShield={handleDeleteShield}
      />
      <PlayerAccessoryModal
        open={openNewAccessory}
        onClose={handleCloseNewAccessory}
        editAccIndex={editAccessoryIndex}
        accessory={accessory}
        onAddAccessory={handleSaveAccessory}
        onDeleteAccessory={handleDeleteAccessory}
      />
      <CompendiumViewerModal
        open={openEquipmentCompendium}
        onClose={() => setOpenEquipmentCompendium(false)}
        onAddItem={(item, type) => {
          const typeMap = {
            weapons: "weapon",
            "custom-weapons": "custom-weapon",
            armor: "armor",
            shields: "shield",
            accessories: "accessory",
          };
          handleImportFromCompendium(typeMap[type], item);
        }}
        initialType="weapons"
        restrictToTypes={[
          "weapons",
          "custom-weapons",
          "armor",
          "shields",
          "accessories",
        ]}
        context="player"
      />
      <CompendiumViewerModal
        open={openWeaponCompendium}
        onClose={() => setOpenWeaponCompendium(false)}
        onAddItem={(item) => {
          handleImportFromCompendium("weapon", item);
        }}
        initialType="weapons"
        restrictToTypes={["weapons"]}
        context="player"
      />
      <CompendiumViewerModal
        open={openArmorCompendium}
        onClose={() => setOpenArmorCompendium(false)}
        onAddItem={(item) => {
          handleImportFromCompendium("armor", item);
        }}
        initialType="armor"
        restrictToTypes={["armor"]}
        context="player"
      />
      <CompendiumViewerModal
        open={openShieldCompendium}
        onClose={() => setOpenShieldCompendium(false)}
        onAddItem={(item) => {
          handleImportFromCompendium("shield", item);
        }}
        initialType="shields"
        restrictToTypes={["shields"]}
        context="player"
      />
      <CompendiumViewerModal
        open={openCustomWeaponCompendium}
        onClose={() => setOpenCustomWeaponCompendium(false)}
        onAddItem={(item) => {
          handleImportFromCompendium("custom-weapon", item);
        }}
        initialType="custom-weapons"
        restrictToTypes={["custom-weapons"]}
        context="player"
      />
      <CompendiumViewerModal
        open={openAccessoryCompendium}
        onClose={() => setOpenAccessoryCompendium(false)}
        onAddItem={(item) => {
          handleImportFromCompendium("accessory", item);
        }}
        initialType="accessories"
        restrictToTypes={["accessories"]}
        context="player"
      />
      {martialWarning && (
        <Dialog
          open
          onClose={() => setMartialWarning(null)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "warning.main",
            }}
          >
            <WarningAmber fontSize="small" />
            {t("Not Proficient")}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              <strong>{martialWarning.itemName}</strong>{" "}
              {t(
                "is a martial item and your character is not proficient with it.",
              )}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
              {t(
                "Equipping it without proficiency may be against the rules. Equip anyway?",
              )}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMartialWarning(null)} size="small">
              {t("Cancel")}
            </Button>
            <Button
              color="warning"
              variant="contained"
              size="small"
              onClick={() => {
                martialWarning.onConfirm?.();
                setMartialWarning(null);
              }}
            >
              {t("Equip Anyway")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
