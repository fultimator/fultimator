import React from "react";
import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Select,
  MenuItem,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  Grid,
} from "@mui/material";
import {
  Close,
  Description,
  Favorite,
  Casino,
  Edit,
  Download,
} from "@mui/icons-material";
import NpcPretty from "../npc/Pretty";
import StatsTab from "./npcDetail/StatsTab";
import NotesTab from "./npcDetail/NotesTab";
import AttributeSection from "./npcDetail/AttributeSection";
import { calcPrecision, calcDamage, calcMagic } from "../../libs/npcs";
import { t } from "../../translation/translate";
import { useTheme } from "@mui/material/styles";
import RollsTab from "./npcDetail/RollsTab";
import StandardRollsSection from "./npcDetail/StandardRollsSection";
import { useCombatSimSettingsStore } from "../../stores/combatSimSettingsStore";

const NPCDetail = ({
  selectedNPC,
  setSelectedNPC,
  tabIndex,
  setTabIndex,
  selectedStudy,
  handleStudyChange,
  downloadImage,
  calcHP,
  calcMP,
  handleOpen,
  toggleStatusEffect,
  selectedNPCs,
  setSelectedNPCs,
  calcAttr,
  handleDecreaseUltima,
  handleIncreaseUltima,
  npcRef,
  isMobile,
  addLog,
  openLogs,
  npcDetailWidth,
  checkNewTurn,
  handleEditNPC,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const [open, setOpen] = useState(false);
  const [numTargets, setNumTargets] = useState(1);
  const [error, setError] = useState("");
  const [clickedData, setClickedData] = useState({});

  const {
    autoUseMP,
    autoOpenLogs,
    showBaseAttackEffect,
    showWeaponAttackEffect,
    showSpellEffect,
    autoCheckTurnAfterRoll,
    hideLogs,
    logAttack,
    logCritFailure,
    logCritSuccess,
    logSpellOffensiveRoll,
    logSpellUse,
    logStandardRoll,
    studyValues,
  } = useCombatSimSettingsStore.getState().settings;

  //console.log(studyValues);

  if (!selectedNPC) return null;

  const attributes = {
    dexterity: calcAttr("Slow", "Enraged", "dexterity", selectedNPC),
    insight: calcAttr("Dazed", "Enraged", "insight", selectedNPC),
    might: calcAttr("Weak", "Poisoned", "might", selectedNPC),
    will: calcAttr("Shaken", "Poisoned", "will", selectedNPC),
  };

  const maxTargets =
    clickedData.maxTargets && clickedData.maxTargets > 0
      ? clickedData.maxTargets
      : 1;

  const handleConfirmSpell = (spellData) => {
    const finalMpCost = spellData.mp * numTargets;

    if (autoUseMP && finalMpCost > selectedNPC?.combatStats?.currentMp) {
      setError("Not enough MP!");
      return;
    }

    setOpen(false);
    setError("");

    if (autoUseMP) {
      handleUseMP(finalMpCost);
    }
    if (spellData.type === "offensive") {
      // Roll the attack
      const {
        diceResults,
        totalHitScore,
        damage,
        isCriticalFailure,
        isCriticalSuccess,
      } = rollAttack(spellData, "spell");

      if (logSpellOffensiveRoll) {
        // log the spell
        addLog("combat_sim_log_spell_offensive_roll", "--isSpell--", {
          npcName:
            selectedNPC.name +
            (selectedNPC?.combatStats?.combatNotes
              ? "【" + selectedNPC.combatStats.combatNotes + "】"
              : ""),
          spellName: spellData.name,
          targets: numTargets,
          dice1: diceResults.attribute1,
          dice2: diceResults.attribute2,
          extraMagic:
            calcMagic(selectedNPC) !== 0 ? " + " + calcMagic(selectedNPC) : "",
          totalHitScore: totalHitScore,
          hr: damage,
          effect: showSpellEffect && spellData.effect ? spellData.effect : "",
        });
      }

      if (isCriticalFailure && logCritFailure) {
        setTimeout(() => {
          addLog(
            "combat_sim_log_crit_failure",
            selectedNPC.name +
              (selectedNPC?.combatStats?.combatNotes
                ? "【" + selectedNPC.combatStats.combatNotes + "】"
                : "")
          );
        }, 100);
      }

      if (isCriticalSuccess && logCritSuccess) {
        setTimeout(() => {
          addLog(
            "combat_sim_log_crit_success",
            selectedNPC.name +
              (selectedNPC?.combatStats?.combatNotes
                ? "【" + selectedNPC.combatStats.combatNotes + "】"
                : "")
          );
        }, 100);
      }
    } else {
      if (logSpellUse) {
        addLog(
          "combat_sim_log_spell_use",
          selectedNPC.name +
            (selectedNPC?.combatStats?.combatNotes
              ? "【" + selectedNPC.combatStats.combatNotes + "】"
              : ""),
          spellData.name,
          numTargets,
          {
            effect: showSpellEffect && spellData.effect ? spellData.effect : "",
            markdown: true,
          }
        );
      }
    }
    if (autoOpenLogs) {
      openLogs();
    }
    if (isMobile) {
      /* close dialog */
      setSelectedNPC(null);
    }
    if (autoCheckTurnAfterRoll) {
      setTimeout(() => {
        checkNewTurn(selectedNPC.combatId);
      }, 100);
    }

    // reset numTargets
    setNumTargets(1);
  };

  const handleAttack = (attack, attackType) => {
    // Roll the attack
    const {
      diceResults,
      totalHitScore,
      damage,
      hr,
      isCriticalFailure,
      isCriticalSuccess,
    } = rollAttack(attack, attackType);

    if (logAttack) {
      // Add the attack to the log
      addLog("combat_sim_log_attack", "--isAttack--", {
        npcName:
          selectedNPC.name +
          (selectedNPC?.combatStats?.combatNotes
            ? "【" + selectedNPC.combatStats.combatNotes + "】"
            : ""),
        attackName: attack.name,
        range: attackType === "attack" ? attack.range : attack.weapon.range,
        damageType: attackType === "attack" ? attack.type : attack.weapon.type,
        dice1: diceResults.attribute1,
        dice2: diceResults.attribute2,
        prec:
          calcPrecision(attack, selectedNPC) !== 0
            ? " + " + calcPrecision(attack, selectedNPC)
            : "",
        totalHitScore,
        hr,
        extraDamage: calcDamage(attack, selectedNPC),
        damage,
        attackType,
        effect:
          attackType === "attack"
            ? showBaseAttackEffect && attack.special[0]
              ? attack.special[0]
              : ""
            : showWeaponAttackEffect && attack.special[0]
            ? attack.special[0]
            : "",
      });
    }

    if (isCriticalFailure && logCritFailure) {
      setTimeout(() => {
        addLog(
          "combat_sim_log_crit_failure",
          selectedNPC.name +
            (selectedNPC?.combatStats?.combatNotes
              ? "【" + selectedNPC.combatStats.combatNotes + "】"
              : "")
        );
      }, 100);
    }

    if (isCriticalSuccess && logCritSuccess) {
      setTimeout(() => {
        addLog(
          "combat_sim_log_crit_success",
          selectedNPC.name +
            (selectedNPC?.combatStats?.combatNotes
              ? "【" + selectedNPC.combatStats.combatNotes + "】"
              : "")
        );
      }, 100);
    }

    if (autoOpenLogs) {
      openLogs();
    }

    if (isMobile) {
      /* close dialog */
      setSelectedNPC(null);
    }

    if (autoCheckTurnAfterRoll) {
      setTimeout(() => {
        checkNewTurn(selectedNPC.combatId);
      }, 100);
    }
  };

  function handleUseMP(mpCost) {
    // Update the selectedNPC and selectedNPCs
    setSelectedNPC((prev) => ({
      ...prev,
      combatStats: {
        ...prev.combatStats,
        currentMp: prev.combatStats.currentMp - mpCost,
      },
    }));
    setSelectedNPCs((prev) =>
      prev.map((npc) =>
        npc.combatId === selectedNPC.combatId
          ? {
              ...npc,
              combatStats: {
                ...npc.combatStats,
                currentMp: npc.combatStats.currentMp - mpCost,
              },
            }
          : npc
      )
    );
  }

  const rollAttack = (attack, attackType) => {
    const message = `Rolling ${attack.name}.`;
    console.log(message);

    let attribute1, attribute2, extraDamage, extraPrecision, type;

    if (attackType === "weapon") {
      // For weapon attacks
      const { att1, att2 } = attack.weapon;
      attribute1 = attributes[att1];
      attribute2 = attributes[att2];
      extraDamage = calcDamage(attack, selectedNPC);
      extraPrecision = calcPrecision(attack, selectedNPC);
      type = attack.weapon.type;
    } else if (attackType === "spell") {
      // For spells
      const { attr1, attr2 } = attack;
      attribute1 = attributes[attr1];
      attribute2 = attributes[attr2];
      extraDamage = 0;
      extraPrecision = calcMagic(selectedNPC);
      type = "spell";
    } else {
      // For base attacks
      const { attr1, attr2 } = attack;
      attribute1 = attributes[attr1];
      attribute2 = attributes[attr2];
      extraDamage = calcDamage(attack, selectedNPC);
      extraPrecision = calcPrecision(attack, selectedNPC);
      type = attack.type;
    }

    if (attribute1 === undefined || attribute2 === undefined) {
      // Handle the case where attributes are not defined
      console.error("Attributes not defined");
      return;
    }

    // Simulate rolling the dice for each attribute
    const rollDice = (attribute) => Math.floor(Math.random() * attribute) + 1;
    const roll1 = rollDice(attribute1);
    const roll2 = rollDice(attribute2);

    // Check for critical success / failure
    const isCriticalSuccess = roll1 === roll2 && roll1 >= 6 && roll2 >= 6;
    const isCriticalFailure = roll1 === 1 && roll2 === 1;

    // Update dice results state
    const diceResults = { attribute1: roll1, attribute2: roll2 };

    // Calculate results
    const totalHitScore = roll1 + roll2 + extraPrecision;
    let baseDamage = Math.max(roll1, roll2);

    let damage = 0;
    if (type !== "nodmg") {
      damage = baseDamage + extraDamage;
    }

    return {
      diceResults,
      totalHitScore,
      damage,
      hr: baseDamage,
      isCriticalSuccess,
      isCriticalFailure,
    };
  };

  const handleRoll = (attribute1, attribute2, attr1label, attr2label) => {
    // Simulate rolling the dice for each attribute
    const rollDice = (attribute) => Math.floor(Math.random() * attribute) + 1;
    const roll1 = rollDice(attribute1);
    const roll2 = rollDice(attribute2);

    // Check for critical success / failure
    const isCriticalSuccess = roll1 === roll2 && roll1 >= 6 && roll2 >= 6;
    const isCriticalFailure = roll1 === 1 && roll2 === 1;

    // Calculate results
    const totalHitScore = roll1 + roll2;

    console.log(
      `Rolling ${attr1label} (${roll1}) + ${attr2label} (${roll2}) = ${totalHitScore}`
    );

    if (logStandardRoll) {
      // log the roll
      addLog("combat_sim_log_standard_roll", "--isStandardRoll--", {
        npcName:
          selectedNPC.name +
          (selectedNPC?.combatStats?.combatNotes
            ? "【" + selectedNPC.combatStats.combatNotes + "】"
            : ""),
        dice1: roll1,
        dice2: roll2,
        dice1Label: attr1label,
        dice2Label: attr2label,
        totalHitScore,
      });
    }

    if (isCriticalFailure && logCritFailure) {
      setTimeout(() => {
        addLog(
          "combat_sim_log_crit_failure",
          selectedNPC.name +
            (selectedNPC?.combatStats?.combatNotes
              ? "【" + selectedNPC.combatStats.combatNotes + "】"
              : "")
        );
      }, 100);
    }

    if (isCriticalSuccess && logCritSuccess) {
      setTimeout(() => {
        addLog(
          "combat_sim_log_crit_success",
          selectedNPC.name +
            (selectedNPC?.combatStats?.combatNotes
              ? "【" + selectedNPC.combatStats.combatNotes + "】"
              : "")
        );
      }, 100);
    }

    if (autoOpenLogs) {
      openLogs();
    }

    if (autoCheckTurnAfterRoll) {
      setTimeout(() => {
        checkNewTurn(selectedNPC.combatId);
      }, 100);
    }
  };

  const handleTabChange = (_, newIndex) => setTabIndex(newIndex);

  const renderTabs = (
    <Tabs
      value={tabIndex}
      onChange={handleTabChange}
      variant="fullWidth"
      sx={{
        minHeight: 40,
        "& .Mui-selected": {
          // Selected tab
          color: (isDarkMode ? secondary : primary) + " !important",
        },
        "& .MuiTab-root": {
          // Unselected tab
          color: isDarkMode ? "white" : "black",
        },
      }}
    >
      <Tab
        iconPosition="start"
        icon={<Description fontSize="small" />}
        label={!isMobile && t("combat_sim_sheet")}
        sx={{
          minHeight: 40,
          fontSize: { md: "0.8rem" },
          padding: { xs: "4px 4px", sm: "4px 6px", md: "4px 8px" },
          minWidth: 0,
        }}
      />
      <Tab
        iconPosition="start"
        icon={<Favorite fontSize="small" />}
        label={!isMobile && t("combat_sim_stats")}
        sx={{
          minHeight: 40,
          fontSize: { md: "0.8rem" },
          padding: { xs: "4px 4px", sm: "4px 6px", md: "4px 8px" },
          minWidth: 0,
        }}
      />
      <Tab
        iconPosition="start"
        icon={<Casino fontSize="small" />}
        label={!isMobile && t("combat_sim_rolls")}
        sx={{
          minHeight: 40,
          fontSize: { md: "0.8rem" },
          padding: { xs: "4px 4px", sm: "4px 6px", md: "4px 8px" },
          minWidth: 0,
        }}
      />
      <Tab
        iconPosition="start"
        icon={<Edit fontSize="small" />}
        label={!isMobile && t("combat_sim_notes")}
        sx={{
          minHeight: 40,
          fontSize: { md: "0.8rem" },
          padding: { xs: "4px 4px", sm: "4px 6px", md: "4px 8px" },
          minWidth: 0,
        }}
      />
    </Tabs>
  );

  const content = (
    <>
      {!isMobile && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #ccc",
            paddingBottom: 1,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              flexShrink: 0,
              letterSpacing: 1,
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {selectedNPC.name}
            {selectedNPC?.combatStats?.combatNotes &&
              ` 【${selectedNPC.combatStats.combatNotes}】`}
          </Typography>
          <Tooltip
            title={t("Close")}
            placement="left"
            enterDelay={500}
            enterNextDelay={500}
          >
            <IconButton
              size="small"
              sx={{ padding: 0 }}
              onClick={() => {
                setSelectedNPC(null);
                setTabIndex(0);
              }}
            >
              <Close />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {!isMobile && renderTabs}

      <Box sx={{ flexGrow: 1, overflowY: "auto", paddingTop: 1 }}>
        {tabIndex === 0 && (
          <NpcPretty
            npc={selectedNPC}
            npcImage={selectedNPC.imgurl}
            collapse={true}
            study={selectedStudy}
            ref={npcRef}
          />
        )}
        {tabIndex === 1 && (
          <StatsTab
            selectedNPC={selectedNPC}
            calcHP={calcHP}
            calcMP={calcMP}
            handleOpen={handleOpen}
            toggleStatusEffect={toggleStatusEffect}
            handleDecreaseUltima={handleDecreaseUltima}
            handleIncreaseUltima={handleIncreaseUltima}
            isMobile={isMobile}
          />
        )}
        {tabIndex === 2 && (
          <RollsTab
            selectedNPC={selectedNPC}
            setClickedData={setClickedData}
            setOpen={setOpen}
            handleAttack={handleAttack}
            handleSpell={handleConfirmSpell}
          />
        )}
        {tabIndex === 3 && (
          <NotesTab
            selectedNPC={selectedNPC}
            setSelectedNPC={setSelectedNPC}
            selectedNPCs={selectedNPCs}
            setSelectedNPCs={setSelectedNPCs}
            addLog={addLog}
          />
        )}
      </Box>

      {tabIndex === 0 && !isMobile && (
        <Box
          sx={{
            borderTop: "1px solid " + theme.palette.divider,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 1,
            marginBottom: 1,
            paddingX: 3,
          }}
        >
          {/* Left side: Select + Download */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Select
              value={selectedStudy}
              onChange={handleStudyChange}
              size="small"
              sx={{
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode ? "#fff" : "primary",
                },
              }}
            >
              <MenuItem value={0}>{t("combat_sim_study")}</MenuItem>
              <MenuItem value={1}>
                {studyValues === "default" ? "10+" : "7+"}
              </MenuItem>
              <MenuItem value={2}>
                {studyValues === "default" ? "13+" : "10+"}
              </MenuItem>
              <MenuItem value={3}>
                {studyValues === "default" ? "16+" : "13+"}
              </MenuItem>
            </Select>

            <Tooltip title="Download Sheet" placement="bottom">
              <Button
                color={isDarkMode ? "white" : "primary"}
                aria-label="download"
                onClick={downloadImage}
              >
                <Download />
              </Button>
            </Tooltip>
          </Box>

          {/* Right side: Edit button */}
          <Button
            variant="outlined"
            color="primary"
            onClick={handleEditNPC}
            startIcon={<Edit />}
          >
            {t("Edit")}
          </Button>
        </Box>
      )}
      {tabIndex === 2 && !isMobile && !hideLogs && (
        <Box
          sx={{
            borderTop: "1px solid " + theme.palette.divider,
          }}
        >
          <StandardRollsSection
            selectedNPC={selectedNPC}
            calcAttr={calcAttr}
            handleRoll={handleRoll}
          />
        </Box>
      )}

      {!isMobile && (
        <AttributeSection selectedNPC={selectedNPC} calcAttr={calcAttr} />
      )}

      {/* Target Selection Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        sx={{ "& .MuiDialog-paper": { borderRadius: 3, padding: 2 } }}
      >
        <DialogTitle
          variant="h4"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            borderBottom: "1px solid #ddd",
            pb: 1,
          }}
        >
          {t("combat_sim_select_n_targets")}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 1,
          }}
        >
          <Select
            fullWidth
            value={numTargets}
            onChange={(e) => setNumTargets(e.target.value)}
            error={!!error}
            sx={{
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: isDarkMode ? "#fff" : "primary",
              },
            }}
          >
            {[...Array(maxTargets)].map((_, i) => {
              const targetCount = i + 1;
              const cost = targetCount * clickedData.mp;
              return (
                <MenuItem
                  key={targetCount}
                  value={targetCount}
                  disabled={cost > selectedNPC?.combatStats?.currentMp}
                >
                  {t("Target")} x {targetCount} / {t("MP") + ": " + cost}
                </MenuItem>
              );
            })}
          </Select>
          {error && <FormHelperText error>{error}</FormHelperText>}
        </DialogContent>
        <DialogActions sx={{ width: "100%", justifyContent: "center" }}>
          <Button
            onClick={() => {
              setOpen(false);
              setError("");
            }}
            variant="outlined"
            color={isDarkMode ? "white" : "primary"}
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={() => handleConfirmSpell(clickedData)}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, textTransform: "uppercase", px: 3 }}
          >
            {t("Roll")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  return isMobile ? (
    <Dialog
      open={!!selectedNPC}
      onClose={() => setSelectedNPC(null)}
      fullScreen
    >
      <DialogTitle
        variant="h4"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          letterSpacing: 1,
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
      >
        {selectedNPC.name}
        {selectedNPC?.combatStats?.combatNotes &&
          ` 【${selectedNPC.combatStats.combatNotes}】`}
        <IconButton onClick={() => setSelectedNPC(null)}>
          <Close />
        </IconButton>
      </DialogTitle>
      {renderTabs}
      <DialogContent dividers>{content}</DialogContent>
      <DialogActions sx={{ p: 0 }}>
        <Grid container spacing={0}>
          {tabIndex === 0 && (
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginY: 1,
                  marginX: 3,
                }}
              >
                {/* Left side: Select + Download */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Select
                    value={selectedStudy}
                    onChange={handleStudyChange}
                    size="small"
                    sx={{
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: isDarkMode ? "#fff" : "primary",
                      },
                    }}
                  >
                    <MenuItem value={0}>{t("combat_sim_study")}</MenuItem>
                    <MenuItem value={1}>
                      {studyValues === "default" ? "10+" : "7+"}
                    </MenuItem>
                    <MenuItem value={2}>
                      {studyValues === "default" ? "13+" : "10+"}
                    </MenuItem>
                    <MenuItem value={3}>
                      {studyValues === "default" ? "16+" : "13+"}
                    </MenuItem>
                  </Select>

                  <Tooltip title="Download Sheet" placement="bottom">
                    <Button
                      color={isDarkMode ? "white" : "primary"}
                      aria-label="download"
                      onClick={downloadImage}
                    >
                      <Download />
                    </Button>
                  </Tooltip>
                </Box>

                {/* Right side: Edit button */}
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleEditNPC}
                  startIcon={<Edit />}
                >
                  {t("Edit")}
                </Button>
              </Box>
            </Grid>
          )}
          {tabIndex === 2 && !hideLogs && (
            <Grid item xs={12}>
              <StandardRollsSection
                selectedNPC={selectedNPC}
                calcAttr={calcAttr}
                handleRoll={handleRoll}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Box sx={{ width: "100%" }}>
              <AttributeSection selectedNPC={selectedNPC} calcAttr={calcAttr} />
            </Box>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  ) : (
    <Box
      sx={{
        width: npcDetailWidth,
        bgcolor: isDarkMode ? "#333333" : "#ffffff",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: "0 8px 8px 0",
      }}
    >
      {content}
    </Box>
  );
};

export default NPCDetail;
