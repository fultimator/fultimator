import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import attributes from "../../../../libs/attributes";
import { spellsByClass } from "../../../../libs/classes";
import {
  useCardSetup,
  headerBoxSx,
  nameRowSx,
  CARD_DEFAULTS,
} from "../core-utils";
import { StyledMarkdown, md } from "../markdown";
import { CardContentWrapper, RowsWithOptionalImage } from "../core";

const SPELL_TYPE_DESC_KEYS = {
  dance: ["dance_details_1"],
  symbol: ["symbol_details_1"],
  magichant: [
    "magichant_details_1",
    "magichant_details_2",
    "magichant_details_3",
    "magichant_details_4",
  ],
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

export const SharedClassCard = React.memo(function SharedClassCard({
  item,
  id = CARD_DEFAULTS.id,
  onHeaderClick = CARD_DEFAULTS.onHeaderClick,
  showHeader = CARD_DEFAULTS.showHeader,
  showCard = CARD_DEFAULTS.showCard,
  variant = CARD_DEFAULTS.variant,
  imageMode = CARD_DEFAULTS.imageMode,
  imageSize = CARD_DEFAULTS.imageSize,
  imageSlot = CARD_DEFAULTS.imageSlot,
  showImageToggle = CARD_DEFAULTS.showImageToggle,
  showImage = CARD_DEFAULTS.showImage,
  onShowImageChange = CARD_DEFAULTS.onShowImageChange,
  showImageTempInfo = CARD_DEFAULTS.showImageTempInfo,
  imageTempInfoTextKey = CARD_DEFAULTS.imageTempInfoTextKey,
  actionContent = CARD_DEFAULTS.actionContent,
  defaultImageVisible = CARD_DEFAULTS.defaultImageVisible,
}) {
  const {
    t,
    customTheme,
    scale,
    background,
    imageVisible,
    setImageVisible,
    imageTempInfoText,
  } = useCardSetup({
    variant,
    showImage,
    onShowImageChange,
    defaultImageVisible,
    imageTempInfoTextKey,
  });
  const [expandedSpells, setExpandedSpells] = useState(false);

  const benefits = item.benefits;
  const benefitLines = [];
  if (benefits) {
    if (benefits.hpplus > 0)
      benefitLines.push(
        t("Permanently increase your maximum Hit Points by") +
          ` ${benefits.hpplus}.`,
      );
    if (benefits.mpplus > 0)
      benefitLines.push(
        t("Permanently increase your maximum Mind Points by") +
          ` ${benefits.mpplus}.`,
      );
    if (benefits.ipplus > 0)
      benefitLines.push(
        t("Permanently increase your maximum Inventory Points by") +
          ` ${benefits.ipplus}.`,
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
        t(
          "You may perform Rituals whose effects fall within the Ritualism discipline.",
        ),
      );
    if (benefits.custom?.length > 0) benefitLines.push(...benefits.custom);
  }

  const classSpells = spellsByClass[item.name] || [];
  const hasCustomSpells =
    item.benefits?.spellClasses?.length > 0 && classSpells.length === 0;
  const hasSpells =
    item.benefits?.spellClasses?.length > 0 || classSpells.length > 0;

  return (
    <CardContentWrapper
      showCard={showCard}
      id={id}
      showImageToggle={showImageToggle}
      imageMode={imageMode}
      imageVisible={imageVisible}
      setImageVisible={setImageVisible}
      showImageTempInfo={showImageTempInfo}
      imageTempInfoText={imageTempInfoText}
      actionContent={actionContent}
    >
      <RowsWithOptionalImage
        header={
          showHeader && (
            <Box
              onClick={onHeaderClick}
              sx={headerBoxSx(customTheme, scale, onHeaderClick)}
            >
              <Typography>{t(item.name)}</Typography>
              {item.book && (
                <Chip
                  label={item.book}
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
          )
        }
        imageMode={imageMode}
        imageSize={imageSize}
        imageVisible={imageVisible}
        imageSlot={imageSlot}
        customTheme={customTheme}
      >
        {benefitLines.length > 0 && (
          <Box
            sx={{
              background,
              px: 2,
              py: 1,
              borderBottom: `1px solid ${customTheme.secondary}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                mb: 0.5,
                textTransform: "uppercase",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
              }}
            >
              {t("Free Benefits")}
            </Typography>
            <Stack spacing={0.25}>
              {benefitLines.map((line, i) => (
                <Typography key={i} variant="body2">
                  • {line}
                </Typography>
              ))}
            </Stack>
          </Box>
        )}

        {hasSpells && (
          <Accordion
            disableGutters
            elevation={0}
            square
            expanded={expandedSpells}
            onChange={(_, v) => setExpandedSpells(v)}
            sx={{
              borderTop: `1px solid ${customTheme.secondary}`,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                minHeight: 40,
                "& .MuiAccordionSummary-content": { my: 0.5 },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {t("Spells")}
                {classSpells.length > 0 && (
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{ color: "text.secondary", ml: 1 }}
                  >
                    ({classSpells.length})
                  </Typography>
                )}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              {expandedSpells &&
                (hasCustomSpells
                  ? item.benefits.spellClasses.map((sc) => {
                      const descKeys = SPELL_TYPE_DESC_KEYS[sc] ?? [];
                      const hasDescKeys = descKeys.length > 0;
                      return (
                        <Box
                          key={sc}
                          sx={{
                            borderTop: `1px solid ${customTheme.secondary}`,
                          }}
                        >
                          <Box sx={{ px: 2, py: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: hasDescKeys ? 0.75 : 0,
                              }}
                            >
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
                              {!hasDescKeys && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "text.secondary",
                                    fontStyle: "italic",
                                  }}
                                >
                                  {t("Defined per character")}
                                </Typography>
                              )}
                            </Box>
                            {descKeys.map((key) => (
                              <Typography
                                key={key}
                                variant="body2"
                                component="div"
                                sx={{ color: "text.secondary", mb: 0.5 }}
                              >
                                {md(t(key))}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      );
                    })
                  : classSpells.map((spell, i) => (
                      <Box
                        key={i}
                        sx={{
                          borderTop: `1px solid ${customTheme.secondary}`,
                          px: 2,
                          py: 0.75,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            mb: 0.25,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
                            {t(spell.name)}
                          </Typography>
                          <Chip
                            label={
                              spell.isOffensive ? t("Offensive") : t("Support")
                            }
                            size="small"
                            color={spell.isOffensive ? "error" : "success"}
                            variant="outlined"
                            sx={{ fontSize: "0.6rem", height: 16 }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", ml: "auto" }}
                          >
                            {spell.mp} MP
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1, mb: 0.25 }}>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            {spell.targetDesc}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            ·
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            {spell.duration}
                          </Typography>
                          {spell.attr1 && spell.attr2 && (
                            <>
                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary" }}
                              >
                                ·
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary" }}
                              >
                                {attributes[spell.attr1]?.shortcaps} +{" "}
                                {attributes[spell.attr2]?.shortcaps}
                              </Typography>
                            </>
                          )}
                        </Box>
                        {spell.spellType === "gamble" ? (
                          <>
                            <Typography
                              variant="body2"
                              component="div"
                              sx={{ color: "text.secondary", mb: 0.5 }}
                            >
                              {md(t("GambleSpell_desc"))}
                            </Typography>
                            {spell.targets?.map((target, j) => (
                              <Box
                                key={j}
                                sx={{ display: "flex", gap: 1, mb: 0.25 }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: "bold",
                                    color: "text.secondary",
                                    minWidth: 32,
                                    flexShrink: 0,
                                    pt: "1px",
                                  }}
                                >
                                  {target.rangeFrom === target.rangeTo
                                    ? target.rangeFrom
                                    : `${target.rangeFrom}–${target.rangeTo}`}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  component="div"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {md(target.effect)}
                                </Typography>
                              </Box>
                            ))}
                          </>
                        ) : (
                          <Typography
                            variant="body2"
                            component="div"
                            sx={{ color: "text.secondary" }}
                          >
                            <StyledMarkdown
                              allowedElements={["strong", "em"]}
                              unwrapDisallowed
                            >
                              {t(spell.description)}
                            </StyledMarkdown>
                          </Typography>
                        )}
                      </Box>
                    )))}
            </AccordionDetails>
          </Accordion>
        )}

        <Divider />

        {item.skills?.map((skill, i) => (
          <Box
            key={i}
            sx={{
              borderBottom:
                i < (item.skills?.length ?? 0) - 1
                  ? `1px solid ${customTheme.secondary}`
                  : undefined,
            }}
          >
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
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {t(skill.skillName)}
              </Typography>
              <Chip
                label={`Max ${skill.maxLvl}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.65rem", height: 18, flexShrink: 0 }}
              />
            </Box>
            <Box sx={{ px: 2, pb: 0.75 }}>
              <Typography
                variant="body2"
                component="div"
                sx={{ color: "text.secondary" }}
              >
                <StyledMarkdown
                  allowedElements={["strong", "em"]}
                  unwrapDisallowed
                >
                  {t(skill.description)}
                </StyledMarkdown>
              </Typography>
            </Box>
          </Box>
        ))}
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedSkillCard = React.memo(function SharedSkillCard({
  item,
  id = CARD_DEFAULTS.id,
  onHeaderClick = CARD_DEFAULTS.onHeaderClick,
  showHeader = CARD_DEFAULTS.showHeader,
  showCard = CARD_DEFAULTS.showCard,
  variant = CARD_DEFAULTS.variant,
  imageMode = CARD_DEFAULTS.imageMode,
  imageSize = CARD_DEFAULTS.imageSize,
  imageSlot = CARD_DEFAULTS.imageSlot,
  showImageToggle = CARD_DEFAULTS.showImageToggle,
  showImage = CARD_DEFAULTS.showImage,
  onShowImageChange = CARD_DEFAULTS.onShowImageChange,
  showImageTempInfo = CARD_DEFAULTS.showImageTempInfo,
  imageTempInfoTextKey = CARD_DEFAULTS.imageTempInfoTextKey,
  actionContent = CARD_DEFAULTS.actionContent,
  defaultImageVisible = CARD_DEFAULTS.defaultImageVisible,
}) {
  const {
    t,
    customTheme,
    scale,
    imageVisible,
    setImageVisible,
    imageTempInfoText,
  } = useCardSetup({
    variant,
    showImage,
    onShowImageChange,
    defaultImageVisible,
    imageTempInfoTextKey,
  });

  return (
    <CardContentWrapper
      showCard={showCard}
      id={id}
      showImageToggle={showImageToggle}
      imageMode={imageMode}
      imageVisible={imageVisible}
      setImageVisible={setImageVisible}
      showImageTempInfo={showImageTempInfo}
      imageTempInfoText={imageTempInfoText}
      actionContent={actionContent}
    >
      <RowsWithOptionalImage
        header={
          showHeader && (
            <Box
              onClick={onHeaderClick}
              sx={headerBoxSx(customTheme, scale, onHeaderClick)}
            >
              <Typography sx={{ fontSize: "1rem !important" }}>
                {t(item.className)}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={`SL ${item.currentLvl}`}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "#ffffff",
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                  }}
                />
                {item.isHomebrew && (
                  <Chip
                    label="Homebrew"
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255,165,0,0.3)",
                      color: "#ffffff",
                      fontWeight: "bold",
                      fontSize: "0.65rem",
                    }}
                  />
                )}
              </Box>
            </Box>
          )
        }
        imageMode={imageMode}
        imageSize={imageSize}
        imageVisible={imageVisible}
        imageSlot={imageSlot}
        customTheme={customTheme}
      >
        <Box sx={nameRowSx(customTheme)}>
          <Typography sx={{ fontWeight: "bold", fontSize: scale.body }}>
            {item.isHomebrew ? item.skillName : t(item.skillName)}
          </Typography>
        </Box>
        {item.description && (
          <Box sx={{ px: 2, py: 1, fontSize: "0.875rem" }}>
            <StyledMarkdown
              allowedElements={["p", "strong", "em", "ul", "ol", "li", "br"]}
              unwrapDisallowed
            >
              {item.isHomebrew ? item.description : t(item.description)}
            </StyledMarkdown>
          </Box>
        )}
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedHeroicCard = React.memo(function SharedHeroicCard({
  item,
  id = CARD_DEFAULTS.id,
  onHeaderClick = CARD_DEFAULTS.onHeaderClick,
  showHeader = CARD_DEFAULTS.showHeader,
  showCard = CARD_DEFAULTS.showCard,
  variant = CARD_DEFAULTS.variant,
  imageMode = CARD_DEFAULTS.imageMode,
  imageSize = CARD_DEFAULTS.imageSize,
  imageSlot = CARD_DEFAULTS.imageSlot,
  showImageToggle = CARD_DEFAULTS.showImageToggle,
  showImage = CARD_DEFAULTS.showImage,
  onShowImageChange = CARD_DEFAULTS.onShowImageChange,
  showImageTempInfo = CARD_DEFAULTS.showImageTempInfo,
  imageTempInfoTextKey = CARD_DEFAULTS.imageTempInfoTextKey,
  actionContent = CARD_DEFAULTS.actionContent,
  defaultImageVisible = CARD_DEFAULTS.defaultImageVisible,
}) {
  const {
    t,
    customTheme,
    scale,
    imageVisible,
    setImageVisible,
    imageTempInfoText,
  } = useCardSetup({
    variant,
    showImage,
    onShowImageChange,
    defaultImageVisible,
    imageTempInfoTextKey,
  });

  return (
    <CardContentWrapper
      showCard={showCard}
      id={id}
      showImageToggle={showImageToggle}
      imageMode={imageMode}
      imageVisible={imageVisible}
      setImageVisible={setImageVisible}
      showImageTempInfo={showImageTempInfo}
      imageTempInfoText={imageTempInfoText}
      actionContent={actionContent}
    >
      <RowsWithOptionalImage
        header={
          showHeader && (
            <Box
              onClick={onHeaderClick}
              sx={headerBoxSx(customTheme, scale, onHeaderClick)}
            >
              <Typography>{t("Heroic Skill")}</Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {item.book && (
                  <Chip
                    label={item.book}
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
                {item.applicableTo?.map((cls) => (
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
          )
        }
        imageMode={imageMode}
        imageSize={imageSize}
        imageVisible={imageVisible}
        imageSlot={imageSlot}
        customTheme={customTheme}
      >
        <Box sx={nameRowSx(customTheme)}>
          <Typography sx={{ fontWeight: "bold", fontSize: scale.body }}>
            {t(item.name)}
          </Typography>
        </Box>
        {item.quote && (
          <Box
            sx={{
              px: 2,
              py: "5px",
              borderBottom: `1px solid ${customTheme.secondary}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontStyle: "italic", color: "text.secondary" }}
            >
              {t(item.quote)}
            </Typography>
          </Box>
        )}
        <Box sx={{ px: 2, py: 0.25, fontSize: "0.875rem" }}>
          <StyledMarkdown
            allowedElements={["p", "strong", "em", "ul", "ol", "li", "br"]}
            unwrapDisallowed
          >
            {t(item.description)}
          </StyledMarkdown>
        </Box>
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});
