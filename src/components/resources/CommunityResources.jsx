import React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Alert,
  Collapse,
  IconButton,
  Link,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useTranslate } from "../../translation/translate";
import ResourceCard from "./ResourceCard";
import { useTheme } from "@mui/material/styles";

export default function CommunityResources({
  filteredResources,
  setShowAddResourceDialog,
  isMobile,
  expandedLicenseInfo,
  setExpandedLicenseInfo,
  isModerator,
  setShowModerationPanel,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Box>
      {/* Enhanced Header Section with Integrated License Info */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: "16px",
          backgroundColor: isDarkMode ? "#333333" : "#ffffff",
          border: `1px solid ${isDarkMode ? "#444" : "#e0e0e0"}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Main Header Content */}
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 3,
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 2 : 0,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: isDarkMode ? "#e0e0e0" : "#333333",
                  mb: 1,
                }}
              >
                {t("Community Content")}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: isDarkMode ? "#b0b0b0" : "#666666",
                  maxWidth: "500px",
                }}
              >
                {t(
                  "Discover amazing homebrew content created by the community. Share your own creations and explore what others have built."
                )}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexDirection: isMobile ? "column" : "row" }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setShowAddResourceDialog(true)}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  minWidth: isMobile ? "100%" : "auto",
                  background: isDarkMode
                    ? "linear-gradient(135deg, #3f51b5, #303f9f)"
                    : "linear-gradient(135deg, #2196f3, #1976d2)",
                  boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
                  "&:hover": {
                    background: isDarkMode
                      ? "linear-gradient(135deg, #303f9f, #283593)"
                      : "linear-gradient(135deg, #1976d2, #1565c0)",
                    boxShadow: "0 6px 16px rgba(33, 150, 243, 0.4)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {t("Request New Resource")}
              </Button>

              {isModerator && (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<AdminPanelSettingsIcon />}
                  onClick={() => setShowModerationPanel(true)}
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    minWidth: isMobile ? "100%" : "auto",
                    borderColor: isDarkMode ? "#ff9800" : "#ff6f00",
                    color: isDarkMode ? "#ff9800" : "#ff6f00",
                    "&:hover": {
                      borderColor: isDarkMode ? "#ffb74d" : "#e65100",
                      backgroundColor: isDarkMode ? "rgba(255, 152, 0, 0.1)" : "rgba(255, 111, 0, 0.1)",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {t("Moderate Submissions")}
                </Button>
              )}
            </Box>
          </Box>

          {/* Integrated License Information */}
          <Alert
            severity="info"
            sx={{
              borderRadius: "12px",
              backgroundColor: isDarkMode ? "#1a237e15" : "#e3f2fd",
              border: `1px solid ${isDarkMode ? "#3f51b540" : "#2196f340"}`,
              "& .MuiAlert-icon": {
                color: isDarkMode ? "#90caf9" : "#1976d2",
              },
            }}
            action={
              <IconButton
                aria-label="toggle license info"
                onClick={() => setExpandedLicenseInfo(!expandedLicenseInfo)}
                size="small"
                sx={{
                  color: isDarkMode ? "#90caf9" : "#1976d2",
                  "&:hover": {
                    backgroundColor: isDarkMode ? "#3f51b520" : "#2196f320",
                  },
                }}
              >
                {expandedLicenseInfo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            }
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: isDarkMode ? "#90caf9" : "#1976d2",
                }}
              >
                {t("Homebrew Resources Information")}
              </Typography>
            </Box>
            <Collapse in={expandedLicenseInfo}>
              <Box
                sx={{
                  pt: 2,
                  borderTop: `1px solid ${isDarkMode ? "#3f51b530" : "#2196f330"
                    }`,
                }}
              >
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {t("All homebrew content listed here is created under the")}{" "}
                  <Link
                    href="https://need.games/wp-content/uploads/2024/06/Fabula-Ultima-Third-Party-Tabletop-License-1.0.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: isDarkMode ? "#90caf9" : "#1976d2",
                      fontWeight: 600,
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                        color: isDarkMode ? "#64b5f6" : "#1565c0",
                      },
                    }}
                  >
                    Fabula Ultima Third Party Tabletop License 1.0
                  </Link>
                  {t(
                    ". All content is the sole property and responsibility of its respective creators and is not affiliated with Need Games, Rooster Games, or Fultimator."
                  )}
                </Typography>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {t(
                    "Fultimator does not claim ownership of any user-submitted material. We review submissions only to ensure they are related to Fabula Ultima, are not duplicated, and do not blatantly violate community guidelines or copyright."
                  )}
                </Typography>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {t(
                    "If you believe a resource has been posted in error or violates any rules, please use the report button or contact us at"
                  )}{" "}
                  <strong>fultimator@gmail.com</strong>.{" "}
                  {t(
                    "Include relevant details to help us review and address the issue promptly."
                  )}
                </Typography>
              </Box>
            </Collapse>
          </Alert>
        </Box>
      </Paper>

      {/* Content Grid */}
      {filteredResources.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            backgroundColor: isDarkMode ? "#333333" : "#f8f9fa",
            borderRadius: "16px",
            border: `1px solid ${isDarkMode ? "#444" : "#e0e0e0"}`,
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              p: 3,
              borderRadius: "50%",
              backgroundColor: isDarkMode ? "#3f51b520" : "#2196f320",
              mb: 3,
            }}
          >
            <AddIcon
              sx={{
                fontSize: "3rem",
                color: isDarkMode ? "#90caf9" : "#1976d2",
              }}
            />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: isDarkMode ? "#e0e0e0" : "#333333",
              mb: 2,
            }}
          >
            {t("No community content found")}
          </Typography>

          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mb: 4, maxWidth: "400px", mx: "auto" }}
          >
            {t(
              "Be the first to contribute! Try adjusting your search criteria or request a new resource."
            )}
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setShowAddResourceDialog(true)}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              py: 1.5,
              background: isDarkMode
                ? "linear-gradient(135deg, #3f51b5, #303f9f)"
                : "linear-gradient(135deg, #2196f3, #1976d2)",
              boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(33, 150, 243, 0.4)",
              },
              transition: "all 0.3s ease",
            }}
          >
            {t("Be the first to request a resource!")}
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredResources.map((content, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <ResourceCard resource={content} isHomebrew />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
