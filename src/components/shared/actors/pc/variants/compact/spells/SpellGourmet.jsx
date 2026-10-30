import React from "react";
import {
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Box,
  Chip,
} from "@mui/material";
import { styled } from "@mui/system";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";
import { combineIngredientInventory } from "/src/components/shared/actors/pc/spells/gourmetCookingUtils";

const StyledTableCell = styled(TableCell)({
  padding: "4px 8px",
  fontSize: "0.85rem",
  lineHeight: 1.35,
  verticalAlign: "middle",
  borderBottom: "1px solid rgba(224, 224, 224, 1)",
});

export default function SpellGourmet({ spell }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";
  if (!spell) return null;

  const resolveEffectText = (effect) => {
    let text = effect.effect;
    if (!text || typeof text !== "string") return "";
    const choices = [
      {
        type: "statusEffect",
        placeholder: t("gourmet_delicacy_effect_choose_all_statuses"),
      },
      {
        type: "statusEffect",
        placeholder: t("gourmet_delicacy_effect_choose_some_statuses"),
      },
      {
        type: "damageType",
        placeholder: t("gourmet_delicacy_effect_choose_damage_type"),
      },
      {
        type: "attribute",
        placeholder: t("gourmet_delicacy_effect_choose_attributte"),
      },
    ];
    choices.forEach((choice) => {
      const val = effect.customChoices?.[choice.type];
      if (val) {
        text = text.replace(
          new RegExp(
            choice.placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "g",
          ),
          val,
        );
      }
    });
    return text;
  };

  const renderEffectWithChoices = (effect) => {
    const displayText = resolveEffectText(effect);
    return (
      <ReactMarkdown
        components={{ p: ({ _node, ...props }) => <span {...props} /> }}
      >
        {displayText}
      </ReactMarkdown>
    );
  };

  // Convert cookbook effects to array
  const cookbookEffectsArray = (spell.cookbook?.effects || []).map(
    (data, index) => ({
      ...data,
      key: `${data.taste1 || ""}_${data.taste2 || ""}_${index}`,
      tasteCombination:
        data.taste1 && data.taste2
          ? `${data.taste1.charAt(0).toUpperCase() + data.taste1.slice(1)} + ${data.taste2.charAt(0).toUpperCase() + data.taste2.slice(1)}`
          : `Effect ${index + 1}`,
    }),
  );
  const ingredientInventory = combineIngredientInventory(
    spell.cookbook?.ingredientInventory || spell.ingredientInventory || [],
    t,
  );

  return (
    <>
      <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
        <TableBody>
          {/* Delicacies */}
          {cookbookEffectsArray.length > 0 ? (
            cookbookEffectsArray.map((effect, index) => (
              <TableRow
                key={index}
                sx={{
                  background:
                    index % 2 === 0
                      ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`
                      : gradientColor,
                }}
              >
                <StyledTableCell sx={{ width: "30%", fontWeight: "bold" }}>
                  {effect.tasteCombination}
                </StyledTableCell>
                <StyledTableCell sx={{ width: "70%", fontSize: "0.85rem" }}>
                  {renderEffectWithChoices(effect)}
                </StyledTableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <StyledTableCell
                colSpan={2}
                sx={{ fontStyle: "italic", textAlign: "center" }}
              >
                {t("gourmet_combination_no_defined")}
              </StyledTableCell>
            </TableRow>
          )}

          {/* Ingredient Inventory Summary */}
          {ingredientInventory.length > 0 && (
            <TableRow>
              <StyledTableCell colSpan={2} sx={{ pt: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    fontWeight: "bold",
                    mb: 0.5,
                  }}
                >
                  {t("gourmet_ingredient_inventory")}:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {ingredientInventory.map((item, i) => (
                    <Chip
                      key={item.id || `${item.name}-${i}`}
                      size="small"
                      label={`${Number(item.quantity) || 0}x ${item.name}`}
                      sx={{
                        minHeight: 32,
                        borderRadius: 1,
                        backgroundColor: theme.ternary,
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        "& .MuiChip-label": {
                          px: 1,
                          py: 0.4,
                        },
                      }}
                    />
                  ))}
                </Box>
              </StyledTableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
