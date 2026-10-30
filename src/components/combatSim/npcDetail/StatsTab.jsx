import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { t } from "../../../translation/translate";
import { useTheme } from "@mui/material/styles";
import { useBarShell } from "/src/components/shared/actors/common/barShellUtils";
import ActorActionBar from "../ActorActionBar";
import { GradientLinearProgress } from "/src/components/shared/actors/pc/shared";
import {
  FpResourceIcon,
  HpResourceIcon,
  MpResourceIcon,
  UpResourceIcon,
} from "/src/components/icons";
import { newShade } from "/src/libs/playerCalculations";
import { villainUltimaMax } from "/src/routes/combat/combatSimulator";
import {
  useAnimatedDeltaPercent,
  getDeltaOverlaySx,
} from "/src/components/shared/actors/common/resourceBarMotion";

const BAR_SIDE_WIDTH = 62;
const BAR_TEXT_SIZE = "0.9rem";

function ResourceStrip({
  label,
  value,
  max,
  Icon,
  color1,
  color2,
  crisisLine = false,
  onClick,
  shellBg,
  shellBorder,
  labelBg,
  labelBorder,
  trackBg,
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const { animatedPct, delta } = useAnimatedDeltaPercent(pct, {
    moveMs: 760,
    deltaMs: 1800,
  });
  return (
    <Box
      onClick={onClick}
      sx={{
        height: 30,
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
        bgcolor: shellBg,
        border: `1px solid ${shellBorder}`,
        borderRadius: "2px",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <Box
        sx={{
          width: BAR_SIDE_WIDTH,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          bgcolor: labelBg,
          borderRight: `1px solid ${labelBorder}`,
          color: "#fff",
          fontFamily: "Antonio",
          fontWeight: 700,
          fontSize: BAR_TEXT_SIZE,
          letterSpacing: "0.04em",
        }}
      >
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
            sx={getDeltaOverlaySx(delta, "npcStatsDeltaFade")}
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
              transform: "translateX(-50%)",
              bgcolor: "rgba(255,255,255,0.6)",
              pointerEvents: "none",
            }}
          />
        )}
      </Box>
      <Box
        sx={{
          width: BAR_SIDE_WIDTH,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: labelBg,
          borderLeft: `1px solid ${labelBorder}`,
          color: "#fff",
          fontFamily: "Antonio",
          fontWeight: 700,
          fontSize: BAR_TEXT_SIZE,
          letterSpacing: "0.03em",
        }}
      >
        {value}/{max}
      </Box>
    </Box>
  );
}

function PipStrip({
  label,
  value,
  max,
  Icon,
  onClick,
  shellBg,
  shellBorder,
  labelBg,
  labelBorder,
  trackBg,
  inlineLabel = false,
}) {
  const pips = Math.max(1, Math.min(max, 30));
  return (
    <Box
      onClick={onClick}
      sx={{
        minHeight: 30,
        display: "flex",
        alignItems: "stretch",
        bgcolor: shellBg,
        border: `1px solid ${shellBorder}`,
        borderRadius: "2px",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <Box
        sx={{
          width: BAR_SIDE_WIDTH,
          flexShrink: 0,
          display: "flex",
          flexDirection: inlineLabel ? "row" : "column",
          alignItems: "center",
          justifyContent: "center",
          gap: inlineLabel ? "4px" : "3px",
          bgcolor: labelBg,
          borderRight: `1px solid ${labelBorder}`,
          color: "#fff",
          fontFamily: "Antonio",
          fontWeight: 700,
          fontSize: BAR_TEXT_SIZE,
          letterSpacing: "0.04em",
        }}
      >
        {Icon ? <Icon size="1.2em" /> : null}
        {label}
      </Box>
      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          alignItems: "center",
          justifyItems: "center",
          columnGap: "4px",
          rowGap: "6px",
          px: "6px",
          py: "6px",
          bgcolor: trackBg,
        }}
      >
        {Array.from({ length: pips }).map((_, i) => {
          const filled = i < value;
          return (
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: filled ? 1 : 0.2,
                filter: filled
                  ? "drop-shadow(0 0 2px rgba(255,255,255,0.45))"
                  : "none",
                transition: (t) =>
                  t.transitions.create(["opacity", "filter"], {
                    duration: t.transitions.duration.standard,
                  }),
              }}
            >
              {Icon && <Icon size="1.1em" />}
            </Box>
          );
        })}
        {value > max && (
          <Typography
            sx={{
              fontFamily: "Antonio",
              fontWeight: "bold",
              fontSize: "0.75rem",
              color: "#fff",
              lineHeight: 1,
            }}
          >
            +{value - max}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          width: BAR_SIDE_WIDTH,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: labelBg,
          borderLeft: `1px solid ${labelBorder}`,
          color: "#fff",
          fontFamily: "Antonio",
          fontWeight: 700,
          fontSize: BAR_TEXT_SIZE,
          letterSpacing: "0.04em",
        }}
      >
        {value}/{max}
      </Box>
    </Box>
  );
}

const StatsTab = ({
  selectedNPC,
  calcHP,
  calcMP,
  _calcAttr,
  handleOpen,
  toggleStatusEffect,
  applyCommand,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const statusEffectColors = {
    Slow: theme.palette.info.main,
    Dazed: theme.palette.warning.main,
    Weak: theme.palette.error.light,
    Shaken: theme.palette.warning.light,
    Enraged: theme.palette.error.main,
    Poisoned: theme.palette.success.main,
  };
  const statusEffectIcons = {
    Slow: "/assets/icons/statuses/Slow.webp",
    Dazed: "/assets/icons/statuses/Dazed.webp",
    Weak: "/assets/icons/statuses/Weak.webp",
    Shaken: "/assets/icons/statuses/Shaken.webp",
    Enraged: "/assets/icons/statuses/Enraged.webp",
    Poisoned: "/assets/icons/statuses/Poisoned.webp",
  };

  const maxHp = calcHP(selectedNPC);
  const maxMp = calcMP(selectedNPC);
  const hpNow = selectedNPC?.combatStats?.currentHp || 0;
  const mpNow = selectedNPC?.combatStats?.currentMp || 0;

  const { shellBg, shellBorder, labelBg, labelBorder, trackBg } = useBarShell();

  return (
    <Box>
      <Box sx={{ mt: 1.25, display: "grid", gap: 0.45 }}>
        <ResourceStrip
          label={t("HP")}
          value={hpNow}
          max={maxHp}
          Icon={HpResourceIcon}
          color1={newShade(theme.palette.error.main, isDarkMode ? 8 : 80)}
          color2={theme.palette.error.main}
          crisisLine
          onClick={() => handleOpen("HP", selectedNPC)}
          shellBg={shellBg}
          shellBorder={shellBorder}
          labelBg={labelBg}
          labelBorder={labelBorder}
          trackBg={trackBg}
        />
        <ResourceStrip
          label={t("MP")}
          value={mpNow}
          max={maxMp}
          Icon={MpResourceIcon}
          color1={newShade(theme.palette.info.main, isDarkMode ? 10 : 80)}
          color2={theme.palette.info.main}
          onClick={() => handleOpen("MP", selectedNPC)}
          shellBg={shellBg}
          shellBorder={shellBorder}
          labelBg={labelBg}
          labelBorder={labelBorder}
          trackBg={trackBg}
        />
        {selectedNPC?.combatStats?.currentFp !== undefined && (
          <PipStrip
            label={t("FP")}
            value={selectedNPC.combatStats.currentFp ?? 0}
            max={selectedNPC.combatStats.maxFp ?? 6}
            Icon={FpResourceIcon}
            onClick={() => handleOpen("FP", selectedNPC)}
            shellBg={shellBg}
            shellBorder={shellBorder}
            labelBg={labelBg}
            labelBorder={labelBorder}
            trackBg={trackBg}
          />
        )}
        {selectedNPC?.villain &&
          selectedNPC?.combatStats?.ultima !== undefined && (
            <PipStrip
              label={t("UP")}
              value={selectedNPC.combatStats.ultima ?? 0}
              max={villainUltimaMax(selectedNPC?.villain)}
              Icon={UpResourceIcon}
              inlineLabel
              onClick={() => handleOpen("UP", selectedNPC)}
              shellBg={shellBg}
              shellBorder={shellBorder}
              labelBg={labelBg}
              labelBorder={labelBorder}
              trackBg={trackBg}
            />
          )}
      </Box>

      <Box sx={{ mt: 0.9, display: "flex", alignItems: "center", gap: 0.8 }}>
        <Button
          variant="contained"
          onClick={() => handleOpen("HP", selectedNPC)}
          size="small"
          fullWidth
          startIcon={<HpResourceIcon />}
          sx={{ fontSize: "0.93rem" }}
        >
          {t("Edit HP")}
        </Button>
        <Button
          variant="contained"
          onClick={() => handleOpen("MP", selectedNPC)}
          size="small"
          fullWidth
          startIcon={<MpResourceIcon />}
          sx={{ fontSize: "0.93rem" }}
        >
          {t("Edit MP")}
        </Button>
        {selectedNPC?.villain &&
          selectedNPC?.combatStats?.ultima !== undefined && (
            <Button
              variant="contained"
              onClick={() => handleOpen("UP", selectedNPC)}
              size="small"
              fullWidth
              startIcon={<UpResourceIcon />}
              sx={{ fontSize: "0.93rem" }}
            >
              {t("Edit UP")}
            </Button>
          )}
      </Box>

      {/* Actions */}
      {applyCommand && (
        <Box sx={{ mt: 1 }}>
          <ActorActionBar
            actorDoc={selectedNPC}
            isNpc={true}
            applyCommand={applyCommand}
            expand
          />
        </Box>
      )}

      {/* Status Effects */}
      <Box sx={{ marginTop: 1 }}>
        {[
          ["Slow", "Dazed", "Weak", "Shaken"],
          ["Enraged", "Poisoned"],
        ].map((row, rowIndex) => (
          <ToggleButtonGroup
            key={rowIndex}
            value={selectedNPC?.combatStats?.statusEffects || []}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              mt: rowIndex === 0 ? 0 : 1,
            }}
          >
            {row.map((label) => (
              <ToggleButton
                key={label}
                value={label}
                onClick={() => toggleStatusEffect(selectedNPC, label)}
                sx={{
                  flex: "1 1 16%",
                  minWidth: "80px",
                  justifyContent: "center",
                  padding: "5px 0",
                  "& .MuiTypography-root": {
                    textShadow: "none",
                  },
                  "&.Mui-selected": {
                    backgroundColor: statusEffectColors[label],
                    color: "white !important",
                    "& .MuiTypography-root": {
                      textShadow:
                        "-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000",
                    },
                    "&:hover": {
                      backgroundColor:
                        statusEffectColors[label] + " !important",
                      color: "white !important",
                    },
                  },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.7,
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "inherit",
                    fontSize: { xs: "1rem", sm: "1.2rem" },
                  }}
                >
                  <Box
                    component="img"
                    src={statusEffectIcons[label]}
                    alt={label}
                    sx={{
                      width: { xs: "1.25em", sm: "1.35em" },
                      height: { xs: "1.25em", sm: "1.35em" },
                      objectFit: "contain",
                    }}
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
};

export default StatsTab;
