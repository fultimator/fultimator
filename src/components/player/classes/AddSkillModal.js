import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";

export default function AddSkillModal({ open, onClose, onAddSkill }) {
  const { t } = useTranslate();
  const [skillName, setSkillName] = useState("");
  const [maxLevel, setMaxLevel] = useState(1);
  const [description, setDescription] = useState("");

  const handleAddSkill = () => {
    onAddSkill(skillName, maxLevel, description);
    onClose();
  };

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
        {t("Add Skill")}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ marginTop: "10px" }}>
          <Grid item xs={12} sm={10}>
            <TextField
              label={t("Skill Name")}
              fullWidth
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
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
        <Button variant="contained" color="secondary" onClick={handleAddSkill}>
          {t("Add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
