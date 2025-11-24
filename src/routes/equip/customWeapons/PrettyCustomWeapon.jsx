import { useRef } from "react";
import {
  Card,
  Grid,
  Stack,
  Typography,
  ThemeProvider,
  Tooltip,
  IconButton,
  Box
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
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function PrettyCustomWeapon({ weaponData, showActions = true }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const background =
    theme.mode === "dark"
      ? `linear-gradient(90deg, ${theme.ternary}, rgba(24, 26, 27, 0) 100%)`
      : `linear-gradient(90deg, ${theme.ternary} 0%, #ffffff 100%)`;

  const background2 = theme.mode === "dark" ? `black` : `white`;

  const cardBackground =
    theme.mode === "dark"
      ? `backgroundColor: "#181a1b", background: "#181a1b"`
      : `backgroundColor: "white", background: "white"`;

  const ref = useRef();
  const [downloadImage, downloadSnackbar] = useDownloadImage(
    weaponData.name || "Custom Weapon",
    ref
  );

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
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 1,
                background: `${theme.primary}`,
                color: "#ffffff",
                "& .MuiTypography-root": {
                  fontSize: "1.2rem",
                  textTransform: "uppercase",
                },
              }}
            >
              <Grid item xs={1}></Grid>
              <Grid item xs={3}>
                <Typography variant="h4" textAlign="left">
                  {t("Weapon")}
                </Typography>
              </Grid>
              <Grid item xs={1}>
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
              <Grid
                item
                sx={{
                  flex: "0 0 70px",
                  minWidth: "70px",
                  minHeight: "70px",
                  background2,
                }}
              >
                <EditableImage size={70} />
              </Grid>

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
                        wordBreak: "break-word"
                      }}
                    >
                      {weaponData.name || "Custom Weapon"}
                    </Typography>
                    {stats.martial && <Martial />}
                  </Grid>
                  <Grid item xs={1}>
                    <Typography textAlign="center">{`${stats.cost}z`}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography fontWeight="bold" textAlign="center">
                      <OpenBracket />
                      {`${attrNoTranslation[weaponData.accuracyCheck?.att1]?.shortcaps || "DEX"} + ${attrNoTranslation[weaponData.accuracyCheck?.att2]?.shortcaps || "MIG"
                        }`}
                      <CloseBracket />
                      {stats.precision !== 0 ? `+${stats.precision}` : ""}
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography fontWeight="bold" textAlign="center">
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
                    <Typography fontWeight="bold">
                      {t(weaponData.category)}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Diamond color={theme.primary} />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography textAlign="center">
                      {t("Two-handed")}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Diamond color={theme.primary} />
                  </Grid>
                  <Grid item xs={3}>
                    <Typography textAlign="center">
                      {t(weaponData.range)}
                    </Typography>
                  </Grid>
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
                  {(() => {
                    const allItems = [];

                    // Add customizations
                    if (weaponData.customizations && weaponData.customizations.length > 0) {
                      weaponData.customizations.forEach((custom, index) => {
                        allItems.push(
                          <Typography key={`custom-${index}`} component="span">
                            {t(custom.name)}
                          </Typography>
                        );
                        allItems.push(<Diamond key={`diamond-custom-${index}`} color={theme.primary} />);
                      });
                    } else {
                      allItems.push(
                        <Typography key="no-custom" component="span">
                          {t("No Customizations")}
                        </Typography>
                      );
                      allItems.push(<Diamond key="diamond-no-custom" color={theme.primary} />);
                    }

                    // Add qualities
                    allItems.push(
                      <Typography key="qualities" component="span">
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
                </Box>
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

export default PrettyCustomWeapon;