import { useState, useMemo } from "react";
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
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add,
  Remove,
  Casino,
  ContentCopy,
  ShoppingCart,
} from "@mui/icons-material";
import OutdoorGrillIcon from "@mui/icons-material/OutdoorGrill";
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
} from "/src/libs/gourmetCookingData";
import ConfirmConfirmationDialog from "/src/components/common/ConfirmConfirmationDialog";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";
import {
  buildCookbookEffectMap,
  combineIngredientInventory,
  getSelectedTasteCombinations,
} from "../gourmetCookingUtils";

const SHOP_CHOSEN_INGREDIENT_ZENIT_COST = 20;
const SHOP_RANDOM_INGREDIENT_ZENIT_COST = 10;

const MarkdownComponents = {
  p: ({ _node, ...props }) => (
    <span style={{ margin: 0, padding: 0 }} {...props} />
  ),
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
  player,
  mode = "cooking",
}) {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [rolledEffects, setRolledEffects] = useState({});
  const [rollDialogOpen, setRollDialogOpen] = useState(false);
  const [rollResult, setRollResult] = useState(null);
  const [customChoices, setCustomChoices] = useState({});
  const [targetCombination, setTargetCombination] = useState("");
  const [bulkRollCount, setBulkRollCount] = useState(3);
  const [shopIngredientName, setShopIngredientName] = useState("");
  const [shopIngredientTaste, setShopIngredientTaste] = useState("");
  const [shopIngredientQty, setShopIngredientQty] = useState(1);
  const [shopIngredientFree, setShopIngredientFree] = useState(false);
  const [buyConfirmOpen, setBuyConfirmOpen] = useState(false);
  const [randomIngredientQty, setRandomIngredientQty] = useState(1);
  const [randomIngredientFree, setRandomIngredientFree] = useState(false);
  const [randomBuyConfirmOpen, setRandomBuyConfirmOpen] = useState(false);
  const [shopToast, setShopToast] = useState(null);
  const [choiceDialogOpen, setChoiceDialogOpen] = useState(false);
  const [choiceDialogRolls, setChoiceDialogRolls] = useState([]);
  const [choiceDialogCost, setChoiceDialogCost] = useState(0);
  const [choiceDialogResultText, setChoiceDialogResultText] = useState("");
  const [choiceDialogTitle, setChoiceDialogTitle] = useState("");

  const cookbook = formState.cookbook || {
    effects: [],
    ingredientInventory: [],
  };
  const ingredientInventory = useMemo(
    () =>
      combineIngredientInventory(
        cookbook.ingredientInventory || formState.ingredientInventory || [],
        t,
      ),
    [cookbook.ingredientInventory, formState.ingredientInventory, t],
  );
  const cookbookEffectsArr = cookbook.effects || [];
  const cookbookEffects = buildCookbookEffectMap(cookbookEffectsArr);
  const allYouCanEat = formState.allYouCanEat || false;
  const usedAllYouCanEat = formState.usedAllYouCanEat || false;
  const pendingZenitSpent = Number(formState._pendingZenitSpent) || 0;
  const currentZenit = Math.max(
    0,
    (Number(player?.info?.zenit) || 0) - pendingZenitSpent,
  );
  const baseShopIngredientCost =
    shopIngredientQty * SHOP_CHOSEN_INGREDIENT_ZENIT_COST;
  const baseRandomIngredientCost =
    randomIngredientQty * SHOP_RANDOM_INGREDIENT_ZENIT_COST;
  const shopIngredientCost = shopIngredientFree ? 0 : baseShopIngredientCost;
  const randomIngredientCost = randomIngredientFree
    ? 0
    : baseRandomIngredientCost;
  const canAffordShopIngredient = currentZenit >= shopIngredientCost;
  const canAffordRandomIngredient = currentZenit >= randomIngredientCost;

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

  const availableIngredients = ingredientInventory.filter(
    (ing) =>
      ing.quantity > 0 &&
      ing.taste &&
      ing.taste.trim() !== "" &&
      ing.taste !== "choice",
  );
  const maxIngredients = allYouCanEat && !usedAllYouCanEat ? 4 : 3;
  const selectedIngredientDetails = availableIngredients
    .map((ingredient) => ({
      ...ingredient,
      amount:
        selectedIngredients.find((selected) => selected.id === ingredient.id)
          ?.amount || 0,
    }))
    .filter((ingredient) => ingredient.amount > 0);
  const totalSelectedIngredients = selectedIngredientDetails.reduce(
    (sum, ingredient) => sum + ingredient.amount,
    0,
  );
  const selectedTastesPreview = selectedIngredientDetails.flatMap(
    (ingredient) =>
      Array.from({ length: ingredient.amount }, () =>
        getTasteLabel(ingredient.taste),
      ),
  );

  const updateSelectedIngredient = (id, amount) => {
    const ingredient = availableIngredients.find((item) => item.id === id);
    if (!ingredient) return;
    const clamped = Math.max(0, Math.min(ingredient.quantity, amount));
    const existing = selectedIngredients.find((s) => s.id === id);
    const currentAmount = existing?.amount || 0;
    const nextTotal = totalSelectedIngredients - currentAmount + clamped;
    if (nextTotal > maxIngredients) return;

    if (existing) {
      setSelectedIngredients(
        selectedIngredients.map((s) =>
          s.id === id ? { ...s, amount: clamped } : s,
        ),
      );
    } else {
      setSelectedIngredients([...selectedIngredients, { id, amount: clamped }]);
    }
  };

  const possibleCombinations = getSelectedTasteCombinations(
    selectedIngredientDetails,
    t,
  );
  const knownCombinations = possibleCombinations.filter(
    (combo) => cookbookEffects[combo.key],
  );
  const unknownCombinations = possibleCombinations.filter(
    (combo) => !cookbookEffects[combo.key],
  );
  const unresolvedUnknownCombinations = unknownCombinations.filter((combo) => {
    const rolled = rolledEffects[combo.key];
    return !rolled || getMissingChoiceTypes(rolled).length > 0;
  });
  const combinationOptions =
    possibleCombinations.length > 0
      ? possibleCombinations
      : getTasteCombinations(t);

  const buildIngredientRollRows = (rolls) =>
    rolls.map((roll, index) => {
      const tasteKey = getTasteKeyFromRoll(roll.id);
      return {
        key: index,
        id: roll.id,
        name:
          tasteKey === "choice"
            ? ""
            : roll.name || getTasteLabel(tasteKey) || t("Ingredient"),
        taste: tasteKey === "choice" ? "" : tasteKey,
      };
    });

  const openIngredientRollResults = ({
    rolls,
    cost = 0,
    resultText = "",
    title = "",
  }) => {
    setChoiceDialogRolls(buildIngredientRollRows(rolls));
    setChoiceDialogCost(cost);
    setChoiceDialogResultText(resultText);
    setChoiceDialogTitle(title);
    setChoiceDialogOpen(true);
  };

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
    openIngredientRollResults({
      rolls: [rolled],
      title: t("gourmet_ingredient_roll_result"),
    });
  };

  const handleBulkRollIngredientTaste = () => {
    const rolls = Array.from({ length: bulkRollCount }, () =>
      rollIngredientTaste(t),
    );
    openIngredientRollResults({
      rolls,
      title: `${t("gourmet_ingredient_roll_result")} (x${bulkRollCount})`,
    });
  };

  const handleReroll = () => {
    if (rollResult?.type === "effect") {
      const rolled = rollDelicacyEffect(t);
      setRollResult((prev) => ({ ...prev, data: rolled }));
      setCustomChoices({});
    }
  };

  const handleCustomChoice = (type, value) => {
    setCustomChoices((prev) => ({ ...prev, [type]: value }));
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

  const resolveEffectText = (effect) => {
    if (!effect?.effect || typeof effect.effect !== "string") return "";
    let text = effect.effect;
    const choices = effect.customChoices || {};
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

  const handleStartCooking = () => {
    const newlyRegisteredRecipes = unknownCombinations.map((combo) => ({
      taste1: combo.taste1,
      taste2: combo.taste2,
      effect: rolledEffects[combo.key].effect,
      id: rolledEffects[combo.key].id,
      customChoices: rolledEffects[combo.key].customChoices || {},
    }));
    const ingredientText = selectedIngredientDetails
      .map((ingredient) => `${ingredient.amount}x ${ingredient.name}`)
      .join(", ");
    const effectText = possibleCombinations
      .map((combo) => {
        const effect = cookbookEffects[combo.key];
        if (!effect) {
          const rolled = rolledEffects[combo.key];
          return `**${combo.combination}:** #${rolled.id} - ${resolveEffectText(rolled)}`;
        }
        const prefix = effect.id ? `#${effect.id} - ` : "";
        return `**${combo.combination}:** ${prefix}${resolveEffectText(effect)}`;
      })
      .join("\n\n");

    sendDisplayMessage("spell", t("gourmet_cooking"), {
      speaker: "",
      tags: [
        `${t("gourmet_ingredient")}: ${ingredientText}`,
        `${t("gourmet_cooking_preview")}: ${possibleCombinations.length}`,
      ],
      description: effectText,
    });

    if (newlyRegisteredRecipes.length > 0) {
      setFormState((prev) => {
        const prevCookbook = prev.cookbook || {
          effects: [],
          ingredientInventory: [],
        };
        return {
          ...prev,
          cookbook: {
            ...prevCookbook,
            effects: [...(prevCookbook.effects || []), ...newlyRegisteredRecipes],
          },
        };
      });
    }

    setSelectedIngredients([]);
    setRolledEffects({});
  };

  const handleAddEffectToCookbook = () => {
    if (!rollResult || rollResult.type !== "effect") return;

    setFormState((prev) => {
      const prevCookbook = prev.cookbook || {
        effects: [],
        ingredientInventory: [],
      };
      const combo = getTasteCombinations(t).find(
        (c) => c.key === targetCombination,
      );
      if (!combo) return prev;

      const existingIdx = (prevCookbook.effects || []).findIndex(
        (e) => e.taste1 === combo.taste1 && e.taste2 === combo.taste2,
      );
      const newEntry = {
        taste1: combo.taste1,
        taste2: combo.taste2,
        effect: rollResult.data.effect,
        id: rollResult.data.id,
        customChoices: customChoices,
      };
      const effects = [...(prevCookbook.effects || [])];
      if (existingIdx >= 0) {
        effects[existingIdx] = newEntry;
      } else {
        effects.push(newEntry);
      }

      return {
        ...prev,
        cookbook: { ...prevCookbook, effects },
      };
    });

    setRollDialogOpen(false);
    setTargetCombination("");
    setSelectedIngredients([]);
  };

  const getTasteKeyFromRoll = (rollId) => {
    switch (rollId) {
      case 1:
        return "bitter";
      case 2:
        return "salty";
      case 3:
        return "sour";
      case 4:
        return "sweet";
      case 5:
        return "umami";
      case 6:
        return "choice";
      default:
        return "";
    }
  };

  const getRawIngredientInventory = (spellDraft) => {
    const draftCookbook = spellDraft.cookbook || {};
    return (
      draftCookbook.ingredientInventory ||
      spellDraft.ingredientInventory ||
      []
    );
  };

  const spendZenit = (cost) => {
    if (cost <= 0) return;
    setFormState((prev) => ({
      ...prev,
      _pendingZenitSpent: (Number(prev._pendingZenitSpent) || 0) + cost,
    }));
  };

  const handleConfirmChoiceIngredients = () => {
    const invalidChoice = choiceDialogRolls.some(
      (roll) => getTasteKeyFromRoll(roll.id) === "choice" && !roll.taste,
    );
    if (invalidChoice) return;

    setFormState((prev) => {
      const prevCookbook = prev.cookbook || {
        effects: [],
        ingredientInventory: [],
      };
      const inventory = [...getRawIngredientInventory(prev)];

      choiceDialogRolls.forEach((roll) => {
        const ingredientName = (roll.name || "").trim() || t("Ingredient");
        const tasteKey = roll.taste || "";
        if (!tasteKey) return;

        const existingIndex = inventory.findIndex(
          (item) => item.taste === tasteKey && item.name === ingredientName,
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
        cookbook: { ...prevCookbook, ingredientInventory: inventory },
      };
    });

    setChoiceDialogOpen(false);
    setChoiceDialogRolls([]);
    spendZenit(choiceDialogCost);
    if (choiceDialogResultText) {
      setShopToast({
        severity: "success",
        message: choiceDialogResultText,
      });
    }
    setChoiceDialogCost(0);
    setChoiceDialogResultText("");
    setChoiceDialogTitle("");
    setRollDialogOpen(false);
  };

  const addShopIngredientToInventory = () => {
    const name = shopIngredientName.trim();
    if (!name || !shopIngredientTaste) return;

    setFormState((prev) => {
      const prevCookbook = prev.cookbook || {
        effects: [],
        ingredientInventory: [],
      };
      const inventory = [...getRawIngredientInventory(prev)];
      const existingIndex = inventory.findIndex(
        (item) =>
          (item.name || "").trim().toLowerCase() === name.toLowerCase() &&
          (item.taste || "").trim().toLowerCase() ===
            shopIngredientTaste.toLowerCase(),
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
        cookbook: { ...prevCookbook, ingredientInventory: inventory },
      };
    });

    setShopIngredientName("");
    setShopIngredientTaste("");
    setShopIngredientQty(1);
  };

  const handleBuyIngredient = () => {
    if (!shopIngredientName.trim() || !shopIngredientTaste) {
      setShopToast({
        severity: "info",
        message: t("Choose an ingredient name and taste before buying."),
      });
      return;
    }

    if (shopIngredientFree) {
      handleConfirmBuyIngredient();
      return;
    }

    if (!canAffordShopIngredient) {
      setShopToast({
        severity: "warning",
        message: `${t("Not enough Zenit")}: ${currentZenit}z / ${shopIngredientCost}z`,
      });
      return;
    }

    setBuyConfirmOpen(true);
  };

  const handleConfirmBuyIngredient = () => {
    addShopIngredientToInventory();
    spendZenit(shopIngredientCost);
    setShopToast({
      severity: "success",
      message: `${t("Bought")} ${shopIngredientQty}x ${shopIngredientName.trim()} (${shopIngredientCost}z)`,
    });
  };

  const handleBuyRandomIngredient = () => {
    if (randomIngredientFree) {
      handleConfirmBuyRandomIngredient();
      return;
    }

    if (!canAffordRandomIngredient) {
      setShopToast({
        severity: "warning",
        message: `${t("Not enough Zenit")}: ${currentZenit}z / ${randomIngredientCost}z`,
      });
      return;
    }

    setRandomBuyConfirmOpen(true);
  };

  const handleConfirmBuyRandomIngredient = () => {
    const rolls = Array.from({ length: randomIngredientQty }, () =>
      rollIngredientTaste(t),
    );
    const resultText = rolls
      .map((roll) => `${roll.id}: ${roll.name}`)
      .join(", ");
    openIngredientRollResults({
      rolls,
      cost: randomIngredientCost,
      resultText: `${t("Gamble")} ${randomIngredientQty}x (${randomIngredientCost}z): ${resultText}`,
      title: t("Gamble Results"),
    });
  };

  const handleShopTasteChange = (tasteKey) => {
    setShopIngredientTaste(tasteKey);
    const selectedTaste = getIngredientTastes(t)
      .filter((taste) => taste.id !== 6)
      .find(
        (taste) =>
          taste.name.toLowerCase().replace(/\s+/g, "") === tasteKey,
      );
    if (selectedTaste) {
      setShopIngredientName(selectedTaste.name);
    }
  };

  const handleChoiceDialogTasteChange = (index, tasteKey) => {
    const selectedTaste = getIngredientTastes(t)
      .filter((taste) => taste.id !== 6)
      .find(
        (taste) =>
          taste.name.toLowerCase().replace(/\s+/g, "") === tasteKey,
      );

    setChoiceDialogRolls((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              taste: tasteKey,
              name: selectedTaste?.name || item.name,
            }
          : item,
      ),
    );
  };

  const handleRerollIngredientResults = () => {
    const rollCount = Math.max(1, choiceDialogRolls.length);
    const rolls = Array.from({ length: rollCount }, () =>
      rollIngredientTaste(t),
    );
    const resultText = rolls
      .map((roll) => `${roll.id}: ${roll.name}`)
      .join(", ");

    setChoiceDialogRolls(buildIngredientRollRows(rolls));
    if (choiceDialogResultText) {
      setChoiceDialogResultText(
        `${choiceDialogTitle || t("Ingredient Taste Roll Result")} (${choiceDialogCost}z): ${resultText}`,
      );
    }
  };

  const showShop = mode === "shop";
  const showCooking = mode === "cooking";
  const shopActionButtonSx = {
    width: { xs: "100%", sm: 220 },
    minWidth: { xs: 0, sm: 220 },
    height: 40,
  };
  const shopActionGroupSx = {
    display: "flex",
    alignItems: "center",
    justifyContent: { xs: "stretch", sm: "flex-end" },
    gap: 1,
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Shop: Effects Reference & Ingredient Rolling */}
      {showShop && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Delicacy Effects Table */}
          <Grid size={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", flex: 1 }}>
                {t("gourmet_delicacy_effect_label")}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Casino />}
                onClick={handleRollDelicacyEffect}
                size="small"
                sx={{ flexShrink: 0 }}
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
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {effect.id}
                      </TableCell>
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
          <Grid size={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", flex: 1 }}>
                {t("gourmet_details")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
                <Button
                  variant="outlined"
                  startIcon={<Casino />}
                  onClick={handleRollIngredientTaste}
                  size="small"
                >
                  {t("gourmet_roll_d6")}
                </Button>
                <TextField
                  size="small"
                  type="number"
                  value={bulkRollCount}
                  onChange={(e) =>
                    setBulkRollCount(
                      Math.min(10, Math.max(1, parseInt(e.target.value) || 1)),
                    )
                  }
                  sx={{ width: "70px" }}
                  slotProps={{
                    htmlInput: { min: 1, max: 10 },
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<Casino />}
                  onClick={handleBulkRollIngredientTaste}
                  size="small"
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
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {taste.id}
                      </TableCell>
                      <TableCell>{taste.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid size={12}>
            <Card sx={{ mt: 1 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {t("Shop Buy Ingredients")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("Current Zenit")}: {currentZenit}z
                  </Typography>
                </Box>
                <Grid container spacing={1} sx={{ alignItems: "center" }}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <Grid container spacing={1}>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                        }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          label={t("gourmet_ingredient_name")}
                          value={shopIngredientName}
                          onChange={(e) =>
                            setShopIngredientName(e.target.value)
                          }
                        />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                        }}
                      >
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("gourmet_taste")}</InputLabel>
                          <Select
                            value={shopIngredientTaste}
                            onChange={(e) =>
                              handleShopTasteChange(e.target.value)
                            }
                            label={t("gourmet_taste")}
                          >
                            {getIngredientTastes(t)
                              .filter((taste) => taste.id !== 6)
                              .map((taste) => (
                                <MenuItem
                                  key={taste.id}
                                  value={taste.name
                                    .toLowerCase()
                                    .replace(/\s+/g, "")}
                                >
                                  {taste.name}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.5,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          setShopIngredientQty((prev) => Math.max(1, prev - 1))
                        }
                      >
                        <Remove />
                      </IconButton>
                      <Typography
                        variant="body2"
                        sx={{ minWidth: "20px", textAlign: "center" }}
                      >
                        {shopIngredientQty}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setShopIngredientQty((prev) => Math.min(99, prev + 1))
                        }
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <Box sx={shopActionGroupSx}>
                      <Button
                        variant="outlined"
                        startIcon={<ShoppingCart />}
                        onClick={handleBuyIngredient}
                        sx={shopActionButtonSx}
                      >
                        {t("Buy")} ({shopIngredientCost}z)
                      </Button>
                      <FormControlLabel
                        sx={{ m: 0, whiteSpace: "nowrap" }}
                        control={
                          <Checkbox
                            checked={shopIngredientFree}
                            onChange={(event) =>
                              setShopIngredientFree(event.target.checked)
                            }
                          />
                        }
                        label={t("Free")}
                      />
                    </Box>
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    borderTop: "1px solid",
                    borderColor: "divider",
                    mt: 2,
                    pt: 2,
                  }}
                >
                  <Grid container spacing={1} sx={{ alignItems: "center" }}>
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {t("Random Taste Ingredient")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t(
                          "Purchase ingredients from stalls, shops, or merchants: 10 zenit each, then roll d6 for taste.",
                        )}
                      </Typography>
                    </Grid>
                    <Grid
                      size={{
                        xs: 12,
                        sm: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            setRandomIngredientQty((prev) =>
                              Math.max(1, prev - 1),
                            )
                          }
                        >
                          <Remove />
                        </IconButton>
                        <Typography
                          variant="body2"
                          sx={{ minWidth: "20px", textAlign: "center" }}
                        >
                          {randomIngredientQty}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setRandomIngredientQty((prev) =>
                              Math.min(99, prev + 1),
                            )
                          }
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid
                      size={{
                        xs: 12,
                        sm: 4,
                      }}
                    >
                      <Box sx={shopActionGroupSx}>
                        <Button
                          variant="contained"
                          color="warning"
                          startIcon={<Casino />}
                          onClick={handleBuyRandomIngredient}
                          sx={shopActionButtonSx}
                        >
                          {t("Gamble")} ({randomIngredientCost}z)
                        </Button>
                        <FormControlLabel
                          sx={{ m: 0, whiteSpace: "nowrap" }}
                          control={
                            <Checkbox
                              checked={randomIngredientFree}
                              onChange={(event) =>
                                setRandomIngredientFree(event.target.checked)
                              }
                            />
                          }
                          label={t("Free")}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      {/* Cooking */}
      {showCooking && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* All You Can Eat */}
          {allYouCanEat && (
            <Grid size={12}>
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
          <Grid size={12}>
            <Typography variant="h6" gutterBottom>
              {t("gourmet_ingredient_select_to_cook")}
            </Typography>

            {availableIngredients.length === 0 ? (
              <Typography
                sx={{
                  color: "text.secondary",
                  fontStyle: "italic",
                }}
              >
                {t("gourmet_no_ingredients_available")}
              </Typography>
            ) : (
              <TableContainer component={Paper}>
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
                      const selected = selectedIngredients.find(
                        (s) => s.id === ingredient.id,
                      );
                      const amount = selected?.amount || 0;
                      const isDisabled =
                        !ingredient.taste ||
                        ingredient.taste.trim() === "" ||
                        ingredient.taste === "choice";

                      return (
                        <TableRow key={ingredient.id} hover>
                          <TableCell>
                            <Typography variant="body2">
                              {ingredient.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color={
                                isDisabled ? "warning.main" : "text.secondary"
                              }
                            >
                              {getTasteLabel(ingredient.taste)}
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
                                gap: 0.5,
                                justifyContent: "center",
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  updateSelectedIngredient(
                                    ingredient.id,
                                    Math.max(0, amount - 1),
                                  )
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
                                    Math.min(ingredient.quantity, amount + 1),
                                  )
                                }
                                disabled={
                                  amount >= ingredient.quantity ||
                                  (amount === 0 &&
                                    totalSelectedIngredients >=
                                      maxIngredients) ||
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
            <Grid size={12}>
              <Card sx={{ backgroundColor: "action.hover" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t("gourmet_cooking_preview")}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>{t("gourmet_selected_tastes")}:</strong>{" "}
                    {selectedTastesPreview.join(" + ")}
                  </Typography>

                  {possibleCombinations.length > 0 && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        {t("Possible Taste Combinations")}:
                      </Typography>
                      {knownCombinations.map((combo) => {
                        const effect = cookbookEffects[combo.key];
                        const prefix = effect.id ? `#${effect.id} - ` : "";
                        return (
                          <Paper key={combo.key} variant="outlined" sx={{ p: 1 }}>
                            <Typography sx={{ fontWeight: 700 }}>
                              {combo.combination}
                            </Typography>
                            <ReactMarkdown components={MarkdownComponents}>
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
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                              }}
                            >
                              <ReactMarkdown components={MarkdownComponents}>
                                {`#${rolledEffects[combo.key].id} - ${resolveEffectText(rolledEffects[combo.key])}`}
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
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Start Cooking Button */}
          {totalSelectedIngredients >= 2 && (
            <Grid size={12}>
              <Button
                variant="contained"
                size="large"
                startIcon={<OutdoorGrillIcon />}
                onClick={handleStartCooking}
                disabled={unresolvedUnknownCombinations.length > 0}
                fullWidth
              >
                {t("gourmet_cooking")}
              </Button>
            </Grid>
          )}
        </Grid>
      )}
      {/* Roll Result Dialog */}
      <Dialog
        open={rollDialogOpen}
        onClose={() => setRollDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {rollResult?.title}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {rollResult?.type === "effect" && rollResult.data && (
            <Box>
              <Typography
                variant="body2"
                gutterBottom
                sx={{
                  color: "text.secondary",
                }}
              >
                {t("Effect")} #{rollResult.data.id}:
              </Typography>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "action.hover",
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                <ReactMarkdown components={MarkdownComponents}>
                  {rollResult.data.effect}
                </ReactMarkdown>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
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
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    {t("Custom Choices")}:
                  </Typography>

                  {rollResult.data.effect.includes("status effect") && (
                    <FormControl fullWidth sx={{ mb: 1 }}>
                      <InputLabel>{t("Status Effect")}</InputLabel>
                      <Select
                        value={customChoices.statusEffect || ""}
                        onChange={(e) =>
                          handleCustomChoice("statusEffect", e.target.value)
                        }
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
                        onChange={(e) =>
                          handleCustomChoice("damageType", e.target.value)
                        }
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
                        onChange={(e) =>
                          handleCustomChoice("attribute", e.target.value)
                        }
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
      <Dialog
        open={choiceDialogOpen}
        onClose={() => {
          setChoiceDialogOpen(false);
          setChoiceDialogCost(0);
          setChoiceDialogResultText("");
          setChoiceDialogTitle("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {choiceDialogTitle || t("Ingredient Taste Roll Result")}
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            {choiceDialogRolls.map((roll, index) => (
              <Grid key={`${roll.id}-${roll.key}`} size={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      {t("Roll")} {roll.id}
                      {roll.taste
                        ? ` - ${getTasteLabel(roll.taste)}`
                        : ` - ${t("gourmet_taste_your_choice")}`}
                    </Typography>
                    <Grid container spacing={1} sx={{ mt: 0.5 }}>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                        }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          label={t("gourmet_ingredient_name")}
                          value={roll.name || ""}
                          onChange={(e) =>
                            setChoiceDialogRolls((prev) =>
                              prev.map((item, i) =>
                                i === index
                                  ? { ...item, name: e.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                        }}
                      >
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("gourmet_taste")}</InputLabel>
                          <Select
                            value={roll.taste || ""}
                            onChange={(e) =>
                              handleChoiceDialogTasteChange(
                                index,
                                e.target.value,
                              )
                            }
                            label={t("gourmet_taste")}
                          >
                            {getIngredientTastes(t)
                              .filter((taste) => taste.id !== 6)
                              .map((taste) => (
                                <MenuItem
                                  key={taste.id}
                                  value={taste.name
                                    .toLowerCase()
                                    .replace(/\s+/g, "")}
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
          <Button
            onClick={() => {
              setChoiceDialogOpen(false);
              setChoiceDialogCost(0);
              setChoiceDialogResultText("");
              setChoiceDialogTitle("");
            }}
          >
            {t("Cancel")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Casino />}
            onClick={handleRerollIngredientResults}
          >
            {t("Reroll")}
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmChoiceIngredients}
            disabled={choiceDialogRolls.some((roll) => !roll.taste)}
          >
            {t("gourmet_ingredient_add")}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmConfirmationDialog
        open={buyConfirmOpen}
        onClose={() => setBuyConfirmOpen(false)}
        onConfirm={handleConfirmBuyIngredient}
        title={t("Buy")}
        message={`${t("Buy")} ${shopIngredientQty}x ${shopIngredientName.trim()} ${t("for")} ${shopIngredientCost}z? (${t("Current Zenit")}: ${currentZenit}z)`}
      />
      <ConfirmConfirmationDialog
        open={randomBuyConfirmOpen}
        onClose={() => setRandomBuyConfirmOpen(false)}
        onConfirm={handleConfirmBuyRandomIngredient}
        title={t("Gamble")}
        message={`${t("Gamble")} ${randomIngredientQty}x ${t("Random Taste Ingredient")} ${t("for")} ${randomIngredientCost}z? (${t("Current Zenit")}: ${currentZenit}z)`}
      />
      <Snackbar
        open={!!shopToast}
        autoHideDuration={3500}
        onClose={() => setShopToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {shopToast ? (
          <Alert
            severity={shopToast.severity}
            variant="filled"
            onClose={() => setShopToast(null)}
            sx={{ width: "100%" }}
          >
            {shopToast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
