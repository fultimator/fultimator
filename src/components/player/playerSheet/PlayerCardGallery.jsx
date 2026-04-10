import React from "react";
import {
  Typography,
  LinearProgress,
  Card,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import avatar_image from "../../avatar.jpg";
import Diamond from "../../Diamond";
import { styled } from "@mui/system";
import { DefIcon, MdefIcon, InitIcon } from "../../icons";
import { TypeAffinity } from "../stats/types";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { calculateAttribute, newShade } from "../common/playerCalculations";
import { isItemEquipped } from "../equipment/slots/equipmentSlots";
import CardLoadout from "./CardLoadout";

// ─── Styled Components ────────────────────────────────────────────────────────

const GradientLinearProgress = styled(LinearProgress)(({ color1, color2 }) => ({
  height: 18,
  borderRadius: 0,
  backgroundColor: "transparent",
  "& .MuiLinearProgress-bar": {
    background: `linear-gradient(to right, ${color1}, ${color2})`,
    borderRadius: 0,
    transition: "width 1s ease-in-out",
  },
}));

const StatBarWrapper = styled(Box)({
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
    letterSpacing: "0.04em",
    color: "#fff",
    textShadow: "0 1px 3px rgba(0,0,0,0.6)",
  },
});

const AffinityStrip = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(9, 1fr)",
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const AffinityCell = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "4px 2px",
  borderRight: `1px solid ${theme.palette.divider}`,
  "&:last-child": { borderRight: "none" },
}));

const CombatStatCard = styled(Box)(({ theme }) => ({
  background: theme.palette.background.default,
  border: `0.5px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: "4px 6px",
  textAlign: "center",
  flex: 1,
}));

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBar({ label, value, max, color1, color2, trackColor }) {
  return (
    <StatBarWrapper sx={{ background: trackColor }}>
      <GradientLinearProgress
        variant="determinate"
        value={Math.min((value / max) * 100, 100)}
        color1={color1}
        color2={color2}
        sx={{ padding: "0.5rem 0" }}
      />
      <span className="stat-label">
        {label} {value}/{max}
      </span>
    </StatBarWrapper>
  );
}

function CombatStat({ icon, label, value, theme }) {
  return (
    <CombatStatCard>
      <Typography
        sx={{
          fontFamily: "'Antonio', fantasy, sans-serif",
          fontWeight: "bold",
          fontSize: "0.62rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: theme.palette.text.secondary,
          lineHeight: 1.2,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" }}>
        {icon}
        <Typography
          sx={{
            fontFamily: "'Antonio', fantasy, sans-serif",
            fontSize: "1.1rem",
            fontWeight: "bold",
            lineHeight: 1.3,
          }}
        >
          {value}
        </Typography>
      </Box>
    </CombatStatCard>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PlayerCardGallery({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const isDark = theme.palette.mode === "dark";

  const loadoutBreakpoint = "md";

  const currDex = calculateAttribute(player, player.attributes.dexterity, ["slow", "enraged"], ["dexUp"], 6, 12);
  const currInsight = calculateAttribute(player, player.attributes.insight, ["dazed", "enraged"], ["insUp"], 6, 12);
  const currMight = calculateAttribute(player, player.attributes.might, ["weak", "poisoned"], ["migUp"], 6, 12);
  const currWillpower = calculateAttribute(player, player.attributes.willpower, ["shaken", "poisoned"], ["wlpUp"], 6, 12);

  const getAttributeColor = (base, current) => {
    if (current < base) return theme.palette.error.main;
    if (current > base) return theme.palette.success.main;
    return theme.palette.text.primary;
  };

  // Equipment resolution for DEF / MDEF / INIT
  const inv = player.equipment?.[0];
  const equippedArmor = inv?.armor?.find((a) => isItemEquipped(player, a)) || null;
  const equippedShields = inv?.shields?.filter((s) => isItemEquipped(player, s)) || [];
  const equippedWeapons = inv?.weapons?.filter((w) => isItemEquipped(player, w)) || [];
  const equippedCustomWeapons = inv?.customWeapons?.filter((w) => isItemEquipped(player, w)) || [];
  const equippedAccessory = inv?.accessories?.find((a) => isItemEquipped(player, a)) || null;

  const pilotSpells = (player.classes || [])
    .flatMap((c) => c.spells || [])
    .filter((s) => s?.spellType === "pilot-vehicle" && s.showInPlayerSheet !== false);
  const activeVehicle = pilotSpells.flatMap((s) => s.vehicles || []).find((v) => v.enabled);
  const equippedModules = activeVehicle?.modules?.filter((m) => m.equipped) || [];
  const armorModule = equippedModules.find((m) => m.type === "pilot_module_armor");

  const isMartialArmor = armorModule ? armorModule.martial : equippedArmor?.martial || false;
  const dodgeBonus =
    equippedShields.length === 0 && !isMartialArmor
      ? (player.classes || []).flatMap((c) => c.skills || [])
        .filter((s) => s.specialSkill === "Dodge")
        .reduce((sum, s) => sum + (s.currentLvl || 0), 0)
      : 0;

  const baseDef = armorModule
    ? armorModule.martial ? armorModule.def || 0 : currDex + (armorModule.def || 0)
    : equippedArmor ? equippedArmor.martial ? equippedArmor.def : currDex + equippedArmor.def : currDex;

  const currDef =
    baseDef +
    equippedShields.reduce((acc, s) => acc + (s.def || 0), 0) +
    (player.modifiers?.def || 0) +
    (armorModule ? 0 : equippedArmor?.defModifier || 0) +
    equippedShields.reduce((acc, s) => acc + (s.defModifier || 0), 0) +
    (equippedAccessory?.defModifier || 0) +
    equippedWeapons.reduce((acc, w) => acc + (w.defModifier || 0), 0) +
    equippedCustomWeapons.reduce((acc, w) => acc + (parseInt(w.defModifier || 0, 10) || 0), 0) +
    dodgeBonus;

  const baseMDef = armorModule
    ? armorModule.martial ? armorModule.mdef || 0 : currInsight + (armorModule.mdef || 0)
    : equippedArmor ? currInsight + equippedArmor.mdef : currInsight;

  const currMDef =
    baseMDef +
    equippedShields.reduce((acc, s) => acc + (s.mdef || 0), 0) +
    (player.modifiers?.mdef || 0) +
    (armorModule ? 0 : equippedArmor?.mDefModifier || 0) +
    equippedShields.reduce((acc, s) => acc + (s.mDefModifier || 0), 0) +
    (equippedAccessory?.mDefModifier || 0) +
    equippedWeapons.reduce((acc, w) => acc + (w.mDefModifier || 0), 0) +
    equippedCustomWeapons.reduce((acc, w) => acc + (parseInt(w.mDefModifier || 0, 10) || 0), 0);

  const baseInit = armorModule ? 0 : equippedArmor?.init || 0;
  const currInit =
    baseInit +
    (player.modifiers?.init || 0) +
    (armorModule ? 0 : equippedArmor?.initModifier || 0) +
    equippedShields.reduce((acc, s) => acc + (s.initModifier || 0), 0) +
    (equippedAccessory?.initModifier || 0);

  const inCrisis = player.stats.hp.current <= player.stats.hp.max / 2;

  const ATTRIBUTES = [
    { key: "dexterity", label: t("DEX"), curr: currDex },
    { key: "insight", label: t("INS"), curr: currInsight },
    { key: "might", label: t("MIG"), curr: currMight },
    { key: "willpower", label: t("WLP"), curr: currWillpower },
  ];

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <Box sx={{ display: "flex", alignItems: "stretch" }}>
        <Box
          sx={{
            flex: 1,
            background: `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`,
            px: 2,
            py: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography
            color="#fff"
            fontFamily="Antonio"
            fontSize="1.5rem"
            fontWeight="medium"
            sx={{ textTransform: "uppercase" }}
          >
            {player.name}
          </Typography>
        </Box>
        <Box
          sx={{
            px: 2,
            py: 0.5,
            borderLeft: "2px solid #fff",
            borderBottom: `2px solid ${primary}`,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography fontFamily="Antonio" fontSize="1.25rem" fontWeight="medium" sx={{ textTransform: "uppercase" }}>
            {player.info.pronouns && <>{player.info.pronouns} <Diamond color={primary} />{" "}</>}
            {t("Lvl")} {player.lvl}
          </Typography>
        </Box>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "minmax(140px, 35%) minmax(0, 1fr)", alignItems: "stretch" }}>

{/* Avatar + Stat Bars */}
<Box sx={{ display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden", height: "100%", justifyContent: "space-between" }}>
          {/* Top section: avatar + bars */}
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box sx={{ position: "relative" }}>
              <img
                src={player.info.imgurl || avatar_image}
                alt="Player Avatar"
                style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }}
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
                    fontSize: "0.7rem",
                    letterSpacing: "0.1em",
                    textShadow: "0 0 4px red",
                  }}
                >
                  !! {t("CRISIS")} !!
                </Box>
              )}
            </Box>
            <StatBar label={t("HP")} value={player.stats.hp.current} max={player.stats.hp.max} color1={isDark ? newShade(theme.palette.error.main, 10) : newShade(theme.palette.error.main, 80)} color2={theme.palette.error.main} trackColor="rgba(35,35,35,0.88)" />
            <StatBar label={t("MP")} value={player.stats.mp.current} max={player.stats.mp.max} color1={isDark ? newShade(theme.palette.info.main, 10) : newShade(theme.palette.info.main, 80)} color2={theme.palette.info.main} trackColor="rgba(35,35,35,0.88)" />
            <StatBar label={t("IP")} value={player.stats.ip.current} max={player.stats.ip.max} color1={isDark ? newShade(theme.palette.success.main, 10) : newShade(theme.palette.success.main, 80)} color2={theme.palette.success.main} trackColor="rgba(35,35,35,0.88)" />
          </Box>

          {/* Mobile loadout — pushed to bottom */}
          <Box
            sx={{
              display: { xs: "flex", [loadoutBreakpoint]: "none" },
              mt: "auto",
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
            <CardLoadout player={player} setPlayer={setPlayer} isEditMode={false} />
          </Box>
        </Box>

        {/* Right column */}
        <Box sx={{ display: "flex", flexDirection: "column", p: 1, gap: 1, minWidth: 0 }}>

          {/* Traits */}
          <Box sx={{ border: `0.5px solid ${theme.palette.divider}`, borderRadius: "6px", overflow: "hidden" }}>
            <Box sx={{ background: primary, px: 1, py: "2px" }}>
              <Typography sx={{ color: custom.white, fontFamily: "Antonio", fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {t("Traits")}
              </Typography>
            </Box>
            <Box sx={{ px: 1, py: "5px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px" }}>
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography sx={{ fontFamily: "Antonio", fontSize: "0.9rem", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <strong>{t("Identity")}: </strong>
                  {player.info.identity && player.info.identity.length > 40
                    ? player.info.identity.slice(0, 40) + "…"
                    : player.info.identity}
                </Typography>
              </Box>
              <Typography sx={{ fontFamily: "Antonio", fontSize: "0.9rem", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <strong>{t("Theme")}: </strong>
                {t(player.info.theme)?.length > 18 ? t(player.info.theme).slice(0, 18) + "…" : t(player.info.theme)}
              </Typography>
              <Typography sx={{ fontFamily: "Antonio", fontSize: "0.9rem", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <strong>{t("Origin")}: </strong>
                {player.info.origin?.length > 18 ? player.info.origin.slice(0, 18) + "…" : player.info.origin}
              </Typography>
            </Box>
          </Box>

          {/* Attributes + Loadout */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "auto auto", [loadoutBreakpoint]: "auto auto 1fr" },
              gridTemplateRows: "repeat(4, auto)",
              alignItems: "center",
              rowGap: "2px",
              columnGap: "6px",
            }}
          >
            {/* Col 3 — loadout, desktop only */}
            <Box sx={{ gridColumn: 3, gridRow: "1 / -1", display: { xs: "none", [loadoutBreakpoint]: "flex" } }}>
              <CardLoadout player={player} setPlayer={setPlayer} isEditMode={false} />
            </Box>

            {ATTRIBUTES.map(({ key, label, curr }) => (
              <React.Fragment key={key}>
                <Typography
                  sx={{
                    fontFamily: "'Antonio'",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    py: "6px",
                  }}
                >
                  {label}:
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Antonio', fantasy, sans-serif",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    color: getAttributeColor(player.attributes[key], curr),
                    lineHeight: 1,
                  }}
                >
                  d{curr}
                </Typography>
              </React.Fragment>
            ))}
          </Box>

          {/* DEF / MDEF / INIT */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <CombatStat theme={theme} label={t("DEF")} icon={<DefIcon size="18px" color={isDark ? "white" : "black"} />} value={currDef} />
            <CombatStat theme={theme} label={t("M.DEF")} icon={<MdefIcon size="18px" color={isDark ? "white" : "black"} />} value={currMDef} />
            <CombatStat theme={theme} label={t("INIT")} icon={<InitIcon size="18px" color={isDark ? "white" : "black"} />} value={(currInit > 0 ? "+" : "") + currInit} />
          </Box>
        </Box>

      </Box>

      {/* ── Affinity Strip ── */}
      <AffinityStrip>
        {["physical", "wind", "bolt", "dark", "earth", "fire", "ice", "light", "poison"].map((type) => (
          <AffinityCell key={type}>
            <TypeAffinity type={type} affinity={player.affinities?.[type] || ""} />
          </AffinityCell>
        ))}
      </AffinityStrip>
    </Card>
  );
}
