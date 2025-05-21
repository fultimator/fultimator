import React from "react";
import {
  Typography,
  Box,
  Button,
  TextField,
  Icon,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Edit,
  ArrowRight,
  ArrowLeft,
  Save,
  AutoAwesome,
} from "@mui/icons-material";
import { t, replacePlaceholders } from "../../translation/translate";
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
  isAutoSaveEnabled = false,
  lastManualSaved = null,
  lastAutoSaved = null,
  isDirty = false,
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // Format the autosave time more concisely
  const formatAutoSaveTime = () => {
    if (!lastAutoSaved) return null;
    const now = new Date();
    const diffSeconds = Math.floor((now - lastAutoSaved) / 1000);
    const minutes = Math.floor(diffSeconds / 60);
    const translated = replacePlaceholders(t("combat_sim_auto_saved"), {
      minutes,
    });
    return translated;
  };

  const autoSaveTimeText = formatAutoSaveTime();

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
        position: "relative",
      }}
    >
      {/* Encounter Name Section (Left) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flex: "1 1 auto",
          minWidth: 0,
          mr: 1,
        }}
      >
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
            sx={{ width: "100%" }}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              cursor: "pointer",
            }}
            onClick={handleEditClick}
          >
            <Tooltip title={t("combat_sim_edit_name")}>
              <Typography
                variant={isMobile ? "h6" : "h4"}
                noWrap
                sx={{
                  "&:hover": { textDecoration: "underline" },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {encounterName}
              </Typography>
            </Tooltip>
            <Tooltip title={t("combat_sim_edit_name")}>
              <Icon sx={{ flexShrink: 0 }}>
                {" "}
                {}
                <Edit fontSize={isMobile ? "small" : "medium"} />
              </Icon>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Center Section for Round - Always Centered */}
      <Box
        sx={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Tooltip title={t("combat_sim_previous_round")}>
          <IconButton
            onClick={handleDecreaseRound}
            color={isDarkMode ? "#fff" : "primary"}
            size="small"
            sx={{ padding: 1 }}
            disabled={round <= 1}
          >
            <ArrowLeft fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </Tooltip>
        <Typography
          variant="h5"
          sx={{
            marginX: { xs: 1, sm: 2 },
            textTransform: "uppercase",
            fontWeight: "medium",
            fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
            whiteSpace: "nowrap",
          }}
        >
          {`${t("combat_sim_round")}: ${round}`}
        </Typography>
        <Tooltip title={t("combat_sim_next_round")}>
          <IconButton
            onClick={handleIncreaseRound}
            color={isDarkMode ? "#fff" : "primary"}
            size="small"
            sx={{ padding: 1 }}
          >
            <ArrowRight fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Save Button & Status Section (Right) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexShrink: 0,
          ml: 1,
        }}
      >
        {/* Status Indicators (Chip + Text) - Hidden on mobile */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 1,
            mr: 1,
          }}
        >
          {isAutoSaveEnabled && (
            <Tooltip title={t("combat_sim_autosave_enabled")}>
              <Chip
                icon={<AutoAwesome sx={{ fontSize: "16px !important" }} />}
                size="small"
                label={t("combat_sim_autosave")}
                color="success"
                variant="outlined"
                sx={{ height: "24px", fontSize: "0.75rem", cursor: "default" }}
              />
            </Tooltip>
          )}
          
          {/* Save time text */}
          {isAutoSaveEnabled && lastAutoSaved > lastManualSaved ? (
            <>
              {autoSaveTimeText && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  whiteSpace="nowrap"
                >
                  {autoSaveTimeText}
                </Typography>
              )}
            </>
          ) : (
            // Show manual save time only if autosave is OFF and it's been saved before
            timeAgo !== "Not saved yet" && (
              <Typography
                variant="caption"
                color="text.secondary"
                whiteSpace="nowrap"
              >
                {timeAgo}
              </Typography>
            )
          )}
        </Box>

        {/* Save Button */}
        {isMobile ? (
          <Tooltip title={t("combat_sim_save")}>
            <IconButton
              onClick={handleSaveState}
              color="white"
              size="small"
              disabled={!isDirty}
              sx={{
                backgroundColor: "primary.main",
                margin: 0,
              }}
            >
              <Save fontSize="medium" />
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            variant="contained"
            color="primary"
            disabled={!isDirty}
            onClick={handleSaveState}
            startIcon={<Save />}
            size="medium"
            sx={{
              fontWeight: "bold",
              fontSize: { sm: "0.75rem", md: "0.8rem", lg: "0.875rem" },
              borderRadius: 50,
              whiteSpace: "nowrap",
              px: 2,
            }}
          >
            {t("combat_sim_save")}
          </Button>
        )}
      </Box>
    </Box>
  );
}
