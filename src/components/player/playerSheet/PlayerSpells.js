import React, { useState } from "react";
import {
  Grid,
  Typography,
  Paper,
  IconButton,
  Modal,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { Casino, Info } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { OffensiveSpellIcon } from "../../icons";
import attributes from "../../../libs/attributes";

export default function PlayerSpells({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [openModal, setOpenModal] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState(null);
  const [targets, setTargets] = useState(1);
  const [useMp, setUseMp] = useState(true); // New state for MP usage

  const [dialogSeverity, setDialogSeverity] = useState("");

  const equippedArmor = player.armor
    ? player.armor.filter((armor) => armor.isEquipped)
    : [];

  const equippedShields = player.shields
    ? player.shields.filter((shield) => shield.isEquipped)
    : [];

  const equippedAccessories = player.accessories
    ? player.accessories.filter((accessory) => accessory.isEquipped)
    : [];

  const magicModifier =
    (player.modifiers.magicPrec || 0) +
    (equippedArmor.length > 0 ? equippedArmor[0].magicModifier || 0 : 0) +
    (equippedShields.length > 0 ? equippedShields[0].magicModifier || 0 : 0) +
    (equippedAccessories.length > 0
      ? equippedAccessories[0].magicModifier || 0
      : 0);

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
  const calculateAttribute = (
    base,
    decreaseStatuses,
    increaseStatuses,
    min,
    max
  ) => {
    let adjustedValue = base;

    decreaseStatuses.forEach((status) => {
      if (player.statuses[status]) adjustedValue -= 2;
    });

    increaseStatuses.forEach((status) => {
      if (player.statuses[status]) adjustedValue += 2;
    });

    return clamp(adjustedValue, min, max);
  };

  const currDex = calculateAttribute(
    player.attributes.dexterity,
    ["slow", "enraged"],
    ["dexUp"],
    6,
    12
  );
  const currInsight = calculateAttribute(
    player.attributes.insight,
    ["dazed", "enraged"],
    ["insUp"],
    6,
    12
  );
  const currMight = calculateAttribute(
    player.attributes.might,
    ["weak", "poisoned"],
    ["migUp"],
    6,
    12
  );
  const currWillpower = calculateAttribute(
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

  /* All default spells from all classes */
  const defaultSpells = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        spell.spellType === "default" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleOpenModal = (spell) => {
    setSelectedSpell(spell);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOK = () => {
    handleCloseModal();
  };

  const handleRollSetup = (spell) => {
    setDialogOpen(true);
    setSelectedSpell(spell);
    setTargets(1); // Reset targets to 1 when opening the dialog
    setUseMp(true); // Reset MP usage to true when opening the dialog
  };

  const handleRoll = () => {
    if (!isRolling) {
      const usedMp = selectedSpell.mp * targets;

      if (useMp && player.stats.mp.current < usedMp) {
        return;
      } else {
        const attr1 = selectedSpell.attr1;
        const attr2 = selectedSpell.attr2;

        let att1Value = attributeMap[attr1];
        let att2Value = attributeMap[attr2];

        const die1 = Math.floor(Math.random() * att1Value) + 1;
        const die2 = Math.floor(Math.random() * att2Value) + 1;

        const precBonus = magicModifier;

        // Check for critical failure
        const isCriticalFailure = die1 === 1 && die2 === 1;
        // Check for critical success
        const isCriticalSuccess = die1 >= 6 && die2 >= 6 && die1 === die2;

        const result = die1 + die2 + precBonus;

        const maxDie = Math.max(die1, die2);

        const usedMp = selectedSpell.mp * targets;

        if (isCriticalFailure) {
          setDialogSeverity("error");
        } else if (isCriticalSuccess) {
          setDialogSeverity("success");
        } else {
          setDialogSeverity("");
        }

        setDialogMessage(
          <>
            {" "}
            {isCriticalSuccess && (
              <Typography
                variant="h1"
                sx={{ textAlign: "center", marginBottom: "10px" }}
              >
                {t("Critical Success")}!
                <br />
              </Typography>
            )}
            {isCriticalFailure && (
              <Typography
                variant="h1"
                sx={{ textAlign: "center", marginBottom: "10px" }}
              >
                {t("Critical Failure")}!
                <br />
              </Typography>
            )}
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
                    {t("HR")}
                  </Typography>
                  <Typography variant="h1" sx={{ textAlign: "center" }}>
                    {maxDie}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item xs={12} sx={{ marginTop: "20px" }}>
                <Typography component="span">
                  {` ${die1} [${attributes[attr1].shortcaps}] + ${die2} [${attributes[attr2].shortcaps}]`}{" "}
                  {precBonus !== 0 ? " + " + precBonus : ""}
                </Typography>
              </Grid>
            </Grid>
          </>
        );

        /* Remove mp to the player (player.stats.mp.current - usedMp) */
        if (useMp) {
          setPlayer((prevPlayer) => {
            return {
              ...prevPlayer,
              stats: {
                ...prevPlayer.stats,
                mp: {
                  ...prevPlayer.stats.mp,
                  current: prevPlayer.stats.mp.current - usedMp,
                },
              },
            };
          });
        }

        setIsRolling(true);
      }
    } else {
      setIsRolling(false);
      setDialogSeverity("");
      setDialogMessage("");
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedSpell(null);
    setTargets(1); // Reset targets to 1 when closing the dialog
    setUseMp(true); // Reset MP usage to true when closing the dialog
    setIsRolling(false);
    setDialogSeverity("");
    setDialogMessage("");
  };

  return (
    <>
      {defaultSpells.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Paper
            elevation={3}
            sx={{
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
              display: "flex",
            }}
          >
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
                color: ternary,
                borderRadius: "0 8px 8px 0",
                transform: "rotate(180deg)",
                fontSize: "2em",
              }}
              align="center"
            >
              {t("Spells")}
            </Typography>
            <Grid container spacing={1} sx={{ padding: "1em" }}>
              {defaultSpells.map((spell, index) => (
                <Grid
                  item
                  container
                  xs={12}
                  md={6}
                  key={index}
                  sx={{ display: "flex", alignItems: "stretch" }}
                >
                  <Grid item xs={10} sx={{ display: "flex" }}>
                    <Typography
                      id="spell-left-name"
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
                      {spell.name}
                      {spell.isOffensive && <OffensiveSpellIcon />}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    sx={{ display: "flex", alignItems: "stretch" }}
                  >
                    <div
                      id="spell-right-controls"
                      style={{
                        padding: "10px",
                        backgroundColor: ternary,
                        borderRadius: "0 8px 8px 0",
                        marginRight: "15px",
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "row",
                      }}
                      className="spell-right-controls"
                    >
                      <Tooltip title={t("Info")}>
                        <IconButton
                          sx={{ padding: "0px" }}
                          onClick={() => handleOpenModal(spell)}
                        >
                          <Info />
                        </IconButton>
                      </Tooltip>
                      {spell.isOffensive && isEditMode && (
                        <Tooltip title={t("Roll")}>
                          <IconButton
                            sx={{ padding: "0px", marginLeft: "5px" }}
                          >
                            <Casino
                              onClick={() => {
                                handleRollSetup(spell);
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  </Grid>
                </Grid>
              ))}
              {magicModifier !== 0 && (
                <Grid item xs={12} sx={{ marginTop: "20px" }}>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {t("Modifiers")}
                  </Typography>
                  {magicModifier !== 0 && (
                    <Typography variant="h4">
                      {t("Magic Precision Bonus")}: {magicModifier}
                    </Typography>
                  )}
                </Grid>
              )}
            </Grid>
            <Modal
              open={openModal}
              onClose={handleCloseModal}
              aria-labelledby="spell-description"
              aria-describedby="spell-description"
            >
              <Paper
                sx={{
                  position: "absolute",
                  width: { xs: "90%", md: 400 },
                  bgcolor: "#fff",
                  border: "2px solid",
                  borderColor: secondary,
                  borderRadius: "8px",
                  boxShadow: 24,
                  padding: 2,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ textTransform: "uppercase" }}
                  fontWeight={"bold"}
                >
                  {selectedSpell && selectedSpell.name}
                  {" - "}
                  {selectedSpell && t(selectedSpell.className)}
                </Typography>
                <ReactMarkdown>
                  {selectedSpell && selectedSpell.description}
                </ReactMarkdown>
                <Typography variant="h5">
                  {t("MP Cost")}: {selectedSpell && selectedSpell.mp}{" "}
                  {selectedSpell && selectedSpell.maxTargets !== 1
                    ? "x " + t("Target")
                    : ""}
                </Typography>
                <Typography variant="h5">
                  {t("Max Targets")}:{" "}
                  {selectedSpell && selectedSpell.maxTargets}
                </Typography>
                <Typography variant="h5">
                  {t("Target Description")}:{" "}
                  {selectedSpell && selectedSpell.targetDesc}
                </Typography>
                <Typography variant="h5">
                  {t("Duration")}: {selectedSpell && selectedSpell.duration}
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleOK}
                  sx={{ marginTop: 2, width: "100%" }}
                >
                  OK
                </Button>
              </Paper>
            </Modal>
            <Dialog
              open={dialogOpen}
              onClose={handleDialogClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
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
                id="alert-dialog-title"
              >
                {t("Spell Rolls")}
              </DialogTitle>
              <DialogContent sx={{ marginTop: "10px" }}>
                <DialogContent id="alert-dialog-description">
                  {!isRolling ? (
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item xs={12}>
                        <Typography variant="body1">
                          {t("Select number of targets from 1 to")}{" "}
                          {selectedSpell?.maxTargets || 1}:
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Select
                          value={targets}
                          onChange={(e) =>
                            setTargets(parseInt(e.target.value, 10))
                          }
                          size="small"
                          sx={{ width: "100px" }}
                        >
                          {Array.from(
                            { length: selectedSpell?.maxTargets || 1 },
                            (_, i) => (
                              <MenuItem key={i} value={i + 1}>
                                {i + 1}
                              </MenuItem>
                            )
                          )}
                        </Select>
                        {useMp && (
                          <>
                            <Typography variant="body1">
                              {t("MP Cost")}
                              {": "}
                              {selectedSpell?.mp * targets}
                            </Typography>
                            {selectedSpell?.mp * targets >
                              player.stats.mp.current && (
                              <Typography variant="body1" color="error">
                                {t("Not enough MP")}
                              </Typography>
                            )}
                          </>
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={useMp}
                              onChange={(e) => setUseMp(e.target.checked)}
                            />
                          }
                          label={t("Use MP")}
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    <>{dialogMessage}</>
                  )}
                </DialogContent>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDialogClose}>{t("Close")}</Button>
                <Button onClick={handleRoll}>
                  {isRolling ? t("Re-Roll") : t("Roll")}
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </>
      )}
      <style jsx>{`
        @media (max-width: 600px) {
          .spell-right-controls {
            flex-direction: column !important;
          }
          .spell-right-controls .MuiIconButton-root {
            margin-left: 0 !important;
            margin-top: 5px !important;
          }
        }
      `}</style>
    </>
  );
}
