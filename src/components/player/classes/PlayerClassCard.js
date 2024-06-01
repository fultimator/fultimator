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
import { useTranslate } from "../../../translation/translate";
import CustomHeaderClasses from "../../common/CustomHeaderClasses";
import CustomHeader from "../../common/CustomHeader";
import CustomTextarea from "../../common/CustomTextarea";

export default function PlayerClassCard({
  classItem,
  onRemove,
  onLevelChange,
  onAddSkill,
  isEditMode,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [openAddSkillModal, setOpenAddSkillModal] = useState(false);
  const [skillName, setSkillName] = useState("");
  const [maxLevel, setMaxLevel] = useState(1);
  const [description, setDescription] = useState("");

  const handleAddSkill = () => {
    // Call the onAddSkill callback with the new skill details
    onAddSkill(classItem.name, skillName, maxLevel, description);
    // Reset the state and close the modal
    setOpenAddSkillModal(false);
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
              <Typography variant="h2" component="legend">
                {t("Free Benefits")}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {classItem.benefits.hpplus !== 0 && (
                <Typography>
                  {t("Permanently increase your maximum Hit Points by")}{" "}
                  {classItem.benefits.hpplus}.
                </Typography>
              )}
              {classItem.benefits.mpplus !== 0 && (
                <Typography>
                  {t("Permanently increase your maximum Mind Points by")}{" "}
                  {classItem.benefits.mpplus}.
                </Typography>
              )}
              {classItem.benefits.ipplus !== 0 && (
                <Typography>
                  {t("Permanently increase your maximum Inventory Points by")}{" "}
                  {classItem.benefits.ipplus}.
                </Typography>
              )}
              {classItem.benefits.rituals && (
                <>
                  {classItem.benefits.rituals.ritualism && (
                    <Typography>
                      {t(
                        "You may perform Rituals whose effects fall within the Ritualism discipline."
                      )}
                    </Typography>
                  )}
                </>
              )}
              {classItem.benefits.martials && (
                <>
                  {classItem.benefits.martials.melee && (
                    <Typography>
                      {t("Gain the ability to equip martial melee weapons.")}
                    </Typography>
                  )}
                  {classItem.benefits.martials.ranged && (
                    <Typography>
                      {t("Gain the ability to equip martial ranged weapons.")}
                    </Typography>
                  )}
                  {classItem.benefits.martials.shields && (
                    <Typography>
                      {t("Gain the ability to equip martial shields.")}
                    </Typography>
                  )}
                  {classItem.benefits.martials.armor && (
                    <Typography>
                      {t("Gain the ability to equip martial armor.")}
                    </Typography>
                  )}
                </>
              )}
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
          </>
        )}
        <Grid item xs={10}>
          <Typography variant="h2" component="legend">
            {t("Skills")}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setOpenAddSkillModal(true)}
          >
            {t("Add Skill")}
          </Button>
        </Grid>
                {classItem.skills && classItem.skills.map((skill, index) => (
          <Grid item xs={12} key={index}>
            <Typography variant="body1">
              {t("Skill Name")}: {skill.skillName}
            </Typography>
            <Typography variant="body1">
              {t("Max Level")}: {skill.maxLvl}
            </Typography>
            <Typography variant="body1">
              {t("Description")}: {skill.description}
            </Typography>
          </Grid>
        ))}
        {isEditMode ? (
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="secondary"
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
        onClose={() => setOpenAddSkillModal(false)}
        PaperProps={{
          sx: {
            width: "80%", // Adjust width as needed
            maxWidth: "lg", // Adjust maximum width as needed
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
          {t("Add Skill")}
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
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAddSkill}
          >
            {t("Add")}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
