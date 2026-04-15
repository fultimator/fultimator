import React from "react";
import {
  Box, Card, Stack, Grid, Typography, Chip,
  Accordion, AccordionSummary, AccordionDetails, Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { styled } from "@mui/system";
import { useTranslate, t as staticT } from "../../translation/translate";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { Martial, OffensiveSpellIcon } from "../icons";
import { OpenBracket, CloseBracket } from "../Bracket";
import Diamond from "../Diamond";
import attributes from "../../libs/attributes";
import types from "../../libs/types";
import { spellList, tinkererAlchemy, tinkererInfusion, arcanumList, spellsByClass } from "../../libs/classes";
import { calculateCustomWeaponStats } from "../player/common/playerCalculations";
import { availableFrames, availableModules } from "../../libs/pilotVehicleData";
import { magiseeds } from "../../libs/floralistMagiseedData";
import { getDelicacyEffects } from "../../libs/gourmetCookingData";
import { availableGifts } from "../player/spells/spellOptionData";
import { availableDances } from "../player/spells/spellOptionData";
import { availableTherioforms } from "../player/spells/spellOptionData";
import { availableMagichantKeys, availableMagichantTones } from "../player/spells/spellOptionData";
import { availableSymbols } from "../player/spells/spellOptionData";
import { invocationsByWellspring } from "../player/spells/spellOptionData";

// 
// Spell type description keys (per-character types have no static list)
// 

const SPELL_TYPE_DESC_KEYS = {
  dance: ["dance_details_1"],
  symbol: ["symbol_details_1"],
  magichant: ["magichant_details_1", "magichant_details_2", "magichant_details_3", "magichant_details_4"],
  cooking: ["Cooking_desc"],
  invocation: ["Invocation_desc"],
  "pilot-vehicle": ["pilot_details_1"],
  magiseed: ["magiseed_details_1"],
  gift: [],
  therioform: [],
  deck: [],
  arcanist: [],
  "arcanist-rework": [],
  "tinkerer-alchemy": [],
  "tinkerer-infusion": [],
  "tinkerer-magitech": [],
  gamble: [],
};

// 
// Styled markdown (defined once outside components to avoid re-creation)
// 

const _StyledMarkdown = styled(ReactMarkdown)({
  "& ul, & ol": { paddingLeft: "1.5em", margin: 0, marginTop: "0.5em", marginBottom: "0.5em" },
  "& p": { margin: 0, marginTop: "0.5em", marginBottom: "0.5em", lineHeight: 1.5 },
  "& ul": { listStyle: "disc", lineHeight: 1.6 },
  "& ol": { listStyle: "decimal", lineHeight: 1.6 },
  "& li": { display: "list-item", lineHeight: 1.6 },
  "& strong": { fontWeight: 600 },
  "& em": { fontStyle: "italic" },
  display: "inline",
});
export const StyledMarkdown = ({ remarkPlugins = [], children, ...props }) => (
  <_StyledMarkdown remarkPlugins={[remarkBreaks, ...remarkPlugins]} {...props}>
    {typeof children === "string" ? children.replace(/\\n/g, "\n") : children}
  </_StyledMarkdown>
);

//
// WeaponCard
//

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


          onClick={onHeaderClick}
          sx={{
            justifyContent: "space-between", alignItems: "center",
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            "& .MuiTypography-root": {
              fontSize: "0.85rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              lineHeight: 1.4,
            },
          }}
        >
          <Grid size={4}>
            <Typography variant="h4" sx={{ fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>{t("Weapon")}</Typography>
          </Grid>
          <Grid size={2}>
            <Typography variant="h4" sx={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
              {t("Cost")}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="h4" sx={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
              {t("Accuracy")}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="h4" sx={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
              {t("Damage")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + stats */}
        <Grid
          container


          sx={{
            justifyContent: "space-between", alignItems: "center",
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid sx={{ display: "flex", alignItems: "center" }} size={4}>
            <Typography
              sx={{
                fontWeight: "600",
                mr: 0.5,
                fontSize: "0.9rem"
              }}>
              {t(weapon.name)}
            </Typography>
            {weapon.martial && <Martial />}
          </Grid>
          <Grid size={2}>
            <Typography sx={{ textAlign: "center" }}>{`${weapon.cost}z`}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography
              sx={{
                fontWeight: "600",
                textAlign: "center"
              }}>
              <OpenBracket />
              {attr1?.shortcaps} + {attr2?.shortcaps}
              <CloseBracket />
              {weapon.prec > 0 ? `+${weapon.prec}` : ""}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography
              sx={{
                fontWeight: "600",
                textAlign: "center"
              }}>
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

          sx={{
            justifyContent: "space-between",
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid size={4}>
            <Typography
              sx={{
                fontWeight: "600",
                fontSize: "0.9rem"
              }}>{t(weapon.category)}</Typography>
          </Grid>
          <Grid size={1}>
            <Diamond color={customTheme.primary} />
          </Grid>
          <Grid size={3}>
            <Typography sx={{ textAlign: "center" }}>
              {weapon.hands === 1 ? t("One-handed") : t("Two-handed")}
            </Typography>
          </Grid>
          <Grid size={1}>
            <Diamond color={customTheme.primary} />
          </Grid>
          <Grid size={3}>
            <Typography sx={{ textAlign: "center" }}>
              {weapon.melee ? t("Melee") : t("Ranged")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 3 – quality */}
        {weapon.quality && (
          <Box sx={{ px: 1, py: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.5 }} component="div">
              <StyledMarkdown
                allowedElements={["strong", "em"]}
                unwrapDisallowed
              >
                {weapon.quality}
              </StyledMarkdown>
            </Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );
});

// 
// ArmorCard (handles both Armor and Shield)
// 

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


          onClick={onHeaderClick}
          sx={{
            justifyContent: "space-between", alignItems: "center",
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            "& .MuiTypography-root": {
              fontSize: "0.85rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              lineHeight: 1.4,
            },
          }}
        >
          <Grid size={3}>
            <Typography variant="h4" sx={{ fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>{t(armor.category)}</Typography>
          </Grid>
          <Grid size={2}>
            <Typography variant="h4" sx={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
              {t("Cost")}
            </Typography>
          </Grid>
          <Grid size={2}>
            <Typography variant="h4" sx={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
              {t("Defense")}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="h4" sx={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
              {t("M. Defense")}
            </Typography>
          </Grid>
          <Grid size={2}>
            <Typography variant="h4" sx={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
              {t("Init.")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + stats */}
        <Grid
          container


          sx={{
            justifyContent: "space-between", alignItems: "center",
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid sx={{ display: "flex", alignItems: "center" }} size={3}>
            <Typography
              sx={{
                fontWeight: "600",
                mr: 0.5,
                fontSize: "0.9rem"
              }}>
              {t(armor.name)}
            </Typography>
            {armor.martial && <Martial />}
          </Grid>
          <Grid size={2}>
            <Typography sx={{ textAlign: "center" }}>{`${armor.cost}z`}</Typography>
          </Grid>
          <Grid size={2}>
            <Typography
              sx={{
                fontWeight: "bold",
                textAlign: "center"
              }}>
              {getArmorDefDisplay(armor, t)}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography
              sx={{
                fontWeight: "bold",
                textAlign: "center"
              }}>
              {getArmorMDefDisplay(armor, t)}
            </Typography>
          </Grid>
          <Grid size={2}>
            <Typography
              sx={{
                fontWeight: "bold",
                textAlign: "center"
              }}>
              {armor.init === 0 ? " - " : armor.init}
            </Typography>
          </Grid>
        </Grid>

        {/* quality row (optional) */}
        {armor.quality && (
          <Box sx={{ px: 1, py: 0.75 }}>
            <Typography variant="body2" component="div">
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

// 
// SpellCard
// 

export const SpellCard = React.memo(function SpellCard({ spell, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const attr1 = attributes[spell.attr1];
  const attr2 = attributes[spell.attr2];
  const effectText =
    spell.effect ??
    spell.description ??
    (Array.isArray(spell.special) ? spell.special.join("; ") : (spell.special ?? ""));
  const targetText = spell.target ?? spell.targetDesc ?? "";

  return (
    <Card id={id} elevation={1}>
      <Stack>
        {/* Header */}
        <Grid
          container

          onClick={onHeaderClick}
          sx={{
            alignItems: "center",
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            "& .MuiTypography-root": {
              fontSize: "0.85rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              lineHeight: 1.4,
            },
          }}
        >
          <Grid size={4}>
            <Typography variant="h4">{t("Spell")}</Typography>
          </Grid>
          <Grid size={2}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              {t("MP")}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              {t("Duration")}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              {t("Target")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + cost + duration + target */}
        <Grid
          container

          sx={{
            alignItems: "center",
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid size={4}>
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: 0.5
              }}>
              {t(spell.name)}
              {spell.type === "offensive" && <OffensiveSpellIcon fontSize="small" />}
            </Typography>
          </Grid>
          <Grid size={2}>
            <Typography sx={{ textAlign: "center" }}>{spell.mp}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ textAlign: "center" }}>{spell.duration}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ textAlign: "center" }}>{t(targetText)}</Typography>
          </Grid>
        </Grid>

        {/* Effect with accuracy/damage prefix (if offensive) */}
        {effectText && (
          <Box sx={{ px: 1, py: 0.75 }}>
            <Typography variant="body2" component="div" sx={{ lineHeight: 1.5, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 0.5 }}>
              <span>
                {spell.type === "offensive" && attr1 && attr2 && (
                  <strong style={{ whiteSpace: "nowrap" }}>
                    <OpenBracket />
                    {attr1.shortcaps} + {attr2.shortcaps}
                    <CloseBracket /> <Diamond /> <OpenBracket />HR + {spell.damage || 0}<CloseBracket />{" "}
                    {spell.damagetype ? t(spell.damagetype) : "physical"} <Diamond />{" "}
                  </strong>
                )}
                <span style={{ display: "inline" }}>
                  <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                    {t(effectText)}
                  </StyledMarkdown>
                </span>
              </span>
            </Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );
});

// 
// PlayerSpellCard
// 

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
          onClick={onHeaderClick}
          sx={{
            alignItems: "center",
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            "& .MuiTypography-root": {
              fontSize: "0.85rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              lineHeight: 1.4,
            },
          }}
        >
          <Grid size={4}>
            <Typography variant="h4">{t("Spell")}</Typography>
          </Grid>
          <Grid size={2}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>{t("MP")}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>{t("Duration")}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>{t("Target")}</Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + mp + duration + target */}
        <Grid
          container
          sx={{
            alignItems: "center",
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid size={4}>
            <Typography
              sx={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: 0.5
              }}>
              {t(spell.name)}
              {spell.isOffensive && <OffensiveSpellIcon fontSize="small" />}
            </Typography>
            <Typography variant="caption" sx={{
              color: "text.secondary"
            }}>
              {spell.class}{attr1 && attr2 ? ` · ${attr1.shortcaps}+${attr2.shortcaps}` : ""}
            </Typography>
          </Grid>
          <Grid size={2}>
            <Typography sx={{ textAlign: "center" }}>{spell.mp}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ textAlign: "center" }}>{t(spell.duration)}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ textAlign: "center" }}>{t(spell.targetDesc)}</Typography>
          </Grid>
        </Grid>

        {/* Row 2 – accuracy (if applicable) */}
        {/* {attr1 && attr2 && (
          <Grid
            container
            
            sx={{ alignItems: "center",
              borderBottom: `1px solid ${customTheme.secondary}`,
              px: 1,
              py: "4px",
            }}
          >
            <Grid size={12}>
              <Typography variant="body2"
                color="text.secondary"
                sx={{ textAlign: "right" }}
                fontWeight="bold"
              >
                <OpenBracket />{attr1.shortcaps} + {attr2.shortcaps}<CloseBracket />
              </Typography>
            </Grid>
          </Grid>
        )} */}

        {/* Description with accuracy/damage prefix (if offensive) */}
        <Box sx={{ px: 1, py: 0.75 }}>
          <Typography variant="body2" component="div" sx={{ lineHeight: 1.5, wordWrap: "break-word", overflowWrap: "break-word" }}>
            {spell.isOffensive && attr1 && attr2 && (
              <strong>
                <OpenBracket />
                {attr1.shortcaps} + {attr2.shortcaps}
                <CloseBracket /> <Diamond /> <OpenBracket />HR + {spell.damage || 0}<CloseBracket /> {spell.damageType || "physical"} <Diamond />{" "}
              </strong>
            )}
            <span style={{ display: "inline" }}>
              <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                {t(spell.description)}
              </StyledMarkdown>
            </span>
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
});

// 
// NonStaticSpellCard
// 

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

  const pilotSubtype = item.pilotSubtype
    || (item.passengers != null ? "frame" : null)
    || (String(item.type || "").includes("pilot_module_armor") ? "armor" : null)
    || (String(item.type || "").includes("pilot_module_weapon") ? "weapon" : null)
    || (String(item.type || "").includes("pilot_module_support") ? "support" : null)
    || (String(item.category || "").toLowerCase().includes("frame") ? "frame" : null)
    || (String(item.category || "").toLowerCase().includes("armor module") ? "armor" : null)
    || (String(item.category || "").toLowerCase().includes("weapon module") ? "weapon" : null)
    || (String(item.category || "").toLowerCase().includes("support module") ? "support" : null);

  const renderBody = () => {
    switch (item.spellType) {
      case "gift":
        return (
          <>
            <Typography
              variant="body2"
              component="div"
              sx={{
                color: "text.secondary",
                fontStyle: "italic",
                mb: 1,
                lineHeight: 1.5
              }}>
              {md(t(item.event))}
            </Typography>
            <Typography
              variant="body2"
              component="div"
              sx={{
                color: "text.secondary",
                lineHeight: 1.5
              }}>{md(t(item.effect))}</Typography>
          </>
        );
      case "dance":
        return (
          <>
            {item.duration && (
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mb: 1,
                  lineHeight: 1.5
                }}>
                <strong>{t("Duration")}:</strong> {t(item.duration)}
              </Typography>
            )}
            <Typography
              variant="body2"
              component="div"
              sx={{
                color: "text.secondary",
                lineHeight: 1.5
              }}>{md(t(item.effect))}</Typography>
          </>
        );
      case "therioform":
        return (
          <>
            {item.genoclepsis && (
              <Typography
                variant="body2"
                component="div"
                sx={{
                  color: "text.secondary",
                  fontStyle: "italic",
                  mb: 1,
                  lineHeight: 1.5
                }}>
                {md(t(item.genoclepsis))}
              </Typography>
            )}
            <Typography
              variant="body2"
              component="div"
              sx={{
                color: "text.secondary",
                lineHeight: 1.5
              }}>{md(t(item.description))}</Typography>
          </>
        );
      case "magichant":
        if (item.magichantSubtype === "key" || item.type || item.status || item.attribute || item.recovery) {
          const keyDetails = [
            { label: t("Type"), value: item.type ? t(item.type) : "" },
            { label: t("Status"), value: item.status ? t(item.status) : "" },
            { label: t("Attribute"), value: item.attribute ? t(item.attribute) : "" },
            { label: t("Recovery"), value: item.recovery ? t(item.recovery) : "" },
          ].filter((entry) => entry.value);
          return (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                columnGap: 1.5,
                rowGap: 0.75,
              }}
            >
              {keyDetails.map((entry) => (
                <React.Fragment key={entry.label}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.3px"
                    }}>
                    {entry.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.5
                    }}>
                    {entry.value}
                  </Typography>
                </React.Fragment>
              ))}
            </Box>
          );
        }
        break;
      case "symbol":
        return (
          <Typography
            variant="body2"
            component="div"
            sx={{
              color: "text.secondary",
              lineHeight: 1.5
            }}>{md(t(item.effect))}</Typography>
        );
      case "invocation":
        return (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              {item.wellspring && (
                <Chip label={item.wellspring} size="small" variant="outlined"
                  sx={{ fontSize: "0.7rem", height: 22 }} />
              )}
              {item.type && (
                <Chip label={item.type} size="small" variant="outlined"
                  sx={{ fontSize: "0.7rem", height: 22 }} />
              )}
            </Box>
            <Typography
              variant="body2"
              component="div"
              sx={{
                color: "text.secondary",
                lineHeight: 1.5
              }}>{md(t(item.effect))}</Typography>
          </>
        );
      case "magiseed":
        return (
          <>
            <Typography
              variant="body2"
              component="div"
              sx={{
                color: "text.secondary",
                mb: 1.5,
                lineHeight: 1.5
              }}>{md(t(item.description))}</Typography>
            {Array.from({ length: item.rangeEnd - item.rangeStart + 1 }, (_, j) => {
              const tier = item.rangeStart + j;
              const effect = item.effects?.[tier];
              return effect ? (
                <Box key={tier} sx={{ display: "flex", gap: 1, mb: 0.75 }}>
                  <Typography
                    variant="caption"
                    color={customTheme.primary}
                    sx={{
                      fontWeight: "bold",
                      minWidth: 22,
                      flexShrink: 0,
                      pt: "2px",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.3px"
                    }}>
                    T{tier}
                  </Typography>
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.5
                    }}>{md(t(effect))}</Typography>
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
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "600",
                    mb: 0.5,
                    textTransform: "uppercase",
                    fontSize: "0.85rem",
                    letterSpacing: "0.3px"
                  }}>
                  {item.domain ? t(item.domain) : t("Domain")}
                </Typography>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.5
                  }}>{md(t(item.domainDesc))}</Typography>
              </Box>
            )}
            {item.mergeDesc && (
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "600",
                    textTransform: "uppercase",
                    mb: 0.5,
                    fontSize: "0.85rem",
                    letterSpacing: "0.3px"
                  }}>
                  {item.merge ? t(item.merge) : t("Merge")}
                </Typography>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.5
                  }}>{md(t(item.mergeDesc))}</Typography>
              </Box>
            )}
            {item.pulseDesc && (
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "600",
                    textTransform: "uppercase",
                    mb: 0.5,
                    fontSize: "0.85rem",
                    letterSpacing: "0.3px"
                  }}>
                  {item.pulse ? t(item.pulse) : t("Pulse")}
                </Typography>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.5
                  }}>{md(t(item.pulseDesc))}</Typography>
              </Box>
            )}
            {item.dismissDesc && (
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "600",
                    textTransform: "uppercase",
                    mb: 0.5,
                    fontSize: "0.85rem",
                    letterSpacing: "0.3px"
                  }}>
                  {item.dismiss ? t(item.dismiss) : t("Dismiss")}
                </Typography>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.5
                  }}>{md(t(item.dismissDesc))}</Typography>
              </Box>
            )}
          </Stack>
        );
      case "tinkerer-alchemy":
        return (
          <>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                fontWeight: 600,
                fontSize: "0.75rem",
                letterSpacing: "0.3px",
                display: "block",
                mb: 0.5
              }}>
              {item.category}
            </Typography>
            <Typography
              variant="body2"
              component="div"
              sx={{
                color: "text.secondary",
                lineHeight: 1.5
              }}>{md(item.effect)}</Typography>
          </>
        );
      case "tinkerer-infusion":
        return (
          <>
            {item.infusionRank && (
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "block",
                  mb: 0.5,
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px"
                }}>Rank {item.infusionRank}</Typography>
            )}
            <Typography
              variant="body2"
              component="div"
              sx={{
                color: "text.secondary",
                lineHeight: 1.5
              }}>{md(item.effect ?? item.description ?? "")}</Typography>
          </>
        );
      case "pilot-vehicle":
        if (pilotSubtype === "frame" || item.passengers != null) return (
          <>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                fontWeight: 600,
                display: "block",
                mb: 0.5,
                fontSize: "0.75rem",
                letterSpacing: "0.3px"
              }}>
              {t(item.frame ?? "")}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
                mb: 0.75,
                lineHeight: 1.5
              }}>
              {t("Passengers")}: {item.passengers ?? " - "} · {t("Distance")}: {item.distance ?? " - "}
            </Typography>
            {item.description && <Typography
              variant="body2"
              component="div"
              sx={{
                color: "text.secondary",
                mt: 0.5,
                lineHeight: 1.5
              }}>{md(t(item.description))}</Typography>}
          </>
        );
        if (pilotSubtype === "armor" || item.def != null) return (
          <>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
                mb: 0.75,
                lineHeight: 1.5
              }}>
              DEF {item.def ?? " - "} · MDEF {item.mdef ?? " - "}{item.martial ? " · Martial" : ""}
              {item.cost ? ` · ${item.cost}z` : ""}
            </Typography>
            {item.description && <Typography
              variant="body2"
              component="div"
              sx={{
                color: "text.secondary",
                mt: 0.5,
                lineHeight: 1.5
              }}>{md(item.description)}</Typography>}
          </>
        );
        if (pilotSubtype === "weapon" || item.damage != null) return (
          <>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
                mb: 0.25,
                lineHeight: 1.5
              }}>
              {[item.category, item.att1 && item.att2 ? `${item.att1}+${item.att2}` : null].filter(Boolean).join(" · ")}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
                mb: 0.75,
                lineHeight: 1.5
              }}>
              {[`HR+${item.damage ?? 0}`, item.damageType, item.range,
              item.prec ? `+${item.prec} acc` : null,
              item.cumbersome ? "Cumbersome" : null,
              item.isShield ? "Shield" : null,
              ].filter(Boolean).join(" · ")}
            </Typography>
            {item.quality && <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
                mb: 0.25,
                lineHeight: 1.5
              }}>{item.quality}</Typography>}
            {item.cost ? <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                lineHeight: 1.5
              }}> · {item.cost}z</Typography> : null}
          </>
        );
        // support module
        return item.description
          ? <Typography
          variant="body2"
          component="div"
          sx={{
            color: "text.secondary",
            lineHeight: 1.5
          }}>{md(t(item.description))}</Typography>
          : null;
      case "cooking":
        if (item.cookbookEffects?.length) {
          return (
            <>
              {item.cookbookEffects.map((entry) =>
                entry.effect ? (
                  <Box key={entry.id} sx={{ display: "flex", gap: 1, mb: 0.75 }}>
                    <Typography
                      variant="caption"
                      color={customTheme.primary}
                      sx={{
                        fontWeight: "600",
                        minWidth: 22,
                        flexShrink: 0,
                        pt: "2px",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.3px"
                      }}>
                      {entry.id}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="div"
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.5
                      }}>{md(entry.effect)}</Typography>
                  </Box>
                ) : null
              )}
            </>
          );
        }
        return (
          <Typography
            variant="body2"
            component="div"
            sx={{
              color: "text.secondary",
              lineHeight: 1.5
            }}>{md(item.effect ?? "")}</Typography>
        );
      case "default":
        return null;
      default:
        return null;
    }
  };

  const typeLabel = {
    gift: "Gift",
    dance: "Dance",
    therioform: "Therioform",
    magichant: item.magichantSubtype === "key" || item.type || item.status || item.attribute || item.recovery ? "Key" : "Tone",
    symbol: "Symbol",
    invocation: "Invocation",
    magiseed: "Magiseed",
    arcanist: "Arcanum",
    "arcanist-rework": "Arcanum",
    "tinkerer-alchemy": "Alchemy",
    "tinkerer-infusion": "Infusion",
    "pilot-vehicle": pilotSubtype === "frame" ? "Vehicle Frame"
      : pilotSubtype === "armor" ? "Armor Module"
        : pilotSubtype === "weapon" ? "Weapon Module"
          : pilotSubtype === "support" ? "Support Module"
            : "Pilot Vehicle",
    cooking: "Delicacy",
    default: "Spell",
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
          <Typography
            variant="body2"
            sx={{
              color: "inherit",
              textTransform: "uppercase",
              fontWeight: 600,
              fontSize: "0.85rem",
              letterSpacing: "0.5px",
              lineHeight: 1.4
            }}>
            {t(typeLabel)}
          </Typography>
        </Box>
        <Box
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "8px",
          }}
        >
          <Typography
            sx={{
              fontWeight: "600",
              fontSize: "0.95rem"
            }}>{t(item.name)}</Typography>
        </Box>
        <Box sx={{ px: 1, py: 1 }}>
          {renderBody()}
        </Box>
      </Stack>
    </Card>
  );
});

// 
// AttackCard
// 

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


          onClick={onHeaderClick}
          sx={{
            justifyContent: "space-between", alignItems: "center",
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            "& .MuiTypography-root": {
              fontSize: "0.85rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              lineHeight: 1.4,
            },
          }}
        >
          <Grid size={3}>
            <Typography variant="h4">{t(attack.category)}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              {t("Accuracy")}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              {t("Damage")}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              {t("Range")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 1 – stats */}
        <Grid container

          sx={{
            justifyContent: "space-between", alignItems: "center",
            background,
            px: 1,
            py: "5px",
          }}
        >
          <Grid sx={{ display: "flex", alignItems: "center" }} size={3}>
            <Typography
              sx={{
                fontWeight: "bold",
                mr: 0.5
              }}>
              {t(attack.name)}
            </Typography>
            {attack.martial && <Martial />}
          </Grid>
          <Grid size={3}>
            <Typography
              sx={{
                fontWeight: "bold",
                textAlign: "center"
              }}>
              {attr1 && attr2 ? (
                <>
                  <OpenBracket />
                  {attr1.shortcaps} + {attr2.shortcaps}
                  <CloseBracket />
                  {attack.flathit > 0 ? `+${attack.flathit}` : ""}
                </>
              ) : (
                " - "
              )}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography
              sx={{
                fontWeight: "bold",
                textAlign: "center"
              }}>
              <OpenBracket />
              HR + {attack.flatdmg}
              <CloseBracket />
              {dmgType?.long}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ textAlign: "center" }}>{t(attack.range)}</Typography>
          </Grid>
        </Grid>

        {/* Special row */}
        {attack.special?.length > 0 && (
          <Grid container sx={{ px: 1, py: "4px" }}>
            <Grid size={12}>
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

// 
// QualityCard
// 

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


          onClick={onHeaderClick}
          sx={{
            justifyContent: "space-between", alignItems: "center",
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            "& .MuiTypography-root": {
              fontSize: "0.85rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              lineHeight: 1.4,
            },
          }}
        >
          <Grid size={8}>
            <Typography variant="h4">{t("Quality")}</Typography>
          </Grid>
          <Grid size={4}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>
              {t("Cost")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + cost */}
        <Grid
          container


          sx={{
            justifyContent: "space-between", alignItems: "center",
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid size={8}>
            <Typography sx={{
              fontWeight: "bold"
            }}>{t(quality.name)}</Typography>
          </Grid>
          <Grid size={4}>
            <Typography sx={{ textAlign: "center" }}>{`${quality.cost}z`}</Typography>
          </Grid>
        </Grid>

        {/* Row 2 – category and filter */}
        <Grid
          container


          sx={{
            justifyContent: "space-between", alignItems: "center",
            backgroundColor: background2,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid >
            <Typography variant="body2" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
              {t(quality.category)}
            </Typography>
          </Grid>
          <Grid >
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {quality.filter?.map((f) => (
                <Chip key={f} label={t(f)} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Effect */}
        <Box sx={{ px: 1, py: 0.75 }}>
          <Typography variant="body2" component="div">
            <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
              {t(quality.quality)}
            </StyledMarkdown>
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
});

//
// Pre-filtered static spell-type data (computed once at module load, not per-render)
//
const _giftItems = availableGifts.filter(g => !g.name.includes("_custom_"));
const _danceItems = availableDances.filter(d => !d.name.includes("_custom_"));
const _therioformItems = availableTherioforms.filter(tf => !tf.name.includes("_custom_"));
const _magichantKeyItems = availableMagichantKeys.filter((key) => !key.name.includes("_custom_"));
const _magichantToneItems = availableMagichantTones.filter((tone) => !tone.name.includes("_custom_"));
const _symbolItems = availableSymbols.filter(s => !s.name.includes("_custom_"));
const _invocationsByWellspringEntries = Object.entries(invocationsByWellspring);
const _cookingEffects = getDelicacyEffects(staticT);
const _tinkererAlchemyTargets = tinkererAlchemy.targets;
const _tinkererAlchemyEffects = tinkererAlchemy.effects;

// Pre-build tinkerer-infusion byRank grouping
const _tinkererInfusionByRank = {};
tinkererInfusion.effects.forEach(eff => {
  const r = eff.infusionRank;
  if (!_tinkererInfusionByRank[r]) _tinkererInfusionByRank[r] = [];
  _tinkererInfusionByRank[r].push(eff);
});

const _pilotArmorModules = availableModules.armor.filter(m => m.name !== "pilot_custom_armor");
const _pilotWeaponModules = availableModules.weapon;
const _pilotSupportModules = availableModules.support.filter(m => m.name !== "pilot_custom_support");

//
// Per-character spell-type content renderer (internal)
//

function renderSpellTypeContent(sc, t, customTheme) {
  const border = { borderTop: `1px solid ${customTheme.secondary}` };
  const itemSx = { ...border, px: 2, py: 0.75 };
  const sectionHeaderSx = {
    ...border, px: 2, py: 0.5,
    backgroundColor: `${customTheme.primary}11`,
  };
  const captionHeader = (label) => (
    <Typography
      variant="caption"
      sx={{
        fontWeight: "bold",
        color: "text.secondary",
        textTransform: "uppercase",
        letterSpacing: "0.05em"
      }}>
      {label}
    </Typography>
  );
  const md = (text) => (
    <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>{text}</StyledMarkdown>
  );

  switch (sc) {

    case "gift":
      return _giftItems.map((g, i) => (
          <Box key={i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, mb: 0.25, flexWrap: "wrap" }}>
              <Typography variant="body2" sx={{
                fontWeight: "bold"
              }}>{t(g.name)}</Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontStyle: "italic"
                }}>
                {md(t(g.event))}
              </Typography>
            </Box>
            <Typography variant="body2" component="div" sx={{
              color: "text.secondary"
            }}>{md(t(g.effect))}</Typography>
          </Box>
        ));

    case "dance":
      return _danceItems.map((d, i) => (
          <Box key={i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
              <Typography variant="body2" sx={{
                fontWeight: "bold"
              }}>{t(d.name)}</Typography>
              {d.duration && (
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>· {t(d.duration)}</Typography>
              )}
            </Box>
            <Typography variant="body2" component="div" sx={{
              color: "text.secondary"
            }}>{md(t(d.effect))}</Typography>
          </Box>
        ));

    case "therioform":
      return _therioformItems.map((tf, i) => (
          <Box key={i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, mb: 0.25, flexWrap: "wrap" }}>
              <Typography variant="body2" sx={{
                fontWeight: "bold"
              }}>{t(tf.name)}</Typography>
              {tf.genoclepsis && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontStyle: "italic"
                  }}>
                  {md(t(tf.genoclepsis))}
                </Typography>
              )}
            </Box>
            <Typography variant="body2" component="div" sx={{
              color: "text.secondary"
            }}>{md(t(tf.description))}</Typography>
          </Box>
        ));

    case "magichant":
      return [
        <Box key="keys_h" sx={sectionHeaderSx}>{captionHeader(t("magichant_key"))}</Box>,
        ..._magichantKeyItems.map((key, i) => (
            <Box key={`key_${i}`} sx={itemSx}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  mb: 0.25
                }}>{t(key.name)}</Typography>
              <Typography variant="body2" sx={{
                color: "text.secondary"
              }}>
                {[t(key.type || ""), t(key.status || "")].filter(Boolean).join(" · ")}
              </Typography>
              <Typography variant="body2" sx={{
                color: "text.secondary"
              }}>
                {[t(key.attribute || ""), t(key.recovery || "")].filter(Boolean).join(" / ")}
              </Typography>
            </Box>
          )),
        <Box key="tones_h" sx={sectionHeaderSx}>{captionHeader(t("magichant_tone"))}</Box>,
        ..._magichantToneItems.map((tone, i) => (
            <Box key={`tone_${i}`} sx={itemSx}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  mb: 0.25
                }}>{t(tone.name)}</Typography>
              <Typography variant="body2" component="div" sx={{
                color: "text.secondary"
              }}>{md(t(tone.effect))}</Typography>
            </Box>
          )),
      ];

    case "symbol":
      return _symbolItems.map((s, i) => (
          <Box key={i} sx={itemSx}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                mb: 0.25
              }}>{t(s.name)}</Typography>
            <Typography variant="body2" component="div" sx={{
              color: "text.secondary"
            }}>{md(t(s.effect))}</Typography>
          </Box>
        ));

    case "invocation":
      return _invocationsByWellspringEntries.flatMap(([wellspring, invocations]) => [
        <Box key={wellspring + "_h"} sx={sectionHeaderSx}>{captionHeader(wellspring)}</Box>,
        ...invocations.map((inv, i) => (
          <Box key={wellspring + i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
              <Typography variant="body2" sx={{
                fontWeight: "bold"
              }}>{t(inv.name)}</Typography>
              <Chip label={inv.type} size="small" variant="outlined"
                sx={{ fontSize: "0.6rem", height: 16 }} />
            </Box>
            <Typography variant="body2" component="div" sx={{
              color: "text.secondary"
            }}>{md(t(inv.effect))}</Typography>
          </Box>
        )),
      ]);

    case "magiseed":
      return magiseeds.map((ms, i) => (
        <Box key={i} sx={itemSx}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              mb: 0.25
            }}>{t(ms.name)}</Typography>
          <Typography
            variant="body2"
            component="div"
            sx={{
              color: "text.secondary",
              mb: 0.5
            }}>{md(t(ms.description))}</Typography>
          {Array.from({ length: ms.rangeEnd - ms.rangeStart + 1 }, (_, j) => {
            const tier = ms.rangeStart + j;
            const effect = ms.effects[tier];
            return effect ? (
              <Box key={tier} sx={{ display: "flex", gap: 1, mb: 0.25 }}>
                <Typography
                  variant="caption"
                  color={`${customTheme.primary}`}
                  sx={{
                    fontWeight: "bold",
                    minWidth: 22,
                    flexShrink: 0,
                    pt: "1px"
                  }}>
                  T{tier}
                </Typography>
                <Typography variant="body2" component="div" sx={{
                  color: "text.secondary"
                }}>{md(t(effect))}</Typography>
              </Box>
            ) : null;
          })}
        </Box>
      ));

    case "cooking":
      return _cookingEffects.map((eff, i) => (
        <Box key={i} sx={itemSx}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: "bold",
                color: "text.secondary",
                minWidth: 22,
                flexShrink: 0,
                pt: "1px"
              }}>
              {eff.id}.
            </Typography>
            <Typography variant="body2" component="div" sx={{
              color: "text.secondary"
            }}>{md(eff.effect)}</Typography>
          </Box>
        </Box>
      ));

    case "tinkerer-alchemy":
      return [
        <Box key="targets_h" sx={sectionHeaderSx}>{captionHeader(t("Targets"))}</Box>,
        ..._tinkererAlchemyTargets.map((target, i) => (
          <Box key={"t" + i} sx={itemSx}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  color: "text.secondary",
                  minWidth: 36,
                  flexShrink: 0,
                  pt: "1px"
                }}>
                {target.rangeFrom === target.rangeTo
                  ? target.rangeFrom
                  : `${target.rangeFrom}–${target.rangeTo}`}
              </Typography>
              <Typography variant="body2" component="div" sx={{
                color: "text.secondary"
              }}>{md(target.effect)}</Typography>
            </Box>
          </Box>
        )),
        <Box key="effects_h" sx={sectionHeaderSx}>{captionHeader(t("Effects"))}</Box>,
        ...tinkererAlchemy.effects.map((eff, i) => (
          <Box key={"e" + i} sx={itemSx}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  color: "text.secondary",
                  minWidth: 24,
                  flexShrink: 0,
                  pt: "1px"
                }}>
                {eff.dieValue}
              </Typography>
              <Typography variant="body2" component="div" sx={{
                color: "text.secondary"
              }}>{md(eff.effect)}</Typography>
            </Box>
          </Box>
        )),
      ];

    case "tinkerer-infusion":
      return Object.entries(_tinkererInfusionByRank).flatMap(([rank, effs]) => [
        <Box key={"rank_" + rank} sx={sectionHeaderSx}>
          {captionHeader(`${t("Rank")} ${rank}`)}
        </Box>,
        ...effs.map((eff, i) => (
          <Box key={"r" + rank + "_" + i} sx={itemSx}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                mb: 0.25
              }}>{eff.name}</Typography>
            <Typography variant="body2" component="div" sx={{
              color: "text.secondary"
            }}>{md(eff.effect)}</Typography>
          </Box>
        )),
      ]);

    case "tinkerer-magitech":
      return [
        { rankLabel: t("Basic"), name: t("Magitech Override"), descKeys: ["MagitechOverride_desc"] },
        { rankLabel: t("Advanced"), name: t("Magicannon"), descKeys: ["Magicannon_desc1", "Magicannon_desc2"] },
        { rankLabel: t("Superior"), name: t("Magispheres"), descKeys: ["Magispheres_desc1", "Magispheres_desc2", "Magispheres_desc3"] },
      ].flatMap((rank, ri) => [
        <Box key={"mtr_" + ri} sx={sectionHeaderSx}>
          {captionHeader(`${rank.rankLabel}  -  ${rank.name}`)}
        </Box>,
        <Box key={"mtc_" + ri} sx={itemSx}>
          {rank.descKeys.map((key, ki) => (
            <Typography
              key={ki}
              variant="body2"
              component="div"
              sx={{
                color: "text.secondary",
                mb: ki < rank.descKeys.length - 1 ? 0.5 : 0
              }}>
              {md(t(key))}
            </Typography>
          ))}
        </Box>,
      ]);

    case "arcanist":
    case "arcanist-rework":
      return arcanumList.flatMap((arc, i) => [
        <Box key={"arc_h_" + i} sx={sectionHeaderSx}>
          {captionHeader(arc.name)}
        </Box>,
        <Box key={"arc_domain_" + i} sx={itemSx}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              mb: 0.25
            }}>{t("Domain")}</Typography>
          <Typography variant="body2" component="div" sx={{
            color: "text.secondary"
          }}>{md(t(arc.domainDesc))}</Typography>
        </Box>,
        <Box key={"arc_merge_" + i} sx={itemSx}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              textTransform: "uppercase",
              mb: 0.25
            }}>{t("Merge")}</Typography>
          <Typography variant="body2" component="div" sx={{
            color: "text.secondary"
          }}>{md(t(arc.mergeDesc))}</Typography>
        </Box>,
        <Box key={"arc_dismiss_" + i} sx={itemSx}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              textTransform: "uppercase",
              mb: 0.25
            }}>{t("Dismiss")}</Typography>
          <Typography variant="body2" component="div" sx={{
            color: "text.secondary"
          }}>{md(t(arc.dismissDesc))}</Typography>
        </Box>,
      ]);

    case "pilot-vehicle":
      return [
        <Box key="frames_h" sx={sectionHeaderSx}>{captionHeader(t("Frames"))}</Box>,
        ...availableFrames.map((frame, i) => (
          <Box key={"fr" + i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25, flexWrap: "wrap" }}>
              <Typography variant="body2" sx={{
                fontWeight: "bold"
              }}>{t(frame.name)}</Typography>
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>
                {t("Passengers")}: {frame.passengers} · {t("Distance")}: {frame.distance}
              </Typography>
            </Box>
            <Typography variant="body2" component="div" sx={{
              color: "text.secondary"
            }}>{md(t(frame.description))}</Typography>
          </Box>
        )),

        <Box key="armor_h" sx={sectionHeaderSx}>{captionHeader(t("Armor Modules"))}</Box>,
        ..._pilotArmorModules.map((m, i) => (
            <Box key={"am" + i} sx={itemSx}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                <Typography variant="body2" sx={{
                  fontWeight: "bold"
                }}>{t(m.name)}</Typography>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>
                  DEF {m.def} · MDEF {m.mdef}{m.martial ? " · Martial" : ""}
                </Typography>
              </Box>
            </Box>
          )),

        <Box key="weapon_h" sx={sectionHeaderSx}>{captionHeader(t("Weapon Modules"))}</Box>,
        ..._pilotWeaponModules.map((m, i) => (
          <Box key={"wm" + i} sx={itemSx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
              <Typography variant="body2" sx={{
                fontWeight: "bold"
              }}>{t(m.name)}</Typography>
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>
                {m.category} · HR+{m.damage} · {m.range}
                {m.prec !== 0 ? ` · +${m.prec} acc` : ""}
                {m.cumbersome ? " · Cumbersome" : ""}
              </Typography>
            </Box>
          </Box>
        )),

        <Box key="support_h" sx={sectionHeaderSx}>{captionHeader(t("Support Modules"))}</Box>,
        ..._pilotSupportModules.map((m, i) => (
            <Box key={"sm" + i} sx={itemSx}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  mb: m.description ? 0.25 : 0
                }}>
                {t(m.name)}
              </Typography>
              {m.description && (
                <Typography variant="body2" component="div" sx={{
                  color: "text.secondary"
                }}>{md(t(m.description))}</Typography>
              )}
            </Box>
          )),
      ];

    default:
      return null;
  }
}

// 
// ClassCard
// 

export const ClassCard = React.memo(function ClassCard({ cls, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();
  const [expandedSpellAccordion, setExpandedSpellAccordion] = React.useState(null);

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
            sx={{
              color: "inherit",
              textTransform: "uppercase",
              fontSize: "1.1rem",
              fontWeight: "bold"
            }}>
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
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                mb: 0.5,
                textTransform: "uppercase",
                fontSize: "0.75rem",
                letterSpacing: "0.05em"
              }}>
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
          const classSpells = spellsByClass[cls.name] || [];
          const hasCustomSpells =
            cls.benefits?.spellClasses?.length > 0 && classSpells.length === 0;
          if (!cls.benefits?.spellClasses?.length && classSpells.length === 0)
            return null;
          return (
            <Accordion disableGutters elevation={0} square
              expanded={expandedSpellAccordion === cls.name}
              onChange={(_, isExpanded) => setExpandedSpellAccordion(isExpanded ? cls.name : null)}
              sx={{ borderTop: `1px solid ${customTheme.secondary}`, "&:before": { display: "none" } }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 40, "& .MuiAccordionSummary-content": { my: 0.5 } }}>
                <Typography variant="body2" sx={{
                  fontWeight: "bold"
                }}>
                  {t("Spells")}
                  {classSpells.length > 0 && (
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        ml: 1
                      }}>
                      ({classSpells.length})
                    </Typography>
                  )}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {expandedSpellAccordion === cls.name && (
                  <>
                    {hasCustomSpells ? (
                      /* Per-character spell types */
                      (cls.benefits.spellClasses.map((sc) => {
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
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "text.secondary",
                                  fontStyle: "italic"
                                }}>
                                {t("Defined per character")}
                              </Typography>
                            )}
                          </Box>
                          {descKeys.map((key) => (
                            <Typography
                              key={key}
                              variant="body2"
                              component="div"
                              sx={{
                                color: "text.secondary",
                                mb: 0.5
                              }}>
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
                  }))
                ) : (
                  /* Static spell list (default / gamble types) */
                  (classSpells.map((spell, i) => (
                    <Box
                      key={i}
                      sx={{
                        borderTop: `1px solid ${customTheme.secondary}`,
                        px: 2,
                        py: 0.75,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
                        <Typography variant="body2" sx={{
                          fontWeight: "bold"
                        }}>
                          {t(spell.name)}
                        </Typography>
                        <Chip
                          label={spell.isOffensive ? t("Offensive") : t("Support")}
                          size="small"
                          color={spell.isOffensive ? "error" : "success"}
                          variant="outlined"
                          sx={{ fontSize: "0.6rem", height: 16 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            ml: "auto"
                          }}>
                          {spell.mp} MP
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, mb: 0.25 }}>
                        <Typography variant="caption" sx={{
                          color: "text.secondary"
                        }}>
                          {spell.targetDesc}
                        </Typography>
                        <Typography variant="caption" sx={{
                          color: "text.secondary"
                        }}>·</Typography>
                        <Typography variant="caption" sx={{
                          color: "text.secondary"
                        }}>
                          {spell.duration}
                        </Typography>
                        {spell.attr1 && spell.attr2 && (
                          <>
                            <Typography variant="caption" sx={{
                              color: "text.secondary"
                            }}>·</Typography>
                            <Typography variant="caption" sx={{
                              color: "text.secondary"
                            }}>
                              {attributes[spell.attr1]?.shortcaps} + {attributes[spell.attr2]?.shortcaps}
                            </Typography>
                          </>
                        )}
                      </Box>
                      {spell.spellType === "gamble" ? (
                        <>
                          <Typography
                            variant="body2"
                            component="div"
                            sx={{
                              color: "text.secondary",
                              mb: 0.5
                            }}>
                            <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                              {t("GambleSpell_desc")}
                            </StyledMarkdown>
                          </Typography>
                          {spell.targets?.map((target, j) => (
                            <Box key={j} sx={{ display: "flex", gap: 1, mb: 0.25 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: "bold",
                                  color: "text.secondary",
                                  minWidth: 32,
                                  flexShrink: 0,
                                  pt: "1px"
                                }}>
                                {target.rangeFrom === target.rangeTo
                                  ? target.rangeFrom
                                  : `${target.rangeFrom}–${target.rangeTo}`}
                              </Typography>
                              <Typography variant="body2" component="div" sx={{
                                color: "text.secondary"
                              }}>
                                <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                                  {target.effect}
                                </StyledMarkdown>
                              </Typography>
                            </Box>
                          ))}
                        </>
                      ) : (
                        <Typography variant="body2" component="div" sx={{
                          color: "text.secondary"
                        }}>
                          <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                            {t(spell.description)}
                          </StyledMarkdown>
                        </Typography>
                      )}
                    </Box>
                  )))
                )}
                  </>
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
              <Typography variant="body2" sx={{
                fontWeight: "bold"
              }}>
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
              <Typography variant="body2" component="div" sx={{
                color: "text.secondary"
              }}>
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

// 
// SpecialRuleCard
// 

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
          <Typography
            variant="h4"
            sx={{
              color: "inherit",
              textTransform: "uppercase",
              fontSize: "1.1rem",
              fontWeight: "bold"
            }}>
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
          <Typography sx={{
            fontWeight: "bold"
          }}>{item.name}</Typography>
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

// 
// ActionCard
// 

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
          <Typography
            variant="h4"
            sx={{
              color: "inherit",
              textTransform: "uppercase",
              fontSize: "1.1rem",
              fontWeight: "bold"
            }}>
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
          <Typography sx={{
            fontWeight: "bold"
          }}>{item.name}</Typography>
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

// 
// HeroicCard
// 

// 
// CustomWeaponCard
// 

export const CustomWeaponCard = React.memo(function CustomWeaponCard({ weapon, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const { precision, damage } = calculateCustomWeaponStats(weapon, false);
  const att1KeyRaw = Array.isArray(weapon.accuracyCheck)
    ? weapon.accuracyCheck[0]
    : weapon.accuracyCheck?.att1;
  const att2KeyRaw = Array.isArray(weapon.accuracyCheck)
    ? weapon.accuracyCheck[1]
    : weapon.accuracyCheck?.att2;
  const att1Key = att1KeyRaw || "dexterity";
  const att2Key = att2KeyRaw || "might";
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


          onClick={onHeaderClick}
          sx={{
            justifyContent: "space-between", alignItems: "center",
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            "& .MuiTypography-root": { fontSize: "0.9rem", textTransform: "uppercase" },
          }}
        >
          <Grid size={4}>
            <Typography variant="h4">{t("Custom Weapon")}</Typography>
          </Grid>
          <Grid size={2}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>{t("Cost")}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>{t("Accuracy")}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>{t("Damage")}</Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + stats */}
        <Grid
          container


          sx={{
            justifyContent: "space-between", alignItems: "center",
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid sx={{ display: "flex", alignItems: "center" }} size={4}>
            <Typography
              sx={{
                fontWeight: "bold",
                mr: 0.5
              }}>{weapon.name}</Typography>
            {weapon.martial && <Martial />}
          </Grid>
          <Grid size={2}>
            <Typography sx={{ textAlign: "center" }}>{`${weapon.cost || 300}z`}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography
              sx={{
                fontWeight: "bold",
                textAlign: "center"
              }}>
              <OpenBracket />
              {attr1?.shortcaps} + {attr2?.shortcaps}
              <CloseBracket />
              {precision > 0 ? `+${precision}` : ""}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography
              sx={{
                fontWeight: "bold",
                textAlign: "center"
              }}>
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

          sx={{
            justifyContent: "space-between",
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid size={4}>
            <Typography
              sx={{
                fontWeight: "600",
                fontSize: "0.9rem"
              }}>{t(weapon.category)}</Typography>
          </Grid>
          <Grid size={1}>
            <Diamond color={customTheme.primary} />
          </Grid>
          <Grid size={3}>
            <Typography sx={{ textAlign: "center" }}>
              {weapon.hands === 1 ? t("One-handed") : t("Two-handed")}
            </Typography>
          </Grid>
          <Grid size={1}>
            <Diamond color={customTheme.primary} />
          </Grid>
          <Grid size={3}>
            <Typography sx={{ textAlign: "center" }}>
              {isRanged ? t("Ranged") : t("Melee")}
            </Typography>
          </Grid>
        </Grid>

        {/* Row 3 – quality */}
        {weapon.quality && (
          <Box sx={{ px: 1, py: 0.75 }}>
            <Typography variant="body2" component="div">
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

// 
// AccessoryCard
// 

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


          onClick={onHeaderClick}
          sx={{
            justifyContent: "space-between", alignItems: "center",
            p: 1,
            background: customTheme.primary,
            color: "#ffffff",
            cursor: onHeaderClick ? "pointer" : "default",
            "& .MuiTypography-root": { fontSize: "0.9rem", textTransform: "uppercase" },
          }}
        >
          <Grid size={9}>
            <Typography variant="h4">{t("Accessory")}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="h4" sx={{ textAlign: "center" }}>{t("Cost")}</Typography>
          </Grid>
        </Grid>

        {/* Row 1 – name + cost */}
        <Grid
          container


          sx={{
            justifyContent: "space-between", alignItems: "center",
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 1,
            py: "5px",
          }}
        >
          <Grid size={9}>
            <Typography sx={{
              fontWeight: "bold"
            }}>{accessory.name}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ textAlign: "center" }}>{`${accessory.cost}z`}</Typography>
          </Grid>
        </Grid>

        {/* quality row */}
        {accessory.quality && (
          <Box sx={{ px: 1, py: 0.75 }}>
            <Typography variant="body2" component="div">
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

//
// VehicleModuleCard
//

export const VehicleModuleCard = React.memo(function VehicleModuleCard({ module, id, onHeaderClick }) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();

  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  const getModuleName = () => {
    if (module.name === "pilot_custom_armor" || module.name === "pilot_custom_weapon" || module.name === "pilot_custom_support") {
      return module.customName;
    }
    return t(module.name);
  };

  // SUPPORT MODULE (and default) - follows AccessoryCard format - CHECK FIRST
  if (module.type === "pilot_module_support") {
    return (
      <Card id={id} elevation={1}>
        <Stack>
          {/* Header */}
          <Grid
            container


            onClick={onHeaderClick}
            sx={{
              justifyContent: "space-between", alignItems: "center",
              p: 1,
              background: customTheme.primary,
              color: "#ffffff",
              cursor: onHeaderClick ? "pointer" : "default",
              "& .MuiTypography-root": {
                fontSize: "0.85rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                lineHeight: 1.4,
              },
            }}
          >
            <Grid size={3}>
              <Typography variant="h4" sx={{ fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
                {t("Support Module")}
              </Typography>
            </Grid>
            <Grid size={3}>
              <Typography variant="h4" sx={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
                {t("Cost")}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="h4" sx={{ textAlign: "right", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
                {t("Type")}
              </Typography>
            </Grid>
          </Grid>

          {/* Row 1 – name + stats */}
          <Grid
            container


            sx={{
              justifyContent: "space-between", alignItems: "center",
              background,
              borderBottom: `1px solid ${customTheme.secondary}`,
              px: 1,
              py: "5px",
            }}
          >
            <Grid sx={{ display: "flex", alignItems: "center" }} size={3}>
              <Typography
                sx={{
                  fontWeight: "600",
                  fontSize: "0.9rem"
                }}>
                {getModuleName()}
              </Typography>
            </Grid>
            <Grid size={3}>
              <Typography sx={{ textAlign: "center" }}>{module.cost ? `${module.cost}z` : " - "}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography sx={{ textAlign: "right", fontSize: "0.9rem" }}>
                {module.category ? t(module.category) : " - "}
              </Typography>
            </Grid>
          </Grid>

          {/* Quality row (optional) */}
          {module.quality && (
            <Box sx={{ px: 1, py: 0.75 }}>
              <Typography variant="body2" component="div">
                <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                  {module.quality}
                </StyledMarkdown>
              </Typography>
            </Box>
          )}

          {/* Description row (optional) */}
          {module.description && (
            <Box sx={{ px: 1, py: 0.75, borderTop: `1px solid ${customTheme.secondary}` }}>
              <Typography variant="body2" component="div">
                <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                  {t(module.description)}
                </StyledMarkdown>
              </Typography>
            </Box>
          )}
        </Stack>
      </Card>
    );
  }

  // ARMOR MODULE - follows ArmorCard format
  if (module.type === "pilot_module_armor") {
    return (
      <Card id={id} elevation={1}>
        <Stack>
          {/* Header */}
          <Grid
            container


            onClick={onHeaderClick}
            sx={{
              justifyContent: "space-between", alignItems: "center",
              p: 1,
              background: customTheme.primary,
              color: "#ffffff",
              cursor: onHeaderClick ? "pointer" : "default",
              "& .MuiTypography-root": {
                fontSize: "0.85rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                lineHeight: 1.4,
              },
            }}
          >
            <Grid size={3}>
              <Typography variant="h4" sx={{ fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
                {t("Armor Module")}
              </Typography>
            </Grid>
            <Grid size={2}>
              <Typography variant="h4" sx={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
                {t("Cost")}
              </Typography>
            </Grid>
            <Grid size={2}>
              <Typography variant="h4" sx={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
                {t("Defense")}
              </Typography>
            </Grid>
            <Grid size={3}>
              <Typography variant="h4" sx={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
                {t("M. Defense")}
              </Typography>
            </Grid>
            <Grid size={2}>
              <Typography variant="h4" sx={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
                {t("Type")}
              </Typography>
            </Grid>
          </Grid>

          {/* Row 1 – name + stats */}
          <Grid
            container


            sx={{
              justifyContent: "space-between", alignItems: "center",
              background,
              borderBottom: `1px solid ${customTheme.secondary}`,
              px: 1,
              py: "5px",
            }}
          >
            <Grid sx={{ display: "flex", alignItems: "center" }} size={3}>
              <Typography
                sx={{
                  fontWeight: "600",
                  fontSize: "0.9rem"
                }}>
                {getModuleName()}
              </Typography>
            </Grid>
            <Grid size={2}>
              <Typography sx={{ textAlign: "center" }}>{module.cost ? `${module.cost}z` : " - "}</Typography>
            </Grid>
            <Grid size={2}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  textAlign: "center"
                }}>
                {module.def ?? " - "}
              </Typography>
            </Grid>
            <Grid size={3}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  textAlign: "center"
                }}>
                {module.mdef ?? " - "}
              </Typography>
            </Grid>
            <Grid size={2}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  textAlign: "center"
                }}>
                {module.martial ? t("Martial") : " - "}
              </Typography>
            </Grid>
          </Grid>

          {/* Quality row (optional) */}
          {module.quality && (
            <Box sx={{ px: 1, py: 0.75 }}>
              <Typography variant="body2" component="div">
                <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                  {module.quality}
                </StyledMarkdown>
              </Typography>
            </Box>
          )}

          {/* Description row (optional) */}
          {module.description && (
            <Box sx={{ px: 1, py: 0.75, borderTop: `1px solid ${customTheme.secondary}` }}>
              <Typography variant="body2" component="div">
                <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                  {t(module.description)}
                </StyledMarkdown>
              </Typography>
            </Box>
          )}
        </Stack>
      </Card>
    );
  }

  // WEAPON MODULE - follows WeaponCard format
  if (module.type === "pilot_module_weapon") {
    const attr1 = attributes[module.att1];
    const attr2 = attributes[module.att2];
    return (
      <Card id={id} elevation={1}>
        <Stack>
          {/* Header */}
          <Grid
            container


            onClick={onHeaderClick}
            sx={{
              justifyContent: "space-between", alignItems: "center",
              p: 1,
              background: customTheme.primary,
              color: "#ffffff",
              cursor: onHeaderClick ? "pointer" : "default",
              "& .MuiTypography-root": {
                fontSize: "0.85rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                lineHeight: 1.4,
              },
            }}
          >
            <Grid size={4}>
              <Typography variant="h4" sx={{ fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
                {t("Weapon Module")}
              </Typography>
            </Grid>
            <Grid size={2}>
              <Typography variant="h4" sx={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
                {t("Cost")}
              </Typography>
            </Grid>
            <Grid size={3}>
              <Typography variant="h4" sx={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
                {t("Accuracy")}
              </Typography>
            </Grid>
            <Grid size={3}>
              <Typography variant="h4" sx={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.5px", lineHeight: 1.4 }}>
                {t("Damage")}
              </Typography>
            </Grid>
          </Grid>

          {/* Row 1 – name + stats */}
          <Grid
            container


            sx={{
              justifyContent: "space-between", alignItems: "center",
              background,
              borderBottom: `1px solid ${customTheme.secondary}`,
              px: 1,
              py: "5px",
            }}
          >
            <Grid sx={{ display: "flex", alignItems: "center" }} size={4}>
              <Typography
                sx={{
                  fontWeight: "600",
                  fontSize: "0.9rem"
                }}>
                {getModuleName()}
              </Typography>
            </Grid>
            <Grid size={2}>
              <Typography sx={{ textAlign: "center" }}>{module.cost ? `${module.cost}z` : " - "}</Typography>
            </Grid>
            <Grid size={3}>
              <Typography
                sx={{
                  fontWeight: "600",
                  textAlign: "center"
                }}>
                <OpenBracket />
                {attr1?.shortcaps || "?"} + {attr2?.shortcaps || "?"}
                <CloseBracket />
                {module.prec && module.prec > 0 ? `+${module.prec}` : ""}
              </Typography>
            </Grid>
            <Grid size={3}>
              <Typography
                sx={{
                  fontWeight: "600",
                  textAlign: "center"
                }}>
                <OpenBracket />
                {t("HR +")} {module.damage ?? 0}
                <CloseBracket />
                {module.damageType ? t(module.damageType) : ""}
              </Typography>
            </Grid>
          </Grid>

          {/* Row 2 – category / range */}
          <Grid
            container

            sx={{
              justifyContent: "space-between",
              borderBottom: `1px solid ${customTheme.secondary}`,
              px: 1,
              py: "5px",
            }}
          >
            <Grid size={4}>
              <Typography
                sx={{
                  fontWeight: "600",
                  fontSize: "0.9rem"
                }}>
                {module.category ? t(module.category) : " - "}
              </Typography>
            </Grid>
            <Grid size={2}>
              <Diamond color={customTheme.primary} />
            </Grid>
            <Grid size={3}>
              <Typography sx={{ textAlign: "center" }}>
                {module.range ? t(module.range) : " - "}
              </Typography>
            </Grid>
            <Grid size={1}>
              <Diamond color={customTheme.primary} />
            </Grid>
            <Grid sx={{ textAlign: "right" }} size={2}>
              <Typography>{module.martial ? t("Martial") : " - "}</Typography>
            </Grid>
          </Grid>

          {/* Quality row (optional) */}
          {module.quality && (
            <Box sx={{ px: 1, py: 0.75 }}>
              <Typography variant="body2" component="div">
                <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                  {module.quality}
                </StyledMarkdown>
              </Typography>
            </Box>
          )}

          {/* Description row (optional) */}
          {module.description && (
            <Box sx={{ px: 1, py: 0.75, borderTop: `1px solid ${customTheme.secondary}` }}>
              <Typography variant="body2" component="div">
                <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
                  {t(module.description)}
                </StyledMarkdown>
              </Typography>
            </Box>
          )}
        </Stack>
      </Card>
    );
  }

  // Fallback/default should not reach here but just in case
  return null;
});

//
// SkillCard
//

export const SkillCard = React.memo(function SkillCard({ skill, id, onHeaderClick }) {
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
          <Typography
            variant="h4"
            sx={{
              color: "inherit",
              textTransform: "uppercase",
              fontSize: "1rem",
              fontWeight: "bold"
            }}>
            {t(skill.className)}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={`SL ${skill.currentLvl}`}
              size="small"
              sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff", fontWeight: "bold", fontSize: "0.7rem" }}
            />
            {skill.isHomebrew && (
              <Chip
                label="Homebrew"
                size="small"
                sx={{ backgroundColor: "rgba(255,165,0,0.3)", color: "#ffffff", fontWeight: "bold", fontSize: "0.65rem" }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ background, borderBottom: `1px solid ${customTheme.secondary}`, px: 2, py: "6px" }}>
          <Typography sx={{
            fontWeight: "bold"
          }}>{skill.isHomebrew ? skill.skillName : t(skill.skillName)}</Typography>
        </Box>
        {skill.description && (
          <Box sx={{ px: 2, py: 1, fontSize: "0.875rem" }}>
            <StyledMarkdown allowedElements={["p", "strong", "em", "ul", "ol", "li", "br"]} unwrapDisallowed>
              {skill.isHomebrew ? skill.description : t(skill.description)}
            </StyledMarkdown>
          </Box>
        )}
      </Stack>
    </Card>
  );
});

//
// HeroicCard
//

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
            sx={{
              color: "inherit",
              textTransform: "uppercase",
              fontSize: "1.1rem",
              fontWeight: "bold"
            }}>
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
          <Typography sx={{
            fontWeight: "bold"
          }}>{t(heroic.name)}</Typography>
        </Box>

        {/* Quote */}
        {heroic.quote && (
          <Box sx={{ px: 2, py: "5px", borderBottom: `1px solid ${customTheme.secondary}` }}>
            <Typography
              variant="body2"
              sx={{
                fontStyle: "italic",
                color: "text.secondary"
              }}>
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

// 
// OptionalCard (dispatcher → QuirkCard | ZeroPowerCard | GenericOptionalCard)
// 

function QuirkCard({ item, customTheme, _t }) {
  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  return (
    <Stack>
      <Box sx={{ background, borderBottom: `1px solid ${customTheme.secondary}`, px: 2, py: "6px" }}>
        <Typography sx={{
          fontWeight: "bold"
        }}>{item.name}</Typography>
      </Box>
      {item.description && (
        <Box sx={{ px: 2, py: "5px", borderBottom: `1px solid ${customTheme.secondary}` }}>
          <Typography
            variant="body2"
            sx={{
              fontStyle: "italic",
              color: "text.secondary"
            }}>
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
        <Typography sx={{
          fontWeight: "bold"
        }}>{item.name}</Typography>
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

function ZeroTriggerCard({ item, customTheme, _t }) {
  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  return (
    <Stack>
      <Box sx={{ background, borderBottom: `1px solid ${customTheme.secondary}`, px: 2, py: "6px" }}>
        <Typography sx={{
          fontWeight: "bold"
        }}>{item.name}</Typography>
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

function ZeroEffectCard({ item, customTheme, _t }) {
  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  return (
    <Stack>
      <Box sx={{ background, borderBottom: `1px solid ${customTheme.secondary}`, px: 2, py: "6px" }}>
        <Typography sx={{
          fontWeight: "bold"
        }}>{item.name}</Typography>
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

  const _sections = item.clock?.sections ?? 6;
  const triggerName = typeof item.zeroTrigger === "string" ? item.zeroTrigger : item.zeroTrigger?.name ?? "";
  const triggerDesc = typeof item.zeroTrigger === "object" ? item.zeroTrigger?.description ?? "" : "";
  const effectName = typeof item.zeroEffect === "string" ? item.zeroEffect : item.zeroEffect?.name ?? "";
  const effectDesc = typeof item.zeroEffect === "object" ? item.zeroEffect?.description ?? "" : "";

  return (
    <Stack>
      <Box sx={{ background, borderBottom: `1px solid ${customTheme.secondary}`, px: 2, py: "6px" }}>
        <Typography sx={{
          fontWeight: "bold"
        }}>{item.name}</Typography>
      </Box>
      {/* <Box sx={{ px: 2, py: 1, display: "flex", justifyContent: "center" }}>
        <Clock numSections={sections} size={40} />
      </Box> */}
      {triggerName && (
        <Box sx={{ px: 2, py: "5px", borderBottom: `1px solid ${customTheme.secondary}` }}>
          <Typography variant="body2">
            <strong>{t("Trigger")}:</strong> {triggerName}
          </Typography>
          {triggerDesc && <Typography variant="body2" component="div">
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
          {effectDesc && <Typography variant="body2" component="div">
            <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
              {effectDesc}
            </StyledMarkdown>
          </Typography>}
        </Box>
      )}
    </Stack>
  );
}

function GenericOptionalCard({ item, customTheme, _t }) {
  const background =
    customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`;

  return (
    <Stack>
      <Box sx={{ background, borderBottom: `1px solid ${customTheme.secondary}`, px: 2, py: "6px" }}>
        <Typography sx={{
          fontWeight: "bold"
        }}>{item.name}</Typography>
      </Box>
      {item.description && (
        <Box sx={{ px: 2, py: "5px", borderBottom: `1px solid ${customTheme.secondary}` }}>
          <Typography
            variant="body2"
            sx={{
              fontStyle: "italic",
              color: "text.secondary"
            }}>
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
    "quirk": t("Quirk"),
    "camp-activities": t("Camp Activities"),
    "zero-trigger": t("Zero Trigger"),
    "zero-effect": t("Zero Effect"),
    "zero-power": t("Zero Power"),
    "other": t("Optional Rule"),
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
            sx={{
              color: "inherit",
              textTransform: "uppercase",
              fontSize: "1.1rem",
              fontWeight: "bold"
            }}>
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
