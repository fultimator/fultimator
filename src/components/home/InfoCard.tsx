import React from "react";
import { Box, Paper, Typography } from "@mui/material";

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
}

export default function InfoCard({
  icon,
  title,
  children,
  actions,
  aside,
}: InfoCardProps) {
  return (
    <Paper
      sx={{
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { md: "center" },
        gap: 3,
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: "bold",
            color: "text.primary",
          }}
        >
          {icon}
          {title}
        </Typography>
        <Box sx={{ flex: 1, display: "grid", gap: 2, alignContent: "start" }}>
          {children}
        </Box>
        {actions && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 2,
              "& .MuiButton-root": {
                minHeight: 48,
                px: 3,
                fontSize: "1rem",
                fontWeight: "bold",
              },
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
      {aside}
    </Paper>
  );
}
