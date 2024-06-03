import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Paper,
  Grid,
  Typography,
  Button,
  TextField,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import { useTranslate } from "../../../translation/translate";
import CustomHeaderClasses from "../../common/CustomHeaderClasses";
import CustomHeader from "../../common/CustomHeader";
import CustomTextarea from "../../common/CustomTextarea";
import CustomHeader2 from "../../common/CustomHeader2";
import CustomHeader3 from "../../common/CustomHeader3";
import EditClassNameModal from "./EditClassNameModal";
import AddSkillModal from "./AddSkillModal";

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
  const [editSkillIndex, setEditSkillIndex] = useState(null);
  const [skillName, setSkillName] = useState("");
  const [maxLevel, setMaxLevel] = useState(1);
  const [description, setDescription] = useState("");

  const [className, setClassName] = useState(classItem.name);

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
    },
    martials: classItem.benefits.martials || {},
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

  const handleSaveBenefits = () => {
    onSaveBenefits(benefits);
    setOpenEditBenefitsModal(false);
  };

  const handleAddSkill = () => {
    if (editSkillIndex !== null) {
      // Edit existing skill
      onEditSkill(
        classItem.name,
        editSkillIndex,
        skillName,
        maxLevel,
        description // Pass the adjusted current level here
      );
    } else {
      // Add new skill
      onAddSkill(classItem.name, skillName, maxLevel, description);
    }
    // Reset the state and close the modal
    setOpenAddSkillModal(false);
    setSkillName("");
    setMaxLevel(1);
    setDescription("");
    setEditSkillIndex(null);
  };

  const handleEditSkill = (index) => {
    const skill = classItem.skills[index];
    setSkillName(skill.skillName);
    setMaxLevel(skill.maxLvl);
    setDescription(skill.description);
    setEditSkillIndex(index);
    setOpenAddSkillModal(true);
  };

  const handleDeleteSkill = () => {
    onDeleteSkill(editSkillIndex);
    setOpenAddSkillModal(false);
    setEditSkillIndex(null);
    setSkillName("");
    setMaxLevel(1);
    setDescription("");
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
        {classItem.benefits && (
          <>
            <Grid item xs={12}>
              <CustomHeader2
                headerText={t("Free Benefits")}
                buttonText={t("Edit Benefits")}
                onButtonClick={() => setOpenEditBenefitsModal(true)}
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
                onEdit={() => handleEditSkill(index)} // Add this line
              />
              <Typography variant="body1">
                <StyledMarkdown
                  allowedElements={["strong", "em"]}
                  unwrapDisallowed={true}
                >
                  {skill.description}
                </StyledMarkdown>
              </Typography>
            </Grid>
          ))}
        {isEditMode ? (
          <Grid item xs={12}>
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
              sx={{ marginTop: "30px" }}
            >
              {t("Remove Class")}
            </Button>
          </Grid>
        ) : null}
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
        }}
        editSkillIndex={editSkillIndex}
        skillName={skillName}
        setSkillName={setSkillName}
        maxLevel={maxLevel}
        setMaxLevel={setMaxLevel}
        description={description}
        setDescription={setDescription}
        onAddSkill={handleAddSkill}
        onDeleteSkill={handleDeleteSkill}
      />
      {/*<Dialog
        open={openAddSkillModal}
        onClose={() => {
          setOpenAddSkillModal(false);
          setSkillName("");
          setMaxLevel(1);
          setDescription("");
          setEditSkillIndex(null);
        }}
        PaperProps={{
          sx: {
            width: "80%", // Adjust width as needed
            maxWidth: "lg", // Adjust maximum width as needed
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
          {editSkillIndex !== null ? t("Edit Skill") : t("Add Skill")}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ marginTop: "10px" }}>
            <Grid item sm={10} xs={12}>
              <TextField
                label={t("Skill Name")}
                fullWidth
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
              />
            </Grid>
            <Grid item sm={2} xs={12}>
              <TextField
                label={t("Max Level")}
                type="number"
                InputProps={{
                  inputProps: { min: 1, max: 10 },
                }}
                fullWidth
                value={maxLevel}
                onChange={(e) => setMaxLevel(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextarea
                label={t("Description")}
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          {editSkillIndex !== null && (
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteSkill}
            >
              {t("Delete")}
            </Button>
          )}
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAddSkill}
          >
            {editSkillIndex !== null ? t("Save Changes") : t("Add")}
          </Button>
        </DialogActions>
      </Dialog>*/}
      {/* Edit Free Benefits Modal */}
      <Dialog
        open={openEditBenefitsModal}
        onClose={() => {
          setOpenEditBenefitsModal(false);
        }}
        PaperProps={{
          sx: {
            width: "80%", // Adjust width as needed
            maxWidth: "lg", // Adjust maximum width as needed
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
          {t("Edit Benefits")}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ marginTop: "10px" }}>
            <Grid item xs={4}>
              <TextField
                label={t("HP Modifier")}
                type="number"
                fullWidth
                value={benefits.hpplus}
                onChange={(e) =>
                  handleBenefitChange("hpplus", parseInt(e.target.value))
                }
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label={t("MP Modifier")}
                type="number"
                fullWidth
                value={benefits.mpplus}
                onChange={(e) =>
                  handleBenefitChange("mpplus", parseInt(e.target.value))
                }
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label={t("IP Modifier")}
                type="number"
                fullWidth
                value={benefits.ipplus}
                onChange={(e) =>
                  handleBenefitChange("ipplus", parseInt(e.target.value))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={benefits.rituals.ritualism}
                      onChange={(e) =>
                        handleRitualChange("ritualism", e.target.checked)
                      }
                    />
                  }
                  label={
                    <Typography>
                      {t(
                        "You may perform Rituals whose effects fall within the Ritualism discipline."
                      )}
                    </Typography>
                  }
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={benefits.martials.melee}
                      onChange={(e) =>
                        handleMartialChange("melee", e.target.checked)
                      }
                    />
                  }
                  label={
                    <Typography>
                      {t("Gain the ability to equip martial melee weapons.")}
                    </Typography>
                  }
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={benefits.martials.ranged}
                      onChange={(e) =>
                        handleMartialChange("ranged", e.target.checked)
                      }
                    />
                  }
                  label={
                    <Typography>
                      {t("Gain the ability to equip martial ranged weapons.")}
                    </Typography>
                  }
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={benefits.martials.shields}
                      onChange={(e) =>
                        handleMartialChange("shields", e.target.checked)
                      }
                    />
                  }
                  label={
                    <Typography>
                      {t("Gain the ability to equip martial shields.")}
                    </Typography>
                  }
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={benefits.martials.armor}
                      onChange={(e) =>
                        handleMartialChange("armor", e.target.checked)
                      }
                    />
                  }
                  label={
                    <Typography>
                      {t("Gain the ability to equip martial armor.")}
                    </Typography>
                  }
                />
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSaveBenefits}
          >
            {t("Save Changes")}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
