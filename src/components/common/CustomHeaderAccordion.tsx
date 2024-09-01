import { AccordionSummary, Typography, IconButton } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useCustomTheme } from "../../hooks/useCustomTheme";

const CustomHeaderAccordion = ({
    expanded,
    handleAccordionChange,
    headerText,
    showIconButton,
}) => {
    const theme = useCustomTheme();
    return (
        <AccordionSummary
            expandIcon={<ArrowDownwardIcon sx={{ color: "#ffffff" }} />}
            aria-controls="panel1-content"
            id="panel1-header"
            sx={{
                backgroundColor: theme.primary,
                margin: "-15px -15px 0",
                borderRadius: "6px 6px 0 0",
            }}
        >
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
            {showIconButton && (
                <IconButton
                    aria-label="icon button"
                    sx={{ color: "#ffffff" }}
                >
                    <ArrowDownwardIcon />
                </IconButton>
            )}
        </AccordionSummary>
    );
};

export default CustomHeaderAccordion;
