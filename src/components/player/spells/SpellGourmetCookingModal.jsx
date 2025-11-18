import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Tabs,
  Tab,
  Card,
  CardContent,
} from "@mui/material";
import { Close, Casino, Delete, Add, Remove, Kitchen, ContentCopy, Edit, ExpandLess } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import {
  getDelicacyEffects,
  getIngredientTastes,
  tasteCombinations,
  getTasteCombinations,
  rollDelicacyEffect,
  rollIngredientTaste,
  statusEffects,
  getStatusEffects,
  damageTypes,
  getDamageTypes,
  attributes as delicacyAttributes,
  getAttributes,
} from "../../../libs/gourmetCookingData";

// ReactMarkdown component configuration for consistent styling
const MarkdownComponents = {
  p: (props) => <span style={{ margin: 0, padding: 0 }} {...props} />,
  strong: (props) => <strong {...props} />,
  em: (props) => <em {...props} />
};

// Cooking Tab Component
function CookingTab({ inventory, onCook, effects, renderEffectWithChoices, allYouCanEat, usedAllYouCanEat, onUsedAllYouCanEatChange, t, onRollForCombination, selectedIngredients, setSelectedIngredients, onClearSelections }) {
  const [selectedTastesPreview, setSelectedTastesPreview] = useState([]);

  useEffect(() => {
    // Update taste preview when selected ingredients change
    const tastes = [];
    selectedIngredients
      .filter(selected => selected.amount > 0)
      .forEach(selected => {
        const ingredient = inventory.find(i => i.id === selected.id);
        if (ingredient?.taste && ingredient.taste.trim() && ingredient.taste !== "choice") {
          // Add the taste multiple times based on the amount selected
          // Capitalize for display but store as lowercase
          const displayTaste = ingredient.taste.charAt(0).toUpperCase() + ingredient.taste.slice(1).toLowerCase();
          for (let i = 0; i < selected.amount; i++) {
            tastes.push(displayTaste);
          }
        }
      });
    setSelectedTastesPreview(tastes);
  }, [selectedIngredients, inventory]);

  const updateSelectedIngredient = (id, amount) => {
    const existing = selectedIngredients.find(s => s.id === id);
    if (existing) {
      setSelectedIngredients(selectedIngredients.map(s =>
        s.id === id ? { ...s, amount } : s
      ));
    } else {
      setSelectedIngredients([...selectedIngredients, { id, amount }]);
    }
  };

  const handleCook = () => {
    const totalIngredients = selectedIngredients.filter(s => s.amount > 0).length;
    
    // Check if using All You Can Eat (4 ingredients)
    if (totalIngredients === 4 && allYouCanEat && !usedAllYouCanEat) {
      onUsedAllYouCanEatChange(true);
    }
    
    onCook(selectedIngredients);
  };

  const availableIngredients = inventory.filter(ingredient => 
    ingredient.quantity > 0
  );

  // Determine max ingredients allowed
  const maxIngredients = allYouCanEat && !usedAllYouCanEat ? 4 : 3;
  const totalSelectedIngredients = selectedIngredients.filter(s => s.amount > 0).length;

  // Find all possible 2-ingredient combinations from selected tastes
  const possibleCombinations = [];
  const addedCombinations = new Set(); // Track to avoid duplicates

  if (selectedTastesPreview.length >= 2) {
    // Generate all pairs of tastes
    for (let i = 0; i < selectedTastesPreview.length; i++) {
      for (let j = i + 1; j < selectedTastesPreview.length; j++) {
        const taste1 = selectedTastesPreview[i];
        const taste2 = selectedTastesPreview[j];
        
        // Find matching combination in taste combinations list
        const foundCombo = getTasteCombinations(t).find(combo => {
          const combinationTastes = combo.combination.split(' + ').map(t => t.trim().toLowerCase());
          const cleanTaste1 = taste1.trim().toLowerCase();
          const cleanTaste2 = taste2.trim().toLowerCase();
          
          // For exact matching, check if the combination contains exactly these two tastes
          return (
            combinationTastes.length === 2 &&
            (
              (combinationTastes[0] === cleanTaste1 && combinationTastes[1] === cleanTaste2) ||
              (combinationTastes[0] === cleanTaste2 && combinationTastes[1] === cleanTaste1)
            )
          );
        });
        
        if (foundCombo && !addedCombinations.has(foundCombo.combination)) {
          addedCombinations.add(foundCombo.combination);
          // Find corresponding cookbook effect
          const correspondingEffect = effects.find(effect => effect.tasteCombination === foundCombo.combination);
          possibleCombinations.push({
            combination: foundCombo,
            effect: correspondingEffect
          });
        }
      }
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          {t("gourmet_cooking")}
        </Typography>
        {allYouCanEat && (
          <FormControlLabel
            control={
              <Checkbox
                checked={usedAllYouCanEat}
                onChange={(e) => onUsedAllYouCanEatChange(e.target.checked)}
                size="small"
              />
            }
            label={t("gourmet_all_you_can_eat_used")}
            sx={{ fontSize: "0.875rem" }}
          />
        )}
      </Box>

      {availableIngredients.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
          {t("gourmet_no_ingredients_available")}
        </Typography>
      )}

      {availableIngredients.length > 0 && (
        <>
          {/* Ingredient Selection */}
          <Typography variant="h6" gutterBottom>
            {t("gourmet_ingredient_select_to_cook")}
          </Typography>
          
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("gourmet_ingredient")}</TableCell>
                  <TableCell>{t("gourmet_taste")}</TableCell>
                  <TableCell align="center">{t("gourmet_available")}</TableCell>
                  <TableCell align="center">{t("gourmet_use")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availableIngredients.map((ingredient) => {
                  const selected = selectedIngredients.find(s => s.id === ingredient.id);
                  const amount = selected?.amount || 0;
                  
                  return (
                    <TableRow key={ingredient.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {ingredient.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={
                          !ingredient.taste.trim() ? "warning.main" : 
                          ingredient.taste === "choice" ? "info.main" : 
                          "text.secondary"
                        }>
                          {(() => {
                            if (!ingredient.taste.trim()) {
                              return t("gourmet_taste_no_assigned");
                            }
                            if (ingredient.taste === "choice") {
                              return t("gourmet_taste_your_choice");
                            }
                            
                            // Map stored taste values to localized display names
                            const tasteMap = {
                              "bitter": t("gourmet_taste_bitter"),
                              "salty": t("gourmet_taste_salty"), 
                              "sour": t("gourmet_taste_sour"),
                              "sweet": t("gourmet_taste_sweet"),
                              "umami": t("gourmet_taste_umami")
                            };
                            
                            // Fallback to capitalize first letter if not found in map
                            return tasteMap[ingredient.taste.toLowerCase()] || 
                                  ingredient.taste.charAt(0).toUpperCase() + ingredient.taste.slice(1).toLowerCase();
                          })()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {ingredient.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center" }}>
                        <IconButton 
                          size="small" 
                          onClick={() => updateSelectedIngredient(ingredient.id, Math.max(0, amount - 1))}
                          disabled={amount <= 0 || ingredient.taste === "choice" || !ingredient.taste}
                        >
                          <Remove />
                        </IconButton>
                        <Typography variant="body2" sx={{ minWidth: "24px", textAlign: "center", fontWeight: "bold" }}>
                          {amount}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => updateSelectedIngredient(ingredient.id, Math.min(ingredient.quantity, amount + 1))}
                          disabled={
                            amount >= ingredient.quantity || 
                            (amount === 0 && totalSelectedIngredients >= maxIngredients) || 
                            ingredient.taste === "choice" || 
                            !ingredient.taste
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

          {/* Cooking Preview */}
          {selectedTastesPreview.length > 0 && (
            <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t("gourmet_cooking_preview")}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {t("gourmet_selected_tastes")}: {selectedTastesPreview.length > 0 ? selectedTastesPreview.join(" + ") : t("gourmet_no_selected_tastes")}
                </Typography>
                
                {/* Warning for ingredients without valid tastes */}
                {(() => {
                  const ingredientsWithoutValidTaste = selectedIngredients
                    .filter(selected => selected.amount > 0)
                    .map(selected => inventory.find(i => i.id === selected.id))
                    .filter(ingredient => !ingredient?.taste?.trim() || ingredient.taste === t("gourmet_taste_your_choice"));
                  
                  return ingredientsWithoutValidTaste.length > 0 && (
                    <Typography variant="body2" color="warning.main" gutterBottom sx={{ fontStyle: "italic" }}>
                      {t("Warning")}: {ingredientsWithoutValidTaste.map(i => i.name).join(", ")} {ingredientsWithoutValidTaste.length === 1 ? t("has") : t("have")} {t("no specific taste assigned and won't contribute to combinations")}.
                    </Typography>
                  );
                })()}
                
                {possibleCombinations.length > 0 ? (
                  <Box>
                    <Typography variant="body1" color="success.main" gutterBottom>
                      {possibleCombinations.length === 1 
                        ? t("gourmet_will_create_single").replace("{{combination}}", possibleCombinations[0].combination.combination)
                        : t("gourmet_will_create_multiple").replace("{{count}}", possibleCombinations.length)
                      }
                    </Typography>
                    
                    {possibleCombinations.map((combo, index) => (
                      <Box key={index} sx={{ mt: index > 0 ? 2 : 1 }}>
                        {possibleCombinations.length > 1 && (
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            {combo.combination.combination}
                          </Typography>
                        )}
                        
                        {combo.effect && combo.effect.effect.trim() && (
                          <Box sx={{ mt: 1, p: 1, backgroundColor: "action.hover", borderRadius: 1 }}>
                            <Typography variant="body2" fontWeight="bold" gutterBottom>
                              {t("gourmet_combination_effect_label")}:
                            </Typography>
                            <Typography variant="body2">
                              {renderEffectWithChoices(combo.effect)}
                            </Typography>
                          </Box>
                        )}
                        
                        {combo.effect && !combo.effect.effect.trim() && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: "italic" }}>
                            {t("gourmet_combination_no_defined")}
                          </Typography>
                        )}
                        
                        {!combo.effect && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                              {t("gourmet_combination_not_in_cookbook")}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Casino />}
                              onClick={() => onRollForCombination && onRollForCombination(combo.combination.combination)}
                            >
                              {t("gourmet_roll_d12")}
                            </Button>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : selectedTastesPreview.length >= 2 ? (
                  <Typography variant="body1" color="warning.main">
                    {t("gourmet_combination_no_valid_combo")}
                  </Typography>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    {t("gourmet_combination_select_combo_hint")}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Display Current Cookbook Effects */}
          {effects.length > 0 && (
            <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t("gourmet_cookbook_effects")}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {effects.map((effect, index) => (
                    <Box key={index} sx={{ p: 1, backgroundColor: "action.hover", borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {effect.tasteCombination}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {effect.effect.trim() ? renderEffectWithChoices(effect) : t("gourmet_combination_no_defined")}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Cook Button */}
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleCook}
              startIcon={<Kitchen />}
              disabled={totalSelectedIngredients < 2 || totalSelectedIngredients > maxIngredients}
            >
              {t("gourmet_cook_selected_ingredients")}
            </Button>
            {totalSelectedIngredients > 0 && (
              <Button
                variant="outlined"
                size="large"
                onClick={onClearSelections}
                startIcon={<Close />}
                color="secondary"
              >
                {t("Clear")}
              </Button>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}

export default function SpellGourmetCookingModal({
  open,
  onClose,
  onSave,
  cookbookEffects = [],
  ingredientInventory = [],
  player = {},
  onPlayerUpdate,
  spell = {},
}) {
  const { t } = useTranslate();
  const [effects, setEffects] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [rollResultOpen, setRollResultOpen] = useState(false);
  const [rollResult, setRollResult] = useState({ title: "", result: "", effectData: null, combinationData: null, targetCombination: null });
  const [activeTab, setActiveTab] = useState(0);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [editingEffects, setEditingEffects] = useState(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [effectToDelete, setEffectToDelete] = useState(null);
  const [bulkRollCount, setBulkRollCount] = useState(3);
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [usedAllYouCanEat, setUsedAllYouCanEat] = useState(spell?.usedAllYouCanEat || false);
  const [combinationSelectOpen, setCombinationSelectOpen] = useState(false);

  useEffect(() => {
    setUsedAllYouCanEat(spell?.usedAllYouCanEat || false);
  }, [spell?.usedAllYouCanEat]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  // Helper to generate taste combination key
  const generateTasteKey = (taste1, taste2) => {
    const t1 = taste1.toLowerCase();
    const t2 = taste2.toLowerCase();
    // Sort alphabetically for consistency
    return t1 <= t2 ? `${t1}_${t2}` : `${t2}_${t1}`;
  };

  // Helper to extract tastes from combination string
  const getTastesFromCombination = (combination) => {
    const parts = combination.split(' + ').map(t => t.trim().toLowerCase());
    return parts.length === 2 ? { taste1: parts[0], taste2: parts[1] } : null;
  };

  useEffect(() => {
    if (cookbookEffects && typeof cookbookEffects === 'object' && !Array.isArray(cookbookEffects)) {
      // New object format: { "bitter_salty": { effect: "...", taste1: "bitter", taste2: "salty", customChoices: {} } }
      const effectsArray = Object.entries(cookbookEffects).map(([key, data]) => ({
        tasteCombination: data.taste1 && data.taste2 
          ? `${data.taste1.charAt(0).toUpperCase() + data.taste1.slice(1)} + ${data.taste2.charAt(0).toUpperCase() + data.taste2.slice(1)}`
          : key.split('_').map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' + '),
        effect: data.effect,
        customChoices: data.customChoices || {},
        taste1: data.taste1,
        taste2: data.taste2,
        key: key
      }));
      setEffects(effectsArray);
    } else {
      setEffects([]);
    }
  }, [cookbookEffects]);

  useEffect(() => {
    if (ingredientInventory.length > 0) {
      setInventory([...ingredientInventory]);
    } else {
      setInventory([]);
    }
  }, [ingredientInventory]);

  useEffect(() => {
    setUsedAllYouCanEat(spell?.usedAllYouCanEat || false);
  }, [spell?.usedAllYouCanEat]);

  const handleRollDelicacyEffect = () => {
    const rolledEffect = rollDelicacyEffect(t);
    return rolledEffect;
  };

  const handleRollIngredientTaste = () => {
    return rollIngredientTaste(t);
  };

  const handleBulkRollIngredientTaste = () => {
    const rolls = [];
    for (let i = 0; i < bulkRollCount; i++) {
      rolls.push(handleRollIngredientTaste());
    }
    return rolls;
  };

  const addCombinationEffect = (combination) => {
    const existingEffect = effects.find(e => e.tasteCombination === combination.combination);
    if (!existingEffect) {
      const tastes = getTastesFromCombination(combination.combination);
      const newEffect = {
        tasteCombination: combination.combination,
        effect: "",
        customChoices: {},
        taste1: tastes?.taste1 || "",
        taste2: tastes?.taste2 || "",
        key: combination.key
      };
      setEffects([...effects, newEffect]);
    }
  };

  const removeCombinationEffect = (combination) => {
    setEffectToDelete(combination);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteEffect = () => {
    if (effectToDelete) {
      setEffects(effects.filter(e => e.tasteCombination !== effectToDelete));
      setDeleteConfirmOpen(false);
      setEffectToDelete(null);
    }
  };

  const cancelDeleteEffect = () => {
    setDeleteConfirmOpen(false);
    setEffectToDelete(null);
  };

  const updateEffectText = (combination, text) => {
    setEffects(effects.map(e => 
      e.tasteCombination === combination 
        ? { ...e, effect: text }
        : e
    ));
  };

  const updateCustomChoice = (combination, choiceType, value) => {
    setEffects(effects.map(e => 
      e.tasteCombination === combination 
        ? { ...e, customChoices: { ...e.customChoices, [choiceType]: value } }
        : e
    ));
  };

  const handleSave = () => {
    // Convert effects array to object format for storage
    const effectsObject = {};
    effects.forEach(effect => {
      const tastes = getTastesFromCombination(effect.tasteCombination);
      if (tastes) {
        const key = generateTasteKey(tastes.taste1, tastes.taste2);
        effectsObject[key] = {
          taste1: tastes.taste1,
          taste2: tastes.taste2,
          effect: effect.effect,
          customChoices: effect.customChoices || {}
        };
      }
    });
    
    onSave(effectsObject, inventory, { usedAllYouCanEat });
  };

  // Ingredient inventory management functions
  const addIngredient = () => {
    if (newIngredientName.trim()) {
      const newIngredient = {
        id: Date.now(),
        name: newIngredientName.trim(),
        quantity: 1,
        taste: "",
      };
      setInventory([...inventory, newIngredient]);
      setNewIngredientName("");
    }
  };

  const removeIngredient = (id) => {
    setInventory(inventory.filter(ingredient => ingredient.id !== id));
  };

  const addRolledIngredientToInventory = () => {
    if (rollResult.combinationData) {
      const rolledIngredient = rollResult.combinationData;
      const newIngredient = {
        id: Date.now(),
        name: `${rolledIngredient.name}`,
        quantity: 1,
        taste: rolledIngredient.name.toLowerCase(),
      };
      setInventory([...inventory, newIngredient]);
      setRollResultOpen(false);
    }
  };

  const addAllBulkRolledIngredientsToInventory = () => {
    if (rollResult.bulkResults) {
      const newIngredients = rollResult.bulkResults.map((ingredient, index) => ({
        id: Date.now() + index,
        name: `${ingredient.name}`,
        quantity: 1,
        taste: ingredient.name.toLowerCase(),
      }));
      setInventory([...inventory, ...newIngredients]);
      setRollResultOpen(false);
    }
  };

  // Shop functions
  const buyRandomIngredient = () => {
    if ((player?.info?.zenit || 0) >= 10) {
      const randomTaste = handleRollIngredientTaste();
      const newIngredient = {
        id: Date.now(),
        name: `${randomTaste.name}`,
        quantity: 1,
        taste: randomTaste.name.toLowerCase(),
      };
      setInventory([...inventory, newIngredient]);
      
      if (onPlayerUpdate && player) {
        const updatedPlayer = {
          ...player,
          info: {
            ...player.info,
            zenit: (player.info?.zenit || 0) - 10
          }
        };
        onPlayerUpdate(updatedPlayer);
      }
    }
  };

  const buyChosenIngredient = (taste) => {
    if ((player?.info?.zenit || 0) >= 20) {
      const newIngredient = {
        id: Date.now(),
        name: `${taste}`,
        quantity: 1,
        taste: taste.toLowerCase(),
      };
      setInventory([...inventory, newIngredient]);
      
      if (onPlayerUpdate && player) {
        const updatedPlayer = {
          ...player,
          info: {
            ...player.info,
            zenit: (player.info?.zenit || 0) - 20
          }
        };
        onPlayerUpdate(updatedPlayer);
      }
    }
  };


  const updateIngredientTaste = (id, taste) => {
    setInventory(inventory.map(ingredient => 
      ingredient.id === id 
        ? { ...ingredient, taste: taste.toLowerCase() }
        : ingredient
    ));
  };

  const updateIngredientName = (id, name) => {
    setInventory(inventory.map(ingredient => 
      ingredient.id === id 
        ? { ...ingredient, name }
        : ingredient
    ));
  };

  const cookWithIngredients = (cookingSelectedIngredients) => {
    // Remove used ingredients from inventory
    const updatedInventory = inventory.map(ingredient => {
      const usedAmount = cookingSelectedIngredients.find(selected => selected.id === ingredient.id)?.amount || 0;
      return { ...ingredient, quantity: Math.max(0, ingredient.quantity - usedAmount) };
    }).filter(ingredient => ingredient.quantity > 0);
    
    setInventory(updatedInventory);
    
    // Generate combination effect based on selected ingredients
    const tastes = cookingSelectedIngredients
      .filter(selected => selected.amount > 0)
      .map(selected => {
        const ingredient = inventory.find(i => i.id === selected.id);
        return ingredient?.taste ? ingredient.taste.toLowerCase() : null;
      })
      .filter(taste => taste && taste.trim())
      .slice(0, 2); // Maximum 2 tastes for combination

    if (tastes.length === 2) {
      const combination = getTasteCombinations(t).find(combo => {
        // Parse tastes from combination string (e.g., "Bitter + Sweet" -> ["Bitter", "Sweet"])
        const combinationTastes = combo.combination.split(' + ').map(t => t.trim().toLowerCase());
        return (
          (combinationTastes.includes(tastes[0]) && combinationTastes.includes(tastes[1])) ||
          (combinationTastes.includes(tastes[1]) && combinationTastes.includes(tastes[0]))
        );
      });
      
      if (combination) {
        const tastesData = getTastesFromCombination(combination.combination);
        const existingEffect = effects.find(e => e.tasteCombination === combination.combination);
        
        if (!existingEffect) {
          const newEffect = {
            tasteCombination: combination.combination,
            effect: "",
            customChoices: {},
            taste1: tastesData?.taste1 || "",
            taste2: tastesData?.taste2 || "",
            key: combination.key
          };
          setEffects([...effects, newEffect]);
        }
        
        setActiveTab(0); // Switch back to cookbook tab
      }
    }
    
    // Clear cooking selections after cooking
    setSelectedIngredients([]);
  };

  // Copy roll result to cookbook
  // Handle combination selection for standalone rolls
  const handleCombinationSelect = (combination) => {
    if (rollResult.effectData) {
      // Check if combination already has an effect
      const existingEffect = effects.find(e => e.tasteCombination === combination);
      
      if (existingEffect) {
        // Show confirmation dialog for overwrite
        if (window.confirm(
          `${t("gourmet_delete_effect_confirm_1")}:\n\n"${existingEffect.effect}"\n\n${t("gourmet_delete_effect_confirm_2")}?`
        )) {
          // Update existing effect
          updateEffectText(combination, `#${rollResult.effectData.id} - ${rollResult.effectData.effect}`);
          setCombinationSelectOpen(false);
          setRollResultOpen(false);
        }
      } else {
        // Add new effect
        const tastes = getTastesFromCombination(combination);
        const key = tastes ? generateTasteKey(tastes.taste1, tastes.taste2) : null;
        
        const newEffect = {
          tasteCombination: combination,
          effect: `#${rollResult.effectData.id} - ${rollResult.effectData.effect}`,
          customChoices: {},
          taste1: tastes?.taste1 || "",
          taste2: tastes?.taste2 || "",
          key: key
        };
        setEffects([...effects, newEffect]);
        setCombinationSelectOpen(false);
        setRollResultOpen(false);
      }
    }
  };

  const copyRollToCookbook = () => {
    if (rollResult.effectData) {
      if (rollResult.targetCombination) {
        // Check if the combination already exists in effects
        const existingEffect = effects.find(e => e.tasteCombination === rollResult.targetCombination);
        if (existingEffect) {
          // Update existing effect with rolled result
          updateEffectText(rollResult.targetCombination, `#${rollResult.effectData.id} - ${rollResult.effectData.effect}`);
        } else {
          // Add new effect for this combination
          const tastes = getTastesFromCombination(rollResult.targetCombination);
          const key = tastes ? generateTasteKey(tastes.taste1, tastes.taste2) : null;
          const newEffect = {
            tasteCombination: rollResult.targetCombination,
            effect: `#${rollResult.effectData.id} - ${rollResult.effectData.effect}`,
            customChoices: {},
            taste1: tastes?.taste1 || "",
            taste2: tastes?.taste2 || "",
            key: key
          };
          setEffects([...effects, newEffect]);
        }
        setRollResultOpen(false);
      } else {
        // Open combination selection dialog for standalone rolls
        setCombinationSelectOpen(true);
      }
    } else if (rollResult.combinationData) {
      // For taste combinations, just add it
      addCombinationEffect(rollResult.combinationData);
      setRollResultOpen(false);
      setActiveTab(0); // Switch to cookbook tab
    }
  };

  // Reroll current result
  const rerollResult = () => {
    if (rollResult.effectData) {
      // Reroll delicacy effect
      const roll = handleRollDelicacyEffect();
      setRollResult(prev => ({
        ...prev,
        result: `${t("gourmet_ingredient_roll_result")}: #${roll.id} - ${roll.effect}`,
        effectData: roll
      }));
    } else if (rollResult.combinationData) {
      // Reroll ingredient taste
      const roll = handleRollIngredientTaste();
      setRollResult(prev => ({
        ...prev,
        result: `${t("gourmet_ingredient_roll_result")}: ${roll.id} - ${roll.name}`,
        combinationData: roll
      }));
    } else if (rollResult.bulkResults) {
      // Reroll bulk ingredient tastes
      const rolls = handleBulkRollIngredientTaste();
      const resultText = rolls.map((roll, index) => `${index + 1}. ${roll.id} - ${roll.name}`).join('\n');
      setRollResult(prev => ({
        ...prev,
        result: `${t("gourmet_ingredient_roll_result")} ${bulkRollCount} ${t("times")}:\n${resultText}`,
        bulkResults: rolls
      }));
    }
  };

  // Edit mode functions for cookbook effects
  const toggleEditMode = (combination) => {
    setEditingEffects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(combination)) {
        newSet.delete(combination);
      } else {
        newSet.add(combination);
      }
      return newSet;
    });
  };

  const isEditing = (combination) => {
    return editingEffects.has(combination);
  };

  const getAvailableCombinations = () => {
    return getTasteCombinations(t).filter(combo => 
      !effects.some(e => e.tasteCombination === combo.combination)
    );
  };

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

  const renderEffectWithChoices = (effect) => {
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

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "95%",
          maxWidth: "xl",
          height: "90vh",
        },
      }}
    >
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("gourmet_cookbook_management")}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>
      
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={t("gourmet_cookbook_effects")} />
        <Tab label={t("gourmet_ingredient_inventory")} />
        <Tab label={t("gourmet_cooking")} />
      </Tabs>
      
      <DialogContent sx={{ overflow: "auto" }}>
        {/* Tab 0: Cookbook Effects */}
        {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Left Column - Reference Tables */}
          <Grid item xs={12} md={6}>
            {/* Delicacy Effects Table */}
            <Typography variant="h5" gutterBottom fontWeight="bold">
              {t("gourmet_delicacy_effect_label")}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Casino />}
                onClick={() => {
                  const roll = handleRollDelicacyEffect();
                  setRollResult({
                    title: t("gourmet_effect_roll_result"),
                    result: `${t("gourmet_effect_roll_result_label")}: #${roll.id} - ${roll.effect}`,
                    effectData: roll,
                    combinationData: null,
                    targetCombination: null
                  });
                  setRollResultOpen(true);
                }}
              >
                {t("gourmet_roll_d12")}
              </Button>
            </Box>
            
            <TableContainer component={Paper} sx={{ maxHeight: 400, mb: 3 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="10%"><strong>{t("Roll")}</strong></TableCell>
                    <TableCell width="90%"><strong>{t("Effect")}</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getDelicacyEffects(t).map((effect) => (
                    <TableRow key={effect.id}>
                      <TableCell>{effect.id}</TableCell>
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

            {/* Ingredient Tastes Table */}
            <Typography variant="h5" gutterBottom fontWeight="bold">
              {t("gourmet_details")}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t("gourmet_details_1")}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Casino />}
                onClick={() => {
                  const roll = handleRollIngredientTaste();
                  setRollResult({
                    title: t("gourmet_ingredient_roll_result"),
                    result: `${t("gourmet_effect_roll_result_label")}: ${roll.id} - ${roll.name}`,
                    effectData: null,
                    combinationData: roll,
                    targetCombination: null
                  });
                  setRollResultOpen(true);
                }}
              >
                {t("gourmet_roll_d6")}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Casino />}
                onClick={() => {
                  const rolls = handleBulkRollIngredientTaste();
                  const resultText = rolls.map((roll, index) => `${index + 1}. ${roll.id} - ${roll.name}`).join('\n');
                  setRollResult({
                    title: t("gourmet_ingredient_bulk_roll_result"),
                    result: `${t("gourmet_ingredient_roll_result")} ${bulkRollCount} ${t("times")}:\n${resultText}`,
                    effectData: null,
                    combinationData: null,
                    bulkResults: rolls,
                    targetCombination: null
                  });
                  setRollResultOpen(true);
                }}
              >
                {t("gourmet_bulk_roll_d6")}
              </Button>
              
              <TextField
                size="small"
                type="number"
                value={bulkRollCount}
                onChange={(e) => setBulkRollCount(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1, max: 20, style: { textAlign: 'center', width: '60px' } }}
                sx={{ maxWidth: '80px' }}
                label={t("Count")}
              />
              
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setShopModalOpen(true)}
              >
                {t("Shop")}
              </Button>
            </Box>
            
            <TableContainer component={Paper} sx={{ maxHeight: 200, mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="20%"><strong>{t("Roll")}</strong></TableCell>
                    <TableCell width="80%"><strong>{t("gourmet_ingredient_taste_label")}</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getIngredientTastes(t).map((taste) => (
                    <TableRow key={taste.id}>
                      <TableCell>{taste.id}</TableCell>
                      <TableCell>{taste.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Available Combinations */}
            <Typography variant="h6" gutterBottom fontWeight="bold">
              {t("Available Taste Combinations")}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {getAvailableCombinations().map((combo) => (
                <Chip
                  key={combo.key}
                  label={combo.combination}
                  onClick={() => addCombinationEffect(combo)}
                  color="primary"
                  variant="outlined"
                  sx={{ cursor: "pointer" }}
                />
              ))}
            </Box>
          </Grid>

          {/* Right Column - Cookbook Effects */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              {t("gourmet_cookbook_effects")} ({effects.length}/15)
            </Typography>
            
            {effects.map((effect, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                {/* Compact Preview Mode */}
                {!isEditing(effect.tasteCombination) && (
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {effect.tasteCombination}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => toggleEditMode(effect.tasteCombination)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeCombinationEffect(effect.tasteCombination)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: effect.effect.trim() ? "normal" : "italic" }}>
                      {effect.effect.trim() ? renderEffectWithChoices(effect) : t("gourmet_combination_no_defined")}
                    </Typography>
                  </Box>
                )}

                {/* Expanded Edit Mode */}
                {isEditing(effect.tasteCombination) && (
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {effect.tasteCombination}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => toggleEditMode(effect.tasteCombination)}
                          color="primary"
                        >
                          <ExpandLess />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeCombinationEffect(effect.tasteCombination)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        value={effect.effect}
                        onChange={(e) => updateEffectText(effect.tasteCombination, e.target.value)}
                        placeholder={t("gourmet_combination_combo_placeholder")}
                      />
                      {!effect.effect.trim() && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Casino />}
                          onClick={() => {
                            const roll = handleRollDelicacyEffect();
                            setRollResult({
                              title: t("gourmet_effect_roll_result"),
                              result: `${t("gourmet_ingredient_roll_result")}: #${roll.id} - ${roll.effect}`,
                              effectData: roll,
                              combinationData: null,
                              targetCombination: effect.tasteCombination
                            });
                            setRollResultOpen(true);
                          }}
                          sx={{ minWidth: '100px', height: 'fit-content' }}
                        >
                          {t("Roll")}
                        </Button>
                      )}
                    </Box>
                    
                    {/* Custom Choice Dropdowns */}
                    {getEffectChoices(effect.effect, t).map((choice, choiceIndex) => (
                      <FormControl fullWidth sx={{ mb: 1 }} key={choiceIndex}>
                        <InputLabel>
                          {choice.type === "statusEffect" ? t("Status Effect") :
                           choice.type === "damageType" ? t("Damage Type") :
                           choice.type === "attribute" ? t("Attribute") : choice.type}
                        </InputLabel>
                        <Select
                          value={effect.customChoices[choice.type] || ""}
                          onChange={(e) => updateCustomChoice(effect.tasteCombination, choice.type, e.target.value)}
                          label={
                            choice.type === "statusEffect" ? t("Status Effect") :
                            choice.type === "damageType" ? t("Damage Type") :
                            choice.type === "attribute" ? t("Attribute") : choice.type
                          }
                        >
                          {choice.options.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ))}
                    
                    {/* Preview of final effect */}
                    {effect.effect && (
                      <Box sx={{ mt: 1, p: 1, backgroundColor: "action.hover", borderRadius: 1 }}>
                        <Typography variant="body2" fontStyle="italic">
                          <strong>{t("Preview")}:</strong> {renderEffectWithChoices(effect)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            ))}
            
            {effects.length === 0 && (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
                {t("No cookbook effects defined yet. Click on taste combinations to add them.")}
              </Typography>
            )}
          </Grid>
        </Grid>
        )}

        {/* Tab 1: Ingredient Inventory */}
        {activeTab === 1 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              {t("gourmet_ingredient_inventory")}
            </Typography>
            
            {/* Add New Ingredient */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                label={t("gourmet_ingredient_name")}
                value={newIngredientName}
                onChange={(e) => setNewIngredientName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                sx={{ flexGrow: 1 }}
              />
              <Button 
                variant="contained" 
                onClick={addIngredient}
                startIcon={<Add />}
                disabled={!newIngredientName.trim()}
              >
                {t("gourmet_ingredient_add")}
              </Button>
            </Box>

            {/* Inventory Table */}
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("gourmet_ingredient_name")}</TableCell>
                    <TableCell align="center">{t("Quantity")}</TableCell>
                    <TableCell>{t("gourmet_ingredient_taste_label")}</TableCell>
                    <TableCell align="center">{t("Actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory.map((ingredient) => (
                    <TableRow key={ingredient.id} hover>
                      <TableCell>
                        <TextField
                          size="small"
                          value={ingredient.name}
                          onChange={(e) => updateIngredientName(ingredient.id, e.target.value)}
                          variant="standard"
                          sx={{ 
                            '& .MuiInput-root': { 
                              fontSize: '0.875rem',
                              fontWeight: 'medium'
                            },
                            '& .MuiInput-root:before': { 
                              borderBottom: 'none' 
                            },
                            '& .MuiInput-root:hover:not(.Mui-disabled):before': { 
                              borderBottom: '1px solid rgba(0, 0, 0, 0.42)' 
                            }
                          }}
                          fullWidth
                        />
                      </TableCell>
                      
                      <TableCell align="center">
                        <TextField
                          size="small"
                          type="number"
                          value={ingredient.quantity}
                          onChange={(e) => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setInventory(inventory.map(ing => 
                              ing.id === ingredient.id ? { ...ing, quantity: value } : ing
                            ));
                          }}
                          inputProps={{ 
                            min: 0, 
                            style: { textAlign: 'center', width: '60px' }
                          }}
                          sx={{ maxWidth: '80px' }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={ingredient.taste || ""}
                            onChange={(e) => updateIngredientTaste(ingredient.id, e.target.value)}
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>{t("gourmet_taste_no_assigned")}</em>
                            </MenuItem>
                            {getIngredientTastes(t)
                              .filter(taste => taste.name !== t("gourmet_taste_your_choice"))
                              .map((taste) => (
                                <MenuItem key={taste.id} value={taste.name.toLowerCase()}>
                                  {taste.name}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => removeIngredient(ingredient.id)}
                          title={t("gourmet_ingredient_remove")}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {inventory.length === 0 && (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
                {t("gourmet_no_ingredients_available")}
              </Typography>
            )}
          </Box>
        )}

        {/* Tab 2: Cooking */}
        {activeTab === 2 && (
          <CookingTab 
            inventory={inventory} 
            onCook={cookWithIngredients} 
            effects={effects}
            renderEffectWithChoices={renderEffectWithChoices}
            allYouCanEat={spell?.allYouCanEat || false}
            usedAllYouCanEat={usedAllYouCanEat}
            onUsedAllYouCanEatChange={(used) => {
              setUsedAllYouCanEat(used);
              // Update the spell data through onSave callback
              onSave(effects, inventory, { usedAllYouCanEat: used });
            }}
            t={t}
            selectedIngredients={selectedIngredients}
            setSelectedIngredients={setSelectedIngredients}
            onClearSelections={() => setSelectedIngredients([])}
            onRollForCombination={(combinationName) => {
              const roll = handleRollDelicacyEffect();
              setRollResult({
                title: t("gourmet_effect_roll_result"),
                result: `${t("gourmet_ingredient_roll_result")}: #${roll.id} - ${roll.effect}`,
                effectData: roll,
                combinationData: null,
                targetCombination: combinationName
              });
              setRollResultOpen(true);
            }}
          />
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          {t("Cancel")}
        </Button>
        <Button onClick={handleSave} variant="contained">
          {t("Save Cookbook")}
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Roll Result Dialog */}
    <Dialog
      open={rollResultOpen}
      onClose={() => setRollResultOpen(false)}
      PaperProps={{
        sx: {
          width: "400px",
          maxWidth: "90vw",
        },
      }}
    >
      <DialogTitle variant="h5" sx={{ fontWeight: "bold" }}>
        {rollResult.title}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <ReactMarkdown components={MarkdownComponents}>
            {rollResult.result}
          </ReactMarkdown>
        </Box>
        {rollResult.effectData && getAvailableCombinations().length === 0 && (
          <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
            {t("gourmet_max_combination_effects")}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button onClick={() => setRollResultOpen(false)} variant="outlined">
          {t("Close")}
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {(rollResult.effectData || rollResult.combinationData || rollResult.bulkResults) && (
            <Button 
              onClick={rerollResult} 
              variant="outlined"
              startIcon={<Casino />}
            >
              {t("Reroll")}
            </Button>
          )}
          {rollResult.effectData && (
            <Button 
              onClick={copyRollToCookbook} 
              variant="contained"
              startIcon={<ContentCopy />}
              disabled={!rollResult.targetCombination && getAvailableCombinations().length === 0}
            >
              {t("gourmet_copy_to_cookbook")}
            </Button>
          )}
          {rollResult.combinationData && (
            <Button 
              onClick={addRolledIngredientToInventory} 
              variant="contained"
              startIcon={<Add />}
            >
              {t("gourmet_add_to_inventory")}
            </Button>
          )}
          {rollResult.bulkResults && (
            <Button 
              onClick={addAllBulkRolledIngredientsToInventory} 
              variant="contained"
              startIcon={<Add />}
            >
              {t("gourmet_add_all_to_inventory")} ({rollResult.bulkResults.length})
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <Dialog
      open={deleteConfirmOpen}
      onClose={cancelDeleteEffect}
      PaperProps={{
        sx: {
          width: "400px",
          maxWidth: "90vw",
        },
      }}
    >
      <DialogTitle variant="h5" sx={{ fontWeight: "bold" }}>
        {t("Confirm Delete")}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mt: 1 }}>
          {t("gourmet_remove cookbook_effect_hint")} <strong>{effectToDelete}</strong>?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t("This action cannot be undone.")}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelDeleteEffect} variant="outlined">
          {t("Cancel")}
        </Button>
        <Button onClick={confirmDeleteEffect} variant="contained" color="error">
          {t("Delete")}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Shop Modal */}
    <Dialog
      open={shopModalOpen}
      onClose={() => setShopModalOpen(false)}
      PaperProps={{
        sx: {
          width: "500px",
          maxWidth: "90vw",
        },
      }}
    >
      <DialogTitle variant="h5" sx={{ fontWeight: "bold" }}>
        {t("gourmet_shop")}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t("Zenit")}: <strong>{player?.info?.zenit || 0}</strong>
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          {/* Random Ingredient */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t("gourmet_shop_random_ingredient")}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t("gourmet_shop_buy_random_hint")}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                10 {t("Zenit")}
              </Typography>
              <Button
                variant="contained"
                onClick={buyRandomIngredient}
                disabled={(player?.info?.zenit || 0) < 10}
              >
                {t("gourmet_shop_buy_random")}
              </Button>
            </Box>
          </Paper>

          {/* Choose Taste */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t("gourmet_shop_choose_ingredient")}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t("gourmet_shop_buy_choose_hint")}
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ mb: 2 }}>
              20 {t("Zenit")}
            </Typography>
            
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {getIngredientTastes(t)
                .filter(taste => taste.name !== t("gourmet_taste_your_choice"))
                .map((taste) => {
                  // Count how many ingredients of this taste the player has
                  const currentAmount = inventory.filter(ingredient => 
                    ingredient.taste && ingredient.taste.toLowerCase() === taste.name.toLowerCase() && ingredient.quantity > 0
                  ).reduce((total, ingredient) => total + ingredient.quantity, 0);
                  
                  return (
                    <Button
                      key={taste.id}
                      variant="outlined"
                      size="small"
                      onClick={() => buyChosenIngredient(taste.name)}
                      disabled={(player?.info?.zenit || 0) < 20}
                      sx={{ mb: 1, minWidth: '120px' }}
                    >
                      {taste.name} ({currentAmount})
                    </Button>
                  );
                })}
            </Box>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShopModalOpen(false)} variant="outlined">
          {t("Close")}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Combination Selection Dialog */}
    <Dialog
      open={combinationSelectOpen}
      onClose={() => setCombinationSelectOpen(false)}
      PaperProps={{
        sx: {
          width: "500px",
          maxWidth: "90vw",
        },
      }}
    >
      <DialogTitle variant="h5" sx={{ fontWeight: "bold" }}>
        {t("gourmet_select_combination")}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t("gourmet_select_combination_hint")}
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          {rollResult.effectData && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: "action.hover", borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                {t("gourmet_effect_to_copy")}:
              </Typography>
              <ReactMarkdown components={MarkdownComponents}>
                {`#${rollResult.effectData.id} - ${rollResult.effectData.effect}`}
              </ReactMarkdown>
            </Box>
          )}
          
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: "300px", overflowY: "auto" }}>
            {getTasteCombinations(t).map((combo) => {
              const existingEffect = effects.find(e => e.tasteCombination === combo.combination);
              const hasEffect = !!existingEffect;
              
              return (
                <Button
                  key={combo.key}
                  variant="outlined"
                  onClick={() => handleCombinationSelect(combo.combination)}
                  sx={{ 
                    justifyContent: "flex-start",
                    textAlign: "left",
                    p: 1.5,
                    backgroundColor: hasEffect ? 'action.hover' : 'transparent',
                    borderColor: hasEffect ? 'warning.main' : 'divider',
                    '&:hover': {
                      backgroundColor: hasEffect ? 'warning.light' : 'action.hover',
                    }
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: hasEffect ? 0.5 : 0 }}>
                      <Typography sx={{ fontWeight: hasEffect ? 'bold' : 'normal' }}>
                        {combo.combination}
                      </Typography>
                      {hasEffect && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            backgroundColor: 'warning.main', 
                            color: 'warning.contrastText', 
                            px: 0.5, 
                            py: 0.25, 
                            borderRadius: 0.5,
                            fontSize: '0.7rem'
                          }}
                        >
                          {t("gourmet_has_effect")}
                        </Typography>
                      )}
                    </Box>
                    {hasEffect && existingEffect.effect && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          fontSize: '0.75rem',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%'
                        }}
                      >
                        {existingEffect.effect.substring(0, 60)}...
                      </Typography>
                    )}
                  </Box>
                </Button>
              );
            })}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCombinationSelectOpen(false)} variant="outlined">
          {t("Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}
