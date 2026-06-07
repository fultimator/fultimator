import { useState } from "react";
import { Box, Typography, IconButton, InputBase, Tooltip } from "@mui/material";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import { Remove, Add } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { useTranslate } from "/src/translation/translate";
import {
  HpResourceIcon,
  MpResourceIcon,
  IpResourceIcon,
  FpResourceIcon,
  ZenitResourceIcon,
} from "/src/components/icons";
import { GradientLinearProgress } from "/src/components/shared/actors/pc/shared";
import { newShade } from "/src/libs/playerCalculations";
import StatTooltip from "/src/components/common/StatTooltip";
import { getActorBonuses, getActorMultipliers } from "/src/libs/actorBonuses";
import {
  buildResourceContext,
  resolveResource,
} from "/src/pipelines/resourcePipeline";
import {
  buildDamageContext,
  resolveDamage,
} from "/src/pipelines/damagePipeline";
import EditResourcesModal from "/src/components/shared/actors/common/EditResourcesModal";
import {
  getDeltaOverlaySx,
  getPipFlashSx,
  PIP_STRIPES,
  useAnimatedDeltaPercent,
  useAnimatedDeltaNumber,
} from "/src/components/shared/actors/common/resourceBarMotion";
import {
  useBarShell,
  LABEL_SX,
  VALUE_SX,
  DAMAGE_TYPES,
} from "/src/components/shared/actors/common/barShellUtils";
import BarShell from "/src/components/shared/actors/common/BarShell";

function StatBar({
  label,
  Icon,
  value,
  max,
  color1,
  color2,
  crisis = false,
  crisisTooltip = "",
  onSetCrisis = null,
  onClick,
  isClickable = false,
}) {
  const { shellBg, shellBorder, labelBg, labelBorder, trackBg } = useBarShell();
  const [crisisHover, setCrisisHover] = useState(false);
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const { animatedPct, delta } = useAnimatedDeltaPercent(pct, {
    moveMs: 760,
    deltaMs: 1800,
  });

  return (
    <BarShell shellBg={shellBg} shellBorder={shellBorder}>
      <Box
        sx={{
          ...LABEL_SX,
          bgcolor: labelBg,
          borderRight: `1px solid ${labelBorder}`,
        }}
      >
        {Icon && <Icon size="1.4em" />}
        <span style={{ lineHeight: 1 }}>{label}</span>
      </Box>
      <Box
        onClick={isClickable ? onClick : undefined}
        sx={{
          flex: 1,
          position: "relative",
          bgcolor: trackBg,
          cursor: isClickable ? "pointer" : "default",
        }}
      >
        <GradientLinearProgress
          variant="determinate"
          value={animatedPct}
          color1={color1}
          color2={color2}
          sx={{
            height: "100% !important",
            "&, & .MuiLinearProgress-bar": { borderRadius: 0 },
            "& .MuiLinearProgress-bar": (t) => ({
              transition: t.transitions.create("transform", {
                duration: t.transitions.duration.complex,
                easing: t.transitions.easing.easeOut,
              }),
            }),
          }}
        />
        {delta && Math.abs(delta.to - delta.from) > 0.0001 && (
          <Box key={delta.seq} sx={getDeltaOverlaySx(delta, "pcDeltaFade")} />
        )}
        {crisis && (
          <Tooltip title={crisisTooltip} placement="top">
            <Box
              onMouseEnter={() => setCrisisHover(true)}
              onMouseLeave={() => setCrisisHover(false)}
              onClick={(e) => {
                e.stopPropagation();
                onSetCrisis?.();
              }}
              sx={{
                position: "absolute",
                inset: 0,
                left: "calc(50% - 12px)",
                width: "24px",
                cursor: onSetCrisis ? "pointer" : "default",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: "0 auto 0 50%",
                  width: crisisHover ? "3px" : "2px",
                  transform: "translateX(-50%)",
                  bgcolor: crisisHover
                    ? "warning.light"
                    : "rgba(255,255,255,0.55)",
                  boxShadow: crisisHover
                    ? "0 0 6px rgba(255, 193, 7, 0.85)"
                    : "none",
                  transition: "all 0.15s ease",
                  pointerEvents: "none",
                }}
              />
            </Box>
          </Tooltip>
        )}
      </Box>
      <Box
        onClick={isClickable ? onClick : undefined}
        sx={{
          ...VALUE_SX,
          bgcolor: labelBg,
          borderLeft: `1px solid ${labelBorder}`,
          cursor: isClickable ? "pointer" : "default",
        }}
      >
        {value}/{max}
      </Box>
    </BarShell>
  );
}

function DeltaControls({ onApply, defaultValue = 1, min = 1, steps = [] }) {
  const [amount, setAmount] = useState(String(defaultValue));
  const val = Math.max(min, parseInt(amount, 10) || min);

  const stepBtn = (s, sign) => (
    <Box
      key={`${sign}${s}`}
      onPointerDown={(e) => {
        e.preventDefault();
        onApply(sign * s);
      }}
      sx={{
        flex: 1,
        minWidth: 0,
        height: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "4px",
        border: "1px solid",
        borderColor: sign < 0 ? "error.light" : "success.light",
        color: sign < 0 ? "error.main" : "success.main",
        fontFamily: "Antonio",
        fontWeight: "bold",
        fontSize: "0.78rem",
        cursor: "pointer",
        userSelect: "none",
        overflow: "hidden",
        transition: "all 0.12s ease",
        "&:hover": {
          bgcolor: sign < 0 ? "error.main" : "success.main",
          color: "#fff",
          borderColor: sign < 0 ? "error.main" : "success.main",
        },
        "&:active": { opacity: 0.8 },
      }}
    >
      {sign < 0 ? `-${s}` : `+${s}`}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "3px" }}>
      <Box sx={{ display: "flex", gap: "4px", alignItems: "stretch" }}>
        <IconButton
          size="small"
          onPointerDown={(e) => {
            e.preventDefault();
            onApply(-val);
          }}
          sx={{
            flex: "0 0 36px",
            height: 30,
            borderRadius: "3px",
            border: "1px solid",
            borderColor: "error.main",
            color: "error.main",
            p: 0,
          }}
        >
          <Remove sx={{ fontSize: "1rem" }} />
        </IconButton>
        <InputBase
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
          onBlur={() =>
            setAmount(String(Math.max(min, parseInt(amount, 10) || min)))
          }
          inputProps={{
            style: {
              textAlign: "center",
              fontFamily: "Antonio",
              fontWeight: "bold",
              fontSize: "0.9rem",
              padding: 0,
            },
          }}
          sx={{
            flex: 1,
            height: 30,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "3px",
            px: "4px",
          }}
        />
        <IconButton
          size="small"
          onPointerDown={(e) => {
            e.preventDefault();
            onApply(val);
          }}
          sx={{
            flex: "0 0 36px",
            height: 30,
            borderRadius: "3px",
            border: "1px solid",
            borderColor: "success.main",
            color: "success.main",
            p: 0,
          }}
        >
          <Add sx={{ fontSize: "1rem" }} />
        </IconButton>
      </Box>

      {steps.length > 0 && (
        <Box
          sx={{
            display: "flex",
            gap: "4px",
            alignItems: "stretch",
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: "2px",
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            {[...steps].reverse().map((s) => stepBtn(s, -1))}
          </Box>
          <Box
            sx={{
              width: "2px",
              bgcolor: "divider",
              borderRadius: "1px",
              flexShrink: 0,
            }}
          />
          <Box
            sx={{
              display: "flex",
              gap: "2px",
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            {steps.map((s) => stepBtn(s, 1))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function ResourceCell({
  label,
  Icon,
  value,
  max,
  color1,
  color2,
  crisis,
  crisisTooltip,
  onSetCrisis,
  onApply,
  steps = [],
  tooltip,
  isInteractive = false,
  onBarClick,
}) {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}
    >
      <StatTooltip {...(tooltip ?? {})} display="block">
        <StatBar
          label={label}
          Icon={Icon}
          value={value}
          max={max}
          color1={color1}
          color2={color2}
          crisis={crisis}
          crisisTooltip={crisisTooltip}
          onSetCrisis={onSetCrisis}
          isClickable={isInteractive}
          onClick={onBarClick}
        />
      </StatTooltip>
      {isInteractive && <DeltaControls onApply={onApply} steps={steps} />}
    </Box>
  );
}

const MAX_FP_PIPS = 6;

function FpCell({ value, onApply, tooltip, isInteractive = false }) {
  const { t } = useTranslate();
  const { shellBg, shellBorder, labelBg, labelBorder, trackBg } = useBarShell();
  const filled = Math.min(value, MAX_FP_PIPS);
  const { animatedValue: animatedFilled, delta: fpDelta } =
    useAnimatedDeltaNumber(filled, {
      moveMs: 280,
      deltaMs: 460,
    });
  const overflow = value > MAX_FP_PIPS ? value - MAX_FP_PIPS : 0;
  const [hoveredPip, setHoveredPip] = useState(null);
  const previewCount = hoveredPip !== null ? hoveredPip + 1 : filled;

  const handleSetPip = (index) => {
    if (!isInteractive) return;
    const target = index + 1;
    onApply(target - value);
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}
    >
      <StatTooltip {...(tooltip ?? {})} display="block">
        <BarShell shellBg={shellBg} shellBorder={shellBorder}>
          <Box
            sx={{
              ...LABEL_SX,
              bgcolor: labelBg,
              borderRight: `1px solid ${labelBorder}`,
            }}
          >
            <FpResourceIcon size="1.4em" />
            <span style={{ lineHeight: 1 }}>{t("FP")}</span>
          </Box>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "-4px",
              bgcolor: trackBg,
            }}
            onMouseLeave={() => setHoveredPip(null)}
          >
            {Array.from({ length: MAX_FP_PIPS }).map((_, i) => {
              const isPreview = i < previewCount;
              const animFill = Math.max(0, Math.min(1, animatedFilled - i));
              const fpChanged = fpDelta
                ? i < fpDelta.from !== i < fpDelta.to
                : false;
              return (
                <Box
                  key={i}
                  onMouseEnter={() => isInteractive && setHoveredPip(i)}
                  onClick={() => handleSetPip(i)}
                  sx={{
                    width: "1.35em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isInteractive ? "pointer" : "default",
                    flexShrink: 0,
                    position: "relative",
                    overflow: "hidden",
                    ...getPipFlashSx({
                      changed: fpChanged,
                      keyframeName: "fpDeltaFade",
                      fromOpacity: 0.9,
                      stripe: PIP_STRIPES.strong,
                    }),
                  }}
                >
                  <Box
                    sx={{
                      width: "1.35em",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity:
                        hoveredPip === null
                          ? 0.2 + animFill * 0.8
                          : isPreview
                            ? 1
                            : 0.28,
                      filter:
                        animFill > 0.6
                          ? "drop-shadow(0 0 2px rgba(255,255,255,0.45))"
                          : "none",
                      flexShrink: 0,
                    }}
                  >
                    <FpResourceIcon size="1.8em" />
                  </Box>
                </Box>
              );
            })}
            {overflow > 0 && (
              <Typography
                sx={{
                  fontFamily: "Antonio",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                +{overflow}
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
            {value}
          </Box>
        </BarShell>
      </StatTooltip>
      {isInteractive && <DeltaControls onApply={onApply} steps={[1, 2, 3]} />}
    </Box>
  );
}

function IpCell({ value, max, onApply, tooltip, isInteractive = false }) {
  const { t } = useTranslate();
  const { isDark, shellBg, shellBorder, labelBg, labelBorder, trackBg, theme } =
    useBarShell();
  const color1 = isDark
    ? newShade(theme.palette.success.main, 10)
    : newShade(theme.palette.success.main, 80);
  const color2 = theme.palette.success.main;
  const { animatedValue, delta: ipDelta } = useAnimatedDeltaNumber(value, {
    moveMs: 280,
    deltaMs: 460,
  });
  const [hoveredPip, setHoveredPip] = useState(null);
  const previewCount = hoveredPip !== null ? hoveredPip + 1 : value;

  const handleSetPip = (index) => {
    if (!isInteractive) return;
    const target = index + 1;
    onApply(target - value);
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}
    >
      <StatTooltip {...(tooltip ?? {})} display="block">
        <BarShell shellBg={shellBg} shellBorder={shellBorder}>
          <Box
            sx={{
              ...LABEL_SX,
              bgcolor: labelBg,
              borderRight: `1px solid ${labelBorder}`,
            }}
          >
            <IpResourceIcon size="1.4em" />
            <span style={{ lineHeight: 1 }}>{t("IP")}</span>
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
            onMouseLeave={() => setHoveredPip(null)}
          >
            {Array.from({ length: max }).map((_, i) =>
              (() => {
                const isPreview = i < previewCount;
                const animFill = Math.max(0, Math.min(1, animatedValue - i));
                const ipChanged = ipDelta
                  ? i < ipDelta.from !== i < ipDelta.to
                  : false;
                return (
                  <Box
                    key={i}
                    onMouseEnter={() => isInteractive && setHoveredPip(i)}
                    onClick={() => handleSetPip(i)}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      borderRadius: "2px",
                      background:
                        animFill > 0.01
                          ? `linear-gradient(to bottom, ${color1}, ${color2})`
                          : "transparent",
                      border: `1px solid ${animFill > 0.01 ? color2 : shellBorder}`,
                      opacity:
                        hoveredPip === null
                          ? 0.22 + animFill * 0.78
                          : isPreview
                            ? 1
                            : 0.28,
                      cursor: isInteractive ? "pointer" : "default",
                      transition: (t) =>
                        t.transitions.create(["background", "opacity"], {
                          duration: t.transitions.duration.standard,
                          easing: t.transitions.easing.easeOut,
                        }),
                      position: "relative",
                      overflow: "hidden",
                      ...getPipFlashSx({
                        changed: ipChanged,
                        keyframeName: "ipPipDeltaFade",
                        fromOpacity: 0.9,
                        stripe: PIP_STRIPES.subtle,
                      }),
                    }}
                  />
                );
              })(),
            )}
          </Box>
          <Box
            sx={{
              ...VALUE_SX,
              bgcolor: labelBg,
              borderLeft: `1px solid ${labelBorder}`,
            }}
          >
            {value}/{max}
          </Box>
        </BarShell>
      </StatTooltip>
      {isInteractive && <DeltaControls onApply={onApply} steps={[1, 2, 3]} />}
    </Box>
  );
}

function ZenitRow({ value, onApply, tooltip, isInteractive = false }) {
  const { t } = useTranslate();
  const { shellBg, shellBorder, labelBg, labelBorder, trackBg } = useBarShell();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <StatTooltip {...(tooltip ?? {})} display="block">
        <BarShell shellBg={shellBg} shellBorder={shellBorder}>
          <Box
            sx={{
              ...LABEL_SX,
              bgcolor: labelBg,
              borderRight: `1px solid ${labelBorder}`,
            }}
          >
            <ZenitResourceIcon size="1.4em" />
            <span style={{ lineHeight: 1 }}>{t("Z")}</span>
          </Box>
          <Box
            sx={{
              flex: 1,
              bgcolor: trackBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Antonio",
                fontWeight: 900,
                fontSize: "1.1rem",
                color: "#fff",
                lineHeight: 1,
                letterSpacing: "0.04em",
              }}
            >
              {value.toLocaleString()}
            </Typography>
          </Box>
          <Box
            sx={{
              ...LABEL_SX,
              bgcolor: labelBg,
              borderLeft: `1px solid ${labelBorder}`,
            }}
          >
            <ZenitResourceIcon size="1.4em" />
          </Box>
        </BarShell>
      </StatTooltip>
      {isInteractive && (
        <DeltaControls
          onApply={onApply}
          defaultValue={10}
          steps={[10, 100, 1000]}
        />
      )}
    </Box>
  );
}

export default function PcControlsPanel({
  pc,
  isInteractive = false,
  onUpdate,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const applyStat = (key) => (delta) => {
    if (!isInteractive || !onUpdate) return;
    onUpdate((prev) => {
      const next = Math.max(
        0,
        Math.min(prev.stats[key].current + delta, prev.stats[key].max),
      );
      return {
        ...prev,
        stats: { ...prev.stats, [key]: { ...prev.stats[key], current: next } },
      };
    });
  };

  const setHpToCrisis = () => {
    if (!isInteractive || !onUpdate) return;
    onUpdate((prev) => {
      const crisisValue = Math.floor((prev.stats.hp.max ?? 0) / 2);
      return {
        ...prev,
        stats: {
          ...prev.stats,
          hp: { ...prev.stats.hp, current: crisisValue },
        },
      };
    });
  };

  const applyFp = (delta) => {
    if (!isInteractive || !onUpdate) return;
    onUpdate((prev) => ({
      ...prev,
      info: {
        ...prev.info,
        fabulapoints: Math.max(
          0,
          Math.min(9999, (prev.info.fabulapoints ?? 0) + delta),
        ),
      },
    }));
  };

  const applyZenit = (delta) => {
    if (!isInteractive || !onUpdate) return;
    onUpdate((prev) => ({
      ...prev,
      info: {
        ...prev.info,
        zenit: Math.max(0, (prev.info.zenit ?? 0) + delta),
      },
    }));
  };
  const [resourceDialog, setResourceDialog] = useState(null);

  const openResourceDialog = (resource) => {
    if (!isInteractive) return;
    setResourceDialog(resource);
  };

  const closeResourceDialog = () => setResourceDialog(null);

  const setResourceCurrent = (resourceKey) => (nextCurrent) => {
    if (!isInteractive || !onUpdate) return;
    onUpdate((prev) => {
      const maxValue = prev.stats[resourceKey].max ?? 0;
      const bounded = Math.max(0, Math.min(nextCurrent ?? 0, maxValue));
      return {
        ...prev,
        stats: {
          ...prev.stats,
          [resourceKey]: {
            ...prev.stats[resourceKey],
            current: bounded,
          },
        },
      };
    });
  };

  const applyResourceDialogChange = (resourceKey) => (payload) => {
    if (!isInteractive || !onUpdate) return;
    const amount = Math.max(0, parseInt(payload?.amount, 10) || 0);
    if (amount <= 0) return;

    onUpdate((prev) => {
      const bonuses = getActorBonuses(prev);
      const multipliers = getActorMultipliers(prev);
      const currentValue = prev.stats[resourceKey].current ?? 0;
      const maxValue = prev.stats[resourceKey].max ?? 0;

      let delta = 0;

      if (resourceKey === "hp" && payload.mode === "damage") {
        const effectiveAffinities = payload.isGuarding
          ? DAMAGE_TYPES.reduce((acc, type) => {
              if (type !== "untyped") acc[type] = "rs";
              return acc;
            }, {})
          : (prev.affinities ?? {});
        const dmgCtx = buildDamageContext({
          baseDamage: amount,
          damageType: payload.damageType ?? "physical",
          npcAffinities: effectiveAffinities,
          isGuarding: payload.isGuarding,
          incomingDamageBonuses: bonuses.incomingDamage,
        });
        const dmgResult = resolveDamage(dmgCtx);
        delta = -dmgResult.finalDamage;
      } else {
        const direction = payload.mode === "heal" ? "recovery" : "loss";
        const rCtx = buildResourceContext({
          resource: resourceKey,
          amount,
          direction,
          voluntary: direction === "loss",
          currentValue,
          maxValue,
          incomingLossBonuses: bonuses.incomingLoss,
          incomingLossMultipliers: multipliers.incomingLoss,
          incomingRecoveryBonuses: bonuses.incomingRecovery,
          incomingRecoveryMultipliers: multipliers.incomingRecovery,
          outgoingRecoveryBonuses: bonuses.outgoingRecovery,
          outgoingRecoveryMultipliers: multipliers.outgoingRecovery,
        });
        const resolved = resolveResource(rCtx).resolvedAmount;
        delta = direction === "recovery" ? resolved : -resolved;
      }

      const nextCurrent = Math.max(0, Math.min(currentValue + delta, maxValue));
      return {
        ...prev,
        stats: {
          ...prev.stats,
          [resourceKey]: {
            ...prev.stats[resourceKey],
            current: nextCurrent,
          },
        },
      };
    });
  };

  const hpColor1 = isDark
    ? newShade(theme.palette.error.main, 10)
    : newShade(theme.palette.error.main, 80);
  const mpColor1 = isDark
    ? newShade(theme.palette.info.main, 10)
    : newShade(theme.palette.info.main, 80);
  const mightBase = pc.attributes?.might?.base ?? 0;
  const willBase = pc.attributes?.willpower?.base ?? 0;

  const hpTooltip = {
    title: t("Hit Points"),
    formula: `${t("MIG")} x 5 + ${t("Level")}`,
    total: pc.stats.hp.max,
    breakdown: [
      { label: `${t("MIG")} d${mightBase} x 5`, value: mightBase * 5 },
      { label: t("Level"), value: pc.lvl },
      ...(pc.stats.hp.max - mightBase * 5 - pc.lvl > 0
        ? [
            {
              label: t("Class / item bonuses"),
              value: pc.stats.hp.max - mightBase * 5 - pc.lvl,
              signed: true,
            },
          ]
        : []),
    ],
  };

  const mpTooltip = {
    title: t("Mind Points"),
    formula: `${t("WLP")} x 5 + ${t("Level")}`,
    total: pc.stats.mp.max,
    breakdown: [
      { label: `${t("WLP")} d${willBase} x 5`, value: willBase * 5 },
      { label: t("Level"), value: pc.lvl },
      ...(pc.stats.mp.max - willBase * 5 - pc.lvl > 0
        ? [
            {
              label: t("Class / item bonuses"),
              value: pc.stats.mp.max - willBase * 5 - pc.lvl,
              signed: true,
            },
          ]
        : []),
    ],
  };

  const ipTooltip = {
    title: t("Inventory Points"),
    formula: t("6 + Class bonuses"),
    total: pc.stats.ip.max,
    breakdown: [
      { label: t("Base"), value: 6 },
      ...(pc.stats.ip.max - 6 > 0
        ? [
            {
              label: t("Class bonuses"),
              value: pc.stats.ip.max - 6,
              signed: true,
            },
          ]
        : []),
    ],
  };

  const fpTooltip = {
    title: t("Fabula Points"),
    formula: t("Awarded by GM"),
    total: pc.info.fabulapoints ?? 0,
    breakdown: [],
  };

  const zenitTooltip = {
    title: t("Zenit"),
    formula: t("Currency"),
    total: pc.info.zenit ?? 0,
    breakdown: [],
  };

  return (
    <SectionCard
      title={t("Resources")}
      sx={{ mb: 1.5, containerType: "inline-size" }}
    >
      <Box
        sx={{
          p: 1,
          "@container (max-width: 420px)": { p: 0 },
          display: "flex",
          flexDirection: "column",
          gap: 1,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 1,
            "@container (max-width: 420px)": { gridTemplateColumns: "1fr" },
          }}
        >
          <ResourceCell
            label={t("HP")}
            Icon={HpResourceIcon}
            value={pc.stats.hp.current}
            max={pc.stats.hp.max}
            color1={hpColor1}
            color2={theme.palette.error.main}
            crisis
            crisisTooltip={t("Set to Crisis")}
            onSetCrisis={setHpToCrisis}
            onApply={applyStat("hp")}
            steps={[1, 5, 10, 20]}
            tooltip={hpTooltip}
            isInteractive={isInteractive}
            onBarClick={() => openResourceDialog("hp")}
          />
          <ResourceCell
            label={t("MP")}
            Icon={MpResourceIcon}
            value={pc.stats.mp.current}
            max={pc.stats.mp.max}
            color1={mpColor1}
            color2={theme.palette.info.main}
            onApply={applyStat("mp")}
            steps={[1, 5, 10, 20]}
            tooltip={mpTooltip}
            isInteractive={isInteractive}
            onBarClick={() => openResourceDialog("mp")}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 1,
            "@container (max-width: 420px)": { gridTemplateColumns: "1fr" },
          }}
        >
          <IpCell
            value={pc.stats.ip.current}
            max={pc.stats.ip.max}
            onApply={applyStat("ip")}
            tooltip={ipTooltip}
            isInteractive={isInteractive}
            onBarClick={() => openResourceDialog("ip")}
          />
          <FpCell
            value={pc.info.fabulapoints ?? 0}
            onApply={applyFp}
            tooltip={fpTooltip}
            isInteractive={isInteractive}
          />
        </Box>

        <ZenitRow
          value={pc.info.zenit ?? 0}
          onApply={applyZenit}
          tooltip={zenitTooltip}
          isInteractive={isInteractive}
        />
      </Box>
      {resourceDialog && (
        <EditResourcesModal
          open
          onClose={closeResourceDialog}
          title={resourceDialog.toUpperCase()}
          resourceKey={resourceDialog}
          current={pc.stats[resourceDialog].current}
          max={pc.stats[resourceDialog].max}
          damageTypes={DAMAGE_TYPES}
          resolvePreviewDelta={({
            amount,
            mode,
            damageType,
            isGuarding,
            resourceKey,
          }) => {
            if (mode === "heal") return amount;
            if (resourceKey !== "hp") return -amount;
            const effectiveAffinities = isGuarding
              ? DAMAGE_TYPES.reduce((acc, type) => {
                  if (type !== "untyped") acc[type] = "rs";
                  return acc;
                }, {})
              : (pc.affinities ?? {});
            const bonuses = getActorBonuses(pc);
            const dmgCtx = buildDamageContext({
              baseDamage: amount,
              damageType: damageType ?? "physical",
              npcAffinities: effectiveAffinities,
              isGuarding,
              incomingDamageBonuses: bonuses.incomingDamage,
            });
            return -resolveDamage(dmgCtx).finalDamage;
          }}
          onApply={applyResourceDialogChange(resourceDialog)}
          onSetCurrent={setResourceCurrent(resourceDialog)}
        />
      )}
    </SectionCard>
  );
}
