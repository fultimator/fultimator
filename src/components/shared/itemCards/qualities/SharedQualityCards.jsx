import React from "react";
import { Box, Chip, Grid, Typography } from "@mui/material";

import {
  useCardSetup,
  headerGridSx,
  CARD_DEFAULTS,
  isImageMode,
} from "../core-utils";
import { StyledMarkdown } from "../markdown";
import { CardContentWrapper, RowsWithOptionalImage } from "../core";

function dataRowSx(customTheme, background, extraSx = {}) {
  return {
    alignItems: "center",
    minHeight: "36px",
    flexGrow: 1,
    py: 0.25,
    pl: 1,
    width: "100%",
    ...extraSx,
    ...(background ? { background } : {}),
  };
}

export const SharedQualityCard = React.memo(function SharedQualityCard({
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

  const withImage = isImageMode(imageMode) && imageVisible;
  const cols = { name: 5, category: 3, cost: 4 };

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
                px: 0,
              }}
            >
              <Grid
                container
                sx={{
                  flex: 1,
                  px: withImage ? 0.75 : 2,
                  alignItems: "center",
                }}
              >
                <Grid size={cols.name}>
                  <Typography>{t("Quality")}</Typography>
                </Grid>
                <Grid size={cols.category}>
                  <Typography>{t("Category")}</Typography>
                </Grid>
                <Grid size={cols.cost}>
                  <Typography sx={{ textAlign: "center" }}>
                    {t("Cost")}
                  </Typography>
                </Grid>
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
          sx={dataRowSx(customTheme, background, {
            borderBottom: `1px solid ${customTheme.secondary}`,
          })}
        >
          <Grid size={cols.name}>
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              {item.name}
            </Typography>
          </Grid>
          <Grid size={cols.category}>
            <Typography
              sx={{
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              {t(item.category)}
            </Typography>
          </Grid>
          <Grid size={cols.cost}>
            <Typography
              sx={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              {item.cost}z
            </Typography>
          </Grid>
        </Grid>

        {item.quality && (
          <Box sx={{ px: 1.5, py: 0.75, fontSize: "0.875rem" }}>
            <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
              {item.quality}
            </StyledMarkdown>
          </Box>
        )}

        {item.filter?.length > 0 && (
          <Box
            sx={{
              px: 1.5,
              pb: 0.75,
              display: "flex",
              gap: 0.5,
              flexWrap: "wrap",
            }}
          >
            {item.filter.map((f) => (
              <Chip
                key={f}
                label={t(f)}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.65rem", height: 18 }}
              />
            ))}
          </Box>
        )}
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});
