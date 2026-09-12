import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import {
  useCardSetup,
  headerBoxSx,
  CARD_DEFAULTS,
} from "/src/components/shared/items/core-utils";
import { StyledMarkdown } from "/src/components/shared/items/markdown";
import {
  CardContentWrapper,
  RowsWithOptionalImage,
} from "/src/components/shared/items/core";
import { useTranslate } from "/src/translation/translate";
import Diamond from "/src/components/Diamond";

const MODE_LABEL_KEY = {
  0: "effect.mode.override",
  1: "effect.mode.multiply",
  2: "effect.mode.add",
  3: "effect.mode.downgrade",
  4: "effect.mode.upgrade",
  5: "effect.mode.custom",
};

export const SharedEffectCard = React.memo(function SharedEffectCard({
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
  const { t } = useTranslate();
  const {
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

  const triggerKind = item.trigger?.kind ?? "passive";
  const isPassive = triggerKind === "passive";
  const changes = isPassive
    ? Array.isArray(item.changes)
      ? item.changes
      : []
    : Array.isArray(item.appliesEffect?.changes)
      ? item.appliesEffect.changes
      : [];
  const applicableTypes = Array.isArray(item.applicableTypes)
    ? item.applicableTypes
    : [];
  const afterEffects =
    !isPassive && Array.isArray(item.afterEffects) ? item.afterEffects : [];

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
              sx={{
                ...headerBoxSx(customTheme, scale, onHeaderClick),
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography>{t("Effect")}</Typography>
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                <Chip
                  label={t(`trigger.kind.${triggerKind}`)}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    fontSize: "0.7rem",
                  }}
                />
                <Chip
                  label={t(
                    item.transfer
                      ? "behavior.transfer.true"
                      : "behavior.transfer.false",
                  )}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "0.7rem",
                  }}
                />
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
        {/* Name + applicable types */}
        <Box
          sx={{
            background,
            borderBottom: `1px solid ${customTheme.secondary}`,
            px: 2,
            py: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography sx={{ fontWeight: "bold", fontSize: scale.body }}>
            {item.name || t("Unnamed Effect")}
          </Typography>
          {applicableTypes.length > 0 && (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {applicableTypes.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  size="small"
                  sx={{ fontSize: "0.65rem", height: 18 }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Active/reactive: effect label + target + duration + crisis + chat text */}
        {!isPassive && (
          <Box
            sx={{
              background,
              borderBottom: `1px solid ${customTheme.secondary}`,
              px: 2,
              py: "4px",
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {[
              item.appliesEffect?.label
                ? {
                    label: t("behavior.appliesEffect.label"),
                    value: item.appliesEffect.label,
                  }
                : null,
              item.appliesEffect?.target
                ? {
                    label: t("behavior.appliesEffect.target"),
                    value: t(
                      `appliesEffect.target.${item.appliesEffect.target}`,
                    ),
                  }
                : null,
              item.appliesEffect?.duration?.event &&
              item.appliesEffect.duration.event !== "none"
                ? {
                    label: t("behavior.appliesEffect.duration"),
                    value: t(
                      `effect.duration.${item.appliesEffect.duration.event}`,
                    ),
                  }
                : null,
              item.appliesEffect?.predicate?.crisisInteraction &&
              item.appliesEffect.predicate.crisisInteraction !== "none"
                ? {
                    label: t("behavior.appliesEffect.crisisInteraction"),
                    value: t(
                      `effect.crisis.${item.appliesEffect.predicate.crisisInteraction}`,
                    ),
                  }
                : null,
              item.chatOutput?.text
                ? {
                    label: t("behavior.chatOutput.text"),
                    value: item.chatOutput.text,
                  }
                : null,
            ]
              .filter(Boolean)
              .map((entry, i) => (
                <Box
                  key={i}
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  {i > 0 && <Diamond color={customTheme.secondary} />}
                  <Typography sx={{ fontSize: scale.body }}>
                    <strong>{entry.label}:</strong> {entry.value}
                  </Typography>
                </Box>
              ))}
          </Box>
        )}

        {/* Changes (passive: top-level changes; active: appliesEffect.changes) */}
        {changes.length > 0 && (
          <Box
            sx={{
              background,
              borderBottom: `1px solid ${customTheme.secondary}`,
              px: 2,
              py: "4px",
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {changes.map((ch, i) => (
              <Box
                key={i}
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                {i > 0 && <Diamond color={customTheme.secondary} />}
                <Typography sx={{ fontSize: scale.body }}>
                  <strong>{ch.key}</strong>{" "}
                  {t(MODE_LABEL_KEY[ch.mode] ?? "effect.mode.add")}{" "}
                  {ch.value ?? ""}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* After effects */}
        {afterEffects.length > 0 && (
          <Box
            sx={{
              background,
              borderBottom: `1px solid ${customTheme.secondary}`,
              px: 2,
              py: "4px",
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {afterEffects.map((ae, i) => {
              const amt =
                ae.amount === "half-damage" || ae.amount === "half-loss"
                  ? t(`afterEffect.amount.${ae.amount}`)
                  : ae.amount != null &&
                      typeof ae.amount === "object" &&
                      ae.amount.expr
                    ? ae.amount.expr
                    : ae.amount != null && ae.amount !== ""
                      ? String(ae.amount)
                      : "";
              return (
                <Box
                  key={i}
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  {i > 0 && <Diamond color={customTheme.secondary} />}
                  <Typography sx={{ fontSize: scale.body }}>
                    <strong>
                      {t(`afterEffect.target.${ae.target ?? "targets"}`)}
                    </strong>{" "}
                    {t(`afterEffect.direction.${ae.direction ?? "loss"}`)}
                    {amt ? ` ${amt}` : ""}{" "}
                    {String(ae.resource ?? "hp").toUpperCase()}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Description */}
        {item.description && (
          <Box sx={{ px: 2, py: 0.5, fontSize: "0.875rem" }}>
            <StyledMarkdown
              allowedElements={["p", "strong", "em", "ul", "ol", "li", "br"]}
              unwrapDisallowed
            >
              {item.description}
            </StyledMarkdown>
          </Box>
        )}
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});
