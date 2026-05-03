import React from "react";
import {
  Accordion,
  AccordionDetails,
  Box,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../../translation/translate";
import CustomHeaderClasses from "../../common/CustomHeaderClasses";
import CustomHeader2 from "../../common/CustomHeader2";
import CustomHeader3 from "../../common/CustomHeader3";
import {
  getMnemosphereHeroicDescription,
  getMnemosphereSkillDescription,
} from "./mnemosphereClassUtils";
import { getMnemosphereCost } from "../../../libs/mnemospheres";

function DescriptionText({ children }) {
  if (!children) return null;

  return (
    <Box
      sx={{
        px: "17px",
        pb: 1,
        fontFamily: "PT Sans Narrow",
        fontSize: "1rem",
        "& p": { mt: 0, mb: 0.75 },
      }}
    >
      <ReactMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
        {children}
      </ReactMarkdown>
    </Box>
  );
}

export default function MnemosphereClassCard({
  item,
  isCharacterSheet = false,
  editable = false,
  showAllSkills = false,
  onIncreaseSkillLevel = () => {},
  onDecreaseSkillLevel = () => {},
  availableLevels = null,
  onInvestLevel = null,
  onRefundLevel = null,
  isAccordion = false,
  isExpanded = false,
  onToggleExpand = () => {},
  actions = null,
  isSlotted = false,
  showHeaderMeta = false,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const skills = item.skills ?? [];
  const heroic = item.heroic ?? [];
  const spells = item.spells ?? [];
  const sphereLvl = item.lvl ?? 1;
  const baseLvl = item.baseLvl ?? item.lvl ?? 1;

  const budgetExhausted = availableLevels !== null && availableLevels <= 0;
  const showLevelControls = editable && (onInvestLevel || onRefundLevel);
  const showBaseLevel = baseLvl !== sphereLvl;
  const visibleSkills = skills
    .map((skill, index) => ({ skill, index }))
    .filter(
      ({ skill }) => editable || showAllSkills || (skill.currentLvl ?? 0) >= 1,
    );

  const headerText =
    showHeaderMeta && isAccordion
      ? `${t(item.class)} - ${getMnemosphereCost(sphereLvl)}z${
          isSlotted ? ` - ${t("Slotted")}` : ""
        }`
      : t(item.class);

  const mnemoHeader = (
    <CustomHeaderClasses
      type="top"
      headerText={headerText}
      rightHeaderText={t("Mnemosphere Level")}
      editableNumber={item.lvl ?? 1}
      readOnlyNumber={5}
      onLevelChange={() => {}}
      isEditMode={false}
      editClassName={() => {}}
      isAccordion={isAccordion}
      isExpanded={isExpanded}
      actions={actions}
    />
  );

  const cardBody = (
    <Grid container spacing={1}>
      {!isAccordion && <Grid size={12}>{mnemoHeader}</Grid>}
      <Grid size={12}>
        {showBaseLevel || showLevelControls ? (
          <Box sx={{ position: "relative" }}>
            <CustomHeader2 headerText={t("Skills")} />
            <Box
              sx={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                fontFamily: "Antonio",
              }}
            >
              {showBaseLevel && (
                <Typography
                  variant="caption"
                  sx={{
                    textTransform: "uppercase",
                    fontFamily: "Antonio",
                    fontSize: "0.9em",
                  }}
                >
                  {t("Base Level")}: {baseLvl}
                </Typography>
              )}
              {showLevelControls && (
                <>
                  <Tooltip title={t("Refund Level")}>
                    <span>
                      <IconButton
                        size="small"
                        onClick={onRefundLevel}
                        disabled={!onRefundLevel || sphereLvl <= baseLvl}
                        sx={{ p: 0.25 }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Typography
                    variant="caption"
                    sx={{
                      minWidth: 44,
                      textAlign: "center",
                      fontFamily: "Antonio",
                      fontSize: "0.9em",
                    }}
                  >
                    {t("Lv.")} {sphereLvl}/5
                  </Typography>
                  <Tooltip title={t("Invest Level")}>
                    <span>
                      <IconButton
                        size="small"
                        onClick={onInvestLevel}
                        disabled={!onInvestLevel || sphereLvl >= 5}
                        sx={{ p: 0.25 }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  {availableLevels !== null && (
                    <Typography
                      variant="caption"
                      color={budgetExhausted ? "text.secondary" : "primary"}
                      sx={{ fontFamily: "Antonio", fontSize: "0.9em" }}
                    >
                      {availableLevels} {t("skill pt. available")}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Box>
        ) : (
          <CustomHeader2 headerText={t("Skills")} />
        )}
      </Grid>
      {visibleSkills.map(({ skill, index }) => (
        <Grid key={`${skill.name}-${index}`} size={12}>
          <CustomHeader3
            headerText={t(skill.name)}
            currentLvl={skill.currentLvl ?? 0}
            maxLvl={skill.maxLvl ?? 0}
            onIncrease={() => onIncreaseSkillLevel(index)}
            onDecrease={() => onDecreaseSkillLevel(index)}
            onEdit={() => {}}
            isEditMode={editable}
            isHeroicSkill={false}
            hideEditButton={true}
            increaseDisabled={budgetExhausted}
            increaseTooltip={
              budgetExhausted ? t("No levels available") : undefined
            }
          />
          <DescriptionText>
            {t(getMnemosphereSkillDescription(item, skill) ?? "")}
          </DescriptionText>
        </Grid>
      ))}

      {heroic.length > 0 && (
        <>
          <Grid size={12}>
            <Divider />
          </Grid>
          <Grid size={12}>
            <CustomHeader2 headerText={t("Heroic Skills")} />
          </Grid>
          {heroic.map((heroicSkill, index) => (
            <Grid key={`${heroicSkill.name}-${index}`} size={12}>
              <CustomHeader3
                headerText={t(heroicSkill.name)}
                currentLvl={0}
                maxLvl={0}
                onIncrease={() => {}}
                onDecrease={() => {}}
                onEdit={() => {}}
                isEditMode={false}
                isHeroicSkill={true}
              />
              <DescriptionText>
                {t(getMnemosphereHeroicDescription(item, heroicSkill) ?? "")}
              </DescriptionText>
            </Grid>
          ))}
        </>
      )}

      {spells.length > 0 && (
        <>
          <Grid size={12}>
            <Divider />
          </Grid>
          <Grid size={12}>
            <CustomHeader2 headerText={t("Spells")} />
          </Grid>
          {spells.map((spell, index) => (
            <Grid key={`${spell.name}-${index}`} size={12}>
              <CustomHeader3
                headerText={t(spell.name)}
                currentLvl={0}
                maxLvl={0}
                onIncrease={() => {}}
                onDecrease={() => {}}
                onEdit={() => {}}
                isEditMode={false}
                isHeroicSkill={true}
              />
              <DescriptionText>{t(spell.description ?? "")}</DescriptionText>
            </Grid>
          ))}
        </>
      )}
    </Grid>
  );

  if (isAccordion) {
    return (
      <Accordion
        elevation={3}
        expanded={isExpanded}
        onChange={onToggleExpand}
        sx={{
          border: "2px solid",
          borderColor: secondary,
          "&.MuiAccordion-root": {
            borderRadius: "8px !important",
            "&:before": { display: "none" },
          },
          "& .MuiAccordion-heading": {
            borderRadius: "6px !important",
          },
          "&.Mui-expanded .MuiAccordion-heading": {
            borderRadius: "6px 6px 0 0 !important",
          },
          "&.MuiAccordion-root .MuiAccordionSummary-root": {
            borderRadius: isExpanded
              ? "6px 6px 0 0 !important"
              : "6px !important",
          },
        }}
      >
        {mnemoHeader}
        <AccordionDetails sx={{ p: "15px" }}>{cardBody}</AccordionDetails>
      </Accordion>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: "15px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
        boxShadow: isCharacterSheet ? "none" : undefined,
      }}
    >
      {mnemoHeader}
      {cardBody}
    </Paper>
  );
}
