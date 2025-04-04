import {
    AccordionSummary,
    Typography,
    IconButton,
    Icon,
    Box,
  } from "@mui/material";
  import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
  import { useCustomTheme } from "../../hooks/useCustomTheme";
  
  const CustomHeaderAccordion = ({
    isExpanded = true,
    //handleAccordionChange,
    headerText = "",
    showIconButton = false,
    icon = null,
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
        {showIconButton && (
          <IconButton aria-label="icon button" sx={{ color: "#ffffff" }}>
            <ArrowDownwardIcon />
          </IconButton>
        )}
      </AccordionSummary>
    );
  };
  
  export default CustomHeaderAccordion;
  