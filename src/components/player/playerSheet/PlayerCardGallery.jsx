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

const GradientLinearProgress = styled(LinearProgress)(({ theme, color1, color2 }) => ({
  height: 18,
  [theme.breakpoints.down("sm")]: {
    height: 14,
  },
  [theme.breakpoints.up("md")]: {
    height: 20,
  },
  borderRadius: 0,
  backgroundColor: "transparent",
  "& .MuiLinearProgress-bar": {
    background: `linear-gradient(to right, ${color1}, ${color2})`,
    borderRadius: 0,
    transition: "width 1s ease-in-out",
  },
}));

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
  flexDirection: "column",
  alignItems: "center",
  padding: "4px 2px",
  borderRight: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.up("md")]: {
    padding: "6px 4px",
  },
  [theme.breakpoints.up("lg")]: {
    padding: "8px 4px",
  },
  [theme.breakpoints.down("sm")]: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:nth-of-type(3n)": { borderRight: "none" },
    "&:nth-last-of-type(-n+3)": { borderBottom: "none" },
  },
  "&:last-child": { borderRight: "none" },
}));

const CombatStatCard = styled(Box)(({ theme }) => ({
  background: theme.palette.background.default,
  border: `0.5px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: "4px 6px",
  [theme.breakpoints.up("md")]: {
    padding: "6px 8px",
  },
  [theme.breakpoints.up("lg")]: {
    padding: "8px 10px",
  },
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
        sx={{ padding: { xs: "0.4rem 0", sm: "0.5rem 0", md: "0.55rem 0" } }}
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
          fontSize: { xs: "0.55rem", sm: "0.62rem", md: "0.68rem", lg: "0.74rem" },
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: theme.palette.text.secondary,
          lineHeight: 1.2,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" }}>
        <Box sx={{ display: "flex", alignItems: "center", "& svg": { width: { xs: 14, sm: 18, md: 20 }, height: { xs: 14, sm: 18, md: 20 } } }}>
          {icon}
        </Box>
        <Typography
          sx={{
            fontFamily: "'Antonio', fantasy, sans-serif",
            fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.2rem", lg: "1.3rem" },
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

export default function PlayerCardGallery({ player, setPlayer, isExpanded = false }) {
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
  const visibleClasses = (player.classes || []).filter((c) => c && c.name);
  const hasDescription = Boolean(player.info?.description?.trim());
  const getSpellLabel = (spell) => {
    const name = spell?.name || spell?.spellName;
    if (name && name !== t("Unnamed Spell")) return name;
    switch (spell?.spellType) {
      case "magiseed": return t("magiseed_garden");
      case "cooking": return t("Gourmet");
      case "invocation": return t("Invoker");
      case "deck": return t("ace_deck_management");
      case "tinkerer-alchemy": return t("Alchemy");
      case "tinkerer-infusion": return t("Infusion");
      case "tinkerer-magitech": return t("Magitech");
      case "magichant": return t("Magichant");
      case "symbol": return t("Symbol");
      case "dance": return t("Dance");
      case "gift": return t("Gift");
      case "therioform": return t("Therioform");
      case "pilot-vehicle": return t("Pilot Vehicle");
      case "arcanist": return t("arcanist_arcanum");
      case "arcanist-rework": return t("Arcanist-Rework");
      case "default": return t("Spell");
      case "gamble": return t("Gamble");
      default: return t(spell?.spellType || "Unnamed Spell");
    }
  };
  const NON_STATIC_SPELL_TYPES = new Set([
    "pilot-vehicle",
    "magiseed",
    "deck",
    "invocation",
    "gift",
    "therioform",
    "dance",
    "symbol",
    "cooking",
    "tinkerer-alchemy",
    "tinkerer-infusion",
    "tinkerer-magitech",
  ]);
  const getSystemSpellLabel = (spellType) => {
    switch (spellType) {
      case "pilot-vehicle": return t("Pilot Vehicle");
      case "magiseed": return t("magiseed_garden");
      case "deck": return t("ace_deck_management");
      case "invocation": return t("invoker_invocation");
      case "gift": return t("esper_psychic_gifts");
      case "therioform": return t("mutant_therioforms");
      case "dance": return t("Dance");
      case "symbol": return t("symbol_symbols");
      case "cooking": return t("Gourmet");
      case "tinkerer-alchemy": return t("Alchemy");
      case "tinkerer-infusion": return t("Infusion");
      case "tinkerer-magitech": return t("Magitech");
      default: return t(spellType || "System");
    }
  };
  const listNames = (items = [], nameKey = "name", customKey = "customName") =>
    items
      .map((item) => (item?.[customKey] || (item?.[nameKey] ? t(item[nameKey]) : "")))
      .filter(Boolean);

  const getSystemSpellSummary = (spell) => {
    if (!spell) return "";
    if (spell.spellType === "pilot-vehicle") {
      const vehicles = spell.vehicles || [];
      const activeVehicle = vehicles.find((v) => v.enabled) || null;
      if (!activeVehicle) return `${t("Vehicles")}: ${vehicles.length}`;
      const vehicleName = activeVehicle.customName || t(activeVehicle.name || "pilot_vehicle");
      const frameName = t(activeVehicle.frame || "pilot_frame_exoskeleton");
      const modules = activeVehicle.modules || [];
      const enabledModules = modules.filter((m) => m.enabled);
      const enabledNames = enabledModules
        .map((m) => m.customName || t(m.name || ""))
        .filter(Boolean);
      const otherNames = modules
        .filter((m) => !m.enabled)
        .map((m) => m.customName || t(m.name || ""))
        .filter(Boolean);
      const enabledText = enabledNames.length ? `${t("Active")}: ${enabledNames.join(", ")}` : `${t("Active")}: -`;
      const othersText = otherNames.length ? ` - ${t("Others")}: ${otherNames.join(", ")}` : "";
      return `${vehicleName} [${frameName}] - ${t("Modules")}: ${enabledModules.length}/${modules.length} - ${enabledText}${othersText}`;
    }
    if (spell.spellType === "magiseed") {
      const seeds = spell.magiseeds || [];
      const current = spell.currentMagiseed;
      const currentName = current ? (current.customName || t(current.name || "")) : t("magiseed_no_magiseed");
      const otherSeeds = seeds
        .filter((seed) => {
          if (!current) return true;
          const seedName = seed?.customName || seed?.name || "";
          const currentSeedName = current?.customName || current?.name || "";
          return seedName !== currentSeedName;
        })
        .map((seed) => seed.customName || t(seed.name || ""))
        .filter(Boolean);
      const othersText = otherSeeds.length ? ` - ${t("Others")}: ${otherSeeds.join(", ")}` : "";
      return `${t("Current")}: ${currentName}${othersText}`;
    }
    if (spell.spellType === "deck") {
      const cardsInDeck = spell.cardsInDeck ?? spell.fullDeck?.length ?? 0;
      const hand = spell.hand?.length || 0;
      const discard = spell.discardPile?.length || 0;
      return `${t("Deck")}: ${cardsInDeck} - ${t("Hand")}: ${hand} - ${t("Discard")}: ${discard}`;
    }
    if (spell.spellType === "invocation") {
      const wells = spell.activeWellsprings || [];
      const inner = spell.innerWellspring ? ` + ${spell.chosenWellspring || ""}` : "";
      return `${t("Wellsprings")}: ${wells.join(", ") || "-"}${inner}`;
    }
    if (spell.spellType === "gift") {
      const gifts = listNames(spell.gifts);
      return gifts.length ? gifts.join(", ") : t("No gifts available");
    }
    if (spell.spellType === "therioform") {
      const forms = listNames(spell.therioforms);
      return forms.length ? forms.join(", ") : t("No therioforms available");
    }
    if (spell.spellType === "dance") {
      const dances = listNames(spell.dances);
      return dances.length ? dances.join(", ") : t("dance_empty_dances");
    }
    if (spell.spellType === "symbol") {
      const symbols = listNames(spell.symbols);
      return symbols.length ? symbols.join(", ") : t("symbol_empty_symbols");
    }
    if (spell.spellType === "cooking") {
      return `${t("Effects")}: ${spell.cookbookEffects?.length || 0}`;
    }
    if (spell.spellType?.startsWith("tinkerer-")) {
      const counts = [
        spell.effects?.length || 0,
        spell.options?.length || 0,
        spell.targets?.length || 0,
      ];
      const maxCount = Math.max(...counts);
      return maxCount > 0 ? `${t("Entries")}: ${maxCount}` : t("Configured");
    }
    return t("Configured");
  };

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
            px: { xs: 1, sm: 2 },
            py: { xs: 0.75, sm: 1, md: 1.2 },
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography
            color="#fff"
            fontFamily="Antonio"
            fontSize={{ xs: "1.15rem", sm: "1.5rem", md: "1.7rem", lg: "1.85rem" }}
            fontWeight="medium"
            sx={{ textTransform: "uppercase" }}
          >
            {player.name}
          </Typography>
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
          <Typography fontFamily="Antonio" fontSize={{ xs: "0.96rem", sm: "1.25rem", md: "1.35rem", lg: "1.45rem" }} fontWeight="medium" sx={{ textTransform: "uppercase" }}>
            {player.info.pronouns && <>{player.info.pronouns} <Diamond color={primary} />{" "}</>}
            {t("Lvl")} {player.lvl}
          </Typography>
        </Box>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(80px, 32%) 1fr", sm: "minmax(140px, 35%) 1fr", md: "minmax(170px, 34%) 1fr", lg: "minmax(200px, 32%) 1fr" }, alignItems: "stretch" }}>

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
                    fontSize: { xs: "0.62rem", sm: "0.7rem", md: "0.78rem" },
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

          {/* Attributes (always 2x2) */}
          <Box
            sx={{
              display: "grid",
              mt: "auto",
              pt: 0.75,
              borderTop: `0.5px solid ${theme.palette.divider}`,
              width: "100%",
              minWidth: 0,
              gridTemplateColumns: "1fr 1fr",
              gap: "6px",
              px: 0.25,
              pb: 0.75,
            }}
          >
            {ATTRIBUTES.map(({ key, label, curr }) => (
              <Box
                key={`grid-${key}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: { xs: 28, md: 34, lg: 38 },
                  background: theme.palette.background.default,
                  border: `0.5px solid ${theme.palette.divider}`,
                  borderRadius: "6px",
                  px: { xs: 0.75, md: 1 },
                  py: { xs: 0.5, md: 0.65 },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Antonio'",
                    fontWeight: "bold",
                    fontSize: { xs: "0.68rem", md: "0.76rem", lg: "0.84rem" },
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    letterSpacing: "0.04em",
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Antonio', fantasy, sans-serif",
                    fontSize: { xs: "0.78rem", md: "0.9rem", lg: "0.98rem" },
                    fontWeight: "bold",
                    color: getAttributeColor(player.attributes[key], curr),
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  d{curr}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right column */}
        <Box sx={{ display: "flex", flexDirection: "column", p: { xs: 0.5, sm: 1, md: 1.25, lg: 1.5 }, gap: { xs: 0.75, sm: 1, md: 1.2, lg: 1.4 }, minWidth: 0 }}>

          {/* Traits */}
          <Box sx={{ border: `0.5px solid ${theme.palette.divider}`, borderRadius: "6px", overflow: "hidden" }}>
            <Box sx={{ background: primary, px: 1, py: "2px" }}>
              <Typography sx={{ color: custom.white, fontFamily: "Antonio", fontSize: { xs: "0.85rem", sm: "1rem", md: "1.08rem", lg: "1.16rem" }, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {t("Traits")}
              </Typography>
            </Box>
            <Box sx={{ px: { xs: 1, md: 1.25 }, py: { xs: "5px", md: "8px" }, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: { xs: "2px 8px", md: "6px 12px" } }}>
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography sx={{ fontFamily: "Antonio", fontSize: { xs: "0.85rem", sm: "0.9rem", md: "0.96rem", lg: "1rem" }, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <strong>{t("Identity")}: </strong>
                  {player.info.identity && player.info.identity.length > 40
                    ? player.info.identity.slice(0, 40) + "…"
                    : player.info.identity}
                </Typography>
              </Box>
              <Typography sx={{ fontFamily: "Antonio", fontSize: { xs: "0.85rem", sm: "0.9rem", md: "0.96rem", lg: "1rem" }, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <strong>{t("Theme")}: </strong>
                {t(player.info.theme)?.length > 18 ? t(player.info.theme).slice(0, 18) + "…" : t(player.info.theme)}
              </Typography>
              <Typography sx={{ fontFamily: "Antonio", fontSize: { xs: "0.85rem", sm: "0.9rem", md: "0.96rem", lg: "1rem" }, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <strong>{t("Origin")}: </strong>
                {player.info.origin?.length > 18 ? player.info.origin.slice(0, 18) + "…" : player.info.origin}
              </Typography>
            </Box>
          </Box>

          {/* Loadout card */}
          <Box
            sx={{
              display: "flex",
              flex: { xs: 1, [loadoutBreakpoint]: "0 0 auto" },
              minHeight: 0,
              pt: 0.25,
              width: "100%",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <Box sx={{ border: `0.5px solid ${theme.palette.divider}`, borderRadius: "6px", overflow: "hidden", width: "100%", display: "flex", flexDirection: "column" }}>
              <Box sx={{ background: primary, px: 1, py: "2px" }}>
                <Typography sx={{ color: custom.white, fontFamily: "Antonio", fontSize: { xs: "0.85rem", sm: "1rem", md: "1.08rem", lg: "1.16rem" }, textTransform: "uppercase", letterSpacing: "0.08em" }}>
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
                  isEditMode={false}
                  showHeader={false}
                  showSideDivider={false}
                  showSupportColumn
                />
              </Box>
            </Box>
          </Box>

          {/* DEF / MDEF / INIT */}
          <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1, md: 1.25, lg: 1.5 }, flexWrap: "wrap" }}>
            <CombatStat theme={theme} label={t("DEF")} icon={<DefIcon size="18px" color={isDark ? "white" : "black"} />} value={currDef} />
            <CombatStat theme={theme} label={t("M.DEF")} icon={<MdefIcon size="18px" color={isDark ? "white" : "black"} />} value={currMDef} />
            <CombatStat theme={theme} label={t("INIT")} icon={<InitIcon size="18px" color={isDark ? "white" : "black"} />} value={(currInit > 0 ? "+" : "") + currInit} />
          </Box>
        </Box>

      </Box>

      {isExpanded && (
        <Box
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            p: { xs: 0.5, sm: 1, md: 1.25 },
            display: "flex",
            flexDirection: "column",
            gap: { xs: 0.75, sm: 1 },
          }}
        >
          <Box sx={{ border: `0.5px solid ${theme.palette.divider}`, borderRadius: "6px", overflow: "hidden" }}>
            <Box sx={{ background: primary, px: 1, py: "2px" }}>
              <Typography sx={{ color: custom.white, fontFamily: "Antonio", fontSize: { xs: "0.85rem", sm: "1rem", md: "1.08rem" }, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {t("Description")}
              </Typography>
            </Box>
            <Box sx={{ px: 1, py: { xs: "6px", sm: "8px" } }}>
              <Typography
                sx={{
                  fontFamily: "Antonio",
                  fontSize: { xs: "0.82rem", sm: "0.92rem", md: "0.98rem" },
                  lineHeight: 1.45,
                  whiteSpace: "pre-line",
                  color: hasDescription ? theme.palette.text.primary : theme.palette.text.secondary,
                  fontStyle: hasDescription ? "normal" : "italic",
                }}
              >
                {hasDescription ? player.info.description : t("No description")}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ border: `0.5px solid ${theme.palette.divider}`, borderRadius: "6px", overflow: "hidden" }}>
            <Box sx={{ background: primary, px: 1, py: "2px" }}>
              <Typography sx={{ color: custom.white, fontFamily: "Antonio", fontSize: { xs: "0.85rem", sm: "1rem", md: "1.08rem" }, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {t("Classes")}
              </Typography>
            </Box>
            <Box sx={{ px: 1, py: { xs: "6px", sm: "8px" }, display: "flex", flexDirection: "column", gap: "6px" }}>
              {visibleClasses.length === 0 && (
                <Typography sx={{ fontFamily: "Antonio", fontSize: { xs: "0.82rem", sm: "0.92rem" }, color: theme.palette.text.secondary, fontStyle: "italic" }}>
                  {t("No classes")}
                </Typography>
              )}
              {visibleClasses.map((c, idx) => {
                const skills = (c.skills || []).filter((s) => (s.currentLvl || 0) > 0);
                const visibleSpells = (c.spells || []).filter((sp) => sp && sp.showInPlayerSheet !== false);
                const spells = visibleSpells.filter((sp) => !NON_STATIC_SPELL_TYPES.has(sp.spellType));
                const systemSpells = visibleSpells.filter((sp) => NON_STATIC_SPELL_TYPES.has(sp.spellType));
                const heroicName = c.heroic?.name ? (c.isHomebrew === undefined ? t(c.heroic.name) : c.heroic.name) : "";
                return (
                  <Box
                    key={`${c.name}-${idx}`}
                    sx={{
                      border: `0.5px solid ${theme.palette.divider}`,
                      borderRadius: "6px",
                      p: "6px",
                      background: theme.palette.background.default,
                    }}
                  >
                    <Typography sx={{ fontFamily: "Antonio", fontWeight: 700, fontSize: { xs: "0.82rem", sm: "0.94rem" }, textTransform: "uppercase" }}>
                      {(c.isHomebrew === undefined ? t(c.name) : c.name)} ({t("Lvl")} {c.lvl || 0})
                    </Typography>
                    {skills.length > 0 && (
                      <Typography sx={{ mt: "2px", fontFamily: "Antonio", fontSize: { xs: "0.78rem", sm: "0.88rem" }, lineHeight: 1.3 }}>
                        <strong>{t("Skills")}:</strong>{" "}
                        {skills.map((s) => `${(c.isHomebrew === undefined ? t(s.skillName) : s.skillName)} (SL${s.currentLvl || 0})`).join(", ")}
                      </Typography>
                    )}
                    {heroicName && (
                      <Typography sx={{ mt: "2px", fontFamily: "Antonio", fontSize: { xs: "0.78rem", sm: "0.88rem" }, lineHeight: 1.3 }}>
                        <strong>{t("Heroic Skill")}:</strong> {heroicName}
                      </Typography>
                    )}
                    {spells.length > 0 && (
                      <Typography sx={{ mt: "2px", fontFamily: "Antonio", fontSize: { xs: "0.78rem", sm: "0.88rem" }, lineHeight: 1.3 }}>
                        <strong>{t("Spells")}:</strong>{" "}
                        {spells.map((sp) => getSpellLabel(sp)).join(", ")}
                      </Typography>
                    )}
                    {systemSpells.length > 0 && (
                      <Box sx={{ mt: "2px", display: "flex", flexDirection: "column", gap: "2px" }}>
                        {systemSpells.map((sp, sysIdx) => (
                          <Typography key={`${sp.spellType}-${sysIdx}`} sx={{ fontFamily: "Antonio", fontSize: { xs: "0.78rem", sm: "0.88rem" }, lineHeight: 1.3, whiteSpace: "normal", overflowWrap: "anywhere" }}>
                            <strong>{getSystemSpellLabel(sp.spellType)}:</strong> {getSystemSpellSummary(sp)}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}

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
