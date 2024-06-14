import React from "react";
import { useTheme } from "@mui/material/styles";
import { Paper, Grid, Button, Divider } from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import PlayerWeapons from "./PlayerWeapons";
import PlayerShields from "./PlayerShields";
import PlayerAccessories from "./PlayerAccessories";
import PlayerWeaponModal from "./PlayerWeaponModal";
import PlayerArmorModal from "./PlayerArmorModal";
import PlayerArmor from "./armor/PlayerArmor";

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

  const handleOpenNewWeapon = () => {
    setWeapon(null);
    setEditWeaponIndex(null);
    setOpenNewWeapon(true);
  };

  const handleCloseNewWeapon = () => {
    setOpenNewWeapon(false);
    setWeapon(null);
    setEditWeaponIndex(null);
  };

  const handleAddWeapon = (newWeapon) => {
    const updatedWeapons = [...(player.weapons || []), newWeapon];
    setPlayer({ ...player, weapons: updatedWeapons });
  };

  const handleDeleteWeapon = (index) => {
    const updatedWeapons = (player.weapons || []).filter((_, i) => i !== index);
    setPlayer({ ...player, weapons: updatedWeapons });
  };

  const handleEditWeapon = (index) => {
    setWeapon(player.weapons[index]);
    setEditWeaponIndex(index);
    setOpenNewWeapon(true);
  };

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

  const handleEquipWeapon = (weaponIndex) => {
    // Toggle equipped weapon (weapon.isEquipped)
    /* Note: there can be only one Two Handed Weapon or two One Handed weapons equipped at a time */
    const updatedWeapons = (player.weapons || []).map((weapon, i) =>
      i === weaponIndex ? { ...weapon, isEquipped: !weapon.isEquipped } : weapon
    );
    setPlayer({ ...player, weapons: updatedWeapons });
  };

  const handleOpenNewArmor = () => {
    setArmor(null);
    setEditArmorIndex(null);
    setOpenNewArmor(true);
  };

  const handleCloseNewArmor = () => {
    setOpenNewArmor(false);
    setArmor(null);
    setEditArmorIndex(null);
  };

  const handleEquipArmor = (armorIndex) => {
    // Toggle equipped armor (armor.isEquipped)
    const updatedArmors = (player.armor || []).map((armor, i) =>
      i === armorIndex ? { ...armor, isEquipped: !armor.isEquipped } : armor
    );
    setPlayer({ ...player, armor: updatedArmors });
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

  const handleAddArmor = (newArmor) => {
    const updatedArmors = [...(player.armor || []), newArmor];
    setPlayer({ ...player, armor: updatedArmors });
  };

  const handleDeleteArmor = (index) => {
    const updatedArmors = (player.armor || []).filter((_, i) => i !== index);
    setPlayer({ ...player, armor: updatedArmors });
  };

  const handleEditArmor = (index) => {
    setArmor(player.armor[index]);
    setEditArmorIndex(index);
    setOpenNewArmor(true);
  };

  return (
    <>
      <div>EQUIPMENT IS PLACEHOLDER, AND NEEDS TO BE IMPLEMENTED</div>
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
                  <Button variant="contained" onClick={handleOpenNewWeapon}>
                    {t("Add Weapon")}
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3} container justifyContent="center">
                  <Button variant="contained" onClick={handleOpenNewArmor}>
                    {t("Add Armor")}
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3} container justifyContent="center">
                  <Button
                    variant="contained"
                    onClick={() => {
                      alert("Shields not yet implemented");
                    }}
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
      />

      <PlayerArmor
        player={player}
        armor={player.armor || []}
        onEditArmor={handleEditArmor}
        onDeleteArmor={handleDeleteArmor}
        onEquipArmor={handleEquipArmor}
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
          <PlayerShields />
        </AccordionSummary>
        <AccordionDetails>{/* List all available Shields */}</AccordionDetails>
      </Accordion>
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
    </>
  );
}
