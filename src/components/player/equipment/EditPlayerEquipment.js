import React from "react";
import { useTheme } from "@mui/material/styles";
import { Paper, Grid, Button, Divider } from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import PlayerWeapons from "./weapons/PlayerWeapons";
import PlayerShields from "./shields/PlayerShields";
import PlayerAccessories from "./accessories/PlayerAccessories";
import PlayerWeaponModal from "./weapons/PlayerWeaponModal";
import PlayerArmorModal from "./armor/PlayerArmorModal";
import PlayerShieldModal from "./shields/PlayerShieldModal";
import PlayerArmor from "./armor/PlayerArmor";
import { MeleeIcon, ArmorIcon, ShieldIcon, AccessoryIcon } from "../../icons";

export default function EditPlayerEquipment({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [openNewWeapon, setOpenNewWeapon] = React.useState(false);
  const [editWeaponIndex, setEditWeaponIndex] = React.useState(null);
  const [weapon, setWeapon] = React.useState(null);

  const [openNewArmor, setOpenNewArmor] = React.useState(false);
  const [editArmorIndex, setEditArmorIndex] = React.useState(null);
  const [armor, setArmor] = React.useState(null);

  const [openNewShields, setOpenNewShields] = React.useState(false);
  const [editShieldIndex, setEditShieldIndex] = React.useState(null);
  const [shields, setShields] = React.useState(null);

  // OPEN MODALS
  const handleOpenNewWeapon = () => {
    setWeapon(null);
    setEditWeaponIndex(null);
    setOpenNewWeapon(true);
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

  // CLOSE MODALS
  const handleCloseNewWeapon = () => {
    setOpenNewWeapon(false);
    setWeapon(null);
    setEditWeaponIndex(null);
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

  // ADD NEW
  const handleAddWeapon = (newWeapon) => {
    const updatedWeapons = [...(player.weapons || []), newWeapon];
    setPlayer({ ...player, weapons: updatedWeapons });
  };

  const handleAddArmor = (newArmor) => {
    const updatedArmors = [...(player.armor || []), newArmor];
    setPlayer({ ...player, armor: updatedArmors });
  };

  const handleAddShield = (newShields) => {
    const updatedShields = [...(player.shields || []), newShields];
    setPlayer({ ...player, shields: updatedShields });
  };

  // DELETE
  const handleDeleteWeapon = (index) => {
    const updatedWeapons = (player.weapons || []).filter((_, i) => i !== index);
    setPlayer({ ...player, weapons: updatedWeapons });
  };

  const handleDeleteArmor = (index) => {
    const updatedArmors = (player.armor || []).filter((_, i) => i !== index);
    setPlayer({ ...player, armor: updatedArmors });
  };

  const handleDeleteShield = (index) => {
    const updatedShields = (player.shields || []).filter((_, i) => i !== index);
    setPlayer({ ...player, shields: updatedShields });
  };

  // EDIT
  const handleEditWeapon = (index) => {
    setWeapon(player.weapons[index]);
    setEditWeaponIndex(index);
    setOpenNewWeapon(true);
  };

  const handleEditArmor = (index) => {
    setArmor(player.armor[index]);
    setEditArmorIndex(index);
    setOpenNewArmor(true);
  };

  const handleEditShield = (index) => {
    setShields(player.shields[index]);
    setEditShieldIndex(index);
    setOpenNewShields(true);
  };

  // SAVE
  const handleSaveWeapon = (updatedWeapon) => {
    if (editWeaponIndex !== null) {
      const updatedWeapons = (player.weapons || []).map((weapon, i) =>
        i === editWeaponIndex ? updatedWeapon : weapon
      );
      setPlayer({ ...player, weapons: updatedWeapons });
    } else {
      handleAddWeapon(updatedWeapon);
    }
    setOpenNewWeapon(false);
  };

  const handleSaveArmor = (updatedArmor) => {
    if (editArmorIndex !== null) {
      const updatedArmors = (player.armor || []).map((armor, i) =>
        i === editArmorIndex ? updatedArmor : armor
      );
      setPlayer({ ...player, armor: updatedArmors });
    } else {
      handleAddArmor(updatedArmor);
    }
    setOpenNewArmor(false);
  };

  const handleSaveShield = (updatedShield) => {
    if (editShieldIndex !== null) {
      const updatedShields = (player.shields || []).map((shield, i) =>
        i === editShieldIndex ? updatedShield : shield
      );
      setPlayer({ ...player, shields: updatedShields });
    } else {
      handleAddShield(updatedShield);
    }
    setOpenNewShields(false);
  };

  // TOGGLE EQUIPPED
  const handleEquipWeapon = (weaponIndex) => {
    // Toggle equipped weapon (weapon.isEquipped)
    /* Note: there can be only one Two Handed Weapon or two One Handed weapons equipped at a time */
    const updatedWeapons = (player.weapons || []).map((weapon, i) =>
      i === weaponIndex ? { ...weapon, isEquipped: !weapon.isEquipped } : weapon
    );
    setPlayer({ ...player, weapons: updatedWeapons });
  };

  const handleEquipArmor = (armorIndex) => {
    // Toggle equipped armor (armor.isEquipped)
    const updatedArmors = (player.armor || []).map((armor, i) =>
      i === armorIndex ? { ...armor, isEquipped: !armor.isEquipped } : armor
    );
    setPlayer({ ...player, armor: updatedArmors });
  };

  const handleEquipShield = (shieldsIndex) => {
    // Toggle equipped shields (shields.isEquipped)
    const updatedShields = (player.shields || []).map((shields, i) =>
      i === shieldsIndex
        ? { ...shields, isEquipped: !shields.isEquipped }
        : shields
    );
    setPlayer({ ...player, shields: updatedShields });
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
              <Grid item xs={12}>
                <CustomHeader
                  type="top"
                  headerText={t("Equipment")}
                  showIconButton={false}
                />
              </Grid>
              <Grid container justifyContent="center" spacing={2}>
                <Grid item xs={6} sm={3} container justifyContent="center">
                  <Button
                    variant="contained"
                    onClick={handleOpenNewWeapon}
                    startIcon={<MeleeIcon />}
                  >
                    {t("Add Weapon")}
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3} container justifyContent="center">
                  <Button
                    variant="contained"
                    onClick={handleOpenNewArmor}
                    startIcon={<ArmorIcon />}
                  >
                    {t("Add Armor")}
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3} container justifyContent="center">
                  <Button
                    variant="contained"
                    onClick={handleOpenNewShield}
                    startIcon={<ShieldIcon />}
                  >
                    {t("Add Shield")}
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3} container justifyContent="center">
                  <Button
                    variant="contained"
                    onClick={() => {
                      alert("Accessories not yet implemented");
                    }}
                    startIcon={<AccessoryIcon />}
                  >
                    {t("Add Accessory")}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
          <Divider sx={{ my: 2 }} />
        </>
      ) : null}

      <PlayerWeapons
        player={player}
        weapons={player.weapons || []}
        onEditWeapon={handleEditWeapon}
        onDeleteWeapon={handleDeleteWeapon}
        onEquipWeapon={handleEquipWeapon}
        isEditMode={isEditMode}
      />

      <PlayerArmor
        player={player}
        armor={player.armor || []}
        onEditArmor={handleEditArmor}
        onDeleteArmor={handleDeleteArmor}
        onEquipArmor={handleEquipArmor}
        isEditMode={isEditMode}
      />

      <PlayerShields
        player={player}
        shields={player.shields || []}
        onEditShield={handleEditShield}
        onDeleteShield={handleDeleteShield}
        onEquipShield={handleEquipShield}
        isEditMode={isEditMode}
      />

      <Accordion
        elevation={3}
        sx={{
          p: "15px",
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
          marginBottom: 3,
        }}
      >
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <PlayerAccessories />
        </AccordionSummary>
        <AccordionDetails>
          {/* List all available Accessories */}
        </AccordionDetails>
      </Accordion>
      <PlayerWeaponModal
        open={openNewWeapon}
        onClose={handleCloseNewWeapon}
        editWeaponIndex={editWeaponIndex}
        weapon={weapon}
        setWeapon={setWeapon}
        onAddWeapon={handleSaveWeapon}
        onDeleteWeapon={handleDeleteWeapon}
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
    </>
  );
}
