import React from "react";
import {
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Box,
} from "@mui/material";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";

const StyledTableCell = styled(TableCell)({ 
  padding: "2px 4px",
  fontSize: "0.8rem",
  borderBottom: "1px solid rgba(224, 224, 224, 1)"
});

export default function SpellGourmet({ spell }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? '#1f1f1f' : '#fff';

  const renderEffectWithChoices = (effect, t) => {
    let displayText = effect.effect;
    if (!displayText || typeof displayText !== 'string') return "";

    const choices = [
      { type: "statusEffect", placeholder: t("gourmet_delicacy_effect_choose_all_statuses") },
      { type: "statusEffect", placeholder: t("gourmet_delicacy_effect_choose_some_statuses") },
      { type: "damageType", placeholder: t("gourmet_delicacy_effect_choose_damage_type") },
      { type: "attribute", placeholder: t("gourmet_delicacy_effect_choose_attributte") }
    ];
    
    choices.forEach(choice => {
      const selectedValue = effect.customChoices?.[choice.type];
      if (selectedValue) {
        displayText = displayText.replace(
          new RegExp(choice.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          selectedValue
        );
      }
    });
    
    return <ReactMarkdown components={{ p: ({ _node, ...props }) => <span {...props} /> }}>{displayText}</ReactMarkdown>;
  };

  // Convert cookbook effects to array
  let cookbookEffectsArray = [];
  if (spell.cookbookEffects) {
    if (Array.isArray(spell.cookbookEffects)) {
      cookbookEffectsArray = spell.cookbookEffects;
    } else {
      cookbookEffectsArray = Object.entries(spell.cookbookEffects).map(([key, data]) => ({
        ...data,
        key: key,
        tasteCombination: data.taste1 && data.taste2 
          ? `${data.taste1.charAt(0).toUpperCase() + data.taste1.slice(1)} + ${data.taste2.charAt(0).toUpperCase() + data.taste2.slice(1)}`
          : key.split('_').map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' + '),
      }));
    }
  }

  return (
    <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
      <TableBody>
        {/* Delicacies */}
        {cookbookEffectsArray.length > 0 ? cookbookEffectsArray.map((effect, index) => (
          <TableRow key={index} sx={{ background: index % 2 === 0 ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})` : gradientColor }}>
            <StyledTableCell sx={{ width: "30%", fontWeight: "bold" }}>
              {effect.tasteCombination}
            </StyledTableCell>
            <StyledTableCell sx={{ width: "70%", fontSize: "0.75rem" }}>
              {renderEffectWithChoices(effect, t)}
            </StyledTableCell>
          </TableRow>
        )) : (
          <TableRow>
            <StyledTableCell colSpan={2} sx={{ fontStyle: "italic", textAlign: "center" }}>
              {t("gourmet_combination_no_defined")}
            </StyledTableCell>
          </TableRow>
        )}

        {/* Ingredient Inventory Summary */}
        {spell.ingredientInventory && spell.ingredientInventory.some(i => i.quantity > 0) && (
          <TableRow>
            <StyledTableCell colSpan={2} sx={{ pt: 1 }}>
              <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 0.5 }}>
                {t("gourmet_ingredient_inventory")}:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {spell.ingredientInventory.filter(i => i.quantity > 0).map((item, i) => (
                  <Box key={i} sx={{ px: 0.5, py: 0.25, borderRadius: 1, backgroundColor: theme.ternary, fontSize: "0.65rem", display: 'flex', gap: 0.25 }}>
                    <strong>{item.quantity}x</strong> {item.name}
                  </Box>
                ))}
              </Box>
            </StyledTableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
