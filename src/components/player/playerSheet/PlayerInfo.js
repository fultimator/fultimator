import React from "react";
import {
  Paper,
  Grid,
  Typography,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";

export default function PlayerInfo({ player, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  return (
    <Paper
      elevation={3}
      sx={{
        p: "15px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Typography variant="h4">
            <span
              style={{
                fontWeight: "bolder",
                fontSize: "1.4rem",
                textTransform: "uppercase",
              }}
            >
              {t("Identity") + ": "}
            </span>
            <span
              style={{
                fontSize: "1.2rem",
                textTransform: "uppercase",
              }}
            >
              {player.info.identity}
            </span>
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4">
            <span
              style={{
                fontWeight: "bolder",
                fontSize: "1.4rem",
                textTransform: "uppercase",
              }}
            >
              {t("Theme") + ": "}
            </span>
            <span
              style={{
                fontSize: "1.2rem",
                textTransform: "uppercase",
              }}
            >
              {player.info.theme}
            </span>
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4">
            <span
              style={{
                fontWeight: "bolder",
                fontSize: "1.4rem",
                textTransform: "uppercase",
              }}
            >
              {t("Origin") + ": "}
            </span>
            <span
              style={{
                fontSize: "1.2rem",
                textTransform: "uppercase",
              }}
            >
              {player.info.origin}
            </span>
          </Typography>
        </Grid>
        {player.info.description && (
          <>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h4">
                <span
                  style={{
                    fontWeight: "bolder",
                    fontSize: "1.4rem",
                    textTransform: "uppercase",
                  }}
                >
                  {t("Description") + ": "}
                </span>
              </Typography>
              <ReactMarkdown children={player.info.description} />
            </Grid>
          </>
        )}
      </Grid>
    </Paper>
  );
}
