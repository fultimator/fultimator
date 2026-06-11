import React, { useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { useTranslate } from "/src/translation/translate";
import {
  HpResourceIcon,
  MpResourceIcon,
  IpResourceIcon,
} from "/src/components/icons";
import StatTooltip from "/src/components/common/StatTooltip";
import { newShade } from "/src/libs/playerCalculations";
import { GradientLinearProgress } from "/src/components/shared/actors/pc/shared";
import { RESOURCE_SCALES } from "/src/components/shared/actors/scaleTokens";
import {
  getDeltaOverlaySx,
  getPipFlashSx,
  PIP_STRIPES,
  useAnimatedDeltaPercent,
  useAnimatedDeltaNumber,
} from "/src/components/shared/actors/common/resourceBarMotion";

function StatChangeDialog({ open, onClose, stat, value, max, onApply, pip, t }) {
  const [amount, setAmount] = useState("");
  const [isHealing, setIsHealing] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(amount, 10) || 0;
    if (val <= 0) return;
    onApply(pip ? (isHealing ? val : -val) : (isHealing ? val : -val));
    setAmount("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{ fontWeight: "bold", textAlign: "center", pb: 1 }}
        >
          {t("Update")} {stat}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pt: "16px !important",
            minWidth: 250,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {stat}: {value}{max != null ? ` / ${max}` : ""}
          </Typography>
          <ToggleButtonGroup
            value={isHealing ? "gain" : "lose"}
            exclusive
            onChange={(_, v) => v !== null && setIsHealing(v === "gain")}
            sx={{ mb: 2 }}
            fullWidth
          >
            <ToggleButton value="lose" color="error">
              {t("Lose")}
            </ToggleButton>
            <ToggleButton value="gain" color="success">
              {t("Gain")}
            </ToggleButton>
          </ToggleButtonGroup>
          <TextField
            fullWidth
            type="number"
            label={t("Amount")}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            slotProps={{ htmlInput: { min: 1 } }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={onClose} color="secondary" variant="contained">
            {t("Cancel")}
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {t("Apply")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function ResourceBarShell({
  label,
  value,
  max,
  onClick,
  isInteractive,
  shellBg,
  shellBorder,
  labelBg,
  labelBorder,
  Icon,
  rs,
  children,
}) {
  return (
    <Box
      sx={{
        width: "100%",
        height: rs.barHeight,
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
        bgcolor: shellBg,
        border: `1px solid ${shellBorder}`,
        borderRadius: "2px",
        cursor: isInteractive ? "pointer" : "default",
      }}
      onClick={isInteractive ? onClick : undefined}
    >
      <Box
        sx={{
          width: rs.labelWidth,
          height: "100%",
          bgcolor: labelBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          fontFamily: "Antonio",
          fontWeight: "bold",
          fontSize: rs.fontSize,
          color: "#fff",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          borderRight: `1px solid ${labelBorder}`,
          flexShrink: 0,
        }}
      >
        {Icon && <Icon size={rs.iconSize} />}
        <span style={{ lineHeight: 1 }}>{label}</span>
      </Box>
      {children}
      <Box
        sx={{
          width: rs.labelWidth,
          height: "100%",
          bgcolor: labelBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Antonio",
          fontWeight: "bold",
          fontSize: rs.fontSize,
          color: "#fff",
          letterSpacing: "0.04em",
          borderLeft: `1px solid ${labelBorder}`,
          flexShrink: 0,
        }}
      >
        {value}/{max}
      </Box>
    </Box>
  );
}

function CompactResourceBar({
  label,
  value,
  max,
  color1,
  color2,
  onClick,
  isInteractive,
  shellBg,
  shellBorder,
  labelBg,
  labelBorder,
  trackBg,
  Icon,
  rs,
  crisisLine = false,
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const { animatedPct, delta } = useAnimatedDeltaPercent(pct, {
    moveMs: 760,
    deltaMs: 1800,
  });

  return (
    <ResourceBarShell
      {...{
        label,
        value,
        max,
        onClick,
        isInteractive,
        shellBg,
        shellBorder,
        labelBg,
        labelBorder,
        Icon,
        rs,
      }}
    >
      <Box sx={{ flex: 1, position: "relative", bgcolor: trackBg }}>
        <GradientLinearProgress
          variant="determinate"
          value={animatedPct}
          color1={color1}
          color2={color2}
          sx={{
            height: "100% !important",
            padding: 0,
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
          <Box
            key={delta.seq}
            sx={getDeltaOverlaySx(delta, "pcResourcesDeltaFade")}
          />
        )}
        {crisisLine && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "50%",
              width: "2px",
              bgcolor: "rgba(255,255,255,0.55)",
              pointerEvents: "none",
            }}
          />
        )}
      </Box>
    </ResourceBarShell>
  );
}

export function SegmentedResourceBar({
  label,
  value,
  max,
  color1,
  color2,
  onClick,
  isInteractive,
  shellBg,
  shellBorder,
  labelBg,
  labelBorder,
  trackBg,
  Icon,
  rs,
}) {
  const { animatedValue, delta: pipDelta } = useAnimatedDeltaNumber(value, {
    moveMs: 280,
    deltaMs: 460,
  });

  return (
    <ResourceBarShell
      {...{
        label,
        value,
        max,
        onClick,
        isInteractive,
        shellBg,
        shellBorder,
        labelBg,
        labelBorder,
        Icon,
        rs,
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          gap: "2px",
          px: "3px",
          py: "2px",
          bgcolor: trackBg,
        }}
      >
        {Array.from({ length: max }).map((_, i) => {
          const animFill = Math.max(0, Math.min(1, animatedValue - i));
          const pipChanged = pipDelta
            ? i < pipDelta.from !== i < pipDelta.to
            : false;
          const changed =
            pipChanged && pipDelta && i >= Math.min(pipDelta.from, pipDelta.to);
          return (
            <Box
              key={i}
              sx={{
                flex: 1,
                borderRadius: "1px",
                background:
                  animFill > 0.01
                    ? `linear-gradient(to bottom, ${color1}, ${color2})`
                    : "transparent",
                border: `1px solid ${animFill > 0.01 ? color2 : shellBorder}`,
                opacity: 0.2 + animFill * 0.8,
                transition: (t) =>
                  t.transitions.create(["background", "opacity"], {
                    duration: t.transitions.duration.standard,
                    easing: t.transitions.easing.easeOut,
                  }),
                position: "relative",
                overflow: "hidden",
                ...(changed
                  ? {
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        background: `
                          linear-gradient(
                            to bottom,
                            ${alpha("#ffffff", 0.28)},
                            ${alpha("#ffffff", 0.1)}
                          ),
                          ${PIP_STRIPES.subtle}
                        `,
                        animation:
                          "ipDeltaFade 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
                        pointerEvents: "none",
                      },
                      "@keyframes ipDeltaFade": {
                        from: { opacity: 0.9 },
                        to: { opacity: 0 },
                      },
                    }
                  : getPipFlashSx({
                      changed: pipChanged,
                      keyframeName: "ipPipDeltaFade",
                      fromOpacity: 0.85,
                      stripe: PIP_STRIPES.subtle,
                    })),
              }}
            />
          );
        })}
      </Box>
    </ResourceBarShell>
  );
}

export default function PcResources({
  pc,
  isInteractive = false,
  onUpdate,
  scale = "sm",
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const rs = RESOURCE_SCALES[scale] ?? RESOURCE_SCALES.sm;
  const shellBg = alpha(theme.palette.primary.main, isDark ? 0.26 : 0.16);
  const shellBorder = alpha(theme.palette.primary.main, isDark ? 0.72 : 0.45);
  const labelBg = alpha(theme.palette.primary.main, isDark ? 0.62 : 0.5);
  const labelBorder = alpha(theme.palette.common.white, isDark ? 0.3 : 0.5);
  const trackBg = alpha(theme.palette.primary.main, isDark ? 0.4 : 0.28);
  const [statDialog, setStatDialog] = useState(null);

  const applyStatChange = (amount) => {
    if (!statDialog) return;
    const key = statDialog.key;
    onUpdate?.((prev) => {
      const current = Math.max(
        0,
        Math.min(prev.stats[key].current + amount, prev.stats[key].max),
      );
      return {
        ...prev,
        stats: { ...prev.stats, [key]: { ...prev.stats[key], current } },
      };
    });
  };

  const mightBase = pc.attributes.might?.base ?? 0;
  const willBase = pc.attributes.willpower?.base ?? 0;

  return (
    <Box sx={{ display: "grid", gap: rs.gap, p: rs.p, pb: 0 }}>
      <StatTooltip
        title={t("Hit Points")}
        disabled={isInteractive}
        formula={`${t("MIG")} x 5 + ${t("Level")}`}
        total={pc.stats.hp.max}
        breakdown={[
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
        ]}
      >
        <CompactResourceBar
          label={t("HP")}
          value={pc.stats.hp.current}
          max={pc.stats.hp.max}
          color1={
            isDark
              ? newShade(theme.palette.error.main, 10)
              : newShade(theme.palette.error.main, 80)
          }
          color2={theme.palette.error.main}
          Icon={HpResourceIcon}
          shellBg={shellBg}
          shellBorder={shellBorder}
          labelBg={labelBg}
          labelBorder={labelBorder}
          trackBg={trackBg}
          isInteractive={isInteractive}
          rs={rs}
          crisisLine
          onClick={() =>
            setStatDialog({
              key: "hp",
              label: t("HP"),
              value: pc.stats.hp.current,
              max: pc.stats.hp.max,
            })
          }
        />
      </StatTooltip>

      <StatTooltip
        title={t("Mind Points")}
        disabled={isInteractive}
        formula={`${t("WLP")} x 5 + ${t("Level")}`}
        total={pc.stats.mp.max}
        breakdown={[
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
        ]}
      >
        <CompactResourceBar
          label={t("MP")}
          value={pc.stats.mp.current}
          max={pc.stats.mp.max}
          color1={
            isDark
              ? newShade(theme.palette.info.main, 10)
              : newShade(theme.palette.info.main, 80)
          }
          color2={theme.palette.info.main}
          Icon={MpResourceIcon}
          shellBg={shellBg}
          shellBorder={shellBorder}
          labelBg={labelBg}
          labelBorder={labelBorder}
          trackBg={trackBg}
          isInteractive={isInteractive}
          rs={rs}
          onClick={() =>
            setStatDialog({
              key: "mp",
              label: t("MP"),
              value: pc.stats.mp.current,
              max: pc.stats.mp.max,
            })
          }
        />
      </StatTooltip>

      <StatTooltip
        title={t("Inventory Points")}
        disabled={isInteractive}
        formula={t("6 + Class bonuses")}
        total={pc.stats.ip.max}
        breakdown={[
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
        ]}
      >
        <SegmentedResourceBar
          label={t("IP")}
          value={pc.stats.ip.current}
          max={pc.stats.ip.max}
          color1={
            isDark
              ? newShade(theme.palette.success.main, 10)
              : newShade(theme.palette.success.main, 80)
          }
          color2={theme.palette.success.main}
          Icon={IpResourceIcon}
          shellBg={shellBg}
          shellBorder={shellBorder}
          labelBg={labelBg}
          labelBorder={labelBorder}
          trackBg={trackBg}
          isInteractive={isInteractive}
          rs={rs}
          onClick={() =>
            setStatDialog({
              key: "ip",
              label: t("IP"),
              value: pc.stats.ip.current,
              max: pc.stats.ip.max,
              pip: true,
            })
          }
        />
      </StatTooltip>

      {statDialog && (
        <StatChangeDialog
          open
          onClose={() => setStatDialog(null)}
          stat={statDialog.label}
          value={statDialog.value}
          max={statDialog.max}
          pip={statDialog.pip}
          onApply={applyStatChange}
          t={t}
        />
      )}
    </Box>
  );
}
