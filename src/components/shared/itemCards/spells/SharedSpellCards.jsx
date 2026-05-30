import React from "react";
import { Box, Chip, darken, Grid, Stack, Typography } from "@mui/material";

import EditableImage from "../../../EditableImage";
import { OffensiveSpellIcon, Martial } from "../../../icons";
import { OpenBracket, CloseBracket } from "../../../Bracket";
import Diamond from "../../../Diamond";
import attributes from "../../../../libs/attributes";
import {
  useCardSetup,
  isImageMode,
  headerBoxSx,
  headerGridSx,
  nameRowSx,
  bodyBoxSx,
  CARD_DEFAULTS,
} from "../core-utils";
import { StyledMarkdown, md } from "../markdown";
import { CardContentWrapper, RowsWithOptionalImage } from "../core";

export const SharedSpellCard = React.memo(function SharedSpellCard({
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
  item = item ?? {};
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

  const attr1 = attributes[item.accuracy?.attr1];
  const attr2 = attributes[item.accuracy?.attr2];
  const accuracyBonus = item.accuracy?.value ?? 0;
  const effectText =
    item.effect ??
    item.description ??
    (Array.isArray(item.special)
      ? item.special.join("; ")
      : (item.special ?? ""));
  const targetText = item.targetDescription ?? "";

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
            <Grid
              container
              onClick={onHeaderClick}
              sx={{
                ...headerGridSx(customTheme, scale, onHeaderClick, imageMode),
              }}
            >
              <Grid size={4}>
                <Typography>{t("Spell")}</Typography>
              </Grid>
              <Grid size={2}>
                <Typography sx={{ textAlign: "center" }}>{t("MP")}</Typography>
              </Grid>
              <Grid size={3}>
                <Typography sx={{ textAlign: "center" }}>
                  {t("Duration")}
                </Typography>
              </Grid>
              <Grid size={3}>
                <Typography sx={{ textAlign: "center" }}>
                  {t("Target")}
                </Typography>
              </Grid>
            </Grid>
          )
        }
        imageMode={imageMode}
        imageSize={imageSize}
        imageVisible={imageVisible}
        imageSlot={imageSlot}
        customTheme={customTheme}
      >
        <Grid
          container
          sx={{
            alignItems: "center",
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 2,
            py: "5px",
          }}
        >
          <Grid size={4}>
            <Typography
              component="div"
              sx={{
                fontWeight: "bold",
                fontSize: scale.body,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {t(item.name)}
              {(item.isOffensive ?? item.type === "offensive") && (
                <OffensiveSpellIcon fontSize="small" />
              )}
              {item.isMagisphere && (
                <Chip
                  label={t("Magisphere")}
                  size="small"
                  variant="outlined"
                  sx={{ height: 18, fontSize: "0.65rem" }}
                />
              )}
            </Typography>
          </Grid>
          <Grid size={2}>
            <Typography sx={{ textAlign: "center", fontSize: scale.body }}>
              {item.cost?.amount}
              {item.cost?.perTarget && item.maxTargets !== 1
                ? ` × ${t("T")}`
                : ""}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ textAlign: "center", fontSize: scale.body }}>
              {item.duration}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ textAlign: "center", fontSize: scale.body }}>
              {t(targetText)}
            </Typography>
          </Grid>
        </Grid>

        {((item.isOffensive ?? item.type === "offensive") || effectText) && (
          <Box sx={{ px: 2, py: 0.75 }}>
            <Typography
              variant="body2"
              component="div"
              sx={{
                lineHeight: 1.5,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "baseline",
                gap: 0.5,
              }}
            >
              <span>
                {(item.isOffensive ?? item.type === "offensive") &&
                  attr1 &&
                  attr2 && (
                    <strong style={{ whiteSpace: "nowrap" }}>
                      <OpenBracket />
                      {attr1.shortcaps} + {attr2.shortcaps}
                      <CloseBracket />
                      {accuracyBonus > 0
                        ? `+${accuracyBonus}`
                        : accuracyBonus < 0
                          ? `${accuracyBonus}`
                          : ""}{" "}
                      <Diamond /> <OpenBracket />
                      {item.damage?.hrZero
                        ? (() => {
                            const val =
                              (typeof item.damage === "object"
                                ? item.damage?.value
                                : item.damage) || 0;
                            return val === 0
                              ? "HR0"
                              : `HR0 ${val > 0 ? "+" : ""} ${val}`;
                          })()
                        : `HR + ${(typeof item.damage === "object" ? item.damage?.value : item.damage) || 0}`}
                      <CloseBracket />{" "}
                      {item.damage?.type ? t(item.damage.type) : "physical"}{" "}
                      {effectText && <Diamond />}{" "}
                    </strong>
                  )}
                {effectText && (
                  <span style={{ display: "inline" }}>
                    <StyledMarkdown
                      allowedElements={["strong", "em"]}
                      unwrapDisallowed
                    >
                      {t(effectText)}
                    </StyledMarkdown>
                  </span>
                )}
              </span>
            </Typography>
          </Box>
        )}
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedPlayerSpellCard = React.memo(function SharedPlayerSpellCard({
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
  item = item ?? {};
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

  const attr1 = attributes[item.accuracy?.attr1];
  const attr2 = attributes[item.accuracy?.attr2];

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
            <Grid
              container
              onClick={onHeaderClick}
              sx={{
                ...headerGridSx(customTheme, scale, onHeaderClick, imageMode),
              }}
            >
              <Grid size={4}>
                <Typography>{t("Spell")}</Typography>
              </Grid>
              <Grid size={2}>
                <Typography sx={{ textAlign: "center" }}>{t("MP")}</Typography>
              </Grid>
              <Grid size={3}>
                <Typography sx={{ textAlign: "center" }}>
                  {t("Duration")}
                </Typography>
              </Grid>
              <Grid size={3}>
                <Typography sx={{ textAlign: "center" }}>
                  {t("Target")}
                </Typography>
              </Grid>
            </Grid>
          )
        }
        imageMode={imageMode}
        imageSize={imageSize}
        imageVisible={imageVisible}
        imageSlot={imageSlot}
        customTheme={customTheme}
      >
        <Grid
          container
          sx={{
            alignItems: "center",
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 2,
            py: "5px",
          }}
        >
          <Grid size={4}>
            <Typography
              component="div"
              sx={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: scale.body,
              }}
            >
              {t(item.name)}
              {item.isOffensive && <OffensiveSpellIcon fontSize="small" />}
              {item.isMagisphere && (
                <Chip
                  label={t("Magisphere")}
                  size="small"
                  variant="outlined"
                  sx={{ height: 18, fontSize: "0.65rem" }}
                />
              )}
            </Typography>
          </Grid>
          <Grid size={2}>
            <Typography sx={{ textAlign: "center", fontSize: scale.body }}>
              {item.cost?.amount}
              {item.cost?.perTarget && item.maxTargets !== 1
                ? ` × ${t("T")}`
                : ""}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ textAlign: "center", fontSize: scale.body }}>
              {t(item.duration)}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ textAlign: "center", fontSize: scale.body }}>
              {t(item.targetDescription)}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ px: 2, py: 0.75 }}>
          <Typography
            variant="body2"
            component="div"
            sx={{
              lineHeight: 1.5,
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {(item.class || (attr1 && attr2)) && (
              <Typography
                component="span"
                variant="body2"
                sx={{ color: "text.secondary" }}
              >
                <strong>
                  {item.class}
                  {/* {attr1 && attr2 ? ` · ${attr1.shortcaps}+${attr2.shortcaps}` : ""} */}
                </strong>{" "}
                <Diamond />{" "}
              </Typography>
            )}
            {item.isOffensive && attr1 && attr2 && (
              <strong>
                <OpenBracket />
                {attr1.shortcaps} + {attr2.shortcaps}
                <CloseBracket /> <Diamond /> <OpenBracket />
                {item.damage?.hrZero
                  ? (() => {
                      const val =
                        (typeof item.damage === "object"
                          ? item.damage?.value
                          : item.damage) || 0;
                      return val === 0
                        ? "HR0"
                        : `HR0 ${val > 0 ? "+" : ""} ${val}`;
                    })()
                  : `HR + ${(typeof item.damage === "object" ? item.damage?.value : item.damage) || 0}`}
                <CloseBracket />{" "}
                {item.damage?.type || item.damageType || "physical"}{" "}
                <Diamond />{" "}
              </strong>
            )}
            <span style={{ display: "inline" }}>
              <StyledMarkdown
                allowedElements={["strong", "em"]}
                unwrapDisallowed
              >
                {t(item.description)}
              </StyledMarkdown>
            </span>
          </Typography>
        </Box>
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedGambleSpellCard = React.memo(function SharedGambleSpellCard({
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
  item = item ?? {};
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

  const spellName = item.spellName ?? item.name ?? t("Gamble");
  const attr = attributes[item.attr];

  const rangeLabel = (entry) => {
    if (entry.dieValue != null) return entry.dieValue;
    if (entry.rangeFrom === entry.rangeTo) return entry.rangeFrom;
    return `${entry.rangeFrom}–${entry.rangeTo}`;
  };

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
            <Grid
              container
              onClick={onHeaderClick}
              sx={{
                ...headerGridSx(customTheme, scale, onHeaderClick, imageMode),
              }}
            >
              <Grid size={4}>
                <Typography>{t("Gamble")}</Typography>
              </Grid>
              <Grid size={3}>
                <Typography sx={{ textAlign: "center" }}>{t("MP")}</Typography>
              </Grid>
              <Grid size={3}>
                <Typography sx={{ textAlign: "center" }}>
                  {t("Max Dices")}
                </Typography>
              </Grid>
              <Grid size={2}>
                <Typography sx={{ textAlign: "center" }}>
                  {t("Attribute")}
                </Typography>
              </Grid>
            </Grid>
          )
        }
        imageMode={imageMode}
        imageSize={imageSize}
        imageVisible={imageVisible}
        imageSlot={imageSlot}
        customTheme={customTheme}
      >
        <Grid
          container
          sx={{
            alignItems: "center",
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 2,
            py: "5px",
          }}
        >
          <Grid size={4}>
            <Typography
              component="div"
              sx={{
                fontWeight: "bold",
                fontSize: scale.body,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                flexWrap: "wrap",
              }}
            >
              {t(spellName)}
              {item.isMagisphere && (
                <Chip
                  label={t("Magisphere")}
                  size="small"
                  variant="outlined"
                  sx={{ height: 18, fontSize: "0.65rem" }}
                />
              )}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ textAlign: "center", fontSize: scale.body }}>
              {item.cost?.amount}
              {item.cost?.perTarget && item.maxTargets !== 1
                ? ` × ${t("T")}`
                : ""}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ textAlign: "center", fontSize: scale.body }}>
              {item.maxTargets}
            </Typography>
          </Grid>
          <Grid size={2}>
            <Typography sx={{ textAlign: "center", fontSize: scale.body }}>
              {attr ? attr.shortcaps : "-"}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={bodyBoxSx()}>
          <Typography
            variant="body2"
            component="div"
            sx={{ color: "text.secondary", mb: 0.75 }}
          >
            {md(t("GambleSpell_desc"))}
          </Typography>
        </Box>

        <Box sx={{ ...bodyBoxSx(), background }}>
          <Stack spacing={0.5}>
            {item.targets?.map((target, i) => (
              <Box key={i}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      color: "text.secondary",
                      minWidth: 34,
                      flexShrink: 0,
                      pt: "2px",
                    }}
                  >
                    {rangeLabel(target)}
                  </Typography>
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{ color: "text.secondary" }}
                  >
                    {md(target.effect)}
                  </Typography>
                </Box>
                {target.secondRoll && target.secondEffects?.length > 0 && (
                  <Box sx={{ pl: 5, mt: 0.25 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 700,
                        fontStyle: "italic",
                      }}
                    >
                      {t("Second Roll:")}
                    </Typography>
                    {target.secondEffects.map((secondEffect, j) => (
                      <Box key={j} sx={{ display: "flex", gap: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            minWidth: 18,
                            flexShrink: 0,
                          }}
                        >
                          {rangeLabel(secondEffect)}
                        </Typography>
                        <Typography
                          variant="caption"
                          component="div"
                          sx={{ color: "text.secondary" }}
                        >
                          {md(secondEffect.effect)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedGiftCard = React.memo(function SharedGiftCard({
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
  item = item ?? {};
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
            <Grid
              container
              onClick={onHeaderClick}
              sx={{
                ...headerGridSx(customTheme, scale, onHeaderClick, imageMode),
              }}
            >
              <Grid size="grow">
                <Typography sx={{ fontFamily: "Antonio" }}>{t("Gift")}</Typography>
              </Grid>
              <Grid size={7}>
                <Typography sx={{ textAlign: "center", fontFamily: "Antonio" }}>
                  {t("Event")}
                </Typography>
              </Grid>
            </Grid>
          )
        }
        imageMode={imageMode}
        imageSize={imageSize}
        imageVisible={imageVisible}
        imageSlot={imageSlot}
        customTheme={customTheme}
      >
        <Box
          sx={{
            ...nameRowSx(customTheme),
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography sx={{ fontWeight: "bold", fontSize: scale.body }}>
              {t(item.name)}
            </Typography>
          </Box>
          <Box sx={{ width: "58.33%", textAlign: "center" }}>
            <Typography
              component="div"
              sx={{ fontSize: scale.body, "& p": { margin: 0 } }}
            >
              {item.event ? md(t(item.event)) : "-"}
            </Typography>
          </Box>
        </Box>
        <Box sx={bodyBoxSx()}>
          {item.effect && (
            <Typography
              variant="body2"
              component="div"
              sx={{ color: "text.secondary", lineHeight: 1.5 }}
            >
              {md(t(item.effect))}
            </Typography>
          )}
          {item.description && item.description !== item.effect && (
            <Typography
              variant="body2"
              component="div"
              sx={{ color: "text.secondary", lineHeight: 1.5 }}
            >
              {md(t(item.description))}
            </Typography>
          )}
        </Box>
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedDanceCard = React.memo(function SharedDanceCard({
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
  item = item ?? {};
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
            <Grid
              container
              onClick={onHeaderClick}
              sx={{
                ...headerGridSx(customTheme, scale, onHeaderClick, imageMode),
              }}
            >
              <Grid size="grow">
                <Typography sx={{ fontFamily: "Antonio" }}>{t("Dance")}</Typography>
              </Grid>
              <Grid size={7}>
                <Typography sx={{ textAlign: "center", fontFamily: "Antonio" }}>
                  {t("Duration")}
                </Typography>
              </Grid>
            </Grid>
          )
        }
        imageMode={imageMode}
        imageSize={imageSize}
        imageVisible={imageVisible}
        imageSlot={imageSlot}
        customTheme={customTheme}
      >
        <Box
          sx={{
            ...nameRowSx(customTheme),
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography sx={{ fontWeight: "bold", fontSize: scale.body }}>
              {t(item.name)}
            </Typography>
          </Box>
          <Box sx={{ width: "58.33%", textAlign: "center" }}>
            <Typography sx={{ fontSize: scale.body, "& p": { margin: 0 } }}>
              {item.duration ? t(item.duration) : "-"}
            </Typography>
          </Box>
        </Box>
        <Box sx={bodyBoxSx()}>
          <Typography
            variant="body2"
            component="div"
            sx={{ color: "text.secondary", lineHeight: 1.5 }}
          >
            {md(t(item.effect))}
          </Typography>
        </Box>
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedTherioformCard = React.memo(function SharedTherioformCard({
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
  item = item ?? {};
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
            <Grid
              container
              onClick={onHeaderClick}
              sx={{
                ...headerGridSx(customTheme, scale, onHeaderClick, imageMode),
              }}
            >
              <Grid size="grow">
                <Typography sx={{ fontFamily: "Antonio" }}>{t("Therioform")}</Typography>
              </Grid>
              <Grid size={7}>
                <Typography sx={{ textAlign: "center", fontFamily: "Antonio" }}>
                  {t("Genoclepsis Suggestions")}
                </Typography>
              </Grid>
            </Grid>
          )
        }
        imageMode={imageMode}
        imageSize={imageSize}
        imageVisible={imageVisible}
        imageSlot={imageSlot}
        customTheme={customTheme}
      >
        <Box
          sx={{
            ...nameRowSx(customTheme),
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography sx={{ fontWeight: "bold", fontSize: scale.body }}>
              {t(item.name)}
            </Typography>
          </Box>
          <Box sx={{ width: "58.33%", textAlign: "center" }}>
            <Typography
              variant="body2"
              component="div"
              sx={{
                color: "text.secondary",
                lineHeight: 1.4,
                "& p": { margin: 0 },
              }}
            >
              {item.genoclepsis ? md(t(item.genoclepsis)) : "-"}
            </Typography>
          </Box>
        </Box>
        <Box sx={bodyBoxSx()}>
          {item.effect && (
            <Typography
              variant="body2"
              component="div"
              sx={{ color: "text.secondary", lineHeight: 1.5 }}
            >
              {md(t(item.effect))}
            </Typography>
          )}
          {item.description && item.description !== item.effect && (
            <Typography
              variant="body2"
              component="div"
              sx={{ color: "text.secondary", lineHeight: 1.5 }}
            >
              {md(t(item.description))}
            </Typography>
          )}
        </Box>
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedArcanumCard = React.memo(function SharedArcanumCard({
  item,
  id = CARD_DEFAULTS.id,
  onHeaderClick = CARD_DEFAULTS.onHeaderClick,
  _showHeader = CARD_DEFAULTS.showHeader,
  showCard = CARD_DEFAULTS.showCard,
  variant = CARD_DEFAULTS.variant,
  imageMode = CARD_DEFAULTS.imageMode,
  _imageSize = CARD_DEFAULTS.imageSize,
  imageSlot = CARD_DEFAULTS.imageSlot,
  showImageToggle = CARD_DEFAULTS.showImageToggle,
  showImage = CARD_DEFAULTS.showImage,
  onShowImageChange = CARD_DEFAULTS.onShowImageChange,
  showImageTempInfo = CARD_DEFAULTS.showImageTempInfo,
  imageTempInfoTextKey = CARD_DEFAULTS.imageTempInfoTextKey,
  actionContent = CARD_DEFAULTS.actionContent,
  defaultImageVisible = CARD_DEFAULTS.defaultImageVisible,
}) {
  item = item ?? {};
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

  const isRework = item.rework || item.spellType === "arcanist-rework";

  const isPrint = variant === "print";
  const background = isPrint
    ? customTheme.mode === "dark"
      ? `linear-gradient(90deg, ${customTheme.ternary} 0%, #181a1b 100%)`
      : `linear-gradient(90deg, ${customTheme.ternary} 0%, #ffffff 100%)`
    : `linear-gradient(90deg, ${customTheme.ternary} 0%, transparent 100%)`;
  const ARCANUM_IMAGE_SIZE = isPrint ? 160 : 128;
  const headerFontSize = isPrint ? "1.5rem" : scale.header;
  const headerPy = isPrint ? 1.5 : 0.5;
  const descFontSize = isPrint ? "1rem" : undefined;
  const descFontStyle = isPrint ? "italic" : undefined;
  const domainFontSize = isPrint ? "1rem" : undefined;
  const sectionNameFontSize = isPrint ? "1.1rem" : scale.body;
  const sectionLabelFontSize = isPrint ? "0.85rem" : "0.75rem";
  const benefitFontSize = isPrint ? "1rem" : "0.875rem";
  const benefitColor = isPrint ? "text.primary" : "text.secondary";

  const labelPillSx = {
    ...(isPrint
      ? { background: customTheme.primary }
      : { backgroundImage: `linear-gradient(to right, ${customTheme.primary}, ${darken(customTheme.secondary, 0.3)})` }),
    px: 2,
    py: 0.5,
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    minWidth: "fit-content",
    flexShrink: 0,
  };

  const nameBandSx = {
    background,
    px: 2,
    py: 0.5,
    display: "flex",
    alignItems: "center",
    flex: 1,
    minHeight: "28px",
  };

  function ArcanumSection({ label, name, desc }) {
    const benefit = desc ?? "";
    if (!benefit && !name) return null;
    return (
      <Box sx={{ borderTop: `1px solid ${customTheme.secondary}` }}>
        <Box sx={{ display: "flex", alignItems: "stretch", width: "100%" }}>
          <Box sx={{ ...labelPillSx, alignSelf: "stretch" }}>
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: sectionLabelFontSize,
                color: "inherit",
                textTransform: "uppercase",
              }}
            >
              {label}
            </Typography>
          </Box>
          <Box sx={nameBandSx}>
            {name && (
              <Typography sx={{ fontWeight: "bold", fontSize: sectionNameFontSize }}>
                {name}
              </Typography>
            )}
          </Box>
        </Box>
        {benefit && (
          <Box sx={{ px: 2, py: isPrint ? 1 : 0.75, fontSize: benefitFontSize }}>
            <Typography
              variant="body2"
              component="div"
              sx={{ color: benefitColor, lineHeight: isPrint ? 1.7 : 1.5, fontSize: benefitFontSize }}
            >
              {md(benefit)}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  const domainDesc = item.domainDesc ? t(item.domainDesc) : "";
  const domainText = item.domain ? t(item.domain) : "";

  const mergeDesc = item.mergeDesc
    ? t(item.mergeDesc)
    : (item.mergeBenefit ?? "");
  const mergeName = item.mergeName ?? "";
  const mergeLabel = item.merge ? t(item.merge) : t("Merge");

  const pulseDesc = item.pulseDesc
    ? t(item.pulseDesc)
    : (item.pulseBenefit ?? "");
  const pulseName = item.pulseName ?? "";
  const pulseLabel = item.pulse ? t(item.pulse) : t("Pulse");

  const dismissDesc = item.dismissDesc
    ? t(item.dismissDesc)
    : (item.dismissBenefit ?? "");
  const dismissName = item.dismissName ?? "";
  const dismissLabel = item.dismiss ? t(item.dismiss) : t("Dismiss");

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
      <Grid container>
        {isImageMode(imageMode) && imageVisible && (
          <Grid
            sx={{
              flex: `0 0 ${ARCANUM_IMAGE_SIZE}px`,
              width: `${ARCANUM_IMAGE_SIZE}px`,
              minHeight: `${ARCANUM_IMAGE_SIZE}px`,
              background: customTheme.mode === "dark" ? "#181a1b" : "white",
              borderRight: `1px solid ${customTheme.secondary}`,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {imageSlot ?? <EditableImage size={ARCANUM_IMAGE_SIZE} />}
          </Grid>
        )}
        <Grid container direction="column" sx={{ flex: 1, minWidth: 0 }}>
          <Box
            onClick={onHeaderClick}
            sx={{
              px: 2,
              py: headerPy,
              minHeight: 32,
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
              sx={{
                fontSize: headerFontSize,
                fontWeight: 700,
                fontFamily: "Antonio",
                textTransform: "uppercase",
                color: "inherit",
                letterSpacing: "0.5px",
                lineHeight: 1.3,
              }}
            >
              {t(item.name)}
            </Typography>
            {isRework && !isPrint && (
              <Chip
                label={t("Rework")}
                size="small"
                variant="outlined"
                sx={{
                  height: 20,
                  color: "#ffffff",
                  borderColor: "rgba(255,255,255,0.55)",
                  textTransform: "uppercase",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  flexShrink: 0,
                  "& .MuiChip-label": {
                    px: 0.75,
                  },
                }}
              />
            )}
          </Box>
          {item.description && (
            <Box
              sx={{
                background,
                px: 2,
                py: "5px",
                borderBottom: `1px solid ${customTheme.secondary}`,
              }}
            >
              <Typography
                variant="body2"
                component="div"
                sx={{ lineHeight: 1.5, fontSize: descFontSize, fontStyle: descFontStyle }}
              >
                {md(item.description)}
              </Typography>
            </Box>
          )}
          {(domainText || domainDesc) && (
            <Box
              sx={{
                px: 2,
                minHeight: isPrint ? 44 : 32,
                display: "flex",
                alignItems: "center",
                borderBottom: `1px solid ${customTheme.secondary}`,
              }}
            >
              <Typography variant="body2" sx={{ fontSize: domainFontSize }}>
                <strong>{t("Domains")}:</strong> {domainDesc || domainText}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
      <ArcanumSection label={mergeLabel} name={mergeName} desc={mergeDesc} />
      {isRework && (
        <ArcanumSection label={pulseLabel} name={pulseName} desc={pulseDesc} />
      )}
      <ArcanumSection
        label={dismissLabel}
        name={dismissName}
        desc={dismissDesc}
      />
    </CardContentWrapper>
  );
});

export const SharedArcanumReworkCard = SharedArcanumCard;

export const SharedAlchemyCard = React.memo(function SharedAlchemyCard({
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
  item = item ?? {};
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
              <Typography>{t("Alchemy")}</Typography>
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
        <Box sx={bodyBoxSx()}>
          {item.category && (
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                fontWeight: 600,
                fontSize: "0.75rem",
                letterSpacing: "0.3px",
                display: "block",
                mb: 0.5,
              }}
            >
              {item.category}
            </Typography>
          )}
          <Typography
            variant="body2"
            component="div"
            sx={{ color: "text.secondary", lineHeight: 1.5 }}
          >
            {md(item.effect)}
          </Typography>
        </Box>
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedInfusionCard = React.memo(function SharedInfusionCard({
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
  item = item ?? {};
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
              <Typography>{t("Infusion")}</Typography>
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
        <Box sx={bodyBoxSx()}>
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
                letterSpacing: "0.3px",
              }}
            >
              Rank {item.infusionRank}
            </Typography>
          )}
          <Typography
            variant="body2"
            component="div"
            sx={{ color: "text.secondary", lineHeight: 1.5 }}
          >
            {md(item.effect ?? item.description ?? "")}
          </Typography>
        </Box>
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedMagitechCard = React.memo(function SharedMagitechCard({
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
  item = item ?? {};
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
              <Typography>{t("Magitech")}</Typography>
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
        <Box sx={bodyBoxSx()}>
          <Typography
            variant="body2"
            component="div"
            sx={{ color: "text.secondary", lineHeight: 1.5 }}
          >
            {md(item.effect ?? item.description ?? "")}
          </Typography>
        </Box>
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedInvocationCard = React.memo(function SharedInvocationCard({
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
  item = item ?? {};
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
              <Typography>{t("Invocation")}</Typography>
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
        <Box sx={bodyBoxSx()}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            {item.wellspring && (
              <Chip
                label={item.wellspring}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 22 }}
              />
            )}
            {item.type && (
              <Chip
                label={item.type}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 22 }}
              />
            )}
          </Box>
          <Typography
            variant="body2"
            component="div"
            sx={{ color: "text.secondary", lineHeight: 1.5 }}
          >
            {md(t(item.effect))}
          </Typography>
        </Box>
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedCookingCard = React.memo(function SharedCookingCard({
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
  item = item ?? {};
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
              <Typography>{t("Delicacy")}</Typography>
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
        <Box sx={bodyBoxSx()}>
          {item.cookbookEffects?.length > 0 ? (
            item.cookbookEffects.map((entry) =>
              entry.effect ? (
                <Box key={entry.id} sx={{ display: "flex", gap: 1, mb: 0.75 }}>
                  <Typography
                    variant="caption"
                    color={customTheme.primary}
                    sx={{
                      fontWeight: 600,
                      minWidth: 22,
                      flexShrink: 0,
                      pt: "2px",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {entry.id}
                  </Typography>
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{ color: "text.secondary", lineHeight: 1.5 }}
                  >
                    {md(entry.effect)}
                  </Typography>
                </Box>
              ) : null,
            )
          ) : (
            <Typography
              variant="body2"
              component="div"
              sx={{ color: "text.secondary", lineHeight: 1.5 }}
            >
              {md(item.effect ?? "")}
            </Typography>
          )}
        </Box>
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedMagiseedCard = React.memo(function SharedMagiseedCard({
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
  item = item ?? {};
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

  const labelPillSx = {
    backgroundImage: `linear-gradient(to right, ${customTheme.primary}, ${darken(customTheme.secondary, 0.3)})`,
    px: 2,
    py: 0.5,
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    minWidth: "fit-content",
    flexShrink: 0,
  };

  const tiers =
    item.rangeStart != null && item.rangeEnd != null
      ? Array.from(
          { length: item.rangeEnd - item.rangeStart + 1 },
          (_, j) => item.rangeStart + j,
        ).filter((tier) => item.effects?.[tier])
      : [];

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
              <Typography>{t("Magiseed")}</Typography>
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
        {item.description && (
          <Box sx={bodyBoxSx()}>
            <Typography
              variant="body2"
              component="div"
              sx={{ color: "text.secondary", lineHeight: 1.5 }}
            >
              {md(t(item.description))}
            </Typography>
          </Box>
        )}
        {tiers.map((tier) => (
          <Box
            key={tier}
            sx={{
              borderTop: `1px solid ${customTheme.secondary}`,
              display: "flex",
              alignItems: "stretch",
            }}
          >
            <Box
              sx={{
                ...labelPillSx,
                alignSelf: "stretch",
                justifyContent: "center",
                minWidth: 36,
                px: 1,
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                  color: "inherit",
                }}
              >
                {tier}
              </Typography>
            </Box>
            <Box sx={{ px: 2, py: 0.75, flex: 1, fontSize: "0.875rem" }}>
              <Typography
                variant="body2"
                component="div"
                sx={{ color: "text.secondary", lineHeight: 1.5 }}
              >
                {md(t(item.effects[tier]))}
              </Typography>
            </Box>
          </Box>
        ))}
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedPilotVehicleCard = React.memo(
  function SharedPilotVehicleCard({
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
    item = item ?? {};
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

    const pilotSubtype =
      item.pilotSubtype ||
      (item.passengers != null ? "frame" : null) ||
      (String(item.type || "").includes("pilot_module_armor")
        ? "armor"
        : null) ||
      (String(item.type || "").includes("pilot_module_weapon")
        ? "weapon"
        : null) ||
      (String(item.type || "").includes("pilot_module_support")
        ? "support"
        : null) ||
      (String(item.category || "")
        .toLowerCase()
        .includes("frame")
        ? "frame"
        : null) ||
      "support";

    const typeLabel =
      {
        frame: t("Vehicle Frame"),
        armor: t("Armor Module"),
        weapon: t("Weapon Module"),
        support: t("Support Module"),
      }[pilotSubtype] ?? t("Pilot Vehicle");

    if (pilotSubtype === "weapon") {
      const accuracy = item.accuracy || {};
      const attr1 = attributes[accuracy.attr1];
      const attr2 = attributes[accuracy.attr2];
      const ROW_MIN_HEIGHT = "36px";
      const pl = 2;
      const rowSx = (bg, extra = {}) => ({
        alignItems: "center",
        minHeight: ROW_MIN_HEIGHT,
        py: 0.5,
        px: pl,
        width: "100%",
        borderBottom: `1px solid ${customTheme.secondary}`,
        ...(bg ? { background: bg } : {}),
        ...extra,
      });
      const cols = { name: 4, cost: 2, accuracy: 3, damage: 3 };
      const cols2 = { category: 4, range: 3, extra: 3 };

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
                <Grid
                  container
                  onClick={onHeaderClick}
                  sx={{
                    ...headerGridSx(
                      customTheme,
                      scale,
                      onHeaderClick,
                      imageMode,
                    ),
                  }}
                >
                  <Grid size={cols.name}>
                    <Typography>{typeLabel}</Typography>
                  </Grid>
                  <Grid size={cols.cost}>
                    <Typography sx={{ textAlign: "center" }}>
                      {t("Cost")}
                    </Typography>
                  </Grid>
                  <Grid size={cols.accuracy}>
                    <Typography sx={{ textAlign: "center" }}>
                      {t("Accuracy")}
                    </Typography>
                  </Grid>
                  <Grid size={cols.damage}>
                    <Typography sx={{ textAlign: "center" }}>
                      {t("Damage")}
                    </Typography>
                  </Grid>
                </Grid>
              )
            }
            imageMode={imageMode}
            imageSize={imageSize}
            imageVisible={imageVisible}
            imageSlot={imageSlot}
            customTheme={customTheme}
          >
            <Grid container sx={rowSx(background)}>
              <Grid
                sx={{ display: "flex", alignItems: "center" }}
                size={cols.name}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: scale.headingRow ?? scale.body,
                    lineHeight: 1,
                    margin: 0,
                  }}
                >
                  {t(item.name)}
                </Typography>
                {item.martial && <Martial />}
              </Grid>
              <Grid size={cols.cost}>
                <Typography
                  sx={{
                    textAlign: "center",
                    fontSize: scale.body,
                    lineHeight: 1,
                    margin: 0,
                  }}
                >
                  {item.cost ? `${item.cost}z` : "-"}
                </Typography>
              </Grid>
              <Grid size={cols.accuracy}>
                <Typography
                  sx={{
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: scale.body,
                    lineHeight: 1,
                    margin: 0,
                  }}
                >
                  <OpenBracket />
                  {attr1?.shortcaps ?? "?"} + {attr2?.shortcaps ?? "?"}
                  <CloseBracket />
                  {(accuracy.value ?? 0) > 0
                    ? `+${accuracy.value}`
                    : (accuracy.value ?? 0) < 0
                      ? `${accuracy.value}`
                      : ""}
                </Typography>
              </Grid>
              <Grid size={cols.damage}>
                <Typography
                  sx={{
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: scale.body,
                    lineHeight: 1,
                    margin: 0,
                  }}
                >
                  <OpenBracket />
                  {item.damage?.hrZero
                    ? (() => {
                        const val =
                          (typeof item.damage === "object"
                            ? item.damage?.value
                            : item.damage) ?? 0;
                        return val === 0
                          ? "HR0"
                          : `HR0 ${val > 0 ? "+" : ""} ${val}`;
                      })()
                    : `${t("HR")} + ${(typeof item.damage === "object" ? item.damage?.value : item.damage) ?? 0}`}
                  <CloseBracket />
                  {item.damage?.type ? t(item.damage.type) : ""}
                </Typography>
              </Grid>
            </Grid>

            <Grid container sx={rowSx(null)}>
              <Grid
                size={cols2.category}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: scale.body,
                    lineHeight: 1,
                    margin: 0,
                  }}
                >
                  {item.category ? t(item.category) : "-"}
                </Typography>
              </Grid>
              <Grid
                size={1}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Diamond color={customTheme.primary} />
              </Grid>
              <Grid
                size={cols2.range}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    textAlign: "center",
                    fontSize: scale.body,
                    lineHeight: 1,
                    margin: 0,
                  }}
                >
                  {item.range ? t(item.range) : "-"}
                </Typography>
              </Grid>
              <Grid
                size={1}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Diamond color={customTheme.primary} />
              </Grid>
              <Grid
                size={cols2.extra}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    textAlign: "center",
                    fontSize: scale.body,
                    lineHeight: 1,
                    margin: 0,
                  }}
                >
                  {item.cumbersome ? t("Cumbersome") : "-"}
                </Typography>
              </Grid>
            </Grid>

            {item.quality && (
              <Box
                sx={{
                  pl,
                  pr: pl,
                  py: 0.75,
                  borderBottom: `1px solid ${customTheme.secondary}`,
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{ lineHeight: 1.35 }}
                >
                  <StyledMarkdown
                    allowedElements={["strong", "em"]}
                    unwrapDisallowed
                  >
                    {item.quality}
                  </StyledMarkdown>
                </Typography>
              </Box>
            )}

            {item.description && (
              <Box sx={{ pl, pr: pl, py: 0.75 }}>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{ lineHeight: 1.5, color: "text.secondary" }}
                >
                  {md(t(item.description))}
                </Typography>
              </Box>
            )}
          </RowsWithOptionalImage>
        </CardContentWrapper>
      );
    }

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
                {pilotSubtype === "armor" ? (
                  <Grid container sx={{ flex: 1 }}>
                    <Grid size={5}>
                      <Typography>{typeLabel}</Typography>
                    </Grid>
                    <Grid size={2}>
                      <Typography sx={{ textAlign: "center" }}>
                        {t("Cost")}
                      </Typography>
                    </Grid>
                    <Grid size={2}>
                      <Typography sx={{ textAlign: "center" }}>
                        {t("DEF")}
                      </Typography>
                    </Grid>
                    <Grid size={3}>
                      <Typography sx={{ textAlign: "center" }}>
                        {t("MDEF")}
                      </Typography>
                    </Grid>
                  </Grid>
                ) : pilotSubtype === "support" ? (
                  <Grid container sx={{ flex: 1 }}>
                    <Grid size={9}>
                      <Typography>{typeLabel}</Typography>
                    </Grid>
                    <Grid size={3}>
                      <Typography sx={{ textAlign: "center" }}>
                        {t("Cost")}
                      </Typography>
                    </Grid>
                  </Grid>
                ) : pilotSubtype === "frame" ? (
                  <Grid container sx={{ flex: 1 }}>
                    <Grid size={4}>
                      <Typography>{typeLabel}</Typography>
                    </Grid>
                    <Grid size={3}>
                      <Typography sx={{ textAlign: "center" }}>
                        {t("Frame")}
                      </Typography>
                    </Grid>
                    <Grid size={2}>
                      <Typography sx={{ textAlign: "center" }}>
                        {t("Passengers")}
                      </Typography>
                    </Grid>
                    <Grid size={3}>
                      <Typography sx={{ textAlign: "center" }}>
                        {t("Distance")}
                      </Typography>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography>{typeLabel}</Typography>
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
          {pilotSubtype === "frame" && (
            <>
              <Grid
                container
                sx={{
                  alignItems: "center",
                  minHeight: "36px",
                  py: 0.5,
                  pl: 2,
                  pr: 2,
                  width: "100%",
                  borderBottom: `1px solid ${customTheme.secondary}`,
                  ...(background ? { background } : {}),
                }}
              >
                <Grid size={4} sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: scale.headingRow,
                      lineHeight: 1,
                      margin: 0,
                    }}
                  >
                    {item.customName || t(item.name)}
                  </Typography>
                </Grid>
                <Grid size={3}>
                  <Typography
                    sx={{
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: scale.body,
                      lineHeight: 1,
                      margin: 0,
                    }}
                  >
                    {item.frame ? t(item.frame) : "-"}
                  </Typography>
                </Grid>
                <Grid size={2}>
                  <Typography
                    sx={{
                      textAlign: "center",
                      fontSize: scale.body,
                      lineHeight: 1,
                      margin: 0,
                    }}
                  >
                    {item.passengers ?? "-"}
                  </Typography>
                </Grid>
                <Grid size={3}>
                  <Typography
                    sx={{
                      textAlign: "center",
                      fontSize: scale.body,
                      lineHeight: 1,
                      margin: 0,
                    }}
                  >
                    {item.distance ?? "-"}
                  </Typography>
                </Grid>
              </Grid>
              {item.description && (
                <Box
                  sx={{
                    pl: 2,
                    pr: 2,
                    py: 0.75,
                    borderBottom: `1px solid ${customTheme.secondary}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{ color: "text.secondary", lineHeight: 1.5 }}
                  >
                    {md(t(item.description))}
                  </Typography>
                </Box>
              )}
            </>
          )}
          {pilotSubtype === "support" && (
            <>
              <Grid
                container
                sx={{
                  alignItems: "center",
                  minHeight: "36px",
                  py: 0.5,
                  pl: 2,
                  pr: 2,
                  width: "100%",
                  borderBottom: `1px solid ${customTheme.secondary}`,
                  ...(background ? { background } : {}),
                }}
              >
                <Grid size={9} sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: scale.headingRow,
                      lineHeight: 1,
                      margin: 0,
                    }}
                  >
                    {item.customName || t(item.name)}
                  </Typography>
                </Grid>
                <Grid size={3}>
                  <Typography
                    sx={{
                      textAlign: "center",
                      fontSize: scale.body,
                      lineHeight: 1,
                      margin: 0,
                    }}
                  >
                    {`${item.cost ?? 1000}z`}
                  </Typography>
                </Grid>
              </Grid>
              {item.description && (
                <Box
                  sx={{
                    pl: 2,
                    pr: 2,
                    py: 0.75,
                    borderBottom: `1px solid ${customTheme.secondary}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{ color: "text.secondary", lineHeight: 1.5 }}
                  >
                    {md(t(item.description))}
                  </Typography>
                </Box>
              )}
            </>
          )}
          {pilotSubtype === "armor" && (
            <>
              <Grid
                container
                sx={{
                  alignItems: "center",
                  minHeight: "36px",
                  py: 0.5,
                  pl: 2,
                  pr: 2,
                  width: "100%",
                  borderBottom: `1px solid ${customTheme.secondary}`,
                  ...(background ? { background } : {}),
                }}
              >
                <Grid
                  size={5}
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: scale.headingRow,
                      lineHeight: 1,
                      margin: 0,
                    }}
                  >
                    {item.customName || t(item.name)}
                  </Typography>
                  {item.martial && <Martial />}
                </Grid>
                <Grid size={2}>
                  <Typography
                    sx={{
                      textAlign: "center",
                      fontSize: scale.body,
                      lineHeight: 1,
                      margin: 0,
                    }}
                  >
                    {`${item.cost ?? 500}z`}
                  </Typography>
                </Grid>
                <Grid size={2}>
                  <Typography
                    sx={{
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: scale.body,
                      lineHeight: 1,
                      margin: 0,
                    }}
                  >
                    {item.martial
                      ? (item.def ?? "-")
                      : `${t("DEX die")} + ${item.def ?? 0}`}
                  </Typography>
                </Grid>
                <Grid size={3}>
                  <Typography
                    sx={{
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: scale.body,
                      lineHeight: 1,
                      margin: 0,
                    }}
                  >
                    {item.martial
                      ? (item.mdef ?? "-")
                      : `${t("INS die")} + ${item.mdef ?? 0}`}
                  </Typography>
                </Grid>
              </Grid>
              {item.description && (
                <Box
                  sx={{
                    pl: 2,
                    pr: 2,
                    py: 0.75,
                    borderBottom: `1px solid ${customTheme.secondary}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{ color: "text.secondary", lineHeight: 1.5 }}
                  >
                    {md(t(item.description))}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </RowsWithOptionalImage>
      </CardContentWrapper>
    );
  },
);

export const SharedSymbolCard = React.memo(function SharedSymbolCard({
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
  item = item ?? {};
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
              <Typography>{t("Symbol")}</Typography>
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
        <Box sx={bodyBoxSx()}>
          <Typography
            variant="body2"
            component="div"
            sx={{ color: "text.secondary", lineHeight: 1.5 }}
          >
            {md(t(item.effect))}
          </Typography>
        </Box>
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedMagichantCard = React.memo(function SharedMagichantCard({
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
  item = item ?? {};
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

  const isKey =
    item.magichantSubtype === "key" ||
    item.type ||
    item.status ||
    item.attribute ||
    item.recovery;
  const typeLabel = isKey ? t("Magichant Key") : t("Magichant Tone");

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
          showHeader &&
          (isKey ? (
            <Grid
              container
              onClick={onHeaderClick}
              sx={{
                ...headerGridSx(customTheme, scale, onHeaderClick, imageMode),
              }}
            >
              <Grid size="grow">
                <Typography sx={{ fontFamily: "Antonio" }}>{typeLabel}</Typography>
              </Grid>
              <Grid size={2}>
                <Typography sx={{ textAlign: "center" }}>
                  {t("Type")}
                </Typography>
              </Grid>
              <Grid size={3}>
                <Typography sx={{ textAlign: "center" }}>
                  {t("Status")}
                </Typography>
              </Grid>
              <Grid size={2}>
                <Typography sx={{ textAlign: "center" }}>
                  {t("Attr")}
                </Typography>
              </Grid>
              <Grid size={2}>
                <Typography sx={{ textAlign: "center" }}>
                  {t("Recovery")}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Box
              onClick={onHeaderClick}
              sx={headerBoxSx(customTheme, scale, onHeaderClick)}
            >
              <Typography>{typeLabel}</Typography>
            </Box>
          ))
        }
        imageMode={imageMode}
        imageSize={imageSize}
        imageVisible={imageVisible}
        imageSlot={imageSlot}
        customTheme={customTheme}
      >
        {isKey ? (
          <Grid
            container
            sx={{
              alignItems: "center",
              ...nameRowSx(customTheme),
            }}
          >
            <Grid size="grow">
              <Typography sx={{ fontWeight: "bold", fontSize: scale.body }}>
                {t(item.name)}
              </Typography>
            </Grid>
            <Grid size={2} sx={{ textAlign: "center" }}>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", "& p": { margin: 0 } }}
              >
                {item.type ? md(t(item.type)) : "-"}
              </Typography>
            </Grid>
            <Grid size={3} sx={{ textAlign: "center" }}>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", "& p": { margin: 0 } }}
              >
                {item.status ? md(t(item.status)) : "-"}
              </Typography>
            </Grid>
            <Grid size={2} sx={{ textAlign: "center" }}>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", "& p": { margin: 0 } }}
              >
                {item.attribute ? md(t(item.attribute)) : "-"}
              </Typography>
            </Grid>
            <Grid size={2} sx={{ textAlign: "center" }}>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", "& p": { margin: 0 } }}
              >
                {item.recovery ? md(t(item.recovery)) : "-"}
              </Typography>
            </Grid>
          </Grid>
        ) : (
          <Box sx={nameRowSx(customTheme)}>
            <Typography sx={{ fontWeight: "bold", fontSize: scale.body }}>
              {t(item.name)}
            </Typography>
          </Box>
        )}
        <Box sx={bodyBoxSx()}>
          {item.effect && (
            <Typography
              variant="body2"
              component="div"
              sx={{ color: "text.secondary", lineHeight: 1.5 }}
            >
              {md(t(item.effect))}
            </Typography>
          )}
        </Box>
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});
