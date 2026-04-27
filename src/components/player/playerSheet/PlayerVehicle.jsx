import React, { useState } from "react";
import {
  Grid,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Divider,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { Casino, Info } from "@mui/icons-material";
import { SharedPilotVehicleCard } from "../../shared/itemCards";
import attributes from "../../../libs/attributes";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { availableFrames } from "../../../libs/pilotVehicleData";
import SpellPilotVehiclesModal from "../spells/SpellPilotVehiclesModal";
import { calculateAttribute } from "../common/playerCalculations";

export default function PlayerVehicle({ player, setPlayer, isCharacterSheet }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const [dialogMessage, setDialogMessage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSeverity, setDialogSeverity] = useState("info");
  const [currentModule, setCurrentModule] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  // Find all pilot-vehicle spells
  const pilotSpells = (player.classes || [])
    .flatMap((c, classIndex) =>
      (c.spells || []).map((s, spellIndex) => ({
        ...s,
        classIndex,
        spellIndex,
      })),
    )
    .filter(
      (spell) =>
        spell &&
        spell.spellType === "pilot-vehicle" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined),
    );

  // Find the spell with enabled vehicle (for display), or use first pilot spell (for editing)
  const activePilotSpell =
    pilotSpells.find((s) => (s.vehicles || []).some((v) => v.enabled)) ||
    pilotSpells[0];

  if (!activePilotSpell) {
    return null;
  }

  const activeVehicle =
    activePilotSpell.vehicles.find((v) => v.enabled) ||
    activePilotSpell.vehicles?.[0];

  if (!activeVehicle) {
    return null;
  }

  const frame = availableFrames.find(
    (f) => f.name === (activeVehicle.frame || "pilot_frame_exoskeleton"),
  );

  const equippedModules = activeVehicle.modules
    ? activeVehicle.modules.filter((m) => m.equipped)
    : [];

  const armorModules = equippedModules.filter(
    (m) => m.type === "pilot_module_armor",
  );
  const weaponModules = equippedModules.filter(
    (m) => m.type === "pilot_module_weapon",
  );
  const supportModules = equippedModules.filter(
    (m) => m.type === "pilot_module_support",
  );

  const currDex = calculateAttribute(
    player,
    player.attributes.dexterity,
    ["slow", "enraged"],
    ["dexUp"],
    6,
    12,
  );
  const currInsight = calculateAttribute(
    player,
    player.attributes.insight,
    ["dazed", "enraged"],
    ["insUp"],
    6,
    12,
  );
  const currMight = calculateAttribute(
    player,
    player.attributes.might,
    ["weak", "poisoned"],
    ["migUp"],
    6,
    12,
  );
  const currWillpower = calculateAttribute(
    player,
    player.attributes.willpower,
    ["shaken", "poisoned"],
    ["wlpUp"],
    6,
    12,
  );

  const attributeMap = {
    dexterity: currDex,
    insight: currInsight,
    might: currMight,
    will: currWillpower,
  };

  const handleDiceRoll = (module) => {
    setCurrentModule(module);

    const att1 = module.att1 || "dexterity";
    const att2 = module.att2 || "might";

    let att1Value = attributeMap[att1] || 8;
    let att2Value = attributeMap[att2] || 8;

    let weaponPrec = module.prec || 0;
    let weaponDamage = module.damage || 0;

    const die1 = Math.floor(Math.random() * att1Value) + 1;
    const die2 = Math.floor(Math.random() * att2Value) + 1;

    // Check for critical failure
    const isCriticalFailure = die1 === 1 && die2 === 1;
    // Check for critical success
    const isCriticalSuccess = die1 >= 6 && die2 >= 6 && die1 === die2;

    const result = die1 + die2 + weaponPrec;

    const maxDie = Math.max(die1, die2);
    const damageDealt = maxDie + weaponDamage;

    const dialogContent = (
      <>
        <Grid container spacing={2} sx={{ textAlign: "center" }}>
          <Grid container size={6}>
            <Grid size={12}>
              <Typography
                variant="h3"
                sx={{ fontWeight: "bold", textTransform: "uppercase" }}
              >
                {t("Accuracy")}
              </Typography>
              <Typography variant="h1" sx={{ textAlign: "center" }}>
                {result}
              </Typography>
            </Grid>
          </Grid>
          <Grid container size={6}>
            <Grid size={12}>
              <Typography
                variant="h3"
                sx={{ fontWeight: "bold", textTransform: "uppercase" }}
              >
                {t("Damage")}
              </Typography>
              <Typography variant="h1" sx={{ textAlign: "center" }}>
                {damageDealt}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", textTransform: "uppercase" }}
              >
                {t(module.damageType || "Physical")}
              </Typography>
            </Grid>
          </Grid>
          <Grid sx={{ marginTop: "20px" }} size={12}>
            <Typography component="span">
              {` ${die1} [${attributes[att1].shortcaps}] + ${die2} [${
                attributes[att2].shortcaps
              }] ${
                weaponPrec !== 0
                  ? weaponPrec > 0
                    ? "+" + weaponPrec
                    : weaponPrec
                  : ""
              }`}
            </Typography>
            <br />
            <Typography
              component="span"
              sx={{ fontWeight: "bold", textTransform: "uppercase" }}
            >
              {t("Damage")}:
            </Typography>
            <Typography component="span">
              {` ${maxDie} + ${weaponDamage}`}
            </Typography>
          </Grid>
        </Grid>
      </>
    );

    if (isCriticalFailure) {
      setDialogSeverity("error");
      setDialogMessage(
        <>
          <Typography
            variant="h1"
            sx={{ textAlign: "center", marginBottom: "10px" }}
          >
            {t("Critical Failure")}!
            <br />
          </Typography>
          {dialogContent}
        </>,
      );
    } else if (isCriticalSuccess) {
      setDialogSeverity("success");
      setDialogMessage(
        <>
          <Typography
            variant="h1"
            sx={{ textAlign: "center", marginBottom: "10px" }}
          >
            {t("Critical Success")}!
            <br />
          </Typography>
          {dialogContent}
        </>,
      );
    } else {
      setDialogSeverity("info");
      setDialogMessage(dialogContent);
    }

    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSaveVehicles = (spellIndex, updatedPilot) => {
    setPlayer((prevPlayer) => {
      const updatedClasses = [...prevPlayer.classes];
      const classIndex = activePilotSpell.classIndex;
      const spellInClassIndex = activePilotSpell.spellIndex;

      updatedClasses[classIndex].spells[spellInClassIndex] = {
        ...updatedClasses[classIndex].spells[spellInClassIndex],
        vehicles: updatedPilot.vehicles,
        showInPlayerSheet: updatedPilot.showInPlayerSheet,
      };

      return {
        ...prevPlayer,
        classes: updatedClasses,
      };
    });
    setOpenEditModal(false);
  };

  return (
    <>
      <Divider sx={{ my: 1 }} />
      <Paper
        elevation={3}
        sx={
          isCharacterSheet
            ? {
                borderRadius: "8px",
                border: "2px solid",
                borderColor: secondary,
                display: "flex",
                flexDirection: "column",
                boxShadow: "none",
              }
            : {
                borderRadius: "8px",
                border: "2px solid",
                borderColor: secondary,
                display: "flex",
              }
        }
      >
        {isCharacterSheet ? (
          <Typography
            variant="h1"
            sx={{
              textTransform: "uppercase",
              padding: "5px",
              backgroundColor: primary,
              color: custom.white,
              borderRadius: "8px 8px 0 0",
              fontSize: "1.5em",
            }}
            align="center"
          >
            {t("pilot_vehicle")}
          </Typography>
        ) : (
          <Typography
            variant="h1"
            sx={{
              writingMode: "vertical-lr",
              textTransform: "uppercase",
              marginLeft: "-1px",
              marginRight: "10px",
              marginTop: "-1px",
              marginBottom: "-1px",
              paddingY: "10px",
              backgroundColor: primary,
              color: custom.white,
              borderRadius: "0 8px 8px 0",
              transform: "rotate(180deg)",
              fontSize: "2em",
            }}
            align="center"
          >
            {t("pilot_vehicle")}
          </Typography>
        )}
        <Grid
          container
          spacing={1}
          sx={{ padding: "1em", flex: 1, width: "100%" }}
        >
          {frame && (
            <Grid
              container
              spacing={0}
              sx={{ display: "flex", alignItems: "stretch", maxHeight: "40px" }}
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Grid sx={{ display: "flex" }} size={10}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    backgroundColor: primary,
                    padding: "5px",
                    paddingLeft: "10px",
                    color: "#fff",
                    borderRadius: "8px 0 0 8px",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {t(frame.name)}
                </Typography>
              </Grid>
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "stretch",
                  maxHeight: "40px",
                }}
                size={2}
              >
                <Box
                  sx={{
                    padding: "5px",
                    backgroundColor: custom.ternary,
                    borderRadius: "0 8px 8px 0",
                    marginRight: "15px",
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  <Tooltip title={t("Info")}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedModule(frame);
                        setInfoModalOpen(true);
                      }}
                      sx={{ p: 0.5 }}
                    >
                      <Info fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          )}

          {armorModules.map((module, index) => (
            <Grid
              container
              spacing={0}
              key={`armor-${index}`}
              sx={{ display: "flex", alignItems: "stretch", maxHeight: "40px" }}
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Grid sx={{ display: "flex" }} size={10}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    backgroundColor: primary,
                    padding: "5px",
                    paddingLeft: "10px",
                    color: "#fff",
                    borderRadius: "8px 0 0 8px",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {module.name === "pilot_custom_armor"
                    ? module.customName
                    : t(module.name)}
                </Typography>
              </Grid>
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "stretch",
                  maxHeight: "40px",
                }}
                size={2}
              >
                <Box
                  sx={{
                    padding: "5px",
                    backgroundColor: custom.ternary,
                    borderRadius: "0 8px 8px 0",
                    marginRight: "15px",
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  <Tooltip title={t("Info")}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedModule(module);
                        setInfoModalOpen(true);
                      }}
                      sx={{ p: 0.5 }}
                    >
                      <Info fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          ))}

          {weaponModules.map((module, index) => (
            <Grid
              container
              spacing={0}
              key={`weapon-${index}`}
              sx={{ display: "flex", alignItems: "stretch", maxHeight: "40px" }}
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Grid sx={{ display: "flex" }} size={10}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    backgroundColor: primary,
                    padding: "5px",
                    paddingLeft: "10px",
                    color: "#fff",
                    borderRadius: "8px 0 0 8px",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {module.name === "pilot_custom_weapon"
                    ? module.customName
                    : t(module.name)}
                </Typography>
              </Grid>
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "stretch",
                  maxHeight: "40px",
                }}
                size={2}
              >
                <Box
                  sx={{
                    padding: "5px",
                    backgroundColor: custom.ternary,
                    borderRadius: "0 8px 8px 0",
                    marginRight: "15px",
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 0.5,
                  }}
                >
                  <Tooltip title={t("Info")}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedModule(module);
                        setInfoModalOpen(true);
                      }}
                      sx={{ p: 0.5 }}
                    >
                      <Info fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("Roll")}>
                    <IconButton
                      size="small"
                      onClick={() => handleDiceRoll(module)}
                      sx={{ p: 0.5 }}
                    >
                      <Casino fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          ))}

          {supportModules.map((module, index) => (
            <Grid
              container
              spacing={0}
              key={`support-${index}`}
              sx={{ display: "flex", alignItems: "stretch", maxHeight: "40px" }}
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Grid sx={{ display: "flex" }} size={10}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    backgroundColor: primary,
                    padding: "5px",
                    paddingLeft: "10px",
                    color: "#fff",
                    borderRadius: "8px 0 0 8px",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {module.name === "pilot_custom_support"
                    ? module.customName
                    : t(module.name)}
                </Typography>
              </Grid>
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "stretch",
                  maxHeight: "40px",
                }}
                size={2}
              >
                <Box
                  sx={{
                    padding: "5px",
                    backgroundColor: custom.ternary,
                    borderRadius: "0 8px 8px 0",
                    marginRight: "15px",
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  <Tooltip title={t("Info")}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedModule(module);
                        setInfoModalOpen(true);
                      }}
                      sx={{ p: 0.5 }}
                    >
                      <Info fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          ))}
        </Grid>
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          slotProps={{
            paper: { sx: { width: { xs: "90%", md: "30%" } } },
          }}
        >
          <DialogTitle
            variant="h3"
            sx={{
              backgroundColor:
                dialogSeverity === "error"
                  ? "#bb2124"
                  : dialogSeverity === "success"
                    ? "#22bb33"
                    : "#aaaaaa",
            }}
          >
            {t("Result")}
          </DialogTitle>
          <DialogContent sx={{ marginTop: "10px" }}>
            <DialogContent id="alert-dialog-description">
              {dialogMessage}
            </DialogContent>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleDialogClose}
              color="secondary"
              variant="contained"
            >
              {t("Close")}
            </Button>
            <Button
              onClick={() => handleDiceRoll(currentModule)}
              color="primary"
              autoFocus
              variant="contained"
            >
              {t("Re-roll")}
            </Button>
          </DialogActions>
        </Dialog>
        <SpellPilotVehiclesModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          onSave={handleSaveVehicles}
          pilot={activePilotSpell}
        />
        <Dialog
          open={infoModalOpen}
          onClose={() => setInfoModalOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogContent sx={{ p: 0 }}>
            {selectedModule && <SharedPilotVehicleCard item={selectedModule} />}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setInfoModalOpen(false)}
              variant="contained"
              color="primary"
            >
              {t("Close")}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </>
  );
}
