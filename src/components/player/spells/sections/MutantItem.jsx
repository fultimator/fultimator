import { useState } from "react";
import {
  Grid,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Delete, ContentCopy, ExpandMore } from "@mui/icons-material";
import CustomTextarea from "../../../common/CustomTextarea";
import { availableTherioforms } from "../spellOptionData";
import { useDeleteConfirmation } from "../../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../../common/DeleteConfirmationDialog";

export default function MutantItem({
  item,
  itemIndex,
  onItemChange,
  onDeleteItem,
  onCloneItem,
  t,
}) {
  const handleNameChange = (value) => {
    const therioform = availableTherioforms.find((t) => t.name === value);
    if (therioform) {
      onItemChange(itemIndex, "name", value);
      if (value !== "mutant_therioform_custom_name") {
        onItemChange(itemIndex, "genoclepsis", therioform.genoclepsis);
        onItemChange(itemIndex, "description", therioform.description);
        onItemChange(itemIndex, "customName", "");
      }
    }
  };

  const isCustom =
    item.name === "mutant_therioform_custom_name" ||
    !availableTherioforms.find((t) => t.name === item.name);
  const [expanded, setExpanded] = useState(false);
  const { isOpen: deleteDialogOpen, closeDialog: setDeleteDialogOpen, handleDelete } = useDeleteConfirmation({
    onConfirm: () => {},
  });;

  const handleCloneToCustom = () => {
    if (!onCloneItem) return;

    const clone = {
      ...item,
      name: "mutant_therioform_custom_name",
      customName: item.customName || (item.name ? t(item.name) : ""),
      genoclepsis:
        typeof item.genoclepsis === "string" ? t(item.genoclepsis) : item.genoclepsis,
      description:
        typeof item.description === "string" ? t(item.description) : item.description,
    };

    onCloneItem(itemIndex, clone);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleCloneClick = (e) => {
    e.stopPropagation();
    handleCloneToCustom();
  };

  const itemDisplayName = item.customName || t(item.name || "mutant_therioform_custom_name");

  return (
    <>
    <Accordion expanded={expanded} onChange={() => setExpanded((prev) => !prev)} sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ flex: 1, fontWeight: "bold" }}>
            {itemDisplayName}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDeleteClick}
          >
            {t("Delete")}
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ContentCopy />}
            onClick={handleCloneClick}
          >
            {t("Clone to Custom")}
          </Button>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <FormControl fullWidth>
              <InputLabel>{t("Therioform")}</InputLabel>
              <Select
                value={item.name || ""}
                onChange={(e) => handleNameChange(e.target.value)}
                label={t("Therioform")}
              >
                {availableTherioforms
                  .filter((therioform) => therioform.name !== "mutant_therioform_custom_name")
                  .map((therioform) => (
                  <MenuItem key={therioform.name} value={therioform.name}>
                    {t(therioform.name)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {isCustom && (
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField
                fullWidth
                label={t("Custom Name")}
                value={item.customName || ""}
                onChange={(e) =>
                  onItemChange(itemIndex, "customName", e.target.value)
                }
              />
            </Grid>
          )}

          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <CustomTextarea
              label={t("Genoclepsis")}
              value={
                item.genoclepsis?.startsWith("mutant_")
                  ? t(item.genoclepsis)
                  : item.genoclepsis || ""
              }
              readOnly={!isCustom}
              rows={2}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <CustomTextarea
              label={t("Description")}
              value={
                item.description?.startsWith("mutant_")
                  ? t(item.description)
                  : item.description || ""
              }
              readOnly={!isCustom}
              rows={2}
            />
          </Grid>

        </Grid>
      </AccordionDetails>
    </Accordion>
    <DeleteConfirmationDialog
      open={deleteDialogOpen}
        onClose={setDeleteDialogOpen}
      onConfirm={() => onDeleteItem(itemIndex)}
      title={t("Delete")}
      message={t("Are you sure you want to delete this item?")}
      itemPreview={<Typography variant="h4">{itemDisplayName}</Typography>}
    />
    </>
  );
}
