import React from "react";
import {
  AccordionSummary,
  Typography,
  IconButton,
  Icon,
  Box,
  Tooltip,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useCustomTheme } from "../../hooks/useCustomTheme";

const CustomHeaderAccordion = ({
  isExpanded = true,
  //handleAccordionChange,
  headerText = "",
  // showIconButton = false,
  icon = null,
  addItem = null,
  openCompendium = null,
  actions = null,
}: {
  isExpanded?: boolean;
  headerText?: string;
  showIconButton?: boolean;
  icon?: React.ReactNode;
  addItem?: (() => void) | null;
  openCompendium?: (() => void) | null;
  actions?: React.ReactNode | null;
}) => {
  const theme = useCustomTheme();
  return (
    <AccordionSummary
      expandIcon={<ArrowDownwardIcon sx={{ color: "#ffffff" }} />}
      aria-controls="panel1-content"
      id="panel1-header"
      sx={{
        backgroundColor: theme.primary,
        borderRadius: isExpanded ? "6px 6px 0 0" : "6px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
        {icon && (
          <Icon
            sx={{
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              fontSize: "2em",
            }}
          >
            {icon}
          </Icon>
        )}
        <Typography
          variant="h2"
          component="legend"
          sx={{
            color: "#ffffff",
            textTransform: "uppercase",
            fontSize: "1.5em",
          }}
        >
          {headerText}
        </Typography>
      </Box>
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{ display: "flex", alignItems: "center", gap: 0.5, mr: 1 }}
      >
        {openCompendium && (
          <Tooltip title={`Search ${headerText}`}>
            <IconButton
              onClick={openCompendium}
              sx={{
                px: 1,
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.3)",
                  transition: "background-color 0.3s ease",
                },
              }}
            >
              <SearchIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
        {addItem && (
          <Tooltip title={`Add ${headerText}`}>
            <IconButton
              onClick={addItem}
              sx={{
                px: 1,
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.3)",
                  transition: "background-color 0.3s ease",
                },
              }}
            >
              <AddIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
        {actions}
      </Box>
    </AccordionSummary>
  );
};

export default CustomHeaderAccordion;
