import React, { useRef } from "react";
import { Grid, Card, Stack, Typography } from "@mui/material";
import { styled } from "@mui/system";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../../../translation/translate";

import attributes from "../../../../libs/attributes";
import types from "../../../../libs/types";

import { Martial } from "../../../icons";
import { OpenBracket, CloseBracket } from "../../../Bracket";
import Diamond from "../../../Diamond";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";

export default function PrettyWeapon({ weapon, showActions }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const background = theme.mode === 'dark'
  ? `linear-gradient(90deg, ${theme.ternary}, rgba(24, 26, 27, 0) 100%)` // Dark mode gradient with black end
  : `linear-gradient(90deg, ${theme.ternary} 0%, #ffffff 100%)`; // Light mode gradient

  const background2 = theme.mode === 'dark'
  ? `black`
  : `white`;

  const cardBackground = theme.mode === 'dark'
  ? `backgroundColor: "#181a1b", background: "#181a1b"`
  : `backgroundColor: "white", background: "white"`


  const ref = useRef();

  const StyledMarkdown = styled(ReactMarkdown)({
    whiteSpace: "pre-line",
  });

  return (
    <>
      <Card>
        <div
          ref={ref}
          style={{ cardBackground }}
        >
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
              <Grid item xs={1}></Grid>
              <Grid item xs={2} md={3}>
                <Typography variant="h4" textAlign="left">
                  {t("Weapon")}
                </Typography>
              </Grid>
              <Grid item xs={2} md={1}>
                <Typography variant="h4" textAlign="center">
                  {t("Cost")}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h4" textAlign="center">
                  {t("Accuracy")}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h4" textAlign="center">
                  {t("Damage")}
                </Typography>
              </Grid>
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
                      {t(weapon.name)}
                    </Typography>
                    {weapon.martial && <Martial />}
                  </Grid>
                  <Grid item xs={1}>
                    <Typography textAlign="center">{`${weapon.cost}z`}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography fontWeight="bold" textAlign="center">
                      <OpenBracket />
                      {`${attributes[weapon.att1].shortcaps} + ${
                        attributes[weapon.att2].shortcaps
                      }`}
                      <CloseBracket />
                      {weapon.prec > 0
                        ? `+${weapon.prec}`
                        : weapon.prec < 0
                        ? `${weapon.prec}`
                        : ""}
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography fontWeight="bold" textAlign="center">
                      <OpenBracket />
                      {t("HR")} {weapon.damage >= 0 ? "+" : ""} {weapon.damage}
                      <CloseBracket />
                      {types[weapon.type].long}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Second Row */}
                <Grid
                  container
                  justifyContent="flex-end"
                  sx={{
                    background: "transparent",
                    borderBottom: `1px solid ${theme.secondary}`,
                    padding: "5px",
                    "& .MuiTypography-root": {
                      fontSize: { xs: "0.7rem", sm: "1.0rem" },
                    },
                  }}
                >
                  <Grid item xs={3}>
                    <Typography fontWeight="bold">
                      {t(weapon.category)}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Diamond color={theme.primary} />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography textAlign="center">
                      {weapon.hands === 1 && t("One-handed")}
                      {weapon.hands === 2 && t("Two-handed")}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Diamond color="{primary}" />
                  </Grid>
                  <Grid item xs={3}>
                    <Typography textAlign="center">
                      {weapon.melee && t("Melee")}
                      {weapon.ranged && t("Ranged")}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <div
              style={{
                fontSize: "0.7rem",
                background2,
              }}
            >
              {!weapon.quality && (
                <Typography
                  fontSize={{ xs: "0.7rem", sm: "1.0rem" }}
                  sx={{
                    background2,
                    px: 1,
                    py: 1,
                  }}
                >
                  {!weapon.quality && t("No Qualities")}
                </Typography>
              )}
              {weapon.quality && (
                <StyledMarkdown
                  allowedElements={["strong", "em"]}
                  unwrapDisallowed={true}
                  sx={{
                    fontSize: { xs: "0.9rem", sm: "1.0rem" },
                    fontFamily: "PT Sans Narrow",
                    px: 1,
                    py: 1,
                  }}
                >
                  {weapon.quality}
                </StyledMarkdown>
              )}
            </div>
          </Stack>
        </div>
      </Card>
    </>
  );
}
