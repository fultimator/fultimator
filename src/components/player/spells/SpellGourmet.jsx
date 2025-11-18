import React, { useMemo } from "react";
import {
  Typography,
  IconButton,
  Box,
  Paper,
  Stack,
  Tooltip,
  Button,
} from "@mui/material";
import { Edit, VisibilityOff } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import {
  getStatusEffects,
  getDamageTypes,
  getAttributes,
} from "../../../libs/gourmetCookingData";

export default function SpellGourmet({ spell, onEdit, onEditCooking, isEditMode }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  // ReactMarkdown component configuration for consistent styling
  const MarkdownComponents = {
    p: (props) => <span style={{ margin: 0, padding: 0 }} {...props} />,
    strong: (props) => <strong {...props} />,
    em: (props) => <em {...props} />
  };

  // Helper function to get effect choices
  const getEffectChoices = (effectText, t) => {
    const choices = [];
    
    // Safety check: ensure effectText is a string
    if (!effectText || typeof effectText !== 'string') {
      return choices;
    }
    
    if (effectText.includes(t("gourmet_delicacy_effect_choose_all_statuses"))) {
      choices.push({ type: "statusEffect", options: getStatusEffects(t) });
    } else if (effectText.includes(t("gourmet_delicacy_effect_choose_some_statuses"))) {
      choices.push({ type: "statusEffect", options: [t("dazed"), t("shaken"), t("slow"), t("weak")] });
    }
    
    if (effectText.includes(t("gourmet_delicacy_effect_choose_damage_type"))) {
      choices.push({ type: "damageType", options: getDamageTypes(t) });
    }
    
    if (effectText.includes(t("gourmet_delicacy_effect_choose_attributte"))) {
      choices.push({ type: "attribute", options: getAttributes(t) });
    }
    
    return choices;
  };

  // Helper function to render effect with custom choices
  const renderEffectWithChoices = (effect, t) => {
    const choices = getEffectChoices(effect.effect, t);
    
    let displayText = effect.effect;
    
    // Replace choice placeholders with selected values
    choices.forEach(choice => {
      const selectedValue = effect.customChoices[choice.type];
      if (selectedValue) {
        if (choice.type === "statusEffect") {
          displayText = displayText.replace(
            new RegExp(t("gourmet_delicacy_effect_choose_all_statuses").replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            selectedValue
          ).replace(
            new RegExp(t("gourmet_delicacy_effect_choose_some_statuses").replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            selectedValue
          );
        } else if (choice.type === "damageType") {
          displayText = displayText.replace(
            new RegExp(t("gourmet_delicacy_effect_choose_damage_type").replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            selectedValue
          );
        } else if (choice.type === "attribute") {
          displayText = displayText.replace(
            new RegExp(t("gourmet_delicacy_effect_choose_attributte").replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            selectedValue
          );
        }
      }
    });
    
    // Return ReactMarkdown component for proper rendering of markdown syntax
    return <ReactMarkdown components={MarkdownComponents}>{displayText}</ReactMarkdown>;
  };

  // Memoize spell data to prevent unnecessary re-renders
  const spellData = useMemo(() => {
    if (!spell) return null;
    
    // Convert cookbook effects from object format to array for display
    let cookbookEffectsArray = [];
    if (spell.cookbookEffects) {
      cookbookEffectsArray = Object.entries(spell.cookbookEffects).map(([key, data]) => ({
        tasteCombination: data.taste1 && data.taste2 
          ? `${data.taste1.charAt(0).toUpperCase() + data.taste1.slice(1)} + ${data.taste2.charAt(0).toUpperCase() + data.taste2.slice(1)}`
          : key.split('_').map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' + '),
        effect: data.effect,
        customChoices: data.customChoices || {},
        taste1: data.taste1,
        taste2: data.taste2,
        key: key
      }));
    }
    
    return {
      name: spell.spellName || "Unnamed Cooking Spell",
      cookbookEffects: cookbookEffectsArray,
      showInPlayerSheet: spell.showInPlayerSheet !== false,
    };
  }, [spell]);

  // Early return if no spell data
  if (!spell || !spellData) {
    return null;
  }

  const handleEdit = () => {
    if (onEdit && typeof onEdit === 'function') {
      onEdit();
    }
  };

  const handleEditCooking = () => {
    if (onEditCooking && typeof onEditCooking === 'function') {
      onEditCooking();
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
            {t("gourmet_delicacy")}
          </Typography>
        </Box>
        {isEditMode && (
          <Box sx={{ width: 40, height: 40 }} />
        )}
      </Box>

      {/* Spell Info */}
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
              {spellData.name}
            </Typography>
          </Box>
        </Box>
        {isEditMode && (
          <Box sx={{ width: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              {!spellData.showInPlayerSheet && (
                <Tooltip title={t("Spell not shown in player sheet")}>
                  <VisibilityOff sx={{ fontSize: "1rem", color: "text.secondary" }} />
                </Tooltip>
              )}
              <IconButton size="small" onClick={handleEdit}>
                <Edit sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Stack>
          </Box>
        )}
      </Box>

      {/* Cookbook Effects */}
      <Box>
        {spellData.cookbookEffects.length > 0 ? (
          spellData.cookbookEffects.map((effect, index) => (
            <Box
              key={effect.key || `effect-${index}`}
              sx={{
                background: theme.ternary,
                borderTop: `1px solid white`,
                borderBottom: `1px solid white`,
                px: 2,
                py: 0.5,
                display: "flex",
                // gap: 2,
              }}
            >
              <Box sx={{ width: { xs: "30%", md: "25%" } }}>
                <Typography
                  sx={{
                    fontSize: { xs: "0.8rem", sm: "1rem" },
                    fontWeight: "bold",
                  }}
                >
                  {effect.tasteCombination || "—"}
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

      {/* Cooking Modal Button */}
      {isEditMode && onEditCooking && (
        <Box sx={{ p: 1, borderTop: `1px solid ${theme.secondary}`, backgroundColor: theme.ternary }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleEditCooking}
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              textTransform: "none",
            }}
          >
            {t("gourmet_manage_cookbook_button")}
          </Button>
        </Box>
      )}
    </Paper>
  );
}