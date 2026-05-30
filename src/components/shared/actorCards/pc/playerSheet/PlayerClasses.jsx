import React, { useState } from "react";
import {
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
import { useTranslate } from "../../../../../translation/translate";
import SectionCard from "../../common/SectionCard";
import CustomHeader2 from "../../../../common/CustomHeader2";
import CustomHeader3 from "../../../../common/CustomHeader3";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import CompendiumViewerModal from "../../../../compendium/CompendiumViewerModal";
import EditIcon from "@mui/icons-material/Edit";
import EditPlayerClasses from "../../../../player/classes/EditPlayerClasses";
import EditHeroicSkillModal from "../../../../player/classes/EditHeroicSkillModal";
import EditSkillModal from "../../../../player/classes/EditSkillModal";

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
              heroic: {
                name: item.name,
                description: item.description,
                fuid: item.fuid,
              },
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
                      fuid: skill.fuid,
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
            <SectionCard
              key={index}
              title={`${t(c.name)} - ${t("LVL")} ${c.lvl}`}
              noShadow={isCharacterSheet}
              actions={
                isEditMode && setPlayer && (
                  <IconButton
                    size="small"
                    onClick={() => setOpenEdit(true)}
                    sx={{ color: "#fff" }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )
              }
              sx={{ marginBottom: "1em", paddingBottom: "1em" }}
            >
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
                        (c.isHomebrew ?? false) ? s.skillName : t(s.skillName)
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
                      component="div"
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
                        {t(s.description)}
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
                      component="div"
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
            </SectionCard>
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
