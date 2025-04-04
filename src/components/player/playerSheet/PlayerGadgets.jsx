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
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../../translation/translate";
import { Info, Casino, CheckCircle } from "@mui/icons-material";
import SpellTinkererAlchemy from "../spells/SpellTinkererAlchemy";
import SpellTinkererInfusion from "../spells/SpellTinkererInfusion";
import SpellTinkererMagitech from "../spells/SpellTinkererMagitech";

const ranks = ["Basic", "Advanced", "Superior"]; // Define ranks
const elements = ["physical", "wind", "bolt", "earth", "fire", "ice"];
export default function PlayerGadgets({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [selectedAlchemy, setSelectedAlchemy] = useState(null);
  const [selectedInfusion, setSelectedInfusion] = useState(null);
  const [selectedMagitech, setSelectedMagitech] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [openRollAlchemyModal, setOpenRollAlchemyModal] = useState(false);
  const [openMagicannonModal, setOpenMagicannonModal] = useState(false);
  const [selectedRank, setSelectedRank] = useState("Basic");
  const [rolledDice, setRolledDice] = useState([0, 0, 0, 0]); // Array to hold rolled dice values
  const [rolledResult, setRolledResult] = useState({ combinations: [] });
  const [useIP, setUseIP] = useState(true);

  const [selectedElement, setSelectedElement] = useState("physical");
  const [useMagicannonIP, setUseMagicannonIP] = useState(true);
  const [equipMagicannon, setEquipMagicannon] = useState(true);

  const handleOpenModal = (gadget) => {
    if (gadget.spellType === "tinkerer-alchemy") {
      setSelectedAlchemy(gadget);
    } else if (gadget.spellType === "tinkerer-infusion") {
      setSelectedInfusion(gadget);
    } else if (gadget.spellType === "tinkerer-magitech") {
      setSelectedMagitech(gadget);
    }

    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAlchemy(null);
    setSelectedInfusion(null);
    setSelectedMagitech(null);
    setOpenMagicannonModal(false);
    setSelectedElement("physical");
    setUseMagicannonIP(true);
    setEquipMagicannon(true);
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
      window.electron.alert(
        t("You don't have enough IP to roll this alchemy!")
      );
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

  const magicannonItem = {
    base: {
      category: "Firearm",
      name: "Magicannon",
      cost: 0,
      att1: "dexterity",
      att2: "insight",
      prec: 1,
      damage: 10,
      type: "physical",
      hands: 2,
      ranged: true,
      martial: false,
    },
    name: "Magicannon",
    category: "Firearm",
    melee: false,
    ranged: true,
    type: selectedElement,
    hands: 2,
    att1: "dexterity",
    att2: "insight",
    martial: false,
    damageBonus: false,
    damageReworkBonus: false,
    precBonus: false,
    rework: false,
    quality: "",
    qualityCost: "0",
    totalBonus: 0,
    selectedQuality: "",
    cost: 0,
    damage: 10,
    prec: 1,
    damageModifier: 0,
    precModifier: 0,
    defModifier: 0,
    mDefModifier: 0,
    isEquipped: equipMagicannon,
    dataType: "weapon",
    magicannon: true,
  };

  const handleCreateMagicannon = () => {
    // Use IP if checked
    if (useMagicannonIP) {
      // Update player's IP
      player.stats.ip.current -= 3;
      setPlayer({ ...player });
    }
  
    // Check if player already has a Magicannon
    const weapons = player.weapons || [];
    const hasMagicannon = weapons.some(weapon => weapon.magicannon === true);
  
    if (hasMagicannon) {
      // Delete the existing Magicannon
      setPlayer(prevPlayer => ({
        ...prevPlayer,
        weapons: prevPlayer.weapons ? prevPlayer.weapons.filter(weapon => !weapon.magicannon) : []
      }));
    }
  
    if (equipMagicannon) {
      // Unequip any currently equipped weapons or shields
      setPlayer(prevPlayer => ({
        ...prevPlayer,
        weapons: prevPlayer.weapons ? prevPlayer.weapons.map(weapon => ({
          ...weapon,
          isEquipped: false
        })) : [],
        shields: prevPlayer.shields ? prevPlayer.shields.map(shield => ({
          ...shield,
          isEquipped: false
        })) : []
      }));
    }
  
    // Add Magicannon weapon to the player weapons
    setPlayer(prevPlayer => ({
      ...prevPlayer,
      weapons: [...(prevPlayer.weapons || []), magicannonItem]
    }));
  
    // Close modal
    handleCloseModal();
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

  const magitechSpells = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        spell.spellType === "tinkerer-magitech" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
    )
    .sort((a, b) => a.className.localeCompare(b.className));

  return (
    <>
      {(alchemySpells.length > 0 ||
        infusionSpells.length > 0 ||
        magitechSpells.length > 0) && (
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
                color: "#fff",
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
              {magitechSpells.map((magitech, index) => (
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
                      {t("Magitech") +
                        " (" +
                        (magitech.rank ? t(ranks[magitech.rank - 1]) : "") +
                        ") " +
                        " - " +
                        t(magitech.className)}
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
                          onClick={() => handleOpenModal(magitech)}
                        >
                          <Info />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </Grid>
                </Grid>
              ))}
              {magitechSpells.some((magitech) => magitech.rank >= 2) && (
                <Grid
                  item
                  container
                  xs={12}
                  md={6}
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
                      {t("Magicannon")}
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
                      <Tooltip title={t("Activate")}>
                        <IconButton
                          sx={{ padding: "0px" }}
                          onClick={() => setOpenMagicannonModal(true)}
                        >
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </Grid>
                </Grid>
              )}
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
                {selectedMagitech !== null && (
                  <SpellTinkererMagitech
                    magitech={selectedMagitech}
                    isEditMode={false}
                  />
                )}
              </DialogContent>
              <DialogActions>
                <Button variant="contained" color="primary" onClick={handleCloseModal}>
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
                  color="secondary"
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
            <Dialog
              open={openMagicannonModal}
              onClose={handleCloseModal}
              PaperProps={{
                sx: {
                  width: "80%",
                  maxWidth: "lg",
                },
              }}
            >
              <DialogContent>
                <Typography variant="h2">{t("Magicannon")}</Typography>
                <div
                  style={{
                    borderBottom: "1px solid black",
                    marginBottom: "10px",
                  }}
                >
                  <ReactMarkdown>
                    {t(
                      "Magicannon_desc1"
                    )}
                  </ReactMarkdown>
                  <ReactMarkdown>
                    {t(
                      "Magicannon_desc2"
                    )}
                  </ReactMarkdown>
                </div>
                <Typography variant="body1">
                  {t(
                    "Do you want to create a new Magicannon? Creating a new Magicannon will replace any current Magicannon."
                  )}
                </Typography>
                {/* Select type of damage from elements const */}
                <Select
                  value={selectedElement}
                  onChange={(e) => setSelectedElement(e.target.value)}
                >
                  {elements.map((element) => (
                    <MenuItem key={element} value={element}>
                      {t(element)}
                    </MenuItem>
                  ))}
                </Select>
                {/* Select if you want to use the IP */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={useMagicannonIP}
                      onChange={(e) => setUseMagicannonIP(e.target.checked)}
                    />
                  }
                  label={t("Use IP")}
                />
                {/* Select if you want to automatically equip the magicannon */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={equipMagicannon}
                      onChange={(e) => setEquipMagicannon(e.target.checked)}
                    />
                  }
                  label={t("Equip Magicannon after creation")}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCloseModal}
                >
                  {t("Cancel")}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCreateMagicannon}
                  disabled={useMagicannonIP && player.stats.ip.current < 3}
                  color="primary"
                >
                  {t("Create Magicannon")}
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </>
      )}
    </>
  );
}
