import React, { useState } from "react";
import {
  Paper,
  Typography,
  Grid,
  Box,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import CustomHeader2 from "../../common/CustomHeader2";
import CustomHeader3 from "../../common/CustomHeader3";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import CompendiumViewerModal from "../../compendium/CompendiumViewerModal";
import EditIcon from "@mui/icons-material/Edit";
import EditPlayerClasses from "../classes/EditPlayerClasses";
import EditHeroicSkillModal from "../classes/EditHeroicSkillModal";
import EditSkillModal from "../classes/EditSkillModal";

export default function PlayerClasses({
  player,
  setPlayer = null,
  isEditMode = false,
  isCharacterSheet,
  updateMaxStats,
}) {
  const { t } = useTranslate();
  const theme = useTheme();

  const [heroicPickerClassIdx, setHeroicPickerClassIdx] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);

  const handleAddHeroic = (item) => {
    if (heroicPickerClassIdx === null || !setPlayer) return;
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls, i) =>
        i === heroicPickerClassIdx
          ? {
              ...cls,
              heroic: { name: item.name, description: item.description },
            }
          : cls,
      ),
    }));
  };

  const handleIncreaseSkillLevel = (classIndex, skillIndex) => {
    if (!setPlayer) return;
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls, i) =>
        i === classIndex
          ? {
              ...cls,
              skills: cls.skills.map((skill, j) =>
                j === skillIndex && skill.currentLvl < skill.maxLvl
                  ? { ...skill, currentLvl: skill.currentLvl + 1 }
                  : skill,
              ),
            }
          : cls,
      ),
    }));
    if (updateMaxStats) updateMaxStats();
  };

  const [heroicEditClassIdx, setHeroicEditClassIdx] = useState(null);
  const [heroicEditData, setHeroicEditData] = useState(null);

  const [skillEditTarget, setSkillEditTarget] = useState(null); // { classIndex, skillIndex }
  const [skillEditData, setSkillEditData] = useState(null);

  const openHeroicEdit = (classIndex) => {
    setHeroicEditClassIdx(classIndex);
    setHeroicEditData({
      ...(player.classes[classIndex]?.heroic || { name: "", description: "" }),
    });
  };

  const handleSaveHeroic = (heroic) => {
    if (heroicEditClassIdx === null || !setPlayer) return;
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls, i) =>
        i === heroicEditClassIdx ? { ...cls, heroic } : cls,
      ),
    }));
    setHeroicEditClassIdx(null);
    setHeroicEditData(null);
  };

  const openSkillEdit = (classIndex, skillIndex) => {
    setSkillEditTarget({ classIndex, skillIndex });
    setSkillEditData({ ...player.classes[classIndex].skills[skillIndex] });
  };

  const handleSaveSkill = (skill) => {
    if (!skillEditTarget || !setPlayer) return;
    const { classIndex, skillIndex } = skillEditTarget;
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls, i) =>
        i === classIndex
          ? {
              ...cls,
              skills: cls.skills.map((s, j) =>
                j === skillIndex
                  ? {
                      ...s,
                      skillName: skill.skillName,
                      description: skill.description,
                      specialSkill: skill.specialSkill || "",
                      maxLvl: Number(skill.maxLvl) || s.maxLvl,
                      currentLvl: Math.min(
                        s.currentLvl,
                        Number(skill.maxLvl) || s.maxLvl,
                      ),
                    }
                  : s,
              ),
            }
          : cls,
      ),
    }));
    setSkillEditTarget(null);
    setSkillEditData(null);
  };

  const handleDecreaseSkillLevel = (classIndex, skillIndex) => {
    if (!setPlayer) return;
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls, i) =>
        i === classIndex
          ? {
              ...cls,
              skills: cls.skills.map((skill, j) =>
                j === skillIndex && skill.currentLvl > 0
                  ? { ...skill, currentLvl: skill.currentLvl - 1 }
                  : skill,
              ),
            }
          : cls,
      ),
    }));
    if (updateMaxStats) updateMaxStats();
  };
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const StyledMarkdown = styled(ReactMarkdown)({
    whiteSpace: "pre-line",
  });

  return (
    <>
      {player.classes.length > 0 && (
        <>
          {player.classes.map((c, index) => (
            <Paper
              key={index}
              elevation={3}
              sx={
                isCharacterSheet
                  ? {
                      borderRadius: "8px",
                      border: "2px solid",
                      borderColor: secondary,
                      display: "flex",
                      flexDirection: "column",
                      marginBottom: "1em",
                      paddingBottom: "1em",
                      boxShadow: "none",
                    }
                  : {
                      borderRadius: "8px",
                      border: "2px solid",
                      borderColor: secondary,
                      display: "flex",
                      flexDirection: "column",
                      marginBottom: "1em",
                      paddingBottom: "1em",
                    }
              }
            >
              <Box
                sx={{
                  backgroundColor: primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  borderRadius: "8px 8px 0 0",
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    textTransform: "uppercase",
                    padding: "5px", // Adjust padding instead of margins
                    color: custom.white,
                    fontSize: "1.5em",
                  }}
                  align="center"
                >
                  {t(c.name)} - {t("LVL") + " " + c.lvl}
                </Typography>
                {isEditMode && setPlayer && (
                  <IconButton
                    size="small"
                    onClick={() => setOpenEdit(true)}
                    sx={{ position: "absolute", right: 8, color: custom.white }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              {c.benefits && (
                <>
                  <Grid size={12}>
                    <CustomHeader2
                      headerText={`${t("Free Benefits")}`}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid style={{ margin: "-20px 0 0 0" }} size={12}>
                    <ul>
                      {c.benefits.hpplus !== 0 && (
                        <li>
                          <Typography>
                            {t(
                              "Permanently increase your maximum Hit Points by",
                            )}{" "}
                            {c.benefits.hpplus}.
                          </Typography>
                        </li>
                      )}
                      {c.benefits.mpplus !== 0 && (
                        <li>
                          <Typography>
                            {t(
                              "Permanently increase your maximum Mind Points by",
                            )}{" "}
                            {c.benefits.mpplus}.
                          </Typography>
                        </li>
                      )}
                      {c.benefits.ipplus !== 0 && (
                        <li>
                          <Typography>
                            {t(
                              "Permanently increase your maximum Inventory Points by",
                            )}{" "}
                            {c.benefits.ipplus}.
                          </Typography>
                        </li>
                      )}
                      {c.benefits.rituals && (
                        <>
                          {c.benefits.rituals.ritualism && (
                            <li>
                              <Typography>
                                {t(
                                  "You may perform Rituals whose effects fall within the Ritualism discipline.",
                                )}
                              </Typography>
                            </li>
                          )}
                        </>
                      )}
                      {c.benefits.martials && (
                        <>
                          {c.benefits.martials.melee && (
                            <li>
                              <Typography>
                                {t(
                                  "Gain the ability to equip martial melee weapons.",
                                )}
                              </Typography>
                            </li>
                          )}
                          {c.benefits.martials.ranged && (
                            <li>
                              <Typography>
                                {t(
                                  "Gain the ability to equip martial ranged weapons.",
                                )}
                              </Typography>
                            </li>
                          )}
                          {c.benefits.martials.shields && (
                            <li>
                              <Typography>
                                {t(
                                  "Gain the ability to equip martial shields.",
                                )}
                              </Typography>
                            </li>
                          )}
                          {c.benefits.martials.armor && (
                            <li>
                              <Typography>
                                {t("Gain the ability to equip martial armor.")}
                              </Typography>
                            </li>
                          )}
                          {c.benefits.custom &&
                            c.benefits.custom.map((custombenefit, index) => (
                              <li key={index}>
                                <Typography>{custombenefit}</Typography>
                              </li>
                            ))}
                        </>
                      )}
                    </ul>
                  </Grid>
                </>
              )}
              {c.skills
                .map((s, skillIndex) => ({ s, skillIndex }))
                .filter(({ s }) => isEditMode || s.currentLvl >= 1)
                .map(({ s, skillIndex }) => (
                  <React.Fragment key={skillIndex}>
                    <CustomHeader3
                      headerText={
                        (c.isHomebrew === undefined ? true : c.isHomebrew)
                          ? s.skillName
                          : t(s.skillName)
                      }
                      currentLvl={s.currentLvl}
                      maxLvl={s.maxLvl}
                      isEditMode={isEditMode && !!setPlayer}
                      onIncrease={() =>
                        handleIncreaseSkillLevel(index, skillIndex)
                      }
                      onDecrease={() =>
                        handleDecreaseSkillLevel(index, skillIndex)
                      }
                      onEdit={() => openSkillEdit(index, skillIndex)}
                      isHeroicSkill={false}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        justifyContent: "flex-start",
                        background: "transparent",
                        padding: "0 17px",
                      }}
                    >
                      <StyledMarkdown
                        allowedElements={["strong", "em"]}
                        unwrapDisallowed={true}
                      >
                        {(c.isHomebrew === undefined ? true : c.isHomebrew)
                          ? s.description
                          : t(s.description)}
                      </StyledMarkdown>
                    </Typography>
                  </React.Fragment>
                ))}
              {c.lvl === 10 && (
                <>
                  <Grid sx={{ marginTop: "1em" }} size={12}>
                    <CustomHeader2
                      headerText={t("Heroic Skill")}
                      //buttonText={t("Edit Benefits")}
                      //onButtonClick={() => setOpenEditBenefitsModal(true)}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid size={12}>
                    <CustomHeader3
                      headerText={c.heroic.name}
                      currentLvl={0}
                      maxLvl={0}
                      isEditMode={isEditMode && !!setPlayer}
                      isHeroicSkill={true}
                      onOpenCompendium={
                        isEditMode && setPlayer
                          ? () => setHeroicPickerClassIdx(index)
                          : undefined
                      }
                      onEdit={
                        isEditMode && setPlayer
                          ? () => openHeroicEdit(index)
                          : undefined
                      }
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        justifyContent: "flex-start",
                        background: "transparent",
                        padding: "0 17px",
                      }}
                    >
                      <StyledMarkdown
                        allowedElements={["strong", "em"]}
                        unwrapDisallowed={true}
                      >
                        {c.heroic.description}
                      </StyledMarkdown>
                    </Typography>
                  </Grid>
                </>
              )}
            </Paper>
          ))}
        </>
      )}
      <CompendiumViewerModal
        open={heroicPickerClassIdx !== null}
        onClose={() => setHeroicPickerClassIdx(null)}
        onAddItem={handleAddHeroic}
        initialType="heroics"
        restrictToTypes={["heroics"]}
        context="player"
      />
      {skillEditData !== null && (
        <EditSkillModal
          open={skillEditTarget !== null}
          onClose={() => {
            setSkillEditTarget(null);
            setSkillEditData(null);
          }}
          onSave={handleSaveSkill}
          skill={skillEditData}
          setSkill={setSkillEditData}
        />
      )}
      {heroicEditData !== null && (
        <EditHeroicSkillModal
          open={heroicEditClassIdx !== null}
          onClose={() => {
            setHeroicEditClassIdx(null);
            setHeroicEditData(null);
          }}
          onSave={handleSaveHeroic}
          heroic={heroicEditData}
          setHeroic={setHeroicEditData}
        />
      )}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogContent sx={{ p: 0 }}>
          <EditPlayerClasses
            player={player}
            setPlayer={setPlayer}
            isEditMode={true}
            updateMaxStats={updateMaxStats}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenEdit(false)}
            variant="contained"
            color="primary"
          >
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
