import React from "react";
import { Grid, Typography } from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";

export function NpcImmunities({ npc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const background =
    theme.mode === "dark"
      ? `linear-gradient(90deg, #1E2122 0%, rgba(255, 255, 255, 0) 100%)`
      : `linear-gradient(90deg, #f6f4f9 0%, #ffffff 100%)`;

  const backgroundColor = theme.mode === "dark" ? `#583871` : `#6e468d`;

  const immunitiesLabels = {
    slow: t("slow"),
    dazed: t("dazed"),
    weak: t("weak"),
    shaken: t("shaken"),
    enraged: t("enraged"),
    poisoned: t("poisoned"),
  };

  const trueImmunities = Object.keys(immunitiesLabels)
    .filter((key) => npc.immunities?.[key])
    .map((key) => immunitiesLabels[key]);

  if (trueImmunities.length === 0) return null;

  const immunitiesList = trueImmunities.join(", ") + ".";

  return (
    <Grid
      container
      sx={{
        justifyContent: "space-between",
        mt: 1,
        py: 0.1,
      }}
    >
      <Grid
        sx={{
          textAlign: "center",
          backgroundColor: backgroundColor,
          color: `${theme.white}`,
          display: "flex",
          alignItems: "center",
          flex: "0 0 auto",
          width: "33%",
          "@container (min-width: 360px)": { width: "25%" },
          "@container (min-width: 480px)": { width: "16.666%" },
        }}
      >
        <Typography
          sx={{
            color: "white.main",
            fontFamily: "Antonio",
            fontSize: "1.1rem",
            fontWeight: "medium",
            textTransform: "uppercase",
            margin: "auto",
            whiteSpace: "nowrap",
          }}
        >
          {t("Immunities")}
        </Typography>
      </Grid>
      <Grid
        sx={{
          px: 1,
          display: "flex",
          alignItems: "center",
          background: background,
          flex: "1 1 0",
        }}
      >
        <Typography sx={{ fontWeight: "bold", margin: "auto 0" }}>
          {immunitiesList}
        </Typography>
      </Grid>
    </Grid>
  );
}
