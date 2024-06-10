import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import { Close } from "@mui/icons-material";

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
          {/* SPECIAL SKILLS FUTURE IMPLEMENTATION
          <Grid item xs={12} sx={{ marginTop: "20px" }}>
            <Typography variant="h4">{t("Skill Special Effects")}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    //checked={true}
                    color="primary"
                  />
                }
                label={t("Plus【SL × 2】 Magic Check Bonus")}
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={true} color="primary" />}
                label={t("Plus【SL × 3】 maximum Hit Points")}
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    //checked={true}
                    color="primary"
                  />
                }
                label={t("Plus【SL × 3】 maximum Mind Points")}
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    //checked={true}
                    color="primary"
                  />
                }
                label={t("Plus【SL】 Defense Bonus")}
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    //checked={true}
                    color="primary"
                  />
                }
                label={t("Plus【SL】 Accuracy Check Bonus with ranged weapons")}
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    //checked={true}
                    color="primary"
                  />
                }
                label={t("Plus【SL】 Accuracy Check Bonus with melee weapons")}
              />
            </FormGroup>
          </Grid>*/}
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
