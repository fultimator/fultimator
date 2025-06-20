import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import CloseIcon from "@mui/icons-material/Close";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useTranslate } from "../../translation/translate";
import { useTheme } from "@mui/material/styles";
import {
  getTypeIcon,
  getTypeColor,
  getTypeLabel,
  languages,
} from "./resourceUtils";

export default function ResourceCard({
  resource,
  isHomebrew = false,
  activeTab = 0,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [digitalDialogOpen, setDigitalDialogOpen] = useState(false);
  const [physicalDialogOpen, setPhysicalDialogOpen] = useState(false);

  // Helper function to get purchase options
  const getDigitalOptions = () => {
    if (!resource.purchase_options) return [];
    return resource.purchase_options.filter((option) => option.isDigital);
  };

  const getPhysicalOptions = () => {
    if (!resource.purchase_options) return [];
    return resource.purchase_options.filter((option) => !option.isDigital);
  };

  // Check if we have purchase options vs traditional URL
  const hasPurchaseOptions =
    resource.purchase_options && resource.purchase_options.length > 0;
  const digitalOptions = getDigitalOptions();
  const physicalOptions = getPhysicalOptions();

  const handleDigitalClick = () => {
    setDigitalDialogOpen(true);
  };

  const handlePhysicalClick = () => {
    setPhysicalDialogOpen(true);
  };

  const handleResellerClick = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setDigitalDialogOpen(false);
    setPhysicalDialogOpen(false);
  };

  const renderResellerDialog = (open, onClose, options, title, icon) => (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {icon}
        {title}
        <IconButton onClick={onClose} sx={{ ml: "auto" }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose your preferred reseller:
        </Typography>
        <List>
          {options.map((option, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => handleResellerClick(option.url)}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  border: `1px solid ${isDarkMode ? "#444" : "#e0e0e0"}`,
                  "&:hover": {
                    backgroundColor: isDarkMode ? "#444" : "#f5f5f5",
                    borderColor: getTypeColor({
                      type: resource.type,
                      isDarkMode,
                    }),
                  },
                }}
              >
                <ListItemText
                  primary={option.reseller}
                  secondary={option.url}
                  secondaryTypographyProps={{
                    sx: {
                      fontSize: "0.75rem",
                      opacity: 0.7,
                      wordBreak: "break-all",
                    },
                  }}
                />
                <LaunchIcon sx={{ ml: 1, opacity: 0.7 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <Card
        elevation={2}
        sx={{
          height: "100%",
          backgroundColor: isDarkMode ? "#333333" : "#ffffff",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          border: `1px solid ${isDarkMode ? "#444" : "#e0e0e0"}`,
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: `0 12px 32px ${
              isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)"
            }`,
            borderColor: getTypeColor({ type: resource.type, isDarkMode }),
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
            <Box
              sx={{
                color: getTypeColor({ type: resource.type, isDarkMode }),
                mr: 2,
                mt: 0.5,
                p: 1,
                borderRadius: "8px",
                backgroundColor: `${getTypeColor({
                  type: resource.type,
                  isDarkMode,
                })}20`,
              }}
            >
              {getTypeIcon(resource.type)}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: isDarkMode ? "#e0e0e0" : "#333333",
                    lineHeight: 1.3,
                    flex: 1,
                  }}
                >
                  {resource.name}
                </Typography>
                {isHomebrew && resource.language && (
                  <Box
                    sx={{
                      ml: 1,
                      fontSize: "1.2em",
                      opacity: 0.8,
                    }}
                    title={
                      languages[resource.language]?.lang || resource.language
                    }
                  >
                    {languages[resource.language]?.flag || "🌐"}
                  </Box>
                )}
              </Box>

              {/* Author/Publisher info */}
              {isHomebrew && resource.author && (
                <Typography
                  variant="caption"
                  sx={{
                    color: isDarkMode ? "#b0b0b0" : "#666666",
                    display: "block",
                    mb: 1,
                    fontStyle: "italic",
                  }}
                >
                  {t("by")} {resource.author}
                </Typography>
              )}
              {!isHomebrew && resource.publisher && (
                <Typography
                  variant="caption"
                  sx={{
                    color: isDarkMode ? "#b0b0b0" : "#666666",
                    display: "block",
                    mb: 1,
                    fontWeight: 500,
                  }}
                >
                  {resource.publisher}
                </Typography>
              )}

              {/* Date info */}
              {resource.publish_date && (
                <Typography
                  variant="caption"
                  sx={{
                    color: isDarkMode ? "#888" : "#999",
                    display: "block",
                    mb: 1,
                  }}
                >
                  {new Date(resource.publish_date).toLocaleDateString()}
                </Typography>
              )}

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                <Chip
                  label={getTypeLabel(resource.type)}
                  size="small"
                  sx={{
                    backgroundColor: getTypeColor({
                      type: resource.type,
                      isDarkMode,
                    }),
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
                {isHomebrew && resource.license && (
                  <Chip
                    label={resource.license}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: isDarkMode ? "#81c784" : "#388e3c",
                      color: isDarkMode ? "#81c784" : "#388e3c",
                      fontSize: "0.7rem",
                    }}
                  />
                )}
                {/* Tags */}
                {resource.tags &&
                  resource.tags.length > 0 &&
                  resource.tags.slice(0, 2).map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: isDarkMode ? "#666" : "#ccc",
                        color: isDarkMode ? "#aaa" : "#666",
                        fontSize: "0.65rem",
                      }}
                    />
                  ))}
                {resource.tags && resource.tags.length > 2 && (
                  <Chip
                    label={`+${resource.tags.length - 2}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: isDarkMode ? "#666" : "#ccc",
                      color: isDarkMode ? "#aaa" : "#666",
                      fontSize: "0.65rem",
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: isDarkMode ? "#b0b0b0" : "#666666",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {resource.description}
          </Typography>
        </CardContent>
        <CardActions sx={{ p: 3, pt: 0 }}>
          {hasPurchaseOptions ? (
            <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
              {digitalOptions.length > 0 && (
                <Button
                  variant="contained"
                  onClick={handleDigitalClick}
                  disabled={resource.type === "coming_soon"}
                  startIcon={<CloudDownloadIcon />}
                  sx={{
                    flex: 1,
                    backgroundColor:
                      resource.type === "coming_soon"
                        ? "transparent"
                        : getTypeColor({ type: resource.type, isDarkMode }),
                    borderColor: getTypeColor({
                      type: resource.type,
                      isDarkMode,
                    }),
                    color:
                      resource.type === "coming_soon"
                        ? getTypeColor({ type: resource.type, isDarkMode })
                        : "#ffffff",
                    "&:hover":
                      resource.type !== "coming_soon"
                        ? {
                            backgroundColor: getTypeColor({
                              type: resource.type,
                              isDarkMode,
                            }),
                            filter: "brightness(1.1)",
                            transform: "scale(1.02)",
                          }
                        : {
                            borderColor: getTypeColor({
                              type: resource.type,
                              isDarkMode,
                            }),
                            backgroundColor: `${getTypeColor({
                              type: resource.type,
                              isDarkMode,
                            })}10`,
                          },
                    fontWeight: 600,
                    py: 1.5,
                    transition: "all 0.2s",
                    fontSize: "0.8rem",
                  }}
                >
                  Digital
                </Button>
              )}
              {physicalOptions.length > 0 && (
                <Button
                  variant="contained"
                  onClick={handlePhysicalClick}
                  disabled={resource.type === "coming_soon"}
                  startIcon={<LocalShippingIcon />}
                  sx={{
                    flex: 1,
                    backgroundColor:
                      resource.type === "coming_soon"
                        ? "transparent"
                        : getTypeColor({ type: resource.type, isDarkMode }),
                    borderColor: getTypeColor({
                      type: resource.type,
                      isDarkMode,
                    }),
                    color:
                      resource.type === "coming_soon"
                        ? getTypeColor({ type: resource.type, isDarkMode })
                        : "#ffffff",
                    "&:hover":
                      resource.type !== "coming_soon"
                        ? {
                            backgroundColor: getTypeColor({
                              type: resource.type,
                              isDarkMode,
                            }),
                            filter: "brightness(1.1)",
                            transform: "scale(1.02)",
                          }
                        : {
                            borderColor: getTypeColor({
                              type: resource.type,
                              isDarkMode,
                            }),
                            backgroundColor: `${getTypeColor({
                              type: resource.type,
                              isDarkMode,
                            })}10`,
                          },
                    fontWeight: 600,
                    py: 1.5,
                    transition: "all 0.2s",
                    fontSize: "0.8rem",
                  }}
                >
                  Physical
                </Button>
              )}
            </Box>
          ) : (
            <Button
              variant={
                resource.type === "coming_soon" ? "outlined" : "contained"
              }
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              disabled={resource.type === "coming_soon" || resource.url === "#"}
              endIcon={<LaunchIcon />}
              fullWidth
              sx={{
                backgroundColor:
                  resource.type === "coming_soon" || resource.url === "#"
                    ? "transparent"
                    : getTypeColor({ type: resource.type, isDarkMode }),
                borderColor: getTypeColor({ type: resource.type, isDarkMode }),
                color:
                  resource.type === "coming_soon" || resource.url === "#"
                    ? getTypeColor({ type: resource.type, isDarkMode })
                    : "#ffffff",
                "&:hover":
                  resource.type !== "coming_soon" && resource.url !== "#"
                    ? {
                        backgroundColor: getTypeColor({
                          type: resource.type,
                          isDarkMode,
                        }),
                        filter: "brightness(1.1)",
                        transform: "scale(1.02)",
                      }
                    : {
                        borderColor: getTypeColor({
                          type: resource.type,
                          isDarkMode,
                        }),
                        backgroundColor: `${getTypeColor({
                          type: resource.type,
                          isDarkMode,
                        })}10`,
                      },
                fontWeight: 600,
                py: 1.5,
                transition: "all 0.2s",
              }}
            >
              {resource.type === "coming_soon" || resource.url === "#"
                ? t("Coming Soon")
                : activeTab === 0
                ? t("Access Resource")
                : t("View Content")}
            </Button>
          )}
        </CardActions>
      </Card>

      {/* Digital Options Dialog */}
      {renderResellerDialog(
        digitalDialogOpen,
        () => setDigitalDialogOpen(false),
        digitalOptions,
        "Digital Options",
        <CloudDownloadIcon />
      )}

      {/* Physical Options Dialog */}
      {renderResellerDialog(
        physicalDialogOpen,
        () => setPhysicalDialogOpen(false),
        physicalOptions,
        "Physical Options",
        <LocalShippingIcon />
      )}
    </>
  );
}
