import React, { useState } from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Tab, Tabs, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { Close, Description, Edit, Send, Favorite } from "@mui/icons-material";
import ActorActionBar from "./ActorActionBar";
import { useTheme } from "@mui/material/styles";
import { PlayerSheetCompact } from "/src/components/shared/actors/pc";
import { useCombatEncounterStore } from "/src/stores/combatEncounterStore";
import AttributeSection, { DefStatsRow } from "./npcDetail/AttributeSection";
import StandardRollsSection from "./npcDetail/StandardRollsSection";
import { t } from "../../translation/translate";
import {
  prepareCheck,
  rollCheck,
  processCheck,
  buildAttributeCheckMessage,
  buildOpenCheckMessage,
} from "../app-drawer/panels/chat/domain/checks";
import { deriveCombatStats } from "/src/components/shared/actors/core-utils";
import { useBarShell } from "/src/components/shared/actors/common/barShellUtils";
import { GradientLinearProgress } from "/src/components/shared/actors/pc/shared";
import { FpResourceIcon, HpResourceIcon, IpResourceIcon, MpResourceIcon } from "/src/components/icons";
import { SegmentedResourceBar } from "/src/components/shared/actors/common/PcResources";
import { RESOURCE_SCALES } from "/src/components/shared/actors/scaleTokens";
import { newShade } from "/src/libs/playerCalculations";
import { useAnimatedDeltaPercent, useAnimatedDeltaNumber, getDeltaOverlaySx, getPipFlashSx, PIP_STRIPES } from "/src/components/shared/actors/common/resourceBarMotion";

const BAR_SIDE_WIDTH = 62;
const BAR_TEXT_SIZE = "0.9rem";

// ---- Local strip components (PC-specific, no NPC-specific props) ----

function ResourceStrip({ label, value, max, Icon, color1, color2, crisisLine, onClick, shellBg, shellBorder, labelBg, labelBorder, trackBg }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const { animatedPct, delta } = useAnimatedDeltaPercent(pct, { moveMs: 760, deltaMs: 1800 });
  return (
    <Box
      onClick={onClick}
      sx={{
        height: 30, display: "flex", alignItems: "stretch", overflow: "hidden",
        bgcolor: shellBg, border: `1px solid ${shellBorder}`, borderRadius: "2px",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <Box sx={{
        width: BAR_SIDE_WIDTH, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
        bgcolor: labelBg, borderRight: `1px solid ${labelBorder}`,
        color: "#fff", fontFamily: "Antonio", fontWeight: 700, fontSize: BAR_TEXT_SIZE, letterSpacing: "0.04em",
      }}>
        {Icon ? <Icon size="1.2em" /> : null}
        {label}
      </Box>
      <Box sx={{ position: "relative", flex: 1, bgcolor: trackBg }}>
        <GradientLinearProgress
          variant="determinate"
          value={animatedPct}
          color1={color1}
          color2={color2}
          sx={{
            height: "100% !important",
            "&, & .MuiLinearProgress-bar": { borderRadius: 0 },
            "& .MuiLinearProgress-bar": (th) => ({
              transition: th.transitions.create("transform", {
                duration: th.transitions.duration.complex,
                easing: th.transitions.easing.easeOut,
              }),
            }),
          }}
        />
        {delta && Math.abs(delta.to - delta.from) > 0.0001 && (
          <Box key={delta.seq} sx={getDeltaOverlaySx(delta, "pcStatsDeltaFade")} />
        )}
        {crisisLine && (
          <Box sx={{
            position: "absolute", top: 0, bottom: 0, left: "50%", width: "2px",
            transform: "translateX(-50%)", bgcolor: "rgba(255,255,255,0.6)", pointerEvents: "none",
          }} />
        )}
      </Box>
      <Box sx={{
        width: BAR_SIDE_WIDTH, display: "flex", alignItems: "center", justifyContent: "center",
        bgcolor: labelBg, borderLeft: `1px solid ${labelBorder}`,
        color: "#fff", fontFamily: "Antonio", fontWeight: 700, fontSize: BAR_TEXT_SIZE, letterSpacing: "0.03em",
      }}>
        {value}/{max}
      </Box>
    </Box>
  );
}

function PipStrip({ label, value, pipCount = 6, max, Icon, onClick, shellBg, shellBorder, labelBg, labelBorder, trackBg, animated = false }) {
  const { animatedValue, delta: pipDelta } = useAnimatedDeltaNumber(value, { moveMs: 300, deltaMs: 1200 });
  const displayValue = animated ? Math.round(animatedValue) : value;
  const overflow = Math.max(0, displayValue - pipCount);
  const totalPips = max != null ? Math.min(max, pipCount) : pipCount;

  return (
    <Box onClick={onClick} sx={{
      minHeight: 30, display: "flex", alignItems: "stretch",
      bgcolor: shellBg, border: `1px solid ${shellBorder}`, borderRadius: "2px",
      cursor: onClick ? "pointer" : "default",
    }}>
      <Box sx={{
        width: BAR_SIDE_WIDTH, flexShrink: 0, display: "flex", flexDirection: "row",
        alignItems: "center", justifyContent: "center", gap: "4px",
        bgcolor: labelBg, borderRight: `1px solid ${labelBorder}`,
        color: "#fff", fontFamily: "Antonio", fontWeight: 700, fontSize: BAR_TEXT_SIZE, letterSpacing: "0.04em",
      }}>
        {Icon ? <Icon size="1.2em" /> : null}
        {label}
      </Box>
      <Box sx={{
        flex: 1, display: "flex", alignItems: "center",
        gap: "4px", px: "6px", py: "4px", bgcolor: trackBg, flexWrap: "nowrap",
      }}>
        {Array.from({ length: totalPips }).map((_, i) => {
          const filled = i < displayValue;
          const pipChanged = animated && pipDelta ? (i < pipDelta.from) !== (i < pipDelta.to) : false;
          const changed = pipChanged && pipDelta && i >= Math.min(pipDelta.from, pipDelta.to);
          return (
            <Box key={i} sx={{
              position: "relative",
              display: "flex", alignItems: "center", justifyContent: "center", flex: "1 1 0",
              opacity: filled ? 1 : 0.2,
              filter: filled ? "drop-shadow(0 0 2px rgba(255,255,255,0.45))" : "none",
              transition: (t) => t.transitions.create(["opacity", "filter"], { duration: t.transitions.duration.standard }),
              ...getPipFlashSx({ changed, keyframeName: `pcPipDelta_${i}`, stripe: PIP_STRIPES.subtle }),
            }}>
              {Icon && <Icon size="1.2em" />}
            </Box>
          );
        })}
        {overflow > 0 && (
          <Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: "0.9rem", color: "#fff", lineHeight: 1, ml: 0.5, flexShrink: 0 }}>
            +{overflow}
          </Typography>
        )}
      </Box>
      <Box sx={{
        width: BAR_SIDE_WIDTH, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        bgcolor: labelBg, borderLeft: `1px solid ${labelBorder}`,
        color: "#fff", fontFamily: "Antonio", fontWeight: 700, fontSize: BAR_TEXT_SIZE, letterSpacing: "0.04em",
      }}>
        {max != null ? `${displayValue}/${max}` : displayValue}
      </Box>
    </Box>
  );
}


const STATUS_EFFECT_ROWS = [
  [{ label: "Slow" }, { label: "Dazed" }, { label: "Weak" }, { label: "Shaken" }],
  [{ label: "Enraged" }, { label: "Poisoned" }],
];

function PcStatsTab({ previewPc, selectedPC, setSelectedPCs, handleOpen, applyCommand }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const { shellBg, shellBorder, labelBg, labelBorder, trackBg } = useBarShell();

  const statusEffectColors = {
    Slow: theme.palette.info.main,
    Dazed: theme.palette.warning.main,
    Weak: theme.palette.error.light,
    Shaken: theme.palette.warning.light,
    Enraged: theme.palette.error.main,
    Poisoned: theme.palette.success.main,
  };

  const hpNow = previewPc.combatStats?.currentHp ?? 0;
  const mpNow = previewPc.combatStats?.currentMp ?? 0;
  const ipNow = previewPc.combatStats?.currentIp ?? previewPc.stats?.ip?.current ?? 0;
  const fpNow = previewPc.combatStats?.currentFp ?? previewPc.info?.fabulapoints ?? 0;
  const maxHp = previewPc.stats?.hp?.max ?? 0;
  const maxMp = previewPc.stats?.mp?.max ?? 0;
  const maxIp = previewPc.stats?.ip?.max ?? 0;

  const toggleStatusEffect = (label) => {
    setSelectedPCs?.((prev) => prev.map((pc) => {
      if (pc.combatId !== selectedPC.combatId) return pc;
      const current = pc.combatStats?.statusEffects ?? [];
      const next = current.includes(label) ? current.filter((e) => e !== label) : [...current, label];
      return { ...pc, combatStats: { ...pc.combatStats, statusEffects: next } };
    }));
  };

  const canOpen = !!handleOpen;

  return (
    <Box>
      <Box sx={{ mt: 1.25, display: "grid", gap: 0.45 }}>
        <ResourceStrip
          label={t("HP")} value={hpNow} max={maxHp}
          Icon={HpResourceIcon}
          color1={newShade(theme.palette.error.main, isDarkMode ? 8 : 80)}
          color2={theme.palette.error.main}
          crisisLine
          onClick={canOpen ? () => handleOpen("HP", selectedPC, "pc") : undefined}
          shellBg={shellBg} shellBorder={shellBorder} labelBg={labelBg} labelBorder={labelBorder} trackBg={trackBg}
        />
        <ResourceStrip
          label={t("MP")} value={mpNow} max={maxMp}
          Icon={MpResourceIcon}
          color1={newShade(theme.palette.info.main, isDarkMode ? 10 : 80)}
          color2={theme.palette.info.main}
          onClick={canOpen ? () => handleOpen("MP", selectedPC, "pc") : undefined}
          shellBg={shellBg} shellBorder={shellBorder} labelBg={labelBg} labelBorder={labelBorder} trackBg={trackBg}
        />
        <SegmentedResourceBar
          label={t("IP")} value={ipNow} max={maxIp}
          color1={newShade(theme.palette.success.main, isDarkMode ? 10 : 80)}
          color2={theme.palette.success.main}
          Icon={IpResourceIcon}
          onClick={canOpen ? () => handleOpen("IP", selectedPC, "pc") : undefined}
          shellBg={shellBg} shellBorder={shellBorder} labelBg={labelBg} labelBorder={labelBorder} trackBg={trackBg}
          isInteractive={canOpen}
          rs={{ ...RESOURCE_SCALES.sm, barHeight: "30px" }}
        />
        <PipStrip
          label={t("FP")} value={fpNow} pipCount={6}
          Icon={FpResourceIcon}
          onClick={canOpen ? () => handleOpen("FP", selectedPC, "pc") : undefined}
          shellBg={shellBg} shellBorder={shellBorder} labelBg={labelBg} labelBorder={labelBorder} trackBg={trackBg}
        />
      </Box>

      <Box sx={{ mt: 0.9, display: "flex", alignItems: "center", gap: 0.8 }}>
        <Button variant="contained" onClick={() => handleOpen?.("HP", selectedPC, "pc")} size="small" fullWidth startIcon={<HpResourceIcon />} sx={{ fontSize: "0.93rem" }}>
          {t("Edit HP")}
        </Button>
        <Button variant="contained" onClick={() => handleOpen?.("MP", selectedPC, "pc")} size="small" fullWidth startIcon={<MpResourceIcon />} sx={{ fontSize: "0.93rem" }}>
          {t("Edit MP")}
        </Button>
        <Button variant="contained" onClick={() => handleOpen?.("IP", selectedPC, "pc")} size="small" fullWidth startIcon={<IpResourceIcon />} sx={{ fontSize: "0.93rem" }}>
          {t("Edit IP")}
        </Button>
        <Button variant="contained" onClick={() => handleOpen?.("FP", selectedPC, "pc")} size="small" fullWidth startIcon={<FpResourceIcon />} sx={{ fontSize: "0.93rem" }}>
          {t("Edit FP")}
        </Button>
      </Box>

      {applyCommand && (
        <Box sx={{ mt: 1 }}>
          <ActorActionBar
            actorDoc={previewPc}
            isNpc={false}
            applyCommand={applyCommand}
            expand
          />
        </Box>
      )}

      <Box sx={{ mt: 1 }}>
        {STATUS_EFFECT_ROWS.map((row, rowIndex) => (
          <ToggleButtonGroup
            key={rowIndex}
            value={previewPc.combatStats?.statusEffects ?? []}
            sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", mt: rowIndex === 0 ? 0 : 1 }}
          >
            {row.map(({ label }) => (
              <ToggleButton
                key={label}
                value={label}
                onClick={() => toggleStatusEffect(label)}
                sx={{
                  flex: "1 1 16%", minWidth: "80px", justifyContent: "center", padding: "5px 0",
                  "& .MuiTypography-root": {
                    textShadow: "none",
                  },
                  "&.Mui-selected": {
                    backgroundColor: statusEffectColors[label],
                    color: "white !important",
                    "& .MuiTypography-root": {
                      textShadow: "-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000",
                    },
                    "&:hover": { backgroundColor: statusEffectColors[label] + " !important", color: "white !important" },
                  },
                }}
              >
                <Typography variant="h5" sx={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 0.7,
                  fontWeight: "bold", textAlign: "center", color: "inherit",
                  fontSize: { xs: "1rem", sm: "1.2rem" },
                }}>
                  <Box component="img"
                    src={`/assets/icons/statuses/${label}.webp`} alt={label}
                    sx={{ width: { xs: "1.25em", sm: "1.35em" }, height: { xs: "1.25em", sm: "1.35em" }, objectFit: "contain" }}
                  />
                  {t(label)}
                </Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        ))}
      </Box>
    </Box>
  );
}

function PcNotesTab({ selectedPC, selectedPCs, setSelectedPCs, setSelectedPC, emitLog }) {
  const [customLog, setCustomLog] = useState("");

  const handleSendLog = () => {
    const trimmed = customLog.trim();
    if (!trimmed) return;
    emitLog?.({ type: "text", text: `${selectedPC.name}: ${trimmed}` });
    setCustomLog("");
  };

  const updatePc = (updater) => {
    setSelectedPCs?.((prev) => prev.map((pc) =>
      pc.combatId === selectedPC.combatId ? updater(pc) : pc
    ));
    setSelectedPC?.((prev) => updater(prev));
  };

  const notes = selectedPCs?.find((p) => p.combatId === selectedPC.combatId)?.combatStats?.notes ?? "";

  return (
    <>
      <TextField
        label={t("Notes")}
        variant="outlined"
        fullWidth
        multiline
        rows={10}
        value={notes}
        onChange={(e) => updatePc((pc) => ({ ...pc, combatStats: { ...pc.combatStats, notes: e.target.value } }))}
        sx={{ mt: 2 }}
        slotProps={{ htmlInput: { maxLength: 2000 } }}
      />
      <TextField
        label={t("combat_sim_custom_log")}
        variant="outlined"
        fullWidth
        value={customLog}
        onChange={(e) => setCustomLog(e.target.value)}
        sx={{ mt: 2 }}
        slotProps={{
          input: {
            endAdornment: (
              <Button onClick={handleSendLog} color="primary" variant="contained" startIcon={<Send />} disabled={!customLog}>
                {t("combat_sim_send_log")}
              </Button>
            ),
          },
        }}
      />
    </>
  );
}

function calcPcAttr(_status1, _status2, attrKey, pc) {
  const raw = pc?.attributes?.[attrKey];
  return raw && typeof raw === "object" ? (raw.current ?? raw.base ?? 0) : (raw ?? 0);
}

export default function PCDetail({
  selectedPC,
  setSelectedPC,
  npcDetailWidth,
  isMobile = false,
  selectedPCs,
  setSelectedPCs,
  emitLog,
  addMessage,
  handleOpen,
  tabIndex,
  setTabIndex,
}) {
  const theme = useTheme();
  const runtimeActors = useCombatEncounterStore((s) => s.runtimeActors);

  if (!selectedPC) return null;

  const runtime = runtimeActors?.[selectedPC.combatId] ?? {};
  const runtimeHp = selectedPC.combatStats?.currentHp ?? runtime.currentHp;
  const runtimeMp = selectedPC.combatStats?.currentMp ?? runtime.currentMp;
  const runtimeIp = selectedPC.combatStats?.currentIp ?? runtime.currentIp;

  const previewPc = {
    ...selectedPC,
    stats: {
      ...selectedPC.stats,
      hp: { ...selectedPC.stats?.hp, current: runtimeHp ?? selectedPC.stats?.hp?.current ?? 0 },
      mp: { ...selectedPC.stats?.mp, current: runtimeMp ?? selectedPC.stats?.mp?.current ?? 0 },
      ip: { ...selectedPC.stats?.ip, current: runtimeIp ?? selectedPC.stats?.ip?.current ?? 0 },
    },
    combatStats: {
      ...selectedPC.combatStats,
      currentHp: runtimeHp ?? selectedPC.combatStats?.currentHp,
      currentMp: runtimeMp ?? selectedPC.combatStats?.currentMp,
      currentIp: runtimeIp ?? selectedPC.combatStats?.currentIp,
    },
  };

  const pcSpeaker = { name: selectedPC?.name ?? "", type: "pc" };

  const handlePcAction = (command) => {
    window.dispatchEvent(new window.CustomEvent("chat:run-command", {
      detail: { command, speaker: previewPc?.name ?? "", actorDoc: previewPc },
    }));
  };

  const handleRoll = (attribute1, attribute2, attr1label, attr2label, modifier = 0, kind = "open", difficulty) => {
    const labelToAttr = (label) => ({ DEX: "dex", INS: "ins", MIG: "mig", WLP: "wlp" }[label.toUpperCase()] ?? "dex");
    const dieSizes = { primary: attribute1, secondary: attribute2 };
    const intent = prepareCheck({
      primary: labelToAttr(attr1label),
      secondary: labelToAttr(attr2label),
      modifiers: Number(modifier) !== 0 ? [{ label: "Situational Bonus", value: Number(modifier) }] : [],
      ...(kind === "attribute" && Number.isFinite(Number(difficulty)) ? { difficulty: Number(difficulty) } : {}),
    });
    const rolls = rollCheck(dieSizes);
    const result = processCheck(intent, rolls, dieSizes, pcSpeaker);
    if (addMessage) {
      if (kind === "attribute") addMessage(buildAttributeCheckMessage(result));
      else addMessage(buildOpenCheckMessage(result));
    }
  };

  const tabSx = {
    minHeight: 40,
    fontSize: { md: "0.8rem" },
    padding: { xs: "4px 4px", sm: "4px 6px", md: "4px 8px" },
    minWidth: 0,
  };

  const renderTabs = (
    <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} variant="fullWidth" sx={{ minHeight: 40 }}>
      <Tab iconPosition="start" icon={<Description fontSize="small" />} label={!isMobile && t("combat_sim_sheet")} sx={tabSx} />
      <Tab iconPosition="start" icon={<Favorite fontSize="small" />} label={!isMobile && t("combat_sim_stats")} sx={tabSx} />
      <Tab iconPosition="start" icon={<Edit fontSize="small" />} label={!isMobile && t("combat_sim_notes")} sx={tabSx} />
    </Tabs>
  );

  const renderContent = (
    <Box sx={{ flexGrow: 1, overflowY: "auto", pt: 1, px: 1 }}>
      {tabIndex === 0 && (
        <PlayerSheetCompact
          pc={previewPc}
          onUpdate={() => {}}
          characterImage={previewPc?.info?.imgurl ?? null}
          id={previewPc?.id}
        />
      )}
      {tabIndex === 1 && (
        <PcStatsTab
          previewPc={previewPc}
          selectedPC={selectedPC}
          setSelectedPCs={setSelectedPCs}
          handleOpen={handleOpen}
          applyCommand={handlePcAction}
        />
      )}
      {tabIndex === 2 && (
        <PcNotesTab
          selectedPC={selectedPC}
          selectedPCs={selectedPCs}
          setSelectedPCs={setSelectedPCs}
          setSelectedPC={setSelectedPC}
          emitLog={emitLog}
        />
      )}
    </Box>
  );

  const { currDef, currMDef } = deriveCombatStats(previewPc);

  const renderFooter = (
    <>
      {tabIndex === 1 && (
        <Box sx={{ borderTop: `1px solid rgba(255,255,255,0.08)` }}>
          <StandardRollsSection selectedNPC={previewPc} calcAttr={calcPcAttr} handleRoll={handleRoll} />
        </Box>
      )}
      <DefStatsRow defValue={currDef} mdefValue={currMDef} />
      <AttributeSection selectedNPC={previewPc} calcAttr={calcPcAttr} />
    </>
  );

  if (isMobile) {
    return (
      <Dialog open={!!selectedPC} onClose={() => setSelectedPC(null)} fullScreen>
        <DialogTitle
          variant="h4"
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", letterSpacing: 1, fontWeight: "bold", textTransform: "uppercase" }}
        >
          {selectedPC.name}
          <IconButton onClick={() => setSelectedPC(null)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", p: 0 }}>
          {renderTabs}
          {renderContent}
          {renderFooter}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Box
      sx={{
        width: npcDetailWidth,
        bgcolor: theme.palette.background.paper,
        height: "100%",
        borderRadius: "8px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
          borderBottom: "1px solid",
          borderColor: theme.palette.divider,
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
          {selectedPC.name}
        </Typography>
        <IconButton onClick={() => setSelectedPC(null)} size="small" sx={{ padding: 0 }}>
          <Close />
        </IconButton>
      </Box>

      {renderTabs}
      {renderContent}
      {renderFooter}
    </Box>
  );
}
