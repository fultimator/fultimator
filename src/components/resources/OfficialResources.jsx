import React from "react";
import { Box, Paper, Typography, Grid, Chip } from "@mui/material";
import { useTranslate } from "../../translation/translate";
import ResourceCard from "./ResourceCard";
import { useTheme } from "@mui/material/styles";

export default function OfficialResources({ groupedOfficialResources }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  return (
    <Box>
      {Object.keys(groupedOfficialResources).length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            backgroundColor: isDarkMode ? "#333333" : "#f8f9fa",
          }}
        >
          <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
            {t("No resources found")}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t("Try adjusting your search or filter criteria")}
          </Typography>
        </Paper>
      ) : (
        Object.entries(groupedOfficialResources).map(([language, langData]) => (
          <Paper
            key={language}
            elevation={2}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: "16px",
              backgroundColor: isDarkMode ? "#333333" : "#ffffff",
              border: `1px solid ${isDarkMode ? "#444" : "#e0e0e0"}`,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: isDarkMode ? "#e0e0e0" : "#333333",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "1.5em", marginRight: "0.75em" }}>
                {langData.flag}
              </span>
              {langData.language}
              <Chip
                label={`${langData.resources.length} ${t("resources")}`}
                size="small"
                sx={{ ml: 2, fontWeight: 600 }}
              />
            </Typography>

            <Grid container spacing={3}>
              {langData.resources.map((resource, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <ResourceCard resource={resource} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        ))
      )}
    </Box>
  );
}
