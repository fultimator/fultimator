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
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import { useTranslate } from "../../../translation/translate";
import CustomHeaderClasses from "../../common/CustomHeaderClasses";
import CustomHeader from "../../common/CustomHeader";
import CustomTextarea from "../../common/CustomTextarea";
import CustomHeader2 from "../../common/CustomHeader2";
import CustomHeader3 from "../../common/CustomHeader3";

export default function PlayerClassCard({
  classItem,
  onRemove,
  onLevelChange,
  onAddSkill,
  onEditSkill,
  onDeleteSkill,
  onIncreaseSkillLevel,
  onDecreaseSkillLevel,
  isEditMode,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const StyledMarkdown = styled(ReactMarkdown)({
    whiteSpace: "pre-line",
  });

  const [openAddSkillModal, setOpenAddSkillModal] = useState(false);
  const [editSkillIndex, setEditSkillIndex] = useState(null);
  const [skillName, setSkillName] = useState("");
  const [maxLevel, setMaxLevel] = useState(1);
  const [description, setDescription] = useState("");

  const handleAddSkill = () => {
    if (editSkillIndex !== null) {
      // Edit existing skill
      onEditSkill(
        classItem.name,
        editSkillIndex,
        skillName,
        maxLevel,
        description  // Pass the adjusted current level here
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
            headerText={classItem.name}
            rightHeaderText={t("Class Level")}
            editableNumber={classItem.lvl}
            readOnlyNumber={10}
            onLevelChange={onLevelChange}
            isEditMode={isEditMode}
          />
        </Grid>
        {classItem.benefits && (
          <>
            <Grid item xs={12}>
              <CustomHeader2 headerText={t("Free Benefits")} />
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
          <CustomHeader2
            headerText={t("Skills")}
            buttonText={t("Add Skill")}
            onButtonClick={() => setOpenAddSkillModal(true)}
          />
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
              onClick={onRemove}
              sx={{ marginTop: "30px" }}
            >
              {t("Remove Class")}
            </Button>
          </Grid>
        ) : null}
      </Grid>

      {/* Add Skill Modal */}
      <Dialog
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
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <TextField
                label={t("Skill Name")}
                fullWidth
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
              />
            </Grid>
            <Grid item xs={2}>
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
      </Dialog>
    </Paper>
  );
}
