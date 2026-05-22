import React, { useState, useRef, useLayoutEffect, useMemo } from "react";
import {
  Typography,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  Card,
  Box,
  Tooltip,
  TextField,
  IconButton,
  Select,
  MenuItem,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import PlayerCardMobile from "./PlayerCardMobile";
import { useTranslate } from "../../../translation/translate";
import avatar_image from "/images/components/avatar.jpg";
import Diamond from "../../Diamond";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import ExpIcon from "/src/components/svgs/exp.svg?react";
import ExpDisabledIcon from "/src/components/svgs/exp_disabled.svg?react";
import {
  DexAttributeIcon,
  InsAttributeIcon,
  MigAttributeIcon,
  WlpAttributeIcon,
} from "../../icons";

import { TypeAffinity } from "../stats/types";
import StatTooltip from "../../common/StatTooltip";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { useThemeStore } from "../../../store/themeStore";
import { calculateAttribute, newShade } from "../common/playerCalculations";
import { isItemEquipped } from "../equipment/slots/equipmentSlots";
import CardLoadout from "./CardLoadout";

// Styled Components

const GradientLinearProgress = styled(LinearProgress)(
  ({ theme, color1, color2 }) => ({
    height: 18,
    [theme.breakpoints.down("sm")]: {
      height: 14,
    },
    borderRadius: 0,
    backgroundColor: "transparent",
    "& .MuiLinearProgress-bar": {
      background: `linear-gradient(to right, ${color1}, ${color2})`,
      borderRadius: 0,
      transition: "width 1s ease-in-out",
    },
  }),
);

const StatBarWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  "& .stat-label": {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    fontFamily: "'Antonio', fantasy, sans-serif",
    fontWeight: "bold",
    fontSize: "0.72rem",
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.6rem",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "0.8rem",
    },
    [theme.breakpoints.up("lg")]: {
      fontSize: "0.88rem",
    },
    letterSpacing: "0.04em",
    color: "#fff",
    textShadow: "0 1px 3px rgba(0,0,0,0.6)",
  },
}));

const AffinityStrip = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(9, 1fr)",
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "repeat(3, 1fr)",
  },
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const AffinityCell = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 2px",
  borderRight: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down("sm")]: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:nth-of-type(3n)": { borderRight: "none" },
    "&:nth-last-of-type(-n+3)": { borderBottom: "none" },
  },
  "&:last-child": { borderRight: "none" },
}));

const CombatStatCard = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  border: `0.5px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: "3px 6px",
  [theme.breakpoints.up("md")]: {
    padding: "4px 8px",
  },
  [theme.breakpoints.up("lg")]: {
    padding: "5px 10px",
  },
  textAlign: "center",
  flex: 1,
}));

const StyledMarkdown = styled(ReactMarkdown)(({ theme }) => ({
  whiteSpace: "pre-line",
  fontFamily: ["PT Sans Narrow", "sans-serif"].join(","),
  "& p": {
    margin: "4px 0",
    fontSize: "0.8rem",
    lineHeight: 1.45,
    fontFamily: ["PT Sans Narrow", "sans-serif"].join(","),
    [theme.breakpoints.up("sm")]: {
      fontSize: "0.9rem",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "0.95rem",
    },
    [theme.breakpoints.up("lg")]: {
      fontSize: "1rem",
      lineHeight: 1.55,
    },
  },
  "& p:first-of-type": {
    marginTop: 0,
  },
  "& p:last-of-type": {
    marginBottom: 0,
  },
}));

const DescriptionWrapper = styled(Box, {
  shouldForwardProp: (p) => p !== "isExpanded" && p !== "showFade",
})(({ theme, isExpanded, showFade }) => ({
  position: "relative",
  maxHeight: isExpanded ? "none" : "80px",
  overflow: "hidden",
  transition: "max-height 0.3s ease-in-out",
  cursor: "pointer",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: !isExpanded && showFade ? "30px" : 0,
    background: `linear-gradient(to bottom, transparent, ${theme.palette.background.paper})`,
    pointerEvents: "none",
    transition: "height 0.3s ease-in-out",
  },
}));

// Sub-components

function StatChangeDialog({ open, handleClose, stat, value, max, onApply, t }) {
  const [amount, setValue] = useState("");
  const [isHealing, setIsHealing] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(amount, 10) || 0;
    onApply(isHealing ? val : -val);
    setValue("");
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle
          variant="h4"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            borderBottom: "1px solid #ddd",
            pb: 1,
          }}
        >
          {t("Update")} {stat}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 2,
            minWidth: 250,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {stat}: {value} / {max}
          </Typography>
          <ToggleButtonGroup
            value={isHealing ? "heal" : "damage"}
            exclusive
            onChange={(_, v) => v !== null && setIsHealing(v === "heal")}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="heal" color="success" sx={{ px: 3 }}>
              {t("Heal")}
            </ToggleButton>
            <ToggleButton value="damage" color="error" sx={{ px: 3 }}>
              {t("Damage")}
            </ToggleButton>
          </ToggleButtonGroup>
          <TextField
            fullWidth
            type="number"
            label={t("Amount")}
            value={amount}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={handleClose} color="secondary" variant="contained">
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

function StatBar({
  label,
  value,
  max,
  color1,
  color2,
  trackColor,
  onClick,
  isOwner,
}) {
  return (
    <StatBarWrapper
      sx={{ background: trackColor, cursor: isOwner ? "pointer" : "default" }}
      onClick={isOwner ? onClick : undefined}
    >
      <GradientLinearProgress
        variant="determinate"
        value={Math.min((value / max) * 100, 100)}
        color1={color1}
        color2={color2}
        sx={{ padding: { xs: "0.4rem 0", sm: "0.5rem 0" } }}
      />
      <span className="stat-label">
        {label} {value}/{max}
      </span>
    </StatBarWrapper>
  );
}

function CombatStat({ icon, label, value, isEditMode = false, onChange, tooltip }) {
  const card = (
    <CombatStatCard sx={{ px: { xs: "6px", sm: "8px" }, py: "4px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          minHeight: "36px",
        }}
      >
        {icon}
        <Typography
          sx={{
            fontFamily: "'Antonio', fantasy, sans-serif",
            fontWeight: "bold",
            fontSize: {
              xs: "0.9rem",
              sm: "1.1rem",
              md: "1.2rem",
              lg: "1.3rem",
            },
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#fff",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
          }}
        >
          {label}
        </Typography>
        {isEditMode ? (
          <TextField
            value={value}
            onChange={onChange}
            size="small"
            variant="standard"
            slotProps={{
              input: { readOnly: !onChange },
              htmlInput: {
                style: {
                  textAlign: "center",
                  fontFamily: "Antonio",
                  fontWeight: "bold",
                  color: "#fff",
                  WebkitTextFillColor: "#fff",
                },
              },
            }}
            sx={{
              width: { xs: "34px", sm: "40px" },
              "& .MuiInputBase-input": { color: "#fff" },
              "& .MuiInput-underline:before": {
                borderBottomColor: "rgba(255,255,255,0.75)",
                borderBottomWidth: "2px",
              },
              "& .MuiInput-underline:hover:before": {
                borderBottomColor: "#fff",
                borderBottomWidth: "2px",
              },
              "& .MuiInput-underline:after": {
                borderBottomColor: "#fff",
                borderBottomWidth: "2px",
              },
            }}
          />
        ) : (
          <Typography
            sx={{
              fontFamily: "'Antonio', fantasy, sans-serif",
              fontSize: {
                xs: "0.9rem",
                sm: "1.1rem",
                md: "1.2rem",
                lg: "1.3rem",
              },
              fontWeight: "bold",
              lineHeight: 1.2,
              color: "#fff",
              display: "flex",
              alignItems: "center",
            }}
          >
            {value}
          </Typography>
        )}
      </Box>
    </CombatStatCard>
  );

  if (tooltip) {
    return <StatTooltip {...tooltip} display="flex" sx={{ flex: 1 }}>{card}</StatTooltip>;
  }
  return card;
}

// Main Component

export default function PlayerCard({
  player,
  setPlayer,
  isEditMode,
  isOwner,
  isCharacterSheet,
  characterImage,
  updateMaxStats,
  canLevelUpFromExp,
  onLevelUpRequest,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const custom = useCustomTheme();
  const actorSheetEffectsEnabled = useThemeStore(
    (s) => s.customization.actorSheetEffectsEnabled,
  );
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const isDark = theme.palette.mode === "dark";

  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [showFade, setShowFade] = useState(false);
  const descRef = useRef(null);

  const [statDialog, setStatChangeDialog] = useState(null); // { key, label, value, max }

  useLayoutEffect(() => {
    if (descRef.current) {
      setShowFade(descRef.current.scrollHeight > 80);
    }
  }, [player.info.description]);

  const themes = useMemo(
    () => [
      t("Ambition"),
      t("Anger"),
      t("Belonging"),
      t("Doubt"),
      t("Duty"),
      t("Guilt"),
      t("Hope"),
      t("Justice"),
      t("Mercy"),
      t("Vengeance"),
    ],
    [t],
  );

  const handleThemeChange = (event, newValue) => {
    const updatedValue = newValue === null ? "" : newValue;
    setPlayer((prevState) => ({
      ...prevState,
      info: { ...prevState.info, theme: updatedValue },
    }));
  };

  const setInfoNumber = (key, value) => {
    setPlayer((prevState) => ({
      ...prevState,
      info: { ...prevState.info, [key]: Math.max(0, value) },
    }));
  };

  const bumpInfoNumber = (key, delta) => {
    const current = parseInt(player.info?.[key], 10) || 0;
    setInfoNumber(key, current + delta);
  };

  const handleThemeInputChange = (event, newInputValue) => {
    setPlayer((prevState) => ({
      ...prevState,
      info: { ...prevState.info, theme: newInputValue },
    }));
  };

  const handleStatApply = (amount) => {
    if (!statDialog) return;
    const key = statDialog.key;
    setPlayer((prev) => {
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

  const handleAffinityChange = (type) => (nextAffinity) => {
    if (!setPlayer) return;
    setPlayer((prev) => ({
      ...prev,
      affinities: {
        ...(prev.affinities ?? {}),
        [type]: nextAffinity || "",
      },
    }));
  };

  const currDex = calculateAttribute(
    player,
    player.attributes.dexterity?.base,
    ["slow", "enraged"],
    ["dexUp"],
    6,
    12,
  );
  const currInsight = calculateAttribute(
    player,
    player.attributes.insight?.base,
    ["dazed", "enraged"],
    ["insUp"],
    6,
    12,
  );
  const currMight = calculateAttribute(
    player,
    player.attributes.might?.base,
    ["weak", "poisoned"],
    ["migUp"],
    6,
    12,
  );
  const currWillpower = calculateAttribute(
    player,
    player.attributes.willpower?.base,
    ["shaken", "poisoned"],
    ["wlpUp"],
    6,
    12,
  );

  const getAttributeColor = (base, current) => {
    if (current < base) return theme.palette.error.main;
    if (current > base) return theme.palette.success.main;
    return theme.palette.text.primary;
  };

  // Equipment resolution
  const inv = player.equipment?.[0];
  const equippedArmor =
    inv?.armor?.find((a) => isItemEquipped(player, a)) || null;
  const equippedShields =
    inv?.shields?.filter((s) => isItemEquipped(player, s)) || [];
  const equippedWeapons =
    inv?.weapons?.filter((w) => isItemEquipped(player, w)) || [];
  const equippedCustomWeapons =
    inv?.customWeapons?.filter((w) => isItemEquipped(player, w)) || [];
  const equippedAccessory =
    inv?.accessories?.find((a) => isItemEquipped(player, a)) || null;

  // Vehicle/module resolution
  const pilotSpells = (player.classes || [])
    .flatMap((c) => c.spells || [])
    .filter(
      (s) => s?.spellType === "pilot-vehicle" && s.showInPlayerSheet !== false,
    );

  const activeVehicle = pilotSpells
    .flatMap((s) => s.vehicles || [])
    .find((v) => v.enabled);
  const equippedModules =
    activeVehicle?.modules?.filter((m) => m.equipped) || [];
  const armorModule = equippedModules.find(
    (m) => m.type === "pilot_module_armor",
  );

  // Derived combat values
  const isMartialArmor = armorModule
    ? armorModule.martial
    : equippedArmor?.martial || false;
  const dodgeBonus =
    equippedShields.length === 0 && !isMartialArmor
      ? (player.classes || [])
          .flatMap((c) => c.skills || [])
          .filter((s) => s.specialSkill === "Dodge")
          .reduce((sum, s) => sum + (s.currentLvl || 0), 0)
      : 0;

  const baseDef = armorModule
    ? armorModule.martial
      ? armorModule.def || 0
      : currDex + (armorModule.def || 0)
    : equippedArmor
      ? equippedArmor.martial
        ? equippedArmor.def
        : currDex + equippedArmor.def
      : currDex;

  const currDef =
    baseDef +
    equippedShields.reduce((t, s) => t + (s.def || 0), 0) +
    (player.modifiers?.def || 0) +
    (armorModule
      ? 0
      : (equippedArmor?.modifiers?.def ?? equippedArmor?.defModifier ?? 0)) +
    equippedShields.reduce(
      (t, s) => t + (s?.modifiers?.def ?? s?.defModifier ?? 0),
      0,
    ) +
    (equippedAccessory?.modifiers?.def ?? equippedAccessory?.defModifier ?? 0) +
    equippedWeapons.reduce(
      (t, w) => t + (w?.modifiers?.def ?? w?.defModifier ?? 0),
      0,
    ) +
    equippedCustomWeapons.reduce(
      (t, w) =>
        t + (parseInt(w?.modifiers?.def ?? w?.defModifier ?? 0, 10) || 0),
      0,
    ) +
    dodgeBonus;

  const baseMDef = armorModule
    ? armorModule.martial
      ? armorModule.mdef || 0
      : currInsight + (armorModule.mdef || 0)
    : equippedArmor
      ? currInsight + equippedArmor.mdef
      : currInsight;

  const currMDef =
    baseMDef +
    equippedShields.reduce((t, s) => t + (s.mdef || 0), 0) +
    (player.modifiers?.mdef || 0) +
    (armorModule
      ? 0
      : (equippedArmor?.modifiers?.mdef ?? equippedArmor?.mDefModifier ?? 0)) +
    equippedShields.reduce(
      (t, s) => t + (s?.modifiers?.mdef ?? s?.mDefModifier ?? 0),
      0,
    ) +
    (equippedAccessory?.modifiers?.mdef ??
      equippedAccessory?.mDefModifier ??
      0) +
    equippedWeapons.reduce(
      (t, w) => t + (w?.modifiers?.mdef ?? w?.mDefModifier ?? 0),
      0,
    ) +
    equippedCustomWeapons.reduce(
      (t, w) =>
        t + (parseInt(w?.modifiers?.mdef ?? w?.mDefModifier ?? 0, 10) || 0),
      0,
    );

  const baseInit = armorModule ? 0 : equippedArmor?.init || 0;
  const currInit =
    baseInit +
    (player.modifiers?.init || 0) +
    (armorModule ? 0 : equippedArmor?.initModifier || 0) +
    equippedShields.reduce((t, s) => t + (s.initModifier || 0), 0) +
    (equippedAccessory?.initModifier || 0);

  const inCrisis = player.stats.hp.current <= player.stats.hp.max / 2;
  const combatStatTextColor = theme.palette.getContrastText(
    theme.palette.primary.main,
  );

  const onStatusChange = (status) => (event) => {
    setPlayer((prev) => ({
      ...prev,
      statuses: { ...prev.statuses, [status]: event.target.checked },
    }));
  };

  const isImmune = (status) => player.immunities?.[status] === true;

  const STATUSES_LEFT = [
    { key: "slow", label: t("Slow") },
    { key: "dazed", label: t("Dazed") },
    { key: "weak", label: t("Weak") },
    { key: "shaken", label: t("Shaken") },
  ];

  const ATTRIBUTES = [
    { key: "dexterity", label: t("DEX"), fullName: t("Dexterity"), curr: currDex, Icon: DexAttributeIcon, debuffs: ["slow", "enraged"], buffs: ["dexUp"] },
    { key: "insight", label: t("INS"), fullName: t("Insight"), curr: currInsight, Icon: InsAttributeIcon, debuffs: ["dazed", "enraged"], buffs: ["insUp"] },
    { key: "might", label: t("MIG"), fullName: t("Might"), curr: currMight, Icon: MigAttributeIcon, debuffs: ["weak", "poisoned"], buffs: ["migUp"] },
    { key: "willpower", label: t("WLP"), fullName: t("Willpower"), curr: currWillpower, Icon: WlpAttributeIcon, debuffs: ["shaken", "poisoned"], buffs: ["wlpUp"] },
  ];

  const avatarSrc = isCharacterSheet
    ? characterImage || avatar_image
    : player.info.imgurl || avatar_image;

  // Shared status checkbox style
  const statusLabel = (label) => (
    <Typography
      variant="body2"
      sx={{
        fontFamily: "'Antonio', fantasy, sans-serif",
        fontSize: { xs: "0.68rem", sm: "0.8rem", md: "0.86rem", lg: "0.92rem" },
      }}
    >
      {label}
    </Typography>
  );

  const statusCheckbox = (key) => (
    <Checkbox
      sx={{
        margin: 0,
        padding: 0,
        "& .MuiSvgIcon-root": { fontSize: { xs: "1rem", sm: "1.2rem" } },
      }}
      checked={player.statuses[key]}
      onChange={onStatusChange(key)}
      disabled={!(isEditMode || isOwner) || isImmune(key)}
    />
  );

  if (isMobile) {
    return (
      <PlayerCardMobile
        player={player}
        setPlayer={setPlayer}
        isEditMode={isEditMode}
        isOwner={isOwner}
        isCharacterSheet={isCharacterSheet}
        characterImage={characterImage}
        updateMaxStats={updateMaxStats}
        canLevelUpFromExp={canLevelUpFromExp}
        onLevelUpRequest={onLevelUpRequest}
      />
    );
  }

  return (
    <Card
      elevation={isCharacterSheet ? 0 : 3}
      sx={{
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
        overflow: "hidden",
        ...(actorSheetEffectsEnabled === false
          ? {
              background: theme.palette.background.paper,
              boxShadow: "none",
              borderTop: "",
              borderLeft: "",
              borderBottom: "",
              borderRight: "",
            }
          : {}),
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "stretch" }}>
        <Box
          sx={{
            flex: 1,
            background: `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`,
            px: { xs: 1, sm: 2 },
            py: { xs: 0.75, sm: 1, md: 1.2 },
            display: "flex",
            alignItems: "center",
          }}
        >
          {isEditMode ? (
            <TextField
              value={player.name}
              onChange={(e) =>
                setPlayer((p) => ({ ...p, name: e.target.value }))
              }
              variant="standard"
              size="small"
              sx={{
                flex: 1,
                minWidth: 0,
                "& .MuiInput-root": { width: "100%" },
                "& .MuiInputBase-root": {
                  "&:hover": { backgroundColor: "transparent" },
                },
                "& .MuiInputBase-input": {
                  color: "#fff",
                  "&:-webkit-autofill": { WebkitBoxShadow: "0 0 0 100px transparent inset", WebkitTextFillColor: "#fff" },
                  fontFamily: "Antonio",
                  fontSize: {
                    xs: "1.15rem",
                    sm: "1.5rem",
                    md: "1.7rem",
                    lg: "1.85rem",
                  },
                  fontWeight: "medium",
                  textTransform: "uppercase",
                },
                "& .MuiInput-underline:before": {
                  borderBottomColor: "rgba(255,255,255,0.5)",
                },
                "& .MuiInput-underline:hover:before": {
                  borderBottomColor: "#fff",
                },
                "& .MuiInput-underline:after": { borderBottomColor: "#fff" },
              }}
              slotProps={{
                htmlInput: { maxLength: 50 },
              }}
            />
          ) : (
            <Typography
              sx={{
                color: "#fff",
                fontFamily: "Antonio",
                fontSize: {
                  xs: "1.15rem",
                  sm: "1.5rem",
                  md: "1.7rem",
                  lg: "1.85rem",
                },
                fontWeight: "medium",
                textTransform: "uppercase",
              }}
            >
              {player.name}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            px: { xs: 1, sm: 2 },
            py: { xs: 0.4, sm: 0.5, md: 0.65 },
            borderLeft: "2px solid #fff",
            borderBottom: `2px solid ${primary}`,
            display: "flex",
            alignItems: "center",
          }}
        >
          {isEditMode ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <TextField
                value={player.info.pronouns || ""}
                onChange={(e) =>
                  setPlayer((p) => ({
                    ...p,
                    info: { ...p.info, pronouns: e.target.value },
                  }))
                }
                variant="standard"
                size="small"
                placeholder={t("Pronouns")}
                sx={{
                  width: { xs: 110, sm: 130 },
                  "& .MuiInputBase-root": { minHeight: 32 },
                  "& .MuiInputBase-input": {
                    fontFamily: "Antonio",
                    fontSize: { xs: "0.95rem", sm: "1.08rem" },
                    lineHeight: 1.1,
                    textTransform: "uppercase",
                  },
                }}
              />
              <Diamond color={primary} />
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.45 }}>
                <Typography
                  sx={{
                    fontFamily: "Antonio",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    textTransform: "uppercase",
                    lineHeight: 1,
                  }}
                >
                  {t("Lvl")}
                </Typography>
                <TextField
                  value={player.lvl}
                  onChange={(e) => {
                    const next = parseInt(e.target.value, 10);
                    const lvl = Number.isNaN(next) ? 5 : Math.max(5, Math.min(50, next));
                    setPlayer((p) => ({ ...p, lvl }));
                    updateMaxStats?.();
                  }}
                  variant="standard"
                  size="small"
                  type="number"
                  sx={{
                    width: { xs: 48, sm: 54 },
                    "& .MuiInputBase-root": { minHeight: 32 },
                    "& .MuiInputBase-input": {
                      fontFamily: "Antonio",
                      fontSize: { xs: "1.2rem", sm: "1.3rem" },
                      fontWeight: "medium",
                      lineHeight: 1,
                      textTransform: "uppercase",
                      textAlign: "center",
                    },
                  }}
                  slotProps={{ htmlInput: { min: 5, max: 50 } }}
                />
              </Box>
              <Diamond color={primary} />
              <Typography
                sx={{
                  fontFamily: "Antonio",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  fontWeight: 400,
                  lineHeight: 1,
                  textTransform: "uppercase",
                }}
              >
                {t("Exp")}
              </Typography>
              <IconButton
                size="small"
                onClick={() => bumpInfoNumber("exp", -1)}
              >
                <Remove fontSize="small" />
              </IconButton>
              <TextField
                value={player.info.exp || 0}
                onChange={(e) => {
                  const nextValue = parseInt(e.target.value, 10);
                  setInfoNumber("exp", Number.isNaN(nextValue) ? 0 : nextValue);
                }}
                size="small"
                variant="standard"
                sx={{
                  width: { xs: "48px", sm: "54px" },
                  "& .MuiInputBase-root": { minHeight: 32 },
                  "& .MuiInputBase-input": {
                    textAlign: "center",
                    fontFamily: "Antonio",
                    fontWeight: "medium",
                    fontSize: { xs: "1.2rem", sm: "1.3rem" },
                    lineHeight: 1,
                  },
                }}
                slotProps={{
                  htmlInput: { maxLength: 2 },
                }}
              />
              <IconButton size="small" onClick={() => bumpInfoNumber("exp", 1)}>
                <Add fontSize="small" />
              </IconButton>
              <Tooltip
                title={canLevelUpFromExp ? t("Level Up") : t("Need 10 EXP")}
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={onLevelUpRequest}
                    disabled={!isOwner || !canLevelUpFromExp}
                    sx={{
                      animation: canLevelUpFromExp
                        ? "flash 1s infinite"
                        : "none",
                      p: 0.25,
                    }}
                  >
                    {canLevelUpFromExp ? (
                      <ExpIcon style={{ width: "18px", height: "18px" }} />
                    ) : (
                      <ExpDisabledIcon
                        style={{ width: "18px", height: "18px" }}
                      />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.35,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Antonio",
                  fontSize: {
                    xs: "0.96rem",
                    sm: "1.25rem",
                    md: "1.35rem",
                    lg: "1.45rem",
                  },
                  fontWeight: "medium",
                  textTransform: "uppercase",
                }}
              >
                {player.info.pronouns && (
                  <>
                    {player.info.pronouns} <Diamond color={primary} />{" "}
                  </>
                )}
                {t("Lvl")} {player.lvl} <Diamond color={primary} />
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Antonio",
                  fontSize: {
                    xs: "0.96rem",
                    sm: "1.25rem",
                    md: "1.35rem",
                    lg: "1.45rem",
                  },
                  fontWeight: "medium",
                  textTransform: "uppercase",
                }}
              >
                {t("Exp")} {player.info.exp || 0}
              </Typography>
              <Tooltip
                title={canLevelUpFromExp ? t("Level Up") : t("Need 10 EXP")}
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={onLevelUpRequest}
                    disabled={!isOwner || !canLevelUpFromExp}
                    sx={{
                      animation: canLevelUpFromExp
                        ? "flash 1s infinite"
                        : "none",
                      p: 0.25,
                    }}
                  >
                    {canLevelUpFromExp ? (
                      <ExpIcon style={{ width: "16px", height: "16px" }} />
                    ) : (
                      <ExpDisabledIcon
                        style={{ width: "16px", height: "16px" }}
                      />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>
      {/* Body  */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(80px, 32%) 1fr",
            sm: "minmax(140px, 35%) 1fr",
            md: "minmax(170px, 34%) 1fr",
            lg: "minmax(200px, 32%) 1fr",
          },
          alignItems: "stretch",
        }}
      >
        {/* Left column */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            overflow: "hidden",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          {" "}
          {/* Avatar */}
          <Box
            sx={{
              position: "relative",
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <img
              src={avatarSrc}
              alt="Player Avatar"
              style={{
                width: "100%",
                height: "auto",
                // maxHeight: "300px",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
            {inCrisis && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  background: "rgba(0,0,0,0.65)",
                  color: "#fff",
                  textAlign: "center",
                  py: "3px",
                  fontFamily: "Antonio",
                  fontSize: { xs: "0.62rem", sm: "0.7rem", md: "0.78rem" },
                  letterSpacing: "0.1em",
                  textShadow: "0 0 4px red",
                }}
              >
                !! {t("CRISIS")} !!
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <StatTooltip
              title={t("Hit Points")}
              formula={`${t("MIG")} × 5 + ${t("Level")}`}
              total={player.stats.hp.max}
              breakdown={[
                { label: `${t("MIG")} d${player.attributes.might?.base} × 5`, value: (player.attributes.might?.base ?? 0) * 5 },
                { label: t("Level"), value: player.lvl },
                ...(player.stats.hp.max - (player.attributes.might?.base ?? 0) * 5 - player.lvl > 0
                  ? [{ label: t("Class / item bonuses"), value: player.stats.hp.max - (player.attributes.might?.base ?? 0) * 5 - player.lvl, signed: true }]
                  : []),
              ]}
            >
              <StatBar
                label={t("HP")}
                value={player.stats.hp.current}
                max={player.stats.hp.max}
                color1={isDark ? newShade(theme.palette.error.main, 10) : newShade(theme.palette.error.main, 80)}
                color2={theme.palette.error.main}
                trackColor="rgba(35,35,35,0.88)"
                isOwner={isOwner}
                onClick={() => setStatChangeDialog({ key: "hp", label: t("HP"), value: player.stats.hp.current, max: player.stats.hp.max })}
              />
            </StatTooltip>
            <StatTooltip
              title={t("Mind Points")}
              formula={`${t("WLP")} × 5 + ${t("Level")}`}
              total={player.stats.mp.max}
              breakdown={[
                { label: `${t("WLP")} d${player.attributes.willpower?.base} × 5`, value: (player.attributes.willpower?.base ?? 0) * 5 },
                { label: t("Level"), value: player.lvl },
                ...(player.stats.mp.max - (player.attributes.willpower?.base ?? 0) * 5 - player.lvl > 0
                  ? [{ label: t("Class / item bonuses"), value: player.stats.mp.max - (player.attributes.willpower?.base ?? 0) * 5 - player.lvl, signed: true }]
                  : []),
              ]}
            >
              <StatBar
                label={t("MP")}
                value={player.stats.mp.current}
                max={player.stats.mp.max}
                color1={isDark ? newShade(theme.palette.info.main, 10) : newShade(theme.palette.info.main, 80)}
                color2={theme.palette.info.main}
                trackColor="rgba(35,35,35,0.88)"
                isOwner={isOwner}
                onClick={() => setStatChangeDialog({ key: "mp", label: t("MP"), value: player.stats.mp.current, max: player.stats.mp.max })}
              />
            </StatTooltip>
            <StatTooltip
              title={t("Inventory Points")}
              formula={t("6 + Class bonuses")}
              total={player.stats.ip.max}
              breakdown={[
                { label: t("Base"), value: 6 },
                ...(player.stats.ip.max - 6 > 0
                  ? [{ label: t("Class bonuses"), value: player.stats.ip.max - 6, signed: true }]
                  : []),
              ]}
            >
              <StatBar
                label={t("IP")}
                value={player.stats.ip.current}
                max={player.stats.ip.max}
                color1={isDark ? newShade(theme.palette.success.main, 10) : newShade(theme.palette.success.main, 80)}
                color2={theme.palette.success.main}
                trackColor="rgba(35,35,35,0.88)"
                isOwner={isOwner}
                onClick={() => setStatChangeDialog({ key: "ip", label: t("IP"), value: player.stats.ip.current, max: player.stats.ip.max })}
              />
            </StatTooltip>
          </Box>
          {/* Mobile loadout in left column */}
          {/* <Box sx={{
            display: isCharacterSheet ? "flex" : { xs: "flex", md: "none" }, mt: "auto",
            pt: 1,
            borderTop: `0.5px solid ${theme.palette.divider}`,
            width: "100%",
            minWidth: 0,
            overflow: "hidden",
            "& *": {
              wordBreak: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "normal !important",
              minWidth: "0 !important",
            },
          }}
          >
            <CardLoadout player={player} setPlayer={setPlayer} isEditMode={isEditMode} showHeader={false} showSideDivider={false} showSupportColumn />
          </Box> */}
        </Box>

        {/* Right column */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            p: { xs: 0.5, sm: 1, md: 1.25, lg: 1.5 },
            gap: { xs: 0.75, sm: 1, md: 1.2, lg: 1.4 },
            minWidth: 0,
          }}
        >
          {/* Description */}
          {player.info.description && (
            <Box
              sx={{
                border: `0.5px solid ${theme.palette.divider}`,
                borderRadius: "6px",
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              <Box sx={{ background: primary, px: 1, py: "2px" }}>
                <Typography
                  sx={{
                    color: custom.white,
                    fontFamily: "Antonio",
                    fontSize: {
                      xs: "0.85rem",
                      sm: "1rem",
                      md: "1.08rem",
                      lg: "1.16rem",
                    },
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {t("Description")}
                </Typography>
              </Box>
              <DescriptionWrapper
                isExpanded={isDescExpanded}
                showFade={showFade}
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                sx={{ px: 1, minWidth: 0 }}
              >
                <div ref={descRef}>
                  <StyledMarkdown>{player.info.description}</StyledMarkdown>
                </div>
              </DescriptionWrapper>
            </Box>
          )}

          {/* Traits */}
          <Box
            sx={{
              border: `0.5px solid ${theme.palette.divider}`,
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <Box sx={{ background: primary, px: 1, py: "2px" }}>
              <Typography
                sx={{
                  color: custom.white,
                  fontFamily: "Antonio",
                  fontSize: {
                    xs: "0.85rem",
                    sm: "1rem",
                    md: "1.08rem",
                    lg: "1.16rem",
                  },
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {t("Traits")}
              </Typography>
            </Box>
            <Box
              sx={{
                px: { xs: 1, md: 1.25 },
                py: { xs: "5px", md: "8px" },
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: { xs: "2px 8px", md: "6px 12px" },
              }}
            >
              <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
                {isEditMode ? (
                  <TextField
                    fullWidth
                    label={t("Identity")}
                    variant="standard"
                    value={player.info.identity}
                    onChange={(e) =>
                      setPlayer((p) => ({
                        ...p,
                        info: { ...p.info, identity: e.target.value },
                      }))
                    }
                    slotProps={{
                      htmlInput: {
                        maxLength: 300,
                        style: {
                          fontFamily: "Antonio",
                          fontSize: "0.9rem",
                          textTransform: "uppercase",
                        },
                      },
                    }}
                  />
                ) : (
                  <Typography
                    sx={{
                      fontFamily: "Antonio",
                      fontSize: {
                        xs: "0.85rem",
                        sm: "0.9rem",
                        md: "0.96rem",
                        lg: "1rem",
                      },
                      textTransform: "uppercase",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <strong>{t("Identity")}: </strong>
                    {player.info.identity &&
                    player.info.identity.length > (isCharacterSheet ? 100 : 50)
                      ? player.info.identity.slice(
                          0,
                          isCharacterSheet ? 100 : 50,
                        ) + "…"
                      : player.info.identity}
                  </Typography>
                )}
              </Box>
              {isEditMode ? (
                <Autocomplete
                  options={themes}
                  value={player.info.theme}
                  onChange={handleThemeChange}
                  onInputChange={handleThemeInputChange}
                  freeSolo
                  sx={{
                    width: "100%",
                    "& input": {
                      fontFamily: "Antonio",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("Theme")}
                      variant="standard"
                    />
                  )}
                />
              ) : (
                <Typography
                  sx={{
                    fontFamily: "Antonio",
                    fontSize: {
                      xs: "0.85rem",
                      sm: "0.9rem",
                      md: "0.96rem",
                      lg: "1rem",
                    },
                    textTransform: "uppercase",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <strong>{t("Theme")}: </strong>
                  {t(player.info.theme)?.length > 18
                    ? t(player.info.theme).slice(0, 18) + "…"
                    : t(player.info.theme)}
                </Typography>
              )}
              {isEditMode ? (
                <TextField
                  fullWidth
                  label={t("Origin")}
                  variant="standard"
                  value={player.info.origin}
                  onChange={(e) =>
                    setPlayer((p) => ({
                      ...p,
                      info: { ...p.info, origin: e.target.value },
                    }))
                  }
                  slotProps={{
                    htmlInput: {
                      maxLength: 50,
                      style: {
                        fontFamily: "Antonio",
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                      },
                    },
                  }}
                />
              ) : (
                <Typography
                  sx={{
                    fontFamily: "Antonio",
                    fontSize: {
                      xs: "0.85rem",
                      sm: "0.9rem",
                      md: "0.96rem",
                      lg: "1rem",
                    },
                    textTransform: "uppercase",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <strong>{t("Origin")}: </strong>
                  {player.info.origin?.length > 18
                    ? player.info.origin.slice(0, 18) + "…"
                    : player.info.origin}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Attributes + Statuses
              Grid: [label] [dice] [status-left] [status-right]
              4 rows (one per attribute). All cells share the same row height
              automatically, so edit-mode Selects and preview Typography stay
              perfectly aligned without any manual margin hacks. */}
          {/* Attributes grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: isCharacterSheet
                ? "auto auto auto auto"
                : { xs: "auto auto auto auto", md: "auto auto auto auto 1fr" },
              gridTemplateRows: "repeat(4, auto)",
              alignItems: "center",
              rowGap: { xs: "2px", md: "4px", lg: "5px" },
              columnGap: { xs: "2px", sm: "6px", md: "8px", lg: "10px" },
            }}
          >
            {/* Right column desktop loadout */}
            <Box
              sx={{
                gridColumn: 5,
                gridRow: "1 / -1",
                display: isCharacterSheet ? "none" : { xs: "none", md: "flex" },
                flexDirection: "column",
                minHeight: 0,
                width: "100%",
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  border: `0.5px solid ${theme.palette.divider}`,
                  borderRadius: "6px",
                  overflow: "hidden",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                <Box sx={{ background: primary, px: 1, py: "4px" }}>
                  <Typography
                    sx={{
                      color: custom.white,
                      fontFamily: "Antonio",
                      fontSize: {
                        xs: "0.85rem",
                        sm: "1rem",
                        md: "1.08rem",
                        lg: "1.16rem",
                      },
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {t("Loadout")}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: 1,
                    py: "6px",
                    minHeight: 0,
                    flex: 1,
                    "& *": {
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "normal !important",
                      minWidth: "0 !important",
                    },
                  }}
                >
                  <CardLoadout
                    player={player}
                    setPlayer={setPlayer}
                    isEditMode={isEditMode}
                    isOwner={isOwner}
                    showHeader={false}
                    showSideDivider={false}
                    showSupportColumn
                  />
                </Box>
              </Box>
            </Box>

            {ATTRIBUTES.map(({ key, label, fullName, curr, Icon, debuffs, buffs }, i) => {
              // Which status goes in the left slot for this row
              const leftStatus = STATUSES_LEFT[i]; // slow/dazed/weak/shaken

              // Right slot: Enraged on row 0, Poisoned on row 2, empty otherwise
              const rightStatus =
                i === 0
                  ? { key: "enraged", label: t("Enraged") }
                  : i === 2
                    ? { key: "poisoned", label: t("Poisoned") }
                    : null;

              return (
                <React.Fragment key={key}>
                  {/* Col 1 — attribute label */}
                  <Typography
                    sx={{
                      fontFamily: "'Antonio'",
                      fontWeight: "bold",
                      fontSize: {
                        xs: "0.8rem",
                        sm: "1rem",
                        md: "1.08rem",
                        lg: "1.14rem",
                      },
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                      py: { xs: "4px", sm: "5px", md: "6px" },
                    }}
                  >
                    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.35 }}>
                      <Icon size="1.2em" />
                      {label}:
                    </Box>
                  </Typography>

                  {/* Col 2 — dice value or Select */}
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {isEditMode ? (
                      <Select
                        value={player.attributes[key]?.base}
                        onChange={(e) => {
                          setPlayer((p) => ({
                            ...p,
                            attributes: {
                              ...p.attributes,
                              [key]: {
                                ...p.attributes[key],
                                base: e.target.value,
                              },
                            },
                          }));
                          updateMaxStats?.();
                        }}
                        variant="standard"
                        size="small"
                        sx={{
                          fontFamily: "'Antonio', fantasy, sans-serif",
                          fontSize: {
                            xs: "0.8rem",
                            sm: "1rem",
                            md: "1.08rem",
                            lg: "1.14rem",
                          },
                          minWidth: { xs: 35, sm: 52 },
                        }}
                      >
                        {[6, 8, 10, 12].map((v) => (
                          <MenuItem
                            key={v}
                            value={v}
                            sx={{
                              fontFamily: "'Antonio', fantasy, sans-serif",
                            }}
                          >
                            d{v}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <StatTooltip
                        title={fullName}
                        base={`d${player.attributes[key]?.base}`}
                        current={`d${curr}`}
                        breakdown={[
                          ...debuffs.filter(s => player.statuses?.[s]).map(s => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: "-2 die" })),
                          ...buffs.filter(s => player.statuses?.[s]).map(s => ({ label: s, value: "+2 die" })),
                        ]}
                        display="inline-flex"
                      >
                        <Typography
                          sx={{
                            fontFamily: "'Antonio', fantasy, sans-serif",
                            fontSize: {
                              xs: "0.8rem",
                              sm: "1rem",
                              md: "1.08rem",
                              lg: "1.14rem",
                            },
                            fontWeight: "bold",
                            color: getAttributeColor(
                              player.attributes[key]?.base,
                              curr,
                            ),
                            lineHeight: 1,
                            cursor: "help",
                          }}
                        >
                          d{curr}
                        </Typography>
                      </StatTooltip>
                    )}
                  </Box>

                  {/* Col 3 — left status (Slow / Dazed / Weak / Shaken) */}
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <FormControlLabel
                      control={statusCheckbox(leftStatus.key)}
                      label={statusLabel(leftStatus.label)}
                      sx={{ margin: 0 }}
                    />
                  </Box>

                  {/* Col 4 — right status (Enraged row 0, Poisoned row 2, blank otherwise) */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      alignSelf: rightStatus ? "end" : "center",
                      transform: rightStatus ? "translateY(60%)" : "none",
                    }}
                  >
                    {rightStatus && (
                      <FormControlLabel
                        control={statusCheckbox(rightStatus.key)}
                        label={statusLabel(rightStatus.label)}
                        sx={{ margin: 0 }}
                      />
                    )}
                  </Box>
                </React.Fragment>
              );
            })}
          </Box>

          {/* DEF / MDEF / INIT */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: 0.5, sm: 1, md: 1.25, lg: 1.5 },
              flexWrap: "wrap",
            }}
          >
            <CombatStat
              label={t("DEF")}
              icon={
                <Box
                  component="img"
                    src="/assets/icons/stats/icon_def.png"
                    alt={t("DEF")}
                    sx={{
                    width: { xs: "30px", sm: "34px" },
                    height: { xs: "30px", sm: "34px" },
                    objectFit: "contain",
                    display: "block",
                    flexShrink: 0,
                  }}
                />
              }
              value={currDef}
              isEditMode={isEditMode}
              tooltip={{
                title: t("Defense"),
                formula: isMartialArmor
                  ? `${equippedArmor?.name ?? t("Armor")} (${t("fixed")})`
                  : equippedArmor
                    ? `DEX d${player.attributes.dexterity?.base} + ${equippedArmor.name} +${equippedArmor.def}`
                    : `DEX d${player.attributes.dexterity?.base}`,
                total: currDef,
                breakdown: [
                  ...(isMartialArmor
                    ? [{ label: `${equippedArmor?.name ?? t("Armor")} (${t("martial, fixed")})`, value: baseDef }]
                    : [
                        { label: `DEX d${player.attributes.dexterity?.base}`, value: currDex },
                        ...(equippedArmor ? [{ label: `${equippedArmor.name} +${equippedArmor.def}`, value: equippedArmor.def }] : []),
                      ]
                  ),
                  ...equippedShields.filter(s => s.def).map(s => ({ label: `${s.name} (shield)`, value: s.def, signed: true })),
                  ...(dodgeBonus > 0 ? [{ label: t("Dodge skill"), value: dodgeBonus, signed: true }] : []),
                  ...equippedShields.filter(s => s?.modifiers?.def ?? s?.defModifier).map(s => ({ label: `${s.name} (bonus)`, value: s?.modifiers?.def ?? s?.defModifier, signed: true })),
                  ...(equippedAccessory?.modifiers?.def || equippedAccessory?.defModifier ? [{ label: equippedAccessory.name, value: equippedAccessory?.modifiers?.def ?? equippedAccessory?.defModifier, signed: true }] : []),
                  ...equippedWeapons.filter(w => w?.modifiers?.def ?? w?.defModifier).map(w => ({ label: w.name, value: w?.modifiers?.def ?? w?.defModifier, signed: true })),
                  ...(player.modifiers?.def ? [{ label: t("Other bonuses"), value: player.modifiers.def, signed: true }] : []),
                ].filter(e => e.value !== 0),
              }}
            />
            <CombatStat
              label={t("M.DEF")}
              icon={
                <Box
                  component="img"
                    src="/assets/icons/stats/icon_mdef.png"
                    alt={t("M.DEF")}
                    sx={{
                    width: { xs: "30px", sm: "34px" },
                    height: { xs: "30px", sm: "34px" },
                    objectFit: "contain",
                    display: "block",
                    flexShrink: 0,
                  }}
                />
              }
              value={currMDef}
              isEditMode={isEditMode}
              tooltip={{
                title: t("Magic Defense"),
                formula: isMartialArmor
                  ? `${equippedArmor?.name ?? t("Armor")} (${t("fixed")})`
                  : equippedArmor
                    ? `INS d${player.attributes.insight?.base} + ${equippedArmor.name} +${equippedArmor.mdef}`
                    : `INS d${player.attributes.insight?.base}`,
                total: currMDef,
                breakdown: [
                  ...(isMartialArmor
                    ? [{ label: `${equippedArmor?.name ?? t("Armor")} (${t("martial, fixed")})`, value: baseMDef }]
                    : [
                        { label: `INS d${player.attributes.insight?.base}`, value: currInsight },
                        ...(equippedArmor ? [{ label: `${equippedArmor.name} +${equippedArmor.mdef}`, value: equippedArmor.mdef }] : []),
                      ]
                  ),
                  ...equippedShields.filter(s => s.mdef).map(s => ({ label: `${s.name} (shield)`, value: s.mdef, signed: true })),
                  ...equippedShields.filter(s => s?.modifiers?.mdef ?? s?.mDefModifier).map(s => ({ label: `${s.name} (bonus)`, value: s?.modifiers?.mdef ?? s?.mDefModifier, signed: true })),
                  ...(equippedAccessory?.modifiers?.mdef || equippedAccessory?.mDefModifier ? [{ label: equippedAccessory.name, value: equippedAccessory?.modifiers?.mdef ?? equippedAccessory?.mDefModifier, signed: true }] : []),
                  ...equippedWeapons.filter(w => w?.modifiers?.mdef ?? w?.mDefModifier).map(w => ({ label: w.name, value: w?.modifiers?.mdef ?? w?.mDefModifier, signed: true })),
                  ...(player.modifiers?.mdef ? [{ label: t("Other bonuses"), value: player.modifiers.mdef, signed: true }] : []),
                ].filter(e => e.value !== 0),
              }}
            />
            <CombatStat
              label={t("INIT")}
              icon={
                <Box
                  component="img"
                  src="/assets/icons/stats/icon_clock.png"
                  alt={t("INIT")}
                  sx={{
                    width: { xs: "30px", sm: "34px" },
                    height: { xs: "30px", sm: "34px" },
                    objectFit: "contain",
                    display: "block",
                    flexShrink: 0,
                  }}
                />
              }
              value={(currInit > 0 ? "+" : "") + currInit}
              isEditMode={isEditMode}
              tooltip={{
                title: t("Initiative"),
                formula: t("Sum of all initiative modifiers"),
                total: currInit,
                breakdown: [
                  ...(equippedArmor ? [{ label: equippedArmor.name, value: baseInit, signed: true }] : []),
                  ...(equippedArmor?.initModifier ? [{ label: `${equippedArmor.name} (bonus)`, value: equippedArmor.initModifier, signed: true }] : []),
                  ...equippedShields.filter(s => s.initModifier).map(s => ({ label: s.name, value: s.initModifier, signed: true })),
                  ...(equippedAccessory?.initModifier ? [{ label: equippedAccessory.name, value: equippedAccessory.initModifier, signed: true }] : []),
                  ...(player.modifiers?.init ? [{ label: t("Other bonuses"), value: player.modifiers.init, signed: true }] : []),
                ].filter(e => e.value !== 0),
              }}
            />
            {isEditMode ? (
              <CombatStatCard sx={{ px: { xs: "6px", sm: "8px" }, py: "6px" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    minHeight: "42px",
                  }}
                >
                  <Box
                    component="img"
                    src="/assets/icons/resources/fp.png"
                    alt="FP"
                    sx={{
                      width: { xs: "36px", sm: "40px" },
                      height: { xs: "36px", sm: "40px" },
                      objectFit: "contain",
                      display: "block",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "'Antonio', fantasy, sans-serif",
                      fontWeight: "bold",
                      fontSize: {
                        xs: "0.9rem",
                        sm: "1.1rem",
                        md: "1.2rem",
                        lg: "1.3rem",
                      },
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#fff",
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    FP
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{ p: 0.25, color: "#fff" }}
                    onClick={() => bumpInfoNumber("fabulapoints", -1)}
                  >
                    <Remove sx={{ fontSize: "1.05rem" }} />
                  </IconButton>
                  <TextField
                    value={player.info.fabulapoints || 0}
                    onChange={(e) => {
                      const nextValue = parseInt(e.target.value, 10);
                      setInfoNumber(
                        "fabulapoints",
                        Number.isNaN(nextValue) ? 0 : nextValue,
                      );
                    }}
                    size="small"
                    variant="standard"
                    slotProps={{
                      htmlInput: {
                        style: {
                          textAlign: "center",
                          fontFamily: "Antonio",
                          fontWeight: "bold",
                          color: "#fff",
                          WebkitTextFillColor: "#fff",
                        },
                      },
                    }}
                    sx={{
                      width: { xs: "36px", sm: "44px" },
                      "& .MuiInputBase-input": { color: "#fff" },
                      "& .MuiInput-underline:before": {
                        borderBottomColor: "rgba(255, 255, 255, 0.6)",
                      },
                      "& .MuiInput-underline:hover:before": {
                        borderBottomColor: "#fff",
                      },
                      "& .MuiInput-underline:after": {
                        borderBottomColor: "#fff",
                      },
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{ p: 0.25, color: "#fff" }}
                    onClick={() => bumpInfoNumber("fabulapoints", 1)}
                  >
                    <Add sx={{ fontSize: "1.05rem" }} />
                  </IconButton>
                </Box>
              </CombatStatCard>
            ) : (
              <CombatStat
                label="FP"
                icon={
                  <Box
                    component="img"
                    src="/assets/icons/resources/fp.png"
                    alt="FP"
                    sx={{
                      width: { xs: "36px", sm: "40px" },
                      height: { xs: "36px", sm: "40px" },
                      objectFit: "contain",
                      display: "block",
                      flexShrink: 0,
                    }}
                  />
                }
                value={player.info.fabulapoints || 0}
              />
            )}
          </Box>
        </Box>
      </Box>
      {/* Affinity Strip */}
      <AffinityStrip>
        {[
          "physical",
          "air",
          "bolt",
          "dark",
          "earth",
          "fire",
          "ice",
          "light",
          "poison",
        ].map((type) => (
          <AffinityCell key={type}>
            {isEditMode ? (
              <TypeAffinity
                type={type}
                affinity={player.affinities?.[type] || ""}
                iconSize="2.2em"
                editable={Boolean(setPlayer)}
                onChangeAffinity={handleAffinityChange(type)}
              />
            ) : (
              <StatTooltip
                title={type.charAt(0).toUpperCase() + type.slice(1)}
                base={player.affinities?.[type] || ""}
                display="flex"
              >
                <TypeAffinity
                  type={type}
                  affinity={player.affinities?.[type] || ""}
                  iconSize="2.2em"
                />
              </StatTooltip>
            )}
          </AffinityCell>
        ))}
      </AffinityStrip>
      <StatChangeDialog
        open={!!statDialog}
        handleClose={() => setStatChangeDialog(null)}
        stat={statDialog?.label}
        value={statDialog?.value}
        max={statDialog?.max}
        onApply={handleStatApply}
        t={t}
      />
      <style>
        {`
          @keyframes flash {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Card>
  );
}
