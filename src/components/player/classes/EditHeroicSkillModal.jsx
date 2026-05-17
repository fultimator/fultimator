import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  IconButton,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { Close } from "@mui/icons-material";
import FuidField from "../../common/FuidField";
import { SchemaFieldRenderer } from "../../../forms/rendering/SchemaFieldRenderer";
import { heroicFieldConfig } from "../../../forms/rendering/config/itemConfigs/heroic";

export default function EditHeroicSkillModal({
  open,
  onClose,
  onSave,
  heroic,
  setHeroic,
}) {
  const { t } = useTranslate();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: "80%",
            maxWidth: "lg",
          },
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
        <Grid container spacing={2}>
          <Grid size={12}>
            <FuidField
              value={heroic.fuid}
              name={heroic.name}
              onChange={(fuid) => setHeroic({ ...heroic, fuid })}
            />
          </Grid>
          <SchemaFieldRenderer
            config={heroicFieldConfig}
            state={heroic}
            onChange={setHeroic}
            surface="edit"
            group="core"
            cols={2}
          />
          <SchemaFieldRenderer
            config={heroicFieldConfig}
            state={heroic}
            onChange={setHeroic}
            surface="edit"
            group="body"
            cols={1}
          />
          <SchemaFieldRenderer
            config={heroicFieldConfig}
            state={heroic}
            onChange={setHeroic}
            surface="edit"
            group="meta"
            label="Metadata"
            cols={2}
          />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="secondary" onClick={() => onSave(heroic)}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
