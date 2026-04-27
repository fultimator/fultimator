import React from "react";
import { Box, Chip, Grid, Typography } from "@mui/material";

import { Martial } from "../../../icons";
import { OpenBracket, CloseBracket } from "../../../Bracket";
import attributes from "../../../../libs/attributes";
import types from "../../../../libs/types";
import {
  useCardSetup,
  headerBoxSx,
  headerGridSx,
  CARD_DEFAULTS,
} from "../core-utils";
import { StyledMarkdown } from "../markdown";
import { CardContentWrapper, RowsWithOptionalImage } from "../core";

export const SharedAttackCard = React.memo(function SharedAttackCard({
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

  const attr1 = attributes[item.attr1];
  const attr2 = attributes[item.attr2];
  const dmgType = types[item.type];

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
              sx={headerGridSx(customTheme, scale, onHeaderClick, imageMode)}
            >
              <Grid size={3}>
                <Typography>{t(item.category)}</Typography>
              </Grid>
              <Grid size={3}>
                <Typography sx={{ textAlign: "center" }}>
                  {t("Accuracy")}
                </Typography>
              </Grid>
              <Grid size={3}>
                <Typography sx={{ textAlign: "center" }}>
                  {t("Damage")}
                </Typography>
              </Grid>
              <Grid size={3}>
                <Typography sx={{ textAlign: "center" }}>
                  {t("Range")}
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
          <Grid sx={{ display: "flex", alignItems: "center" }} size={3}>
            <Typography
              sx={{ fontWeight: "bold", mr: 0.5, fontSize: scale.body }}
            >
              {t(item.name)}
            </Typography>
            {item.martial && <Martial />}
          </Grid>
          <Grid size={3}>
            <Typography
              sx={{
                fontWeight: "bold",
                textAlign: "center",
                fontSize: scale.body,
              }}
            >
              {attr1 && attr2 ? (
                <>
                  <OpenBracket />
                  {attr1.shortcaps} + {attr2.shortcaps}
                  <CloseBracket />
                  {item.flathit > 0 ? `+${item.flathit}` : ""}
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
                textAlign: "center",
                fontSize: scale.body,
              }}
            >
              <OpenBracket />
              HR + {item.flatdmg}
              <CloseBracket />
              {dmgType?.long}
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography sx={{ textAlign: "center", fontSize: scale.body }}>
              {item.range === "melee"
                ? t("Melee")
                : item.range === "distance"
                  ? t("Ranged")
                  : t(item.range)}
            </Typography>
          </Grid>
        </Grid>

        {item.special?.length > 0 && (
          <Grid container sx={{ px: 2, py: "4px" }}>
            <Grid size={12}>
              <Typography variant="body2">
                <strong>{t("Special")}:</strong> {item.special.join("; ")}
              </Typography>
            </Grid>
          </Grid>
        )}
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedSpecialRuleCard = React.memo(function SharedSpecialRuleCard({
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
              <Typography>{t("Special Rule")}</Typography>
              {item.spCost != null && (
                <Chip
                  label={`${item.spCost} SP`}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "#ffffff",
                    fontWeight: "bold",
                    fontSize: "0.7rem",
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
        <Box
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 2,
            py: "6px",
          }}
        >
          <Typography sx={{ fontWeight: "bold", fontSize: scale.body }}>
            {item.name}
          </Typography>
        </Box>
        {item.effect && (
          <Box sx={{ px: 2, py: 0.5, fontSize: "0.875rem" }}>
            <StyledMarkdown
              allowedElements={["p", "strong", "em", "ul", "ol", "li", "br"]}
              unwrapDisallowed
            >
              {item.effect}
            </StyledMarkdown>
          </Box>
        )}
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedActionCard = React.memo(function SharedActionCard({
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
              <Typography>{t("Other Action")}</Typography>
              {item.spCost != null && (
                <Chip
                  label={`${item.spCost} SP`}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "#ffffff",
                    fontWeight: "bold",
                    fontSize: "0.7rem",
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
        <Box
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 2,
            py: "6px",
          }}
        >
          <Typography sx={{ fontWeight: "bold", fontSize: scale.body }}>
            {item.name}
          </Typography>
        </Box>
        {item.effect && (
          <Box sx={{ px: 2, py: 0.5, fontSize: "0.875rem" }}>
            <StyledMarkdown
              allowedElements={["p", "strong", "em", "ul", "ol", "li", "br"]}
              unwrapDisallowed
            >
              {item.effect}
            </StyledMarkdown>
          </Box>
        )}
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});
