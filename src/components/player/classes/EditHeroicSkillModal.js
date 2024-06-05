import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";

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
      <DialogContent>
        <TextField
          label={t("Heroic Name")}
          value={heroic.name}
          onChange={(e) => setHeroic({ ...heroic, name: e.target.value })}
          fullWidth
          margin="normal"
          sx={{ marginTop: "10px" }}
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
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSave}
        >
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
