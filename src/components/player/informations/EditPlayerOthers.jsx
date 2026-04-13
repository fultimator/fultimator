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
  Switch,
  FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import CustomHeader from "../../common/CustomHeader";
import CompendiumViewerModal from "../../compendium/CompendiumViewerModal";
import DeleteConfirmationDialog from "../../common/DeleteConfirmationDialog";

const OTHER_SUBTYPES = ["other"];

function emptyOther() {
  return { name: "", description: "", effect: "" };
}

export default function EditPlayerOther({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const [replaceCompendiumOpen, setReplaceCompendiumOpen] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const others = player.others ?? [];

  const onChangeOther = useCallback(
    (index, key) => (value) => {
      setPlayer((prev) => {
        const updated = [...(prev.others ?? [])];
        updated[index] = { ...updated[index], [key]: value };
        return { ...prev, others: updated };
      });
    },
    [setPlayer]
  );

  const handleAdd = useCallback(() => {
    setPlayer((prev) => ({
      ...prev,
      others: [...(prev.others ?? []), emptyOther()],
    }));
  }, [setPlayer]);

  const handleRemove = useCallback(
    (index) => {
      setPlayer((prev) => {
        const updated = [...(prev.others ?? [])];
        updated.splice(index, 1);
        return { ...prev, others: updated };
      });
    },
    [setPlayer]
  );

  const handleReplaceFromCompendium = useCallback(
    (item) => {
      if (replaceIndex === null) return;
      setPlayer((prev) => ({
        ...prev,
        others: (prev.others ?? []).map((other, idx) =>
          idx === replaceIndex
            ? {
                ...other,
                name: item.name ?? "",
                description: item.description ?? "",
                effect: item.effect ?? "",
                ...(item.clock?.sections ? { clock: { sections: item.clock.sections } } : { clock: undefined }),
              }
            : other
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
            headerText={t("Other Optionals")}
            showIconButton={isEditMode}
            addItem={handleAdd}
            icon={AddIcon}
            customTooltip={t("Add Optional")}
          />
        </Grid>

        {others.length === 0 && (
          <Grid  sx={{ py: 2 }} size={12}>
            <Typography sx={{ textAlign: "center" }}>
              {t("No optional entries yet.")}
            </Typography>
          </Grid>
        )}

        {others.map((other, index) => (
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
                  value={other.name ?? ""}
                  onChange={(e) => onChangeOther(index, "name")(e.target.value)}
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
                <CustomTextarea
                  label={t("Description") + ":"}
                  value={other.description ?? ""}
                  onChange={(e) => onChangeOther(index, "description")(e.target.value)}
                  maxLength={5000}
                  maxRows={8}
                  readOnly={!isEditMode}
                />
              </Grid>
              <Grid  size={12}>
                <CustomTextarea
                  label={t("Effect") + ":"}
                  value={other.effect ?? ""}
                  onChange={(e) => onChangeOther(index, "effect")(e.target.value)}
                  maxLength={5000}
                  maxRows={8}
                  readOnly={!isEditMode}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                {isEditMode ? (
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={!!other.clock?.sections}
                        onChange={(e) => {
                          setPlayer((prev) => {
                            const updated = [...(prev.others ?? [])];
                            updated[index] = e.target.checked
                              ? { ...updated[index], clock: { sections: 6 } }
                              : { ...updated[index], clock: undefined };
                            return { ...prev, others: updated };
                          });
                        }}
                      />
                    }
                    label={t("Clock")}
                  />
                ) : (
                  other.clock?.sections && (
                    <Typography variant="body2" sx={{
                      color: "text.secondary"
                    }}>
                      {t("Clock")}: {other.clock.sections}
                    </Typography>
                  )
                )}
              </Grid>
              {other.clock?.sections && (
                <Grid
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                  <TextField
                    label={t("Clock Sections") + ":"}
                    value={other.clock.sections}
                    onChange={(e) => {
                      setPlayer((prev) => {
                        const updated = [...(prev.others ?? [])];
                        updated[index] = { ...updated[index], clock: { sections: Number(e.target.value) || 6 } };
                        return { ...prev, others: updated };
                      });
                    }}
                    type="number"
                    fullWidth
                    size="small"
                    slotProps={{
                      input: { readOnly: !isEditMode },
                      htmlInput: { min: 2, max: 12, readOnly: !isEditMode }
                    }} />
                </Grid>
              )}
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
          initialOptionalSubtypes={OTHER_SUBTYPES}
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
        message={t("Are you sure you want to delete this optional entry?")}
        itemPreview={
          deleteIndex !== null && (
            <Typography variant="h4">
              {others[deleteIndex]?.name || t("Optional")}
            </Typography>
          )
        }
      />
    </Paper>
  );
}
