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
}

const SettingRow: React.FC<SettingRowProps> = ({ label, hint, children }) => {
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
          py: 1.5,
          px: 1,
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
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
            minWidth: isMobile ? "100%" : "150px",
            display: "flex",
            justifyContent: isMobile ? "flex-start" : "flex-end",
            alignItems: "center",
          }}
        >
          {children}
        </Box>
      </Box>
      <Divider />
    </>
  );
};

export default SettingRow;
