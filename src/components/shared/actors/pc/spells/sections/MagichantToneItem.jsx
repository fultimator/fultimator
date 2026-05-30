import {
  Grid,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Delete, ContentCopy } from "@mui/icons-material";
import CustomTextarea from "/src/components/common/CustomTextarea";
import { availableMagichantTones } from "/src/libs/player/spellOptionData";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";

export default function MagichantToneItem({
  item,
  itemIndex,
  onItemChange,
  onDeleteItem,
  onCloneItem,
  t,
}) {
  const handleNameChange = (value) => {
    const tone = availableMagichantTones.find((entry) => entry.name === value);
    if (!tone) return;
    onItemChange(itemIndex, "key", value);
    onItemChange(itemIndex, "effect", tone.effect || "");
    if (value !== "magichant_custom_name") {
      onItemChange(itemIndex, "customName", "");
    }
  };

  const isCustom =
    item.key === "magichant_custom_name" ||
    !availableMagichantTones.find((entry) => entry.name === item.key);
  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpen,
    handleDelete,
  } = useDeleteConfirmation({
    onConfirm: () => {},
  });

  const handleCloneToCustom = () => {
    if (!onCloneItem) return;
    onCloneItem(itemIndex, {
      ...item,
      key: "magichant_custom_name",
      customName: item.customName || (item.key ? t(item.key) : ""),
      effect: typeof item.effect === "string" ? t(item.effect) : item.effect,
    });
  };

  const itemDisplayName =
    item.customName || t(item.key || "magichant_custom_name");

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
            <Grid
              size={{
                xs: 12,
                sm: 5,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>{t("magichant_tone")}</InputLabel>
                <Select
                  value={item.key || "magichant_custom_name"}
                  onChange={(e) => handleNameChange(e.target.value)}
                  label={t("magichant_tone")}
                >
                  {availableMagichantTones.map((option) => (
                    <MenuItem key={option.name} value={option.name}>
                      {t(option.name)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 7,
              }}
            >
              <TextField
                fullWidth
                label={t("magichant_name")}
                value={isCustom ? item.customName || "" : t(item.key || "")}
                onChange={(e) =>
                  isCustom &&
                  onItemChange(itemIndex, "customName", e.target.value)
                }
                slotProps={{
                  input: { readOnly: !isCustom },
                }}
              />
            </Grid>

            <Grid size={12}>
              <CustomTextarea
                label={t("magichant_tone_effect")}
                value={isCustom ? item.effect || "" : t(item.effect || "")}
                onChange={(e) =>
                  isCustom && onItemChange(itemIndex, "effect", e.target.value)
                }
                readOnly={!isCustom}
                rows={3}
              />
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  fullWidth
                  onClick={handleDelete}
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                >
                  {t("Delete")}
                </Button>
                <Button
                  fullWidth
                  onClick={handleCloneToCustom}
                  variant="outlined"
                  startIcon={<ContentCopy />}
                >
                  {t("Clone to Custom")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={setDeleteDialogOpen}
        onConfirm={() => onDeleteItem(itemIndex)}
        title={t("Delete")}
        message={t("Are you sure you want to delete this item?")}
        itemPreview={<Box sx={{ fontWeight: "bold" }}>{itemDisplayName}</Box>}
      />
    </>
  );
}
