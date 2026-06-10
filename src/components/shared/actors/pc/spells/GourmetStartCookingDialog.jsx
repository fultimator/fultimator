import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Add, Casino, ExpandMore, MenuBook, Remove } from "@mui/icons-material";
import OutdoorGrillIcon from "@mui/icons-material/OutdoorGrill";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "/src/translation/translate";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";
import {
  getAttributes,
  getDamageTypes,
  getStatusEffects,
  rollDelicacyEffect,
} from "/src/libs/gourmetCookingData";
import {
  buildCookbookEffectMap,
  combineIngredientInventory,
  getSelectedTasteCombinations,
  getTasteLabel,
} from "./gourmetCookingUtils";

export default function GourmetStartCookingDialog({
  open,
  onClose,
  spell,
  resolveEffectText,
  onRegisterRecipes,
}) {
  const { t } = useTranslate();
  const [selectedAmounts, setSelectedAmounts] = React.useState({});
  const [rolledEffects, setRolledEffects] = React.useState({});

  React.useEffect(() => {
    if (!open) {
      setSelectedAmounts({});
      setRolledEffects({});
    }
  }, [open]);

  const cookbookEffects = spell?.cookbook?.effects || [];
  const ingredientInventory = combineIngredientInventory(
    spell?.cookbook?.ingredientInventory || spell?.ingredientInventory || [],
    t,
  );
  const availableIngredients = ingredientInventory.filter(
    (ingredient) =>
      ingredient.taste &&
      ingredient.taste.trim() !== "" &&
      ingredient.taste !== "choice",
  );
  const selectedIngredients = availableIngredients
    .map((ingredient) => ({
      ...ingredient,
      amount: selectedAmounts[ingredient.id] || 0,
    }))
    .filter((ingredient) => ingredient.amount > 0);
  const selectedCount = selectedIngredients.reduce(
    (sum, ingredient) => sum + ingredient.amount,
    0,
  );
  const maxIngredients = 3;
  const cookbookEffectMap = buildCookbookEffectMap(cookbookEffects);
  const combinations = getSelectedTasteCombinations(selectedIngredients, t);
  const knownCombinations = combinations.filter(
    (combo) => cookbookEffectMap[combo.key],
  );
  const unknownCombinations = combinations.filter(
    (combo) => !cookbookEffectMap[combo.key],
  );
  const unresolvedUnknownCombinations = unknownCombinations.filter((combo) => {
    const rolled = rolledEffects[combo.key];
    return !rolled || getMissingChoiceTypes(rolled).length > 0;
  });

  const resolveRolledEffectText = (rolledEffect) => {
    if (!rolledEffect?.effect || typeof rolledEffect.effect !== "string")
      return "";
    let text = rolledEffect.effect;
    const choices = rolledEffect.customChoices || {};
    const replacements = [
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

    replacements.forEach(({ type, placeholder }) => {
      const value = choices[type];
      if (!value) return;
      text = text.replace(
        new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        value,
      );
    });

    return text;
  };

  function getChoiceTypes(effectText) {
    if (!effectText || typeof effectText !== "string") return [];
    const types = [];
    if (
      effectText.includes(t("gourmet_delicacy_effect_choose_all_statuses")) ||
      effectText.includes(t("gourmet_delicacy_effect_choose_some_statuses")) ||
      effectText.includes("status effect")
    ) {
      types.push("statusEffect");
    }
    if (
      effectText.includes(t("gourmet_delicacy_effect_choose_damage_type")) ||
      effectText.includes("damage")
    ) {
      types.push("damageType");
    }
    if (
      effectText.includes(t("gourmet_delicacy_effect_choose_attributte")) ||
      effectText.includes("attribute")
    ) {
      types.push("attribute");
    }
    return [...new Set(types)];
  }

  function getMissingChoiceTypes(rolledEffect) {
    const choices = rolledEffect?.customChoices || {};
    return getChoiceTypes(rolledEffect?.effect).filter((type) => !choices[type]);
  }

  const rollCombinationEffect = (comboKey) => {
    const rolled = rollDelicacyEffect(t);
    setRolledEffects((prev) => ({
      ...prev,
      [comboKey]: {
        ...rolled,
        customChoices: {},
      },
    }));
  };

  const updateRolledChoice = (comboKey, type, value) => {
    setRolledEffects((prev) => ({
      ...prev,
      [comboKey]: {
        ...prev[comboKey],
        customChoices: {
          ...(prev[comboKey]?.customChoices || {}),
          [type]: value,
        },
      },
    }));
  };

  const updateAmount = (ingredient, nextAmount) => {
    const clamped = Math.max(0, Math.min(ingredient.quantity, nextAmount));
    const current = selectedAmounts[ingredient.id] || 0;
    const nextTotal = selectedCount - current + clamped;
    if (nextTotal > maxIngredients) return;
    setSelectedAmounts((prev) => ({
      ...prev,
      [ingredient.id]: clamped,
    }));
  };

  const handleStartCooking = () => {
    const newlyRegisteredRecipes = unknownCombinations.map((combo) => ({
      taste1: combo.taste1,
      taste2: combo.taste2,
      effect: rolledEffects[combo.key].effect,
      id: rolledEffects[combo.key].id,
      customChoices: rolledEffects[combo.key].customChoices || {},
    }));
    const ingredientText = selectedIngredients
      .map((ingredient) => `${ingredient.amount}x ${ingredient.name}`)
      .join(", ");
    const effectText = combinations
      .map((combo) => {
        const effect = cookbookEffectMap[combo.key];
        if (!effect) {
          const rolled = rolledEffects[combo.key];
          return `**${combo.combination}:** #${rolled.id} - ${resolveRolledEffectText(rolled)}`;
        }
        const prefix = effect.id ? `#${effect.id} - ` : "";
        return `**${combo.combination}:** ${prefix}${resolveEffectText(effect)}`;
      })
      .join("\n\n");

    sendDisplayMessage("spell", t("gourmet_cooking"), {
      speaker: "",
      tags: [
        `${t("gourmet_ingredient")}: ${ingredientText}`,
        `${t("gourmet_cooking_preview")}: ${combinations.length}`,
      ],
      description: effectText,
    });
    if (newlyRegisteredRecipes.length > 0) {
      onRegisterRecipes?.(newlyRegisteredRecipes);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 700 }}>
        {t("gourmet_cooking")}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Cookbook quick reference */}
          {cookbookEffects.length > 0 && (
            <Accordion disableGutters elevation={0} variant="outlined">
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MenuBook fontSize="small" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {t("gourmet_delicacy")} ({cookbookEffects.length})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "action.hover" }}>
                        <TableCell sx={{ fontWeight: 700, width: "30%" }}>
                          {t("gourmet_taste")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          {t("Effect")}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cookbookEffects.map((entry, i) => {
                        const combo =
                          entry.taste1 && entry.taste2
                            ? `${entry.taste1.charAt(0).toUpperCase() + entry.taste1.slice(1)} + ${entry.taste2.charAt(0).toUpperCase() + entry.taste2.slice(1)}`
                            : `Effect ${i + 1}`;
                        const prefix = entry.id ? `#${entry.id} - ` : "";
                        return (
                          <TableRow key={i} hover>
                            <TableCell sx={{ fontWeight: 700, verticalAlign: "top" }}>
                              {combo}
                            </TableCell>
                            <TableCell>
                              <ReactMarkdown
                                components={{
                                  p: ({ node: _n, ...props }) => (
                                    <p style={{ margin: 0 }} {...props} />
                                  ),
                                }}
                              >
                                {`${prefix}${resolveEffectText(entry)}`}
                              </ReactMarkdown>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          )}

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 0.75 }}>
              {t("gourmet_ingredient_select_to_cook")}
            </Typography>
            {availableIngredients.length === 0 ? (
              <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                {t("gourmet_no_ingredients_available")}
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "action.hover" }}>
                      <TableCell>{t("gourmet_ingredient")}</TableCell>
                      <TableCell>{t("gourmet_taste")}</TableCell>
                      <TableCell align="center">
                        {t("gourmet_available")}
                      </TableCell>
                      <TableCell align="center">{t("gourmet_use")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableIngredients.map((ingredient) => {
                      const amount = selectedAmounts[ingredient.id] || 0;
                      const selected = amount > 0;
                      const canAdd =
                        amount < ingredient.quantity &&
                        selectedCount < maxIngredients;

                      return (
                        <TableRow
                          key={ingredient.id}
                          hover
                          sx={{
                            backgroundColor: selected
                              ? "action.selected"
                              : "inherit",
                          }}
                        >
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                minWidth: 0,
                              }}
                            >
                              {selected ? (
                                <RadioButtonCheckedIcon color="primary" />
                              ) : (
                                <RadioButtonUncheckedIcon color="disabled" />
                              )}
                              <Typography variant="body2" fontWeight={700}>
                                {ingredient.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {getTasteLabel(ingredient.taste, t)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {ingredient.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 0.5,
                              }}
                            >
                              <IconButton
                                size="medium"
                                onClick={() =>
                                  updateAmount(ingredient, amount - 1)
                                }
                                disabled={amount <= 0}
                              >
                                <Remove />
                              </IconButton>
                              <Typography
                                variant="body2"
                                sx={{
                                  minWidth: 28,
                                  textAlign: "center",
                                  fontWeight: 700,
                                }}
                              >
                                {amount}
                              </Typography>
                              <IconButton
                                size="medium"
                                onClick={() =>
                                  updateAmount(ingredient, amount + 1)
                                }
                                disabled={!canAdd}
                              >
                                <Add />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {selectedCount > 0 && (
            <Box>
              <Typography sx={{ fontWeight: 700, mb: 0.75 }}>
                {t("gourmet_cooking_preview")}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1 }}>
                {selectedIngredients.map((ingredient) => (
                  <Chip
                    key={ingredient.id}
                    label={`${ingredient.amount}x ${ingredient.name}`}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
              {selectedCount < 2 ? (
                <Alert severity="info">
                  {t("gourmet_ingredient_select_to_cook")}: 2-3
                </Alert>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {knownCombinations.map((combo) => {
                    const effect = cookbookEffectMap[combo.key];
                    const prefix = effect.id ? `#${effect.id} - ` : "";
                    return (
                      <Paper key={combo.key} variant="outlined" sx={{ p: 1 }}>
                        <Typography sx={{ fontWeight: 700 }}>
                          {combo.combination}
                        </Typography>
                        <ReactMarkdown
                          components={{
                            p: ({ node: _n, ...props }) => (
                              <p style={{ margin: 0 }} {...props} />
                            ),
                          }}
                        >
                          {`${prefix}${resolveEffectText(effect)}`}
                        </ReactMarkdown>
                      </Paper>
                    );
                  })}
                  {unknownCombinations.map((combo) => (
                    <Paper
                      key={combo.key}
                      variant="outlined"
                      sx={{ p: 1, borderColor: "warning.main" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>
                            {combo.combination}
                          </Typography>
                          <Typography variant="caption" color="warning.main">
                            {t("gourmet_combination_not_in_cookbook")}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Casino />}
                          onClick={() => rollCombinationEffect(combo.key)}
                        >
                          {rolledEffects[combo.key]
                            ? t("Reroll")
                            : t("gourmet_roll_delicacy_effect")}
                        </Button>
                      </Box>

                      {rolledEffects[combo.key] ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <ReactMarkdown
                            components={{
                              p: ({ node: _n, ...props }) => (
                                <p style={{ margin: 0 }} {...props} />
                              ),
                            }}
                          >
                            {`#${rolledEffects[combo.key].id} - ${resolveRolledEffectText(rolledEffects[combo.key])}`}
                          </ReactMarkdown>

                          {getChoiceTypes(rolledEffects[combo.key].effect).map(
                            (type) => {
                              const optionMap = {
                                statusEffect: {
                                  label: t("Status Effect"),
                                  options: getStatusEffects(t),
                                },
                                damageType: {
                                  label: t("Damage Type"),
                                  options: getDamageTypes(t),
                                },
                                attribute: {
                                  label: t("Attribute"),
                                  options: getAttributes(t),
                                },
                              };
                              const config = optionMap[type];
                              return (
                                <FormControl key={type} size="small" fullWidth>
                                  <InputLabel>{config.label}</InputLabel>
                                  <Select
                                    value={
                                      rolledEffects[combo.key].customChoices?.[
                                        type
                                      ] || ""
                                    }
                                    label={config.label}
                                    onChange={(event) =>
                                      updateRolledChoice(
                                        combo.key,
                                        type,
                                        event.target.value,
                                      )
                                    }
                                  >
                                    {config.options.map((option) => (
                                      <MenuItem key={option} value={option}>
                                        {option}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              );
                            },
                          )}
                        </Box>
                      ) : (
                        <Alert severity="warning">
                          {t("gourmet_roll_delicacy_effect")}.
                        </Alert>
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button
          variant="contained"
          startIcon={<OutdoorGrillIcon />}
          onClick={handleStartCooking}
          disabled={
            selectedCount < 2 || unresolvedUnknownCombinations.length > 0
          }
        >
          {t("gourmet_cooking")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
