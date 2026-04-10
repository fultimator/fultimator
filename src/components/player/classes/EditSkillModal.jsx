import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import { Close } from "@mui/icons-material";

export default function EditSkillModal({
  open,
  onClose,
  onSave,
  skill,
  setSkill,
}) {
  const { t } = useTranslate();

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
        <TextField
          label={t("Skill Name")}
          value={skill.skillName}
          onChange={(e) => setSkill({ ...skill, skillName: e.target.value })}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 100 }}
        />
        <CustomTextarea
          label={t("Description")}
          fullWidth
          value={skill.description}
          onChange={(e) =>
            setSkill({ ...skill, description: e.target.value })
          }
          maxLength={1500}
          maxRows={10}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="secondary" onClick={handleSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
