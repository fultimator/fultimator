import { useMemo, useState } from "react";
import {
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import CustomTextarea from "../../../common/CustomTextarea";
import {
  getStatusEffects,
  getDamageTypes,
  getAttributes,
} from "../../../../libs/gourmetCookingData";

/**
 * GourmetContentSection - Content tab for Gourmet spell
 * Displays cookbook effects and ingredient inventory
 * Note: Full cooking mechanics delegated to SpellGourmetCookingModal via custom handler
 */
export default function GourmetContentSection({ formState, setFormState, t }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTasteKey, setEditingTasteKey] = useState("");
  const [editingText, setEditingText] = useState("");
  const [editingCustomChoices, setEditingCustomChoices] = useState({});

  const escapedChoices = useMemo(() => ({
    chooseAllStatuses: t("gourmet_delicacy_effect_choose_all_statuses"),
    chooseSomeStatuses: t("gourmet_delicacy_effect_choose_some_statuses"),
    chooseDamageType: t("gourmet_delicacy_effect_choose_damage_type"),
    chooseAttribute: t("gourmet_delicacy_effect_choose_attributte"),
  }), [t]);

  // Convert cookbookEffects from object to array if needed
  const cookbookEffects = Array.isArray(formState.cookbookEffects)
    ? formState.cookbookEffects
    : formState.cookbookEffects && typeof formState.cookbookEffects === 'object'
    ? Object.entries(formState.cookbookEffects).map(([key, data]) => ({
        tasteKey: key,
        name: data.tasteCombination || key,
        description: data.effect || '',
        ...data,
      }))
    : [];
  const ingredientInventory = formState.ingredientInventory || [];

  const handleDeleteEffect = (tasteKey) => {
    setFormState((prev) => {
      const newEffects = { ...prev.cookbookEffects };
      delete newEffects[tasteKey];
      return {
        ...prev,
        cookbookEffects: newEffects,
      };
    });
  };

  const handleDeleteIngredient = (index) => {
    setFormState((prev) => ({
      ...prev,
      ingredientInventory: prev.ingredientInventory.filter((_, i) => i !== index),
    }));
  };

  const applyCustomChoices = (effectText, customChoices = {}) => {
    if (!effectText || typeof effectText !== "string") return "";
    let displayText = effectText;

    const replaceAll = (source, from, to) => {
      if (!from || !to) return source;
      return source.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), to);
    };

    if (customChoices.statusEffect) {
      displayText = replaceAll(displayText, escapedChoices.chooseAllStatuses, customChoices.statusEffect);
      displayText = replaceAll(displayText, escapedChoices.chooseSomeStatuses, customChoices.statusEffect);
    }
    if (customChoices.damageType) {
      displayText = replaceAll(displayText, escapedChoices.chooseDamageType, customChoices.damageType);
    }
    if (customChoices.attribute) {
      displayText = replaceAll(displayText, escapedChoices.chooseAttribute, customChoices.attribute);
    }

    return displayText;
  };

  const getEffectChoices = (effectText) => {
    const text = effectText || "";
    const choices = [];
    if (!text) return choices;

    if (
      text.includes(escapedChoices.chooseAllStatuses) ||
      text.includes(escapedChoices.chooseSomeStatuses) ||
      text.includes("dazed; enraged; poisoned; shaken; slow; weak") ||
      text.includes("dazed; shaken; slow; weak")
    ) {
      choices.push({ type: "statusEffect", options: getStatusEffects(t) });
    }
    if (
      text.includes(escapedChoices.chooseDamageType) ||
      text.includes("air; bolt; earth; fire; ice; poison")
    ) {
      choices.push({ type: "damageType", options: getDamageTypes(t) });
    }
    if (
      text.includes(escapedChoices.chooseAttribute) ||
      text.includes("Dexterity; Insight; Might; Willpower")
    ) {
      choices.push({ type: "attribute", options: getAttributes(t) });
    }

    return choices;
  };

  const handleOpenEditEffect = (effect) => {
    setEditingTasteKey(effect.tasteKey || "");
    setEditingText(effect.description || "");
    setEditingCustomChoices(effect.customChoices || {});
    setEditDialogOpen(true);
  };

  const handleSaveEditEffect = () => {
    if (!editingTasteKey) return;
    setFormState((prev) => {
      const current = prev.cookbookEffects || {};
      const next = { ...current };
      const existing = next[editingTasteKey] || {};
      next[editingTasteKey] = {
        ...existing,
        effect: editingText,
        customChoices: editingCustomChoices,
      };
      return {
        ...prev,
        cookbookEffects: next,
      };
    });
    setEditDialogOpen(false);
    setEditingTasteKey("");
    setEditingText("");
    setEditingCustomChoices({});
  };

  return (
    <Grid container spacing={2}>
      {/* Cookbook Effects */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t("Cookbook Effects")} ({cookbookEffects.length})
        </Typography>
        {cookbookEffects.length === 0 ? (
          <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
            {t("No cookbook effects yet")}
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "action.hover" }}>
                  <TableCell>{t("Effect")}</TableCell>
                  <TableCell align="right">{t("Action")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cookbookEffects.map((effect, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Typography variant="body2">
                        {effect.name || `Effect ${idx + 1}`}
                      </Typography>
                      <Box
                        sx={{
                          typography: "caption",
                          color: "text.secondary",
                          "& p": { m: 0 },
                        }}
                      >
                        <ReactMarkdown>
                          {applyCustomChoices(effect.description || "", effect.customChoices)}
                        </ReactMarkdown>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleOpenEditEffect(effect)}
                        sx={{ mr: 1 }}
                      >
                        {t("Edit")}
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteEffect(effect.tasteKey)}
                      >
                        {t("Delete")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Grid>

      {/* Ingredient Inventory */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t("Ingredient Inventory")} ({ingredientInventory.length})
        </Typography>
        {ingredientInventory.length === 0 ? (
          <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
            {t("No ingredients in inventory")}
          </Typography>
        ) : (
          <Grid container spacing={1}>
            {ingredientInventory.map((ingredient, idx) => (
              <Grid item key={idx}>
                <Chip
                  label={`${ingredient.name} (x${ingredient.quantity || 1})`}
                  onDelete={() => handleDeleteIngredient(idx)}
                  variant="outlined"
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>

      {/* Info Box */}
      <Grid item xs={12}>
        <Card sx={{ backgroundColor: "info.lighter", border: "1px solid" }}>
          <CardContent>
            <Typography variant="body2">
              {t("Note: Full cooking mechanics with ingredient selection, taste combinations, and effect rolling are managed separately. This view shows your current cookbook and inventory.")}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t("Edit Effect")}</DialogTitle>
        <DialogContent>
          <CustomTextarea
            label={t("Effect")}
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            helperText=""
          />
          {getEffectChoices(editingText).map((choice) => (
            <FormControl fullWidth sx={{ mt: 1 }} key={choice.type}>
              <InputLabel>
                {choice.type === "statusEffect"
                  ? t("Status Effect")
                  : choice.type === "damageType"
                    ? t("Damage Type")
                    : t("Attribute")}
              </InputLabel>
              <Select
                value={editingCustomChoices[choice.type] || ""}
                onChange={(e) =>
                  setEditingCustomChoices((prev) => ({ ...prev, [choice.type]: e.target.value }))
                }
                label={
                  choice.type === "statusEffect"
                    ? t("Status Effect")
                    : choice.type === "damageType"
                      ? t("Damage Type")
                      : t("Attribute")
                }
              >
                <MenuItem value="">
                  <em>{t("None")}</em>
                </MenuItem>
                {choice.options.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>{t("Cancel")}</Button>
          <Button variant="contained" onClick={handleSaveEditEffect}>
            {t("Save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
