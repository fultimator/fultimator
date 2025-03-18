import React from "react";
import {
  Typography,
  Box,
  Button,
  TextField,
  Icon,
  IconButton,
} from "@mui/material";
import { Edit, ArrowRight, ArrowLeft, Save } from "@mui/icons-material";
import { t } from "../../translation/translate";
import { useTheme } from "@mui/material/styles";

export default function BattleHeader({
  encounterName,
  isEditing,
  handleEditClick,
  handleEncounterNameChange,
  handleBlur,
  handleKeyPress,
  handleSaveState,
  timeAgo,
  round,
  handleIncreaseRound,
  handleDecreaseRound,
  isMobile,
  isDifferentUser
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        bgcolor: isDarkMode ? "#333333" : "#ffffff",
        paddingX: 2,
        paddingY: 1,
        borderRadius: 3,
        position: "relative", // Ensure absolute positioning works for the round counter
      }}
    >
      {/* Encounter Name Section */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {isEditing ? (
          <TextField
            value={encounterName}
            onChange={handleEncounterNameChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyPress}
            autoFocus
            variant="standard"
            error={encounterName.trim() === ""}
            helperText={
              encounterName.trim() === ""
                ? t("combat_sim_empty_name_warning")
                : ""
            }
            inputProps={{ maxLength: 100 }}
          />
        ) : (
          <>
            <Typography
              variant={isMobile ? "h6" : "h4"}
              onClick={handleEditClick}
              sx={{
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {encounterName}
            </Typography>
            {!isDifferentUser && <Icon onClick={handleEditClick} sx={{ cursor: "pointer" }}>
              <Edit fontSize={isMobile ? "small" : "medium"} />
            </Icon>}
          </>
        )}
      </Box>

      {/* Center Section for Round - Always Centered */}
      <Box
        sx={{
          position: "absolute", // Keeps it independent of flex alignment
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {!isDifferentUser && <IconButton
          onClick={handleDecreaseRound}
          color={isDarkMode ? "#fff" : "primary"}
          sx={{ padding: 1 }}
        >
          <ArrowLeft fontSize={isMobile ? "small" : "medium"} />
        </IconButton>}
        <Typography
          variant="h5"
          sx={{
            marginX: 2,
            textTransform: "uppercase",
            fontSize: { sm: "0.8rem", md: "0.9rem", lg: "1rem" },
          }}
        >
          {t("combat_sim_round") + `: ${round}`}
        </Typography>
        {!isDifferentUser && <IconButton
          onClick={handleIncreaseRound}
          color={isDarkMode ? "#fff" : "primary"}
          sx={{ padding: 1 }}
        >
          <ArrowRight fontSize={isMobile ? "small" : "medium"} />
        </IconButton>}
      </Box>

      {/* Save Button & Time Ago Section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {timeAgo !== "Not saved yet" && !isMobile && (
          <Typography variant="body2">{timeAgo}</Typography>
        )}
        {isMobile ? (
          <IconButton
            onClick={handleSaveState}
            color="white"
            disabled={isDifferentUser}
            sx={{
              backgroundColor: "primary.main",
              margin: 0,
            }}
          >
            <Save fontSize="small" />
          </IconButton>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveState}
            startIcon={<Save />}
            disabled={isDifferentUser}
            sx={{
              fontWeight: "bold",
              fontSize: { sm: "0.7rem", md: "0.8rem", lg: "0.9rem" },
              borderRadius: 5,
            }}
          >
            {t("combat_sim_save")}
          </Button>
        )}
      </Box>
    </Box>
  );
}
