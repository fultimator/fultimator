import React from "react";
import { Paper, Tabs, Tab, Box } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ExtensionIcon from "@mui/icons-material/Extension";
import { useTranslate } from "../../translation/translate";
import { useTheme } from "@mui/material/styles";

export default function NavigationTabs({
  activeTab = 0,
  setActiveTab,
  isMobile = false,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        backgroundColor: isDarkMode ? "#2a2a2a" : "#f8f9fa",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant={isMobile ? "fullWidth" : "standard"}
        sx={{
          "& .MuiTabs-indicator": {
            backgroundColor: isDarkMode ? "#ffb74d" : "#f57c00",
            height: 3,
            borderRadius: "3px 3px 0 0",
          },
        }}
      >
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MenuBookIcon />
              {!isMobile && t("Official Resources")}
            </Box>
          }
          sx={{
            fontWeight: 600,
            minHeight: 64,
            "&.Mui-selected": {
              color: isDarkMode ? "#ffb74d" : "#f57c00",
            },
          }}
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ExtensionIcon />
              {!isMobile && t("Community Content")}
            </Box>
          }
          sx={{
            fontWeight: 600,
            minHeight: 64,
            "&.Mui-selected": {
              color: isDarkMode ? "#ffb74d" : "#f57c00",
            },
          }}
        />
      </Tabs>
    </Paper>
  );
}
