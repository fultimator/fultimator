import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const HealthBar = ({
  label,
  currentValue,
  maxValue,
  startColor,
  endColor,
  bgColor,
  rightText,
  rightTextColor = "#fff",
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const percentage = (currentValue / maxValue) * 100 || 0;

  // Create a gradient from startColor to endColor
  const gradient = `linear-gradient(to right, ${startColor}, ${endColor})`;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        border: `2px solid ${isDarkMode ? "#444" : "#e0e0e0"}`, // Adjust border color for dark mode
      }}
    >
      {/* Label */}
      <Box
        sx={{
          backgroundColor: isDarkMode ? "#333" : "#f4f4f4", // Adjust background color for label
          borderRight: `1px solid ${isDarkMode ? "#444" : "#e0e0e0"}`, // Border for dark mode
          width: "10%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 25,
        }}
      >
        <Typography
          sx={{
            fontWeight: "bold",
            fontFamily: "'Press Start 2P', cursive",
            fontSize: `calc(0.60rem + 0.25vw)`,
            color: isDarkMode ? "#fff" : bgColor, // Text color for label
          }}
        >
          {label}
        </Typography>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ position: "relative", width: "90%" }}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 25,
            borderRadius: 0,
            backgroundColor: bgColor || (isDarkMode ? "#444" : "#e0e0e0"), // Adjust background for dark mode
            "& .MuiLinearProgress-bar": {
              borderRadius: 0,
              background: gradient, // Apply the gradient
            },
          }}
        />
        {/* Value inside the bar (centered) */}
        <Typography
          variant="body2"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontWeight: "bold",
            color: "#fff",
            fontFamily: "'Press Start 2P', cursive",
            letterSpacing: "3px",
            fontSize: `calc(0.60rem + 0.25vw)`,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {`${currentValue} / ${maxValue}`}
        </Typography>

        {/* Right-aligned text */}
        {rightText && (
          <Typography
            variant="body2"
            sx={{
              position: "absolute",
              top: "50%",
              right: 8,
              transform: "translateY(-50%)",
              fontWeight: "bold",
              color: rightTextColor,
              fontFamily: "'Press Start 2P', cursive",
              letterSpacing: "2px",
              fontSize: `calc(0.60rem + 0.25vw)`,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            {rightText}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default HealthBar;
