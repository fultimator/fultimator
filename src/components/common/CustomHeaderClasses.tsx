import React from "react";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { useMediaQuery } from "@mui/material";
import { Grid, Tooltip, TextField } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useTranslate } from "../../translation/translate";
import { useCustomTheme } from "../../hooks/useCustomTheme";

interface CustomHeaderClassesProps {
  editClassName: () => void;
  headerText: string;
  type: "top" | "middle";
  rightHeaderText: string;
  editableNumber: number;
  readOnlyNumber: number;
  onLevelChange: (newValue: number) => void;
  isEditMode: boolean;
}

const CustomHeaderClasses: React.FC<CustomHeaderClassesProps> = ({
  editClassName,
  headerText,
  type,
  rightHeaderText,
  editableNumber,
  readOnlyNumber,
  onLevelChange,
  isEditMode,
}) => {

  const theme = useCustomTheme();
  
  const background = theme.mode === 'dark'
  ? `181a1b`
  : `white`;

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslate();

  return (
    <Grid item xs={12} sx={{ width: "100%", margin: "15px" }}>
      <Typography
        variant="h2"
        component="legend"
        sx={{
          color: theme.white,
          backgroundColor: theme.primary,
          textTransform: "uppercase",
          padding: "5px 10px",
          borderRadius: type === "top" ? "8px 8px 0 0" : 0,
          margin: type === "top" ? "-30px 0 0 -30px" : "0 0 0 -30px",
          fontSize: isMobile ? "1em" : "1.5em",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          lineHeight: "normal",
          textAlign: "center",
        }}
      >
        {isEditMode && <Tooltip title={t("Edit Class Name")}>
          <IconButton
            sx={{ px: 1, "&:hover": { color: theme.primary } }}
            onClick={editClassName}
          >
            <Edit fontSize="large" style={{ color: "white" }}/>
          </IconButton>
        </Tooltip>}
        <div style={{ flex: 1, textAlign: "left", paddingLeft: isEditMode ? 0 : 10 }}>
          {headerText}
        </div>
        <div
          style={{
            textAlign: "right",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ marginRight: "10px" }}>
            {rightHeaderText}
          </div>
          <TextField
            InputProps={{
              inputProps: { min: 1, max: 10, readOnly: !isEditMode, style: { textAlign: "center" }},
              style: {
                fontFamily: "inherit",
                fontSize: "inherit",
                backgroundColor: background,
              },
            }}
            value={editableNumber.toString()} // Ensure the value is a string
            onChange={(e) => {
              const value = e.target.value;
              // Allow empty input for user convenience
              if (
                value === "" ||
                (/^\d+$/.test(value) && +value >= 1 && +value <= 10)
              ) {
                onLevelChange(value === "" ? 0 : parseInt(value, 10)); // Assuming 0 as the default value for empty input
              }
            }}
            onBlur={(e) => {
              let value = parseInt(e.target.value, 10);
              if (isNaN(value) || value < 1) {
                value = 1;
              } else if (value > 10) {
                value = 10;
              }
              onLevelChange(value);
            }}
            variant="outlined"
            size="small"
            sx={{
              width: isMobile ? "40px" : "60px",
              textAlign: "center",
              marginRight: "4px",
              fontFamily: "inherit",
            }}
          />
          {" / "}
          <TextField
            InputProps={{
              inputProps: { min: 1, max: 10, readOnly: true, style: { textAlign: "center" } },
              style: {
                fontFamily: "inherit",
                fontSize: "inherit",
                backgroundColor: background,
              },
            }}
            value={readOnlyNumber}
            variant="outlined"
            size="small"
            sx={{
              width: isMobile ? "40px" : "60px",
              textAlign: "center",
              border: "none",
              fontFamily: "inherit",
            }}
          />
        </div>
      </Typography>
      {type === "top" && (
        <Divider
          orientation="horizontal"
          sx={{
            color: theme.secondary,
            borderBottom: "2px solid",
            borderColor: theme.secondary,
            margin: "0 0 0 -30px",
          }}
        />
      )}
    </Grid>
  );
};

export default CustomHeaderClasses;
