import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";

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
  onAddSkill,
  onDeleteSkill,
}) {
  const { t } = useTranslate();

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
