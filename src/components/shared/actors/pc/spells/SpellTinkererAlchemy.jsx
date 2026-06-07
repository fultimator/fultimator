import React, { useState } from "react";
import {
  Typography,
  IconButton,
  Grid,
  ThemeProvider,
  Tooltip,
  Icon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  ToggleButton,
} from "@mui/material";
import {
  Edit,
  VisibilityOff,
  ExpandMore,
  Info,
  Casino,
  Close,
} from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import ReactMarkdown from "react-markdown";

import { useCustomTheme } from "/src/hooks/useCustomTheme";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";

function rollD20s(count) {
  return Array.from(
    { length: count },
    () => Math.floor(Math.random() * 20) + 1,
  );
}

function AlchemyRollDialog({ open, onClose, rank, alchemy, speaker, t }) {
  const diceCount = rank + 1;
  const rankLabels = [t("Basic"), t("Advanced"), t("Superior")];
  const rankDescriptions = [
    t("Roll two d20s and assign one to target and one to effect."),
    t("Roll three d20s and assign one to target and one to effect."),
    t("Roll four d20s and assign one to target and one to effect."),
  ];

  const [rolls, setRolls] = useState(() => rollD20s(diceCount));
  // selectedTarget: index into alchemy.targets
  // selectedTarget: { tableIdx, dieIdx } - which table row and which rolled die
  // selectedEffect: { tableIdx, dieIdx } - dieIdx = -1 for "Any"
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedEffect, setSelectedEffect] = useState(null);

  React.useEffect(() => {
    if (open) {
      setRolls(rollD20s(diceCount));
      setSelectedTarget(null);
      setSelectedEffect(null);
    }
  }, [open, diceCount]);

  const handleRoll = () => {
    setRolls(rollD20s(diceCount));
    setSelectedTarget(null);
    setSelectedEffect(null);
  };

  const targets = alchemy.targets ?? [];
  const effects = alchemy.effects ?? [];

  // Returns die indices that fall in target's range, excluding the one used by the other selection
  const targetMatchingDice = (target, excludeDieIdx = null) =>
    rolls.reduce((acc, v, i) => {
      if (i !== excludeDieIdx && v >= target.rangeFrom && v <= target.rangeTo)
        acc.push(i);
      return acc;
    }, []);

  // Returns die indices that match effect's value, excluding the one used by the other selection
  const effectMatchingDice = (effect, excludeDieIdx = null) => {
    if (effect.dieValue === 0) return [-1]; // Any: always available, no die consumed
    return rolls.reduce((acc, v, i) => {
      if (i !== excludeDieIdx && v === effect.dieValue) acc.push(i);
      return acc;
    }, []);
  };

  const handleSelectTarget = (tableIdx, target) => {
    if (selectedTarget?.tableIdx === tableIdx) {
      setSelectedTarget(null);
      return;
    }
    const excludeDieIdx = selectedEffect?.dieIdx ?? null;
    const matching = targetMatchingDice(
      target,
      excludeDieIdx === -1 ? null : excludeDieIdx,
    );
    if (matching.length === 0) return;
    setSelectedTarget({ tableIdx, dieIdx: matching[0] });
    // clear effect if it was using the same die
    if (selectedEffect && selectedEffect.dieIdx === matching[0])
      setSelectedEffect(null);
  };

  const handleSelectEffect = (tableIdx, effect) => {
    if (selectedEffect?.tableIdx === tableIdx) {
      setSelectedEffect(null);
      return;
    }
    const excludeDieIdx = selectedTarget?.dieIdx ?? null;
    const matching = effectMatchingDice(effect, excludeDieIdx);
    if (matching.length === 0) return;
    setSelectedEffect({ tableIdx, dieIdx: matching[0] });
    // clear target if it was using the same die
    if (
      selectedTarget &&
      matching[0] !== -1 &&
      selectedTarget.dieIdx === matching[0]
    )
      setSelectedTarget(null);
  };

  // A target row is visible if it has at least one matching die (ignoring exclusions for display)
  const dieMatchesTarget = (target) =>
    rolls.some((v) => v >= target.rangeFrom && v <= target.rangeTo);
  // An effect row is visible if it matches any die or is Any
  const dieMatchesEffect = (effect) =>
    effect.dieValue === 0 || rolls.some((v) => v === effect.dieValue);

  const canSend = selectedTarget !== null && selectedEffect !== null;

  const handleSend = () => {
    const targetEntry = targets[selectedTarget.tableIdx];
    const effectEntry = effects[selectedEffect.tableIdx];
    const rankName = rankLabels[rank - 1];

    sendDisplayMessage("inventory", t("Alchemy Mix") + ` - ${rankName}`, {
      speaker,
      tags: [`${t("IP Cost")}: ${rank + 2}`],
      description: targetEntry
        ? `**${t("Target")}:** ${targetEntry.effect}`
        : `**${t("Target")}:** -`,
      effect: effectEntry
        ? `**${t("Effect")}:** ${effectEntry.effect}`
        : `**${t("Effect")}:** -`,
      cost: { resource: "ip", amount: rank + 2 },
    });
    onClose();
  };

  const mdInline = { p: ({ node: _n, ...props }) => <span {...props} /> };

  const rowSx = (selected, highlighted) => ({
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    px: 1.5,
    py: 1,
    borderRadius: 1,
    cursor: "pointer",
    backgroundColor: selected
      ? "action.selected"
      : highlighted
        ? "action.hover"
        : "transparent",
    "&:hover": {
      backgroundColor: selected ? "action.selected" : "action.hover",
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", pr: 6 }}>
        {t("Roll Mix")} - {rankLabels[rank - 1]}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {rankDescriptions[rank - 1]}
          </Typography>

          {/* Dice roll bar */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("Rolled")}:
            </Typography>
            {rolls.map((v, i) => {
              const isTarget = selectedTarget?.dieIdx === i;
              const isEffect = selectedEffect?.dieIdx === i;
              return (
                <Box
                  key={i}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    border: "2px solid",
                    borderColor:
                      isTarget || isEffect ? "primary.main" : "divider",
                    backgroundColor:
                      isTarget || isEffect
                        ? "primary.main"
                        : "background.default",
                    color:
                      isTarget || isEffect
                        ? "primary.contrastText"
                        : "text.primary",
                  }}
                >
                  {v}
                  {isTarget ? " T" : isEffect ? " E" : ""}
                </Box>
              );
            })}
            <Button size="small" startIcon={<Casino />} onClick={handleRoll}>
              {t("Reroll")}
            </Button>
          </Box>

          {/* Target table */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
              {t("Target")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              {targets.filter(dieMatchesTarget).map((target, i, arr) => {
                const origIdx = targets.indexOf(target);
                const selected = selectedTarget?.tableIdx === origIdx;
                const available =
                  targetMatchingDice(
                    target,
                    selectedEffect?.dieIdx === -1
                      ? null
                      : selectedEffect?.dieIdx,
                  ).length > 0;
                return (
                  <Box
                    key={origIdx}
                    sx={{
                      ...rowSx(selected, available),
                      borderBottom: i < arr.length - 1 ? "1px solid" : "none",
                      borderColor: "divider",
                      opacity: available || selected ? 1 : 0.4,
                    }}
                    onClick={() => handleSelectTarget(origIdx, target)}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        minWidth: 48,
                        color: "primary.main",
                        flexShrink: 0,
                      }}
                    >
                      {target.rangeFrom === target.rangeTo
                        ? target.rangeFrom
                        : `${target.rangeFrom}-${target.rangeTo}`}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ flex: 1 }}
                    >
                      <ReactMarkdown components={mdInline}>
                        {target.effect}
                      </ReactMarkdown>
                    </Typography>
                    <ToggleButton
                      value="t"
                      selected={selected}
                      size="small"
                      sx={{
                        p: "6px",
                        minWidth: 36,
                        minHeight: 36,
                        flexShrink: 0,
                      }}
                      onChange={() => handleSelectTarget(origIdx, target)}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, lineHeight: 1 }}
                      >
                        T
                      </Typography>
                    </ToggleButton>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Effect table */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
              {t("Effect")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              {effects.filter(dieMatchesEffect).map((effect, i, arr) => {
                const origIdx = effects.indexOf(effect);
                const selected = selectedEffect?.tableIdx === origIdx;
                const available =
                  effectMatchingDice(effect, selectedTarget?.dieIdx).length > 0;
                return (
                  <Box
                    key={origIdx}
                    sx={{
                      ...rowSx(selected, available),
                      borderBottom: i < arr.length - 1 ? "1px solid" : "none",
                      borderColor: "divider",
                      opacity: available || selected ? 1 : 0.4,
                    }}
                    onClick={() => handleSelectEffect(origIdx, effect)}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        minWidth: 48,
                        color:
                          effect.dieValue === 0
                            ? "text.secondary"
                            : "primary.main",
                        fontStyle: effect.dieValue === 0 ? "italic" : "normal",
                        flexShrink: 0,
                      }}
                    >
                      {effect.dieValue === 0 ? t("Any") : effect.dieValue}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ flex: 1 }}
                    >
                      <ReactMarkdown components={mdInline}>
                        {effect.effect}
                      </ReactMarkdown>
                    </Typography>
                    <ToggleButton
                      value="e"
                      selected={selected}
                      size="small"
                      sx={{
                        p: "6px",
                        minWidth: 36,
                        minHeight: 36,
                        flexShrink: 0,
                      }}
                      onChange={() => handleSelectEffect(origIdx, effect)}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, lineHeight: 1 }}
                      >
                        E
                      </Typography>
                    </ToggleButton>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button variant="contained" disabled={!canSend} onClick={handleSend}>
          {t("Send to Chat")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ThemedSpellTinkererAlchemy({
  alchemy,
  onEditRank,
  onEditTargets,
  onEditEffects,
  isEditMode,
  speaker,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const [rollRank, setRollRank] = useState(null);

  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  const rankLabels = [t("Basic"), t("Advanced"), t("Superior")];
  const rankDescriptions = [
    t("Roll two d20s and assign one to target and one to effect."),
    t("Roll three d20s and assign one to target and one to effect."),
    t("Roll four d20s and assign one to target and one to effect."),
  ];

  const showInPlayerSheet =
    alchemy.showInPlayerSheet || alchemy.showInPlayerSheet === undefined;

  // Show all ranks up to and including the current rank
  const visibleRanks = Array.from({ length: alchemy.rank }, (_, i) => i + 1);

  return (
    <>
      <Accordion
        disableGutters
        elevation={0}
        square
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Icon sx={{ color: theme.primary, marginRight: 1 }}>
            <Info />
          </Icon>
          <Typography variant="h4">{t("Alchemy Details")}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ py: "6px", px: "12px" }}>
          <ReactMarkdown>
            {t(
              "You may perform the **Inventory** action to rapidly craft a **potion** with powerful but somewhat unpredictable effects. When you do so, choose one type of **mix** among those you have unlocked (**basic**, **advanced** or **superior**) and spend the appropriate amount of Inventory Points.",
            )}
          </ReactMarkdown>
          <ReactMarkdown>
            {t(
              "When you create a mix, roll the amount of twenty-sided dice indicated by that mix, then assign one of those rolls to the **target** table and one to the **effect** table . Discard all remaining dice, then describe the effects of the mix!",
            )}
          </ReactMarkdown>
          <ReactMarkdown>
            {t(
              'Effects marked with "**Any**" on the **effect** table are always available and can be chosen if none of the available effects appeal to you.',
            )}
          </ReactMarkdown>
        </AccordionDetails>
      </Accordion>
      {/* MIX Header */}
      <div
        style={{
          backgroundColor: theme.primary,
          fontFamily: "Antonio",
          fontWeight: "normal",
          fontSize: "1.1em",
          padding: "2px 17px",
          color: theme.white,
          textTransform: "uppercase",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Grid container style={{ flexGrow: 1 }}>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
            }}
            size="grow"
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
            >
              {t("Mix")}
            </Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            size={2}
          >
            <Typography variant="h3">{t("IP Cost")}</Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            size={6}
          >
            <Typography variant="h3">{t("Description")}</Typography>
          </Grid>
          <Grid
            size="auto"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              minWidth: 34,
            }}
          >
            {isEditMode && (
              <>
                {!showInPlayerSheet && (
                  <Tooltip title={t("Alchemy not shown in player sheet")}>
                    <VisibilityOff sx={{ fontSize: "1.1rem", opacity: 0.7 }} />
                  </Tooltip>
                )}
                <IconButton
                  size="small"
                  onClick={onEditRank}
                  sx={{ color: "#fff", p: "3px" }}
                >
                  <Edit sx={{ fontSize: "1.1rem" }} />
                </IconButton>
              </>
            )}
          </Grid>
        </Grid>
      </div>
      {/* MIX Rows - one per rank up to current */}
      {visibleRanks.map((rank, i) => (
        <div
          key={rank}
          style={{
            background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
            padding: "3px 17px",
            display: "flex",
            justifyContent: "space-between",
            borderTop: `1px solid ${theme.secondary}`,
            borderBottom:
              i === visibleRanks.length - 1
                ? `1px solid ${theme.secondary}`
                : "none",
          }}
        >
          <Grid container style={{ flexGrow: 1 }}>
            <Grid
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "left",
              }}
              size="grow"
            >
              <Typography
                style={{ flexGrow: 1, marginRight: "5px" }}
                sx={{ fontWeight: "bold" }}
              >
                {rankLabels[rank - 1]}
              </Typography>
            </Grid>
            <Grid
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              size={2}
            >
              <Typography>{rank + 2}</Typography>
            </Grid>
            <Grid
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              size={6}
            >
              <Typography>{rankDescriptions[rank - 1]}</Typography>
            </Grid>
            <Grid
              size="auto"
              style={{ display: "flex", alignItems: "center", minWidth: 34 }}
            >
              <Tooltip title={t("Roll Mix")}>
                <IconButton
                  size="small"
                  sx={{ p: "3px" }}
                  onClick={() => setRollRank(rank)}
                >
                  <Casino sx={{ fontSize: "1.1rem" }} />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </div>
      ))}
      {/* TARGETS Header */}
      <div
        style={{
          backgroundColor: theme.primary,
          fontFamily: "Antonio",
          fontWeight: "normal",
          fontSize: "1.1em",
          padding: "2px 17px",
          color: theme.white,
          textTransform: "uppercase",
        }}
      >
        <Grid container>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              minHeight: "40px",
            }}
            size="grow"
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
            >
              {t("Die")}
            </Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "40px",
            }}
            size={8}
          >
            <Typography variant="h3">{t("Target")}</Typography>
          </Grid>
          {isEditMode && (
            <Grid
              size="auto"
              style={{ display: "flex", alignItems: "center", minWidth: 34 }}
            >
              <IconButton
                size="small"
                onClick={onEditTargets}
                sx={{ color: "#fff", p: "3px" }}
              >
                <Edit sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            </Grid>
          )}
        </Grid>
      </div>
      {/* TARGETS description row */}
      <div
        style={{
          background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
          padding: "3px 17px",
          borderTop: `1px solid ${theme.secondary}`,
          borderBottom: `1px solid ${theme.secondary}`,
        }}
      >
        <Grid container>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
            }}
            size="grow"
          >
            <Typography
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontWeight: "bold",
                color: theme.primary,
                fontStyle: "italic",
              }}
            >
              {t("The potions affects...")}
            </Typography>
          </Grid>
          {isEditMode && <Grid size="auto" style={{ minWidth: 34 }} />}
        </Grid>
      </div>
      {/* TARGETS data rows */}
      {alchemy.targets.map((target, i) => (
        <Grid
          container
          sx={{
            background: "transparent",
            padding: "3px 17px",
            borderBottom: `1px solid ${theme.secondary}`,
          }}
          key={i}
        >
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
            }}
            size="grow"
          >
            <Typography
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{ fontWeight: "bold" }}
            >
              {target.rangeFrom + " - " + target.rangeTo}
            </Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
            size={8}
          >
            <ReactMarkdown
              components={{
                p: ({ node: _n, ...props }) => <span {...props} />,
              }}
            >
              {target.effect}
            </ReactMarkdown>
          </Grid>
          {isEditMode && <Grid size="auto" style={{ minWidth: 34 }} />}
        </Grid>
      ))}
      {/* EFFECTS Header */}
      <div
        style={{
          backgroundColor: theme.primary,
          fontFamily: "Antonio",
          fontWeight: "normal",
          fontSize: "1.1em",
          padding: "2px 17px",
          color: theme.white,
          textTransform: "uppercase",
        }}
      >
        <Grid container>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              minHeight: "40px",
            }}
            size="grow"
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
            >
              {t("Die")}
            </Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "40px",
            }}
            size={8}
          >
            <Typography variant="h3">{t("Effect")}</Typography>
          </Grid>
          {isEditMode && (
            <Grid
              size="auto"
              style={{ display: "flex", alignItems: "center", minWidth: 34 }}
            >
              <IconButton
                size="small"
                onClick={onEditEffects}
                sx={{ color: "#fff", p: "3px" }}
              >
                <Edit sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            </Grid>
          )}
        </Grid>
      </div>
      {/* EFFECTS description row */}
      <div
        style={{
          background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
          padding: "3px 17px",
          borderTop: `1px solid ${theme.secondary}`,
          borderBottom: `1px solid ${theme.secondary}`,
        }}
      >
        <Grid container>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
            }}
            size="grow"
          >
            <Typography
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontWeight: "bold",
                color: theme.primary,
                fontStyle: "italic",
              }}
            >
              {t("Each creature affected by the potion...")}
            </Typography>
          </Grid>
          {isEditMode && <Grid size="auto" style={{ minWidth: 34 }} />}
        </Grid>
      </div>
      {/* EFFECTS data rows */}
      {alchemy.effects.map((effect, i) => (
        <Grid
          container
          sx={{
            background: "transparent",
            padding: "3px 17px",
            borderBottom: `1px solid ${theme.secondary}`,
          }}
          key={i}
        >
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
            }}
            size="grow"
          >
            <Typography
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{ fontWeight: "bold" }}
            >
              {effect.dieValue === 0 ? t("Any") : effect.dieValue}
            </Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
            size={8}
          >
            <ReactMarkdown
              components={{
                p: ({ node: _n, ...props }) => <span {...props} />,
              }}
            >
              {effect.effect}
            </ReactMarkdown>
          </Grid>
          {isEditMode && <Grid size="auto" style={{ minWidth: 34 }} />}
        </Grid>
      ))}
      {rollRank !== null && (
        <AlchemyRollDialog
          open
          onClose={() => setRollRank(null)}
          rank={rollRank}
          alchemy={alchemy}
          speaker={speaker}
          t={t}
        />
      )}
    </>
  );
}

export default function SpellTinkererAlchemy(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellTinkererAlchemy {...props} />
    </ThemeProvider>
  );
}
