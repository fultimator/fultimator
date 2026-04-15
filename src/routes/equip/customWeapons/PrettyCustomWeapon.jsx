import { useRef, useState } from "react";
import {
  Card,
  Grid,
  Stack,
  Typography,
  ThemeProvider,
  Tooltip,
  IconButton,
  Box,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Martial } from "../../../components/icons";
import ReactMarkdown from "react-markdown";
import { attrNoTranslation } from "../../../libs/attributes";
import { OpenBracket, CloseBracket } from "../../../components/Bracket";
import Diamond from "../../../components/Diamond";
import { Download } from "@mui/icons-material";
import EditableImage from "../../../components/EditableImage";
import useDownloadImage from "../../../hooks/useDownloadImage";
import Export from "../../../components/Export";
import AddToCompendiumButton from "../../../components/compendium/AddToCompendiumButton";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function PrettyCustomWeapon({
  weaponData,
  showActions = true,
  showImageOverride = undefined,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [showImage, setShowImage] = useState(false);

  const background =
    theme.mode === "dark"
      ? `linear-gradient(90deg, ${theme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${theme.ternary} 0%, #ffffff 100%)`;

  const imageBackground = theme.mode === "dark" ? "#181a1b" : "white";

  const cardBackground =
    theme.mode === "dark"
      ? `backgroundColor: "#181a1b", background: "#181a1b"`
      : `backgroundColor: "white", background: "white"`;

  const ref = useRef();
  const [downloadImage, downloadSnackbar] = useDownloadImage(
    weaponData.name || "Custom Weapon",
    ref,
  );

  const StyledMarkdown = ({ children, ...props }) => {
    return (
      <div style={{ whiteSpace: "pre-line", margin: 0, padding: 0 }}>
        <ReactMarkdown
          {...props}
          components={{
            p: ({ _node, ...props }) => (
              <p style={{ margin: 0, padding: 0 }} {...props} />
            ),
            ul: ({ _node, ...props }) => (
              <ul style={{ margin: 0, padding: 0 }} {...props} />
            ),
            li: ({ _node, ...props }) => (
              <li style={{ margin: 0, padding: 0 }} {...props} />
            ),
            strong: ({ _node, ...props }) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: ({ _node, ...props }) => (
              <em style={{ fontStyle: "italic" }} {...props} />
            ),
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
    let damage = 5;
    let precision = 0;
    let isMartial = weaponData.martial || false;
    let damageType = weaponData.type || "physical";

    weaponData.customizations?.forEach((customization) => {
      switch (customization.name) {
        case "weapon_customization_accurate":
          precision += 2;
          break;
        case "weapon_customization_powerful":
          if (weaponData.category === "weapon_category_heavy") {
            damage += 7;
          } else {
            damage += 5;
          }
          isMartial = true;
          break;
        case "weapon_customization_elemental":
          damage += 2;
          break;
        case "weapon_customization_magicdefenseboost":
        case "weapon_customization_quick":
          isMartial = true;
          break;

        case "weapon_customization_transforming":
          totalCost += 100;
          break;
      }
    });

    // Apply standard format overrides
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
      qualities: weaponData.quality, // Use actual quality data
      martial: isMartial,
      // Include defensive modifiers for display
      defModifier: parseInt(weaponData.defModifier || 0),
      mDefModifier: parseInt(weaponData.mDefModifier || 0),
    };
  };

  const stats = getWeaponStats();
  const effectiveShowImage =
    showImageOverride !== undefined ? showImageOverride : showImage;

  return (
    <ThemeProvider theme={theme}>
      <Card>
        <div ref={ref} style={{ cardBackground }}>
          <Stack>
            <Grid
              container
              sx={{
                alignItems: "center",
                py: 1,
                background: `${theme.primary}`,
                color: "#ffffff",
                "& .MuiTypography-root": {
                  fontSize: "1.2rem",
                  textTransform: "uppercase",
                },
              }}
            >
              <Grid
                sx={{
                  flex: "0 0 80px",
                  minWidth: "80px",
                  minHeight: "40px",
                }}
              />
              <Grid container sx={{ flex: 1, pl: 1 }}>
                <Grid size={3}>
                  <Typography
                    variant="h4"
                    sx={{
                      textAlign: "left",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {t("Weapon")}
                  </Typography>
                </Grid>
                <Grid size={1}>
                  <Typography
                    variant="h4"
                    sx={{
                      textAlign: "center",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {t("Cost")}
                  </Typography>
                </Grid>
                <Grid size={3}>
                  <Typography
                    variant="h4"
                    sx={{
                      textAlign: "center",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {t("Accuracy")}
                  </Typography>
                </Grid>
                <Grid size={4}>
                  <Typography
                    variant="h4"
                    sx={{
                      textAlign: "center",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {t("Damage")}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            {/* Data Rows Container */}
            <Grid
              container
              sx={{
                borderBottom: `1px solid ${theme.secondary}`,
              }}
            >
              {/* Image Column - spans both rows */}
              <Grid
                sx={{
                  flex: "0 0 80px",
                  width: "80px",
                  background: imageBackground,
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                }}
              >
                {effectiveShowImage && <EditableImage size={80} />}
              </Grid>
              {/* Content Column - contains both rows */}
              <Grid container direction="column" sx={{ flex: 1, minWidth: 0 }}>
                {/* First Data Row */}
                <Grid
                  container
                  sx={{
                    background,
                    borderBottom: `1px solid ${theme.secondary}`,
                    p: 0,
                    pl: 1,
                    alignItems: "center",
                    minHeight: "40px",
                    "& .MuiTypography-root": {
                      fontSize: { xs: "0.7rem", sm: "1.0rem" },
                    },
                  }}
                >
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={3}
                  >
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        marginRight: "4px",
                        lineHeight: 1,
                        fontSize: { xs: "0.9rem", sm: "1.15rem" },
                      }}
                    >
                      {weaponData.name || "Custom Weapon"}
                    </Typography>
                    {stats.martial && <Martial />}
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={1}
                  >
                    <Typography
                      sx={{
                        textAlign: "center",
                        width: "100%",
                        lineHeight: 1,
                        margin: 0,
                      }}
                    >{`${stats.cost}z`}</Typography>
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={3}
                  >
                    <Typography
                      sx={{
                        textAlign: "center",
                        width: "100%",
                        fontWeight: "bold",
                      }}
                    >
                      <OpenBracket />
                      {`${attrNoTranslation[weaponData.accuracyCheck?.att1]?.shortcaps || "DEX"} + ${attrNoTranslation[weaponData.accuracyCheck?.att2]?.shortcaps || "MIG"}`}
                      <CloseBracket />
                      {stats.precision !== 0 ? `+${stats.precision}` : ""}
                    </Typography>
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={4}
                  >
                    <Typography
                      sx={{
                        textAlign: "center",
                        width: "100%",
                        fontWeight: "bold",
                      }}
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
                  sx={{
                    background: "transparent",
                    p: 0,
                    pl: 1,
                    minHeight: "40px",
                    alignItems: "center",
                    "& .MuiTypography-root": {
                      fontSize: { xs: "0.7rem", sm: "1.0rem" },
                    },
                  }}
                >
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={3}
                  >
                    <Typography
                      sx={{ fontWeight: "bold", lineHeight: 1, margin: 0 }}
                    >
                      {t(weaponData.category)}
                    </Typography>
                  </Grid>
                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 0,
                    }}
                    size={1}
                  >
                    <Diamond color={theme.primary} />
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={3}
                  >
                    <Typography
                      sx={{
                        textAlign: "center",
                        width: "100%",
                        lineHeight: 1,
                        margin: 0,
                      }}
                    >
                      {t("Two-handed")}
                    </Typography>
                  </Grid>
                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 0,
                    }}
                    size={1}
                  >
                    <Diamond color={theme.primary} />
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "center", p: 0 }}
                    size={4}
                  >
                    <Typography
                      sx={{
                        textAlign: "center",
                        width: "100%",
                        lineHeight: 1,
                        margin: 0,
                      }}
                    >
                      {t(weaponData.range)}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            {/* Customizations and Qualities Row */}
            <Grid
              container
              sx={{
                background: "transparent",
                borderBottom: `1px solid ${theme.secondary}`,
                minHeight: "40px",
                alignItems: "center",
              }}
            >
              <Grid
                sx={{
                  flex: "0 0 80px",
                  width: "80px",
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                }}
              />
              <Grid
                sx={{ textAlign: "left", color: "inherit", p: "5px" }}
                size={12}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {(() => {
                    const allItems = [];

                    // Add customizations
                    if (
                      weaponData.customizations &&
                      weaponData.customizations.length > 0
                    ) {
                      weaponData.customizations.forEach((custom, index) => {
                        allItems.push(
                          <Typography key={`custom-${index}`} component="span">
                            {t(custom.name)}
                          </Typography>,
                        );
                        allItems.push(
                          <Diamond
                            key={`diamond-custom-${index}`}
                            color={theme.primary}
                          />,
                        );
                      });
                    } else {
                      allItems.push(
                        <Typography key="no-custom" component="span">
                          {t("No Customizations")}
                        </Typography>,
                      );
                      allItems.push(
                        <Diamond
                          key="diamond-no-custom"
                          color={theme.primary}
                        />,
                      );
                    }

                    // Add qualities
                    allItems.push(
                      <Typography key="qualities" component="span">
                        {!stats.qualities ? (
                          t("No Description")
                        ) : (
                          <StyledMarkdown
                            components={{
                              strong: ({ _node, ...props }) => (
                                <strong
                                  style={{ fontWeight: "bold" }}
                                  {...props}
                                />
                              ),
                              em: ({ _node, ...props }) => (
                                <em
                                  style={{ fontStyle: "italic" }}
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {stats.qualities}
                          </StyledMarkdown>
                        )}
                      </Typography>,
                    );

                    return allItems;
                  })()}
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </div>
      </Card>
      {showActions && (
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
            <AddToCompendiumButton itemType="custom-weapon" data={weaponData} />
          </div>
          <FormControlLabel
            control={
              <Checkbox
                checked={showImage}
                onChange={(e) => setShowImage(e.target.checked)}
              />
            }
            label={t("Add Image")}
          />
        </div>
      )}
      {downloadSnackbar}
    </ThemeProvider>
  );
}

export default PrettyCustomWeapon;
