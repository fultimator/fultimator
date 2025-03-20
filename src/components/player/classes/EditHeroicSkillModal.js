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

export default function EditHeroicSkillModal({
  open,
  onClose,
  onSave,
  heroic,
  setHeroic,
}) {
  const { t } = useTranslate();

  const handleSave = () => {
    onSave(heroic);
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
        {t("Edit Heroic Skill")}
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
          label={t("Heroic Name")}
          value={heroic.name}
          onChange={(e) => setHeroic({ ...heroic, name: e.target.value })}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 50 }}
        />
        <CustomTextarea
          label={t("Description")}
          fullWidth
          value={heroic.description}
          onChange={(e) =>
            setHeroic({ ...heroic, description: e.target.value })
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
