import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Chip,
  Divider,
  useTheme,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UpdateIcon from "@mui/icons-material/Update";
import { t } from "../../translation/translate";

const EncounterCard = ({ encounter, onDelete, onClick }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // Format dates in a more readable way
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(navigator.language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <Card
      elevation={isDarkMode ? 4 : 2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        transition: "all 0.25s ease-in-out",
        backgroundColor: isDarkMode
          ? theme.palette.grey[900]
          : theme.palette.background.paper,
        border: `1px solid ${
          isDarkMode ? theme.palette.grey[800] : theme.palette.grey[200]
        }`,
        "&:hover": {
          transform: "translateY(-4px)",
          border: isDarkMode
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
        <Chip
          label={`${t("combat_sim_round")} ${encounter.round || 1}`}
          size="small"
          color="secondary"
          sx={{ fontWeight: "bold" }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 2, pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
          <CalendarTodayIcon
            fontSize="small"
            sx={{ color: theme.palette.text.secondary, mr: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {t("combat_sim_created")}: {formatDate(encounter.createdAt)}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <UpdateIcon
            fontSize="small"
            sx={{ color: theme.palette.text.secondary, mr: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {t("combat_sim_last_updated")}: {formatDate(encounter.updatedAt)}
          </Typography>
        </Box>
      </CardContent>

      <Divider />

      <CardActions sx={{ justifyContent: "space-between", p: 1 }}>
        <Tooltip title={t("combat_sim_continue")}>
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
            onClick={() => onClick(encounter.id)}
            startIcon={<PlayArrowIcon />}
          >
            {t("combat_sim_continue")}
          </Button>
        </Tooltip>

        <Tooltip title={t("Delete")}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(encounter.id);
            }}
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
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default EncounterCard;
