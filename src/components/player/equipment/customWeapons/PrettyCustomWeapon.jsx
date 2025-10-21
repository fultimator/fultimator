import React, { useRef } from "react";
import { Grid, Card, Stack, Typography, ThemeProvider, Tooltip, IconButton } from "@mui/material";
import { Download } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../../../translation/translate";
import useDownloadImage from "../../../../hooks/useDownloadImage";
import Export from "../../../Export";
import { attrNoTranslation } from "../../../../libs/attributes";

import { Martial } from "../../../icons";
import { OpenBracket, CloseBracket } from "../../../Bracket";
import Diamond from "../../../Diamond";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";

export default function PrettyCustomWeapon({ weaponData, isCharacterSheet = false, showActions = true }) {
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
  const [downloadImage, downloadSnackbar] = useDownloadImage(
    weaponData.name || "Custom Weapon",
    ref
  );

  // Helper function to get attribute display names
  const getAttributeDisplay = (attrKey) => {
    return attrNoTranslation[attrKey]?.shortcaps || attrKey?.toUpperCase().substring(0, 3) || "DEX";
  };

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

  // Calculate weapon stats based on customizations
  const getWeaponStats = () => {
    const baseCost = 300;
    let totalCost = baseCost;
    let damage = 5; // Base damage
    let precision = 0;
    let isMartial = false;
    let damageType = weaponData.type || "physical";

    weaponData.customizations?.forEach((customization) => {
      switch (customization.name) {
        case "weapon_customization_accurate":
          precision += 2;
          break;
        case "weapon_customization_elemental":
          damage += 2;
          break;
        case "weapon_customization_magicdefenseboost":
          isMartial = true;
          break;
        case "weapon_customization_powerful":
          if (weaponData.category === "weapon_category_heavy") {
            damage += 7;
          } else {
            damage += 5;
          }
          isMartial = true;
          break;
        case "weapon_customization_quick":
          isMartial = true;
          break;
        case "weapon_customization_transforming":
          totalCost += 100;
          break;
      }
    });

    // Apply overrides if specified
    if (weaponData.overrideDamage) {
      damage = weaponData.customDamageMod;
    }
    if (weaponData.overrideAccuracy) {
      precision = weaponData.customAccuracyMod;
    }
    if (weaponData.overrideType) {
      damageType = weaponData.customDamageType;
    }
    if (weaponData.overrideDamageType) {
      damageType = weaponData.customDamageType;
    }

    // Apply modifiers
    damage += parseInt(weaponData.damageModifier || 0);
    precision += parseInt(weaponData.precModifier || 0);

    return {
      cost: totalCost + parseInt(weaponData.qualityCost || 0), // Include quality cost as integer
      damage,
      precision,
      damageType,
      qualities: weaponData.quality || t("No Qualities"), // Use actual quality data
      martial: isMartial,
      // Include defensive modifiers for display
      defModifier: parseInt(weaponData.defModifier || 0),
      mDefModifier: parseInt(weaponData.mDefModifier || 0)
    };
  };

  const stats = getWeaponStats();

  return (
    <ThemeProvider theme={theme}>
      <Card>
        <div ref={ref} style={{ cardBackground }}>
          <Stack>
            {/* Header Row */}
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 1,
                background: `${theme.primary}`,
                color: "#ffffff",
                "& .MuiTypography-root": {
                  fontSize: isCharacterSheet ? "1rem" : "1.2rem",
                  textTransform: "uppercase",
                },
              }}
            >
              <Grid item xs={1}></Grid>
              <Grid item xs={3}>
                <Typography variant={isCharacterSheet ? "h5" : "h4"} textAlign="left">
                  {t("Weapon")}
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography variant={isCharacterSheet ? "h5" : "h4"} textAlign="center">
                  {t("Cost")}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant={isCharacterSheet ? "h5" : "h4"} textAlign="center">
                  {t("Accuracy")}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant={isCharacterSheet ? "h5" : "h4"} textAlign="center">
                  {t("Damage")}
                </Typography>
              </Grid>
            </Grid>

            <Grid container>
              {/* Main Content Row */}
              <Grid container direction="column" item xs={12}>
                {/* First Row - Weapon Info */}
                <Grid
                  container
                  justifyContent="space-between"
                  item
                  sx={{
                    background,
                    borderBottom: `1px solid ${theme.secondary}`,
                    padding: "5px",
                  }}
                >
                  <Grid
                    item
                    xs={3}
                    sx={{ display: "flex", alignItems: "flex-start", gap: "4px", flexWrap: "wrap" }}
                  >
                    <Typography
                      fontWeight="bold"
                      sx={{
                        flex: 1,
                        wordBreak: "break-word",
                        fontSize: isCharacterSheet ? "0.9rem" : "1rem"
                      }}
                    >
                      {weaponData.name || "Custom Weapon"}
                    </Typography>
                    {stats.martial && <Martial />}
                  </Grid>
                  <Grid item xs={1}>
                    <Typography
                      textAlign="center"
                      sx={{ fontSize: isCharacterSheet ? "0.9rem" : "1rem" }}
                    >
                      {`${stats.cost}z`}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      fontWeight="bold"
                      textAlign="center"
                      sx={{ fontSize: isCharacterSheet ? "0.9rem" : "1rem" }}
                    >
                      <OpenBracket />
                      {`${getAttributeDisplay(weaponData.accuracyCheck?.att1)} + ${getAttributeDisplay(weaponData.accuracyCheck?.att2)}`}
                      <CloseBracket />
                      {stats.precision !== 0 ? `+${stats.precision}` : ""}
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography
                      fontWeight="bold"
                      textAlign="center"
                      sx={{ fontSize: isCharacterSheet ? "0.9rem" : "1rem" }}
                    >
                      <OpenBracket />
                      {t("HR +")} {stats.damage}
                      <CloseBracket />
                      {t(stats.damageType)}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Category/Details Row */}
                <Grid
                  container
                  justifyContent="flex-end"
                  sx={{
                    background: "transparent",
                    borderBottom: `1px solid ${theme.secondary}`,
                    padding: "5px",
                  }}
                >
                  <Grid item xs={3}>
                    <Typography
                      fontWeight="bold"
                      sx={{ fontSize: isCharacterSheet ? "0.8rem" : "0.9rem" }}
                    >
                      {t(weaponData.category)}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Diamond color={theme.primary} />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      textAlign="center"
                      sx={{ fontSize: isCharacterSheet ? "0.8rem" : "0.9rem" }}
                    >
                      {t("Two-handed")}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Diamond color={theme.primary} />
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      textAlign="center"
                      sx={{ fontSize: isCharacterSheet ? "0.8rem" : "0.9rem" }}
                    >
                      {t(weaponData.range)}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              {/* Customizations and Qualities Row */}
              <Grid
                container
                spacing={0}
                justifyContent="center"
                sx={{
                  background: "transparent",
                  borderBottom: `1px solid ${theme.secondary}`,
                  padding: "5px",
                }}
              >
                <Grid item xs={12} sx={{ textAlign: "center" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    fontSize: isCharacterSheet ? "0.8rem" : "0.9rem"
                  }}>
                    {(() => {
                      const allItems = [];

                      // Add customizations
                      if (weaponData.customizations && weaponData.customizations.length > 0) {
                        weaponData.customizations.forEach((custom, index) => {
                          allItems.push(
                            <Typography
                              key={`custom-${index}`}
                              component="span"
                              sx={{ fontSize: isCharacterSheet ? "0.8rem" : "0.9rem" }}
                            >
                              {t(custom.name)}
                            </Typography>
                          );
                          allItems.push(<Diamond key={`diamond-custom-${index}`} color={theme.primary} />);
                        });
                      } else {
                        allItems.push(
                          <Typography
                            key="no-custom"
                            component="span"
                            sx={{ fontSize: isCharacterSheet ? "0.8rem" : "0.9rem" }}
                          >
                            {t("No Customizations")}
                          </Typography>
                        );
                        allItems.push(<Diamond key="diamond-no-custom" color={theme.primary} />);
                      }

                      // Add qualities
                      allItems.push(
                        <Typography
                          key="qualities"
                          component="span"
                          sx={{ fontSize: isCharacterSheet ? "0.8rem" : "0.9rem" }}
                        >
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
                            {stats.qualities}
                          </StyledMarkdown>
                        </Typography>
                      );

                      return allItems;
                    })()}
                  </div>
                </Grid>
              </Grid>
            </Grid>
          </Stack>
        </div>
      </Card>
      {showActions && (
        <div style={{ display: "flex" }}>
          <Tooltip title={t("Download as Image")}>
            <IconButton onClick={downloadImage}>
              <Download />
            </IconButton>
          </Tooltip>
          <Export
            name={`${weaponData.name || "Custom Weapon"}`}
            dataType="weapon"
            data={weaponData}
          />
        </div>
      )}
      {downloadSnackbar}
    </ThemeProvider>
  );
}