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
import CustomTextarea from "../../../common/CustomTextarea";
import { availableDances } from "../spellOptionData";

export default function DancerItem({
  item,
  itemIndex,
  onItemChange,
  onDeleteItem,
  onCloneItem,
  t,
}) {
  const handleNameChange = (value) => {
    const dance = availableDances.find((d) => d.name === value);
    if (dance) {
      onItemChange(itemIndex, "name", value);
      if (value !== "dance_custom_name") {
        onItemChange(itemIndex, "effect", dance.effect);
        onItemChange(itemIndex, "duration", dance.duration);
        onItemChange(itemIndex, "customName", "");
      }
    }
  };

  const isCustom =
    item.name === "dance_custom_name" ||
    !availableDances.find((d) => d.name === item.name);

  const handleCloneToCustom = () => {
    if (!onCloneItem) return;

    const clone = {
      ...item,
      name: "dance_custom_name",
      customName: item.customName || (item.name ? t(item.name) : ""),
      duration: typeof item.duration === "string" ? t(item.duration) : item.duration,
      effect: typeof item.effect === "string" ? t(item.effect) : item.effect,
    };

    onCloneItem(itemIndex, clone);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid
            size={{
              xs: 12,
              sm: 4
            }}>
            <FormControl fullWidth>
              <InputLabel>{t("Dance")}</InputLabel>
              <Select
                value={item.name || ""}
                onChange={(e) => handleNameChange(e.target.value)}
                label={t("Dance")}
              >
                {availableDances
                  .filter((dance) => dance.name !== "dance_custom_name")
                  .map((dance) => (
                  <MenuItem key={dance.name} value={dance.name}>
                    {t(dance.name)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4
            }}>
            <TextField
              fullWidth
              label={t("Duration")}
              value={
                item.duration?.startsWith("dance_duration_")
                  ? t(item.duration)
                  : item.duration || ""
              }
              readOnly={!isCustom}
            />
          </Grid>

          {isCustom && (
            <Grid
              size={{
                xs: 12,
                sm: 4
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

          <Grid  size={12}>
            <CustomTextarea
              label={t("Dance Effect")}
              value={
                item.effect?.startsWith("dance_")
                  ? t(item.effect)
                  : item.effect || ""
              }
              onChange={(e) =>
                isCustom && onItemChange(itemIndex, "effect", e.target.value)
              }
              readOnly={!isCustom}
              rows={2}
            />
          </Grid>

          <Grid  size={12}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                fullWidth
                onClick={() => onDeleteItem(itemIndex)}
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
  );
}
