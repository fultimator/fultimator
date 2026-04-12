import React, { useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListSubheader,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import { Close, Info } from "@mui/icons-material";
import skills from "../../../libs/skills";

export default function EditSkillModal({
  open,
  onClose,
  onSave,
  skill,
  setSkill,
}) {
  const { t } = useTranslate();

  const groupedSkills = useMemo(
    () =>
      skills.reduce((acc, item) => {
        const skillClass = item.class;
        if (!acc[skillClass]) {
          acc[skillClass] = [];
        }
        acc[skillClass].push({ name: item.name, maxLvl: item.maxLvl });
        return acc;
      }, {}),
    []
  );

  useEffect(() => {
    if (!skill?.specialSkill) return;
    const selected = skills.find((s) => s.name === skill.specialSkill);
    if (!selected) return;
    if (skill.maxLvl === selected.maxLvl) return;
    setSkill((prev) => ({ ...prev, maxLvl: selected.maxLvl }));
  }, [skill?.specialSkill, skill?.maxLvl, setSkill]);

  const handleSave = () => {
    onSave(skill);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "80%",
          maxWidth: "lg",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        {t("Edit Skill")}
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
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item sm={10} xs={12}>
            <TextField
              label={t("Skill Name")}
              value={skill.skillName}
              onChange={(e) => setSkill({ ...skill, skillName: e.target.value })}
              fullWidth
              inputProps={{ maxLength: 100 }}
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
              value={(skill.maxLvl ?? 1).toString()}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (/^\d+$/.test(value) && +value >= 1 && +value <= 10)) {
                  setSkill({ ...skill, maxLvl: value === "" ? 1 : parseInt(value, 10) });
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextarea
              label={t("Description")}
              fullWidth
              value={skill.description || ""}
              onChange={(e) => setSkill({ ...skill, description: e.target.value })}
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
                value={skill.specialSkill || ""}
                onChange={(e) => setSkill({ ...skill, specialSkill: e.target.value })}
                label={t("Select Skill")}
              >
                <MenuItem value="">
                  <em>{t("None")}</em>
                </MenuItem>
                {Object.keys(groupedSkills)
                  .sort((a, b) => t(a).localeCompare(t(b)))
                  .map((skillClass) => [
                    <ListSubheader key={skillClass}>{t(skillClass)}</ListSubheader>,
                    groupedSkills[skillClass].map((groupedSkill) => (
                      <MenuItem key={groupedSkill.name} value={groupedSkill.name}>
                        {t(groupedSkill.name)}
                      </MenuItem>
                    )),
                  ])}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="secondary" onClick={handleSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
