import React, { useState } from "react";
import {
  Grid,
  Typography,
  Paper,
  IconButton,
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
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { Casino, Info, SettingsSuggest } from "@mui/icons-material";
import { OffensiveSpellIcon } from "../../icons";
import attributes from "../../../libs/attributes";
import { OpenBracket, CloseBracket } from "../../Bracket";
import SpellEntropistGamble from "../spells/SpellEntropistGamble";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { calculateAttribute } from "../common/playerCalculations";
import { isItemEquipped } from "../equipment/slots/equipmentSlots";
import { PlayerSpellCard, NonStaticSpellCard } from "../../compendium/ItemCards";
import { spellList } from "../../../libs/classes";

export default function PlayerSpells({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [openModal, setOpenModal] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState(null);
  const [targets, setTargets] = useState(1);
  const [useMp, setUseMp] = useState(true);
  const [useIp, setUseIp] = useState(true); // Used for Magispheres

  const [dialogSeverity, setDialogSeverity] = useState("");

  const inv = player.equipment?.[0];

  const equippedArmor = inv?.armor
    ? inv.armor.filter((armor) => isItemEquipped(player, armor))
    : [];

  const equippedShields = inv?.shields
    ? inv.shields.filter((shield) => isItemEquipped(player, shield))
    : [];

  const equippedAccessories = inv?.accessories
    ? inv.accessories.filter((accessory) => isItemEquipped(player, accessory))
    : [];

  const magicModifier =
    (player.modifiers?.magicPrec || 0) +
    (equippedArmor.length > 0 ? equippedArmor[0].magicModifier || 0 : 0) +
    (equippedShields.length > 0 ? equippedShields[0].magicModifier || 0 : 0) +
    (equippedAccessories.length > 0
      ? equippedAccessories[0].magicModifier || 0
      : 0);

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

  const gambleSpells = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        spell.spellType === "gamble" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
    )
    .sort((a, b) => a.spellName.localeCompare(b.spellName));

  const handleOpenModal = (spell) => {
    if (spell.spellType === "default") {
      const staticSpell = spellList.find((s) => s.name === spell.name);
      const definedSpellProps = Object.fromEntries(
        Object.entries(spell).filter(([, v]) => v !== undefined && v !== null)
      );
      setSelectedSpell({ ...staticSpell, ...definedSpellProps, class: spell.className });
    } else {
      setSelectedSpell(spell);
    }
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
              <Grid  container size={6}>
                <Grid  size={12}>
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
              <Grid  container size={6}>
                <Grid  size={12}>
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
              <Grid  sx={{ marginTop: "20px" }} size={12}>
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

        /* Remove ip to the player (player.stats.ip.current - 2) for MagiSphere */
        if (selectedSpell?.isMagisphere && useIp) {
          setPlayer((prevPlayer) => {
            return {
              ...prevPlayer,
              stats: {
                ...prevPlayer.stats,
                ip: {
                  ...prevPlayer.stats.ip,
                  current: prevPlayer.stats.ip.current - 2,
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

  const handleGambleRoll = () => {
    if (!isRolling) {
      const usedMp = selectedSpell.mp * targets;
  
      // Check if the player has enough MP to cast the spell
      if (useMp && player.stats.mp.current < usedMp) {
        return;
      }
  
      const attr = selectedSpell.attr;
      let attValue = attributeMap[attr];
  
      let dices = [];
  
      for (let i = 0; i < targets; i++) {
        // Roll the first dice
        const firstThrow = Math.floor(Math.random() * attValue) + 1;
  
        // Find the matching effect based on the first roll
        const targetEffect = selectedSpell.targets.find(
          (effect) => firstThrow >= effect.rangeFrom && firstThrow <= effect.rangeTo
        );
  
        const dice = {
          firstThrow: firstThrow,
          effect: targetEffect ? targetEffect.effect : "No effect",
        };
  
        // If there's a second roll, roll a d6 and find the corresponding second effect
        if (targetEffect && targetEffect.secondRoll) {
          dice.secondRoll = true;
          dice.secondThrow = Math.floor(Math.random() * 6) + 1;
  
          const secondEffect = targetEffect.secondEffects.find(
            (effect) => effect.dieValue === dice.secondThrow
          );
          dice.secondEffect = secondEffect ? secondEffect.effect : "No effect";
        }
  
        dices.push(dice);
      }
  
      // display of the gamble results
      setDialogMessage(
        <Grid container spacing={2}>
          <Grid  size={12}>
            <Typography variant="body1">
              {t("Choose one of the following effects") + ": "}
            </Typography>
            {dices.map((dice, index) => (
              <Typography key={index} variant="h4" sx={{ margin: "10px 0" }}>
                <strong>{t(`Result`) + " " + (index + 1) + ": "}</strong>
                <br />
                <strong>{t("First Dice") + " (d" + attValue + "):"}</strong> ({dice.firstThrow}) - {t(`${dice.effect}`)}
                {dice.secondRoll && (
                  <>
                    <br />
                    <strong>{t("Second Dice") + " (d6):"}</strong> ({dice.secondThrow}) - {t(`${dice.secondEffect}`)}
                  </>
                )}
              </Typography>
            ))}
          </Grid>
        </Grid>
      );      
  
      // Deduct MP from the player
      if (useMp) {
        setPlayer((prevPlayer) => ({
          ...prevPlayer,
          stats: {
            ...prevPlayer.stats,
            mp: {
              ...prevPlayer.stats.mp,
              current: prevPlayer.stats.mp.current - usedMp,
            },
          },
        }));
      }
  
      // Deduct IP for MagiSphere
      if (selectedSpell?.isMagisphere && useIp) {
        setPlayer((prevPlayer) => ({
          ...prevPlayer,
          stats: {
            ...prevPlayer.stats,
            ip: {
              ...prevPlayer.stats.ip,
              current: prevPlayer.stats.ip.current - 2,
            },
          },
        }));
      }
  
      setIsRolling(true);
    } else {
      setIsRolling(false);
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
      {(defaultSpells.length > 0 || gambleSpells.length > 0) && (
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
                color: custom.white,
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
                  container
                  key={index}
                  sx={{ display: "flex", alignItems: "stretch" }}
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <Grid  sx={{ display: "flex" }} size={10}>
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
                      {spell.isMagisphere && (
                        <Tooltip title={t("Magisphere")}>
                          <SettingsSuggest />
                        </Tooltip>
                      )}
                      {spell.name}
                      {spell.isOffensive && <OffensiveSpellIcon />}
                    </Typography>
                  </Grid>
                  <Grid sx={{ display: "flex", alignItems: "stretch" }} size={2}>
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
              {gambleSpells.map((gamble, index) => (
                <Grid
                  container
                  key={index}
                  sx={{ display: "flex", alignItems: "stretch" }}
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <Grid  sx={{ display: "flex" }} size={10}>
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
                      {gamble.isMagisphere && (
                        <Tooltip title={t("Magisphere")}>
                          <SettingsSuggest />
                        </Tooltip>
                      )}
                      {gamble.spellName}
                    </Typography>
                  </Grid>
                  <Grid sx={{ display: "flex", alignItems: "stretch" }} size={2}>
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
                          onClick={() => handleOpenModal(gamble)}
                        >
                          <Info />
                        </IconButton>
                      </Tooltip>
                      {isEditMode && (
                        <Tooltip title={t("Roll")}>
                          <IconButton
                            sx={{ padding: "0px", marginLeft: "5px" }}
                          >
                            <Casino
                              onClick={() => {
                                handleRollSetup(gamble);
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
                <Grid  sx={{ marginTop: "20px" }} size={12}>
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
            <Dialog
              open={openModal}
              onClose={handleCloseModal}
              fullWidth
              maxWidth="sm"
            >
              <DialogContent sx={{ p: 0 }}>
                {selectedSpell && (
                  selectedSpell.spellType === "default" ? (
                    <PlayerSpellCard spell={selectedSpell} />
                  ) : selectedSpell.spellType === "gamble" ? (
                    <SpellEntropistGamble gamble={selectedSpell} />
                  ) : (
                    <NonStaticSpellCard item={selectedSpell} />
                  )
                )}
              </DialogContent>
              <DialogActions>
                <Button variant="contained" color="primary" onClick={handleOK} fullWidth>
                  {t("Close")}
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog
              open={dialogOpen}
              onClose={handleDialogClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              slotProps={{
                paper: { sx: { width: { xs: "90%", md: "50%" } } }
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
                id="alert-dialog-title"
              >
                {t("Spell Rolls")}
              </DialogTitle>
              <DialogContent sx={{ marginTop: "10px" }}>
                <DialogContent id="alert-dialog-description">
                  {!isRolling ? (
                    <Grid container sx={{ alignItems: "center" }} spacing={1}>
                      <Grid  size={12}>
                        <Typography variant="body1">
                          {selectedSpell?.spellType === "default" && t("Select number of targets from 1 to")}
                          {selectedSpell?.spellType === "gamble" && t("Select number of dices you want to throw")}
                          {" "}
                          {selectedSpell?.maxTargets || 1}:
                        </Typography>
                      </Grid>
                      <Grid  size={12}>
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
                        {selectedSpell?.isMagisphere && useIp && (
                          <>
                            <Typography variant="body1">
                              {t("IP Cost")}
                              {": "}
                              {2}
                            </Typography>
                            {2 > player.stats.ip.current && (
                              <Typography variant="body1" color="error">
                                {t("Not enough IP")}
                              </Typography>
                            )}
                          </>
                        )}
                      </Grid>
                      <Grid  size={12}>
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
                      {selectedSpell?.isMagisphere && (
                        <Grid  size={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={useIp}
                                onChange={(e) => setUseIp(e.target.checked)}
                              />
                            }
                            label={t("Use IP")}
                          />
                        </Grid>
                      )}
                    </Grid>
                  ) : (
                    <>{dialogMessage}</>
                  )}
                </DialogContent>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDialogClose} variant="contained" color="secondary">{t("Close")}</Button>
                <Button
                  onClick={
                    selectedSpell && selectedSpell?.spellType === "default"
                      ? handleRoll
                      : handleGambleRoll
                  }
                  variant="contained"
                  color="primary"
                >
                  {isRolling ? t("Re-Roll") : t("Roll")}
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </>
      )}
    </>
  );
}
