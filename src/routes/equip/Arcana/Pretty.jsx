import { useRef, useState } from "react";
import {
  Card,
  Grid,
  Stack,
  Typography,
  ThemeProvider,
  Tooltip,
  IconButton,
  darken,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import EditableImage from "../../../components/EditableImage";
import useDownloadImage from "../../../hooks/useDownloadImage";
import Export from "../../../components/Export";
import AddToCompendiumButton from "../../../components/compendium/AddToCompendiumButton";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function Pretty({ custom, rework }) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PrettySingle arcana={custom} showActions rework={rework} />
      </div>
    </ThemeProvider>
  );
}

function PrettySingle({ arcana, showActions, rework }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [showImage, setShowImage] = useState(false);

  const background = theme.mode === 'dark'
  ? `linear-gradient(90deg, ${theme.ternary}, rgba(24, 26, 27, 0) 100%)` // Dark mode gradient with black end
  : `linear-gradient(90deg, ${theme.ternary} 0%, #ffffff 100%)`; // Light mode gradient

  const imageBackground = theme.mode === "dark" ? "#181a1b" : "white";

  const cardBackground = theme.mode === 'dark'
  ? `backgroundColor: "#181a1b", background: "#181a1b"`
  : `backgroundColor: "white", background: "white"`

  const ref = useRef();
  const [downloadImage] = useDownloadImage(arcana.name, ref);

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
            <Grid container>
              <Grid
                sx={{
                  flex: "0 0 128px",
                  minWidth: "128px",
                  minHeight: "128px",
                  background: imageBackground,
                }}>
                {showImage && <EditableImage size={128} />}
              </Grid>

              <Grid container direction="column"  size="grow">
                <Grid
                  container
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                    pl: 1,
                    py: 1,
                    background: `${theme.primary}`,
                    color: "#ffffff",
                    "& .MuiTypography-root": {
                      textTransform: "uppercase",
                    },
                  }}
                >
                  <Grid  size="grow">
                    <Typography variant="h4" sx={{ textAlign: "left", fontSize: "1.5rem", fontWeight: 700 }}>
                      {arcana.name || t("No Name")}
                    </Typography>
                  </Grid>
                </Grid>

                {/* First Row */}
                <Grid
                  container
                  sx={{
                    justifyContent: "space-between",
                    background,
                    p: "5px"
                  }}>
                  <Grid  size={12}>
                    <Typography>
                      {!arcana.description ? t("No Description") : (
                        <div style={{ display: 'inline' }}>
                          <ReactMarkdown allowedElements={["strong", "em"]} unwrapDisallowed={true} style={{ display: 'inline' }}>
                            {arcana.description}
                          </ReactMarkdown>
                        </div>
                      )}
                    </Typography>
                  </Grid>
                </Grid>
                {/* Second Row */}
                <Grid
                  container
                  sx={{
                    background: "transparent",
                    p: "5px",
                    alignItems: "center",
                  }}
                >
                  <Grid size={12}>
                    <Typography sx={{ lineHeight: 1.2 }}>
                      <strong>{t("Domains:")}</strong>{" "}
                      {!arcana.domain ? t("No Domain") : (
                        <ReactMarkdown allowedElements={["strong", "em"]} unwrapDisallowed={true} style={{ display: 'inline' }}>
                          {arcana.domain}
                        </ReactMarkdown>
                      )}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid container>
              {/* Merge Benefit */}
              <Grid
                container
                size={12}
                sx={{
                  borderTop: `1px solid ${theme.primary}`,
                }}>
                {/* Merge Label and Name Row */}
                <Grid  sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                }}>
                  <Grid  sx={{
                    textAlign: 'center',
                    backgroundImage: `linear-gradient(to right, ${theme.primary}, ${darken(theme.secondary, 0.3)})`,
                    px: 2,
                    py: 0.5,
                    color: `${theme.white}`,
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: 'fit-content',
                  }}>
                    <Typography sx={{ fontWeight: "bold", margin: 0, fontSize: "0.75rem", color: "inherit" }}>
                      {t("MERGE")}
                    </Typography>
                  </Grid>

                  {/* Arcana Merge Name */}
                  <Grid  sx={{
                    background,
                    px: 2,
                    py: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    minHeight: '28px',
                  }}>
                    {arcana.mergeName && (
                      <Typography sx={{ fontWeight: "bold", fontSize: "0.95rem" }}>
                        {arcana.mergeName}
                      </Typography>
                    )}
                  </Grid>
                </Grid>

                {/* Merge Benefit - Full Width */}
                <Grid  sx={{
                  p: "5px",
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <Typography>
                    {!arcana.mergeBenefit ? t("No Merge Benefit") : (
                      <div style={{ display: 'inline' }}>
                        <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed={true} style={{ display: 'inline' }}>
                          {arcana.mergeBenefit}
                        </StyledMarkdown>
                      </div>
                    )}
                  </Typography>
                </Grid>
              </Grid>

              {rework && (
                <>
                  {/* Pulse Benefit */}
                  <Grid
                    container
                    size={12}
                    sx={{
                      borderTop: `1px solid ${theme.primary}`,
                    }}>
                    {/* Pulse Label and Name Row */}
                    <Grid  sx={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                    }}>
                      <Grid  sx={{
                        textAlign: 'center',
                        backgroundImage: `linear-gradient(to right, ${theme.primary}, ${darken(theme.secondary, 0.3)})`,
                        padding: "8px 16px",
                        color: `${theme.white}`,
                        display: 'flex',
                        alignItems: 'center',
                        minWidth: 'fit-content',
                      }}>
                        <Typography sx={{ fontWeight: "bold", margin: 0, fontSize: "0.75rem", color: "inherit" }}>
                          {t("PULSE")}
                        </Typography>
                      </Grid>

                      {/* Arcana Pulse Name */}
                      <Grid  sx={{
                        background,
                        px: 2,
                        py: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1,
                        minHeight: '28px',
                      }}>
                        {arcana.pulseName && (
                          <Typography sx={{ fontWeight: "bold", fontSize: "0.95rem" }}>
                            {arcana.pulseName}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>

                    {/* Pulse Benefit - Full Width */}
                    <Grid  sx={{
                      p: "5px",
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                      <Typography>
                        {!arcana.pulseBenefit ? t("No Pulse Benefit") : (
                          <div style={{ display: 'inline' }}>
                            <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed={true} style={{ display: 'inline' }}>
                              {arcana.pulseBenefit}
                            </StyledMarkdown>
                          </div>
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </>
              )}

              {/* Dismiss Benefit */}
              <Grid
                container
                size={12}
                sx={{
                  borderTop: `1px solid ${theme.primary}`,
                }}>
                {/* Dismiss Label and Name Row */}
                <Grid  sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                }}>
                  <Grid  sx={{
                    textAlign: 'center',
                    backgroundImage: `linear-gradient(to right, ${theme.primary}, ${darken(theme.secondary, 0.3)})`,
                    px: 2,
                    py: 0.5,
                    color: `${theme.white}`,
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: 'fit-content',
                  }}>
                    <Typography sx={{ fontWeight: "bold", margin: 0, fontSize: "0.75rem", color: "inherit" }}>
                      {t("DISMISS")}
                    </Typography>
                  </Grid>

                  {/* Dismiss Name */}
                  <Grid  sx={{
                    background,
                    px: 2,
                    py: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    minHeight: '28px',
                  }}>
                    {arcana.dismissName && (
                      <Typography sx={{ fontWeight: "bold", fontSize: "0.95rem" }}>
                        {arcana.dismissName}
                      </Typography>
                    )}
                  </Grid>
                </Grid>

                {/* Dismiss Benefit - Full Width */}
                <Grid  sx={{
                  p: "5px",
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <Typography>
                    {!arcana.dismissBenefit ? t("No Dismiss Benefit") : (
                      <div style={{ display: 'inline' }}>
                        <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed={true} style={{ display: 'inline' }}>
                          {arcana.dismissBenefit}
                        </StyledMarkdown>
                      </div>
                    )}
                  </Typography>
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
            <Export name={`${arcana.name}`} dataType="arcana" data={arcana} />
            <AddToCompendiumButton itemType="player-spell" data={arcana} />
          </div>
          <FormControlLabel
            control={<Checkbox checked={showImage} onChange={(e) => setShowImage(e.target.checked)} />}
            label={t("Add Image")}
          />
        </div>
      )}
    </>
  );
}

export default Pretty;
