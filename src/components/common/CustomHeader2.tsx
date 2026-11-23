import React from "react";
import { Typography, Button } from "@mui/material";
import { useCustomTheme } from "../../hooks/useCustomTheme";

interface CustomHeaderProps {
  headerText: string;
  buttonText?: string; // Optional button text
  onButtonClick?: () => void; // Optional button click handler
  isEditMode?: boolean;
}

const CustomHeader2: React.FC<CustomHeaderProps> = ({
  headerText,
  buttonText,
  onButtonClick,
  isEditMode,
}) => {
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "Antonio",
        fontWeight: "normal",
        fontSize: "1em",
        paddingLeft: "17px",
        paddingRight: "17px",
        paddingTop: "5px",
        paddingBottom: "5px",
        color: isDarkMode ? "white" : "black",
        textAlign: "left",
        marginBottom: 0,
        textTransform: "uppercase",
        background: isDarkMode
          ? `linear-gradient(90deg, ${theme.ternary}, rgba(24,26,27,0) 100%)`
          : `linear-gradient(90deg, ${theme.ternary} 0%, #ffffff 100%)`,
      }}
    >
      <Typography variant="h2" sx={{ fontSize: "1.3em" }}>
        {headerText}
      </Typography>
      {isEditMode && buttonText && onButtonClick && (
        <Button
          variant="outlined"
          onClick={onButtonClick}
          sx={{ height: "30px", fontSize: "0.9em" }}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default CustomHeader2;
