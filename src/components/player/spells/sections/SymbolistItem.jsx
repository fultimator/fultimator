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
import { availableSymbols } from "../spellOptionData";

export default function SymbolistItem({
  item,
  itemIndex,
  onItemChange,
  onDeleteItem,
  onCloneItem,
  t,
}) {
  const handleNameChange = (value) => {
    const symbol = availableSymbols.find((s) => s.name === value);
    if (symbol) {
      onItemChange(itemIndex, "name", value);
      if (value !== "symbol_custom_name") {
        onItemChange(itemIndex, "effect", symbol.effect);
        onItemChange(itemIndex, "customName", "");
      }
    }
  };

  const isCustom = item.name === "symbol_custom_name";

  const handleCloneToCustom = () => {
    if (!onCloneItem) return;

    const clone = {
      ...item,
      name: "symbol_custom_name",
      customName: item.customName || (item.name ? t(item.name) : ""),
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
              sm: 6
            }}>
            <FormControl fullWidth>
              <InputLabel>{t("Symbol")}</InputLabel>
              <Select
                value={item.name || ""}
                onChange={(e) => handleNameChange(e.target.value)}
                label={t("Symbol")}
              >
                {availableSymbols
                  .filter((symbol) => symbol.name !== "symbol_custom_name")
                  .map((symbol) => (
                  <MenuItem key={symbol.name} value={symbol.name}>
                    {t(symbol.name)}
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

          <Grid  size={12}>
            <CustomTextarea
              label={t("Symbol Effect")}
              value={
                isCustom
                  ? item.effect || ""
                  : item.effect
                  ? t(item.effect)
                  : ""
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
