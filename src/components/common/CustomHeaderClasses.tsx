// CustomHeaderClasses.tsx
import React from "react";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import { useTheme } from "@mui/system";
import { Grid, Tooltip, TextField } from "@mui/material";

interface CustomHeaderClassesProps {
  addItem: () => void;
  headerText: string;
  type: "top" | "middle";
  rightHeaderText: string;
  editableNumber: number;
  readOnlyNumber: number;
  onLevelChange: (newValue: number) => void;
  isEditMode: boolean;
}

const CustomHeaderClasses: React.FC<CustomHeaderClassesProps> = ({
  addItem,
  headerText,
  type,
  rightHeaderText,
  editableNumber,
  readOnlyNumber,
  onLevelChange,
  isEditMode,
}) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  return (
    <Grid item xs={12} sx={{ width: "100%", margin: "15px" }}>
      <Typography
        variant="h2"
        component="legend"
        sx={{
          color: primary,
          background: `linear-gradient(to right, ${ternary}, transparent, ${ternary})`,
          textTransform: "uppercase",
          padding: "5px 10px",
          borderRadius: type === "top" ? "8px 8px 0 0" : 0,
          margin: type === "top" ? "-30px 0 0 -30px" : "0 0 0 -30px",
          fontSize: "1.5em",
          display: "flex", // Added to allow for flex layout
          alignItems: "center", // Align items vertically
          justifyContent: "space-between", // Align items to the start and end of the container
          lineHeight: "normal", // Reset line height to normal
        }}
      >
        <Tooltip title={"Add " + headerText}>
          <IconButton
            sx={{ px: 1, "&:hover": { color: primary } }}
            onClick={addItem}
          >
            <HistoryEduIcon fontSize="large" />
          </IconButton>
        </Tooltip>
        <div style={{ flex: 1, textAlign: "left", paddingBottom: 7 }}>
          {headerText}
        </div>{" "}
        {/* Left-aligned */}
        <div
          style={{
            textAlign: "right",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ marginRight: "10px", paddingBottom: 7 }}>
            {rightHeaderText}
          </div>
          <TextField
            type="number"
            InputProps={{
              inputProps: { min: 1, max: 10, readOnly: !isEditMode },
              style: {
                fontFamily: "inherit",
                fontSize: "inherit",
                backgroundColor: "white",
              },
            }}
            value={editableNumber}
            onChange={(e) => onLevelChange(parseInt(e.target.value))} // Handle level change
            variant="outlined"
            size="small"
            style={{
              width: "60px",
              textAlign: "center",
              marginRight: "4px",
              fontFamily: "inherit", // Match font with the rest
            }}
          />
          {" / "}
          <TextField
            type="number"
            InputProps={{
              inputProps: { min: 1, max: 10, readOnly: true },
              style: { fontFamily: "inherit", fontSize: "inherit" },
            }}
            value={readOnlyNumber}
            variant="outlined"
            size="small"
            disabled
            style={{
              width: "60px",
              textAlign: "center",
              backgroundColor: "white",
              border: "none",
              fontFamily: "inherit", // Match font with the rest
            }}
          />
        </div>
      </Typography>
      {type === "top" && (
        <Divider
          orientation="horizontal"
          sx={{
            color: secondary,
            borderBottom: "2px solid",
            borderColor: secondary,
            margin: "0 0 0 -30px",
          }}
        />
      )}
    </Grid>
  );
};

export default CustomHeaderClasses;
