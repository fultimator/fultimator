import React, { useState } from "react";
import {
  Grid,
  Typography,
  Paper,
  IconButton,
  Button,
  Tooltip,
  Divider,
  Dialog,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { Info, Casino } from "@mui/icons-material";
import SpellTinkererAlchemy from "../spells/SpellTinkererAlchemy";
import SpellTinkererInfusion from "../spells/SpellTinkererInfusion";

const ranks = ["Basic", "Advanced", "Superior"]; // Define ranks

export default function PlayerGadgets({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [selectedAlchemy, setSelectedAlchemy] = useState(null);
  const [selectedInfusion, setSelectedInfusion] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [openRollAlchemyModal, setOpenRollAlchemyModal] = useState(false);
  const [selectedRank, setSelectedRank] = useState("Basic");
  const [rolledDice, setRolledDice] = useState([0, 0, 0, 0]); // Array to hold rolled dice values
  const [rolledResult, setRolledResult] = useState({ combinations: [] });
  const [useIP, setUseIP] = useState(true);
  // Variable to hold the result of the rolled dice

  const handleOpenModal = (gadget) => {
    if (gadget.spellType === "tinkerer-alchemy") {
      setSelectedAlchemy(gadget);
    } else if (gadget.spellType === "tinkerer-infusion") {
      setSelectedInfusion(gadget);
    }

    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAlchemy(null);
    setSelectedInfusion(null);
  };

  const handleCloseRollAlchemyModal = () => {
    setOpenRollAlchemyModal(false);
    setSelectedAlchemy(null);
  };

  const handleRollSetup = (alchemy) => {
    setSelectedAlchemy(alchemy);
    if (alchemy && alchemy.rank) {
      setSelectedRank(ranks[alchemy.rank - 1]); // Set selected rank based on alchemy.rank
    }
    setOpenRollAlchemyModal(true);
  };

  const handleRankChange = (event) => {
    setSelectedRank(event.target.value);
  };

  const handleRoll = () => {
    let numDice = 0;
    let ipCost = 0;

    // Determine number of dice and IP cost based on selected rank
    if (selectedRank === "Basic") {
      numDice = 2;
      ipCost = 3;
    } else if (selectedRank === "Advanced") {
      numDice = 3;
      ipCost = 4;
    } else if (selectedRank === "Superior") {
      numDice = 4;
      ipCost = 5;
    }

    // Check if player has enough IP
    if (player.stats.ip.current < ipCost && useIP) {
      alert(t("You don't have enough IP to roll this alchemy!"));
      return;
    }

    // Update player's IP
    if (useIP) {
      player.stats.ip.current -= ipCost;
      setPlayer({ ...player });
    }

    // Simulate rolling the dice
    const rolledValues = Array.from(
      { length: numDice },
      () => Math.floor(Math.random() * 20) + 1
    );

    setRolledDice(rolledValues);

    // Simulate roll and get combinations
    const rollResult = simulateRoll(rolledValues, selectedAlchemy);

    // Display result or handle further logic as needed
    console.log("Dice rolled:", rolledValues);
    console.log("Combinations:", rollResult.combinations);

    // Update state or perform further actions with rollResult
    setRolledResult(rollResult); // Assuming you have a state setter for rollResult
  };

  // Simulate the roll and return the result
  const simulateRoll = (diceValues, alchemy) => {
    const result = {
      combinations: [],
    };

    // Iterate over all combinations of dice assignments
    for (let i = 0; i < diceValues.length; i++) {
      for (let j = 0; j < diceValues.length; j++) {
        const targetRoll = diceValues[i];
        const effectRoll = diceValues[j];

        // Find corresponding targets and effects for the rolled values
        const matchedTarget = alchemy.targets.find(
          (target) =>
            targetRoll >= target.rangeFrom && targetRoll <= target.rangeTo
        );
        const matchedEffect = alchemy.effects.find(
          (effect) => effect.dieValue === effectRoll
        );

        if (matchedTarget && matchedEffect) {
          // Create a combination with specific target and effect
          const combination = {
            target: matchedTarget.effect,
            effect: matchedEffect.effect,
          };
          result.combinations.push(combination);
        }

        // Create combinations with any effects
      }
    }

    const anyEffects = alchemy.effects.filter(
      (effect) => effect.dieValue === 0
    );

    // Combination with specific target and any effect
    diceValues.forEach((diceValue) => {
      anyEffects.forEach((anyEffect) => {
        const targetRoll = diceValue;
        const matchedTarget = alchemy.targets.find(
          (target) =>
            targetRoll >= target.rangeFrom && targetRoll <= target.rangeTo
        );
        const combination = {
          target: matchedTarget.effect,
          effect: anyEffect.effect,
        };
        result.combinations.push(combination);
      });
    });

    return result;
  };

  /* All alchemy spells from all classes */
  const alchemySpells = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        spell.spellType === "tinkerer-alchemy" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
    )
    .sort((a, b) => a.className.localeCompare(b.className));

  const infusionSpells = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        spell.spellType === "tinkerer-infusion" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
    )
    .sort((a, b) => a.className.localeCompare(b.className));

  return (
    <>
      {(alchemySpells.length > 0 || infusionSpells.length > 0) && (
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
              {t("Gadgets")}
            </Typography>
            <Grid container spacing={1} sx={{ padding: "1em" }}>
              {alchemySpells.map((alchemy, index) => (
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
                      {t("Alchemy") +
                        " (" +
                        (alchemy.rank ? t(ranks[alchemy.rank - 1]) : "") +
                        ") " +
                        " - " +
                        t(alchemy.className)}
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
                          onClick={() => handleOpenModal(alchemy)}
                        >
                          <Info />
                        </IconButton>
                      </Tooltip>
                      {isEditMode && (
                        <Tooltip title={t("Roll")}>
                          <IconButton
                            sx={{ padding: "0px", marginLeft: "5px" }}
                            onClick={() => handleRollSetup(alchemy)}
                          >
                            <Casino />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  </Grid>
                </Grid>
              ))}
              {infusionSpells.map((infusion, index) => (
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
                      {t("Infusion") +
                        " (" +
                        (infusion.rank ? t(ranks[infusion.rank - 1]) : "") +
                        ") " +
                        " - " +
                        t(infusion.className)}
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
                          onClick={() => handleOpenModal(infusion)}
                        >
                          <Info />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </Grid>
                </Grid>
              ))}
            </Grid>
            <Dialog
              open={openModal}
              onClose={handleCloseModal}
              PaperProps={{
                sx: {
                  width: "80%",
                  maxWidth: "lg",
                },
              }}
            >
              <DialogContent>
                {selectedAlchemy !== null && (
                  <SpellTinkererAlchemy
                    alchemy={selectedAlchemy}
                    isEditMode={false}
                  />
                )}
                {selectedInfusion !== null && (
                  <SpellTinkererInfusion
                    infusion={selectedInfusion}
                    isEditMode={false}
                  />
                )}
              </DialogContent>
              <DialogActions>
                <Button variant="contained" onClick={handleCloseModal}>
                  OK
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog
              open={openRollAlchemyModal}
              onClose={handleCloseRollAlchemyModal}
              PaperProps={{
                sx: {
                  width: "80%",
                  maxWidth: "lg",
                },
              }}
            >
              <DialogContent>
                <Typography variant="h2">{t("Alchemy Roll")}</Typography>

                <Typography variant="h3" sx={{ mt: 2 }}>
                  {t("Character LVL") + ": " + player.lvl} {" / "}
                  {t("Current IP") + ": " + player.stats.ip.current}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <FormControl fullWidth sx={{ mt: 3 }}>
                      <InputLabel id="rank-select-label">
                        {t("Select Rank")}
                      </InputLabel>
                      <Select
                        labelId="rank-select-label"
                        id="rank-select"
                        value={selectedRank}
                        label={t("Select Rank")}
                        onChange={handleRankChange}
                      >
                        {selectedAlchemy &&
                          selectedAlchemy.rank &&
                          ranks
                            .filter(
                              (rank, index) => index < selectedAlchemy.rank
                            ) // Filter ranks based on selectedAlchemy.rank
                            .map((rank, index) => (
                              <MenuItem key={index} value={rank}>
                                {t(rank) +
                                  " (" +
                                  t("IP Cost") +
                                  ": " +
                                  (index + 3) +
                                  ")"}
                              </MenuItem>
                            ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth sx={{ mt: 3 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={useIP}
                            onChange={(e) => setUseIP(e.target.checked)}
                          />
                        }
                        label={t("Use IP")}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                {/* Display possible combinations based on selectedRank */}
                {rolledResult && rolledResult.combinations.length > 0 && (
                  <Typography variant="h3" sx={{ mt: 2 }}>
                    {t("Rolled Dice")}: {rolledDice.join(", ")}
                  </Typography>
                )}
                {rolledResult && rolledResult.combinations.length > 0 && (
                  <>
                    <Typography variant="h3" sx={{ mt: 2 }}>
                      {t("Combinations")}:
                    </Typography>
                    <ol>
                      {rolledResult &&
                        rolledResult.combinations &&
                        (() => {
                          const allCombinations = rolledResult.combinations.map(
                            (combination) => ({
                              target: combination.target,
                              effect: combination.effect,
                              combined:
                                combination.target + " " + combination.effect,
                            })
                          );

                          const uniqueCombinations = Array.from(
                            new Set(
                              allCombinations.map((item) => item.combined)
                            )
                          ).map((combined) =>
                            allCombinations.find(
                              (item) => item.combined === combined
                            )
                          );

                          uniqueCombinations.sort((a, b) => {
                            if (a.target < b.target) return -1;
                            if (a.target > b.target) return 1;
                            if (a.effect < b.effect) return -1;
                            if (a.effect > b.effect) return 1;
                            return 0;
                          });

                          return (
                            <>
                              {uniqueCombinations.map(
                                (uniqueCombination, index) => (
                                  <li key={index}>
                                    <strong>{uniqueCombination.target}</strong>{" "}
                                    <em>{uniqueCombination.effect}</em>
                                  </li>
                                )
                              )}
                              {uniqueCombinations.length <
                                allCombinations.length && (
                                <Typography
                                  variant="body1"
                                  sx={{
                                    mt: 3,
                                    fontStyle: "italic",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {t("Only unique combinations are shown")}.
                                </Typography>
                              )}
                            </>
                          );
                        })()}
                    </ol>
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button
                  variant="contained"
                  onClick={handleCloseRollAlchemyModal}
                >
                  {t("Cancel")}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRoll} /*onClick={handleRoll}*/
                >
                  {t("Roll")}
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </>
      )}
    </>
  );
}
