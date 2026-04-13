import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  TextField,
  Tabs,
  Tab,
} from "@mui/material";
import { Add, Remove, Casino, ContentCopy, ShoppingCart } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import {
  getDelicacyEffects,
  getIngredientTastes,
  getTasteCombinations,
  rollDelicacyEffect,
  rollIngredientTaste,
  getStatusEffects,
  getDamageTypes,
  getAttributes,
} from "../../../../libs/gourmetCookingData";

const MarkdownComponents = {
  p: ({ _node, ...props }) => <span style={{ margin: 0, padding: 0 }} {...props} />,
  strong: ({ _node, ...props }) => <strong {...props} />,
  em: ({ _node, ...props }) => <em {...props} />,
};

/**
 * GourmetCookingTab - Complete cooking interface with effects table, ingredient rolling, and cooking
 */
export default function GourmetCookingTab({
  formState,
  setFormState,
  t,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedTastesPreview, setSelectedTastesPreview] = useState([]);
  const [rollDialogOpen, setRollDialogOpen] = useState(false);
  const [rollResult, setRollResult] = useState(null);
  const [customChoices, setCustomChoices] = useState({});
  const [targetCombination, setTargetCombination] = useState("");
  const [bulkRollCount, setBulkRollCount] = useState(3);
  const [shopIngredientName, setShopIngredientName] = useState("");
  const [shopIngredientTaste, setShopIngredientTaste] = useState("");
  const [shopIngredientQty, setShopIngredientQty] = useState(1);
  const [choiceDialogOpen, setChoiceDialogOpen] = useState(false);
  const [choiceDialogRolls, setChoiceDialogRolls] = useState([]);

  const ingredientInventory = formState.ingredientInventory || [];
  const cookbookEffects = formState.cookbookEffects || {};
  const allYouCanEat = formState.allYouCanEat || false;
  const usedAllYouCanEat = formState.usedAllYouCanEat || false;

  // Update taste preview when ingredients change
  useEffect(() => {
    const tastes = [];
    selectedIngredients
      .filter((selected) => selected.amount > 0)
      .forEach((selected) => {
        const ingredient = ingredientInventory.find((i) => i.id === selected.id);
        if (ingredient?.taste && ingredient.taste.trim() && ingredient.taste !== "choice") {
          const displayTaste =
            ingredient.taste.charAt(0).toUpperCase() + ingredient.taste.slice(1).toLowerCase();
          for (let i = 0; i < selected.amount; i++) {
            tastes.push(displayTaste);
          }
        }
      });
    setSelectedTastesPreview(tastes);
  }, [selectedIngredients, ingredientInventory]);

  const availableIngredients = ingredientInventory.filter((ing) => ing.quantity > 0);
  const maxIngredients = allYouCanEat && !usedAllYouCanEat ? 4 : 3;
  const totalSelectedIngredients = selectedIngredients.filter((s) => s.amount > 0).length;

  const updateSelectedIngredient = (id, amount) => {
    const existing = selectedIngredients.find((s) => s.id === id);
    if (existing) {
      setSelectedIngredients(
        selectedIngredients.map((s) => (s.id === id ? { ...s, amount } : s))
      );
    } else {
      setSelectedIngredients([...selectedIngredients, { id, amount }]);
    }
  };

  // Get possible taste combinations
  const getPossibleCombinations = () => {
    const combinations = [];
    const addedKeys = new Set();

    if (selectedTastesPreview.length >= 2) {
      for (let i = 0; i < selectedTastesPreview.length; i++) {
        for (let j = i + 1; j < selectedTastesPreview.length; j++) {
          const taste1 = selectedTastesPreview[i];
          const taste2 = selectedTastesPreview[j];

          const foundCombo = getTasteCombinations(t).find((combo) => {
            const combinationTastes = combo.combination
              .split(" + ")
              .map((t) => t.trim().toLowerCase());
            const cleanTaste1 = taste1.trim().toLowerCase();
            const cleanTaste2 = taste2.trim().toLowerCase();

            return (
              combinationTastes.length === 2 &&
              ((combinationTastes[0] === cleanTaste1 && combinationTastes[1] === cleanTaste2) ||
                (combinationTastes[0] === cleanTaste2 && combinationTastes[1] === cleanTaste1))
            );
          });

          if (foundCombo && !addedKeys.has(foundCombo.combination)) {
            addedKeys.add(foundCombo.combination);
            combinations.push(foundCombo);
          }
        }
      }
    }

    return combinations;
  };

  const possibleCombinations = getPossibleCombinations();
  const combinationOptions = possibleCombinations.length > 0
    ? possibleCombinations
    : getTasteCombinations(t);

  // Rolling handlers
  const handleRollDelicacyEffect = () => {
    const rolled = rollDelicacyEffect(t);
    setRollResult({
      type: "effect",
      title: t("gourmet_effect_roll_result"),
      data: rolled,
    });
    setCustomChoices({});
    setTargetCombination("");
    setRollDialogOpen(true);
  };

  const handleRollIngredientTaste = () => {
    const rolled = rollIngredientTaste(t);
    setRollResult({
      type: "ingredient",
      title: t("gourmet_ingredient_roll_result"),
      data: rolled,
    });
    setRollDialogOpen(true);
  };

  const handleBulkRollIngredientTaste = () => {
    const rolls = [];
    for (let i = 0; i < bulkRollCount; i++) {
      rolls.push(rollIngredientTaste(t));
    }
    setRollResult({
      type: "bulk_ingredient",
      title: `${t("gourmet_ingredient_roll_result")} (x${bulkRollCount})`,
      data: rolls,
    });
    setRollDialogOpen(true);
  };

  const handleReroll = () => {
    if (rollResult?.type === "effect") {
      const rolled = rollDelicacyEffect(t);
      setRollResult((prev) => ({ ...prev, data: rolled }));
      setCustomChoices({});
    } else if (rollResult?.type === "ingredient") {
      const rolled = rollIngredientTaste(t);
      setRollResult((prev) => ({ ...prev, data: rolled }));
    } else if (rollResult?.type === "bulk_ingredient") {
      const rolls = [];
      for (let i = 0; i < bulkRollCount; i++) {
        rolls.push(rollIngredientTaste(t));
      }
      setRollResult((prev) => ({ ...prev, data: rolls }));
    }
  };

  const handleCustomChoice = (type, value) => {
    setCustomChoices((prev) => ({ ...prev, [type]: value }));
  };

  const handleAddEffectToCookbook = () => {
    if (!rollResult || rollResult.type !== "effect") return;

    setFormState((prev) => {
      const newEffects = { ...prev.cookbookEffects };
      const combo = getTasteCombinations(t).find((c) => c.key === targetCombination);

      if (combo) {
        newEffects[combo.key] = {
          effect: rollResult.data.effect,
          taste1: combo.taste1,
          taste2: combo.taste2,
          customChoices: customChoices,
          tasteCombination: combo.combination,
        };
      }

      return {
        ...prev,
        cookbookEffects: newEffects,
      };
    });

    setRollDialogOpen(false);
    setTargetCombination("");
    setSelectedIngredients([]);
  };

  const getTasteKeyFromRoll = (rollId) => {
    switch (rollId) {
      case 1: return "bitter";
      case 2: return "salty";
      case 3: return "sour";
      case 4: return "sweet";
      case 5: return "umami";
      case 6: return "choice";
      default: return "";
    }
  };

  const addRollsToInventory = (rolls) => {
    if (!Array.isArray(rolls) || rolls.length === 0) return;

    const hasChoiceTaste = rolls.some((roll) => getTasteKeyFromRoll(roll?.id) === "choice");
    if (hasChoiceTaste) {
      setChoiceDialogRolls(
        rolls.map((roll, index) => ({
          key: index,
          id: roll.id,
          name: "",
          taste:
            getTasteKeyFromRoll(roll.id) === "choice"
              ? ""
              : getTasteKeyFromRoll(roll.id),
        }))
      );
      setChoiceDialogOpen(true);
      return;
    }

    setFormState((prev) => {
      const inventory = [...(prev.ingredientInventory || [])];

      rolls.forEach((roll) => {
        if (!roll) return;
        const tasteKey = getTasteKeyFromRoll(roll.id);
        const ingredientName = t("Ingredient");
        const existingIndex = inventory.findIndex(
          (item) => item.taste === tasteKey && item.name === ingredientName
        );

        if (existingIndex >= 0) {
          const currentQty = Number(inventory[existingIndex].quantity) || 0;
          inventory[existingIndex] = {
            ...inventory[existingIndex],
            quantity: currentQty + 1,
          };
        } else {
          inventory.push({
            id: Math.random().toString(36).substr(2, 9),
            name: ingredientName,
            quantity: 1,
            taste: tasteKey,
          });
        }
      });

      return {
        ...prev,
        ingredientInventory: inventory,
      };
    });

    setRollDialogOpen(false);
  };

  const handleConfirmChoiceIngredients = () => {
    const invalidChoice = choiceDialogRolls.some(
      (roll) => getTasteKeyFromRoll(roll.id) === "choice" && !roll.taste
    );
    if (invalidChoice) return;

    setFormState((prev) => {
      const inventory = [...(prev.ingredientInventory || [])];

      choiceDialogRolls.forEach((roll) => {
        const ingredientName = (roll.name || "").trim() || t("Ingredient");
        const tasteKey = roll.taste || "";
        if (!tasteKey) return;

        const existingIndex = inventory.findIndex(
          (item) => item.taste === tasteKey && item.name === ingredientName
        );

        if (existingIndex >= 0) {
          const currentQty = Number(inventory[existingIndex].quantity) || 0;
          inventory[existingIndex] = {
            ...inventory[existingIndex],
            quantity: currentQty + 1,
          };
        } else {
          inventory.push({
            id: Math.random().toString(36).substr(2, 9),
            name: ingredientName,
            quantity: 1,
            taste: tasteKey,
          });
        }
      });

      return {
        ...prev,
        ingredientInventory: inventory,
      };
    });

    setChoiceDialogOpen(false);
    setChoiceDialogRolls([]);
    setRollDialogOpen(false);
  };

  const handleAddIngredientToInventory = () => {
    if (!rollResult || rollResult.type !== "ingredient" || !rollResult.data) return;
    addRollsToInventory([rollResult.data]);
  };

  const handleAddBulkIngredientsToInventory = () => {
    if (!rollResult || rollResult.type !== "bulk_ingredient" || !Array.isArray(rollResult.data)) return;
    addRollsToInventory(rollResult.data);
  };

  const handleBuyIngredient = () => {
    const name = shopIngredientName.trim();
    if (!name || !shopIngredientTaste) return;

    setFormState((prev) => {
      const inventory = [...(prev.ingredientInventory || [])];
      const existingIndex = inventory.findIndex(
        (item) =>
          (item.name || "").trim().toLowerCase() === name.toLowerCase() &&
          (item.taste || "").trim().toLowerCase() === shopIngredientTaste.toLowerCase()
      );

      if (existingIndex >= 0) {
        const currentQty = Number(inventory[existingIndex].quantity) || 0;
        inventory[existingIndex] = {
          ...inventory[existingIndex],
          quantity: currentQty + shopIngredientQty,
        };
      } else {
        inventory.push({
          id: Math.random().toString(36).substr(2, 9),
          name,
          taste: shopIngredientTaste,
          quantity: shopIngredientQty,
        });
      }

      return {
        ...prev,
        ingredientInventory: inventory,
      };
    });

    setShopIngredientName("");
    setShopIngredientTaste("");
    setShopIngredientQty(1);
  };

  const getTasteLabel = (taste) => {
    if (!taste || taste.trim() === "") return t("gourmet_taste_no_assigned");
    if (taste === "choice") return t("gourmet_taste_your_choice");

    const tasteMap = {
      bitter: t("gourmet_taste_bitter"),
      salty: t("gourmet_taste_salty"),
      sour: t("gourmet_taste_sour"),
      sweet: t("gourmet_taste_sweet"),
      umami: t("gourmet_taste_umami"),
    };
    return tasteMap[taste.toLowerCase()] || taste;
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
        <Tab label={t("gourmet_delicacy_effect_label")} />
        <Tab label={t("gourmet_ingredient_select_to_cook")} />
      </Tabs>
      {/* Tab 0: Effects Reference & Ingredient Rolling */}
      {activeTab === 0 && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Delicacy Effects Table */}
          <Grid  size={12}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              {t("gourmet_delicacy_effect_label")}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<Casino />}
                onClick={handleRollDelicacyEffect}
              >
                {t("gourmet_roll_d12")}
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "action.hover" }}>
                    <TableCell width="10%">
                      <strong>{t("Roll")}</strong>
                    </TableCell>
                    <TableCell width="90%">
                      <strong>{t("Effect")}</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getDelicacyEffects(t).map((effect) => (
                    <TableRow key={effect.id}>
                      <TableCell sx={{ fontWeight: "bold" }}>{effect.id}</TableCell>
                      <TableCell>
                        <ReactMarkdown components={MarkdownComponents}>
                          {effect.effect}
                        </ReactMarkdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Ingredient Taste Rolling */}
          <Grid  size={12}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              {t("gourmet_details")}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mb: 2
              }}>
              {t("gourmet_details_1")}
            </Typography>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Casino />}
                onClick={handleRollIngredientTaste}
              >
                {t("gourmet_roll_d6")}
              </Button>

              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <TextField
                  size="small"
                  type="number"
                  value={bulkRollCount}
                  onChange={(e) => setBulkRollCount(Math.min(10, parseInt(e.target.value) || 1))}
                  sx={{ width: "80px" }}
                  slotProps={{
                    htmlInput: { min: 1, max: 10 }
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<Casino />}
                  onClick={handleBulkRollIngredientTaste}
                >
                  {t("gourmet_bulk_roll_d6")}
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "action.hover" }}>
                    <TableCell width="20%">
                      <strong>{t("Roll")}</strong>
                    </TableCell>
                    <TableCell width="80%">
                      <strong>{t("Taste")}</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getIngredientTastes(t).map((taste) => (
                    <TableRow key={taste.id}>
                      <TableCell sx={{ fontWeight: "bold" }}>{taste.id}</TableCell>
                      <TableCell>{taste.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid  size={12}>
            <Card sx={{ mt: 1 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  {t("Shop Buy Ingredients")}
                </Typography>
                <Grid container spacing={1} sx={{ alignItems: "center" }}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4
                    }}>
                    <TextField
                      fullWidth
                      size="small"
                      label={t("gourmet_ingredient_name")}
                      value={shopIngredientName}
                      onChange={(e) => setShopIngredientName(e.target.value)}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4
                    }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t("gourmet_taste")}</InputLabel>
                      <Select
                        value={shopIngredientTaste}
                        onChange={(e) => setShopIngredientTaste(e.target.value)}
                        label={t("gourmet_taste")}
                      >
                        {getIngredientTastes(t)
                          .filter((taste) => taste.id !== 6)
                          .map((taste) => (
                            <MenuItem
                              key={taste.id}
                              value={taste.name.toLowerCase().replace(/\s+/g, "")}
                            >
                              {taste.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2
                    }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => setShopIngredientQty((prev) => Math.max(1, prev - 1))}
                      >
                        <Remove />
                      </IconButton>
                      <Typography variant="body2" sx={{ minWidth: "20px", textAlign: "center" }}>
                        {shopIngredientQty}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setShopIngredientQty((prev) => Math.min(99, prev + 1))}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2
                    }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ShoppingCart />}
                      onClick={handleBuyIngredient}
                      disabled={!shopIngredientName.trim() || !shopIngredientTaste}
                    >
                      {t("Buy")}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      {/* Tab 1: Cooking */}
      {activeTab === 1 && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* All You Can Eat */}
          {allYouCanEat && (
            <Grid  size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={usedAllYouCanEat}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        usedAllYouCanEat: e.target.checked,
                      }))
                    }
                  />
                }
                label={t("gourmet_all_you_can_eat_used")}
              />
            </Grid>
          )}

          {/* Ingredient Selection */}
          <Grid  size={12}>
            <Typography variant="h6" gutterBottom>
              {t("gourmet_ingredient_select_to_cook")}
            </Typography>

            {availableIngredients.length === 0 ? (
              <Typography
                sx={{
                  color: "text.secondary",
                  fontStyle: "italic"
                }}>
                {t("gourmet_no_ingredients_available")}
              </Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "action.hover" }}>
                      <TableCell>{t("gourmet_ingredient")}</TableCell>
                      <TableCell>{t("gourmet_taste")}</TableCell>
                      <TableCell align="center">{t("gourmet_available")}</TableCell>
                      <TableCell align="center">{t("gourmet_use")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableIngredients.map((ingredient) => {
                      const selected = selectedIngredients.find((s) => s.id === ingredient.id);
                      const amount = selected?.amount || 0;
                      const isDisabled =
                        !ingredient.taste ||
                        ingredient.taste.trim() === "" ||
                        ingredient.taste === "choice";

                      return (
                        <TableRow key={ingredient.id} hover>
                          <TableCell>
                            <Typography variant="body2">{ingredient.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color={isDisabled ? "warning.main" : "text.secondary"}
                            >
                              {getTasteLabel(ingredient.taste)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">{ingredient.quantity}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                justifyContent: "center",
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  updateSelectedIngredient(ingredient.id, Math.max(0, amount - 1))
                                }
                                disabled={amount <= 0 || isDisabled}
                              >
                                <Remove />
                              </IconButton>
                              <Typography
                                variant="body2"
                                sx={{
                                  minWidth: "24px",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                }}
                              >
                                {amount}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  updateSelectedIngredient(
                                    ingredient.id,
                                    Math.min(ingredient.quantity, amount + 1)
                                  )
                                }
                                disabled={
                                  amount >= ingredient.quantity ||
                                  (amount === 0 && totalSelectedIngredients >= maxIngredients) ||
                                  isDisabled
                                }
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
          </Grid>

          {/* Cooking Preview */}
          {selectedTastesPreview.length > 0 && (
            <Grid  size={12}>
              <Card sx={{ backgroundColor: "action.hover" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t("gourmet_cooking_preview")}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>{t("gourmet_selected_tastes")}:</strong> {selectedTastesPreview.join(" + ")}
                  </Typography>

                  {possibleCombinations.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                        {t("Possible Taste Combinations")}:
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {possibleCombinations.map((combo) => {
                          const hasEffect = cookbookEffects[combo.key];
                          return (
                            <Card
                              key={combo.key}
                              sx={{
                                p: 1,
                                backgroundColor: hasEffect ? "warning.light" : "background.paper",
                                border: hasEffect ? "2px solid" : "1px solid",
                                borderColor: hasEffect ? "warning.main" : "divider",
                              }}
                            >
                              <Typography variant="body2">
                                {combo.combination}
                                {hasEffect && " ✓"}
                              </Typography>
                            </Card>
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Roll for Effect Button */}
          {selectedTastesPreview.length >= 2 && (
            <Grid  size={12}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Casino />}
                onClick={handleRollDelicacyEffect}
                fullWidth
              >
                {t("gourmet_roll_delicacy_effect")}
              </Button>
            </Grid>
          )}
        </Grid>
      )}
      {/* Roll Result Dialog */}
      <Dialog open={rollDialogOpen} onClose={() => setRollDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {rollResult?.title}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {rollResult?.type === "effect" && rollResult.data && (
            <Box>
              <Typography variant="body2" gutterBottom sx={{
                color: "text.secondary"
              }}>
                {t("Effect")} #{rollResult.data.id}:
              </Typography>
              <Box sx={{ p: 2, backgroundColor: "action.hover", borderRadius: 1, mb: 2 }}>
                <ReactMarkdown components={MarkdownComponents}>
                  {rollResult.data.effect}
                </ReactMarkdown>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                  {t("gourmet_select_combination")}:
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>{t("Taste Combination")}</InputLabel>
                  <Select
                    value={targetCombination}
                    onChange={(e) => setTargetCombination(e.target.value)}
                    label={t("Taste Combination")}
                  >
                    {combinationOptions.map((combo) => {
                      const hasEffect = cookbookEffects[combo.key];
                      return (
                        <MenuItem key={combo.key} value={combo.key}>
                          {combo.combination}
                          {hasEffect ? " ✓ (has effect)" : ""}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>

              {/* Custom Choices */}
              {rollResult.data.effect.includes("choose one:") && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                    {t("Custom Choices")}:
                  </Typography>

                  {rollResult.data.effect.includes("status effect") && (
                    <FormControl fullWidth sx={{ mb: 1 }}>
                      <InputLabel>{t("Status Effect")}</InputLabel>
                      <Select
                        value={customChoices.statusEffect || ""}
                        onChange={(e) => handleCustomChoice("statusEffect", e.target.value)}
                        label={t("Status Effect")}
                      >
                        {getStatusEffects(t).map((effect) => (
                          <MenuItem key={effect} value={effect}>
                            {effect}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {rollResult.data.effect.includes("damage") && (
                    <FormControl fullWidth sx={{ mb: 1 }}>
                      <InputLabel>{t("Damage Type")}</InputLabel>
                      <Select
                        value={customChoices.damageType || ""}
                        onChange={(e) => handleCustomChoice("damageType", e.target.value)}
                        label={t("Damage Type")}
                      >
                        {getDamageTypes(t).map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {rollResult.data.effect.includes("attribute") && (
                    <FormControl fullWidth>
                      <InputLabel>{t("Attribute")}</InputLabel>
                      <Select
                        value={customChoices.attribute || ""}
                        onChange={(e) => handleCustomChoice("attribute", e.target.value)}
                        label={t("Attribute")}
                      >
                        {getAttributes(t).map((attr) => (
                          <MenuItem key={attr} value={attr}>
                            {attr}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              )}
            </Box>
          )}

          {rollResult?.type === "ingredient" && rollResult.data && (
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {t("Roll")}: {rollResult.data.id} - {rollResult.data.name}
              </Typography>
            </Box>
          )}

          {rollResult?.type === "bulk_ingredient" && Array.isArray(rollResult.data) && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                {t("Results")}:
              </Typography>
              {rollResult.data.map((roll, idx) => (
                <Typography key={idx} variant="body2">
                  {idx + 1}. {t("Roll")}: {roll.id} - {roll.name}
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button onClick={() => setRollDialogOpen(false)} variant="outlined">
            {t("Cancel")}
          </Button>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={handleReroll}
              variant="outlined"
              startIcon={<Casino />}
            >
              {t("Reroll")}
            </Button>
            {rollResult?.type === "ingredient" && (
              <Button
                onClick={handleAddIngredientToInventory}
                variant="contained"
                startIcon={<ShoppingCart />}
              >
                {t("gourmet_ingredient_add")}
              </Button>
            )}
            {rollResult?.type === "bulk_ingredient" && (
              <Button
                onClick={handleAddBulkIngredientsToInventory}
                variant="contained"
                startIcon={<ShoppingCart />}
              >
                {t("gourmet_ingredient_add")}
              </Button>
            )}
            {rollResult?.type === "effect" && (
              <Button
                onClick={handleAddEffectToCookbook}
                variant="contained"
                startIcon={<ContentCopy />}
                disabled={!targetCombination}
              >
                {t("gourmet_copy_to_cookbook")}
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>
      <Dialog open={choiceDialogOpen} onClose={() => setChoiceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t("Choose Taste Before Adding")}</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            {choiceDialogRolls.map((roll, index) => (
              <Grid  key={`${roll.id}-${roll.key}`} size={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" sx={{
                      color: "text.secondary"
                    }}>
                      {t("Roll")} {roll.id}
                    </Typography>
                    <Grid container spacing={1} sx={{ mt: 0.5 }}>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6
                        }}>
                        <TextField
                          fullWidth
                          size="small"
                          label={t("gourmet_ingredient_name")}
                          value={roll.name || ""}
                          onChange={(e) =>
                            setChoiceDialogRolls((prev) =>
                              prev.map((item, i) =>
                                i === index ? { ...item, name: e.target.value } : item
                              )
                            )
                          }
                        />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6
                        }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("gourmet_taste")}</InputLabel>
                          <Select
                            value={roll.taste || ""}
                            onChange={(e) =>
                              setChoiceDialogRolls((prev) =>
                                prev.map((item, i) =>
                                  i === index ? { ...item, taste: e.target.value } : item
                                )
                              )
                            }
                            label={t("gourmet_taste")}
                          >
                            {getIngredientTastes(t)
                              .filter((taste) => taste.id !== 6)
                              .map((taste) => (
                                <MenuItem
                                  key={taste.id}
                                  value={taste.name.toLowerCase().replace(/\s+/g, "")}
                                >
                                  {taste.name}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChoiceDialogOpen(false)}>{t("Cancel")}</Button>
          <Button
            variant="contained"
            onClick={handleConfirmChoiceIngredients}
            disabled={choiceDialogRolls.some((roll) => !roll.taste)}
          >
            {t("gourmet_ingredient_add")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
