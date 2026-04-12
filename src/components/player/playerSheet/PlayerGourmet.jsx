import React, { useState, useMemo } from "react";
import {
  Grid,
  Typography,
  Paper,
  IconButton,
  Button,
  Tooltip,
  Divider,
  Dialog,
  DialogContent,
  DialogActions,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import {
  Info,
  Restaurant,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import {
  getStatusEffects,
  getDamageTypes,
  getAttributes,
} from "../../../libs/gourmetCookingData";

export default function PlayerGourmet({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [selectedEffect, setSelectedEffect] = useState(null);
  const [selectedCookingSpell, setSelectedCookingSpell] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (cookingSpell, effect) => {
    setSelectedEffect(effect);
    setSelectedCookingSpell(cookingSpell);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEffect(null);
    setSelectedCookingSpell(null);
  };

  /* All cooking spells from all classes */
  const cookingSpells = useMemo(() => {
    if (!player || !player.classes) return [];
    
    return player.classes
      .flatMap((c) => (c.spells || []).map((spell) => ({ ...spell, className: c.name })))
      .filter(
        (spell) =>
          spell !== undefined &&
          spell.spellType === "cooking" &&
          (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
      )
      .sort((a, b) => (a.spellName || "").localeCompare(b.spellName || ""));
  }, [player]);

  const getEffectChoices = (effectText, t) => {
    const choices = [];
    if (!effectText || typeof effectText !== 'string') return choices;
    
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

  const renderEffectWithChoices = (effect, t) => {
    const choices = getEffectChoices(effect.effect, t);
    let displayText = effect.effect;
    
    choices.forEach(choice => {
      const selectedValue = effect.customChoices?.[choice.type];
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
    
    return <ReactMarkdown components={{ p: ({ _node, ...props }) => <span {...props} /> }}>{displayText}</ReactMarkdown>;
  };

  return (
    <>
      {cookingSpells.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Paper
            elevation={3}
            sx={{
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
              display: "flex",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                writingMode: "vertical-lr",
                textTransform: "uppercase",
                marginLeft: "-1px",
                marginRight: "10px",
                marginTop: "-1px",
                marginBottom: "-1px",
                paddingY: "10px",
                backgroundColor: primary,
                color: custom.white,
                borderRadius: "0 8px 8px 0",
                transform: "rotate(180deg)",
                fontSize: "2em",
              }}
              align="center"
            >
              {t("Gourmet")}
            </Typography>
            <Grid container spacing={1} sx={{ padding: "1em" }}>
              {cookingSpells.map((cookingSpell, csIndex) => {
                // Convert cookbook effects to array for display
                let cookbookEffectsArray = [];
                if (cookingSpell.cookbookEffects) {
                  if (Array.isArray(cookingSpell.cookbookEffects)) {
                    cookbookEffectsArray = cookingSpell.cookbookEffects;
                  } else {
                    cookbookEffectsArray = Object.entries(cookingSpell.cookbookEffects).map(([key, data]) => ({
                      ...data,
                      key: key,
                      tasteCombination: data.taste1 && data.taste2 
                        ? `${data.taste1.charAt(0).toUpperCase() + data.taste1.slice(1)} + ${data.taste2.charAt(0).toUpperCase() + data.taste2.slice(1)}`
                        : key.split('_').map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' + '),
                    }));
                  }
                }

                return (
                  <React.Fragment key={csIndex}>
                    {/* Spell Header */}
                    <Grid item xs={12}>
                      <Typography variant="h3" sx={{ fontWeight: "bold", textTransform: "uppercase", mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Restaurant fontSize="small" /> {cookingSpell.spellName || t("Gourmet")} - {t(cookingSpell.className)}
                      </Typography>
                    </Grid>

                    {/* Available Delicacies */}
                    {cookbookEffectsArray.length === 0 ? (
                      <Grid item xs={12}>
                        <Typography sx={{ fontStyle: "italic", color: "text.secondary", mb: 2 }}>
                          {t("gourmet_combination_no_defined")}
                        </Typography>
                      </Grid>
                    ) : (
                      cookbookEffectsArray.map((effect, eIndex) => (
                        <Grid
                          item
                          container
                          xs={12}
                          md={6}
                          key={`${csIndex}-${eIndex}`}
                          sx={{ display: "flex", alignItems: "stretch", mb: 1 }}
                        >
                          <Grid item xs={10} sx={{ display: "flex" }}>
                            <Typography
                              id="delicacy-left-name"
                              variant="h2"
                              sx={{
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                backgroundColor: primary,
                                padding: "5px",
                                paddingLeft: "10px",
                                color: "#fff",
                                borderRadius: "8px 0 0 8px",
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                fontSize: { xs: "0.8rem", sm: "1rem" }
                              }}
                            >
                              {effect.tasteCombination || t("gourmet_delicacy")}
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            xs={2}
                            sx={{ display: "flex", alignItems: "stretch" }}
                          >
                            <div
                              id="delicacy-right-controls"
                              style={{
                                padding: "10px",
                                backgroundColor: ternary,
                                borderRadius: "0 8px 8px 0",
                                marginRight: "15px",
                                display: "flex",
                                alignItems: "center",
                                flexDirection: "row",
                              }}
                            >
                              <Tooltip title={t("Info")}>
                                <IconButton
                                  sx={{ padding: "0px" }}
                                  onClick={() => handleOpenModal(cookingSpell, effect)}
                                >
                                  <Info />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </Grid>
                        </Grid>
                      ))
                    )}
                    
                    {/* Ingredient Inventory Summary */}
                    {cookingSpell.ingredientInventory && cookingSpell.ingredientInventory.length > 0 && (
                      <Grid item xs={12} sx={{ mt: 1, mb: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: "bold", textTransform: "uppercase", mb: 1 }}>
                          {t("gourmet_ingredient_inventory")}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {cookingSpell.ingredientInventory
                            .filter(item => item.quantity > 0)
                            .map((item, iIndex) => (
                            <Paper 
                              key={iIndex} 
                              variant="outlined" 
                              sx={{ 
                                px: 1, 
                                py: 0.5, 
                                borderRadius: '16px', 
                                backgroundColor: ternary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}
                            >
                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                {item.quantity}x
                              </Typography>
                              <Typography variant="caption">
                                {item.name}
                              </Typography>
                            </Paper>
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </React.Fragment>
                );
              })}
            </Grid>

            {/* Effect Detail Dialog */}
            <Dialog
              open={openModal}
              onClose={handleCloseModal}
              PaperProps={{ sx: { width: { xs: "90%", md: "80%" } } }}
            >
              <DialogContent>
                {selectedEffect && (
                  <>
                    <Typography variant="h4" sx={{ fontWeight: "bold", textTransform: "uppercase", mb: 1 }}>
                      {selectedEffect.tasteCombination || t("gourmet_delicacy")}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                      {selectedCookingSpell && selectedCookingSpell.spellName}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mt: 1 }}>
                      {renderEffectWithChoices(selectedEffect, t)}
                    </Box>
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button variant="contained" color="primary" onClick={handleCloseModal}>
                  OK
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </>
      )}
    </>
  );
}
