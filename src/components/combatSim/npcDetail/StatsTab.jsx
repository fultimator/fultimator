import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import HealthBar from "./HealthBar";
import { GiHearts } from "react-icons/gi";
import { FaStar } from "react-icons/fa";
import { t } from "../../../translation/translate";
import { useTheme } from "@mui/material/styles";

const StatsTab = ({
  selectedNPC,
  calcHP,
  calcMP,
  handleOpen,
  toggleStatusEffect,
  handleDecreaseUltima,
  handleIncreaseUltima,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const isCrisis =
    selectedNPC?.combatStats?.currentHp <= Math.floor(calcHP(selectedNPC) / 2);

  return (
    <Box>
      {/* HP Section */}
      <Box sx={{ marginTop: 2, display: "flex", alignItems: "center" }}>
        <HealthBar
          label={t("HP")}
          currentValue={selectedNPC?.combatStats?.currentHp || 0}
          maxValue={calcHP(selectedNPC)}
          startColor={isCrisis ? "#D32F2F" : "#66bb6a"}
          endColor={isCrisis ? "#B71C1C" : "#39823d"} //#39823d #388e3c
          bgColor="#333333"
          rightText={isCrisis && t("CRISIS")}
          rightTextColor={isCrisis && "#ffff00"}
        />
      </Box>

      {/* MP Section */}
      <Box sx={{ marginTop: "-0.2rem", display: "flex", alignItems: "center" }}>
        <HealthBar
          label={t("MP")}
          currentValue={selectedNPC?.combatStats?.currentMp || 0}
          maxValue={calcMP(selectedNPC)}
          startColor="#42a5f5"
          endColor="#02679e"
          bgColor="#333333"
        />
      </Box>

      <Box sx={{ marginTop: 1, display: "flex", alignItems: "center" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen("HP", selectedNPC)}
          size="small"
          sx={{
            bgcolor: isCrisis ? "#B71C1C" : "#388e3c",
            "&:hover": { bgcolor: isCrisis ? "#8b1515" : "#224d24" },
            borderRadius: 0,
            fontWeight: "bold",
            fontFamily: "'Press Start 2P', cursive",
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
            bgcolor: "#0288d1",
            "&:hover": { bgcolor: "#013652" },
            borderRadius: 0,
            fontWeight: "bold",
            fontFamily: "'Press Start 2P', cursive",
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

      {/* Status Effects */}
      <Box sx={{ marginTop: 3 }}>
        {[
          [
            { label: "Slow", color: "#1565c0" },
            { label: "Dazed", color: "#ab47bc" },
            { label: "Weak", color: "#ff7043" },
            { label: "Shaken", color: "#e8b923" },
          ],
          [
            { label: "Enraged", color: "#d32f2f" },
            { label: "Poisoned", color: "#4caf50" },
          ],
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
            {row.map(({ label, color }) => (
              <ToggleButton
                key={label}
                value={label}
                sx={{
                  flex: "1 1 16%",
                  minWidth: "80px", // Minimum width for small screens
                  justifyContent: "center",
                  padding: "5px 0",
                  backgroundColor: isDarkMode ? "#424242" : "#ECECEC", // Background color changes for dark mode
                  color: isDarkMode ? "#fff !important" : "black !important", // Text color adjusts for dark mode
                  fontWeight: "bold",
                  letterSpacing: "1.5px",
                  fontSize: {
                    xs: "0.6rem",
                    sm: "0.75rem",
                    md: "0.9rem",
                    lg: "1.2rem",
                  }, // Adjust font size for smaller screens
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    backgroundColor: isDarkMode
                      ? "#616161 !important"
                      : "#D3D3D3 !important", // Hover effect adjusts for dark mode
                    color: isDarkMode ? "#fff !important" : "black !important", // Text color on hover
                  },
                  "&.Mui-selected": {
                    backgroundColor: color,
                    color: "white !important",
                    "&:hover": {
                      backgroundColor: color + " !important",
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
                color: isDarkMode ? "#fff" : "#000", // Text color adjusts for dark mode
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
    </Box>
  );
};

export default StatsTab;
