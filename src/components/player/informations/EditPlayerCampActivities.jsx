import React, { useCallback, useState } from "react";
import {
  Grid,
  TextField,
  useTheme,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Typography,
  Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import CustomHeader from "../../common/CustomHeader";
import CompendiumViewerModal from "../../compendium/CompendiumViewerModal";
import { useDeleteConfirmation } from "../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../common/DeleteConfirmationDialog";

const CAMP_ACTIVITY_SUBTYPES = ["camp-activities"];

function emptyCampActivity() {
  return { name: "", targetDescription: "", effect: "" };
}

export default function EditPlayerCampActivities({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const [replaceCompendiumOpen, setReplaceCompendiumOpen] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState(null);
  const { isOpen: deleteDialogOpen, closeDialog: setDeleteDialogOpen, handleDelete } = useDeleteConfirmation({
    onConfirm: () => {
          if (deleteIndex !== null) handleRemove(deleteIndex);
        },
  });;
  const [deleteIndex, setDeleteIndex] = useState(null);

  const activities = player.campActivities ?? [];
  const targetOptions = [
    t("Yourself"),
    t("One ally"),
    t("Yourself or one ally"),
  ];

  const onChangeActivity = useCallback(
    (index, key) => (value) => {
      setPlayer((prev) => {
        const updated = [...(prev.campActivities ?? [])];
        updated[index] = { ...updated[index], [key]: value };
        return { ...prev, campActivities: updated };
      });
    },
    [setPlayer]
  );

  const handleAdd = useCallback(() => {
    setPlayer((prev) => ({
      ...prev,
      campActivities: [...(prev.campActivities ?? []), emptyCampActivity()],
    }));
  }, [setPlayer]);

  const handleRemove = useCallback(
    (index) => {
      setPlayer((prev) => {
        const updated = [...(prev.campActivities ?? [])];
        updated.splice(index, 1);
        return { ...prev, campActivities: updated };
      });
    },
    [setPlayer]
  );

  const handleReplaceFromCompendium = useCallback(
    (item) => {
      if (replaceIndex === null) return;
      setPlayer((prev) => ({
        ...prev,
        campActivities: (prev.campActivities ?? []).map((activity, idx) =>
          idx === replaceIndex
            ? {
                ...activity,
                name: item.name ?? "",
                targetDescription: item.targetDescription ?? "",
                effect: item.effect ?? "",
              }
            : activity
        ),
      }));
      setReplaceCompendiumOpen(false);
      setReplaceIndex(null);
    },
    [replaceIndex, setPlayer]
  );

  return (
    <Paper
      elevation={3}
      sx={{
        p: "15px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid container>
        <Grid  size={12}>
          <CustomHeader
            type="top"
            headerText={t("Camp Activities (Max 2)")}
            showIconButton={isEditMode}
            addItem={handleAdd}
            icon={AddIcon}
            customTooltip={t("Add Camp Activity")}
          />
        </Grid>

        {activities.length === 0 && (
          <Grid  sx={{ py: 2 }} size={12}>
            <Typography sx={{ textAlign: "center" }}>
              {t("No camp activities yet.")}
            </Typography>
          </Grid>
        )}

        {activities.map((activity, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <Grid  size={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
            )}
            <Grid container spacing={1} sx={{ py: 1, alignItems: "flex-start" }}>
              <Grid
                size={{
                  xs: 9,
                  sm: 10
                }}>
                <TextField
                  label={t("Name") + ":"}
                  value={activity.name ?? ""}
                  onChange={(e) => onChangeActivity(index, "name")(e.target.value)}
                  fullWidth
                  size="small"
                  slotProps={{
                    input: { readOnly: !isEditMode },
                    htmlInput: { maxLength: 100 }
                  }} />
              </Grid>
              {isEditMode && (
                <Grid
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}
                  size={{
                    xs: 3,
                    sm: 2
                  }}>
                  <Tooltip title={t("Replace from Compendium")}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setReplaceIndex(index);
                        setReplaceCompendiumOpen(true);
                      }}
                    >
                      <SearchIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("Remove")}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setDeleteIndex(index);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
              )}

              <Grid  size={12}>
                {isEditMode ? (
                  <Autocomplete
                    freeSolo
                    options={targetOptions}
                    value={activity.targetDescription ?? ""}
                    onInputChange={(_, value) => onChangeActivity(index, "targetDescription")(value)}
                    onChange={(_, value) => onChangeActivity(index, "targetDescription")(typeof value === "string" ? value : "")}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("Target") + ":"}
                        size="small"
                      />
                    )}
                    size="small"
                  />
                ) : (
                  <TextField
                    label={t("Target") + ":"}
                    value={activity.targetDescription ?? ""}
                    fullWidth
                    size="small"
                    slotProps={{
                      input: { readOnly: true }
                    }}
                  />
                )}
              </Grid>

              <Grid  size={12}>
                <CustomTextarea
                  label={t("Effect") + ":"}
                  value={activity.effect ?? ""}
                  onChange={(e) => onChangeActivity(index, "effect")(e.target.value)}
                  maxLength={5000}
                  maxRows={8}
                  readOnly={!isEditMode}
                />
              </Grid>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
      {isEditMode && replaceIndex !== null && (
        <CompendiumViewerModal
          open={replaceCompendiumOpen}
          onClose={() => {
            setReplaceCompendiumOpen(false);
            setReplaceIndex(null);
          }}
          onAddItem={handleReplaceFromCompendium}
          initialType="optionals"
          restrictToTypes={["optionals"]}
          initialOptionalSubtypes={CAMP_ACTIVITY_SUBTYPES}
        />
      )}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteIndex(null);
        }}
        onConfirm={() => {
          if (deleteIndex !== null) handleRemove(deleteIndex);
        }}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to delete this camp activity?")}
        itemPreview={
          deleteIndex !== null && (
            <Typography variant="h4">
              {activities[deleteIndex]?.name || t("Camp Activity")}
            </Typography>
          )
        }
      />
    </Paper>
  );
}
