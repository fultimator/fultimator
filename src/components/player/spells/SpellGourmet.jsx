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
import { useCustomTheme } from "../../../hooks/useCustomTheme";

export default function SpellGourmet({ spell, onEdit, onEditCooking, isEditMode }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  // Memoize spell data to prevent unnecessary re-renders
  const spellData = useMemo(() => {
    if (!spell) return null;
    
    return {
      name: spell.spellName || "Unnamed Cooking Spell",
      cookbookEffects: spell.cookbookEffects || [],
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
              key={`effect-${index}`}
              sx={{
                background: theme.ternary,
                borderTop: `1px solid white`,
                borderBottom: `1px solid white`,
                px: 2,
                py: 0.5,
                display: "flex",
                gap: 2,
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
                  {effect.effect || "—"}
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