import React, { useRef } from "react";
import { useTranslate } from "../../../../translation/translate";
import { Typography, Stack, Grid, Card } from "@mui/material";
import { Martial } from "../../../icons";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";

export default function PrettyArmor({ armor }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const background =
    theme.mode === "dark"
      ? `linear-gradient(90deg, ${theme.ternary}, rgba(24, 26, 27, 0) 100%)` // Dark mode gradient with black end
      : `linear-gradient(90deg, ${theme.ternary} 0%, #ffffff 100%)`; // Light mode gradient

  const cardBackground =
    theme.mode === "dark"
      ? `backgroundColor: "#181a1b", background: "#181a1b"`
      : `backgroundColor: "white", background: "white"`;

  const ref = useRef();

  const StyledMarkdown = ({ children, ...props }) => {
    return (
      <div style={{ whiteSpace: "pre-line", margin: 0, padding: 0 }}>
        <ReactMarkdown
          {...props}
          components={{
            p: (props) => <p style={{ margin: 0, padding: 0 }} {...props} />,
            ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
            li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
            strong: (props) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <>
      <Card>
        <div ref={ref} style={{ cardBackground }}>
          <Stack>
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 1,
                background: `${theme.primary}`,
                color: "#ffffff",
                "& .MuiTypography-root": {
                  fontSize: { xs: "0.6rem", sm: "1.2rem" },
                  textTransform: "uppercase",
                },
              }}
            >
              <Grid item xs={0} sm={1}></Grid>
              <Grid item xs={2}>
                <Typography variant="h4" textAlign="left">
                  {t(armor.category)}
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography variant="h4" textAlign="center">
                  {t("Cost")}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="h4" textAlign="center">
                  {t("Defense")}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="h4" textAlign="center">
                  {t("M. Defense")}
                </Typography>
              </Grid>
              {!armor.rework && (
                <Grid item xs={2}>
                  <Typography variant="h4" textAlign="center">
                    {t("Initiative")}
                  </Typography>
                </Grid>
              )}
            </Grid>
            <Grid container>
              <Grid container direction="column" item xs>
                {/* First Row */}
                <Grid
                  container
                  justifyContent="space-between"
                  item
                  sx={{
                    background,
                    borderBottom: `1px solid ${theme.secondary}`,
                    padding: "5px",
                    "& .MuiTypography-root": {
                      fontSize: { xs: "0.7rem", sm: "1.0rem" },
                    },
                  }}
                >
                  <Grid
                    item
                    xs={3}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography fontWeight="bold" sx={{ marginRight: "4px" }}>
                      {t(armor.name)}
                    </Typography>
                    {armor.martial && <Martial />}
                  </Grid>
                  <Grid item xs={1}>
                    <Typography textAlign="center">{`${armor.cost}z`}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography fontWeight="bold" textAlign="center">
                      {armor.category === "Shield"
                        ? "+" + parseInt(armor.def + (armor.defModifier || 0))
                        : ""}
                      {armor.category === "Armor" && armor.martial
                        ? armor.def + (armor.defModifier || 0)
                        : ""}
                      {armor.category === "Armor" && !armor.martial
                        ? armor.def + (armor.defModifier || 0) === 0
                          ? t("DEX die")
                          : `${t("DEX die")} + ${
                              armor.def + (armor.defModifier || 0)
                            }`
                        : ""}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography fontWeight="bold" textAlign="center">
                      {armor.category === "Shield"
                        ? "+" + parseInt(armor.mdef + (armor.mDefModifier || 0))
                        : ""}
                      {armor.category === "Armor"
                        ? armor.martial
                          ? armor.mdef + (armor.mDefModifier || 0)
                          : armor.mdef + (armor.mDefModifier || 0) === 0
                            ? t("INS die")
                            : `${t("INS die")} + ${
                                armor.mdef + (armor.mDefModifier || 0)
                              }`
                        : ""}
                    </Typography>
                  </Grid>
                  {!armor.rework && (
                    <Grid item xs={2}>
                      <Typography fontWeight="bold" textAlign="center">
                        {armor.category === "Armor" ||
                        armor.category === "Shield"
                          ? armor.init + (armor.initModifier || 0) === 0
                            ? "-"
                            : (armor.init + (armor.initModifier || 0) > 0
                                ? "+"
                                : "") +
                              parseInt(armor.init + (armor.initModifier || 0))
                          : ""}
                      </Typography>
                    </Grid>
                  )}
                </Grid>

                {/* Second Row */}
                <Typography
                  sx={{
                    background: "transparent",
                    borderBottom: `1px solid ${theme.secondary}`,
                    px: 1,
                    py: 1,
                  }}
                >
                  {!armor.quality && t("No Qualities")}{" "}
                  <StyledMarkdown
                    components={{
                      strong: (props) => (
                        <strong style={{ fontWeight: "bold" }} {...props} />
                      ),
                      em: (props) => (
                        <em style={{ fontStyle: "italic" }} {...props} />
                      ),
                    }}
                  >
                    {armor.quality}
                  </StyledMarkdown>
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </div>
      </Card>
    </>
  );
}
