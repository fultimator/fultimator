import React, { useRef } from "react";
import { useTranslate } from "../../../../translation/translate";
import { Typography, Stack, Grid, Card } from "@mui/material";
import { Martial } from "../../../icons";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";

const resolveDef      = (a) => a.def      || 0;
const resolveMdef     = (a) => a.mdef     || 0;
const resolveCategory = (a) => a.category || a.base?.category || 'Armor';

export default function PrettyArmor({ armor, isCharacterSheet, showCard = true, showHeader = true }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const def      = resolveDef(armor);
  const mdef     = resolveMdef(armor);
  const category = resolveCategory(armor);

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
            container sx={{
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
                {t(category)}
              </Typography>
            </Grid>
            <Grid  size={1}>
              <Typography sx={{ textAlign: "center" }}>
                {t("Cost")}
              </Typography>
            </Grid>
            <Grid  size={2}>
              <Typography sx={{ textAlign: "center" }}>
                {t("Defense")}
              </Typography>
            </Grid>
            <Grid  size={2}>
              <Typography sx={{ textAlign: "center" }}>
                {t("M. Defense")}
              </Typography>
            </Grid>
            {!armor.rework && (
              <Grid  size={2}>
                <Typography sx={{ textAlign: "center" }}>
                  {t("Initiative")}
                </Typography>
              </Grid>
            )}
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
                  {t(armor.name)}
                </Typography>
                {armor.martial && <Martial />}
              </Grid>
              <Grid  size={1}>
                <Typography sx={{ textAlign: "center" }}>{`${armor.cost}z`}</Typography>
              </Grid>
              <Grid  size={2}>
                <Typography sx={{ textAlign: "center" }}>
                  {category === "Shield"
                    ? "+" + parseInt(def + (armor.defModifier || 0))
                    : ""}
                  {category === "Armor" && armor.martial
                    ? def + (armor.defModifier || 0)
                    : ""}
                  {category === "Armor" && !armor.martial
                    ? def + (armor.defModifier || 0) === 0
                      ? t("DEX die")
                      : `${t("DEX die")} + ${def + (armor.defModifier || 0)}`
                    : ""}
                </Typography>
              </Grid>
              <Grid  size={2}>
                <Typography sx={{ textAlign: "center" }}>
                  {category === "Shield"
                    ? "+" + parseInt(mdef + (armor.mDefModifier || 0))
                    : ""}
                  {category === "Armor"
                    ? mdef + (armor.mDefModifier || 0) === 0
                      ? t("INS die")
                      : `${t("INS die")} + ${mdef + (armor.mDefModifier || 0)}`
                    : ""}
                </Typography>
              </Grid>
              {!armor.rework && (
                <Grid  size={2}>
                  <Typography sx={{ textAlign: "center" }}>
                    {category === "Armor" || category === "Shield"
                      ? armor.init + (armor.initModifier || 0) === 0
                        ? "-"
                        : (armor.init + (armor.initModifier || 0) > 0 ? "+" : "") +
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
                py: 0.5,
              }}
            >
              {!armor.quality}{" "}
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
                {armor.quality}
              </StyledMarkdown>
            </Typography>
          </Grid>
        </Grid>
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
