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
  Stack,
  Card,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { Casino, Info } from "@mui/icons-material";
import attributes from "../../../libs/attributes";
import types from "../../../libs/types";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";
import { Martial } from "../../icons";
import { OpenBracket, CloseBracket } from "../../Bracket";
import Diamond from "../../Diamond";
import { availableFrames } from "../../../libs/pilotVehicleData";
import SpellPilotVehiclesModal from "../spells/SpellPilotVehiclesModal";
import { calculateAttribute } from "../common/playerCalculations";

export default function PlayerVehicle({
  player,
  setPlayer,
  isEditMode,
  isCharacterSheet,
}) {
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

  const background =
    custom.mode === "dark"
      ? `linear-gradient(90deg, ${custom.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${custom.ternary} 0%, #ffffff 100%)`;

  // Find all pilot-vehicle spells
  const pilotSpells = (player.classes || [])
    .flatMap((c, classIndex) =>
      (c.spells || []).map((s, spellIndex) => ({
        ...s,
        classIndex,
        spellIndex,
      }))
    )
    .filter(
      (spell) =>
        spell &&
        spell.spellType === "pilot-vehicle" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
    );

  // Find the enabled vehicle
  const activePilotSpell = pilotSpells.find((s) =>
    (s.vehicles || []).some((v) => v.enabled)
  );

  if (!activePilotSpell) {
    return null;
  }

  const activeVehicle = activePilotSpell.vehicles.find((v) => v.enabled);

  const frame = availableFrames.find(
    (f) => f.name === (activeVehicle.frame || "pilot_frame_exoskeleton")
  );

  const equippedModules = activeVehicle.modules
    ? activeVehicle.modules.filter((m) => m.equipped)
    : [];

  const armorModules = equippedModules.filter(
    (m) => m.type === "pilot_module_armor"
  );
  const weaponModules = equippedModules.filter(
    (m) => m.type === "pilot_module_weapon"
  );
  const supportModules = equippedModules.filter(
    (m) => m.type === "pilot_module_support"
  );

  const currDex = calculateAttribute(
    player,
    player.attributes.dexterity,
    ["slow", "enraged"],
    ["dexUp"],
    6,
    12
  );
  const currInsight = calculateAttribute(
    player,
    player.attributes.insight,
    ["dazed", "enraged"],
    ["insUp"],
    6,
    12
  );
  const currMight = calculateAttribute(
    player,
    player.attributes.might,
    ["weak", "poisoned"],
    ["migUp"],
    6,
    12
  );
  const currWillpower = calculateAttribute(
    player,
    player.attributes.willpower,
    ["shaken", "poisoned"],
    ["wlpUp"],
    6,
    12
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
          <Grid item container xs={6}>
            <Grid item xs={12}>
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
          <Grid item container xs={6}>
            <Grid item xs={12}>
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
          <Grid item xs={12} sx={{ marginTop: "20px" }}>
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
        </>
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
        </>
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

  const StyledMarkdown = ({ children, ...props }) => {
    return (
      <div style={{ whiteSpace: "pre-line", margin: 0, padding: 0 }}>
        <ReactMarkdown
          {...props}
          components={{
            p: (props) => <p style={{ margin: 0, padding: 0 }} {...props} />,
            ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
            li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
            strong: (props) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
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
        <Grid container spacing={2} sx={{ padding: "1em" }}>
          {frame && (
            <Grid item xs={12}>
              <Grid container alignItems="center">
                <Grid item xs={isEditMode ? 10 : 12}>
                  <Card
                    sx={{
                      backgroundColor:
                        custom.mode === "dark" ? "#181a1b" : "#ffffff",
                      boxShadow: isCharacterSheet ? 0 : 2,
                    }}
                  >
                    <Stack>
                      <Grid
                        container
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                          p: 1,
                          background: primary,
                          color: "#ffffff",
                          "& .MuiTypography-root": {
                            fontSize: { xs: "0.6rem", sm: "1.2rem" },
                            textTransform: "uppercase",
                          },
                        }}
                      >
                        <Grid item xs={12}>
                          <Typography
                            variant="h4"
                            textAlign="left"
                            sx={{ pl: 1 }}
                          >
                            {t("pilot_vehicles_frame")}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid
                        container
                        justifyContent="space-between"
                        sx={{
                          background,
                          padding: "5px",
                          "& .MuiTypography-root": {
                            fontSize: { xs: "0.7rem", sm: "1.0rem" },
                          },
                        }}
                      >
                        <Grid
                          item
                          xs={4}
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <Typography
                            fontWeight="bold"
                            sx={{ marginRight: "4px" }}
                          >
                            {t(frame.name)}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography textAlign="center">
                            <strong>{t("pilot_passengers")}:</strong>{" "}
                            {frame.passengers > 0
                              ? frame.passengers
                              : t("None")}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography textAlign="center">
                            <strong>{t("pilot_distance")}:</strong>{" "}
                            {frame.distance > 1
                              ? `×${frame.distance}`
                              : t("pilot_distance_no_mod")}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Typography
                        sx={{
                          background: "transparent",
                          px: 1,
                          py: 1,
                        }}
                      >
                        <StyledMarkdown>{t(frame.description)}</StyledMarkdown>
                      </Typography>
                    </Stack>
                  </Card>
                </Grid>
                {isEditMode && (
                  <Grid
                    item
                    xs={2}
                    container
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Tooltip title={t("pilot_vehicles_edit")}>
                      <IconButton onClick={() => setOpenEditModal(true)}>
                        <Info />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                )}
              </Grid>
              <br />
            </Grid>
          )}

          {armorModules.length > 0 && (
            <Grid item xs={12}>
              <Grid container alignItems="center">
                <Grid item xs={12}>
                  <Card
                    sx={{
                      backgroundColor:
                        custom.mode === "dark" ? "#181a1b" : "#ffffff",
                      boxShadow: isCharacterSheet ? 0 : 2,
                    }}
                  >
                    <Stack>
                      <Grid
                        container
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                          p: 1,
                          background: primary,
                          color: "#ffffff",
                          "& .MuiTypography-root": {
                            fontSize: { xs: "0.6rem", sm: "1.2rem" },
                            textTransform: "uppercase",
                          },
                        }}
                      >
                        <Grid item xs={3}>
                          <Typography variant="h4" textAlign="left">
                            {t("Armor")}
                          </Typography>
                        </Grid>
                        <Grid item xs={1}>
                          <Typography variant="h4" textAlign="center">
                            {t("Cost")}
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="h4" textAlign="center">
                            {t("Defense")}
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="h4" textAlign="center">
                            {t("M. Defense")}
                          </Typography>
                        </Grid>
                        <Grid item xs={2}></Grid>
                      </Grid>
                      {armorModules.map((module, index) => (
                        <React.Fragment key={index}>
                          <Grid
                            container
                            justifyContent="space-between"
                            sx={{
                              background,
                              padding: "5px",
                              "& .MuiTypography-root": {
                                fontSize: { xs: "0.7rem", sm: "1.0rem" },
                              },
                            }}
                          >
                            <Grid
                              item
                              xs={3}
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <Typography
                                fontWeight="bold"
                                sx={{ marginRight: "4px" }}
                              >
                                {module.name === "pilot_custom_armor"
                                  ? module.customName
                                  : t(module.name)}
                              </Typography>
                              {module.martial && <Martial />}
                            </Grid>
                            <Grid item xs={1}>
                              <Typography textAlign="center">{`${
                                module.cost || 0
                              }z`}</Typography>
                            </Grid>
                            <Grid item xs={2}>
                              <Typography fontWeight="bold" textAlign="center">
                                {module.martial
                                  ? module.def || 0
                                  : module.def && module.def > 0
                                  ? `${t("DEX die")} + ${module.def}`
                                  : t("DEX die")}
                              </Typography>
                            </Grid>
                            <Grid item xs={2}>
                              <Typography fontWeight="bold" textAlign="center">
                                {module.martial
                                  ? module.mdef || 0
                                  : module.mdef && module.mdef > 0
                                  ? `${t("INS die")} + ${module.mdef}`
                                  : t("INS die")}
                              </Typography>
                            </Grid>
                            <Grid item xs={2}></Grid>
                          </Grid>
                          {index < armorModules.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </Stack>
                  </Card>
                </Grid>
                {isEditMode && <Grid item xs={1}></Grid>}
              </Grid>
              <br />
            </Grid>
          )}

          {weaponModules.length > 0 && (
            <Grid item xs={12}>
              <Card
                sx={{
                  backgroundColor:
                    custom.mode === "dark" ? "#181a1b" : "#ffffff",
                  boxShadow: isCharacterSheet ? 0 : 2,
                }}
              >
                <Stack>
                  <Grid container alignItems="center">
                    <Grid item xs={isEditMode ? 10 : 12}>
                      <Grid
                        container
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                          p: 1,
                          background: primary,
                          color: "#ffffff",
                          "& .MuiTypography-root": {
                            fontSize: { xs: "0.6rem", sm: "1.2rem" },
                            textTransform: "uppercase",
                          },
                        }}
                      >
                        <Grid item xs={3}>
                          <Typography variant="h4" textAlign="left">
                            {t("Weapons")}
                          </Typography>
                        </Grid>
                        <Grid item xs={1}>
                          <Typography variant="h4" textAlign="center">
                            {t("Cost")}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="h4" textAlign="center">
                            {t("Accuracy")}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="h4" textAlign="center">
                            {t("Damage")}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    {isEditMode && <Grid item xs={2}></Grid>}
                  </Grid>
                  {weaponModules.map((module, index) => (
                    <React.Fragment key={index}>
                      <Grid container alignItems="center">
                        <Grid item xs={isEditMode ? 10 : 12}>
                          <Stack>
                            <Grid
                              container
                              justifyContent="space-between"
                              sx={{
                                background,
                                borderBottom: `1px solid ${custom.secondary}`,
                                padding: "5px",
                                "& .MuiTypography-root": {
                                  fontSize: { xs: "0.7rem", sm: "1.0rem" },
                                },
                              }}
                            >
                              <Grid
                                item
                                xs={3}
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Typography
                                  fontWeight="bold"
                                  sx={{ marginRight: "4px" }}
                                >
                                  {module.name === "pilot_custom_weapon"
                                    ? module.customName
                                    : t(module.name)}
                                </Typography>
                                {module.martial && <Martial />}
                              </Grid>
                              <Grid item xs={1}>
                                <Typography textAlign="center">{`${
                                  module.cost || 0
                                }z`}</Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography
                                  fontWeight="bold"
                                  textAlign="center"
                                >
                                  <OpenBracket />
                                  {`${
                                    attributes[module.att1 || "might"].shortcaps
                                  } + ${
                                    attributes[module.att2 || "dexterity"]
                                      .shortcaps
                                  }`}
                                  <CloseBracket />
                                  {(module.prec || 0) > 0
                                    ? `+${module.prec}`
                                    : (module.prec || 0) < 0
                                    ? `${module.prec}`
                                    : ""}
                                </Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography
                                  fontWeight="bold"
                                  textAlign="center"
                                >
                                  <OpenBracket />
                                  {t("HR")}{" "}
                                  {(module.damage || 0) >= 0 ? "+" : ""}{" "}
                                  {module.damage || 0}
                                  <CloseBracket />
                                  {types[
                                    module.damageType?.toLowerCase() ||
                                      "physical"
                                  ]?.long || t(module.damageType || "Physical")}
                                </Typography>
                              </Grid>
                            </Grid>
                            <Grid
                              container
                              justifyContent="flex-end"
                              sx={{
                                background: "transparent",
                                borderBottom: `1px solid ${custom.secondary}`,
                                padding: "5px",
                                "& .MuiTypography-root": {
                                  fontSize: { xs: "0.7rem", sm: "1.0rem" },
                                },
                              }}
                            >
                              <Grid item xs={3}>
                                <Typography fontWeight="bold">
                                  {t(module.category)}
                                </Typography>
                              </Grid>
                              <Grid item xs={1}>
                                <Diamond color={primary} />
                              </Grid>
                              <Grid item xs={4}>
                                <Typography textAlign="center">
                                  {module.equippedSlot === "main" &&
                                    !module.cumbersome &&
                                    t("Main Hand")}
                                  {module.equippedSlot === "off" &&
                                    !module.cumbersome &&
                                    t("Off Hand")}
                                  {(module.equippedSlot === "both" ||
                                    module.cumbersome) &&
                                    t("Two-handed")}
                                </Typography>
                              </Grid>
                              <Grid item xs={1}>
                                <Diamond color={primary} />
                              </Grid>
                              <Grid item xs={3}>
                                <Typography textAlign="center">
                                  {module.range === "Melee" && t("Melee")}
                                  {module.range === "Ranged" && t("Ranged")}
                                </Typography>
                              </Grid>
                            </Grid>
                            <Typography
                              sx={{
                                background: "transparent",
                                px: 1,
                                py: 1,
                              }}
                            >
                              <StyledMarkdown>
                                {module.name === "pilot_custom_weapon"
                                  ? module.description
                                  : t(module.description)}
                              </StyledMarkdown>
                            </Typography>
                          </Stack>
                        </Grid>
                        {isEditMode && (
                          <Grid
                            item
                            xs={2}
                            container
                            direction="column"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Tooltip title={t("Roll")}>
                              <IconButton
                                size="small"
                                onClick={() => handleDiceRoll(module)}
                              >
                                <Casino fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: "bold" }}
                            >
                              {module.cumbersome ||
                              module.equippedSlot === "both"
                                ? "M+O"
                                : module.equippedSlot === "main"
                                ? "M"
                                : module.equippedSlot === "off"
                                ? "O"
                                : ""}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                      {index < weaponModules.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Stack>
              </Card>
              <br />
            </Grid>
          )}

          {supportModules.length > 0 && (
            <Grid item xs={12}>
              <Grid container alignItems="center">
                <Grid item xs={12}>
                  <Card
                    sx={{
                      backgroundColor:
                        custom.mode === "dark" ? "#181a1b" : "#ffffff",
                      boxShadow: isCharacterSheet ? 0 : 2,
                    }}
                  >
                    <Stack>
                      <Grid
                        container
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                          p: 1,
                          background: primary,
                          color: "#ffffff",
                          "& .MuiTypography-root": {
                            fontSize: { xs: "0.6rem", sm: "1.2rem" },
                            textTransform: "uppercase",
                          },
                        }}
                      >
                        <Grid item xs={12}>
                          <Typography
                            variant="h4"
                            textAlign="left"
                            sx={{ pl: 1 }}
                          >
                            {t("Support")}
                          </Typography>
                        </Grid>
                      </Grid>
                      {supportModules.map((module, index) => (
                        <React.Fragment key={index}>
                          <Grid
                            container
                            justifyContent="space-between"
                            sx={{
                              background,
                              borderBottom: `1px solid ${custom.secondary}`,
                              padding: "5px",
                              "& .MuiTypography-root": {
                                fontSize: { xs: "0.7rem", sm: "1.0rem" },
                              },
                            }}
                          >
                            <Grid
                              item
                              xs={12}
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <Typography
                                fontWeight="bold"
                                sx={{ marginRight: "4px" }}
                              >
                                {module.name === "pilot_custom_support"
                                  ? module.customName
                                  : t(module.name)}
                              </Typography>
                            </Grid>
                          </Grid>
                          <Typography
                            sx={{
                              background: "transparent",
                              px: 1,
                              py: 1,
                            }}
                          >
                            <StyledMarkdown>
                              {module.name === "pilot_custom_support"
                                ? module.description
                                : t(module.description)}
                            </StyledMarkdown>
                          </Typography>
                          {index < supportModules.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </Stack>
                  </Card>
                </Grid>
                {isEditMode && <Grid item xs={1}></Grid>}
              </Grid>
              <br />
            </Grid>
          )}
        </Grid>
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          PaperProps={{ sx: { width: { xs: "90%", md: "30%" } } }}
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
      </Paper>
    </>
  );
}
