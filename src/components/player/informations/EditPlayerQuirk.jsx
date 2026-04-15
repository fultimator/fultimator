import React, { useCallback, useState } from "react";
import { Grid, TextField, useTheme, Paper, IconButton, Tooltip, Box, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import CustomHeader from "../../common/CustomHeader";
import CompendiumViewerModal from "../../compendium/CompendiumViewerModal";
import { useDeleteConfirmation } from "../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../common/DeleteConfirmationDialog";

const QUIRK_SUBTYPES = ["quirk"];

export default function EditPlayerQuirk({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const [compendiumOpen, setCompendiumOpen] = useState(false);
  const { isOpen: deleteDialogOpen, closeDialog: setDeleteDialogOpen, handleDelete } = useDeleteConfirmation({
    onConfirm: () => {
          setPlayer((prev) => ({
            ...prev,
            quirk: { name: "", description: "", effect: "" },
          }));
        },
  });;

  const onChangeQuirk = useCallback(
    (key) => (value) => {
      setPlayer((prevState) => ({
        ...prevState,
        quirk: {
          ...prevState.quirk,
          [key]: value,
        },
      }));
    },
    [setPlayer]
  );

  const handleAddFromCompendium = useCallback(
    (item) => {
      setPlayer((prev) => ({
        ...prev,
        quirk: {
          name: item.name ?? "",
          description: item.description ?? "",
          effect: item.effect ?? "",
        },
      }));
    },
    [setPlayer]
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
            headerText={t("Quirk")}
            showIconButton={false}
          />
        </Grid>
        <Grid container spacing={1} sx={{ py: 1, alignItems: "center" }}>
          <Grid
            size={{
              xs: 10,
              sm: 11
            }}>
            <TextField
              id="name"
              label={t("Quirk Name") + ":"}
              value={player.quirk?.name || ""}
              onChange={(e) => onChangeQuirk("name")(e.target.value)}
              fullWidth
              slotProps={{
                input: {
                  readOnly: !isEditMode,
                },

                htmlInput: { maxLength: 50 }
              }} />
          </Grid>
          {isEditMode && (
            <Grid
              sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}
              size={{
                xs: 2,
                sm: 1
              }}>
              <Tooltip title={t("Replace from Compendium")}>
                <IconButton size="small" onClick={() => setCompendiumOpen(true)}>
                  <SearchIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("Remove")}>
                <IconButton size="small" color="error" onClick={handleDelete}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
          )}
          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <CustomTextarea
              id="description"
              label={t("Description") + ":"}
              value={player.quirk?.description || ""}
              onChange={(e) => onChangeQuirk("description")(e.target.value)}
              maxLength={5000}
              maxRows={10}
              readOnly={!isEditMode}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <CustomTextarea
              id="effect"
              label={t("Effect") + ":"}
              value={player.quirk?.effect || ""}
              onChange={(e) => onChangeQuirk("effect")(e.target.value)}
              maxLength={5000}
              maxRows={10}
              readOnly={!isEditMode}
            />
          </Grid>
        </Grid>
      </Grid>
      {isEditMode && (
        <CompendiumViewerModal
          open={compendiumOpen}
          onClose={() => setCompendiumOpen(false)}
          onAddItem={handleAddFromCompendium}
          initialType="optionals"
          restrictToTypes={["optionals"]}
          initialOptionalSubtypes={QUIRK_SUBTYPES}
        />
      )}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={setDeleteDialogOpen}
        onConfirm={() => {
          setPlayer((prev) => ({
            ...prev,
            quirk: { name: "", description: "", effect: "" },
          }));
        }}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to delete this quirk?")}
        itemPreview={
          <Box>
            <Typography variant="h4">{player.quirk?.name || t("Quirk")}</Typography>
          </Box>
        }
      />
    </Paper>
  );
}
