import React, { useState } from "react";
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
  Edit,
  Download,
} from "@mui/icons-material";
import NpcActorCard from "../shared/actors/npc/NpcActorCard";
import StatsTab from "./npcDetail/StatsTab";
import NotesTab from "./npcDetail/NotesTab";
import AttributeSection, { DefStatsRow } from "./npcDetail/AttributeSection";
import StandardRollsSection from "./npcDetail/StandardRollsSection";
import DefenseModifierDialog from "./npcDetail/DefenseModifierDialog";
import {
  calcPrecision,
  calcDamage,
  calcMagic,
  calcDef,
  calcMDef,
} from "../../libs/npcs";
import { t } from "../../translation/translate";
import { useTheme } from "@mui/material/styles";
import { useCombatSimSettingsStore } from "../../stores/combatSimSettingsStore";
import { useCombatEncounterStore } from "../../stores/combatEncounterStore";
import {
  prepareAccuracyCheck,
  rollAccuracyCheck,
  processAccuracyCheck,
  buildAccuracyCheckMessage,
} from "../app-drawer/panels/chat/domain/accuracy-checks";
import {
  prepareMagicCheck,
  rollMagicCheck,
  processMagicCheck,
  buildMagicCheckMessage,
} from "../app-drawer/panels/chat/domain/magic-checks";
import {
  prepareCheck,
  rollCheck,
  processCheck,
  buildAttributeCheckMessage,
  buildOpenCheckMessage,
} from "../app-drawer/panels/chat/domain/checks";

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
  npcRef,
  isMobile,
  emitLog,
  addMessage,
  npcDetailWidth,
  checkNewTurn,
  handleEditNPC,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [open, setOpen] = useState(false);
  const [numTargets, setNumTargets] = useState(1);
  const [error, setError] = useState("");
  const [clickedData, setClickedData] = useState({});
  const [defenseDialogType, setDefenseDialogType] = useState(null);

  const withTargets = (msg) => {
    if (msg.kind !== "accuracy" && msg.kind !== "magic") return msg;
    const targets = useCombatEncounterStore.getState().targets;
    if (!targets.length) return msg;
    return { ...msg, check: { ...msg.check, targetsSnapshot: [...targets] } };
  };

  const {
    autoUseMP,
    showBaseAttackEffect,
    showWeaponAttackEffect,
    showSpellEffect,
    autoCheckTurnAfterRoll,
    studyValues,
  } = useCombatSimSettingsStore.getState().settings;

  if (!selectedNPC) return null;

  const getDefenseValue = (defenseType) => {
    const baseValue = defenseType === "DEF" ? calcDef(selectedNPC) : calcMDef(selectedNPC);
    const modifier = defenseType === "DEF"
      ? selectedNPC?.combatStats?.defenseModifier
      : selectedNPC?.combatStats?.mdefenseModifier;
    const overrideMap = selectedNPC?.combatStats?.defenseOverride || {};
    const overrideValue = defenseType === "MDEF" && overrideMap.MDEF === undefined
      ? overrideMap["M.DEF"]
      : overrideMap[defenseType];
    const hasOverride = overrideValue !== "" && overrideValue !== null && overrideValue !== undefined;
    if (hasOverride) return Number.parseInt(overrideValue, 10) || 0;
    const calculatedValue = modifier == null ? baseValue : baseValue + modifier;
    const attrValue = defenseType === "DEF"
      ? calcAttr("Slow", "Enraged", "dexterity", selectedNPC)
      : calcAttr("Dazed", "Enraged", "insight", selectedNPC);
    return (calculatedValue || 0) + (attrValue || 0);
  };

  const defValue = getDefenseValue("DEF");
  const mdefValue = getDefenseValue("MDEF");

  const attributes = {
    dexterity: calcAttr("Slow", "Enraged", "dexterity", selectedNPC),
    insight: calcAttr("Dazed", "Enraged", "insight", selectedNPC),
    might: calcAttr("Weak", "Poisoned", "might", selectedNPC),
    will: calcAttr("Shaken", "Poisoned", "will", selectedNPC),
  };

  const npcSpeaker =
    selectedNPC?.name +
    (selectedNPC?.combatStats?.combatNotes
      ? "【" + selectedNPC.combatStats.combatNotes + "】"
      : "");

  // Maps long-form NPC attr keys ("dexterity") to pipeline short-form ("dex")
  const toAttr = (raw) => {
    const key = String(raw || "").toLowerCase();
    if (key === "dex" || key === "dexterity") return "dex";
    if (key === "ins" || key === "insight") return "ins";
    if (key === "mig" || key === "might") return "mig";
    if (key === "wlp" || key === "will" || key === "willpower") return "wlp";
    return "dex";
  };

  const normalizeAttrKey = (raw) => {
    const key = String(raw || "").toLowerCase();
    if (key === "dex" || key === "dexterity") return "dexterity";
    if (key === "ins" || key === "insight") return "insight";
    if (key === "mig" || key === "might") return "might";
    if (key === "wlp" || key === "will" || key === "willpower") return "will";
    return null;
  };

  const resolveNpcAttributeDie = (raw) => {
    const key = normalizeAttrKey(raw);
    const rawDirect = key ? attributes[key] : undefined;
    const direct =
      rawDirect && typeof rawDirect === "object" ? rawDirect.base : rawDirect;
    if (Number.isFinite(direct) && direct > 0) return direct;
    const npcAttrs = selectedNPC?.attributes ?? {};
    const rawFallback =
      key === "dexterity"
        ? npcAttrs.dexterity
        : key === "insight"
          ? npcAttrs.insight
          : key === "might"
            ? npcAttrs.might
            : key === "will"
              ? (npcAttrs.will ?? npcAttrs.willpower)
              : undefined;
    const fallback =
      rawFallback && typeof rawFallback === "object"
        ? rawFallback.base
        : rawFallback;
    return Number.isFinite(fallback) && fallback > 0 ? fallback : 6;
  };

  const maxTargets =
    clickedData.maxTargets && clickedData.maxTargets > 0
      ? clickedData.maxTargets
      : 1;

  const handleConfirmSpell = (spellData) => {
    const finalMpCost = spellData.cost?.perTarget
      ? (spellData.cost?.amount ?? 0) * numTargets
      : (spellData.cost?.amount ?? 0);

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
      const attr1Raw = spellData.accuracy?.attr1 ?? spellData.attr1;
      const attr2Raw = spellData.accuracy?.attr2 ?? spellData.attr2;
      const dieSizes = {
        primary: resolveNpcAttributeDie(normalizeAttrKey(attr1Raw)),
        secondary: resolveNpcAttributeDie(normalizeAttrKey(attr2Raw)),
      };
      const magicBonus = calcMagic(selectedNPC);
      const intent = prepareMagicCheck({
        arg: spellData.name,
        name: spellData.name,
        attr1: toAttr(attr1Raw),
        attr2: toAttr(attr2Raw),
        accuracyBonus: magicBonus !== 0 ? magicBonus : undefined,
        baseDamage: 0,
        damageType: spellData.damage?.type ?? "physical",
        damageHrZero: spellData.damageHrZero ?? false,
        description:
          showSpellEffect && spellData.effect ? spellData.effect : undefined,
      });
      const rolls = rollMagicCheck(dieSizes);
      const result = processMagicCheck(intent, rolls, dieSizes, npcSpeaker);
      if (addMessage) addMessage(withTargets(buildMagicCheckMessage(result)));
    } else {
      emitLog({
        type: "spell-use",
        actorName: selectedNPC.name,
        spellName: spellData.name,
      });
    }

    if (isMobile) {
      setSelectedNPC(null);
    }
    if (autoCheckTurnAfterRoll) {
      setTimeout(() => {
        checkNewTurn(selectedNPC.combatId);
      }, 100);
    }

    setNumTargets(1);
  };

  const handleAttack = (attack, attackType) => {
    const attr1Raw =
      attackType === "weapon"
        ? (attack.accuracy?.attr1 ?? attack.weapon?.att1)
        : attack.accuracy?.attr1;
    const attr2Raw =
      attackType === "weapon"
        ? (attack.accuracy?.attr2 ?? attack.weapon?.att2)
        : attack.accuracy?.attr2;

    const dieSizes = {
      primary: resolveNpcAttributeDie(normalizeAttrKey(attr1Raw)),
      secondary: resolveNpcAttributeDie(normalizeAttrKey(attr2Raw)),
    };

    const isNoDmg = attack.damage?.type === "nodmg" || attack.type === "nodmg";
    const effectText =
      attackType === "attack"
        ? showBaseAttackEffect && (attack.effect || attack.special?.[0])
          ? attack.effect || attack.special[0]
          : undefined
        : showWeaponAttackEffect && (attack.effect || attack.special?.[0])
          ? attack.effect || attack.special[0]
          : undefined;

    const intent = prepareAccuracyCheck({
      arg: attack.name,
      name: attack.name,
      attr1: toAttr(attr1Raw),
      attr2: toAttr(attr2Raw),
      accuracyBonus: calcPrecision(attack, selectedNPC) || undefined,
      baseDamage: isNoDmg ? 0 : calcDamage(attack, selectedNPC),
      damageType: attack.damage?.type ?? "physical",
      range: attack.range ?? attack.weapon?.range,
      description: effectText,
    });

    const rolls = rollAccuracyCheck(dieSizes);
    const result = processAccuracyCheck(intent, rolls, dieSizes, npcSpeaker);
    if (addMessage) addMessage(withTargets(buildAccuracyCheckMessage(result)));

    if (isMobile) {
      setSelectedNPC(null);
    }
    if (autoCheckTurnAfterRoll) {
      setTimeout(() => {
        checkNewTurn(selectedNPC.combatId);
      }, 100);
    }
  };

  function handleUseMP(mpCost) {
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
          : npc,
      ),
    );
  }

  const handleRoll = (
    attribute1,
    attribute2,
    attr1label,
    attr2label,
    modifier = 0,
    kind = "open",
    difficulty,
  ) => {
    const labelToAttr = (label) => {
      switch (label.toUpperCase()) {
        case "DEX":
          return "dex";
        case "INS":
          return "ins";
        case "MIG":
          return "mig";
        case "WLP":
          return "wlp";
        default:
          return "dex";
      }
    };

    const dieSizes = { primary: attribute1, secondary: attribute2 };
    const intent = prepareCheck({
      primary: labelToAttr(attr1label),
      secondary: labelToAttr(attr2label),
      modifiers:
        Number(modifier) !== 0
          ? [{ label: "Situational Bonus", value: Number(modifier) }]
          : [],
      ...(kind === "attribute" && Number.isFinite(Number(difficulty))
        ? { difficulty: Number(difficulty) }
        : {}),
    });
    const rolls = rollCheck(dieSizes);
    const result = processCheck(intent, rolls, dieSizes, npcSpeaker);
    if (addMessage) {
      if (kind === "attribute") {
        addMessage(buildAttributeCheckMessage(result));
      } else {
        addMessage(buildOpenCheckMessage(result));
      }
    }

    if (autoCheckTurnAfterRoll) {
      setTimeout(() => {
        checkNewTurn(selectedNPC.combatId);
      }, 100);
    }
  };

  const handleTabChange = (_, newIndex) => setTabIndex(newIndex);

  const handleUpdateDefenseModifiers = (updates) => {
    if (!selectedNPC) return;

    const updatedNPC = {
      ...selectedNPC,
      combatStats: {
        ...selectedNPC.combatStats,
        ...updates,
      },
    };

    setSelectedNPC(updatedNPC);
    setSelectedNPCs((prev) =>
      prev.map((npc) =>
        npc.combatId === updatedNPC.combatId ? updatedNPC : npc,
      ),
    );
  };

  const renderTabs = (
    <Tabs
      value={tabIndex}
      onChange={handleTabChange}
      variant="fullWidth"
      sx={{
        minHeight: 40,
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
            borderBottom: `1px solid ${theme.palette.divider}`,
            p: 1,
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

      <Box sx={{ flexGrow: 1, overflowY: "auto", paddingTop: 1, px: 1 }}>
        {tabIndex === 0 && (
          <NpcActorCard
            npc={selectedNPC}
            npcImage={selectedNPC.imgurl}
            collapse={true}
            study={selectedStudy}
            cardRef={npcRef}
            variant="interactive"
          />
        )}
        {tabIndex === 1 && (
          <StatsTab
            selectedNPC={selectedNPC}
            calcHP={calcHP}
            calcMP={calcMP}
            calcAttr={calcAttr}
            handleOpen={handleOpen}
            toggleStatusEffect={toggleStatusEffect}
            applyCommand={(command) => {
              window.dispatchEvent(new window.CustomEvent("chat:run-command", {
                detail: { command, speaker: npcSpeaker, actorDoc: selectedNPC },
              }));
            }}
          />
        )}
        {tabIndex === 2 && (
          <NotesTab
            selectedNPC={selectedNPC}
            setSelectedNPC={setSelectedNPC}
            selectedNPCs={selectedNPCs}
            setSelectedNPCs={setSelectedNPCs}
            emitLog={emitLog}
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
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <MenuItem value={0}>-</MenuItem>
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
                color="primary"
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
      {tabIndex === 1 && !isMobile && (
        <Box sx={{ borderTop: `1px solid rgba(255,255,255,0.08)`, px: 0, pt: 0.5 }}>
          <StandardRollsSection selectedNPC={selectedNPC} calcAttr={calcAttr} handleRoll={handleRoll} />
        </Box>
      )}
      {!isMobile && (
        <>
          <DefStatsRow
            defValue={defValue}
            mdefValue={mdefValue}

            onDefClick={() => setDefenseDialogType("DEF")}
            onMdefClick={() => setDefenseDialogType("MDEF")}
          />
          <AttributeSection selectedNPC={selectedNPC} calcAttr={calcAttr} />
        </>
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
            borderBottom: `1px solid ${theme.palette.divider}`,
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
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            {[...Array(maxTargets)].map((_, i) => {
              const targetCount = i + 1;
              const cost = clickedData.cost?.perTarget
                ? targetCount * (clickedData.cost?.amount ?? 0)
                : (clickedData.cost?.amount ?? 0);
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
            color="primary"
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
      <DefenseModifierDialog
        open={!!defenseDialogType}
        onClose={() => setDefenseDialogType(null)}
        defenseType={defenseDialogType}
        npc={selectedNPC}
        onUpdate={handleUpdateDefenseModifiers}
        calcDef={calcDef}
        calcMDef={calcMDef}
        calcAttr={calcAttr}
      />
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
          px: 1,
          py: 1,
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
      <DialogContent dividers sx={{ p: 0 }}>
        {content}
      </DialogContent>
      <DialogActions sx={{ p: 0 }}>
        <Grid container spacing={0}>
          {tabIndex === 0 && (
            <Grid size={12}>
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
                    value={selectedStudy ?? "sheet"}
                    onChange={handleStudyChange}
                    size="small"
                    sx={{
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: isDarkMode ? "#fff" : "primary",
                      },
                    }}
                  >
                    <MenuItem value="sheet">{t("Sheet")}</MenuItem>
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
          {tabIndex === 1 && (
            <Grid size={12}>
              <Box sx={{ borderTop: `1px solid rgba(255,255,255,0.08)` }}>
                <StandardRollsSection selectedNPC={selectedNPC} calcAttr={calcAttr} handleRoll={handleRoll} />
              </Box>
            </Grid>
          )}
          <Grid size={12}>
            <DefStatsRow
              defValue={getDefenseValue("DEF")}
              mdefValue={getDefenseValue("MDEF")}
  
              onDefClick={() => setDefenseDialogType("DEF")}
              onMdefClick={() => setDefenseDialogType("MDEF")}
            />
          </Grid>
          <Grid size={12}>
            <AttributeSection selectedNPC={selectedNPC} calcAttr={calcAttr} />
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  ) : (
    <Box
      sx={{
        width: npcDetailWidth,
        bgcolor: theme.palette.background.paper,
        padding: 0,
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
