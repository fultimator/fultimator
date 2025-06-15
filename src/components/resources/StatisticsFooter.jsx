import React from "react";
import { Typography, Box, Paper } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ExtensionIcon from "@mui/icons-material/Extension";
import LanguageIcon from "@mui/icons-material/Language";
import { useTranslate } from "../../translation/translate";
import { useTheme } from "@mui/material/styles";

export default function StatisticsFooter({ allResources = {}, uniqueLanguages = [] }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Paper
      elevation={1}
      sx={{
        mt: 6,
        mb: 4,
        p: 3,
        backgroundColor: isDarkMode ? "#2a2a2a" : "#f8f9fa",
        borderRadius: "16px",
        textAlign: "center",
      }}
    >
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <MenuBookIcon fontSize="small" />
          {allResources.official.length} {t("Official Resources")}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <ExtensionIcon fontSize="small" />
          {allResources.homebrew.length} {t("Community Resources")}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <LanguageIcon fontSize="small" />
          {uniqueLanguages.length} {t("Languages")}
        </Box>
      </Typography>
      <Typography
        variant="caption"
        color="textSecondary"
        sx={{ mt: 1, display: "block" }}
      >
        {t("Resources are regularly updated. Check back for new content!")}
      </Typography>
    </Paper>
  );
}
