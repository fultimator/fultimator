import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ListSubheader,
  Typography,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import { Close, Info } from "@mui/icons-material";
import skills from "../../../libs/skills";

export default function AddSkillModal({
  open,
  onClose,
  editSkillIndex,
  skillName,
  setSkillName,
  maxLevel,
  setMaxLevel,
  description,
  setDescription,
  specialSkill,
  setSpecialSkill,
  onAddSkill,
  onDeleteSkill,
}) {
  const { t } = useTranslate();

  // Group skills by class
  const groupedSkills = skills.reduce((acc, skill) => {
    const { class: skillClass, name, maxLvl } = skill; // Include maxLvl
    if (!acc[skillClass]) {
      acc[skillClass] = [];
    }
    acc[skillClass].push({ name, maxLvl }); // Store name and maxLvl
    return acc;
  }, {});

  useEffect(() => {
    if (specialSkill) {
      const skill = skills.find((s) => s.name === specialSkill);
      if (skill) {
        setMaxLevel(skill.maxLvl);
      }
    }
  }, [specialSkill, setMaxLevel]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item sm={10} xs={12}>
            <TextField
              label={t("Skill Name")}
              fullWidth
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          <Grid item sm={2} xs={12}>
            <TextField
              label={t("Max Level")}
              type="number"
              InputProps={{
                inputProps: { min: 1, max: 10 },
                readOnly: !!specialSkill,
              }}
              fullWidth
              value={maxLevel.toString()} // Ensure the value is a string
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty input for user convenience
                if (
                  value === "" ||
                  (/^\d+$/.test(value) && +value >= 1 && +value <= 10)
                ) {
                  setMaxLevel(value === "" ? 0 : parseInt(value, 10)); // Assuming 0 as the default value for empty input
                }
              }}
              onBlur={(e) => {
                let value = parseInt(e.target.value, 10);
                if (isNaN(value) || value < 1) {
                  value = 1;
                } else if (value > 10) {
                  value = 10;
                }
                setMaxLevel(value);
              }}
              disabled={!!specialSkill} // Disable if a specialSkill is selected
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextarea
              label={t("Description")}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1500}
              maxRows={10}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography>
              {t("Special Skill Effect")}
              <IconButton
                onClick={() =>
                  alert(
                    t(
                      "Skills from this list will automatically update the Character with the selected effect. Please select one if needed."
                    )
                  )
                }
              >
                <Info />
              </IconButton>
            </Typography>
            <FormControl fullWidth>
              <InputLabel>{t("Select Skill")}</InputLabel>
              <Select
                value={specialSkill}
                onChange={(e) => setSpecialSkill(e.target.value)}
                label={t("Select Skill")}
              >
                <MenuItem value="">
                  <em>{t("None")}</em>
                </MenuItem>
                {Object.keys(groupedSkills)
                  .sort((a, b) => t(a).localeCompare(t(b)))
                  .map((skillClass) => [
                    <ListSubheader key={skillClass}>
                      {t(skillClass)}
                    </ListSubheader>,
                    groupedSkills[skillClass].map((skill) => (
                      <MenuItem key={skill.name} value={skill.name}>
                        {t(skill.name)}
                      </MenuItem>
                    )),
                  ])}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        {editSkillIndex !== null && (
          <Button variant="contained" color="error" onClick={onDeleteSkill}>
            {t("Delete")}
          </Button>
        )}
        <Button variant="contained" color="secondary" onClick={onAddSkill}>
          {editSkillIndex !== null ? t("Save Changes") : t("Add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
