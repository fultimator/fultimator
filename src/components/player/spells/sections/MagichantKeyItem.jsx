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
import { availableMagichantKeys } from "../spellOptionData";

export default function MagichantKeyItem({
  item,
  itemIndex,
  onItemChange,
  onDeleteItem,
  onCloneItem,
  t,
}) {
  const handleNameChange = (value) => {
    const key = availableMagichantKeys.find((k) => k.name === value);
    if (!key) return;
    onItemChange(itemIndex, "name", value);
    onItemChange(itemIndex, "type", key.type || "");
    onItemChange(itemIndex, "status", key.status || "");
    onItemChange(itemIndex, "attribute", key.attribute || "");
    onItemChange(itemIndex, "recovery", key.recovery || "");
    if (value !== "magichant_custom_name") {
      onItemChange(itemIndex, "customName", "");
    }
  };

  const isCustom =
    item.name === "magichant_custom_name" ||
    !availableMagichantKeys.find((k) => k.name === item.name);

  const handleCloneToCustom = () => {
    if (!onCloneItem) return;
    onCloneItem(itemIndex, {
      ...item,
      name: "magichant_custom_name",
      customName: item.customName || (item.name ? t(item.name) : ""),
      type: typeof item.type === "string" ? t(item.type) : item.type,
      status: typeof item.status === "string" ? t(item.status) : item.status,
      attribute: typeof item.attribute === "string" ? t(item.attribute) : item.attribute,
      recovery: typeof item.recovery === "string" ? t(item.recovery) : item.recovery,
    });
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
          <Grid
            size={{
              xs: 12,
              sm: 5
            }}>
            <FormControl fullWidth>
              <InputLabel>{t("magichant_key")}</InputLabel>
              <Select
                value={item.name || "magichant_custom_name"}
                onChange={(e) => handleNameChange(e.target.value)}
                label={t("magichant_key")}
              >
                {availableMagichantKeys.map((option) => (
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
              sm: 7
            }}>
            <TextField
              fullWidth
              label={t("magichant_name")}
              value={isCustom ? (item.customName || "") : t(item.name || "")}
              onChange={(e) => isCustom && onItemChange(itemIndex, "customName", e.target.value)}
              slotProps={{
                input: { readOnly: !isCustom }
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <TextField
              fullWidth
              label={t("magichant_type")}
              value={isCustom ? (item.type || "") : t(item.type || "")}
              onChange={(e) => isCustom && onItemChange(itemIndex, "type", e.target.value)}
              slotProps={{
                input: { readOnly: !isCustom }
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <TextField
              fullWidth
              label={t("magichant_status_effect")}
              value={isCustom ? (item.status || "") : t(item.status || "")}
              onChange={(e) => isCustom && onItemChange(itemIndex, "status", e.target.value)}
              slotProps={{
                input: { readOnly: !isCustom }
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <TextField
              fullWidth
              label={t("magichant_attribute")}
              value={isCustom ? (item.attribute || "") : t(item.attribute || "")}
              onChange={(e) => isCustom && onItemChange(itemIndex, "attribute", e.target.value)}
              slotProps={{
                input: { readOnly: !isCustom }
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <TextField
              fullWidth
              label={t("magichant_recovery")}
              value={isCustom ? (item.recovery || "") : t(item.recovery || "")}
              onChange={(e) => isCustom && onItemChange(itemIndex, "recovery", e.target.value)}
              slotProps={{
                input: { readOnly: !isCustom }
              }}
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
