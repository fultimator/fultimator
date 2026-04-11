import React from "react";
import {
  Box, Card, Stack, Grid, Typography, Chip,
  Accordion, AccordionSummary, AccordionDetails, Divider,
} from "@mui/material";
import Clock from "../player/playerSheet/Clock";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { styled } from "@mui/system";
import { useTranslate } from "../../translation/translate";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { Martial } from "../icons";
import { OpenBracket, CloseBracket } from "../Bracket";
import Diamond from "../Diamond";
import attributes from "../../libs/attributes";
import types from "../../libs/types";
import { spellList, tinkererAlchemy, tinkererInfusion, arcanumList } from "../../libs/classes";
import { calculateCustomWeaponStats } from "../player/common/playerCalculations";
import { availableFrames, availableModules } from "../../libs/pilotVehicleData";
import { magiseeds } from "../../libs/floralistMagiseedData";
import { getDelicacyEffects } from "../../libs/gourmetCookingData";
import { availableGifts } from "../player/spells/SpellGiftGiftsModal";
import { availableDances } from "../player/spells/SpellDancerDancesModal";
import { availableTherioforms } from "../player/spells/SpellMutantTherioformsModal";
import { availableTones } from "../player/spells/SpellChanterTonesModal";
import { availableSymbols } from "../player/spells/SpellSymbolistSymbolsModal";
import { invocationsByWellspring } from "../player/spells/SpellInvokerInvocationsModal";

// ---------------------------------------------------------------------------
// Spell type description keys (per-character types have no static list)
// ---------------------------------------------------------------------------

const SPELL_TYPE_DESC_KEYS = {
  dance:             ["dance_details_1"],
  symbol:            ["symbol_details_1"],
  magichant:         ["magichant_details_1", "magichant_details_2", "magichant_details_3", "magichant_details_4"],
  cooking:           ["Cooking_desc"],
  invocation:        ["Invocation_desc"],
  "pilot-vehicle":   ["pilot_details_1"],
  magiseed:          ["magiseed_details_1"],
  gift:              [],
  therioform:        [],
  deck:              [],
  arcanist:          [],
  "arcanist-rework": [],
  "tinkerer-alchemy":  [],
  "tinkerer-infusion": [],
  "tinkerer-magitech": [],
  gamble:            [],
};

// ---------------------------------------------------------------------------
// Styled markdown (defined once outside components to avoid re-creation)
// ---------------------------------------------------------------------------

const _StyledMarkdown = styled(ReactMarkdown)({
  "& ul, & ol": { paddingLeft: "1.5em", margin: 0, marginTop: "0.25em", marginBottom: "0.25em" },
  "& p": { margin: 0, marginTop: "0.25em", marginBottom: "0.25em" },
  "& ul": { listStyle: "disc" },
  "& ol": { listStyle: "decimal" },
  "& li": { display: "list-item" },
});
export const StyledMarkdown = ({ remarkPlugins = [], children, ...props }) => (
  <_StyledMarkdown remarkPlugins={[remarkBreaks, ...remarkPlugins]} {...props}>
    {typeof children === "string" ? children.replace(/\\n/g, "\n") : children}
  </_StyledMarkdown>
);

// ---------------------------------------------------------------------------
// WeaponCard
// ---------------------------------------------------------------------------

export const WeaponCard = React.memo(function WeaponCard({ weapon, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const attr1 = attributes[weapon.att1];
  const attr2 = attributes[weapon.att2];
  const dmgType = types[weapon.type];

  return (
    <Card id={id} elevation={1}>
      <Stack>
        {/* Header */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          onClick={onHeaderClick}
          sx={{
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            "& .MuiTypography-root": {
              fontSize: "0.9rem",
              textTransform: "uppercase",
            },
          }}
        >
          <Grid item xs={4}>
            <Typography variant="h4">{t("Weapon")}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h4" textAlign="center">
              {t("Cost")}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">
              {t("Accuracy")}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">
              {t("Damage")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + stats */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid item xs={4} sx={{ display: "flex", alignItems: "center" }}>
            <Typography fontWeight="bold" sx={{ mr: 0.5 }}>
              {t(weapon.name)}
            </Typography>
            {weapon.martial && <Martial />}
          </Grid>
          <Grid item xs={2}>
            <Typography textAlign="center">{`${weapon.cost}z`}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography fontWeight="bold" textAlign="center">
              <OpenBracket />
              {attr1?.shortcaps} + {attr2?.shortcaps}
              <CloseBracket />
              {weapon.prec > 0 ? `+${weapon.prec}` : ""}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography fontWeight="bold" textAlign="center">
              <OpenBracket />
              {t("HR +")} {weapon.damage}
              <CloseBracket />
              {dmgType?.long}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 2 – category / hands / range */}
        <Grid
          container
          justifyContent="space-between"
          sx={{
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid item xs={4}>
            <Typography fontWeight="bold">{t(weapon.category)}</Typography>
          </Grid>
          <Grid item xs={1}>
            <Diamond color={customTheme.primary} />
          </Grid>
          <Grid item xs={3}>
            <Typography textAlign="center">
              {weapon.hands === 1 ? t("One-handed") : t("Two-handed")}
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <Diamond color={customTheme.primary} />
          </Grid>
          <Grid item xs={3}>
            <Typography textAlign="center">
              {weapon.melee ? t("Melee") : t("Ranged")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 3 – quality */}
        <Box>
          <Typography variant="body2">
            {!weapon.quality ? (
              ""
            ) : (
              <StyledMarkdown
                allowedElements={["strong", "em"]}
                unwrapDisallowed
                 sx={{ px: 1, py: 0.75 }}
              >
                {weapon.quality}
              </StyledMarkdown>
            )}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// ArmorCard  (handles both Armor and Shield)
// ---------------------------------------------------------------------------

function getArmorDefDisplay(armor, t) {
  if (armor.category === "Shield") {
    const bonus = armor.defbonus !== undefined ? armor.defbonus : armor.def;
    return `+${bonus}`;
  }
  if (armor.martial) return `${armor.def}`;
  const bonus = armor.defbonus !== undefined ? armor.defbonus : 0;
  return bonus === 0 ? t("DEX die") : `${t("DEX die")} +${bonus}`;
}

function getArmorMDefDisplay(armor, t) {
  if (armor.category === "Shield") {
    const bonus = armor.mdefbonus !== undefined ? armor.mdefbonus : armor.mdef;
    return `+${bonus}`;
  }
  const bonus = armor.mdefbonus !== undefined ? armor.mdefbonus : 0;
  return bonus === 0 ? t("INS die") : `${t("INS die")} +${bonus}`;
}

export const ArmorCard = React.memo(function ArmorCard({ armor, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  return (
    <Card id={id} elevation={1}>
      <Stack>
        {/* Header */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          onClick={onHeaderClick}
          sx={{
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            "& .MuiTypography-root": {
              fontSize: "0.9rem",
              textTransform: "uppercase",
            },
          }}
        >
          <Grid item xs={3}>
            <Typography variant="h4">{t(armor.category)}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h4" textAlign="center">
              {t("Cost")}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h4" textAlign="center">
              {t("Defense")}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">
              {t("M. Defense")}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h4" textAlign="center">
              {t("Init.")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + stats */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid item xs={3} sx={{ display: "flex", alignItems: "center" }}>
            <Typography fontWeight="bold" sx={{ mr: 0.5 }}>
              {t(armor.name)}
            </Typography>
            {armor.martial && <Martial />}
          </Grid>
          <Grid item xs={2}>
            <Typography textAlign="center">{`${armor.cost}z`}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography fontWeight="bold" textAlign="center">
              {getArmorDefDisplay(armor, t)}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography fontWeight="bold" textAlign="center">
              {getArmorMDefDisplay(armor, t)}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography fontWeight="bold" textAlign="center">
              {armor.init === 0 ? "—" : armor.init}
            </Typography>
          </Grid>
        </Grid>

        {/* quality row (optional) */}
        {armor.quality && (
          <Box sx={{ px: 1, py: 0.75 }}>
            <Typography variant="body2">
              <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                {armor.quality}
              </StyledMarkdown>
            </Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// SpellCard
// ---------------------------------------------------------------------------

export const SpellCard = React.memo(function SpellCard({ spell, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const attr1 = attributes[spell.attr1];
  const attr2 = attributes[spell.attr2];

  return (
    <Card id={id} elevation={1}>
      <Stack>
        {/* Header */}
        <Grid
          container
          alignItems="center"
          onClick={onHeaderClick}
          sx={{
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            "& .MuiTypography-root": {
              fontSize: "0.9rem",
              textTransform: "uppercase",
            },
          }}
        >
          <Grid item xs={4}>
            <Typography variant="h4">{t("Spell")}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h4" textAlign="center">
              {t("MP")}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">
              {t("Duration")}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">
              {t("Target")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + cost + duration + target */}
        <Grid
          container
          alignItems="center"
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid item xs={4}>
            <Typography fontWeight="bold">{t(spell.name)}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography textAlign="center">{spell.mp}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography textAlign="center">{spell.duration}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography textAlign="center">{spell.target}</Typography>
          </Grid>
        </Grid>

        {/* Row 2 – accuracy (if applicable) */}
        {/* {attr1 && attr2 && (
          <Grid
            container
            alignItems="center"
            sx={{
              borderBottom: `1px solid ${customTheme.secondary}`,
              px: 1,
              py: "4px",
            }}
          >
            <Grid item xs={12}>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="right"
                fontWeight="bold"
              >
                {attr1.shortcaps} + {attr2.shortcaps}
              </Typography>
            </Grid>
          </Grid>
        )} */}

        {/* Effect */}
        {/* <Box sx={{ px: 1, py: 0.75 }}>
          <Typography variant="body2">{spell.effect}</Typography>
        </Box> */}

          <Box sx={{ px: 1, py: 0.75 }}>
            <Typography variant="body2">
              <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                {spell.effect}
              </StyledMarkdown>
            </Typography>
          </Box>
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// PlayerSpellCard
// ---------------------------------------------------------------------------

export const PlayerSpellCard = React.memo(function PlayerSpellCard({ spell, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const attr1 = attributes[spell.attr1];
  const attr2 = attributes[spell.attr2];

  return (
    <Card id={id} elevation={1}>
      <Stack>
        {/* Header */}
        <Grid
          container
          alignItems="center"
          onClick={onHeaderClick}
          sx={{
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            "& .MuiTypography-root": {
              fontSize: "0.9rem",
              textTransform: "uppercase",
            },
          }}
        >
          <Grid item xs={4}>
            <Typography variant="h4">{t("Spell")}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h4" textAlign="center">{t("MP")}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">{t("Duration")}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">{t("Target")}</Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + mp + duration + target */}
        <Grid
          container
          alignItems="center"
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid item xs={4}>
            <Typography fontWeight="bold">{t(spell.name)}</Typography>
            <Typography variant="caption" color="text.secondary">
              {spell.class}{attr1 && attr2 ? ` · ${attr1.shortcaps}+${attr2.shortcaps}` : ""}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography textAlign="center">{spell.mp}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography textAlign="center">{t(spell.duration)}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography textAlign="center">{t(spell.targetDesc)}</Typography>
          </Grid>
        </Grid>

        {/* Row 2 – accuracy (if applicable) */}
        {/* {attr1 && attr2 && (
          <Grid
            container
            alignItems="center"
            sx={{
              borderBottom: `1px solid ${customTheme.secondary}`,
              px: 1,
              py: "4px",
            }}
          >
            <Grid item xs={12}>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="right"
                fontWeight="bold"
              >
                <OpenBracket />{attr1.shortcaps} + {attr2.shortcaps}<CloseBracket />
              </Typography>
            </Grid>
          </Grid>
        )} */}

        {/* Description */}
        <Box sx={{ px: 1, py: 0.75 }}>
          <Typography variant="body2">
            <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
              {t(spell.description)}
            </StyledMarkdown>
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// NonStaticSpellCard
// ---------------------------------------------------------------------------

export const NonStaticSpellCard = React.memo(function NonStaticSpellCard({ item, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const md = (text) => (
    <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>{text || ""}</StyledMarkdown>
  );

  const renderBody = () => {
    switch (item.spellType) {
      case "gift":
        return (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mb: 0.5 }}>
              {md(t(item.event))}
            </Typography>
            <Typography variant="body2" color="text.secondary">{md(t(item.effect))}</Typography>
          </>
        );
      case "dance":
        return (
          <>
            {item.duration && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                <strong>{t("Duration")}:</strong> {t(item.duration)}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">{md(t(item.effect))}</Typography>
          </>
        );
      case "therioform":
        return (
          <>
            {item.genoclepsis && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mb: 0.5 }}>
                {md(t(item.genoclepsis))}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">{md(t(item.description))}</Typography>
          </>
        );
      case "magichant":
      case "symbol":
        return <Typography variant="body2" color="text.secondary">{md(t(item.effect))}</Typography>;
      case "invocation":
        return (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              {item.wellspring && (
                <Chip label={item.wellspring} size="small" variant="outlined"
                  sx={{ fontSize: "0.65rem", height: 18 }} />
              )}
              {item.type && (
                <Chip label={item.type} size="small" variant="outlined"
                  sx={{ fontSize: "0.65rem", height: 18 }} />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">{md(t(item.effect))}</Typography>
          </>
        );
      case "magiseed":
        return (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{md(t(item.description))}</Typography>
            {Array.from({ length: item.rangeEnd - item.rangeStart + 1 }, (_, j) => {
              const tier = item.rangeStart + j;
              const effect = item.effects?.[tier];
              return effect ? (
                <Box key={tier} sx={{ display: "flex", gap: 1, mb: 0.25 }}>
                  <Typography variant="caption" fontWeight="bold" color={customTheme.primary}
                    sx={{ minWidth: 22, flexShrink: 0, pt: "1px" }}>
                    T{tier}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{md(t(effect))}</Typography>
                </Box>
              ) : null;
            })}
          </>
        );
      case "arcanist":
      case "arcanist-rework":
        return (
          <Stack divider={<Divider />}>
            {item.domainDesc && (
              <Box>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.25 }}>
                  {item.domain ? t(item.domain) : t("Domain")}
                </Typography>
                <Typography variant="body2" color="text.secondary">{md(t(item.domainDesc))}</Typography>
              </Box>
            )}
            {item.mergeDesc && (
              <Box>
                <Typography variant="body2" fontWeight="bold" sx={{ textTransform: "uppercase", mb: 0.25 }}>
                  {item.merge ? t(item.merge) : t("Merge")}
                </Typography>
                <Typography variant="body2" color="text.secondary">{md(t(item.mergeDesc))}</Typography>
              </Box>
            )}
            {item.pulseDesc && (
              <Box>
                <Typography variant="body2" fontWeight="bold" sx={{ textTransform: "uppercase", mb: 0.25 }}>
                  {item.pulse ? t(item.pulse) : t("Pulse")}
                </Typography>
                <Typography variant="body2" color="text.secondary">{md(t(item.pulseDesc))}</Typography>
              </Box>
            )}
            {item.dismissDesc && (
              <Box>
                <Typography variant="body2" fontWeight="bold" sx={{ textTransform: "uppercase", mb: 0.25 }}>
                  {item.dismiss ? t(item.dismiss) : t("Dismiss")}
                </Typography>
                <Typography variant="body2" color="text.secondary">{md(t(item.dismissDesc))}</Typography>
              </Box>
            )}
          </Stack>
        );
      case "tinkerer-alchemy":
        return (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: "bold" }}>
              {item.category}
            </Typography>
            <Typography variant="body2" color="text.secondary">{md(item.effect)}</Typography>
          </>
        );
      case "tinkerer-infusion":
        return (
          <>
            {item.infusionRank && (
              <Typography variant="caption" color="text.secondary">Rank {item.infusionRank}</Typography>
            )}
            <Typography variant="body2" color="text.secondary">{md(item.effect ?? item.description ?? "")}</Typography>
          </>
        );
      case "pilot-vehicle":
        if (item.pilotSubtype === "frame" || item.passengers != null) return (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: "bold", display: "block", mb: 0.25 }}>
              {t(item.frame ?? "")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("Passengers")}: {item.passengers ?? "—"} · {t("Distance")}: {item.distance ?? "—"}
            </Typography>
            {item.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{md(t(item.description))}</Typography>}
          </>
        );
        if (item.pilotSubtype === "armor" || item.def != null) return (
          <>
            <Typography variant="caption" color="text.secondary">
              DEF {item.def ?? "—"} · MDEF {item.mdef ?? "—"}{item.martial ? " · Martial" : ""}
              {item.cost ? ` · ${item.cost}z` : ""}
            </Typography>
            {item.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{md(item.description)}</Typography>}
          </>
        );
        if (item.pilotSubtype === "weapon" || item.damage != null) return (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {[item.category, item.att1 && item.att2 ? `${item.att1}+${item.att2}` : null].filter(Boolean).join(" · ")}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {[`HR+${item.damage ?? 0}`, item.damageType, item.range,
                item.prec ? `+${item.prec} acc` : null,
                item.cumbersome ? "Cumbersome" : null,
                item.isShield ? "Shield" : null,
              ].filter(Boolean).join(" · ")}
            </Typography>
            {item.quality && <Typography variant="caption" color="text.secondary">{item.quality}</Typography>}
            {item.cost ? <Typography variant="caption" color="text.secondary"> · {item.cost}z</Typography> : null}
          </>
        );
        // support module
        return item.description
          ? <Typography variant="body2" color="text.secondary">{md(t(item.description))}</Typography>
          : null;
      case "cooking":
        if (item.cookbookEffects?.length) {
          return (
            <>
              {item.cookbookEffects.map((entry) =>
                entry.effect ? (
                  <Box key={entry.id} sx={{ display: "flex", gap: 1, mb: 0.25 }}>
                    <Typography variant="caption" fontWeight="bold" color={customTheme.primary}
                      sx={{ minWidth: 22, flexShrink: 0, pt: "1px" }}>
                      {entry.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{md(entry.effect)}</Typography>
                  </Box>
                ) : null
              )}
            </>
          );
        }
        return <Typography variant="body2" color="text.secondary">{md(item.effect ?? "")}</Typography>;
      default:
        return null;
    }
  };

  const typeLabel = {
    gift: "Gift",
    dance: "Dance",
    therioform: "Therioform",
    magichant: "Tone",
    symbol: "Symbol",
    invocation: "Invocation",
    magiseed: "Magiseed",
    arcanist: "Arcanum",
    "arcanist-rework": "Arcanum",
    "tinkerer-alchemy": "Alchemy",
    "tinkerer-infusion": "Infusion",
    "pilot-vehicle": item.pilotSubtype === "frame" ? "Vehicle Frame"
      : item.pilotSubtype === "armor" ? "Armor Module"
      : item.pilotSubtype === "weapon" ? "Weapon Module"
      : item.pilotSubtype === "support" ? "Support Module"
      : "Pilot Vehicle",
    cooking: "Delicacy",
  }[item.spellType] ?? item.spellType;

  return (
    <Card id={id} elevation={1}>
      <Stack>
        <Box
          onClick={onHeaderClick}
          sx={{
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="inherit" sx={{ textTransform: "uppercase", fontWeight: "bold" }}>
            {t(typeLabel)}
          </Typography>
        </Box>
        <Box
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Typography fontWeight="bold">{t(item.name)}</Typography>
        </Box>
        <Box sx={{ px: 1, py: 0.75 }}>
          {renderBody()}
        </Box>
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// AttackCard
// ---------------------------------------------------------------------------

export const AttackCard = React.memo(function AttackCard({ attack, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const attr1 = attributes[attack.attr1];
  const attr2 = attributes[attack.attr2];
  const dmgType = types[attack.type];

  return (
    <Card id={id} elevation={1}>
      <Stack>
        {/* Header */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          onClick={onHeaderClick}
          sx={{
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            "& .MuiTypography-root": {
              fontSize: "0.9rem",
              textTransform: "uppercase",
            },
          }}
        >
          <Grid item xs={3}>
            <Typography variant="h4">{t(attack.category)}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">
              {t("Accuracy")}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">
              {t("Damage")}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">
              {t("Range")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 1 – stats */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{
            background,
            px: 1,
            py: "5px",
          }}
        >
          <Grid item xs={3} sx={{ display: "flex", alignItems: "center" }}>
            <Typography fontWeight="bold" sx={{ mr: 0.5 }}>
              {t(attack.name)}
            </Typography>
            {attack.martial && <Martial />}
          </Grid>
          <Grid item xs={3}>
            <Typography fontWeight="bold" textAlign="center">
              {attr1 && attr2 ? (
                <>
                  <OpenBracket />
                  {attr1.shortcaps} + {attr2.shortcaps}
                  <CloseBracket />
                  {attack.flathit > 0 ? `+${attack.flathit}` : ""}
                </>
              ) : (
                "—"
              )}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography fontWeight="bold" textAlign="center">
              <OpenBracket />
              HR + {attack.flatdmg}
              <CloseBracket />
              {dmgType?.long}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography textAlign="center">{t(attack.range)}</Typography>
          </Grid>
        </Grid>

        {/* Special row */}
        {attack.special?.length > 0 && (
          <Grid container sx={{ px: 1, py: "4px" }}>
            <Grid item xs={12}>
              <Typography variant="body2">
                <strong>{t("Special")}:</strong>{" "}
                {attack.special.join("; ")}
              </Typography>
            </Grid>
          </Grid>
        )}
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// QualityCard
// ---------------------------------------------------------------------------

export const QualityCard = React.memo(function QualityCard({ quality, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const background2 = customTheme.mode === 'dark' ? `black` : `white`;

  return (
    <Card id={id} elevation={1}>
      <Stack>
        {/* Header */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          onClick={onHeaderClick}
          sx={{
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            "& .MuiTypography-root": {
              fontSize: "0.9rem",
              textTransform: "uppercase",
            },
          }}
        >
          <Grid item xs={8}>
            <Typography variant="h4">{t("Quality")}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h4" textAlign="center">
              {t("Cost")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + cost */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid item xs={8}>
            <Typography fontWeight="bold">{t(quality.name)}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography textAlign="center">{`${quality.cost}z`}</Typography>
          </Grid>
        </Grid>

        {/* Row 2 – category and filter */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{
            backgroundColor: background2,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid item>
            <Typography variant="body2" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
              {t(quality.category)}
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {quality.filter?.map((f) => (
                <Chip key={f} label={t(f)} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Effect */}
        <Box sx={{ px: 1, py: 0.75 }}>
          <Typography variant="body2">
             <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                {t(quality.quality)}
              </StyledMarkdown>
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// Per-character spell-type content renderer (internal)
// ---------------------------------------------------------------------------

function renderSpellTypeContent(sc, t, customTheme) {
  const border = { borderTop: `1px solid ${customTheme.secondary}` };
  const itemSx = { ...border, px: 2, py: 0.75 };
  const sectionHeaderSx = {
    ...border, px: 2, py: 0.5,
    backgroundColor: `${customTheme.primary}11`,
  };
  const captionHeader = (label) => (
    <Typography variant="caption" fontWeight="bold" color="text.secondary"
      sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </Typography>
  );
  const md = (text) => (
    <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>{text}</StyledMarkdown>
  );

  switch (sc) {

    case "gift":
      return availableGifts
        .filter(g => !g.name.includes("_custom_"))
        .map((g, i) => (
          <Box key={i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, mb: 0.25, flexWrap: "wrap" }}>
              <Typography variant="body2" fontWeight="bold">{t(g.name)}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                {md(t(g.event))}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">{md(t(g.effect))}</Typography>
          </Box>
        ));

    case "dance":
      return availableDances
        .filter(d => !d.name.includes("_custom_"))
        .map((d, i) => (
          <Box key={i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
              <Typography variant="body2" fontWeight="bold">{t(d.name)}</Typography>
              {d.duration && (
                <Typography variant="caption" color="text.secondary">· {t(d.duration)}</Typography>
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">{md(t(d.effect))}</Typography>
          </Box>
        ));

    case "therioform":
      return availableTherioforms
        .filter(tf => !tf.name.includes("_custom_"))
        .map((tf, i) => (
          <Box key={i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, mb: 0.25, flexWrap: "wrap" }}>
              <Typography variant="body2" fontWeight="bold">{t(tf.name)}</Typography>
              {tf.genoclepsis && (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                  {md(t(tf.genoclepsis))}
                </Typography>
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">{md(t(tf.description))}</Typography>
          </Box>
        ));

    case "magichant":
      return availableTones
        .filter(tone => !tone.name.includes("_custom_"))
        .map((tone, i) => (
          <Box key={i} sx={itemSx}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.25 }}>{t(tone.name)}</Typography>
            <Typography variant="body2" color="text.secondary">{md(t(tone.effect))}</Typography>
          </Box>
        ));

    case "symbol":
      return availableSymbols
        .filter(s => !s.name.includes("_custom_"))
        .map((s, i) => (
          <Box key={i} sx={itemSx}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.25 }}>{t(s.name)}</Typography>
            <Typography variant="body2" color="text.secondary">{md(t(s.effect))}</Typography>
          </Box>
        ));

    case "invocation":
      return Object.entries(invocationsByWellspring).flatMap(([wellspring, invocations]) => [
        <Box key={wellspring + "_h"} sx={sectionHeaderSx}>{captionHeader(wellspring)}</Box>,
        ...invocations.map((inv, i) => (
          <Box key={wellspring + i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
              <Typography variant="body2" fontWeight="bold">{t(inv.name)}</Typography>
              <Chip label={inv.type} size="small" variant="outlined"
                sx={{ fontSize: "0.6rem", height: 16 }} />
            </Box>
            <Typography variant="body2" color="text.secondary">{md(t(inv.effect))}</Typography>
          </Box>
        )),
      ]);

    case "magiseed":
      return magiseeds.map((ms, i) => (
        <Box key={i} sx={itemSx}>
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.25 }}>{t(ms.name)}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{md(t(ms.description))}</Typography>
          {Array.from({ length: ms.rangeEnd - ms.rangeStart + 1 }, (_, j) => {
            const tier = ms.rangeStart + j;
            const effect = ms.effects[tier];
            return effect ? (
              <Box key={tier} sx={{ display: "flex", gap: 1, mb: 0.25 }}>
                <Typography variant="caption" fontWeight="bold" color={`${customTheme.primary}`}
                  sx={{ minWidth: 22, flexShrink: 0, pt: "1px" }}>
                  T{tier}
                </Typography>
                <Typography variant="body2" color="text.secondary">{md(t(effect))}</Typography>
              </Box>
            ) : null;
          })}
        </Box>
      ));

    case "cooking": {
      const effects = getDelicacyEffects(t);
      return effects.map((eff, i) => (
        <Box key={i} sx={itemSx}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary"
              sx={{ minWidth: 22, flexShrink: 0, pt: "1px" }}>
              {eff.id}.
            </Typography>
            <Typography variant="body2" color="text.secondary">{md(eff.effect)}</Typography>
          </Box>
        </Box>
      ));
    }

    case "tinkerer-alchemy": {
      return [
        <Box key="targets_h" sx={sectionHeaderSx}>{captionHeader(t("Targets"))}</Box>,
        ...tinkererAlchemy.targets.map((target, i) => (
          <Box key={"t" + i} sx={itemSx}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary"
                sx={{ minWidth: 36, flexShrink: 0, pt: "1px" }}>
                {target.rangeFrom === target.rangeTo
                  ? target.rangeFrom
                  : `${target.rangeFrom}–${target.rangeTo}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">{md(target.effect)}</Typography>
            </Box>
          </Box>
        )),
        <Box key="effects_h" sx={sectionHeaderSx}>{captionHeader(t("Effects"))}</Box>,
        ...tinkererAlchemy.effects.map((eff, i) => (
          <Box key={"e" + i} sx={itemSx}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary"
                sx={{ minWidth: 24, flexShrink: 0, pt: "1px" }}>
                {eff.dieValue}
              </Typography>
              <Typography variant="body2" color="text.secondary">{md(eff.effect)}</Typography>
            </Box>
          </Box>
        )),
      ];
    }

    case "tinkerer-infusion": {
      const byRank = {};
      tinkererInfusion.effects.forEach(eff => {
        const r = eff.infusionRank;
        if (!byRank[r]) byRank[r] = [];
        byRank[r].push(eff);
      });
      return Object.entries(byRank).flatMap(([rank, effs]) => [
        <Box key={"rank_" + rank} sx={sectionHeaderSx}>
          {captionHeader(`${t("Rank")} ${rank}`)}
        </Box>,
        ...effs.map((eff, i) => (
          <Box key={"r" + rank + "_" + i} sx={itemSx}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.25 }}>{eff.name}</Typography>
            <Typography variant="body2" color="text.secondary">{md(eff.effect)}</Typography>
          </Box>
        )),
      ]);
    }

    case "tinkerer-magitech": {
      const magitechRanks = [
        { rankLabel: t("Basic"),    name: t("Magitech Override"), descKeys: ["MagitechOverride_desc"] },
        { rankLabel: t("Advanced"), name: t("Magicannon"),        descKeys: ["Magicannon_desc1", "Magicannon_desc2"] },
        { rankLabel: t("Superior"), name: t("Magispheres"),       descKeys: ["Magispheres_desc1", "Magispheres_desc2", "Magispheres_desc3"] },
      ];
      return magitechRanks.flatMap((rank, ri) => [
        <Box key={"mtr_" + ri} sx={sectionHeaderSx}>
          {captionHeader(`${rank.rankLabel} — ${rank.name}`)}
        </Box>,
        <Box key={"mtc_" + ri} sx={itemSx}>
          {rank.descKeys.map((key, ki) => (
            <Typography key={ki} variant="body2" color="text.secondary" sx={{ mb: ki < rank.descKeys.length - 1 ? 0.5 : 0 }}>
              {md(t(key))}
            </Typography>
          ))}
        </Box>,
      ]);
    }

    case "arcanist":
    case "arcanist-rework": {
      return arcanumList.flatMap((arc, i) => [
        <Box key={"arc_h_" + i} sx={sectionHeaderSx}>
          {captionHeader(arc.name)}
        </Box>,
        <Box key={"arc_domain_" + i} sx={itemSx}>
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.25 }}>{t("Domain")}</Typography>
          <Typography variant="body2" color="text.secondary">{md(t(arc.domainDesc))}</Typography>
        </Box>,
        <Box key={"arc_merge_" + i} sx={itemSx}>
          <Typography variant="body2" fontWeight="bold" sx={{ textTransform: "uppercase", mb: 0.25 }}>{t("Merge")}</Typography>
          <Typography variant="body2" color="text.secondary">{md(t(arc.mergeDesc))}</Typography>
        </Box>,
        <Box key={"arc_dismiss_" + i} sx={itemSx}>
          <Typography variant="body2" fontWeight="bold" sx={{ textTransform: "uppercase", mb: 0.25 }}>{t("Dismiss")}</Typography>
          <Typography variant="body2" color="text.secondary">{md(t(arc.dismissDesc))}</Typography>
        </Box>,
      ]);
    }

    case "pilot-vehicle": {
      return [
        <Box key="frames_h" sx={sectionHeaderSx}>{captionHeader(t("Frames"))}</Box>,
        ...availableFrames.map((frame, i) => (
          <Box key={"fr" + i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25, flexWrap: "wrap" }}>
              <Typography variant="body2" fontWeight="bold">{t(frame.name)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {t("Passengers")}: {frame.passengers} · {t("Distance")}: {frame.distance}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">{md(t(frame.description))}</Typography>
          </Box>
        )),

        <Box key="armor_h" sx={sectionHeaderSx}>{captionHeader(t("Armor Modules"))}</Box>,
        ...availableModules.armor
          .filter(m => !m.customName && m.name !== "pilot_custom_armor")
          .map((m, i) => (
            <Box key={"am" + i} sx={itemSx}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                <Typography variant="body2" fontWeight="bold">{t(m.name)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  DEF {m.def} · MDEF {m.mdef}{m.martial ? " · Martial" : ""}
                </Typography>
              </Box>
            </Box>
          )),

        <Box key="weapon_h" sx={sectionHeaderSx}>{captionHeader(t("Weapon Modules"))}</Box>,
        ...availableModules.weapon.map((m, i) => (
          <Box key={"wm" + i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
              <Typography variant="body2" fontWeight="bold">{t(m.name)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {m.category} · HR+{m.damage} · {m.range}
                {m.prec !== 0 ? ` · +${m.prec} acc` : ""}
                {m.cumbersome ? " · Cumbersome" : ""}
              </Typography>
            </Box>
          </Box>
        )),

        <Box key="support_h" sx={sectionHeaderSx}>{captionHeader(t("Support Modules"))}</Box>,
        ...availableModules.support
          .filter(m => m.name !== "pilot_custom_support")
          .map((m, i) => (
            <Box key={"sm" + i} sx={itemSx}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: m.description ? 0.25 : 0 }}>
                {t(m.name)}
              </Typography>
              {m.description && (
                <Typography variant="body2" color="text.secondary">{md(t(m.description))}</Typography>
              )}
            </Box>
          )),
      ];
    }

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// ClassCard
// ---------------------------------------------------------------------------

export const ClassCard = React.memo(function ClassCard({ cls, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const benefits = cls.benefits;
  const benefitLines = [];
  if (benefits) {
    if (benefits.hpplus > 0)
      benefitLines.push(
        t("Permanently increase your maximum Hit Points by") + ` ${benefits.hpplus}.`
      );
    if (benefits.mpplus > 0)
      benefitLines.push(
        t("Permanently increase your maximum Mind Points by") + ` ${benefits.mpplus}.`
      );
    if (benefits.ipplus > 0)
      benefitLines.push(
        t("Permanently increase your maximum Inventory Points by") + ` ${benefits.ipplus}.`
      );
    if (benefits.martials?.armor)
      benefitLines.push(t("Gain the ability to equip martial armor."));
    if (benefits.martials?.melee)
      benefitLines.push(t("Gain the ability to equip martial melee weapons."));
    if (benefits.martials?.ranged)
      benefitLines.push(t("Gain the ability to equip martial ranged weapons."));
    if (benefits.martials?.shields)
      benefitLines.push(t("Gain the ability to equip martial shields."));
    if (benefits.rituals?.ritualism)
      benefitLines.push(
        t("You may perform Rituals whose effects fall within the Ritualism discipline.")
      );
  }

  return (
    <Card id={id} elevation={1}>
      <Stack>
        {/* Header */}
        <Box
          onClick={onHeaderClick}
          sx={{
            px: 2,
            py: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            variant="h4"
            color="inherit"
            sx={{ textTransform: "uppercase", fontSize: "1.1rem", fontWeight: "bold" }}
          >
            {t(cls.name)}
          </Typography>
          {cls.book && (
            <Chip
              label={cls.book}
              size="small"
              sx={{
                textTransform: "capitalize",
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#ffffff",
                fontWeight: "bold",
                fontSize: "0.7rem",
                flexShrink: 0,
              }}
            />
          )}
        </Box>

        {/* Free Benefits */}
        {benefitLines.length > 0 && (
          <Box sx={{ background, px: 2, py: 1, borderBottom: `1px solid ${customTheme.secondary}` }}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
              {t("Free Benefits")}
            </Typography>
            <Stack spacing={0.25}>
              {benefitLines.map((line, i) => (
                <Typography key={i} variant="body2">• {line}</Typography>
              ))}
            </Stack>
          </Box>
        )}

        {/* Skills */}
        {/* Spells accordion */}
        {(() => {
          const classSpells = spellList.filter((s) => s.class === cls.name);
          const hasCustomSpells =
            cls.benefits?.spellClasses?.length > 0 && classSpells.length === 0;
          if (!cls.benefits?.spellClasses?.length && classSpells.length === 0)
            return null;
          return (
            <Accordion disableGutters elevation={0} square
              sx={{ borderTop: `1px solid ${customTheme.secondary}`, "&:before": { display: "none" } }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 40, "& .MuiAccordionSummary-content": { my: 0.5 } }}>
                <Typography variant="body2" fontWeight="bold">
                  {t("Spells")}
                  {classSpells.length > 0 && (
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({classSpells.length})
                    </Typography>
                  )}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {hasCustomSpells ? (
                  /* Per-character spell types */
                  cls.benefits.spellClasses.map((sc) => {
                    const descKeys = SPELL_TYPE_DESC_KEYS[sc] ?? [];
                    const content = renderSpellTypeContent(sc, t, customTheme);
                    const hasContent = Array.isArray(content) ? content.length > 0 : content !== null;
                    return (
                      <Box key={sc} sx={{ borderTop: `1px solid ${customTheme.secondary}` }}>
                        {/* Header: chip + optional desc keys */}
                        <Box sx={{ px: 2, py: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: descKeys.length ? 0.75 : 0 }}>
                            <Chip
                              label={sc}
                              size="small"
                              sx={{
                                fontSize: "0.65rem",
                                textTransform: "capitalize",
                                backgroundColor: `${customTheme.primary}22`,
                                color: customTheme.primary,
                                fontWeight: "bold",
                              }}
                            />
                            {!descKeys.length && !hasContent && (
                              <Typography variant="caption" color="text.secondary" fontStyle="italic">
                                {t("Defined per character")}
                              </Typography>
                            )}
                          </Box>
                          {descKeys.map((key) => (
                            <Typography key={key} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                                {t(key)}
                              </StyledMarkdown>
                            </Typography>
                          ))}
                        </Box>
                        {/* Individual items */}
                        {content}
                      </Box>
                    );
                  })
                ) : (
                  /* Static spell list (default / gamble types) */
                  classSpells.map((spell, i) => (
                    <Box
                      key={i}
                      sx={{
                        borderTop: `1px solid ${customTheme.secondary}`,
                        px: 2,
                        py: 0.75,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {t(spell.name)}
                        </Typography>
                        <Chip
                          label={spell.isOffensive ? t("Offensive") : t("Support")}
                          size="small"
                          color={spell.isOffensive ? "error" : "success"}
                          variant="outlined"
                          sx={{ fontSize: "0.6rem", height: 16 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                          {spell.mp} MP
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, mb: 0.25 }}>
                        <Typography variant="caption" color="text.secondary">
                          {spell.targetDesc}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">·</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {spell.duration}
                        </Typography>
                        {spell.attr1 && spell.attr2 && (
                          <>
                            <Typography variant="caption" color="text.secondary">·</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {attributes[spell.attr1]?.shortcaps} + {attributes[spell.attr2]?.shortcaps}
                            </Typography>
                          </>
                        )}
                      </Box>
                      {spell.spellType === "gamble" ? (
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                              {t("GambleSpell_desc")}
                            </StyledMarkdown>
                          </Typography>
                          {spell.targets?.map((target, j) => (
                            <Box key={j} sx={{ display: "flex", gap: 1, mb: 0.25 }}>
                              <Typography variant="caption" fontWeight="bold" color="text.secondary"
                                sx={{ minWidth: 32, flexShrink: 0, pt: "1px" }}>
                                {target.rangeFrom === target.rangeTo
                                  ? target.rangeFrom
                                  : `${target.rangeFrom}–${target.rangeTo}`}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                                  {target.effect}
                                </StyledMarkdown>
                              </Typography>
                            </Box>
                          ))}
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                            {t(spell.description)}
                          </StyledMarkdown>
                        </Typography>
                      )}
                    </Box>
                  ))
                )}
              </AccordionDetails>
            </Accordion>
          );
        })()}
        <Divider />

        {cls.skills?.map((skill, i) => (
          <Box
            key={i}
            sx={{
              borderBottom: i < cls.skills.length - 1
                ? `1px solid ${customTheme.secondary}`
                : undefined,
            }}
          >
            {/* Skill header row */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2,
                pt: 0.75,
                pb: 0.25,
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {t(skill.skillName)}
              </Typography>
              <Chip
                label={`Max ${skill.maxLvl}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.65rem", height: 18, flexShrink: 0 }}
              />
            </Box>
            {/* Skill description */}
            <Box sx={{ px: 2, pb: 0.75 }}>
              <Typography variant="body2" color="text.secondary">
                <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                  {t(skill.description)}
                </StyledMarkdown>
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// SpecialRuleCard
// ---------------------------------------------------------------------------

export const SpecialRuleCard = React.memo(function SpecialRuleCard({ item, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  return (
    <Card id={id} elevation={1}>
      <Stack>
        <Box
          onClick={onHeaderClick}
          sx={{
            px: 2, py: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <Typography variant="h4" color="inherit" sx={{ textTransform: "uppercase", fontSize: "1.1rem", fontWeight: "bold" }}>
            {t("Special Rule")}
          </Typography>
          {item.spCost != null && (
            <Chip
              label={`${item.spCost} SP`}
              size="small"
              sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff", fontWeight: "bold", fontSize: "0.7rem" }}
            />
          )}
        </Box>
        <Box sx={{ background, borderBottom: `1px solid ${customTheme.secondary}`, px: 2, py: "6px" }}>
          <Typography fontWeight="bold">{item.name}</Typography>
        </Box>
        {item.effect && (
          <Box sx={{ px: 2, py: 0.5, fontSize: "0.875rem" }}>
            <StyledMarkdown allowedElements={["p", "strong", "em", "ul", "ol", "li", "br"]} unwrapDisallowed>
              {item.effect}
            </StyledMarkdown>
          </Box>
        )}
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// ActionCard
// ---------------------------------------------------------------------------

export const ActionCard = React.memo(function ActionCard({ item, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  return (
    <Card id={id} elevation={1}>
      <Stack>
        <Box
          onClick={onHeaderClick}
          sx={{
            px: 2, py: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <Typography variant="h4" color="inherit" sx={{ textTransform: "uppercase", fontSize: "1.1rem", fontWeight: "bold" }}>
            {t("Other Action")}
          </Typography>
          {item.spCost != null && (
            <Chip
              label={`${item.spCost} SP`}
              size="small"
              sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff", fontWeight: "bold", fontSize: "0.7rem" }}
            />
          )}
        </Box>
        <Box sx={{ background, borderBottom: `1px solid ${customTheme.secondary}`, px: 2, py: "6px" }}>
          <Typography fontWeight="bold">{item.name}</Typography>
        </Box>
        {item.effect && (
          <Box sx={{ px: 2, py: 0.5, fontSize: "0.875rem" }}>
            <StyledMarkdown allowedElements={["p", "strong", "em", "ul", "ol", "li", "br"]} unwrapDisallowed>
              {item.effect}
            </StyledMarkdown>
          </Box>
        )}
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// HeroicCard
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// CustomWeaponCard
// ---------------------------------------------------------------------------

export const CustomWeaponCard = React.memo(function CustomWeaponCard({ weapon, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const { precision, damage } = calculateCustomWeaponStats(weapon, false);
  const [att1Key, att2Key] = weapon.accuracyCheck || ["dex", "ins"];
  const attr1 = attributes[att1Key];
  const attr2 = attributes[att2Key];
  const dmgType = types[weapon.type];
  const isRanged = weapon.range === "weapon_range_ranged";

  return (
    <Card id={id} elevation={1}>
      <Stack>
        {/* Header */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          onClick={onHeaderClick}
          sx={{
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            "& .MuiTypography-root": { fontSize: "0.9rem", textTransform: "uppercase" },
          }}
        >
          <Grid item xs={4}>
            <Typography variant="h4">{t("Custom Weapon")}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h4" textAlign="center">{t("Cost")}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">{t("Accuracy")}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">{t("Damage")}</Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + stats */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid item xs={4} sx={{ display: "flex", alignItems: "center" }}>
            <Typography fontWeight="bold" sx={{ mr: 0.5 }}>{weapon.name}</Typography>
            {weapon.martial && <Martial />}
          </Grid>
          <Grid item xs={2}>
            <Typography textAlign="center">{`${weapon.cost || 300}z`}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography fontWeight="bold" textAlign="center">
              <OpenBracket />
              {attr1?.shortcaps} + {attr2?.shortcaps}
              <CloseBracket />
              {precision > 0 ? `+${precision}` : ""}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography fontWeight="bold" textAlign="center">
              <OpenBracket />
              {t("HR +")} {damage}
              <CloseBracket />
              {dmgType?.long}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 2 – category / hands / range */}
        <Grid
          container
          justifyContent="space-between"
          sx={{
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid item xs={4}>
            <Typography fontWeight="bold">{t(weapon.category)}</Typography>
          </Grid>
          <Grid item xs={1}>
            <Diamond color={customTheme.primary} />
          </Grid>
          <Grid item xs={3}>
            <Typography textAlign="center">
              {weapon.hands === 1 ? t("One-handed") : t("Two-handed")}
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <Diamond color={customTheme.primary} />
          </Grid>
          <Grid item xs={3}>
            <Typography textAlign="center">
              {isRanged ? t("Ranged") : t("Melee")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 3 – quality */}
        {weapon.quality && (
          <Box sx={{ px: 1, py: 0.75 }}>
            <Typography variant="body2">
              <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                {weapon.quality}
              </StyledMarkdown>
            </Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// AccessoryCard
// ---------------------------------------------------------------------------

export const AccessoryCard = React.memo(function AccessoryCard({ accessory, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  return (
    <Card id={id} elevation={1}>
      <Stack>
        {/* Header */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          onClick={onHeaderClick}
          sx={{
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            "& .MuiTypography-root": { fontSize: "0.9rem", textTransform: "uppercase" },
          }}
        >
          <Grid item xs={9}>
            <Typography variant="h4">{t("Accessory")}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="h4" textAlign="center">{t("Cost")}</Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + cost */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid item xs={9}>
            <Typography fontWeight="bold">{accessory.name}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography textAlign="center">{`${accessory.cost}z`}</Typography>
          </Grid>
        </Grid>

        {/* quality row */}
        {accessory.quality && (
          <Box sx={{ px: 1, py: 0.75 }}>
            <Typography variant="body2">
              <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                {accessory.quality}
              </StyledMarkdown>
            </Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// HeroicCard
// ---------------------------------------------------------------------------

export const HeroicCard = React.memo(function HeroicCard({ heroic, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  return (
    <Card id={id} elevation={1}>
      <Stack>
        {/* Header */}
        <Box
          onClick={onHeaderClick}
          sx={{
            px: 2,
            py: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            variant="h4"
            color="inherit"
            sx={{ textTransform: "uppercase", fontSize: "1.1rem", fontWeight: "bold" }}
          >
            {t("Heroic Skill")}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
            {heroic.book && (
              <Chip
                label={heroic.book}
                size="small"
                sx={{
                  textTransform: "capitalize",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "#ffffff",
                  fontWeight: "bold",
                  fontSize: "0.7rem",
                }}
              />
            )}
            {heroic.applicableTo?.map((cls) => (
              <Chip
                key={cls}
                label={t(cls)}
                size="small"
                sx={{
                  textTransform: "capitalize",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                  fontSize: "0.7rem",
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Name row */}
        <Box
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 2,
            py: "6px",
          }}
        >
          <Typography fontWeight="bold">{t(heroic.name)}</Typography>
        </Box>

        {/* Quote */}
        {heroic.quote && (
          <Box sx={{ px: 2, py: "5px", borderBottom: `1px solid ${customTheme.secondary}` }}>
            <Typography variant="body2" fontStyle="italic" color="text.secondary">
              {t(heroic.quote)}
            </Typography>
          </Box>
        )}

        {/* Description */}
        <Box sx={{ px: 2, py: 0.25, fontSize: "0.875rem" }}>
          <StyledMarkdown allowedElements={["p", "strong", "em", "ul", "ol", "li", "br"]} unwrapDisallowed>
            {t(heroic.description)}
          </StyledMarkdown>
        </Box>
      </Stack>
    </Card>
  );
});

// ---------------------------------------------------------------------------
// OptionalCard (dispatcher → QuirkCard | ZeroPowerCard | GenericOptionalCard)
// ---------------------------------------------------------------------------

function QuirkCard({ item, customTheme, t }) {
  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  return (
    <Stack>
      <Box sx={{ background, borderBottom: `1px solid ${customTheme.secondary}`, px: 2, py: "6px" }}>
        <Typography fontWeight="bold">{item.name}</Typography>
      </Box>
      {item.description && (
        <Box sx={{ px: 2, py: "5px", borderBottom: `1px solid ${customTheme.secondary}` }}>
          <Typography variant="body2" fontStyle="italic" color="text.secondary">
            {item.description}
          </Typography>
        </Box>
      )}
      {item.effect && (
        <Box sx={{ px: 2, py: 0.75, fontSize: "0.875rem" }}>
          <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
            {item.effect}
          </StyledMarkdown>
        </Box>
      )}
    </Stack>
  );
}

function CampActivitiesCard({ item, customTheme, t }) {
  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  return (
    <Stack>
      <Box sx={{ background, borderBottom: `1px solid ${customTheme.secondary}`, px: 2, py: "6px" }}>
        <Typography fontWeight="bold">{item.name}</Typography>
      </Box>
      {item.targetDescription && (
        <Box sx={{ px: 2, py: "5px", borderBottom: `1px solid ${customTheme.secondary}` }}>
          <Typography variant="body2">
            <strong>{t("Target")}:</strong> {item.targetDescription}
          </Typography>
        </Box>
      )}
      {item.effect && (
        <Box sx={{ px: 2, py: 0.75, fontSize: "0.875rem" }}>
          <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
            {item.effect}
          </StyledMarkdown>
        </Box>
      )}
    </Stack>
  );
}

function ZeroTriggerCard({ item, customTheme, t }) {
  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  return (
    <Stack>
      <Box sx={{ background, borderBottom: `1px solid ${customTheme.secondary}`, px: 2, py: "6px" }}>
        <Typography fontWeight="bold">{item.name}</Typography>
      </Box>
      {item.description && (
        <Box sx={{ px: 2, py: 0.75, fontSize: "0.875rem" }}>
          <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
            {item.description}
          </StyledMarkdown>
        </Box>
      )}
    </Stack>
  );
}

function ZeroEffectCard({ item, customTheme, t }) {
  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  return (
    <Stack>
      <Box sx={{ background, borderBottom: `1px solid ${customTheme.secondary}`, px: 2, py: "6px" }}>
        <Typography fontWeight="bold">{item.name}</Typography>
      </Box>
      {item.description && (
        <Box sx={{ px: 2, py: 0.75, fontSize: "0.875rem" }}>
          <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
            {item.description}
          </StyledMarkdown>
        </Box>
      )}
    </Stack>
  );
}

function ZeroPowerCard({ item, customTheme, t }) {
  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const sections = item.clock?.sections ?? 6;
  const triggerName = typeof item.zeroTrigger === "string" ? item.zeroTrigger : item.zeroTrigger?.name ?? "";
  const triggerDesc = typeof item.zeroTrigger === "object" ? item.zeroTrigger?.description ?? "" : "";
  const effectName  = typeof item.zeroEffect  === "string" ? item.zeroEffect  : item.zeroEffect?.name  ?? "";
  const effectDesc  = typeof item.zeroEffect  === "object" ? item.zeroEffect?.description  ?? "" : "";

  return (
    <Stack>
      <Box sx={{ background, borderBottom: `1px solid ${customTheme.secondary}`, px: 2, py: "6px" }}>
        <Typography fontWeight="bold">{item.name}</Typography>
      </Box>
      {/* <Box sx={{ px: 2, py: 1, display: "flex", justifyContent: "center" }}>
        <Clock numSections={sections} size={40} />
      </Box> */}
      {triggerName && (
        <Box sx={{ px: 2, py: "5px", borderBottom: `1px solid ${customTheme.secondary}` }}>
          <Typography variant="body2">
            <strong>{t("Trigger")}:</strong> {triggerName}
          </Typography>
          {triggerDesc && <Typography variant="body2">
            <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
              {triggerDesc}
            </StyledMarkdown>
            </Typography>}
        </Box>
      )}
      {effectName && (
        <Box sx={{ px: 2, py: "5px" }}>
          <Typography variant="body2">
            <strong>{t("Effect")}:</strong> {effectName}
          </Typography>
          {effectDesc && <Typography variant="body2">
            <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
              {effectDesc}
            </StyledMarkdown>
            </Typography>}
        </Box>
      )}
    </Stack>
  );
}

function GenericOptionalCard({ item, customTheme, t }) {
  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  return (
    <Stack>
      <Box sx={{ background, borderBottom: `1px solid ${customTheme.secondary}`, px: 2, py: "6px" }}>
        <Typography fontWeight="bold">{item.name}</Typography>
      </Box>
      {item.description && (
        <Box sx={{ px: 2, py: "5px", borderBottom: `1px solid ${customTheme.secondary}` }}>
          <Typography variant="body2" fontStyle="italic" color="text.secondary">
            {item.description}
          </Typography>
        </Box>
      )}
      {/* {item.clock?.sections && (
        <Box sx={{ px: 2, py: 1, display: "flex", justifyContent: "center" }}>
          <Clock numSections={item.clock.sections} size={40} />
        </Box>
      )} */}
      {item.effect && (
        <Box sx={{ px: 2, py: 0.75, fontSize: "0.875rem" }}>
          <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
            {item.effect}
          </StyledMarkdown>
        </Box>
      )}
    </Stack>
  );
}

export const OptionalCard = React.memo(function OptionalCard({ optional, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const subtypeLabel = {
    "quirk":        t("Quirk"),
    "camp-activities": t("Camp Activities"),
    "zero-trigger": t("Zero Trigger"),
    "zero-effect":  t("Zero Effect"),
    "zero-power":   t("Zero Power"),
    "other":        t("Optional Rule"),
  }[optional.subtype] ?? t("Optional Rule");

  return (
    <Card id={id} elevation={1}>
      <Stack>
        <Box
          onClick={onHeaderClick}
          sx={{
            px: 2, py: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            variant="h4"
            color="inherit"
            sx={{ textTransform: "uppercase", fontSize: "1.1rem", fontWeight: "bold" }}
          >
            {subtypeLabel}
          </Typography>
        </Box>
        {optional.subtype === "quirk" && (
          <QuirkCard item={optional} customTheme={customTheme} t={t} />
        )}
        {optional.subtype === "camp-activities" && (
          <CampActivitiesCard item={optional} customTheme={customTheme} t={t} />
        )}
        {optional.subtype === "zero-trigger" && (
          <ZeroTriggerCard item={optional} customTheme={customTheme} t={t} />
        )}
        {optional.subtype === "zero-effect" && (
          <ZeroEffectCard item={optional} customTheme={customTheme} t={t} />
        )}
        {optional.subtype === "zero-power" && (
          <ZeroPowerCard item={optional} customTheme={customTheme} t={t} />
        )}
        {(optional.subtype === "other" || !optional.subtype) && (
          <GenericOptionalCard item={optional} customTheme={customTheme} t={t} />
        )}
      </Stack>
    </Card>
  );
});
