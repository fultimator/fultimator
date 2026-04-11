import { Grid, Button, Typography, Box, IconButton, Tooltip } from "@mui/material";
import { Add, Search } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";

/**
 * ContentSection - Reusable base component for managing spell sub-items (gifts, dances, magiseeds, etc.)
 *
 * Props:
 *   formState: object - shared form state from UnifiedSpellModal
 *   setFormState: (newState) => void - update shared state
 *   t: (key) => string - translate function
 *   itemsArrayName: string - name of array in formState (e.g., "magiseeds", "gifts", "dances")
 *   itemComponent: React.Component - component to render each item editor
 *   itemComponentProps: object - extra props for item component
 *   onAddItem: () => object - function that returns new blank item
 *   addButtonLabel: string - translation key for add button
 *   emptyStateLabel: string - translation key for empty state message
 *   presetAddButtons?: Array - optional preset buttons [{ label, onClick }]
 *   onBrowseCompendium?: () => void - optional callback to open compendium viewer
 */
export default function ContentSection({
  formState,
  setFormState,
  t,
  itemsArrayName,
  itemComponent: ItemComponent,
  itemComponentProps = {},
  onAddItem,
  addButtonLabel,
  emptyStateLabel,
  presetAddButtons = [],
  onBrowseCompendium,
}) {
  const items = formState[itemsArrayName] || [];
  const markdownComponents = {
    p: ({ ...props }) => <p style={{ margin: 0 }} {...props} />,
  };

  const handleAddItem = () => {
    const newItem = onAddItem ? onAddItem() : {};
    setFormState((prev) => ({
      ...prev,
      [itemsArrayName]: [...(prev[itemsArrayName] || []), newItem],
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormState((prev) => {
      const newItems = [...(prev[itemsArrayName] || [])];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };
      return {
        ...prev,
        [itemsArrayName]: newItems,
      };
    });
  };

  const handleDeleteItem = (index) => {
    setFormState((prev) => ({
      ...prev,
      [itemsArrayName]: prev[itemsArrayName].filter((_, i) => i !== index),
    }));
  };

  const handleCloneItem = (index, clonedItem) => {
    setFormState((prev) => {
      const currentItems = prev[itemsArrayName] || [];
      if (index < 0 || index >= currentItems.length) return prev;

      const source = clonedItem ?? currentItems[index];
      const cloned =
        typeof structuredClone === "function"
          ? structuredClone(source)
          : JSON.parse(JSON.stringify(source));

      const updatedItems = [...currentItems];
      updatedItems.splice(index + 1, 0, cloned);

      return {
        ...prev,
        [itemsArrayName]: updatedItems,
      };
    });
  };

  return (
    <Grid container spacing={2}>
      {/* Add Buttons */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t(addButtonLabel)}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2, alignItems: "center" }}>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {onBrowseCompendium && (
              <Tooltip title={t("Browse Compendium")}>
                <IconButton
                  size="small"
                  onClick={onBrowseCompendium}
                  sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
                >
                  <Search fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddItem}
              sx={{ borderRadius: 2 }}
            >
              {t(addButtonLabel)}
            </Button>

          </Box>
          {presetAddButtons.map((presetBtn) => (
            <Button
              key={presetBtn.label}
              variant="outlined"
              startIcon={<Add />}
              onClick={() => presetBtn.onClick(setFormState)}
              sx={{ borderRadius: 2 }}
            >
              {presetBtn.label}
            </Button>
          ))}
        </Box>
      </Grid>

      {/* Items List */}
      {items.length === 0 ? (
        <Grid item xs={12}>
          <Typography
            sx={{
              padding: "20px",
              textAlign: "center",
              color: "text.secondary",
              fontStyle: "italic",
              border: "1px dashed #ccc",
              borderRadius: "4px",
            }}
          >
            <ReactMarkdown components={markdownComponents}>
              {t(emptyStateLabel)}
            </ReactMarkdown>
          </Typography>
        </Grid>
      ) : (
        items.map((item, index) => (
          <Grid item xs={12} key={index}>
            <ItemComponent
              {...itemComponentProps}
              item={item}
              itemIndex={index}
              onItemChange={handleItemChange}
              onDeleteItem={handleDeleteItem}
              onCloneItem={handleCloneItem}
              t={t}
            />
          </Grid>
        ))
      )}
    </Grid>
  );
}
