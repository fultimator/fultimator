import { useRef, useState } from "react";
import {
  Card,
  Grid,
  Stack,
  Typography,
  ThemeProvider,
  Tooltip,
  IconButton,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Martial } from "../../../components/icons";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import { Download } from "@mui/icons-material";
import EditableImage from "../../../components/EditableImage";
import useDownloadImage from "../../../hooks/useDownloadImage";
import Export from "../../../components/Export";
import AddToCompendiumButton from "../../../components/compendium/AddToCompendiumButton";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function Pretty({ base, custom }) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PrettySingle armor={base} />
        <Typography
          variant="h4"
          sx={{ textAlign: "center", fontSize: "1rem", fontWeight: 600 }}
        >
          <ArrowDownward />
        </Typography>
        <PrettySingle armor={custom} showActions />
      </div>
    </ThemeProvider>
  );
}

function PrettySingle({ armor, showActions }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [showImage, setShowImage] = useState(false);
  const background =
    theme.mode === "dark"
      ? `linear-gradient(90deg, ${theme.ternary}, rgba(24, 26, 27, 0) 100%)` // Dark mode gradient with black end
      : `linear-gradient(90deg, ${theme.ternary} 0%, #ffffff 100%)`; // Light mode gradient

  const imageBackground = theme.mode === "dark" ? "#181a1b" : "white";

  const cardBackground =
    theme.mode === "dark"
      ? `backgroundColor: "#181a1b", background: "#181a1b"`
      : `backgroundColor: "white", background: "white"`;

  const ref = useRef();
  const [downloadImage] = useDownloadImage(armor.name, ref);

  const StyledMarkdown = styled(ReactMarkdown)({
    whiteSpace: "pre-line",
  });

  return (
    <>
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
                  flex: "0 0 70px",
                  minWidth: "70px",
                  minHeight: "40px",
                }}
              />
              <Grid sx={{ flex: 1, pl: 1 }} container>
                <Grid size={3}>
                  <Typography
                    variant="h4"
                    sx={{
                      textAlign: "left",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {armor.category}
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
                <Grid size={2}>
                  <Typography
                    variant="h4"
                    sx={{
                      textAlign: "center",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {t("Defense")}
                  </Typography>
                </Grid>
                <Grid size={2}>
                  <Typography
                    variant="h4"
                    sx={{
                      textAlign: "center",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {t("M. Defense")}
                  </Typography>
                </Grid>
                {!armor.rework && (
                  <Grid size={2}>
                    <Typography
                      variant="h4"
                      sx={{
                        textAlign: "center",
                        fontSize: "1rem",
                        fontWeight: 600,
                      }}
                    >
                      {t("Initiative")}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
            {/* All Rows Container */}
            <Grid
              container
              sx={{
                borderBottom: `1px solid ${theme.secondary}`,
              }}
            >
              {/* Image Column - spans all rows */}
              <Grid
                sx={{
                  flex: "0 0 70px",
                  width: "70px",
                  background: imageBackground,
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                }}
              >
                {showImage && <EditableImage size={70} />}
              </Grid>
              {/* Content Column - contains all rows */}
              <Grid container direction="column" sx={{ flex: 1, minWidth: 0 }}>
                {/* First Data Row */}
                <Grid
                  container
                  sx={{
                    background,
                    borderBottom: `1px solid ${theme.secondary}`,
                    alignItems: "center",
                    minHeight: "40px",
                    pl: 1,
                  }}
                >
                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "2px",
                    }}
                    size={3}
                  >
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        marginRight: "4px",
                        lineHeight: 1,
                        margin: 0,
                      }}
                    >
                      {armor.name || t("No Name")}
                    </Typography>
                    {armor.martial && <Martial />}
                  </Grid>
                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "2px",
                    }}
                    size={1}
                  >
                    <Typography
                      sx={{
                        textAlign: "center",
                        width: "100%",
                        fontWeight: "bold",
                        lineHeight: 1,
                        margin: 0,
                      }}
                    >{`${armor.cost}z`}</Typography>
                  </Grid>
                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "2px",
                    }}
                    size={2}
                  >
                    <Typography
                      sx={{
                        textAlign: "center",
                        width: "100%",
                        fontWeight: "bold",
                        lineHeight: 1,
                        margin: 0,
                      }}
                    >
                      {armor.category === t("Shield") ? "+" + armor.def : ""}
                      {armor.category === t("Armor") && armor.martial
                        ? armor.def
                        : ""}
                      {armor.category === t("Armor") && !armor.martial
                        ? armor.def === 0
                          ? t("DEX die")
                          : t("DEX die") + "+" + armor.def
                        : ""}
                    </Typography>
                  </Grid>
                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "2px",
                    }}
                    size={2}
                  >
                    <Typography
                      sx={{
                        textAlign: "center",
                        width: "100%",
                        fontWeight: "bold",
                        lineHeight: 1,
                        margin: 0,
                      }}
                    >
                      {armor.category === t("Shield") ? "+" + armor.mdef : ""}
                      {armor.category === t("Armor")
                        ? armor.mdef === 0
                          ? t("INS die")
                          : t("INS die") + "+" + armor.mdef
                        : ""}
                    </Typography>
                  </Grid>
                  {!armor.rework && (
                    <Grid
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        padding: "2px",
                      }}
                      size={2}
                    >
                      <Typography
                        sx={{
                          textAlign: "center",
                          width: "100%",
                          fontWeight: "bold",
                          lineHeight: 1,
                          margin: 0,
                        }}
                      >
                        {armor.category === t("Armor") ||
                        armor.category === t("Shield")
                          ? armor.init === 0
                            ? "-"
                            : armor.init
                          : ""}
                      </Typography>
                    </Grid>
                  )}
                </Grid>

                {/* Quality Row */}
                <Grid
                  container
                  sx={{
                    background: "transparent",
                    pl: 1,
                    minHeight: "40px",
                    alignItems: "center",
                  }}
                >
                  <Grid sx={{ p: "5px", textAlign: "left" }} size={12}>
                    <Typography sx={{ lineHeight: 1, margin: 0 }}>
                      {!armor.quality ? (
                        t("No Description")
                      ) : (
                        <StyledMarkdown
                          allowedElements={["strong", "em"]}
                          unwrapDisallowed={true}
                        >
                          {armor.quality}
                        </StyledMarkdown>
                      )}
                    </Typography>
                  </Grid>
                </Grid>
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
            <Export name={`${armor.name}`} dataType="armor" data={armor} />
            <AddToCompendiumButton
              itemType={armor.category === t("Shield") ? "shield" : "armor"}
              data={armor}
            />
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
    </>
  );
}

export default Pretty;
