import React from "react";
import { Paper, Grid, Typography, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

export default function PlayerBonds({ player, isEditMode, isCharacterSheet }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const positiveColor = theme.palette.success.main; // Positive color (green)
  const negativeColor = "red"; // Negative color (red)

  const FilledStarSVG = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 95.74 95.98"
      width="18"
      height="18"
    >
      <path
        fill="black" // Adjust the fill color to match the gold star
        opacity=".96"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="6px"
        d="M33.55,33.94l-28.7,11.66c-2.5,1.01-2.46,4.56.06,5.52l29,11.08,11.7,28.97c.98,2.43,4.44,2.41,5.39-.04l11.28-29.09,28.57-11.79c2.54-1.05,2.51-4.66-.05-5.66l-28.84-11.27-11.73-28.5c-1.02-2.47-4.54-2.43-5.5.06l-11.18,29.04Z"
      />
    </svg>
  );

  const calculateBondStrength = (bond) => {
    return (
      (bond.admiration ? 1 : 0) +
      (bond.loyality ? 1 : 0) +
      (bond.affection ? 1 : 0) +
      (bond.inferiority ? 1 : 0) +
      (bond.mistrust ? 1 : 0) +
      (bond.hatred ? 1 : 0)
    );
  };

  return (
    <>
      {player.info.bonds.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Paper
            elevation={3}
            sx={
              isCharacterSheet
                ? {
                    borderRadius: "8px",
                    border: "2px solid",
                    borderColor: secondary,
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "none"
                  }
                : {
                    borderRadius: "8px",
                    border: "2px solid",
                    borderColor: secondary,
                    display: "flex",
                  }
            }
          >
            {isCharacterSheet ? (
              <Typography
                variant="h1"
                sx={{
                  textTransform: "uppercase",
                  padding: "5px", // Adjust padding instead of margins
                  backgroundColor: primary,
                  color: custom.white,
                  borderRadius: "8px 8px 0 0", // Rounded corners only at the top
                  fontSize: "1.5em",
                }}
                align="center"
              >
                {t("Bonds")}
              </Typography>
            ) : (
              <Typography
                variant="h1"
                sx={{
                  writingMode: "vertical-lr",
                  textTransform: "uppercase",
                  marginLeft: "-1px",
                  marginRight: "10px",
                  marginTop: "-1px",
                  marginBottom: "-1px",
                  backgroundColor: primary,
                  color: custom.white,
                  borderRadius: "0 8px 8px 0",
                  transform: "rotate(180deg)",
                  fontSize: "2em",
                  minHeight: "100px",
                }}
                align="center"
              >
                {t("Bonds")}
              </Typography>
            )}

            <Grid container spacing={2} sx={{ padding: "1em" }}>
              {player.info.bonds && player.info.bonds.length > 0
                ? player.info.bonds.map((bond, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Typography variant="h4">
                        <span
                          style={{
                            fontWeight: "bolder",
                            fontSize: "1.6em",
                            textTransform: "uppercase",
                          }}
                        >
                          <span style={{ wordWrap: "break-word" }}>
                            {bond.name + ": "}
                          </span>
                        </span>
                        <span
                          style={{
                            fontSize: "1.4em",
                            textTransform: "uppercase",
                          }}
                        >
                          {/* BOND TYPES
                    Admiration
                    Loyality
                    Affection
                    Inferiority
                    Mistrust
                    Hatred*/}
                          {[
                            bond.admiration && (
                              <span
                                key="admiration"
                                style={{ color: positiveColor }}
                              >
                                {t("Admiration")}
                              </span>
                            ),
                            bond.loyality && (
                              <span
                                key="loyality"
                                style={{ color: positiveColor }}
                              >
                                {t("Loyality")}
                              </span>
                            ),
                            bond.affection && (
                              <span
                                key="affection"
                                style={{ color: positiveColor }}
                              >
                                {t("Affection")}
                              </span>
                            ),
                            bond.inferiority && (
                              <span
                                key="inferiority"
                                style={{ color: negativeColor }}
                              >
                                {t("Inferiority")}
                              </span>
                            ),
                            bond.mistrust && (
                              <span
                                key="mistrust"
                                style={{ color: negativeColor }}
                              >
                                {t("Mistrust")}
                              </span>
                            ),
                            bond.hatred && (
                              <span
                                key="hatred"
                                style={{ color: negativeColor }}
                              >
                                {t("Hatred")}
                              </span>
                            ),
                          ]
                            .filter(Boolean)
                            .reduce(
                              (acc, curr, i, arr) => [
                                ...acc,
                                curr,
                                i < arr.length - 1 ? ", " : "",
                              ],
                              []
                            )}
                          {calculateBondStrength(bond) > 0 && (
                            <span>
                              {" "}
                              <Typography
                                component="span"
                                sx={{ ml: -1, mr: 0, fontSize: "1.2em" }}
                              >
                                【
                              </Typography>
                              {FilledStarSVG}
                              {calculateBondStrength(bond)}
                              <Typography
                                component="span"
                                sx={{ mr: -0.7, fontSize: "1.2em" }}
                              >
                                】
                              </Typography>
                            </span>
                          )}
                        </span>
                      </Typography>
                    </Grid>
                  ))
                : null}
            </Grid>
          </Paper>
        </>
      )}
    </>
  );
}
