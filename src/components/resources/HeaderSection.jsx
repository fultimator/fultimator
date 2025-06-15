import React from "react";
import {
  Typography,
  Box,
  Paper
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import { useTranslate } from "../../translation/translate";
import { useTheme } from "@mui/material/styles";

export default function HeaderSection({isMobile = false}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        mb: 4,
        backgroundColor: isDarkMode ? "#333333" : "#ffffff",
        borderRadius: "16px",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant={isMobile ? "h4" : "h2"}
          sx={{
            mb: 2,
            fontWeight: 700,
            color: isDarkMode ? "#e0e0e0" : "#333333",
            background: isDarkMode
              ? "linear-gradient(45deg, #ffb74d, #ff8a65)"
              : "linear-gradient(45deg, #f57c00, #ff5722)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          <LanguageIcon
            sx={{
              verticalAlign: "middle",
              mr: 2,
              fontSize: "inherit",
              color: isDarkMode ? "#ffb74d" : "#f57c00",
            }}
          />
          {t("Fabula Ultima Resources")}
        </Typography>
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{
            color: isDarkMode ? "#b0b0b0" : "#666666",
            maxWidth: "800px",
            mx: "auto",
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          {t(
            "Complete collection of official resources, tools, and community content for Fabula Ultima TTRPG"
          )}
        </Typography>
      </Box>
    </Paper>
  );
}
