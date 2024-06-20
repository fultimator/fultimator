import React from "react";
import { Paper, Grid, Typography, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";

export default function PlayerNotes({ player, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  return (
    <>
      {player.notes.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Paper
            elevation={3}
            sx={{
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
              display: "flex",
              flexDirection: "column", // Ensure the children are in column layout
            }}
          >
            <Typography
              variant="h1"
              sx={{
                textTransform: "uppercase",
                padding: "5px", // Adjust padding instead of margins
                backgroundColor: primary,
                color: ternary,
                borderRadius: "8px 8px 0 0", // Rounded corners only at the top
                fontSize: "1.5em",
              }}
              align="center"
            >
              {t("Notes")}
            </Typography>

            <Grid container spacing={2} sx={{ padding: "1em" }}>
              {/* Add your content here */}
              {player.notes.map((note, index) => (
                <Grid item xs={12} key={index}>
                  <Typography
                    variant="h3"
                    fontWeight={"bold"}
                    sx={{ textTransform: "uppercase" }}
                  >
                    {note.name + ": "}
                  </Typography>
                  <ReactMarkdown>{note.description}</ReactMarkdown>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}
    </>
  );
}
