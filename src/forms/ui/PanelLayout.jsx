import React from "react";
import { Box, Grid } from "@mui/material";

/**
 * Two-column layout: form fields left, preview card right.
 * Used by ItemEditModal. QuickCreate has its own inline version with
 * share/download/export actions.
 */
export default function PanelLayout({ formContent, previewContent }) {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, md: 7 }}>{formContent}</Grid>
        <Grid size={{ xs: 12, md: 5 }} sx={{ position: "sticky", top: 0 }}>
          {previewContent}
        </Grid>
      </Grid>
    </Box>
  );
}
