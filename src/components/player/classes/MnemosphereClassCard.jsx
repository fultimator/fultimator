import React from "react";
import { Box, Chip, Divider, Grid, Paper, Typography } from "@mui/material";
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
  onIncreaseSkillLevel = () => {},
  onDecreaseSkillLevel = () => {},
  availableLevels = null,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const skills = item.skills ?? [];
  const heroic = item.heroic ?? [];
  const spells = item.spells ?? [];

  const budgetExhausted = availableLevels !== null && availableLevels <= 0;

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
      <Grid container spacing={1}>
        <Grid size={12}>
          <CustomHeaderClasses
            type="top"
            headerText={t(item.class)}
            rightHeaderText={t("Mnemosphere Level")}
            editableNumber={item.lvl ?? 1}
            readOnlyNumber={5}
            onLevelChange={() => {}}
            isEditMode={false}
            editClassName={() => {}}
          />
        </Grid>

        <Grid size={12}>
          <CustomHeader2 headerText={t("Skills")} />
        </Grid>
        {editable && availableLevels !== null && (
          <Grid size={12}>
            <Chip
              size="small"
              label={`${availableLevels} ${t("level(s) available")}`}
              color={budgetExhausted ? "default" : "primary"}
              sx={{ ml: "17px", mb: 0.5 }}
            />
          </Grid>
        )}
        {skills.length === 0 ? (
          <Grid size={12}>
            <Typography sx={{ px: 2, pb: 1 }} color="text.secondary">
              {t("No skills")}
            </Typography>
          </Grid>
        ) : (
          skills.map((skill, index) => (
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
          ))
        )}

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
    </Paper>
  );
}
