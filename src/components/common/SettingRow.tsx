import React from "react";
import {
  Box,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";

interface SettingRowProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
  showDivider?: boolean;
  dense?: boolean;
  compactControl?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  label,
  hint,
  children,
  showDivider = true,
  dense = false,
  compactControl = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          py: dense ? 0.75 : 1.5,
          px: 1,
          gap: dense ? 1 : 2,
        }}
      >
        <Box sx={{ flex: 1, pr: isMobile ? 0 : 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          {hint && (
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", mt: 0.5 }}
            >
              {hint}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            flex: compactControl ? "0 0 auto" : 1,
            display: "flex",
            justifyContent: isMobile ? "flex-start" : "flex-end",
            alignItems: "center",
            minWidth: 0,
            ml: compactControl && !isMobile ? 1 : 0,
          }}
        >
          {children}
        </Box>
      </Box>
      {showDivider && <Divider />}
    </>
  );
};

export default SettingRow;
