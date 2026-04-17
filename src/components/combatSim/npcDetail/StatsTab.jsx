import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";
import HealthBar from "./HealthBar";
import { GiHearts } from "react-icons/gi";
import { FaStar } from "react-icons/fa";
import { t } from "../../../translation/translate";
import { useTheme } from "@mui/material/styles";
import DefenseModifierDialog from "./DefenseModifierDialog";

const StatsTab = ({
  selectedNPC,
  calcHP,
  calcMP,
  calcDef,
  calcMDef,
  calcAttr,
  handleOpen,
  toggleStatusEffect,
  handleDecreaseUltima,
  handleIncreaseUltima,
  onUpdateDefenseModifiers,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [defenseDialogType, setDefenseDialogType] = useState(null);

  // Status effect colors
  const statusEffectColors = {
    Slow: theme.palette.info.main,
    Dazed: theme.palette.warning.main,
    Weak: theme.palette.error.light,
    Shaken: theme.palette.warning.light,
    Enraged: theme.palette.error.main,
    Poisoned: theme.palette.success.main,
  };

  const isCrisis =
    selectedNPC?.combatStats?.currentHp <= Math.floor(calcHP(selectedNPC) / 2);

  const getDefenseValue = (defenseType) => {
    const baseValue =
      defenseType === "DEF"
        ? calcDef
          ? calcDef(selectedNPC)
          : 0
        : calcMDef
          ? calcMDef(selectedNPC)
          : 0;
    const modifier =
      defenseType === "DEF"
        ? selectedNPC?.combatStats?.defenseModifier
        : selectedNPC?.combatStats?.mdefenseModifier;
    const overrideMap = selectedNPC?.combatStats?.defenseOverride || {};
    const overrideValue =
      defenseType === "MDEF" && overrideMap.MDEF === undefined
        ? overrideMap["M.DEF"]
        : overrideMap[defenseType];
    const hasOverride =
      overrideValue !== "" &&
      overrideValue !== null &&
      overrideValue !== undefined;
    if (hasOverride) {
      return Number.parseInt(overrideValue, 10) || 0;
    }

    const calculatedValue =
      modifier === null || modifier === undefined
        ? baseValue
        : baseValue + modifier;
    const attrValue =
      defenseType === "DEF"
        ? calcAttr
          ? calcAttr("Slow", "Enraged", "dexterity", selectedNPC)
          : 0
        : calcAttr
          ? calcAttr("Dazed", "Enraged", "insight", selectedNPC)
          : 0;
    return (calculatedValue || 0) + (attrValue || 0);
  };

  return (
    <Box>
      {/* HP Section */}
      <Box sx={{ marginTop: 2, display: "flex", alignItems: "center" }}>
        <HealthBar
          label={t("HP")}
          currentValue={selectedNPC?.combatStats?.currentHp || 0}
          maxValue={calcHP(selectedNPC)}
          startColor={
            isCrisis ? theme.palette.error.main : theme.palette.success.main
          }
          endColor={
            isCrisis ? theme.palette.error.dark : theme.palette.success.dark
          }
          bgColor={theme.palette.grey[isDarkMode ? 700 : 300]}
          rightText={isCrisis && t("CRISIS")}
          rightTextColor={isCrisis && theme.palette.warning.main}
        />
      </Box>

      {/* MP Section */}
      <Box sx={{ marginTop: "-0.2rem", display: "flex", alignItems: "center" }}>
        <HealthBar
          label={t("MP")}
          currentValue={selectedNPC?.combatStats?.currentMp || 0}
          maxValue={calcMP(selectedNPC)}
          startColor={theme.palette.info.main}
          endColor={theme.palette.info.dark}
          bgColor={theme.palette.grey[isDarkMode ? 700 : 300]}
        />
      </Box>

      <Box sx={{ marginTop: 1, display: "flex", alignItems: "center" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen("HP", selectedNPC)}
          size="small"
          sx={{
            bgcolor: isCrisis
              ? theme.palette.error.main
              : theme.palette.success.main,
            "&:hover": {
              bgcolor: isCrisis
                ? theme.palette.error.dark
                : theme.palette.success.dark,
            },
            borderRadius: 0,
            fontWeight: "bold",
            fontFamily: "'PT Sans Narrow', sans-serif",
            fontSize: {
              xs: "0.5rem",
              sm: "0.6rem",
              md: "0.7rem",
              lg: "0.8rem",
            },
          }}
          fullWidth
          startIcon={<GiHearts />}
        >
          {t("combat_sim_edit_hp")}
        </Button>
        <Button
          variant="contained"
          onClick={() => handleOpen("MP", selectedNPC)}
          size="small"
          sx={{
            ml: 1,
            bgcolor: theme.palette.info.main,
            "&:hover": { bgcolor: theme.palette.info.dark },
            borderRadius: 0,
            fontWeight: "bold",
            fontFamily: "'PT Sans Narrow', sans-serif",
            fontSize: {
              xs: "0.5rem",
              sm: "0.6rem",
              md: "0.7rem",
              lg: "0.8rem",
            },
          }}
          fullWidth
          startIcon={<FaStar />}
        >
          {t("combat_sim_edit_mp")}
        </Button>
      </Box>

      {/* DEF / M.DEF Section */}
      <Box sx={{ marginTop: 1, display: "flex", alignItems: "center" }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setDefenseDialogType("DEF")}
          sx={{
            borderRadius: 0,
            fontWeight: "bold",
            fontFamily: "'PT Sans Narrow', sans-serif",
            fontSize: {
              xs: "0.5rem",
              sm: "0.6rem",
              md: "0.7rem",
              lg: "0.8rem",
            },
          }}
          fullWidth
        >
          {t("DEF")}: {getDefenseValue("DEF")}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setDefenseDialogType("MDEF")}
          sx={{
            ml: 1,
            borderRadius: 0,
            fontWeight: "bold",
            fontFamily: "'PT Sans Narrow', sans-serif",
            fontSize: {
              xs: "0.5rem",
              sm: "0.6rem",
              md: "0.7rem",
              lg: "0.8rem",
            },
          }}
          fullWidth
        >
          {t("M.DEF")}: {getDefenseValue("MDEF")}
        </Button>
      </Box>

      {/* Status Effects */}
      <Box sx={{ marginTop: 3 }}>
        {[
          [
            { label: "Slow" },
            { label: "Dazed" },
            { label: "Weak" },
            { label: "Shaken" },
          ],
          [{ label: "Enraged" }, { label: "Poisoned" }],
        ].map((row, rowIndex) => (
          <ToggleButtonGroup
            key={rowIndex}
            value={selectedNPC?.combatStats?.statusEffects || []}
            exclusive
            onChange={(event, newStatusEffects) =>
              toggleStatusEffect(selectedNPC, newStatusEffects)
            }
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center", // Center the buttons
              mt: rowIndex === 0 ? 0 : 1,
            }}
          >
            {row.map(({ label }) => (
              <ToggleButton
                key={label}
                value={label}
                sx={{
                  flex: "1 1 16%",
                  minWidth: "80px",
                  justifyContent: "center",
                  padding: "5px 0",
                  backgroundColor: isDarkMode
                    ? theme.palette.grey[700]
                    : theme.palette.grey[300],
                  color: isDarkMode ? "#fff !important" : "#000 !important",
                  fontWeight: "bold",
                  letterSpacing: "1.5px",
                  fontSize: {
                    xs: "0.6rem",
                    sm: "0.75rem",
                    md: "0.9rem",
                    lg: "1.2rem",
                  },
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    backgroundColor: isDarkMode
                      ? theme.palette.grey[600]
                      : theme.palette.grey[400],
                    color: isDarkMode ? "#fff !important" : "#000 !important",
                  },
                  "&.Mui-selected": {
                    backgroundColor: statusEffectColors[label],
                    color: "white !important",
                    "&:hover": {
                      backgroundColor:
                        statusEffectColors[label] + " !important",
                      color: "white !important",
                    },
                  },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "inherit",
                    fontSize: { xs: "1rem", sm: "1.2rem" }, // Adjust typography size for small screens
                  }}
                >
                  {t(label)}
                </Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        ))}
      </Box>
      {/* Ultima Points */}
      {selectedNPC?.villain &&
        selectedNPC?.combatStats?.ultima !== undefined && (
          <Box
            sx={{
              marginTop: 3,
              padding: 2,
              display: "flex",
              flexDirection: "row", // Set flexDirection to 'row' to align items horizontally
              alignItems: "center", // Vertically center the items
              justifyContent: "center", // Center the items horizontally
              gap: 2, // Add space between elements
            }}
          >
            {/* Decrease Button */}
            <Button
              variant="contained"
              onClick={handleDecreaseUltima}
              disabled={selectedNPC?.combatStats?.ultima <= 0}
            >
              -
            </Button>

            {/* Ultima value */}
            <Typography
              variant="h4"
              sx={{
                marginBottom: 0,
                fontWeight: "bold",
                color: isDarkMode ? "#fff" : theme.palette.text.primary,
              }}
            >
              Ultima Points: {selectedNPC?.combatStats?.ultima}
            </Typography>

            {/* Increase Button */}
            <Button
              variant="contained"
              onClick={handleIncreaseUltima}
              disabled={selectedNPC?.combatStats?.ultima >= 30}
            >
              +
            </Button>
          </Box>
        )}

      <DefenseModifierDialog
        open={!!defenseDialogType}
        onClose={() => setDefenseDialogType(null)}
        defenseType={defenseDialogType}
        npc={selectedNPC}
        onUpdate={onUpdateDefenseModifiers}
        calcDef={calcDef}
        calcMDef={calcMDef}
        calcAttr={calcAttr}
      />
    </Box>
  );
};

export default StatsTab;
