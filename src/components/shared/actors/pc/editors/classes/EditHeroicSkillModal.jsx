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
import { useTranslate } from "/src/translation/translate";
import { Close } from "@mui/icons-material";
import FuidField from "/src/components/common/FuidField";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  heroicFieldConfig,
  heroicGroupLabels,
  heroicTabs,
} from "/src/forms/rendering/config/itemConfigs/heroic";

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
        </Grid>
        <TabbedSchemaFormRenderer
          tabs={heroicTabs}
          config={heroicFieldConfig}
          groupLabels={heroicGroupLabels}
          state={heroic}
          onChange={setHeroic}
          surface="edit"
          cols={2}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => onSave(heroic)}
        >
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
