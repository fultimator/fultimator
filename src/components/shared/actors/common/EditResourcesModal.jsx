import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useTranslate } from "/src/translation/translate";
import { TypeIcon } from "/src/components/types";
import {
  HpResourceIcon,
  MpResourceIcon,
  IpResourceIcon,
  FpResourceIcon,
  UpResourceIcon,
} from "/src/components/icons";
import { GradientLinearProgress } from "/src/components/shared/actors/pc/shared";
import { newShade } from "/src/libs/playerCalculations";
import {
  getPipFlashSx,
  PIP_STRIPES,
  useAnimatedDeltaNumber,
} from "/src/components/shared/actors/common/resourceBarMotion";
import {
  useBarShell,
  LABEL_SX,
  VALUE_SX,
  DAMAGE_TYPES as DEFAULT_DAMAGE_TYPES,
} from "/src/components/shared/actors/common/barShellUtils";
import BarShell from "/src/components/shared/actors/common/BarShell";

function toTitleCase(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/\b\p{L}/gu, (ch) => ch.toUpperCase());
}

export default function EditResourcesModal({
  open,
  onClose,
  title,
  resourceKey,
  current,
  max,
  actorName,
  damageTypes = DEFAULT_DAMAGE_TYPES,
  onApply,
  onSetCurrent,
  amount,
  onAmountChange,
  mode,
  onModeChange,
  damageType,
  onDamageTypeChange,
  isGuarding,
  onGuardingChange,
  showQuickHpTargets = true,
  showGuardOption = true,
  showDamageType = true,
  resolvePreviewDelta,
  resourcePalette,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const { isDark, shellBg, shellBorder, labelBg, labelBorder, trackBg } =
    useBarShell();

  const [amountLocal, setAmountLocal] = useState("");
  const [modeLocal, setModeLocal] = useState("heal");
  const [damageTypeLocal, setDamageTypeLocal] = useState("physical");
  const [isGuardingLocal, setIsGuardingLocal] = useState(false);

  const amountValue = amount ?? amountLocal;
  const setAmountValue = onAmountChange ?? setAmountLocal;
  const modeValue = mode ?? modeLocal;
  const setModeValue = onModeChange ?? setModeLocal;
  const damageTypeValue = damageType ?? damageTypeLocal;
  const setDamageTypeValue = onDamageTypeChange ?? setDamageTypeLocal;
  const guardingValue = isGuarding ?? isGuardingLocal;
  const setGuardingValue = onGuardingChange ?? setIsGuardingLocal;

  const isPipResource = resourceKey === "ip";
  const isFpResource = resourceKey === "fp";
  const isUpResource = resourceKey === "up";
  const hasMax = Number.isFinite(max);
  const displayMax = (val) => (hasMax ? `${val}/${max}` : `${val}`);

  const [pipInput, setPipInput] = useState("");
  const pipFlashSeqRef = useRef(0);
  const [pipFlashSeq, setPipFlashSeq] = useState(0);
  const [pipHover, setPipHover] = useState(null);
  const previousCurrentRef = useRef(current);
  const MAX_FP_PIPS = 6;

  const parsedAmount = Math.max(0, parseInt(amountValue, 10) || 0);
  const previewDelta = (() => {
    if (typeof resolvePreviewDelta === "function") {
      const resolved = resolvePreviewDelta({
        amount: parsedAmount,
        mode: modeValue,
        damageType: damageTypeValue,
        isGuarding: guardingValue,
        resourceKey,
        current,
        max,
      });
      if (Number.isFinite(resolved)) return resolved;
    }
    if (modeValue === "heal") return parsedAmount;
    if (resourceKey === "hp" && guardingValue) {
      return -Math.max(0, Math.floor(parsedAmount * 0.5));
    }
    return -parsedAmount;
  })();
  const previewCurrent = Math.max(0, Math.min(max, current + previewDelta));
  const currentPct =
    max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const previewPct =
    max > 0 ? Math.max(0, Math.min(100, (previewCurrent / max) * 100)) : 0;
  const basePct = Math.min(currentPct, previewPct);
  const deltaPct = Math.max(currentPct, previewPct) - basePct;

  const fpFilled = Math.min(Math.max(0, current), MAX_FP_PIPS);
  const { animatedValue: animatedFpFilled, delta: fpDelta } =
    useAnimatedDeltaNumber(fpFilled, {
      moveMs: 280,
      deltaMs: 460,
    });
  const fpOverflow = Math.max(0, Math.max(0, current) - MAX_FP_PIPS);
  const fpPreviewCount = pipHover !== null ? pipHover : fpFilled;
  const upFilled = Math.min(Math.max(0, current), hasMax ? max : current);
  const { animatedValue: animatedUpFilled, delta: upDelta } =
    useAnimatedDeltaNumber(upFilled, {
      moveMs: 280,
      deltaMs: 460,
    });
  const upPreviewCount = pipHover !== null ? pipHover : upFilled;
  const upOverflow = hasMax && current > max ? current - max : 0;

  useEffect(() => {
    if (previousCurrentRef.current === current) return;
    previousCurrentRef.current = current;
    pipFlashSeqRef.current += 1;
    setPipFlashSeq(pipFlashSeqRef.current);
  }, [current]);

  const handlePipClick = (pipValue) => {
    const next = pipValue === current ? 0 : pipValue;
    pipFlashSeqRef.current += 1;
    setPipFlashSeq(pipFlashSeqRef.current);
    onSetCurrent?.(next);
  };

  const handlePipInputSubmit = () => {
    const val = parseInt(pipInput, 10);
    if (!Number.isFinite(val)) return;
    const next = Math.max(0, Math.min(max, val));
    onSetCurrent?.(next);
    setPipInput("");
  };

  const defaultPalette = useMemo(
    () => ({
      hp: {
        color1: isDark
          ? newShade(theme.palette.error.main, 10)
          : newShade(theme.palette.error.main, 80),
        color2: theme.palette.error.main,
      },
      mp: {
        color1: isDark
          ? newShade(theme.palette.info.main, 10)
          : newShade(theme.palette.info.main, 80),
        color2: theme.palette.info.main,
      },
      ip: {
        color1: isDark
          ? newShade(theme.palette.success.main, 10)
          : newShade(theme.palette.success.main, 80),
        color2: theme.palette.success.main,
      },
      fp: {
        color1: isDark
          ? newShade(theme.palette.warning.main, 10)
          : newShade(theme.palette.warning.main, 80),
        color2: theme.palette.warning.main,
      },
      up: {
        color1: isDark
          ? newShade(theme.palette.secondary.main, 10)
          : newShade(theme.palette.secondary.main, 80),
        color2: theme.palette.secondary.main,
      },
    }),
    [isDark, theme],
  );

  const palette = resourcePalette ?? defaultPalette;

  const resourceMeta = useMemo(
    () =>
      ({
        hp: {
          label: t("HP"),
          Icon: HpResourceIcon,
          color1: palette.hp?.color1 ?? defaultPalette.hp.color1,
          color2: palette.hp?.color2 ?? defaultPalette.hp.color2,
        },
        mp: {
          label: t("MP"),
          Icon: MpResourceIcon,
          color1: palette.mp?.color1 ?? defaultPalette.mp.color1,
          color2: palette.mp?.color2 ?? defaultPalette.mp.color2,
        },
        ip: {
          label: t("IP"),
          Icon: IpResourceIcon,
          color1: palette.ip?.color1 ?? defaultPalette.ip.color1,
          color2: palette.ip?.color2 ?? defaultPalette.ip.color2,
        },
        fp: {
          label: t("FP"),
          Icon: FpResourceIcon,
          color1: palette.fp?.color1 ?? defaultPalette.fp?.color1,
          color2: palette.fp?.color2 ?? defaultPalette.fp?.color2,
        },
        up: {
          label: t("UP"),
          Icon: UpResourceIcon,
          color1: palette.up?.color1 ?? defaultPalette.up?.color1,
          color2: palette.up?.color2 ?? defaultPalette.up?.color2,
        },
      })[resourceKey] ?? {
        label: title,
        Icon: null,
        color1: isDark
          ? newShade(theme.palette.primary.main, 10)
          : newShade(theme.palette.primary.main, 80),
        color2: theme.palette.primary.main,
      },
    [resourceKey, title, t, isDark, theme, palette, defaultPalette],
  );

  const setHealPreset = (preset) => {
    if (modeValue !== "heal" || !onSetCurrent) return;
    if (preset === "half") {
      const half = Math.floor(max / 2);
      onSetCurrent(Math.max(current, Math.max(0, half)));
      onClose();
      return;
    }
    if (preset !== "full") return;
    onSetCurrent(Math.max(0, max));
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(amountValue, 10) || 0;
    if (val <= 0) return;
    onApply?.({
      amount: val,
      mode: modeValue,
      damageType: damageTypeValue,
      isGuarding: guardingValue,
    });
    if (!onAmountChange) setAmountLocal("");
    if (!onDamageTypeChange) setDamageTypeLocal("physical");
    if (!onGuardingChange) setIsGuardingLocal(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{ "& .MuiDialog-paper": { width: "min(420px, calc(100vw - 32px))" } }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
          {t("Update")} {title}
        </DialogTitle>
        <DialogContent sx={{ width: "100%", pt: "14px !important" }}>
          {actorName && (
            <Typography sx={{ textAlign: "center", mb: 1, opacity: 0.85 }}>
              {actorName}
            </Typography>
          )}
          {isPipResource ? (
            <>
              <Box sx={{ mb: 1.5 }}>
                <BarShell
                  shellBg={shellBg}
                  shellBorder={shellBorder}
                  minHeight={34}
                >
                  <Box
                    sx={{
                      ...LABEL_SX,
                      bgcolor: labelBg,
                      borderRight: `1px solid ${labelBorder}`,
                      alignSelf: "stretch",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                    }}
                  >
                    {resourceMeta.Icon && <resourceMeta.Icon size="1.4em" />}
                    <span style={{ lineHeight: 1 }}>{resourceMeta.label}</span>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "stretch",
                      gap: "2px",
                      px: "3px",
                      py: "3px",
                      bgcolor: trackBg,
                    }}
                    onMouseLeave={() => setPipHover(null)}
                  >
                    {Array.from({ length: hasMax ? max : current }).map(
                      (_, i) => {
                        const ipPreview = pipHover ?? current;
                        const isPreview = i < Math.round(ipPreview);
                        const animFill = Math.max(
                          0,
                          Math.min(1, ipPreview - i),
                        );
                        const pipChanged =
                          previousCurrentRef.current !== current && i < current;
                        return (
                          <Box
                            key={i}
                            onClick={() => handlePipClick(i + 1)}
                            onMouseEnter={() => setPipHover(i + 1)}
                            sx={{
                              position: "relative",
                              flex: 1,
                              minWidth: 0,
                              borderRadius: "2px",
                              background:
                                animFill > 0.01
                                  ? `linear-gradient(to bottom, ${resourceMeta.color1}, ${resourceMeta.color2})`
                                  : "transparent",
                              border: `1px solid ${animFill > 0.01 ? resourceMeta.color2 : shellBorder}`,
                              opacity:
                                pipHover === null
                                  ? 0.22 + animFill * 0.78
                                  : isPreview
                                    ? 1
                                    : 0.28,
                              cursor: "pointer",
                              overflow: "hidden",
                              transition: (th) =>
                                th.transitions.create(
                                  ["background", "opacity"],
                                  {
                                    duration: th.transitions.duration.standard,
                                    easing: th.transitions.easing.easeOut,
                                  },
                                ),
                              ...(pipChanged
                                ? getPipFlashSx({
                                    changed: true,
                                    keyframeName: `pip-flash-${pipFlashSeq}`,
                                    fromOpacity: 0.9,
                                    stripe: PIP_STRIPES.subtle,
                                  })
                                : {}),
                            }}
                          />
                        );
                      },
                    )}
                  </Box>
                  <Box
                    sx={{
                      ...VALUE_SX,
                      bgcolor: labelBg,
                      borderLeft: `1px solid ${labelBorder}`,
                      alignSelf: "stretch",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {displayMax(current)}
                  </Box>
                </BarShell>
              </Box>
              <TextField
                fullWidth
                type="number"
                label={t("Amount")}
                value={pipInput}
                onChange={(e) => setPipInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handlePipInputSubmit();
                  }
                }}
                slotProps={{ htmlInput: { min: 0, ...(hasMax && { max }) } }}
                size="small"
              />
            </>
          ) : isFpResource || isUpResource ? (
            <>
              <Box sx={{ mb: 1.5 }}>
                <BarShell shellBg={shellBg} shellBorder={shellBorder}>
                  <Box
                    sx={{
                      ...LABEL_SX,
                      bgcolor: labelBg,
                      borderRight: `1px solid ${labelBorder}`,
                    }}
                  >
                    {resourceMeta.Icon && <resourceMeta.Icon size="1.4em" />}
                    <span style={{ lineHeight: 1 }}>{resourceMeta.label}</span>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "2px",
                      px: "3px",
                      py: "2px",
                      bgcolor: trackBg,
                      overflow: "hidden",
                    }}
                    onMouseLeave={() => setPipHover(null)}
                  >
                    {Array.from({
                      length: isFpResource
                        ? MAX_FP_PIPS
                        : hasMax
                          ? max
                          : current,
                    }).map((_, i) => {
                      const isPreview =
                        i < (isFpResource ? fpPreviewCount : upPreviewCount);
                      const animFill = Math.max(
                        0,
                        Math.min(
                          1,
                          (isFpResource ? animatedFpFilled : animatedUpFilled) -
                            i,
                        ),
                      );
                      const changedDelta = isFpResource ? fpDelta : upDelta;
                      const pipChanged = changedDelta
                        ? i < changedDelta.from !== i < changedDelta.to
                        : false;
                      return (
                        <Box
                          key={i}
                          onClick={() => handlePipClick(i + 1)}
                          onMouseEnter={() => setPipHover(i + 1)}
                          sx={{
                            width: "1.35em",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            flexShrink: 0,
                            position: "relative",
                            overflow: "hidden",
                            opacity:
                              pipHover === null
                                ? 0.2 + animFill * 0.8
                                : isPreview
                                  ? 1
                                  : 0.28,
                            filter:
                              animFill > 0.6
                                ? "drop-shadow(0 0 2px rgba(255,255,255,0.45))"
                                : "none",
                            ...getPipFlashSx({
                              changed: pipChanged,
                              keyframeName: `${isFpResource ? "fp" : "up"}PipDelta_${pipFlashSeq}`,
                              fromOpacity: 0.9,
                              stripe: PIP_STRIPES.strong,
                            }),
                          }}
                        >
                          {isFpResource ? (
                            <FpResourceIcon size="1.8em" />
                          ) : (
                            <UpResourceIcon size="1.8em" />
                          )}
                        </Box>
                      );
                    })}
                    {isFpResource && fpOverflow > 0 && (
                      <Typography
                        sx={{
                          fontFamily: "Antonio",
                          fontWeight: "bold",
                          fontSize: "0.75rem",
                          color: "#fff",
                          lineHeight: 1,
                        }}
                      >
                        +{fpOverflow}
                      </Typography>
                    )}
                    {isUpResource && upOverflow > 0 && (
                      <Typography
                        sx={{
                          fontFamily: "Antonio",
                          fontWeight: "bold",
                          fontSize: "0.75rem",
                          color: "#fff",
                          lineHeight: 1,
                        }}
                      >
                        +{upOverflow}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    sx={{
                      ...VALUE_SX,
                      bgcolor: labelBg,
                      borderLeft: `1px solid ${labelBorder}`,
                    }}
                  >
                    {displayMax(current)}
                  </Box>
                </BarShell>
              </Box>
              <TextField
                fullWidth
                type="number"
                label={t("Amount")}
                value={pipInput}
                onChange={(e) => setPipInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handlePipInputSubmit();
                  }
                }}
                slotProps={{ htmlInput: { min: 0, ...(hasMax && { max }) } }}
                size="small"
              />
            </>
          ) : (
            <>
              <Box sx={{ mb: 1.5 }}>
                <BarShell shellBg={shellBg} shellBorder={shellBorder}>
                  <Box
                    sx={{
                      ...LABEL_SX,
                      bgcolor: labelBg,
                      borderRight: `1px solid ${labelBorder}`,
                    }}
                  >
                    {resourceMeta.Icon && <resourceMeta.Icon size="1.4em" />}
                    <span style={{ lineHeight: 1 }}>{resourceMeta.label}</span>
                  </Box>
                  <Box sx={{ flex: 1, position: "relative", bgcolor: trackBg }}>
                    <GradientLinearProgress
                      variant="determinate"
                      value={basePct}
                      color1={resourceMeta.color1}
                      color2={resourceMeta.color2}
                      sx={{
                        height: "100% !important",
                        "&, & .MuiLinearProgress-bar": { borderRadius: 0 },
                      }}
                    />
                    {deltaPct > 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          left: `${basePct}%`,
                          width: `${deltaPct}%`,
                          background: `linear-gradient(to right, ${alpha(resourceMeta.color1, 0.24)}, ${alpha(resourceMeta.color2, 0.24)}), repeating-linear-gradient(-45deg, ${alpha("#ffffff", 0.18)} 0px, ${alpha("#ffffff", 0.18)} 5px, transparent 5px, transparent 10px)`,
                          borderLeft: `1px solid ${alpha("#ffffff", 0.55)}`,
                          borderRight: `1px solid ${alpha("#000000", 0.28)}`,
                        }}
                      />
                    )}
                    {resourceKey === "hp" && (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: "0 auto 0 50%",
                          width: "2px",
                          transform: "translateX(-50%)",
                          bgcolor: "rgba(255,255,255,0.6)",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                    <Typography
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontFamily: "Antonio",
                        fontWeight: "bold",
                        letterSpacing: "0.03em",
                        textShadow: "0 1px 2px rgba(0,0,0,0.35)",
                      }}
                    >
                      {displayMax(current)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      ...VALUE_SX,
                      bgcolor: labelBg,
                      borderLeft: `1px solid ${labelBorder}`,
                    }}
                  >
                    {displayMax(previewCurrent)}
                  </Box>
                </BarShell>
              </Box>
              <ToggleButtonGroup
                fullWidth
                exclusive
                value={modeValue}
                onChange={(_, v) => v && setModeValue(v)}
                sx={{ mb: 1.5 }}
              >
                <ToggleButton value="damage" color="error">
                  {resourceKey === "hp" ? t("Damage") : t("Loss")}
                </ToggleButton>
                <ToggleButton value="heal" color="success">
                  {resourceKey === "hp" ? t("Heal") : t("Gain")}
                </ToggleButton>
              </ToggleButtonGroup>
              <TextField
                autoFocus
                fullWidth
                type="number"
                label={t("Amount")}
                value={amountValue}
                onChange={(e) => setAmountValue(e.target.value)}
              />
            </>
          )}

          {resourceKey === "hp" && modeValue === "damage" && (
            <>
              {showDamageType && (
                <FormControl fullWidth sx={{ mt: 1.5, mb: 1.5 }}>
                  <InputLabel id="resource-damage-type">
                    {t("combat_sim_damage_type")}
                  </InputLabel>
                  <Select
                    labelId="resource-damage-type"
                    label={t("combat_sim_damage_type")}
                    value={damageTypeValue}
                    onChange={(e) => setDamageTypeValue(e.target.value)}
                  >
                    {damageTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <TypeIcon type={type} />
                          <ListItemText>{toTitleCase(t(type))}</ListItemText>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {showGuardOption && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={guardingValue}
                      onChange={(e) => setGuardingValue(e.target.checked)}
                    />
                  }
                  label={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      <Box
                        component="img"
                        src="/assets/icons/actions/action_c_guard.png"
                        alt="guard"
                        sx={{ width: 18, height: 18, objectFit: "contain" }}
                      />
                      <span>{`${t("combat_sim_is_guarding")}?`}</span>
                    </Box>
                  }
                  sx={{ mb: 0.5 }}
                />
              )}
            </>
          )}

          {!isPipResource && showQuickHpTargets && modeValue === "heal" && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setHealPreset("half")}
                >
                  {t("Half")}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setHealPreset("full")}
                >
                  {t("Full")}
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", px: 0, pb: 0 }}>
          {isPipResource || isFpResource || isUpResource ? (
            <>
              <Tooltip title={t("Subtract Amount")} placement="top">
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    const v = parseInt(pipInput, 10);
                    if (v > 0) {
                      onSetCurrent?.(Math.max(0, current - v));
                      onClose?.();
                    }
                  }}
                  sx={{
                    minWidth: 48,
                    minHeight: 36,
                    fontSize: "1.25rem",
                    lineHeight: 1,
                  }}
                >
                  −
                </Button>
              </Tooltip>
              <Button
                onClick={onClose}
                color="secondary"
                variant="contained"
                sx={{ minHeight: 36 }}
              >
                {t("Cancel")}
              </Button>
              <Tooltip title={t("Add Amount")} placement="top">
                <Button
                  variant="outlined"
                  color="success"
                  onClick={() => {
                    const v = parseInt(pipInput, 10);
                    if (v > 0) {
                      onSetCurrent?.(Math.min(max, current + v));
                      onClose?.();
                    }
                  }}
                  sx={{
                    minWidth: 48,
                    minHeight: 36,
                    fontSize: "1.25rem",
                    lineHeight: 1,
                  }}
                >
                  +
                </Button>
              </Tooltip>
            </>
          ) : (
            <>
              <Button onClick={onClose} color="secondary" variant="contained">
                {t("Cancel")}
              </Button>
              <Button type="submit" variant="contained">
                {t("Apply")}
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}
