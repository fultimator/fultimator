import { useState } from "react";
import {
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import { Add, Delete, Edit, CallMerge, Remove } from "@mui/icons-material";
import { getIngredientTastes } from "../../../../libs/gourmetCookingData";

/**
 * GourmetInventoryTab - Manage ingredient inventory
 */
export default function GourmetInventoryTab({
  formState,
  setFormState,
  t,
}) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    quantity: 1,
    taste: "",
  });

  const ingredientInventory = formState.ingredientInventory || [];

  const handleOpenAddDialog = () => {
    setEditingIndex(null);
    setFormData({
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      quantity: 1,
      taste: "",
    });
    setAddDialogOpen(true);
  };

  const handleOpenEditDialog = (index) => {
    setEditingIndex(index);
    setFormData({ ...ingredientInventory[index] });
    setAddDialogOpen(true);
  };

  const handleSaveIngredient = () => {
    if (!formData.name.trim()) {
      alert(t("Please enter an ingredient name"));
      return;
    }

    setFormState((prev) => {
      const newInventory = [...(prev.ingredientInventory || [])];
      if (editingIndex !== null) {
        newInventory[editingIndex] = formData;
      } else {
        newInventory.push(formData);
      }
      return { ...prev, ingredientInventory: newInventory };
    });

    setAddDialogOpen(false);
  };

  const handleDeleteIngredient = (index) => {
    setFormState((prev) => ({
      ...prev,
      ingredientInventory: prev.ingredientInventory.filter((_, i) => i !== index),
    }));
  };

  const handleAdjustQuantity = (index, delta) => {
    setFormState((prev) => {
      const current = [...(prev.ingredientInventory || [])];
      const source = current[index];
      if (!source) return prev;

      const nextQuantity = Math.max(0, (Number(source.quantity) || 0) + delta);
      current[index] = { ...source, quantity: nextQuantity };

      return {
        ...prev,
        ingredientInventory: current,
      };
    });
  };

  const handleCombineIngredients = () => {
    setFormState((prev) => {
      const current = prev.ingredientInventory || [];
      if (current.length <= 1) return prev;

      const combinedMap = new Map();
      const combined = [];

      current.forEach((ingredient) => {
        const normalizedName = (ingredient.name || "").trim().toLowerCase();
        const normalizedTaste = (ingredient.taste || "").trim().toLowerCase();
        const key = `${normalizedName}::${normalizedTaste}`;

        if (!combinedMap.has(key)) {
          const initial = {
            ...ingredient,
            name: (ingredient.name || "").trim(),
            quantity: Number(ingredient.quantity) || 0,
          };
          combinedMap.set(key, combined.length);
          combined.push(initial);
        } else {
          const index = combinedMap.get(key);
          combined[index] = {
            ...combined[index],
            quantity: (Number(combined[index].quantity) || 0) + (Number(ingredient.quantity) || 0),
          };
        }
      });

      return {
        ...prev,
        ingredientInventory: combined,
      };
    });
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
    <Grid container spacing={2}>
      {/* Add Ingredient Button */}
      <Grid  size={12}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAddDialog}
          >
            {t("gourmet_ingredient_add")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<CallMerge />}
            onClick={handleCombineIngredients}
          >
            {t("Combine")}
          </Button>
        </Box>
      </Grid>
      {/* Inventory Table */}
      <Grid  size={12}>
        <Typography variant="h6" gutterBottom>
          {t("gourmet_ingredient_inventory")} ({ingredientInventory.length})
        </Typography>

        {ingredientInventory.length === 0 ? (
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
                  <TableCell>{t("gourmet_ingredient_name")}</TableCell>
                  <TableCell>{t("gourmet_taste")}</TableCell>
                  <TableCell align="center">{t("gourmet_available")}</TableCell>
                  <TableCell align="center">{t("Action")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ingredientInventory.map((ingredient, idx) => (
                  <TableRow key={ingredient.id || idx} hover>
                    <TableCell>
                      <Typography variant="body2">{ingredient.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={
                          !ingredient.taste || ingredient.taste.trim() === ""
                            ? "warning.main"
                            : "text.secondary"
                        }
                      >
                        {getTasteLabel(ingredient.taste)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleAdjustQuantity(idx, -1)}
                          title={t("Decrease")}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ fontWeight: "bold", minWidth: "24px", textAlign: "center" }}>
                          {ingredient.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleAdjustQuantity(idx, 1)}
                          title={t("Increase")}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditDialog(idx)}
                          title={t("Edit")}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteIngredient(idx)}
                          title={t("Delete")}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Grid>
      {/* Add/Edit Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editingIndex !== null ? t("Edit Ingredient") : t("gourmet_ingredient_add")}
        </DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          <Grid container spacing={2}>
            <Grid  size={12}>
              <TextField
                fullWidth
                size="small"
                label={t("gourmet_ingredient_name")}
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t("e.g., Fresh Herb")}
              />
            </Grid>
            <Grid  size={12}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("gourmet_taste")}</InputLabel>
                <Select
                  value={formData.taste || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, taste: e.target.value }))
                  }
                  label={t("gourmet_taste")}
                >
                  <MenuItem value="">{t("gourmet_taste_no_assigned")}</MenuItem>
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
            <Grid  size={12}>
              <TextField
                fullWidth
                size="small"
                label={t("gourmet_available")}
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 0,
                  }))
                }
                slotProps={{
                  htmlInput: { min: 0 }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} variant="outlined">
            {t("Cancel")}
          </Button>
          <Button onClick={handleSaveIngredient} variant="contained">
            {t("Save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
