import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Paper,
  Grid,
  Typography,
  Button,
  Box,
  Divider,
  Alert,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import { useTranslate } from "../../../translation/translate";
import CustomHeaderClasses from "../../common/CustomHeaderClasses";
import CustomHeader2 from "../../common/CustomHeader2";
import CustomHeader3 from "../../common/CustomHeader3";
import EditClassNameModal from "./EditClassNameModal";
import AddSkillModal from "./AddSkillModal";
import EditFreeBenefitsModal from "./EditFreeBenefitsModal";
import EditSpellClassesModal from "./EditSpellClassesModal";
import EditHeroicSkillModal from "./EditHeroicSkillModal";
import spellClasses from "../../../libs/spellClasses";
import Export from "../../Export";

export default function PlayerClassCard({
  classItem,
  onRemove,
  onLevelChange,
  onSaveBenefits,
  onAddSkill,
  onEditSkill,
  onDeleteSkill,
  onIncreaseSkillLevel,
  onDecreaseSkillLevel,
  isEditMode,
  editClassName,
  editHeroic,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const StyledMarkdown = styled(ReactMarkdown)({
    whiteSpace: "pre-line",
  });

  const [openAddSkillModal, setOpenAddSkillModal] = useState(false);
  const [openEditBenefitsModal, setOpenEditBenefitsModal] = useState(false);
  const [openEditClassNameModal, setOpenEditClassNameModal] = useState(false);
  const [openEditSpellClassesModal, setOpenEditSpellClassesModal] =
    useState(false);
  const [openEditHeroicSkillModal, setOpenEditHeroicSkillModal] =
    useState(false);
  const [editSkillIndex, setEditSkillIndex] = useState(null);
  const [skillName, setSkillName] = useState("");
  const [maxLevel, setMaxLevel] = useState(1);
  const [description, setDescription] = useState("");
  const [specialSkill, setSpecialSkill] = useState("");
  const [warnings, setWarnings] = useState([]);

  const [heroic, setHeroic] = useState({
    name: classItem.heroic ? classItem.heroic.name : "",
    description: classItem.heroic ? classItem.heroic.description : "",
  });

  const [className, setClassName] = useState(classItem.name);

  useEffect(() => {
    setWarnings([]);
    checkWarnings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classItem]);

  const checkWarnings = () => {
    const warnings = [];

    const sumOfSkillLevels = classItem.skills.reduce(
      (acc, skill) => acc + skill.currentLvl,
      0
    );
    if (sumOfSkillLevels !== classItem.lvl) {
      warnings.push(
        t("The sum of the skill levels is different from the class level")
      );
      setWarnings(warnings);
    }
  };

  const handleOpenEditClassNameModal = () => {
    setOpenEditClassNameModal(true);
    setClassName(classItem.name);
  };

  const handleCloseEditClassNameModal = () => {
    setOpenEditClassNameModal(false);
  };

  const handleSaveClassName = () => {
    editClassName(className);
    setOpenEditClassNameModal(false);
  };

  // Define state variables for the benefits modal
  const [benefits, setBenefits] = useState({
    hpplus: classItem.benefits.hpplus || 0,
    mpplus: classItem.benefits.mpplus || 0,
    ipplus: classItem.benefits.ipplus || 0,
    rituals: {
      ritualism: classItem.benefits.rituals?.ritualism || false,
      arcanism: classItem.benefits.rituals?.arcanism || false,
      elementalism: classItem.benefits.rituals?.elementalism || false,
    },
    martials: classItem.benefits.martials || {},
    custom: classItem.benefits.custom || [],
    spellClasses: classItem.benefits.spellClasses || [],
  });

  // Update the state when changes are made in the modal
  const handleBenefitChange = (field, value) => {
    setBenefits((prevBenefits) => ({
      ...prevBenefits,
      [field]: value,
    }));
  };

  const handleRitualChange = (field, value) => {
    setBenefits((prevBenefits) => ({
      ...prevBenefits,
      rituals: {
        ...prevBenefits.rituals,
        [field]: value,
      },
    }));
  };

  const handleMartialChange = (field, value) => {
    setBenefits((prevBenefits) => ({
      ...prevBenefits,
      martials: {
        ...prevBenefits.martials,
        [field]: value,
      },
    }));
  };

  const handleCustomBenefitChange = (index, value) => {
    setBenefits((prevBenefits) => ({
      ...prevBenefits,
      custom: prevBenefits.custom.map((benefit, i) => {
        if (i === index) {
          return value;
        }
        return benefit;
      }),
    }));
  };

  const handleSaveBenefits = () => {
    onSaveBenefits(benefits);
    setOpenEditBenefitsModal(false);
  };

  const handleAddCustomBenefit = () => {
    setBenefits((prevBenefits) => ({
      ...prevBenefits,
      custom: [...prevBenefits.custom, [""]],
    }));
  };

  const handleRemoveCustomBenefit = (index) => {
    setBenefits((prevBenefits) => ({
      ...prevBenefits,
      custom: prevBenefits.custom.filter((_, i) => i !== index),
    }));
  };

  const handleResetBenefits = () => {
    setBenefits({
      hpplus: classItem.benefits.hpplus || 0,
      mpplus: classItem.benefits.mpplus || 0,
      ipplus: classItem.benefits.ipplus || 0,
      rituals: {
        ritualism: classItem.benefits.rituals?.ritualism || false,
        arcanism: classItem.benefits.rituals?.arcanism || false,
        elementalism: classItem.benefits.rituals?.elementalism || false,
      },
      martials: classItem.benefits.martials || {},
      custom: classItem.benefits.custom || [],
      spellClasses: classItem.benefits.spellClasses || [],
    });
  };

  const handleSpellClassChange = (spellClassName, isSelected) => {
    setBenefits((prevBenefits) => {
      const updatedSpellClasses = isSelected
        ? [...prevBenefits.spellClasses, spellClassName]
        : prevBenefits.spellClasses.filter((name) => name !== spellClassName);

      return {
        ...prevBenefits,
        spellClasses: updatedSpellClasses,
      };
    });
  };

  const handleSaveSpellClasses = () => {
    onSaveBenefits(benefits);
    setOpenEditSpellClassesModal(false);
  };

  const handleAddSkill = () => {
    if (editSkillIndex !== null) {
      // Edit existing skill
      onEditSkill(
        classItem.name,
        editSkillIndex,
        skillName,
        maxLevel,
        description,
        specialSkill
      );
    } else {
      // Add new skill
      onAddSkill(
        classItem.name,
        skillName,
        maxLevel,
        description,
        specialSkill
      );
    }

    // Reset the state and close the modal
    setOpenAddSkillModal(false);
    setSkillName("");
    setMaxLevel(1);
    setDescription("");
    setEditSkillIndex(null);
    setSpecialSkill("");
  };

  const handleEditSkill = (index) => {
    const skill = classItem.skills[index];
    setSkillName(skill.skillName);
    setMaxLevel(skill.maxLvl);
    setDescription(skill.description);
    setEditSkillIndex(index);
    setSpecialSkill(skill.specialSkill);
    setOpenAddSkillModal(true);
  };

  const handleDeleteSkill = () => {
    onDeleteSkill(editSkillIndex);
    setOpenAddSkillModal(false);
    setEditSkillIndex(null);
    setSkillName("");
    setMaxLevel(1);
    setDescription("");
    setSpecialSkill("");
  };

  const handleEditHeroicSkill = () => {
    setOpenEditHeroicSkillModal(true);
    setHeroic(heroic);
  };

  const handleSaveHeroicSkill = () => {
    editHeroic(heroic);
    setOpenEditHeroicSkillModal(false);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: "15px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <CustomHeaderClasses
            type="top"
            headerText={t(classItem.name)}
            rightHeaderText={t("Class Level")}
            editableNumber={classItem.lvl}
            readOnlyNumber={10}
            onLevelChange={onLevelChange}
            isEditMode={isEditMode}
            editClassName={() => handleOpenEditClassNameModal()}
          />
        </Grid>
        {warnings.map((warning, index) => (
          <Grid item xs={12} key={index}>
            <Alert variant="filled" severity="warning">
              {warning}
            </Alert>
          </Grid>
        ))}
        {classItem.benefits && (
          <>
            <Grid item xs={12}>
              <CustomHeader2
                headerText={`${t(classItem.name)} ${t("Free Benefits")}`}
                buttonText={t("Edit Benefits")}
                onButtonClick={() => setOpenEditBenefitsModal(true)}
                isEditMode={isEditMode}
              />
            </Grid>
            <Grid item xs={12} style={{ margin: "-20px 0 0 0" }}>
              <ul>
                {classItem.benefits.hpplus !== 0 && (
                  <li>
                    <Typography>
                      {t("Permanently increase your maximum Hit Points by")}{" "}
                      {classItem.benefits.hpplus}.
                    </Typography>
                  </li>
                )}
                {classItem.benefits.mpplus !== 0 && (
                  <li>
                    <Typography>
                      {t("Permanently increase your maximum Mind Points by")}{" "}
                      {classItem.benefits.mpplus}.
                    </Typography>
                  </li>
                )}
                {classItem.benefits.ipplus !== 0 && (
                  <li>
                    <Typography>
                      {t(
                        "Permanently increase your maximum Inventory Points by"
                      )}{" "}
                      {classItem.benefits.ipplus}.
                    </Typography>
                  </li>
                )}
                {classItem.benefits.rituals && (
                  <>
                    {classItem.benefits.rituals.ritualism && (
                      <li>
                        <Typography>
                          {t(
                            "You may perform Rituals whose effects fall within the Ritualism discipline."
                          )}
                        </Typography>
                      </li>
                    )}
                  </>
                )}
                {classItem.benefits.martials && (
                  <>
                    {classItem.benefits.martials.melee && (
                      <li>
                        <Typography>
                          {t(
                            "Gain the ability to equip martial melee weapons."
                          )}
                        </Typography>
                      </li>
                    )}
                    {classItem.benefits.martials.ranged && (
                      <li>
                        <Typography>
                          {t(
                            "Gain the ability to equip martial ranged weapons."
                          )}
                        </Typography>
                      </li>
                    )}
                    {classItem.benefits.martials.shields && (
                      <li>
                        <Typography>
                          {t("Gain the ability to equip martial shields.")}
                        </Typography>
                      </li>
                    )}
                    {classItem.benefits.martials.armor && (
                      <li>
                        <Typography>
                          {t("Gain the ability to equip martial armor.")}
                        </Typography>
                      </li>
                    )}
                    {classItem.benefits.custom &&
                      classItem.benefits.custom.map((custombenefit, index) => (
                        <li key={index}>
                          <Typography>{custombenefit}</Typography>
                        </li>
                      ))}
                  </>
                )}
              </ul>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          {classItem.skills.length < 5 ? (
            <CustomHeader2
              headerText={t("Skills")}
              buttonText={t("Add Skill")}
              onButtonClick={() => setOpenAddSkillModal(true)}
              isEditMode={isEditMode}
            />
          ) : (
            <CustomHeader2 headerText={t("Skills")} />
          )}
        </Grid>
        {classItem.skills &&
          classItem.skills.map((skill, index) => (
            <Grid item xs={12} key={index}>
              <CustomHeader3
                headerText={skill.skillName}
                currentLvl={skill.currentLvl}
                maxLvl={skill.maxLvl}
                onIncrease={() => onIncreaseSkillLevel(index)}
                onDecrease={() => onDecreaseSkillLevel(index)}
                onEdit={() => handleEditSkill(index)}
                isEditMode={isEditMode}
                isHeroicSkill={false}
              />
              <Typography
                variant="body1"
                justifyContent="flex-start"
                sx={{
                  background: "transparent",
                  padding: "0 17px",
                }}
              >
                <StyledMarkdown
                  allowedElements={["strong", "em"]}
                  unwrapDisallowed={true}
                >
                  {skill.description}
                </StyledMarkdown>
              </Typography>
            </Grid>
          ))}
        {classItem.lvl === 10 && (
          <>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <CustomHeader2
                headerText={t("Heroic Skill")}
                //buttonText={t("Edit Benefits")}
                //onButtonClick={() => setOpenEditBenefitsModal(true)}
                isEditMode={false}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomHeader3
                headerText={classItem.heroic.name}
                currentLvl={0}
                maxLvl={0}
                onIncrease={() => {}}
                onDecrease={() => {}}
                onEdit={() => handleEditHeroicSkill()}
                isEditMode={isEditMode}
                isHeroicSkill={true}
              />
              <Typography
                variant="body1"
                justifyContent="flex-start"
                sx={{
                  background: "transparent",
                  padding: "0 17px",
                }}
              >
                <StyledMarkdown
                  allowedElements={["strong", "em"]}
                  unwrapDisallowed={true}
                >
                  {classItem.heroic.description}
                </StyledMarkdown>
              </Typography>
            </Grid>
          </>
        )}
        {isEditMode && (
          <Grid item xs={12}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Button
                variant="contained"
                color="secondary"
                sx={{ marginTop: "30px", fontSize: "0.9em" }}
                onClick={() => setOpenEditSpellClassesModal(true)}
              >
                {t("Edit Class Spell Types")}
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  const confirmed = window.confirm(
                    t("Are you sure you want to remove the class?")
                  );
                  if (confirmed) {
                    onRemove();
                  }
                }}
                sx={{ marginTop: "30px", fontSize: "0.9em" }}
              >
                {t("Remove Class")}
              </Button>
            </Box>
          </Grid>
        )}
        <Grid item xs={12}>
          <Export name={classItem.name} data={classItem} />
        </Grid>
      </Grid>
      {/* Edit Class Name Modal */}
      <EditClassNameModal
        open={openEditClassNameModal}
        onClose={handleCloseEditClassNameModal}
        onSave={handleSaveClassName}
        className={className}
        setClassName={setClassName}
      />
      {/* Add Skill Modal */}
      <AddSkillModal
        open={openAddSkillModal}
        onClose={() => {
          setOpenAddSkillModal(false);
          setSkillName("");
          setMaxLevel(1);
          setDescription("");
          setEditSkillIndex(null);
          setSpecialSkill("");
        }}
        className={className}
        editSkillIndex={editSkillIndex}
        skillName={skillName}
        setSkillName={setSkillName}
        maxLevel={maxLevel}
        setMaxLevel={setMaxLevel}
        description={description}
        setDescription={setDescription}
        specialSkill={specialSkill}
        setSpecialSkill={setSpecialSkill}
        onAddSkill={handleAddSkill}
        onDeleteSkill={handleDeleteSkill}
      />
      {/* Edit Free Benefits Modal */}
      <EditFreeBenefitsModal
        open={openEditBenefitsModal}
        onClose={() => {
          handleResetBenefits();
          setOpenEditBenefitsModal(false);
        }}
        benefits={benefits}
        onBenefitChange={handleBenefitChange}
        onRitualChange={handleRitualChange}
        onMartialChange={handleMartialChange}
        onCustomBenefitChange={handleCustomBenefitChange}
        onSaveBenefits={handleSaveBenefits}
        onAddCustomBenefit={handleAddCustomBenefit}
        onRemoveCustomBenefit={handleRemoveCustomBenefit}
        t={t}
      />
      {/* Edit Class Spell Types Modal */}
      <EditSpellClassesModal
        open={openEditSpellClassesModal}
        onClose={() => {
          setOpenEditSpellClassesModal(false);
        }}
        onSave={handleSaveSpellClasses}
        onSpellClassChange={handleSpellClassChange}
        spellClassesList={spellClasses}
        selectedSpellClasses={benefits.spellClasses}
      />
      {/* Edit Heroic Skill Modal */}
      <EditHeroicSkillModal
        open={openEditHeroicSkillModal}
        onClose={() => setOpenEditHeroicSkillModal(false)}
        onSave={handleSaveHeroicSkill}
        heroic={heroic}
        setHeroic={setHeroic}
      />
    </Paper>
  );
}
