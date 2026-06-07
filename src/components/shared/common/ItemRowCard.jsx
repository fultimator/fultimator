import React from "react";
import { Box, Paper, Typography, ButtonBase } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function ItemRowCard({
  label,
  subtitle,
  actions,
  onClick,
  onCardClick,
  minHeight,
  elevation = 0,
  variant = "outlined",
  paperSx,
  children,
  compact = false,
}) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const rowMinHeight = minHeight ?? (compact ? 40 : 44);
  const actionButtonSx = compact
    ? { p: 0, width: 28, height: 28, color: "#fff" }
    : { p: "2px", width: 32, height: 32, color: "#fff" };
  const actionIconSx = { fontSize: compact ? "1rem" : "1.15rem" };

  const labelContent = (
    <>
      {typeof label === "string" ? (
        <Typography
          noWrap
          sx={{
            fontFamily: "Antonio",
            fontWeight: 800,
            fontSize: compact ? "0.9rem" : "1rem",
            textTransform: "uppercase",
            lineHeight: 1.3,
          }}
        >
          {label}
        </Typography>
      ) : (
        label
      )}
      {subtitle && (
        <Box sx={{ fontSize: compact ? "0.82rem" : "0.9rem", lineHeight: 1.3, minWidth: 0 }}>
          {subtitle}
        </Box>
      )}
    </>
  );

  const labelAreaSx = {
    display: "flex",
    flexDirection: "column",
    justifyContent: subtitle ? "flex-start" : "center",
    alignItems: typeof label === "string" ? "flex-start" : "stretch",
    flex: 1,
    minWidth: 0,
    px: compact ? "8px" : "6px",
    py: typeof label === "string" ? "4px" : 0,
  };

  return (
    <Paper
      elevation={elevation}
      variant={variant}
      onClick={onCardClick}
      sx={{
        borderRadius: 1,
        backgroundImage: "none",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: onCardClick ? "pointer" : "default",
        ...paperSx,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "stretch", minHeight: rowMinHeight }}>
        {onClick ? (
          <ButtonBase
            onClick={onClick}
            sx={{
              ...labelAreaSx,
              textAlign: "left",
              borderRadius: "inherit",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            {labelContent}
          </ButtonBase>
        ) : (
          <Box sx={labelAreaSx}>{labelContent}</Box>
        )}

        {actions && (
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              bgcolor: primary,
              display: "flex",
              alignItems: "center",
              alignSelf: "stretch",
              px: "6px",
              gap: 0.25,
              flexShrink: 0,
              minWidth: "fit-content",
              borderRadius: "inherit",
              "& .MuiIconButton-root": actionButtonSx,
              "& .MuiSvgIcon-root": actionIconSx,
            }}
          >
            {actions}
          </Box>
        )}
      </Box>

      {children}
    </Paper>
  );
}
