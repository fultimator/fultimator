import React, { useRef } from "react";
import { Grid, Card, Stack, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../../../translation/translate";

import attributes from "../../../../libs/attributes";
import types from "../../../../libs/types";

import { Martial } from "../../../icons";
import { OpenBracket, CloseBracket } from "../../../Bracket";
import Diamond from "../../../Diamond";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";

export default function PrettyWeapon({ weapon, isCharacterSheet, showCard = true, showHeader = true }) {
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
            p: ({ _node, ...props }) => <p style={{ margin: 0, padding: 0 }} {...props} />,
            ul: ({ _node, ...props }) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
            li: ({ _node, ...props }) => <li style={{ margin: 0, padding: 0 }} {...props} />,
            strong: ({ _node, ...props }) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: ({ _node, ...props }) => <em style={{ fontStyle: "italic" }} {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  };

  const content = (
    <div ref={ref} style={{ cardBackground }}>
      <Stack>
        {showHeader && (
          <Grid
            container
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              p: 0.5,
              background: `${theme.primary}`,
              color: "#ffffff",
              "& .MuiTypography-root": {
                fontSize: { xs: "0.6rem", sm: "1.0rem" },
                textTransform: "uppercase",
              },
            }}
          >
            <Grid  size={3}>
              <Typography sx={{ textAlign: "left" }}>
                {t("Weapon")}
              </Typography>
            </Grid>
            <Grid  size={1}>
              <Typography sx={{ textAlign: "center" }}>
                {t("Cost")}
              </Typography>
            </Grid>
            <Grid  size={4}>
              <Typography sx={{ textAlign: "center" }}>
                {t("Accuracy")}
              </Typography>
            </Grid>
            <Grid  size={4}>
              <Typography sx={{ textAlign: "center" }}>
                {t("Damage")}
              </Typography>
            </Grid>
          </Grid>
        )}
        <Grid container>
          <Grid container direction="column"  size="grow">
            {/* First Row */}
            <Grid
              container sx={{
                justifyContent: "space-between",
                background,
                borderBottom: `1px solid ${theme.secondary}`,
                padding: "2px 5px",
                "& .MuiTypography-root": {
                  fontSize: { xs: "0.7rem", sm: "1.0rem" },
                },
              }}>
              <Grid sx={{ display: "flex", alignItems: "center" }} size={3}>
                <Typography sx={{ fontWeight: "bold", marginRight: "4px" }}>
                  {t(weapon.name)}
                </Typography>
                {weapon.martial && <Martial />}
              </Grid>
              <Grid  size={1}>
                <Typography sx={{ textAlign: "center" }}>{`${weapon.cost}z`}</Typography>
              </Grid>
              <Grid  size={4}>
                <Typography sx={{ textAlign: "center" }}>
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

              <Grid  size={4}>
                <Typography sx={{ textAlign: "center" }}>
                  <OpenBracket />
                  {t("HR")} {weapon.damage >= 0 ? "+" : ""} {weapon.damage}
                  <CloseBracket />
                  {types[weapon.type].long}
                </Typography>
              </Grid>
            </Grid>

            {/* Second Row */}
            <Grid
              container sx={{
                justifyContent: "flex-end",
                background: "transparent",
                borderBottom: `1px solid ${theme.secondary}`,
                padding: "2px 5px",
                "& .MuiTypography-root": {
                  fontSize: { xs: "0.7rem", sm: "1.0rem" },
                },
              }}
            >
              <Grid  size={3}>
                <Typography sx={{ fontWeight: "bold" }}>
                  {t(weapon.category)}
                </Typography>
              </Grid>
              <Grid  size={1}>
                <Diamond color={theme.primary} />
              </Grid>
              <Grid  size={4}>
                <Typography sx={{ textAlign: "center" }}>
                  {weapon.hands === 1 && t("One-handed")}
                  {weapon.hands === 2 && t("Two-handed")}
                </Typography>
              </Grid>
              <Grid  size={1}>
                <Diamond color="{primary}" />
              </Grid>
              <Grid  size={3}>
                <Typography sx={{ textAlign: "center" }}>
                  {weapon.melee && t("Melee")}
                  {weapon.ranged && t("Ranged")}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Typography
          component="div"
          sx={{
            background: "transparent",
            borderBottom: `1px solid ${theme.secondary}`,
            px: 1,
            py: 0.5,
          }}
        >
          {!weapon.quality && t("No Qualities")}{" "}
          <StyledMarkdown
            components={{
              strong: ({ _node, ...props }) => (
                <strong style={{ fontWeight: "bold" }} {...props} />
              ),
              em: ({ _node, ...props }) => (
                <em style={{ fontStyle: "italic" }} {...props} />
              ),
            }}
          >
            {weapon.quality}
          </StyledMarkdown>
        </Typography>
      </Stack>
    </div>
  );

  if (!showCard) return content;

  return (
    <>
      <Card sx={{ boxShadow: isCharacterSheet ? 0 : 2 }}>
        {content}
      </Card>
    </>
  );
}
