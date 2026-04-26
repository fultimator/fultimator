import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { styled } from "@mui/system";

import { Martial } from "../../../icons";
import { OpenBracket, CloseBracket } from "../../../Bracket";
import Diamond from "../../../Diamond";
import attributes from "../../../../libs/attributes";
import types from "../../../../libs/types";
import { calculateCustomWeaponStats } from "../../../player/common/playerCalculations";
import { CARD_DEFAULTS, useCardSetup, isImageMode } from "../core-utils";
import {
  CardContentWrapper,
  HeaderSpacer,
  RowsWithOptionalImage,
} from "../core";

const ROW_MIN_HEIGHT = "38px";
const ROW_MIN_HEIGHT_NO_IMAGE = "40px";

const StyledMarkdownBase = styled(ReactMarkdown)({
  "& ul, & ol": {
    paddingLeft: "1.5em",
    margin: 0,
    marginTop: "0.5em",
    marginBottom: "0.5em",
  },
  "& p": {
    margin: 0,
    marginTop: "0.5em",
    marginBottom: "0.5em",
    lineHeight: 1.5,
  },
  "& ul": { listStyle: "disc", lineHeight: 1.6 },
  "& ol": { listStyle: "decimal", lineHeight: 1.6 },
  "& li": { display: "list-item", lineHeight: 1.6 },
  "& strong": { fontWeight: 600 },
  "& em": { fontStyle: "italic" },
  display: "inline",
});

const StyledMarkdown = ({ children, ...props }) => (
  <StyledMarkdownBase remarkPlugins={[remarkBreaks]} {...props}>
    {typeof children === "string" ? children.replace(/\\n/g, "\n") : children}
  </StyledMarkdownBase>
);

const QUALITY_MARKDOWN_COMPONENTS = {
  p: ({ _node, ...props }) => <p style={{ margin: 0 }} {...props} />,
};

function rowMinHeight(imageMode) {
  return isImageMode(imageMode) ? ROW_MIN_HEIGHT : ROW_MIN_HEIGHT_NO_IMAGE;
}

function rowPl(imageMode) {
  return isImageMode(imageMode) ? 0.75 : 1;
}

function headerSx(customTheme, scale, onHeaderClick, imageMode) {
  return {
    alignItems: "center",
    minHeight: "36px",
    py: isImageMode(imageMode) ? 0 : 1,
    background: customTheme.primary,
    color: "#ffffff",
    cursor: onHeaderClick ? "pointer" : "default",
    "& .MuiTypography-root": {
      fontSize: scale.header,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      lineHeight: 1.4,
      color: "inherit",
    },
  };
}

function dataRowSx(customTheme, imageMode, background, extraSx = {}) {
  return {
    alignItems: "center",
    minHeight: rowMinHeight(imageMode),
    flexGrow: 1,
    py: isImageMode(imageMode) ? 0.25 : 0.5,
    pl: rowPl(imageMode),
    width: "100%",
    ...extraSx,
    ...(background ? { background } : {}),
  };
}

function qualityRowSx(customTheme, imageMode) {
  return {
    pl: rowPl(imageMode),
    pr: rowPl(imageMode),
    py: 0.75,
    borderBottom: `1px solid ${customTheme.secondary}`,
    display: "flex",
    alignItems: "center",
    flexGrow: 1,
    minHeight: rowMinHeight(imageMode),
  };
}

function getWeaponRangeLabel(item, t) {
  if (item.ranged) return t("Ranged");
  return t("Melee");
}

function getArmorCategory(item) {
  return item.category || item.base?.category || "Armor";
}

function getArmorDef(item, category, t) {
  const value = parseInt(item.def || 0) + parseInt(item.defModifier || 0);
  if (category === "Shield") return `+${value}`;
  if (item.martial) return value;
  return value === 0 ? t("DEX die") : `${t("DEX die")} + ${value}`;
}

function getArmorMDef(item, category, t) {
  const value =
    parseInt(item.mdef ?? item.mDef ?? 0) + parseInt(item.mDefModifier || 0);
  if (category === "Shield") return `+${value}`;
  return value === 0 ? t("INS die") : `${t("INS die")} + ${value}`;
}

function getArmorInit(item) {
  const value = parseInt(item.init || 0) + parseInt(item.initModifier || 0);
  if (value === 0) return "-";
  return `${value > 0 ? "+" : ""}${value}`;
}

function getCustomWeaponDamageType(item) {
  if ((item.overrideDamageType || item.overrideType) && item.customDamageType)
    return item.customDamageType;
  return item.type || "physical";
}

function isCustomWeaponMartial(item) {
  if (item.martial) return true;
  return (item.customizations || []).some((c) =>
    [
      "weapon_customization_quick",
      "weapon_customization_magicdefenseboost",
      "weapon_customization_powerful",
    ].includes(c.name),
  );
}

function getCustomWeaponRangeLabel(item, t) {
  return item.range === "weapon_range_ranged" ? t("Ranged") : t("Melee");
}

function resolveAccuracyAttributes(item) {
  const att1Raw = Array.isArray(item.accuracyCheck)
    ? item.accuracyCheck[0]
    : item.accuracyCheck?.att1 || item.att1;
  const att2Raw = Array.isArray(item.accuracyCheck)
    ? item.accuracyCheck[1]
    : item.accuracyCheck?.att2 || item.att2;
  return {
    attr1: attributes[att1Raw || "dexterity"],
    attr2: attributes[att2Raw || "might"],
  };
}

function QualityRow({ item, customTheme, imageMode }) {
  if (!item.quality) return null;
  return (
    <Box sx={qualityRowSx(customTheme, imageMode)}>
      <Typography variant="body2" sx={{ lineHeight: 1.35 }} component="div">
        <StyledMarkdown
          allowedElements={["strong", "em"]}
          unwrapDisallowed
          components={QUALITY_MARKDOWN_COMPONENTS}
        >
          {item.quality}
        </StyledMarkdown>
      </Typography>
    </Box>
  );
}

export const SharedWeaponCard = React.memo(function SharedWeaponCard({
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

  const attr1 = attributes[item.att1];
  const attr2 = attributes[item.att2];
  const dmgType = types[item.type];
  const withImage = isImageMode(imageMode);
  const cols = withImage
    ? { name: 3, cost: 1, accuracy: 4, damage: 4, hands: 4, range: 3 }
    : { name: 4, cost: 2, accuracy: 3, damage: 3, hands: 3, range: 3 };

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
      {showHeader && (
        <Grid
          container
          onClick={onHeaderClick}
          sx={headerSx(customTheme, scale, onHeaderClick, imageMode)}
        >
          <HeaderSpacer
            imageMode={imageMode}
            imageSize={imageSize}
            imageVisible={imageVisible}
          />
          <Grid container sx={{ flex: 1, pl: rowPl(imageMode) }}>
            <Grid size={cols.name}>
              <Typography>{t("Weapon")}</Typography>
            </Grid>
            <Grid size={cols.cost}>
              <Typography sx={{ textAlign: "center" }}>{t("Cost")}</Typography>
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
        </Grid>
      )}

      <RowsWithOptionalImage
        imageMode={imageMode}
        imageSize={imageSize}
        imageVisible={imageVisible}
        imageSlot={imageSlot}
        customTheme={customTheme}
      >
        <Grid
          container
          sx={dataRowSx(customTheme, imageMode, background, {
            borderBottom: `1px solid ${customTheme.secondary}`,
          })}
        >
          <Grid sx={{ display: "flex", alignItems: "center" }} size={cols.name}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: scale.headingRow,
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
              {item.cost}z
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
              {attr1?.shortcaps} + {attr2?.shortcaps}
              <CloseBracket />
              {item.prec > 0
                ? `+${item.prec}`
                : item.prec < 0
                  ? `${item.prec}`
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
              {t("HR")} {item.damage >= 0 ? "+" : ""} {item.damage}
              <CloseBracket />
              {dmgType?.long}
            </Typography>
          </Grid>
        </Grid>

        <Grid
          container
          sx={dataRowSx(customTheme, imageMode, null, {
            borderBottom: `1px solid ${customTheme.secondary}`,
          })}
        >
          <Grid size={cols.name}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: scale.headingRow,
                lineHeight: 1,
                margin: 0,
              }}
            >
              {t(item.category)}
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
          <Grid size={cols.hands}>
            <Typography
              sx={{
                textAlign: "center",
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              {item.hands === 1 ? t("One-handed") : t("Two-handed")}
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
          <Grid size={cols.range}>
            <Typography
              sx={{
                textAlign: "center",
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              {getWeaponRangeLabel(item, t)}
            </Typography>
          </Grid>
        </Grid>
      </RowsWithOptionalImage>

      <QualityRow item={item} customTheme={customTheme} imageMode={imageMode} />
    </CardContentWrapper>
  );
});

function SharedArmorLikeCard({
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
  forceCategory,
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

  const category = forceCategory || getArmorCategory(item);
  const withImage = isImageMode(imageMode);
  const cols = withImage
    ? { name: 3, cost: 1, def: 2, mdef: 2, init: 2 }
    : { name: 3, cost: 2, def: 2, mdef: 2, init: 3 };

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
      {showHeader && (
        <Grid
          container
          onClick={onHeaderClick}
          sx={headerSx(customTheme, scale, onHeaderClick, imageMode)}
        >
          <HeaderSpacer
            imageMode={imageMode}
            imageSize={imageSize}
            imageVisible={imageVisible}
          />
          <Grid container sx={{ flex: 1, pl: rowPl(imageMode) }}>
            <Grid size={cols.name}>
              <Typography>{t(category)}</Typography>
            </Grid>
            <Grid size={cols.cost}>
              <Typography sx={{ textAlign: "center" }}>{t("Cost")}</Typography>
            </Grid>
            <Grid size={cols.def}>
              <Typography sx={{ textAlign: "center" }}>{t("DEF")}</Typography>
            </Grid>
            <Grid size={cols.mdef}>
              <Typography sx={{ textAlign: "center" }}>{t("MDEF")}</Typography>
            </Grid>
            {!item.rework && (
              <Grid size={cols.init}>
                <Typography sx={{ textAlign: "center" }}>
                  {t("INIT")}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      )}

      <RowsWithOptionalImage
        imageMode={imageMode}
        imageSize={imageSize}
        imageVisible={imageVisible}
        imageSlot={imageSlot}
        customTheme={customTheme}
      >
        <Grid
          container
          sx={dataRowSx(customTheme, imageMode, background, {
            borderBottom: `1px solid ${customTheme.secondary}`,
          })}
        >
          <Grid sx={{ display: "flex", alignItems: "center" }} size={cols.name}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: scale.headingRow,
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
              {item.cost}z
            </Typography>
          </Grid>
          <Grid size={cols.def}>
            <Typography
              sx={{
                textAlign: "center",
                fontWeight: 600,
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              {getArmorDef(item, category, t)}
            </Typography>
          </Grid>
          <Grid size={cols.mdef}>
            <Typography
              sx={{
                textAlign: "center",
                fontWeight: 600,
                fontSize: scale.body,
                lineHeight: 1,
                margin: 0,
              }}
            >
              {getArmorMDef(item, category, t)}
            </Typography>
          </Grid>
          {!item.rework && (
            <Grid size={cols.init}>
              <Typography
                sx={{
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: scale.body,
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                {getArmorInit(item)}
              </Typography>
            </Grid>
          )}
        </Grid>

        <QualityRow
          item={item}
          customTheme={customTheme}
          imageMode={imageMode}
        />
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
}

export const SharedArmorCard = React.memo(function SharedArmorCard(props) {
  return <SharedArmorLikeCard {...props} />;
});

export const SharedShieldCard = React.memo(function SharedShieldCard(props) {
  return <SharedArmorLikeCard {...props} forceCategory="Shield" />;
});

function CustomWeaponRows({
  item,
  customTheme,
  scale,
  background,
  imageMode,
  imageSize,
  imageVisible,
  imageSlot,
  cols,
  t,
}) {
  const { precision, damage } = calculateCustomWeaponStats(item, false);
  const { attr1, attr2 } = resolveAccuracyAttributes(item);
  const damageType = types[getCustomWeaponDamageType(item)];
  const martial = isCustomWeaponMartial(item);

  return (
    <RowsWithOptionalImage
      imageMode={imageMode}
      imageSize={imageSize}
      imageVisible={imageVisible}
      imageSlot={imageSlot}
      customTheme={customTheme}
    >
      <Grid
        container
        sx={dataRowSx(customTheme, imageMode, background, {
          borderBottom: `1px solid ${customTheme.secondary}`,
        })}
      >
        <Grid sx={{ display: "flex", alignItems: "center" }} size={cols.name}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: scale.headingRow,
              lineHeight: 1,
              margin: 0,
            }}
          >
            {item.name || t("Custom Weapon")}
          </Typography>
          {martial && <Martial />}
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
            {item.cost || 300}z
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
            {attr1?.shortcaps} + {attr2?.shortcaps}
            <CloseBracket />
            {precision > 0
              ? `+${precision}`
              : precision < 0
                ? `${precision}`
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
            {t("HR +")} {damage}
            <CloseBracket />
            {damageType?.long}
          </Typography>
        </Grid>
      </Grid>

      <Grid
        container
        sx={dataRowSx(customTheme, imageMode, null, {
          borderBottom: `1px solid ${customTheme.secondary}`,
        })}
      >
        <Grid size={cols.name}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: scale.headingRow,
              lineHeight: 1,
              margin: 0,
            }}
          >
            {t(item.category)}
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
        <Grid size={cols.hands}>
          <Typography
            sx={{
              textAlign: "center",
              fontSize: scale.body,
              lineHeight: 1,
              margin: 0,
            }}
          >
            {item.hands === 1 ? t("One-handed") : t("Two-handed")}
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
        <Grid size={cols.range}>
          <Typography
            sx={{
              textAlign: "center",
              fontSize: scale.body,
              lineHeight: 1,
              margin: 0,
            }}
          >
            {getCustomWeaponRangeLabel(item, t)}
          </Typography>
        </Grid>
      </Grid>
    </RowsWithOptionalImage>
  );
}

function CustomizationsAndQualityRow({ item, customTheme, imageMode, t }) {
  const customizations = item.customizations || [];
  if (customizations.length === 0 && !item.quality) return null;
  return (
    <Box sx={qualityRowSx(customTheme, imageMode)}>
      <Typography
        variant="body2"
        sx={{
          lineHeight: 1.35,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "4px",
        }}
        component="div"
      >
        {customizations.map((c, i) => (
          <React.Fragment key={i}>
            <span>{t(c.name)}</span>
            {(i < customizations.length - 1 || item.quality) && (
              <Diamond color={customTheme.primary} />
            )}
          </React.Fragment>
        ))}
        {item.quality && (
          <StyledMarkdown
            allowedElements={["strong", "em"]}
            unwrapDisallowed
            components={QUALITY_MARKDOWN_COMPONENTS}
          >
            {item.quality}
          </StyledMarkdown>
        )}
      </Typography>
    </Box>
  );
}

function buildSecondWeaponItem(item) {
  return {
    name: item.secondWeaponName || item.name,
    category: item.secondSelectedCategory || item.category,
    range: item.secondSelectedRange || item.range,
    accuracyCheck: item.secondSelectedAccuracyCheck || item.accuracyCheck,
    type: item.secondSelectedType || item.type,
    customizations: item.secondCurrentCustomizations || [],
    quality: item.quality,
    qualityCost: item.qualityCost,
    cost: item.cost,
    damageModifier: item.secondDamageModifier || 0,
    precModifier: item.secondPrecModifier || 0,
    defModifier: item.secondDefModifier || 0,
    mDefModifier: item.secondMDefModifier || 0,
    overrideDamageType: item.secondOverrideDamageType || false,
    customDamageType: item.secondCustomDamageType || item.customDamageType,
  };
}

export const SharedCustomWeaponCard = React.memo(
  function SharedCustomWeaponCard({
    item,
    id = CARD_DEFAULTS.id,
    onHeaderClick = CARD_DEFAULTS.onHeaderClick,
    showHeader = CARD_DEFAULTS.showHeader,
    showCard = CARD_DEFAULTS.showCard,
    variant = CARD_DEFAULTS.variant,
    imageMode = CARD_DEFAULTS.imageMode,
    imageSize = 80,
    imageSlot = CARD_DEFAULTS.imageSlot,
    showImageToggle = CARD_DEFAULTS.showImageToggle,
    showImage = CARD_DEFAULTS.showImage,
    onShowImageChange = CARD_DEFAULTS.onShowImageChange,
    showImageTempInfo = CARD_DEFAULTS.showImageTempInfo,
    imageTempInfoTextKey = CARD_DEFAULTS.imageTempInfoTextKey,
    actionContent = CARD_DEFAULTS.actionContent,
    defaultImageVisible = CARD_DEFAULTS.defaultImageVisible,
    activeForm = null,
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

    const withImage = isImageMode(imageMode);
    const cols = withImage
      ? { name: 3, cost: 1, accuracy: 4, damage: 4, hands: 3, range: 4 }
      : { name: 4, cost: 2, accuracy: 3, damage: 3, hands: 3, range: 3 };

    const hasStoredSecondForm =
      item.secondWeaponName != null || item.secondCurrentCustomizations != null;
    const secondItem = hasStoredSecondForm ? buildSecondWeaponItem(item) : null;

    const rowProps = {
      customTheme,
      scale,
      background,
      imageMode,
      imageSize,
      imageVisible,
      imageSlot,
      cols,
      t,
    };

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
        {showHeader && (
          <Grid
            container
            onClick={onHeaderClick}
            sx={headerSx(customTheme, scale, onHeaderClick, imageMode)}
          >
            <HeaderSpacer
              imageMode={imageMode}
              imageSize={imageSize}
              imageVisible={imageVisible}
            />
            <Grid container sx={{ flex: 1, pl: rowPl(imageMode) }}>
              <Grid size={cols.name}>
                <Typography>{t("Custom Weapon")}</Typography>
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
          </Grid>
        )}

        {secondItem && (
          <Box
            sx={{
              px: 1,
              pt: 0.5,
              pb: 0.25,
              background: customTheme.secondary + "33",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                opacity: 0.7,
              }}
            >
              {t("Primary Form")}
            </Typography>
          </Box>
        )}
        <Box sx={{ opacity: activeForm === "secondary" ? 0.5 : 1 }}>
          <CustomWeaponRows item={item} {...rowProps} />
          <CustomizationsAndQualityRow
            item={item}
            customTheme={customTheme}
            imageMode={imageMode}
            t={t}
          />
        </Box>

        {secondItem && (
          <>
            <Box
              sx={{
                px: 1,
                pt: 0.5,
                pb: 0.25,
                background: customTheme.secondary + "33",
                borderTop: `1px solid ${customTheme.secondary}`,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  opacity: 0.7,
                }}
              >
                {t("Transforming Form")}
              </Typography>
            </Box>
            <Box sx={{ opacity: activeForm === "primary" ? 0.5 : 1 }}>
              <CustomWeaponRows item={secondItem} {...rowProps} />
              <CustomizationsAndQualityRow
                item={secondItem}
                customTheme={customTheme}
                imageMode={imageMode}
                t={t}
              />
            </Box>
          </>
        )}
      </CardContentWrapper>
    );
  },
);

export const SharedAccessoryCard = React.memo(function SharedAccessoryCard({
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

  const withImage = isImageMode(imageMode);
  const cols = withImage ? { name: 6, cost: 4 } : { name: 9, cost: 3 };

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
      {showHeader && (
        <Grid
          container
          onClick={onHeaderClick}
          sx={headerSx(customTheme, scale, onHeaderClick, imageMode)}
        >
          <HeaderSpacer
            imageMode={imageMode}
            imageSize={imageSize}
            imageVisible={imageVisible}
          />
          <Grid container sx={{ flex: 1, pl: rowPl(imageMode) }}>
            <Grid size={cols.name}>
              <Typography>{t("Accessory")}</Typography>
            </Grid>
            <Grid size={cols.cost}>
              <Typography sx={{ textAlign: "center" }}>{t("Cost")}</Typography>
            </Grid>
          </Grid>
        </Grid>
      )}

      <RowsWithOptionalImage
        imageMode={imageMode}
        imageSize={imageSize}
        imageVisible={imageVisible}
        imageSlot={imageSlot}
        customTheme={customTheme}
      >
        <Grid
          container
          sx={dataRowSx(customTheme, imageMode, background, {
            borderBottom: `1px solid ${customTheme.secondary}`,
          })}
        >
          <Grid size={cols.name}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: scale.headingRow,
                lineHeight: 1,
                margin: 0,
              }}
            >
              {item.name}
            </Typography>
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
              {item.cost}z
            </Typography>
          </Grid>
        </Grid>

        <QualityRow
          item={item}
          customTheme={customTheme}
          imageMode={imageMode}
        />
      </RowsWithOptionalImage>
    </CardContentWrapper>
  );
});
