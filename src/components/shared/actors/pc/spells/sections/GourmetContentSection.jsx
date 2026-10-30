import { useMemo, useState } from "react";
import {
  Grid,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
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
import { IconButton, Tooltip } from "@mui/material";
import ReactMarkdown from "react-markdown";
import CustomTextarea from "/src/components/common/CustomTextarea";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import {
  getStatusEffects,
  getDamageTypes,
  getAttributes,
} from "/src/libs/gourmetCookingData";
import { combineIngredientInventory } from "../gourmetCookingUtils";

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

  const escapedChoices = useMemo(
    () => ({
      chooseAllStatuses: t("gourmet_delicacy_effect_choose_all_statuses"),
      chooseSomeStatuses: t("gourmet_delicacy_effect_choose_some_statuses"),
      chooseDamageType: t("gourmet_delicacy_effect_choose_damage_type"),
      chooseAttribute: t("gourmet_delicacy_effect_choose_attributte"),
    }),
    [t],
  );

  const cookbook = formState.cookbook || {
    effects: [],
    ingredientInventory: [],
  };
  const cookbookEffects = (cookbook.effects || []).map((data, idx) => ({
    tasteKey: `effect_${idx}`,
    _index: idx,
    name:
      data.taste1 && data.taste2
        ? `${data.taste1.charAt(0).toUpperCase() + data.taste1.slice(1)} + ${data.taste2.charAt(0).toUpperCase() + data.taste2.slice(1)}`
        : `Effect ${idx + 1}`,
    description: data.effect || "",
    customChoices: data.customChoices || {},
    ...data,
  }));
  const rawIngredientInventory =
    cookbook.ingredientInventory || formState.ingredientInventory || [];
  const ingredientInventory = combineIngredientInventory(
    rawIngredientInventory,
    t,
  );

  const handleDeleteEffect = (_tasteKey, effectIndex) => {
    setFormState((prev) => {
      const prevCookbook = prev.cookbook || {
        effects: [],
        ingredientInventory: [],
      };
      return {
        ...prev,
        cookbook: {
          ...prevCookbook,
          effects: prevCookbook.effects.filter((_, i) => i !== effectIndex),
        },
      };
    });
  };

  const handleDeleteIngredient = (ingredient) => {
    setFormState((prev) => {
      const prevCookbook = prev.cookbook || {
        effects: [],
        ingredientInventory: [],
      };
      const current =
        prevCookbook.ingredientInventory || prev.ingredientInventory || [];
      const nextInventory = current.filter((item) => {
        const itemTaste = (item.taste || "").trim().toLowerCase();
        const ingredientTaste = (ingredient.taste || "").trim().toLowerCase();

        if (ingredientTaste) return itemTaste !== ingredientTaste;

        return (
          (item.name || "").trim().toLowerCase() !==
          (ingredient.name || "").trim().toLowerCase()
        );
      });

      return {
        ...prev,
        cookbook: {
          ...prevCookbook,
          ingredientInventory: nextInventory,
        },
      };
    });
  };

  const applyCustomChoices = (effectText, customChoices = {}) => {
    if (!effectText || typeof effectText !== "string") return "";
    let displayText = effectText;

    const replaceAll = (source, from, to) => {
      if (!from || !to) return source;
      return source.replace(
        new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        to,
      );
    };

    if (customChoices.statusEffect) {
      displayText = replaceAll(
        displayText,
        escapedChoices.chooseAllStatuses,
        customChoices.statusEffect,
      );
      displayText = replaceAll(
        displayText,
        escapedChoices.chooseSomeStatuses,
        customChoices.statusEffect,
      );
    }
    if (customChoices.damageType) {
      displayText = replaceAll(
        displayText,
        escapedChoices.chooseDamageType,
        customChoices.damageType,
      );
    }
    if (customChoices.attribute) {
      displayText = replaceAll(
        displayText,
        escapedChoices.chooseAttribute,
        customChoices.attribute,
      );
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
    setEditingTasteKey(String(effect._index ?? ""));
    setEditingText(effect.description || "");
    setEditingCustomChoices(effect.customChoices || {});
    setEditDialogOpen(true);
  };

  const handleSaveEditEffect = () => {
    if (editingTasteKey === "") return;
    const idx = Number(editingTasteKey);
    setFormState((prev) => {
      const prevCookbook = prev.cookbook || {
        effects: [],
        ingredientInventory: [],
      };
      const effects = [...(prevCookbook.effects || [])];
      effects[idx] = {
        ...(effects[idx] || {}),
        effect: editingText,
        customChoices: editingCustomChoices,
      };
      return {
        ...prev,
        cookbook: { ...prevCookbook, effects },
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
      <Grid size={12}>
        <Typography variant="h6" gutterBottom>
          {t("Cookbook Effects")} ({cookbookEffects.length})
        </Typography>
        {cookbookEffects.length === 0 ? (
          <Typography sx={{ color: "text.secondary", fontStyle: "italic" }}>
            {t("No cookbook effects yet")}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {cookbookEffects.map((effect, idx) => (
              <ItemRowCard
                key={idx}
                label={effect.name || `Effect ${idx + 1}`}
                subtitle={
                  <Box
                    sx={{
                      typography: "caption",
                      color: "text.secondary",
                      "& p": { m: 0 },
                    }}
                  >
                    <ReactMarkdown>
                      {applyCustomChoices(
                        effect.description || "",
                        effect.customChoices,
                      )}
                    </ReactMarkdown>
                  </Box>
                }
                paperSx={
                  idx % 2 === 0 ? { bgcolor: "action.hover" } : undefined
                }
                actions={
                  <>
                    <Tooltip title={t("Edit")}>
                      <IconButton onClick={() => handleOpenEditEffect(effect)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("Delete")}>
                      <IconButton
                        onClick={() =>
                          handleDeleteEffect(effect.tasteKey, effect._index)
                        }
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </>
                }
              />
            ))}
          </Box>
        )}
      </Grid>
      {/* Ingredient Inventory */}
      <Grid size={12}>
        <Typography variant="h6" gutterBottom>
          {t("Ingredient Inventory")} ({ingredientInventory.length})
        </Typography>
        {ingredientInventory.length === 0 ? (
          <Typography
            sx={{
              color: "text.secondary",
              fontStyle: "italic",
            }}
          >
            {t("No ingredients in inventory")}
          </Typography>
        ) : (
          <Grid container spacing={1}>
            {ingredientInventory.map((ingredient, idx) => (
              <Grid key={idx}>
                <Chip
                  label={`${ingredient.name} (x${ingredient.quantity || 1})`}
                  onDelete={() => handleDeleteIngredient(ingredient)}
                  variant="outlined"
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
      {/* Info Box */}
      <Grid size={12}>
        <Alert variant="outlined" severity="info">
          {t(
            "Full cooking mechanics with ingredient selection, taste combinations, and effect rolling are managed in the Shop and Cooking tabs. This view shows your current cookbook and inventory.",
          )}
        </Alert>
      </Grid>
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
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
                  setEditingCustomChoices((prev) => ({
                    ...prev,
                    [choice.type]: e.target.value,
                  }))
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
          <Button onClick={() => setEditDialogOpen(false)}>
            {t("Cancel")}
          </Button>
          <Button variant="contained" onClick={handleSaveEditEffect}>
            {t("Save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
