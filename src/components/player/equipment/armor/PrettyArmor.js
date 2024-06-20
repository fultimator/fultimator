import React, { useRef } from "react";
import { useTranslate } from "../../../../translation/translate";
import { useTheme, Typography, Stack, Grid, Card } from "@mui/material";
import { Martial } from "../../../icons";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";

export default function PrettyArmor({ armor, showActions }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;
  const white = theme.palette.white.main;

  const ref = useRef();

  const StyledMarkdown = styled(ReactMarkdown)({
    whiteSpace: "pre-line",
  });

  return (
    <>
      <Card>
        <div
          ref={ref}
          style={{ backgroundColor: "white", background: "white" }}
        >
          <Stack>
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 1,
                background: `${primary}`,
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
                    background: `linear-gradient(to right, ${ternary}, ${white})`,
                    borderBottom: `1px solid ${secondary}`,
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
                        ? armor.mdef + (armor.mDefModifier || 0) === 0
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
                <Grid
                  container
                  justifyContent="flex-start"
                  sx={{
                    background: "transparent",
                    padding: "5px",
                    px: 1,
                    py: 1,
                  }}
                >
                  <Typography fontSize={{ xs: "0.7rem", sm: "1.0rem" }}>
                    {!armor.quality && t("No Qualities")}{" "}
                    <StyledMarkdown
                      allowedElements={["strong", "em"]}
                      unwrapDisallowed={true}
                      sx={{ fontSize: { xs: "0.9rem", sm: "1.0rem" } }}
                    >
                      {armor.quality}
                    </StyledMarkdown>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Stack>
        </div>
      </Card>
    </>
  );
}
