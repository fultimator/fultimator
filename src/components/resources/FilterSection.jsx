import React from "react";
import {
  Paper,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslate } from "../../translation/translate";
import { useTheme } from "@mui/material/styles";
import {
  getTypeIcon,
  getTypeLabel,
  getTypeColor,
  languages
} from "./resourceUtils";

export default function FilterSection({
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  languageFilter,
  setLanguageFilter,
  uniqueTypes = [],
  uniqueLanguages = [],
}) {
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
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t("Search resources...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>{t("Filter by Type")}</InputLabel>
            <Select
              value={typeFilter}
              label={t("Filter by Type")}
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ borderRadius: "12px" }}
            >
              <MenuItem value="all">{t("All Types")}</MenuItem>
              {uniqueTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ color: getTypeColor({ type, isDarkMode }) }}>
                      {getTypeIcon(type)}
                    </Box>
                    {getTypeLabel(type)}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>{t("Filter by Language")}</InputLabel>
            <Select
              value={languageFilter}
              label={t("Filter by Language")}
              onChange={(e) => setLanguageFilter(e.target.value)}
              sx={{ borderRadius: "12px" }}
            >
              <MenuItem value="all">{t("All Languages")}</MenuItem>
              {uniqueLanguages.map((language) => (
                <MenuItem key={language} value={language}>
                  {languages[language]?.lang}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
}
