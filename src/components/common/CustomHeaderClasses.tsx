import React from "react";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { AccordionSummary, useMediaQuery } from "@mui/material";
import { Grid, Tooltip, TextField, Box } from "@mui/material";
import { Edit } from "@mui/icons-material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
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
  isNumberReadOnly?: boolean;
  isAccordion?: boolean;
  isExpanded?: boolean;
  actions?: React.ReactNode;
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
  isNumberReadOnly = false,
  isAccordion = false,
  actions,
}) => {
  const theme = useCustomTheme();
  const color = theme.mode === "dark" ? `#ffffff` : `#000000`;
  const background = theme.mode === "dark" ? `#212425` : `#ffffff`;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslate();

  const headerStyles: React.CSSProperties = {
    color: theme.white,
    backgroundColor: theme.primary,
    textTransform: "uppercase",
    padding: "5px 10px",
    fontSize: isMobile ? "1em" : "1.5em",
    fontFamily: "Antonio, sans-serif",
    fontWeight: "normal",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    lineHeight: "normal",
    width: "100%",
    boxSizing: "border-box",
  };

  const content = (
    <>
      {isEditMode && (
        <Tooltip title={t("Edit Class Name")}>
          <IconButton
            size="small"
            sx={{ px: 1, "&:hover": { color: theme.primary } }}
            onClick={(e) => {
              e.stopPropagation();
              editClassName();
            }}
          >
            <Edit fontSize="large" style={{ color: "white" }} />
          </IconButton>
        </Tooltip>
      )}
      <div
        style={{ flex: 1, textAlign: "left", paddingLeft: isEditMode ? 0 : 10 }}
      >
        {headerText}
      </div>
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{ display: "flex", alignItems: "center", gap: "2px" }}
      >
        <div style={{ marginRight: "10px" }}>{rightHeaderText}</div>
        <TextField
          value={editableNumber.toString()}
          onChange={(e) => {
            const value = e.target.value;
            if (
              value === "" ||
              (/^\d+$/.test(value) && +value >= 1 && +value <= 10)
            ) {
              onLevelChange(value === "" ? 0 : parseInt(value, 10));
            }
          }}
          onBlur={(e) => {
            let value = parseInt(e.target.value, 10);
            if (isNaN(value) || value < 1) value = 1;
            else if (value > 10) value = 10;
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
          slotProps={{
            input: {
              inputProps: {
                min: 1,
                max: 10,
                readOnly: !isEditMode || isNumberReadOnly,
                style: { textAlign: "center" },
              },
              style: {
                color,
                fontFamily: "inherit",
                fontSize: "inherit",
                backgroundColor: background,
              },
            },
          }}
        />
        {" / "}
        <TextField
          value={readOnlyNumber}
          variant="outlined"
          size="small"
          sx={{
            width: isMobile ? "40px" : "60px",
            textAlign: "center",
            border: "none",
            fontFamily: "inherit",
          }}
          slotProps={{
            input: {
              inputProps: { readOnly: true, style: { textAlign: "center" } },
              style: {
                color,
                fontFamily: "inherit",
                fontSize: "inherit",
                backgroundColor: background,
              },
            },
          }}
        />
        {actions && (
          <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
            {actions}
          </Box>
        )}
      </Box>
    </>
  );

  if (isAccordion) {
    return (
      <AccordionSummary
        expandIcon={<ArrowDownwardIcon sx={{ color: "#ffffff" }} />}
        sx={{
          backgroundColor: theme.primary,
          padding: "0 16px 0 0 !important",
          "&.Mui-expanded": {
            padding: "0 16px 0 0 !important",
            minHeight: "unset !important",
          },
          minHeight: "unset !important",
          "& .MuiAccordionSummary-content": {
            margin: "0 !important",
            display: "flex",
            alignItems: "center",
            width: "100%",
          },
          "& .MuiAccordionSummary-expandIconWrapper": {
            color: "#ffffff",
            flexShrink: 0,
            marginLeft: "8px",
          },
          "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
            marginLeft: "8px",
          },
        }}
      >
        <div style={headerStyles}>{content}</div>
      </AccordionSummary>
    );
  }

  return (
    <Grid sx={{ width: "100%", margin: "15px" }} size={12}>
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
        {content}
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
