import React, { useMemo } from "react";
import {
  Typography,
  IconButton,
  Box,
  Chip,
  Paper,
  Stack,
  Tooltip,
} from "@mui/material";
import { Edit, VisibilityOff } from "@mui/icons-material";
import OutdoorGrillIcon from "@mui/icons-material/OutdoorGrill";
import { useTranslate } from "/src/translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import {
  getStatusEffects,
  getDamageTypes,
  getAttributes,
} from "/src/libs/gourmetCookingData";
import GourmetStartCookingDialog from "./GourmetStartCookingDialog";
import { combineIngredientInventory } from "./gourmetCookingUtils";

export default function SpellGourmet({
  spell,
  onEdit,
  isEditMode,
  onSpellUpdate,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [cookingOpen, setCookingOpen] = React.useState(false);

  // ReactMarkdown component configuration for consistent styling
  const MarkdownComponents = {
    p: (props) => <span style={{ margin: 0, padding: 0 }} {...props} />,
    strong: (props) => <strong {...props} />,
    em: (props) => <em {...props} />,
  };

  // Helper function to get effect choices
  const getEffectChoices = (effectText, t) => {
    const choices = [];

    // Safety check: ensure effectText is a string
    if (!effectText || typeof effectText !== "string") {
      return choices;
    }

    if (effectText.includes(t("gourmet_delicacy_effect_choose_all_statuses"))) {
      choices.push({ type: "statusEffect", options: getStatusEffects(t) });
    } else if (
      effectText.includes(t("gourmet_delicacy_effect_choose_some_statuses"))
    ) {
      choices.push({
        type: "statusEffect",
        options: [t("dazed"), t("shaken"), t("slow"), t("weak")],
      });
    }

    if (effectText.includes(t("gourmet_delicacy_effect_choose_damage_type"))) {
      choices.push({ type: "damageType", options: getDamageTypes(t) });
    }

    if (effectText.includes(t("gourmet_delicacy_effect_choose_attributte"))) {
      choices.push({ type: "attribute", options: getAttributes(t) });
    }

    return choices;
  };

  // Resolve effect text with custom choices as plain string (for chat)
  const resolveEffectText = (effect) => {
    if (!effect.effect || typeof effect.effect !== "string") return "";
    let text = effect.effect;
    const choices = getEffectChoices(text, t);
    choices.forEach((choice) => {
      const val = effect.customChoices?.[choice.type];
      if (!val) return;
      if (choice.type === "statusEffect") {
        text = text
          .replace(
            new RegExp(
              t("gourmet_delicacy_effect_choose_all_statuses").replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&",
              ),
              "g",
            ),
            val,
          )
          .replace(
            new RegExp(
              t("gourmet_delicacy_effect_choose_some_statuses").replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&",
              ),
              "g",
            ),
            val,
          );
      } else if (choice.type === "damageType") {
        text = text.replace(
          new RegExp(
            t("gourmet_delicacy_effect_choose_damage_type").replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&",
            ),
            "g",
          ),
          val,
        );
      } else if (choice.type === "attribute") {
        text = text.replace(
          new RegExp(
            t("gourmet_delicacy_effect_choose_attributte").replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&",
            ),
            "g",
          ),
          val,
        );
      }
    });
    return text;
  };

  // Helper function to render effect with custom choices
  const renderEffectWithChoices = (effect, t) => {
    const choices = getEffectChoices(effect.effect, t);

    let displayText = effect.effect;

    // Replace choice placeholders with selected values
    choices.forEach((choice) => {
      const selectedValue = effect.customChoices[choice.type];
      if (selectedValue) {
        if (choice.type === "statusEffect") {
          displayText = displayText
            .replace(
              new RegExp(
                t("gourmet_delicacy_effect_choose_all_statuses").replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&",
                ),
                "g",
              ),
              selectedValue,
            )
            .replace(
              new RegExp(
                t("gourmet_delicacy_effect_choose_some_statuses").replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&",
                ),
                "g",
              ),
              selectedValue,
            );
        } else if (choice.type === "damageType") {
          displayText = displayText.replace(
            new RegExp(
              t("gourmet_delicacy_effect_choose_damage_type").replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&",
              ),
              "g",
            ),
            selectedValue,
          );
        } else if (choice.type === "attribute") {
          displayText = displayText.replace(
            new RegExp(
              t("gourmet_delicacy_effect_choose_attributte").replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&",
              ),
              "g",
            ),
            selectedValue,
          );
        }
      }
    });

    // Return ReactMarkdown component for proper rendering of markdown syntax
    return (
      <ReactMarkdown components={MarkdownComponents}>
        {displayText}
      </ReactMarkdown>
    );
  };

  const spellData = useMemo(() => {
    if (!spell) return null;

    const effects = spell.cookbook?.effects || [];
    const cookbookEffectsArray = effects.map((data, idx) => ({
      tasteCombination:
        data.taste1 && data.taste2
          ? `${data.taste1.charAt(0).toUpperCase() + data.taste1.slice(1)} + ${data.taste2.charAt(0).toUpperCase() + data.taste2.slice(1)}`
          : `Effect ${idx + 1}`,
      effect: data.effect,
      customChoices: data.customChoices || {},
      taste1: data.taste1,
      taste2: data.taste2,
      key: `${data.taste1 || ""}${data.taste2 || ""}_${idx}`,
    }));

    return {
      name: spell.spellName || "Unnamed Cooking Spell",
      cookbookEffects: cookbookEffectsArray,
      ingredientInventory: combineIngredientInventory(
        spell.cookbook?.ingredientInventory || spell.ingredientInventory || [],
        t,
      ),
      showInPlayerSheet: spell.showInPlayerSheet !== false,
    };
  }, [spell, t]);

  // Early return if no spell data
  if (!spell || !spellData) {
    return null;
  }

  const handleEdit = () => {
    if (onEdit && typeof onEdit === "function") {
      onEdit();
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${theme.secondary}`,
        borderRadius: 0,
        overflow: "hidden",
        mb: 1,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: theme.primary,
          color: theme.white,
          px: 2,
          py: 0.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "Antonio",
          textTransform: "uppercase",
          fontSize: { xs: "0.7rem", sm: "1.1rem" },
          fontWeight: "normal",
        }}
      >
        <Box sx={{ display: "flex", flex: 1, alignItems: "center" }}>
          <Typography
            variant="h6"
            sx={{
              flex: 1,
              fontSize: "inherit",
              fontFamily: "inherit",
              fontWeight: "inherit",
              textTransform: "inherit",
            }}
          >
            {t("gourmet_cookbook")}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          {isEditMode && !spellData.showInPlayerSheet && (
            <Tooltip title={t("Spell not shown in player sheet")}>
              <VisibilityOff
                sx={{ fontSize: "1rem", color: theme.white, opacity: 0.75 }}
              />
            </Tooltip>
          )}
          {isEditMode && (
            <Tooltip title={t("Edit")} arrow>
              <IconButton
                size="small"
                onClick={handleEdit}
                sx={{ color: theme.white, p: "3px" }}
              >
                <Edit sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={t("gourmet_cooking")} arrow>
            <IconButton
              size="small"
              onClick={() => setCookingOpen(true)}
              sx={{ color: theme.white, p: "3px" }}
            >
              <OutdoorGrillIcon sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Delicacy */}
      <Box
        sx={{
          background: `linear-gradient(to right, ${theme.ternary}, ${
            theme.mode === "dark" ? "#1f1f1f" : "#fff"
          })`,
          px: 2,
          py: 0.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1px solid ${theme.secondary}`,
          borderBottom: `1px solid ${theme.secondary}`,
        }}
      >
        <Box sx={{ display: "flex", flex: 1, alignItems: "center" }}>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "0.8rem", sm: "1rem" },
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {t("gourmet_delicacy")}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Cookbook Effects */}
      <Box>
        {spellData.cookbookEffects.length > 0 ? (
          spellData.cookbookEffects.map((effect, index) => (
            <Box
              key={effect.key || `effect-${index}`}
              sx={{
                background: index % 2 === 0 ? theme.ternary : "transparent",
                borderTop: `1px solid white`,
                borderBottom: `1px solid white`,
                px: 2,
                py: 0.5,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box sx={{ width: { xs: "30%", md: "25%" } }}>
                <Typography
                  sx={{
                    fontSize: { xs: "0.8rem", sm: "1rem" },
                    fontWeight: "bold",
                  }}
                >
                  {effect.tasteCombination || "-"}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: { xs: "0.8rem", sm: "1rem" },
                  }}
                >
                  {renderEffectWithChoices(effect, t)}
                </Typography>
              </Box>
            </Box>
          ))
        ) : (
          <Box
            sx={{
              background: theme.ternary,
              borderTop: `1px solid white`,
              borderBottom: `1px solid white`,
              px: 2,
              py: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "0.8rem", sm: "1rem" },
                fontStyle: "italic",
                color: "text.secondary",
              }}
            >
              {t("gourmet_combination_no_defined")}
            </Typography>
          </Box>
        )}
      </Box>

      {spellData.ingredientInventory.length > 0 && (
        <Box
          sx={{
            background: theme.ternary,
            borderTop: `1px solid ${theme.secondary}`,
            px: 2,
            py: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.9rem" },
              fontWeight: 700,
              mb: 0.75,
            }}
          >
            {t("gourmet_ingredient_inventory")}:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {spellData.ingredientInventory.map((item, index) => (
              <Chip
                key={item.id || `${item.name}-${index}`}
                size="small"
                label={`${Number(item.quantity) || 0}x ${item.name}`}
                sx={{
                  minHeight: 30,
                  borderRadius: 1,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  "& .MuiChip-label": {
                    px: 1,
                    py: 0.25,
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}
      <GourmetStartCookingDialog
        open={cookingOpen}
        onClose={() => setCookingOpen(false)}
        spell={spell}
        resolveEffectText={resolveEffectText}
        onRegisterRecipes={
          onSpellUpdate
            ? (recipes) =>
                onSpellUpdate((currentSpell) => {
                  const cookbook = currentSpell.cookbook || {};
                  return {
                    ...currentSpell,
                    cookbook: {
                      ...cookbook,
                      effects: [...(cookbook.effects || []), ...recipes],
                    },
                  };
                })
            : undefined
        }
      />
    </Paper>
  );
}
