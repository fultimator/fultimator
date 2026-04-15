import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Box,
  Tooltip,
  Chip,
  Divider,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UpdateIcon from "@mui/icons-material/Update";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { t } from "../../translation/translate";
import { useDeleteConfirmation } from "../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";

const EncounterCard = ({
  encounter,
  onDelete,
  onClick,
  selectMode = false,
  isSelected = false,
  onToggleSelect,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpen,
    handleDelete: _handleDelete,
  } = useDeleteConfirmation({
    onConfirm: () => {},
  });

  // Format dates in a more readable way
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(navigator.language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const handleCardClick = () => {
    if (selectMode) {
      onToggleSelect(encounter.id);
    }
  };

  const openDeleteDialog = (event) => {
    event.stopPropagation();
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Card
        elevation={isDarkMode ? 4 : 2}
        onClick={handleCardClick}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          transition: "all 0.25s ease-in-out",
          backgroundColor: isDarkMode
            ? theme.palette.grey[900]
            : theme.palette.background.paper,
          border: isSelected
            ? `3px solid ${theme.palette.primary.main}`
            : `1px solid ${isDarkMode ? theme.palette.grey[800] : theme.palette.grey[200]}`,
          cursor: selectMode ? "pointer" : "default",
          outline:
            selectMode && !isSelected
              ? `1px dashed ${theme.palette.divider}`
              : "none",
          "&:hover": {
            transform: "translateY(-4px)",
            border: isSelected
              ? `3px solid ${theme.palette.primary.main}`
              : isDarkMode
                ? `1px solid ${theme.palette.primary.dark}`
                : `1px solid ${theme.palette.primary.light}`,
            "& .header-box": {
              borderTopColor: theme.palette.primary.main,
            },
          },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Card header with round indicator */}
        <Box
          className="header-box"
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            py: 1,
            px: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${theme.palette.primary.main}`,
            marginTop: "-1px", // Pull the header up to cover the gap
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
          >
            {selectMode &&
              (isSelected ? (
                <CheckCircleIcon fontSize="small" />
              ) : (
                <RadioButtonUncheckedIcon
                  fontSize="small"
                  sx={{ opacity: 0.7 }}
                />
              ))}
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: "bold",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "80%",
              }}
            >
              {encounter.name}
            </Typography>
          </Box>
          <Chip
            label={`${t("combat_sim_round")} ${encounter.round || 1}`}
            size="small"
            color="secondary"
            sx={{ fontWeight: "bold", flexShrink: 0 }}
          />
        </Box>
        <CardContent sx={{ flexGrow: 1, pt: 2, pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <CalendarTodayIcon
              fontSize="small"
              sx={{ color: theme.palette.text.secondary, mr: 1 }}
            />
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              {t("combat_sim_created")}: {formatDate(encounter.createdAt)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <UpdateIcon
              fontSize="small"
              sx={{ color: theme.palette.text.secondary, mr: 1 }}
            />
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              {t("combat_sim_last_updated")}: {formatDate(encounter.updatedAt)}
            </Typography>
          </Box>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: "space-between", p: 1 }}>
          <Tooltip title={t("combat_sim_continue")}>
            <span>
              <Button
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.secondary.main
                      : theme.palette.primary.main,
                  pl: 1,
                  "&:hover": { color: theme.palette.primary.dark },
                }}
                disabled={selectMode}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(encounter.id);
                }}
                startIcon={<PlayArrowIcon />}
              >
                {t("combat_sim_continue")}
              </Button>
            </span>
          </Tooltip>

          <Tooltip title={t("Delete")}>
            <span>
              <IconButton
                size="small"
                disabled={selectMode}
                onClick={openDeleteDialog}
                sx={{
                  color: theme.palette.error.main,
                  "&:hover": {
                    backgroundColor: theme.palette.error.light,
                    color: theme.palette.error.dark,
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </CardActions>
      </Card>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={setDeleteDialogOpen}
        onConfirm={() => onDelete(encounter.id)}
        title={t("Delete")}
        message={t("Are you sure you want to delete this encounter?")}
        itemPreview={<Typography variant="h4">{encounter.name}</Typography>}
      />
    </>
  );
};

export default EncounterCard;
