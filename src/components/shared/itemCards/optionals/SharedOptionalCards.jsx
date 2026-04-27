import React from "react";
import { Box, Chip, Grid, Typography } from "@mui/material";
import { darken } from "@mui/material/styles";

import Diamond from "../../../Diamond";
import EditableImage from "../../../EditableImage";
import {
  useCardSetup,
  headerBoxSx,
  headerGridSx,
  nameRowSx,
  CARD_DEFAULTS,
  isImageMode,
} from "../core-utils";
import { StyledMarkdown, md } from "../markdown";
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

export const SharedRitualCard = React.memo(function SharedRitualCard({
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
  cardRef = null,
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
  const potency = item.power
    ? t(item.power).charAt(0).toUpperCase() + t(item.power).slice(1)
    : "-";
  const area = item.area
    ? t(item.area).charAt(0).toUpperCase() + t(item.area).slice(1)
    : "-";
  const reductionLabel = item.itemHeld ? `(-${item.dlReduction ?? 0})` : null;
  const flags = [
    item.ingredient ? t("Using special ingredient") : null,
    item.fastRitual ? t("Fast Ritual") : null,
  ].filter(Boolean);

  return (
    <CardContentWrapper
      showCard={showCard}
      id={id}
      cardRef={cardRef}
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
                <Grid size={3}>
                  <Typography>{t("Ritual")}</Typography>
                </Grid>
                <Grid size={1}>
                  <Typography sx={{ textAlign: "center" }}>
                    {t("MP")}
                  </Typography>
                </Grid>
                <Grid size={4}>
                  <Typography sx={{ textAlign: "center" }}>
                    {t("DL")}
                  </Typography>
                </Grid>
                <Grid size={4}>
                  <Typography sx={{ textAlign: "center" }}>
                    {t("Clock")}
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
          <Grid size={3}>
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
          <Grid size={1}>
            <Typography
              sx={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              {item.pm}
            </Typography>
          </Grid>
          <Grid size={4}>
            <Typography
              sx={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              {item.dl}
            </Typography>
          </Grid>
          <Grid size={4}>
            <Typography
              sx={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              {item.clock}
            </Typography>
          </Grid>
        </Grid>

        <Grid
          container
          sx={dataRowSx(customTheme, null, {
            borderBottom: `1px solid ${customTheme.secondary}`,
          })}
        >
          <Grid size={3}>
            <Typography
              sx={{
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              <Box component="span" sx={{ fontWeight: "bold" }}>
                {t("Potency")}
              </Box>
              : {potency}
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
          <Grid size={4}>
            <Typography
              sx={{
                textAlign: "center",
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              <Box component="span" sx={{ fontWeight: "bold" }}>
                {t("Area")}
              </Box>
              : {area}
            </Typography>
          </Grid>
          {reductionLabel && (
            <>
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
              <Grid size={3}>
                <Typography
                  sx={{
                    textAlign: "center",
                    fontSize: scale.body,
                    lineHeight: 1,
                    margin: 0,
                  }}
                >
                  <Box component="span" sx={{ fontWeight: "bold" }}>
                    {t("DL")}
                  </Box>
                  : {reductionLabel}
                </Typography>
              </Grid>
            </>
          )}
        </Grid>

        {(flags.length > 0 || item.description) && (
          <Box sx={{ px: 1.5, py: 0.75 }}>
            {flags.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  gap: 0.75,
                  flexWrap: "wrap",
                  mb: item.description ? 0.5 : 0,
                  alignItems: "center",
                }}
              >
                {flags.map((flag, i) => (
                  <React.Fragment key={flag}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", fontSize: scale.body }}
                    >
                      {flag}
                    </Typography>
                    {i < flags.length - 1 && (
                      <Diamond color={customTheme.primary} />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            )}
            {item.description && (
              <Typography
                variant="body2"
                component="div"
                sx={{ lineHeight: 1.5 }}
              >
                {md(item.description)}
              </Typography>
            )}
          </Box>
        )}
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedProjectCard = React.memo(function SharedProjectCard({
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
  cardRef = null,
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
  const potency = item.power
    ? t(item.power).charAt(0).toUpperCase() + t(item.power).slice(1)
    : "-";
  const area = item.area
    ? t(item.area).charAt(0).toUpperCase() + t(item.area).slice(1)
    : "-";
  const uses = item.uses
    ? t(item.uses).charAt(0).toUpperCase() + t(item.uses).slice(1)
    : "-";
  const savings = item.visionary > 0 ? `${item.visionary * 100}z` : "-";

  return (
    <CardContentWrapper
      showCard={showCard}
      id={id}
      cardRef={cardRef}
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
                <Grid size={3}>
                  <Typography>{t("Project")}</Typography>
                </Grid>
                <Grid size={1}></Grid>
                <Grid size={4}>
                  <Typography sx={{ textAlign: "center" }}>
                    {t("Potency")}
                  </Typography>
                </Grid>
                <Grid size={4}>
                  <Typography sx={{ textAlign: "center" }}>
                    {t("Area")}
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
          <Grid size={3}>
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
          <Grid size={1} />
          <Grid size={4}>
            <Typography
              sx={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              {potency}
            </Typography>
          </Grid>
          <Grid size={4}>
            <Typography
              sx={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              {area}
            </Typography>
          </Grid>
        </Grid>

        <Grid
          container
          sx={dataRowSx(customTheme, null, {
            borderBottom: `1px solid ${customTheme.secondary}`,
          })}
        >
          <Grid size={3}>
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              <Box component="span" sx={{ fontWeight: "bold" }}>
                {t("Cost")}
              </Box>
              : {item.cost}z
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
          <Grid size={4}>
            <Typography
              sx={{
                textAlign: "center",
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              <Box component="span" sx={{ fontWeight: "bold" }}>
                {t("Progress")}
              </Box>
              : {item.progress}
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
          <Grid size={3}>
            <Typography
              sx={{
                textAlign: "center",
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              <Box component="span" sx={{ fontWeight: "bold" }}>
                {t("Flaw")}
              </Box>
              : {item.defect ? t("Yes") : t("No")}
            </Typography>
          </Grid>
        </Grid>

        <Grid
          container
          sx={dataRowSx(customTheme, null, {
            borderBottom: `1px solid ${customTheme.secondary}`,
          })}
        >
          <Grid size={3}>
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              <Box component="span" sx={{ fontWeight: "bold" }}>
                {t("Uses")}
              </Box>
              : {uses}
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
          <Grid size={4}>
            <Typography
              sx={{
                textAlign: "center",
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              <Box component="span" sx={{ fontWeight: "bold" }}>
                {t("Tinkerers")}
              </Box>
              : {item.tinkerers}
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
          <Grid size={3}>
            <Typography
              sx={{
                textAlign: "center",
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              <Box component="span" sx={{ fontWeight: "bold" }}>
                {t("Progress/day")}
              </Box>
              : {item.progressPerDay}
            </Typography>
          </Grid>
        </Grid>

        {(item.visionary > 0 || item.description) && (
          <Box sx={{ px: 1.5, py: 0.75 }}>
            {item.visionary > 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  mb: item.description ? 0.5 : 0,
                  fontSize: scale.body,
                }}
              >
                <Typography variant="body2" sx={{ fontSize: "inherit" }}>
                  <Box component="span" sx={{ fontWeight: "bold" }}>
                    {t("Savings")}
                  </Box>
                  : {savings} ({t("Visionary")} SL{item.visionary})
                </Typography>
                <Diamond color={customTheme.primary} />
                <Typography variant="body2" sx={{ fontSize: "inherit" }}>
                  <Box component="span" sx={{ fontWeight: "bold" }}>
                    {t("Hired Helper")}
                  </Box>
                  : {item.helpers ?? 0}
                </Typography>
              </Box>
            )}
            {item.description && (
              <Typography
                variant="body2"
                component="div"
                sx={{ lineHeight: 1.5 }}
              >
                {md(item.description)}
              </Typography>
            )}
          </Box>
        )}
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedOptionalCard = React.memo(function SharedOptionalCard({
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

  const subtypeLabel =
    {
      quirk: t("Quirk"),
      "camp-activities": t("Camp Activities"),
      "zero-trigger": t("Zero Trigger"),
      "zero-effect": t("Zero Effect"),
      "zero-power": t("Zero Power"),
      other: t("Optional Rule"),
    }[item.subtype] ?? t("Optional Rule");

  const triggerName =
    typeof item.zeroTrigger === "string"
      ? item.zeroTrigger
      : (item.zeroTrigger?.name ?? "");
  const triggerDesc =
    typeof item.zeroTrigger === "object"
      ? (item.zeroTrigger?.description ?? "")
      : "";
  const effectName =
    typeof item.zeroEffect === "string"
      ? item.zeroEffect
      : (item.zeroEffect?.name ?? "");
  const effectDesc =
    typeof item.zeroEffect === "object"
      ? (item.zeroEffect?.description ?? "")
      : "";

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
              <Typography>{subtypeLabel}</Typography>
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
            {item.name}
          </Typography>
        </Box>

        {item.subtype === "quirk" && (
          <>
            {item.description && (
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
                  {item.description}
                </Typography>
              </Box>
            )}
            {item.effect && (
              <Box sx={{ px: 2, py: 0.75, fontSize: "0.875rem" }}>
                <StyledMarkdown
                  allowedElements={["strong", "em"]}
                  unwrapDisallowed
                >
                  {item.effect}
                </StyledMarkdown>
              </Box>
            )}
          </>
        )}

        {item.subtype === "camp-activities" && (
          <>
            {item.targetDescription && (
              <Box
                sx={{
                  px: 2,
                  py: "5px",
                  borderBottom: `1px solid ${customTheme.secondary}`,
                }}
              >
                <Typography variant="body2">
                  <strong>{t("Target")}:</strong> {item.targetDescription}
                </Typography>
              </Box>
            )}
            {item.effect && (
              <Box sx={{ px: 2, py: 0.75, fontSize: "0.875rem" }}>
                <StyledMarkdown
                  allowedElements={["strong", "em"]}
                  unwrapDisallowed
                >
                  {item.effect}
                </StyledMarkdown>
              </Box>
            )}
          </>
        )}

        {(item.subtype === "zero-trigger" || item.subtype === "zero-effect") &&
          item.description && (
            <Box sx={{ px: 2, py: 0.75, fontSize: "0.875rem" }}>
              <StyledMarkdown
                allowedElements={["strong", "em"]}
                unwrapDisallowed
              >
                {item.description}
              </StyledMarkdown>
            </Box>
          )}

        {item.subtype === "zero-power" && (
          <>
            {triggerName && (
              <Box
                sx={{
                  px: 2,
                  py: "5px",
                  borderBottom: `1px solid ${customTheme.secondary}`,
                }}
              >
                <Typography variant="body2">
                  <strong>{t("Trigger")}:</strong> {triggerName}
                </Typography>
                {triggerDesc && (
                  <Typography variant="body2" component="div">
                    <StyledMarkdown
                      allowedElements={["strong", "em"]}
                      unwrapDisallowed
                    >
                      {triggerDesc}
                    </StyledMarkdown>
                  </Typography>
                )}
              </Box>
            )}
            {effectName && (
              <Box sx={{ px: 2, py: "5px" }}>
                <Typography variant="body2">
                  <strong>{t("Effect")}:</strong> {effectName}
                </Typography>
                {effectDesc && (
                  <Typography variant="body2" component="div">
                    <StyledMarkdown
                      allowedElements={["strong", "em"]}
                      unwrapDisallowed
                    >
                      {effectDesc}
                    </StyledMarkdown>
                  </Typography>
                )}
              </Box>
            )}
          </>
        )}

        {(item.subtype === "other" || !item.subtype) && (
          <>
            {item.description && (
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
                  {item.description}
                </Typography>
              </Box>
            )}
            {item.effect && (
              <Box sx={{ px: 2, py: 0.75, fontSize: "0.875rem" }}>
                <StyledMarkdown
                  allowedElements={["strong", "em"]}
                  unwrapDisallowed
                >
                  {item.effect}
                </StyledMarkdown>
              </Box>
            )}
          </>
        )}
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});

export const SharedZeroPowerCard = React.memo(function SharedZeroPowerCard({
  item,
  id = CARD_DEFAULTS.id,
  onHeaderClick = CARD_DEFAULTS.onHeaderClick,
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

  const triggerName =
    typeof item.zeroTrigger === "string"
      ? item.zeroTrigger
      : (item.zeroTrigger?.name ?? "");
  const triggerDesc =
    typeof item.zeroTrigger === "object"
      ? (item.zeroTrigger?.description ?? "")
      : "";
  const effectName =
    typeof item.zeroEffect === "string"
      ? item.zeroEffect
      : (item.zeroEffect?.name ?? "");
  const effectDesc =
    typeof item.zeroEffect === "object"
      ? (item.zeroEffect?.description ?? "")
      : "";

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

  const nameBandSx = {
    background,
    px: 2,
    py: 0.5,
    display: "flex",
    alignItems: "center",
    flex: 1,
    minHeight: "28px",
  };

  function ZeroPowerSection({ label, name, desc }) {
    if (!name && !desc) return null;
    return (
      <Box sx={{ borderTop: `1px solid ${customTheme.secondary}` }}>
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Box sx={labelPillSx}>
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: "0.75rem",
                color: "inherit",
                textTransform: "uppercase",
              }}
            >
              {label}
            </Typography>
          </Box>
          <Box sx={nameBandSx}>
            {name && (
              <Typography sx={{ fontWeight: "bold", fontSize: scale.body }}>
                {name}
              </Typography>
            )}
          </Box>
        </Box>
        {desc && (
          <Box sx={{ px: 2, py: 0.75, fontSize: "0.875rem" }}>
            <Typography
              variant="body2"
              component="div"
              sx={{ color: "text.secondary", lineHeight: 1.5 }}
            >
              {md(desc)}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  const IMAGE_SIZE = imageSize ?? 128;

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
              flex: `0 0 ${IMAGE_SIZE}px`,
              width: `${IMAGE_SIZE}px`,
              minHeight: `${IMAGE_SIZE}px`,
              background: customTheme.mode === "dark" ? "#181a1b" : "white",
              borderRight: `1px solid ${customTheme.secondary}`,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {imageSlot ?? <EditableImage size={IMAGE_SIZE} />}
          </Grid>
        )}
        <Grid container direction="column" sx={{ flex: 1, minWidth: 0 }}>
          <Box
            onClick={onHeaderClick}
            sx={{
              px: 2,
              py: 0.5,
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
                fontSize: scale.header,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "inherit",
                letterSpacing: "0.5px",
                lineHeight: 1.3,
              }}
            >
              {item.name}
            </Typography>
            <Chip
              label={t("Zero Power")}
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
          </Box>
        </Grid>
      </Grid>
      <ZeroPowerSection
        label={t("Trigger")}
        name={triggerName}
        desc={triggerDesc}
      />
      <ZeroPowerSection
        label={t("Effect")}
        name={effectName}
        desc={effectDesc}
      />
    </CardContentWrapper>
  );
});
